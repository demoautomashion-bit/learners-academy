'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Course, ActionResult } from '@/lib/types'
import { handleDatabaseError } from '../utils/error-handler'
import { isStudentInCourse } from '../utils/student-matching'

export async function getCourses(): Promise<ActionResult<Course[]>> {
  try {
    const data = await db.course.findMany({ orderBy: { startDate: 'desc' } })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Failed to fetch academic catalog') }
  }
}

export async function addCourse(course: Omit<Course, 'enrolled'>): Promise<ActionResult<Course>> {
  try {
    const result = await db.course.create({ 
      data: { 
        ...course, 
        enrolled: 0,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate)
      } as any 
    })

    // Auto-sync existing matching students to this newly created course
    const students = await db.student.findMany()
    const matchingStudents = students.filter(s => isStudentInCourse(s, result))
    
    for (const student of matchingStudents) {
      if (!student.enrolledCourses.includes(result.id)) {
        await db.student.update({
          where: { id: student.id },
          data: {
            enrolledCourses: {
              push: result.id
            }
          }
        })
      }
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Course creation failed') }
  }
}

export async function removeCourse(id: string): Promise<ActionResult> {
  try {
    // Deep Purge: Clear all academic and financial ties to this class
    await db.$transaction([
      db.evaluation.deleteMany({ where: { courseId: id } }),
      db.feePayment.deleteMany({ where: { courseId: id } }),
      db.assignment.deleteMany({ where: { courseId: id } }),
      db.course.delete({ where: { id } })
    ])

    revalidatePath('/')
    return { success: true, data: { id } }
  } catch (error: any) {
    console.error('DATABASE_ERROR [removeCourse]:', error)
    return { success: false, error: handleDatabaseError(error, 'Database record deletion failed') }
  }
}

export async function updateCourseStatus(id: string, status: string): Promise<ActionResult<Course>> {
  try {
    const result = await db.course.update({ where: { id }, data: { status } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateCourseStatus]:', error)
    return { success: false, error: 'Failed to shift course status' }
  }
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<ActionResult<Course>> {
  try {
    const result = await db.course.update({
      where: { id },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) })
      } as any
    })

    // If level or timing changed, re-sync matching students
    if (data.level !== undefined || data.timing !== undefined || data.title !== undefined) {
      const students = await db.student.findMany()
      const matchingStudents = students.filter(s => isStudentInCourse(s, result))

      for (const student of matchingStudents) {
        if (!student.enrolledCourses.includes(result.id)) {
          await db.student.update({
            where: { id: student.id },
            data: {
              enrolledCourses: {
                push: result.id
              }
            }
          })
        }
      }
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateCourse]:', error)
    return { success: false, error: 'Failed to modify course parameters' }
  }
}

export async function deleteAllCourses(levelFilter?: string, timingFilter?: string): Promise<ActionResult> {
  try {
    const whereClause: any = {}
    if (levelFilter && levelFilter !== 'all') {
      whereClause.level = levelFilter
    }
    if (timingFilter && timingFilter !== 'all') {
      whereClause.timing = timingFilter
    }

    const coursesToDelete = await db.course.findMany({ where: whereClause })
    const courseIds = coursesToDelete.map(c => c.id)

    if (courseIds.length > 0) {
      await db.$transaction([
        db.evaluation.deleteMany({ where: { courseId: { in: courseIds } } }),
        db.feePayment.deleteMany({ where: { courseId: { in: courseIds } } }),
        db.assignment.deleteMany({ where: { courseId: { in: courseIds } } }),
        db.course.deleteMany({ where: { id: { in: courseIds } } })
      ])
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Failed to clear class registry') }
  }
}
