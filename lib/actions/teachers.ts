'use server'

import db from '@/lib/db'
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
  return db.teacher.create({ 
    data: { 
      ...teacher, 
      joinedAt: teacher.joinedAt ? new Date(teacher.joinedAt) : new Date() 
    } as any 
  })
}

export async function removeTeacher(id: string) {
  return db.teacher.delete({ where: { id } })
}

export async function updateTeacherStatus(id: string, status: string) {
  return db.teacher.update({ where: { id }, data: { status } })
}
