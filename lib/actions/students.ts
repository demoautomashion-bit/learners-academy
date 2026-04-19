'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Student, Question, ActionResult } from '@/lib/types'

export async function getStudents(): Promise<ActionResult<Student[]>> {
  try {
    const data = await db.student.findMany({ orderBy: { enrolledAt: 'desc' } })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getStudents]:', error)
    return { success: false, error: 'Database connection failed' }
  }
}

export async function enrollStudent(student: any): Promise<ActionResult<Student>> {
  try {
    const result = await db.student.create({ 
      data: { 
        ...student, 
        progress: 0,
        enrolledAt: student.enrolledAt ? new Date(student.enrolledAt) : new Date()
      }
    })

    // Automated Institutional Enrollment
    // Find courses that match the student's Academic Tier (grade) and Session Slot (classTiming)
    const matchingCourses = await db.course.findMany({
      where: {
        level: student.grade,
        timing: student.classTiming,
        status: 'active'
      }
    })

    if (matchingCourses.length > 0) {
      for (const course of matchingCourses) {
        // Create Enrollment record
        await db.enrollment.create({
          data: {
            studentId: result.id,
            courseId: course.id,
            enrolledAt: new Date(),
            status: 'active',
            progress: 0
          }
        })

        // Create FeePayment record
        await db.feePayment.create({
          data: {
            studentId: result.id,
            courseId: course.id,
            totalAmount: course.feeAmount || 0,
            status: 'Unpaid'
          }
        })
      }
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [enrollStudent]:', error)
    return { success: false, error: 'Failed to enroll student' }
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const result = await db.question.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('FAILED_TO_DELETE_QUESTION:', error)
    return { success: false, error: 'Failed to purge block from library' }
  }
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<ActionResult<Question>> {
  try {
    const result = await db.question.update({ where: { id }, data: data as any })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('FAILED_TO_UPDATE_QUESTION:', error)
    return { success: false, error: 'Curriculum update failed' }
  }
}

export async function removeStudent(id: string): Promise<ActionResult> {
  try {
    const result = await db.student.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [removeStudent]:', error)
    return { success: false, error: 'Failed to remove student registry' }
  }
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<ActionResult<Question>> {
  try {
    const result = await db.question.create({
      data: {
        category: question.category,
        type: question.type,
        content: question.content,
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        imageUrl: question.imageUrl,
        phase: question.phase,
        passageText: question.passageText,
        audioUrl: question.audioUrl,
        matchPairs: question.matchPairs as any,
        isApproved: question.isApproved ?? false
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('FAILED_TO_ADD_QUESTION:', error)
    return { success: false, error: 'Database operation failed' }
  }
}

export async function updateStudentStatus(id: string, status: string): Promise<ActionResult<Student>> {
  try {
    const result = await db.student.update({ where: { id }, data: { status } })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateStudentStatus]:', error)
    return { success: false, error: 'Failed to update student status' }
  }
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<ActionResult<Student>> {
  try {
    const result = await db.student.update({
      where: { id },
      data: {
        ...data,
        enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : undefined,
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateStudent]:', error)
    return { success: false, error: 'Failed to update student profile' }
  }
}

export async function updateStudentSuccessMetrics(id: string, progress: number, teacherId: string, grade?: string): Promise<ActionResult<Student>> {
  try {
    // Audit check: Verify if the student is actually in at least one of this teacher's courses
    const teacherCourses = await db.course.findMany({
      where: { teacherId },
      select: { id: true }
    })
    const courseIds = teacherCourses.map(c => c.id)

    const student = await db.student.findUnique({
      where: { id },
      select: { enrolledCourses: true }
    })

    const isAuthorized = student?.enrolledCourses.some(cId => courseIds.includes(cId))
    
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Student is not enrolled in your registry' }
    }

    const result = await db.student.update({
      where: { id },
      data: { progress, grade }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateStudentSuccessMetrics]:', error)
    return { success: false, error: 'Failed to synchronize institutional metrics' }
  }
}
