'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Course, ActionResult } from '@/lib/types'
import { handleDatabaseError } from '../utils/error-handler'

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
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Course creation failed') }
  }
}

export async function removeCourse(id: string): Promise<ActionResult> {
  try {
    const result = await db.course.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [removeCourse]:', error)
    return { success: false, error: 'Database record deletion failed' }
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
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateCourse]:', error)
    return { success: false, error: 'Failed to modify course parameters' }
  }
}
