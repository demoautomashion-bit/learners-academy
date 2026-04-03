'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { AssessmentTemplate, Question } from '@/lib/types'

// Assessments
export async function publishAssessmentAction(assessment: AssessmentTemplate) {
  try {
    const newAssessment = await db.assessmentTemplate.create({
      data: {
        id: assessment.id,
        title: assessment.title,
        phase: assessment.phase,
        classLevels: assessment.classLevels,
        nature: assessment.nature,
        totalMarks: assessment.totalMarks,
        markAllocation: assessment.markAllocation as any,
        durationMinutes: assessment.durationMinutes,
        createdAt: new Date(assessment.createdAt),
        status: assessment.status,
        accessCode: assessment.accessCode,
        submittedByTeacherId: assessment.submittedByTeacherId,
        submittedByTeacherName: assessment.submittedByTeacherName,
      }
    })
    revalidatePath('/teacher/assessments')
    return { success: true, data: newAssessment }
  } catch (error) {
    console.error('Failed to publish assessment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function removeAssessmentAction(id: string) {
  try {
    await db.assessmentTemplate.delete({
      where: { id }
    })
    revalidatePath('/teacher/assessments')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove assessment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Submissions & Grading
export async function gradeSubmissionAction(id: string, grade: number, feedback: string) {
  try {
    await db.submission.update({
      where: { id },
      data: {
        grade,
        feedback,
        status: 'graded'
      }
    })
    revalidatePath('/teacher/results')
    return { success: true }
  } catch (error) {
    console.error('Failed to grade submission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function toggleAssessmentStatusAction(id: string, status: 'active' | 'archived' | 'draft') {
  try {
    const updated = await db.assessmentTemplate.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/teacher/assessments')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to toggle assessment status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Library / Questions
export async function addQuestionAction(question: Question) {
  try {
    const newQuestion = await db.question.create({
      data: {
        id: question.id,
        category: question.category,
        type: question.type,
        content: question.content,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        phase: question.phase
      }
    })
    revalidatePath('/teacher/library')
    return { success: true, data: newQuestion }
  } catch (error) {
    console.error('Failed to add question:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function deleteQuestionAction(id: string) {
  try {
    await db.question.delete({
      where: { id }
    })
    revalidatePath('/teacher/library')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete question:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}
