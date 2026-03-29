'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Student } from '@/lib/types'

export async function getStudents() {
  try {
    return await db.student.findMany({ orderBy: { enrolledAt: 'desc' } })
  } catch (error) {
    console.error('DATABASE_ERROR [getStudents]:', error)
    throw new Error('Database connection failed. Please check server logs.')
  }
}

export async function enrollStudent(student: any) {
  try {
    const result = await db.student.create({ 
      data: { 
        ...student, 
        progress: 0,
        enrolledAt: student.enrolledAt ? new Date(student.enrolledAt) : new Date()
      }
    })

    // Create FeePayment records for enrollment
    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      for (const courseId of student.enrolledCourses) {
        const course = await db.course.findUnique({ where: { id: courseId } })
        if (course) {
          await db.feePayment.create({
            data: {
              studentId: result.id,
              courseId: courseId,
              totalAmount: course.feeAmount || 0,
              status: 'Unpaid'
            }
          })
        }
      }
    }

    revalidatePath('/')
    return result
  } catch (error) {
    console.error('DATABASE_ERROR [enrollStudent]:', error)
    throw new Error('Failed to enroll student')
  }
}

export async function removeStudent(id: string) {
  const result = await db.student.delete({ where: { id } })
  revalidatePath('/')
  return result
}

export async function updateStudentStatus(id: string, status: string) {
  const result = await db.student.update({ where: { id }, data: { status } })
  revalidatePath('/')
  return result
}

export async function updateStudent(id: string, data: Partial<Student>) {
  try {
    const result = await db.student.update({
      where: { id },
      data: {
        ...data,
        enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : undefined,
      }
    })
    revalidatePath('/')
    return result
  } catch (error) {
    console.error('DATABASE_ERROR [updateStudent]:', error)
    throw new Error('Failed to update student')
  }
}

export async function updateStudentSuccessMetrics(id: string, progress: number, grade?: string) {
  try {
    const result = await db.student.update({
      where: { id },
      data: { progress, grade }
    })
    revalidatePath('/')
    return result
  } catch (error) {
    console.error('DATABASE_ERROR [updateStudentSuccessMetrics]:', error)
    throw new Error('Failed to update student metrics')
  }
}
