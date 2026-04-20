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
    // Process bulk upsert
    // In a production environment, we'd use a transaction or bulk operation
    // For this prototype, we iterate through the evaluation objects
    
    const results = await Promise.all(evaluations.map(async (evalData) => {
      const { studentId, midterm, final, attendance, participation, discipline, extra, term } = evalData
      
      return db.evaluation.upsert({
        where: {
          studentId_courseId_term: {
            studentId,
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
          extra: Number(extra) || 0
        },
        create: {
          studentId,
          courseId,
          term: term || "Term 1",
          midterm: Number(midterm) || 0,
          final: Number(final) || 0,
          attendance: Number(attendance) || 0,
          participation: Number(participation) || 0,
          discipline: Number(discipline) || 0,
          extra: Number(extra) || 0
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
