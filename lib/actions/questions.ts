'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Question, ActionResult } from '@/lib/types'

export async function getQuestions(teacherId?: string): Promise<ActionResult<Question[]>> {
  try {
    const data = await db.question.findMany({ 
      where: teacherId ? { teacherId } : {},
      orderBy: { id: 'desc' } 
    })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getQuestions]:', error)
    return { success: false, error: 'Failed to access pedagogical block library' }
  }
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<ActionResult<Question>> {
  try {
    const result = await db.question.create({
      data: {
        category: question.category,
        type: question.type,
        content: question.content,
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        imageUrl: question.imageUrl,
        phase: question.phase,
        passageText: question.passageText,
        audioUrl: question.audioUrl,
        matchPairs: question.matchPairs as any,
        isApproved: question.isApproved ?? false,
        teacherId: question.teacherId,
        difficulty: question.difficulty || "Medium",
        classLevel: question.classLevel
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [addQuestion]:', error)
    return { success: false, error: 'Pedagogical block synthesis failed' }
  }
}

export async function deleteQuestion(id: string, teacherId?: string): Promise<ActionResult> {
  try {
    // Security Audit: Verify ownership before purge
    if (teacherId) {
      const existing = await db.question.findUnique({ where: { id } })
      if (existing && existing.teacherId && existing.teacherId !== teacherId) {
        return { success: false, error: 'Authorization Failure: You do not own this pedagogical block.' }
      }
    }
    const result = await db.question.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [deleteQuestion]:', error)
    return { success: false, error: 'Purge operation failed' }
  }
}

export async function updateQuestion(id: string, data: Partial<Question>, teacherId?: string): Promise<ActionResult<Question>> {
  try {
    // Security Audit: Verify ownership before modification
    if (teacherId) {
      const existing = await db.question.findUnique({ where: { id } })
      if (existing && existing.teacherId && existing.teacherId !== teacherId) {
        return { success: false, error: 'Authorization Failure: This block is locked for your identity.' }
      }
    }
    const result = await db.question.update({ 
      where: { id }, 
      data: {
        ...data,
        matchPairs: data.matchPairs as any
      } as any 
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateQuestion]:', error)
    return { success: false, error: 'Block modification failed' }
  }
}

export async function toggleQuestionApproval(id: string, isApproved: boolean): Promise<ActionResult<Question>> {
  try {
    const result = await db.question.update({
      where: { id },
      data: { isApproved }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [toggleQuestionApproval]:', error)
    return { success: false, error: 'Institutional approval toggle failed' }
  }
}

export async function approveAllExistingQuestions(): Promise<ActionResult> {
  try {
    const result = await db.question.updateMany({
      data: { isApproved: true }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [approveAllExistingQuestions]:', error)
    return { success: false, error: 'Failed to approve block library' }
  }
}
