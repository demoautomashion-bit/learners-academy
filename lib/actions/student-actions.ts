'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { StudentTest } from '@/lib/types'

export async function submitTestResultAction(result: StudentTest) {
  try {
    const template = await db.assessmentTemplate.findUnique({
      where: { id: result.templateId }
    })
    
    const newSubmission = await db.submission.create({
      data: {
        id: `sub-${Date.now()}`,
        assignmentId: result.templateId,
        assignmentTitle: template?.title || 'Test',
        studentId: result.studentId,
        studentName: result.studentName,
        submittedAt: new Date(),
        status: 'pending',
        grade: result.score,
        randomizedQuestions: result.randomizedQuestions as any,
        answers: result.answers as any,
        aiFeedback: result.feedback,
        aiJustification: "AI evaluation complete. Reviewing content-aware score."
      }
    })

    revalidatePath('/student/assessments')
    revalidatePath('/teacher/results')
    
    return { success: true, data: newSubmission }
  } catch (error) {
    console.error('Failed to submit test result:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function validateAccessTokenAction(token: string) {
  try {
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

    return { success: true, data: assessment }
  } catch (error) {
    console.error('Failed to validate access token:', error)
    return { success: false, error: 'Database error' }
  }
}
