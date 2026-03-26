'use server'

import db from '@/lib/db'
import type { Student } from '@/lib/types'

export async function getStudents() {
  try {
    return await db.student.findMany({ orderBy: { enrolledAt: 'desc' } })
  } catch (error) {
    console.error('DATABASE_ERROR [getStudents]:', error)
    throw new Error('Database connection failed. Please check server logs.')
  }
}

export async function enrollStudent(student: Omit<Student, 'progress'>) {
  return db.student.create({ 
    data: { 
      ...student, 
      progress: 0,
      enrolledAt: student.enrolledAt ? new Date(student.enrolledAt) : new Date()
    } as any 
  })
}

export async function removeStudent(id: string) {
  return db.student.delete({ where: { id } })
}

export async function updateStudentStatus(id: string, status: string) {
  return db.student.update({ where: { id }, data: { status } })
}
