'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Teacher, ActionResult } from '@/lib/types'
import { handleDatabaseError } from '../utils/error-handler'

export async function getTeachers(): Promise<ActionResult<Teacher[]>> {
  try {
    const data = await db.teacher.findMany({ orderBy: { joinedAt: 'desc' } })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getTeachers]:', error)
    return { success: false, error: 'Database connection failed' }
  }
}

export async function addTeacher(teacher: Omit<Teacher, 'coursesCount' | 'studentsCount'>): Promise<ActionResult<Teacher>> {
  try {
    const { password, ...cleanTeacher } = teacher as any
    const newTeacher = await db.teacher.create({
      data: {
        ...cleanTeacher,
        employeePassword: teacher.employeePassword || password, // Support both potential keys
        joinedAt: teacher.joinedAt ? new Date(teacher.joinedAt) : new Date()
      } as any
    })
    revalidatePath('/')
    return { success: true, data: newTeacher }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Failed to add teacher to registry') }
  }
}

export async function removeTeacher(id: string): Promise<ActionResult> {
  try {
    const result = await db.teacher.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Failed to remove teacher record') }
  }
}

export async function updateTeacherStatus(id: string, status: string): Promise<ActionResult<Teacher>> {
  try {
    const result = await db.teacher.update({ where: { id }, data: { status } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateTeacherStatus]:', error)
    return { success: false, error: 'Failed to update teacher status' }
  }
}

export async function updateTeacherReviewFlag(id: string, flag: boolean): Promise<ActionResult<Teacher>> {
  try {
    const result = await db.teacher.update({ 
      where: { id }, 
      data: { requiresReview: flag } 
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateTeacherReviewFlag]:', error)
    return { success: false, error: 'Failed to update review status' }
  }
}

export async function updateTeacher(id: string, data: Partial<Teacher>): Promise<ActionResult<Teacher>> {
  try {
    const result = await db.teacher.update({ 
      where: { id }, 
      data: data as any 
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateTeacher]:', error)
    return { success: false, error: 'Failed to update institutional record' }
  }
}
