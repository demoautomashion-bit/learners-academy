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
        passageTitle: question.passageTitle,
        speakingTitle: question.speakingTitle,
        prepTimeSeconds: question.prepTimeSeconds,
        speakingTimeSeconds: question.speakingTimeSeconds,
        subQuestions: question.subQuestions as any,
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

export async function bulkAddQuestions(questions: Omit<Question, 'id'>[]): Promise<ActionResult<{ count: number }>> {
  try {
    const records = questions.map(q => {
      let optionsArray: string[] = []
      if (Array.isArray(q.options)) {
        optionsArray = q.options.map(s => String(s).trim())
      } else if (typeof q.options === 'string') {
        try {
          const parsed = JSON.parse(q.options)
          if (Array.isArray(parsed)) optionsArray = parsed.map(s => String(s).trim())
          else optionsArray = String(q.options).split(',').map(s => s.trim())
        } catch {
          optionsArray = String(q.options).split(',').map(s => s.trim())
        }
      }

      return {
        category: q.category,
        type: q.type,
        content: q.content,
        options: optionsArray,
        correctAnswer: q.correctAnswer || '',
        imageUrl: q.imageUrl || null,
        phase: q.phase,
        passageText: q.passageText || null,
        passageTitle: q.passageTitle || null,
        speakingTitle: q.speakingTitle || null,
        prepTimeSeconds: q.prepTimeSeconds || null,
        speakingTimeSeconds: q.speakingTimeSeconds || null,
        subQuestions: q.subQuestions ? (q.subQuestions as any) : undefined,
        audioUrl: q.audioUrl || null,
        matchPairs: q.matchPairs ? (q.matchPairs as any) : undefined,
        isApproved: q.isApproved ?? false,
        teacherId: q.teacherId || null,
        difficulty: q.difficulty || "Medium",
        classLevel: q.classLevel || null
      }
    })

    const result = await db.question.createMany({
      data: records
    })

    revalidatePath('/')
    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('DATABASE_ERROR [bulkAddQuestions]:', error)
    return { success: false, error: 'Bulk question import failed' }
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
        subQuestions: data.subQuestions as any,
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

export async function deleteQuestionsByPhase(
  teacherId: string,
  phase: 'First Test' | 'Last Test' | 'Both',
  classLevel?: string
): Promise<ActionResult> {
  try {
    if (!teacherId) {
      return { success: false, error: 'Authorization failure: No teacher identity provided.' }
    }

    const whereClause: any =
      phase === 'Both'
        ? { teacherId }
        : { teacherId, phase }

    if (classLevel) {
      whereClause.classLevel = classLevel
    }

    const result = await db.question.deleteMany({ where: whereClause })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [deleteQuestionsByPhase]:', error)
    return { success: false, error: 'Bulk purge operation failed' }
  }
}
