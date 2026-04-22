'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSeedFromId, createPRNG, shuffleArray } from '@/lib/utils/random'
import type { AssessmentTemplate, Question, ActionResult } from '@/lib/types'

export async function getAssessments(): Promise<ActionResult<AssessmentTemplate[]>> {
  try {
    const data = await db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })
    return { success: true, data }
  } catch (error: any) {
    if (error?.code === 'P2022') {
      console.warn('SCHEMA_DRIFT_DETECTED: [AssessmentTemplate] missing columns in production. Run prisma migrate deploy.')
      return { success: true, data: [] }
    }
    console.error('DATABASE_ERROR [getAssessments]:', error)
    return { success: false, error: 'Failed to fetch assessment registry' }
  }
}

export async function publishAssessment(assessment: Omit<AssessmentTemplate, 'id' | 'createdAt'>): Promise<ActionResult<AssessmentTemplate>> {
  try {
    // Check for uniqueness if an access code is provided
    if (assessment.accessCode) {
      const existing = await db.assessmentTemplate.findFirst({
        where: { 
          accessCode: assessment.accessCode,
          status: 'active'
        }
      })
      if (existing) {
        return { success: false, error: `Token "${assessment.accessCode}" is already in use by another active assessment.` }
      }
    }

    const accessCode = assessment.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase()
    const result = await db.assessmentTemplate.create({ 
      data: { 
        id: `test-${Date.now()}`,
        title: assessment.title,
        phase: assessment.phase,
        classLevels: assessment.classLevels,
        courseIds: assessment.courseIds || [], // Task 1: ID-based linking
        nature: assessment.nature,
        totalMarks: assessment.totalMarks,
        markAllocation: assessment.markAllocation as any,
        durationMinutes: assessment.durationMinutes,
        questionCount: assessment.questionCount || 0,
        status: assessment.status || 'active',
        accessCode: accessCode,
        submittedByTeacherId: assessment.submittedByTeacherId,
        submittedByTeacherName: assessment.submittedByTeacherName,
        isAdaptive: assessment.isAdaptive || false,
        evaluationCategory: (assessment as any).evaluationCategory || 'None',
        createdAt: new Date()
      } 
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [publishAssessment]:', error)
    return { success: false, error: 'Registry entry failed' }
  }
}

export async function updateAssessmentReviewAction(id: string, status: AssessmentTemplate['status'], feedback?: string): Promise<ActionResult<AssessmentTemplate>> {
  try {
    const result = await db.assessmentTemplate.update({
      where: { id },
      data: { 
        status,
        adminFeedback: feedback 
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateAssessmentReviewAction]:', error)
    return { success: false, error: 'Review action failed' }
  }
}

export async function updateAssessmentStatus(id: string, status: AssessmentTemplate['status']): Promise<ActionResult<AssessmentTemplate>> {
  try {
    if (status === 'active') {
      const assessment = await db.assessmentTemplate.findUnique({ where: { id } })
      if (assessment?.accessCode) {
        const existing = await db.assessmentTemplate.findFirst({
          where: { 
            accessCode: assessment.accessCode,
            status: 'active',
            id: { not: id }
          }
        })
        if (existing) {
          return { success: false, error: `Token "${assessment.accessCode}" is already in use.` }
        }
      }
    }

    const result = await db.assessmentTemplate.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateAssessmentStatus]:', error)
    return { success: false, error: 'Status update failed' }
  }
}

export async function removeAssessment(id: string): Promise<ActionResult> {
  try {
    const result = await db.assessmentTemplate.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [removeAssessment]:', error)
    return { success: false, error: 'Deletion failed' }
  }
}

export async function validateAccessToken(token: string, studentId: string, className: string) {
  try {
    // Task 1: Robust linking logic
    const assessment = await db.assessmentTemplate.findFirst({
      where: { 
        accessCode: token,
        status: 'active' 
      }
    })
    
    if (!assessment) {
      return { 
        success: false, 
        error: 'Invalid or Inactive Token. Please wait for your instructor to open the assessment.' 
      }
    }

    const student = await db.student.findFirst({
      where: { 
        studentId: studentId,
        status: 'active'
      }
    })

    if (!student) {
      return {
        success: false,
        error: `Academic ID "${studentId}" not found in institutional records.`
      }
    }

    // Task 1: Verify enrollment via ID or legacy Name matching
    const isEnrolled = (assessment.courseIds && assessment.courseIds.length > 0)
      ? assessment.courseIds.some(cid => student.enrolledCourses.includes(cid))
      : assessment.classLevels.includes(className) // Fallback

    if (!isEnrolled) {
      return {
        success: false,
        error: `Dossier Error: Student profile "${studentId}" is not authorized for this specific academic block.`
      }
    }

    // Task 2: Block Retakes
    const existingSubmission = await db.submission.findFirst({
      where: {
        studentId: student.id,
        assignmentId: assessment.id
      }
    })

    if (existingSubmission) {
      return {
        success: false,
        error: "Institutional Audit: Duplicate response detected. You have already submitted your exam for this block. Entry prohibited."
      }
    }

    return { 
      success: true, 
      data: { assessment, student }
    }
  } catch (error) {
    console.error('Failed to validate access token:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function generateRandomizedQuestions(studentId: string, assessmentId: string) {
  try {
    if (!studentId || studentId === 'undefined' || studentId === 'null') {
      throw new Error('Identity Verification Failed: Question sequence cannot be generated without a valid institutional record.')
    }

    const assessment = await db.assessmentTemplate.findUnique({
      where: { id: assessmentId }
    })
    
    if (!assessment) throw new Error('Assessment registry entry not found')

    const pool = await db.question.findMany({
      where: {
        isApproved: true,
        OR: [
          { phase: assessment.phase },
          { phase: 'Both' }
        ],
        ...(assessment.nature !== 'Mixed' ? { type: assessment.nature } : {})
      }
    })

    if (pool.length === 0) throw new Error('No approved institutional blocks found for this assessment criteria')

    const rawSeed = `${studentId}::${assessmentId}`
    const seed = getSeedFromId(rawSeed)
    const prng = createPRNG(seed)

    const shuffled = shuffleArray(pool as unknown as Question[], prng)

    if (assessment.isAdaptive) {
      // Group by difficulty
      const pools = {
        Easy: shuffled.filter(q => q.difficulty === 'Easy'),
        Medium: shuffled.filter(q => q.difficulty === 'Medium'),
        Hard: shuffled.filter(q => q.difficulty === 'Hard'),
      }
      return { success: true, pools, isAdaptive: true, questions: [] } // `questions: []` keeps type compatibility
    }

    const selected = shuffled.slice(0, assessment.questionCount || 10)

    return {
      success: true,
      questions: selected,
      isAdaptive: false
    }
  } catch (error) {
    console.error('GENERATE_RANDOMIZED_QUESTIONS_ERROR:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registry synthesis failed' 
    }
  }
}
