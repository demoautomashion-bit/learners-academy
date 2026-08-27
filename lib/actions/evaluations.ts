'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '../types'

/**
 * Academic Evaluation Server Actions
 * 
 * Handles persistence for term-level assessments, including midterm,
 * finals, and curricular activity marks.
 */

export async function getEvaluations(courseId: string): Promise<ActionResult> {
  try {
    const data = await db.evaluation.findMany({
      where: { courseId },
      include: { student: true }
    })
    return { success: true, data }
  } catch (error) {
    console.error("GET_EVALUATIONS_ERROR:", error)
    return { success: false, error: "Failed to fetch evaluation registry" }
  }
}

export async function saveEvaluations(courseId: string, evaluations: any[]): Promise<ActionResult> {
  try {
    // 1. Resolve canonical student IDs for all evaluation payload entries
    const resolvedItems: Array<{ canonicalStudentId: string; evalData: any }> = []

    for (const evalData of evaluations) {
      const rawId = evalData.studentId
      if (!rawId) continue

      const student = await db.student.findFirst({
        where: {
          OR: [
            { id: rawId },
            { studentId: rawId }
          ]
        }
      })

      if (student) {
        resolvedItems.push({ canonicalStudentId: student.id, evalData })
      }
    }

    // 2. Deduplicate payload items by canonicalStudentId and term
    const uniqueMap = new Map<string, any>()
    for (const item of resolvedItems) {
      const term = item.evalData.term || "Term 1"
      const key = `${item.canonicalStudentId}_${courseId}_${term}`
      uniqueMap.set(key, item)
    }

    // 3. Execute unique upserts cleanly
    const results = await Promise.all(Array.from(uniqueMap.values()).map(async ({ canonicalStudentId, evalData }) => {
      const { midterm, final, attendance, participation, discipline, extra, scores, term } = evalData

      return db.evaluation.upsert({
        where: {
          studentId_courseId_term: {
            studentId: canonicalStudentId,
            courseId,
            term: term || "Term 1"
          }
        },
        update: {
          midterm: Number(midterm) || 0,
          final: Number(final) || 0,
          attendance: Number(attendance) || 0,
          participation: Number(participation) || 0,
          discipline: Number(discipline) || 0,
          extra: Number(extra) || 0,
          scores: scores || null
        },
        create: {
          studentId: canonicalStudentId,
          courseId,
          term: term || "Term 1",
          midterm: Number(midterm) || 0,
          final: Number(final) || 0,
          attendance: Number(attendance) || 0,
          participation: Number(participation) || 0,
          discipline: Number(discipline) || 0,
          extra: Number(extra) || 0,
          scores: scores || null
        }
      })
    }))

    revalidatePath('/')
    return { success: true, data: { count: results.length } }
  } catch (error) {
    console.error("SAVE_EVALUATIONS_ERROR:", error)
    return { success: false, error: "Critical failure during evaluation persistence" }
  }
}
