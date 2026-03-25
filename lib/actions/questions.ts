'use server'

import db from '@/lib/db'
import type { Question } from '@/lib/types'

export async function getQuestions() {
  return db.question.findMany({ orderBy: { id: 'desc' } })
}

export async function addQuestion(question: Omit<Question, 'id'>) {
  return db.question.create({ data: question as any })
}

export async function deleteQuestion(id: string) {
  return db.question.delete({ where: { id } })
}

export async function updateQuestion(id: string, data: Partial<Question>) {
  return db.question.update({ where: { id }, data: data as any })
}
