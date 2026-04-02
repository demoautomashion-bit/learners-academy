'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Teacher } from '@/lib/types'

export async function getTeachers() {
  try {
    return await db.teacher.findMany({ orderBy: { joinedAt: 'desc' } })
  } catch (error) {
    console.error('DATABASE_ERROR [getTeachers]:', error)
    throw new Error('Database connection failed. Please check server logs.')
  }
}

export async function addTeacher(teacher: Omit<Teacher, 'coursesCount' | 'studentsCount'>) {
    const newTeacher = await db.teacher.create({
      data: {
        ...teacher,
        joinedAt: teacher.joinedAt ? new Date(teacher.joinedAt) : new Date()
      } as any
    })
    revalidatePath('/')
    return newTeacher
}

export async function removeTeacher(id: string) {
    const result = await db.teacher.delete({ where: { id } })
    revalidatePath('/')
    return result
}

export async function updateTeacherStatus(id: string, status: string) {
    const result = await db.teacher.update({ where: { id }, data: { status } })
    revalidatePath('/')
    return result
}

export async function updateTeacherReviewFlag(id: string, flag: boolean) {
  const result = await db.teacher.update({ 
    where: { id }, 
    data: { requiresReview: flag } 
  })
  revalidatePath('/')
  return result
}

export async function updateTeacher(id: string, data: Partial<Teacher>) {
  const result = await db.teacher.update({ 
    where: { id }, 
    data: data as any 
  })
  revalidatePath('/')
  return result
}
