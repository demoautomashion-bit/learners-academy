'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { AssessmentTemplate } from '@/lib/types'

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
