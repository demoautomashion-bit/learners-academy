'use server'

import db from '@/lib/db'
import type { Submission, StudentTest } from '@/lib/types'

export async function getSubmissions() {
  return db.submission.findMany({ orderBy: { submittedAt: 'desc' } })
}

export async function submitTestResult(result: StudentTest, assignmentTitle: string) {
  return db.submission.create({
    data: {
      assignmentId: result.templateId,
      assignmentTitle,
      studentId: result.studentId,
      studentName: result.studentName,
      status: 'pending',
      grade: result.score,
      randomizedQuestions: result.randomizedQuestions as any,
      answers: result.answers as any,
      aiFeedback: result.feedback,
      aiJustification: 'AI evaluation complete.',
    }
  })
}

export async function gradeSubmission(id: string, grade: number, feedback: string) {
  return db.submission.update({
    where: { id },
    data: { grade, feedback, status: 'graded' }
  })
}
