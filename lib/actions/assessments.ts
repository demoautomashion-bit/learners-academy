'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSeedFromId, createPRNG, shuffleArray } from '@/lib/utils/random'
import type { AssessmentTemplate, Question } from '@/lib/types'

export async function getAssessments() {
  return db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function publishAssessment(assessment: Omit<AssessmentTemplate, 'id' | 'createdAt'>) {
  // Check for uniqueness if an access code is provided
  if (assessment.accessCode) {
    const existing = await db.assessmentTemplate.findFirst({
      where: { 
        accessCode: assessment.accessCode,
        status: 'active'
      }
    })
    if (existing) {
      throw new Error(`Token "${assessment.accessCode}" is already in use by another active assessment. Please choose a different one.`)
    }
  }

  const accessCode = assessment.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase()
  const result = await db.assessmentTemplate.create({ 
    data: { 
      id: `test-${Date.now()}`,
      title: assessment.title,
      phase: assessment.phase,
      classLevels: assessment.classLevels,
      nature: assessment.nature,
      totalMarks: assessment.totalMarks,
      markAllocation: assessment.markAllocation as any,
      durationMinutes: assessment.durationMinutes,
      questionCount: assessment.questionCount || 0,
      status: assessment.status || 'active',
      accessCode: accessCode,
      submittedByTeacherId: assessment.submittedByTeacherId,
      submittedByTeacherName: assessment.submittedByTeacherName,
      createdAt: new Date()
    } 
  })
  revalidatePath('/')
  return result
}

export async function updateAssessmentReviewAction(id: string, status: AssessmentTemplate['status'], feedback?: string) {
  const result = await db.assessmentTemplate.update({
    where: { id },
    data: { 
      status,
      adminFeedback: feedback 
    }
  })
  revalidatePath('/')
  return result
}

export async function updateAssessmentStatus(id: string, status: AssessmentTemplate['status']) {
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
        throw new Error(`Token "${assessment.accessCode}" is already in use by another active assessment. Please archive it first.`)
      }
    }
  }

  const result = await db.assessmentTemplate.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/')
  return result
}

export async function removeAssessment(id: string) {
  const result = await db.assessmentTemplate.delete({ where: { id } })
  revalidatePath('/')
  return result
}

export async function validateAccessToken(token: string, studentId: string, className: string) {
  try {
    const assessment = await db.assessmentTemplate.findFirst({
      where: { 
        accessCode: token,
        classLevels: { has: className },
        status: 'active' 
      }
    })
    
    if (!assessment) {
      return { 
        success: false, 
        error: 'Invalid or Inactive Token for this class. Please wait for your instructor to open the assessment.' 
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

    return { 
      success: true, 
      data: { assessment, student }
    }
  } catch (error) {
    console.error('Failed to validate access token:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

/**
 * PRODUCTION-GRADE DETERMINISTIC RANDOMIZATION (Step 6 of Audit Fix)
 * Moves logic to server to ensure cross-device consistency and prevent tampering.
 */
export async function generateRandomizedQuestions(studentId: string, assessmentId: string) {
  try {
    // 1. Fetch Template
    const assessment = await db.assessmentTemplate.findUnique({
      where: { id: assessmentId }
    })
    
    if (!assessment) throw new Error('Assessment registry entry not found')

    // 2. Fetch Question Pool
    const pool = await db.question.findMany({
      where: {
        isApproved: true,
        OR: [
          { phase: assessment.phase },
          { phase: 'Both' }
        ],
        // If nature is Mixed we take all, otherwise filter by type
        ...(assessment.nature !== 'Mixed' ? { type: assessment.nature } : {})
      }
    })

    if (pool.length === 0) throw new Error('No approved institutional blocks found for this assessment criteria')

    // 3. Stable Seed Construction (Step 3 of Audit Fix)
    const rawSeed = `${studentId}::${assessmentId}`
    const seed = getSeedFromId(rawSeed)
    const prng = createPRNG(seed)

    // 4. Robust Shuffle (Step 2 of Audit Fix)
    const shuffled = shuffleArray(pool as unknown as Question[], prng)

    // 5. Select target count
    const selected = shuffled.slice(0, assessment.questionCount || 10)

    // Debug Logging (Temporary - Step 7)
    console.log(`[Assessment Engine] Seeded Shuffle - Student:${studentId} Test:${assessmentId}`)
    console.log(`[Assessment Engine] Seed: ${seed} | Hash: ${rawSeed}`)
    console.log(`[Assessment Engine] Sequence (First 3): ${selected.slice(0,3).map(q => q.id).join(', ')}`)

    return {
      success: true,
      questions: selected
    }
  } catch (error) {
    console.error('GENERATE_RANDOMIZED_QUESTIONS_ERROR:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registry synthesis failed' 
    }
  }
}
