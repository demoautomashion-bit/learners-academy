'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { isStudentInCourse } from '../utils/student-matching'
import type { ActionResult } from '../types'

/**
 * Roster Formalization Engine
 * 
 * Synchronizes the 'Logical Affinity' with 'Formal Enrollment'.
 * Converts heuristic matches into immutable database relationships.
 */
export async function formalizeRoster(courseId: string): Promise<ActionResult> {
  try {
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return { success: false, error: "Academic block not identified" }
    }

    // Fetch all students to identify logical candidates
    const students = await db.student.findMany()
    
    // Identify candidates who are matched by logic but missing formal linkage
    const candidates = students.filter(student => {
      // Cast to any to avoid strict type mismatches with Prisma's raw return and our interface
      const isMatched = isStudentInCourse(student as any, course as any)
      const isAlreadyFormal = (student.enrolledCourses || []).includes(courseId)
      return isMatched && !isAlreadyFormal
    })

    if (candidates.length === 0) {
      return { success: true, data: { count: 0, message: "Roster already perfectly synchronized" } }
    }

    // Apply bulk identity bridging
    await Promise.all(candidates.map(student => 
      db.student.update({
        where: { id: student.id },
        data: {
          enrolledCourses: {
            push: courseId
          }
        }
      })
    ))

    revalidatePath('/')
    return { 
      success: true, 
      data: { 
        count: candidates.length, 
        message: `Successfully formalized ${candidates.length} student connections.` 
      } 
    }
  } catch (error) {
    console.error("ROSTER_FORMALIZATION_FAILURE:", error)
    return { success: false, error: "Institutional registry sync failed" }
  }
}
