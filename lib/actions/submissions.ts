'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Submission, StudentTest, ActionResult } from '@/lib/types'

export async function getSubmissions(): Promise<ActionResult<Submission[]>> {
  try {
    const data = await db.submission.findMany({ orderBy: { submittedAt: 'desc' } })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getSubmissions]:', error)
    return { success: false, error: 'Failed to access submission registry' }
  }
}

export async function submitTestResult(result: StudentTest, assignmentTitle: string): Promise<ActionResult<Submission>> {
  try {
    const res = await db.submission.create({
      data: {
        assignmentId: result.templateId,
        assignmentTitle,
        studentId: result.studentId,
        studentName: result.studentName,
        status: 'graded',
        grade: result.score,
        randomizedQuestions: result.randomizedQuestions as any,
        answers: result.answers as any,
        aiFeedback: result.feedback,
        aiJustification: 'AI evaluation complete.',
      }
    })
    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [submitTestResult]:', error)
    return { success: false, error: 'Failed to commit test results to database' }
  }
}

export async function gradeSubmission(id: string, grade: number, feedback: string): Promise<ActionResult<Submission>> {
  try {
    const res = await db.submission.update({
      where: { id },
      data: { grade, feedback, status: 'graded' }
    })
    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [gradeSubmission]:', error)
    return { success: false, error: 'Failed to record institutional score' }
  }
}
