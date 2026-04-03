'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Question } from '@/lib/types'

export async function getQuestions() {
  return db.question.findMany({ orderBy: { id: 'desc' } })
}

export async function addQuestion(question: Omit<Question, 'id'>) {
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
      isApproved: question.isApproved ?? false
    }
  })
  revalidatePath('/')
  return result
}

export async function deleteQuestion(id: string) {
  const result = await db.question.delete({ where: { id } })
  revalidatePath('/')
  return result
}

export async function updateQuestion(id: string, data: Partial<Question>) {
  const result = await db.question.update({ where: { id }, data: data as any })
  revalidatePath('/')
  return result
}

export async function toggleQuestionApproval(id: string, isApproved: boolean) {
  const result = await db.question.update({
    where: { id },
    data: { isApproved }
  })
  revalidatePath('/')
  return result
}

export async function approveAllExistingQuestions() {
  const result = await db.question.updateMany({
    data: { isApproved: true }
  })
  revalidatePath('/')
  return result
}
