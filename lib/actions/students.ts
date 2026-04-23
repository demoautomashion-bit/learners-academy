'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Student, Question, ActionResult } from '@/lib/types'
import { handleDatabaseError } from '../utils/error-handler'

import { isStudentInCourse } from '../utils/student-matching'

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
    // 1. Identify all active courses for logical candidates
    const allCourses = await db.course.findMany({ where: { status: 'active' } })
    
    // 2. Match courses using the universal heuristic matching logic.
    // This allows us to bridge differences between 'beginner' vs 'Beginners'
    // or slightly different timing strings.
    const matchingCourses = allCourses.filter(c => isStudentInCourse(student, c))

    const matchingCourseIds = matchingCourses.map(c => c.id)

    if (matchingCourseIds.length === 0) {
      console.warn(`[REGISTRY_ALERT] No direct batches found for student ${student.name} at level ${student.grade}. Identity created but enrollment is pending manual assignment.`)
    }

    // Data Sanitization Layer
    // 1. Convert empty placeholders to null to satisfy unique constraints
    const { id: clientSideId, classTiming: ct, grade: g, enrolledCourses: ec, enrolledAt: ea, ...formData } = student
    
    const sanitizedStudent = {
      ...formData,
      email: student.email?.trim() === "" ? null : student.email,
      phone: student.phone?.trim() === "" ? null : student.phone,
      grade: student.grade,
      classTiming: student.classTiming,
      progress: 0,
      enrolledCourses: matchingCourseIds,
      enrolledAt: student.enrolledAt ? new Date(student.enrolledAt) : new Date()
    }

    // 2. Create the student with unified identity
    const result = await db.student.create({ 
      data: sanitizedStudent
    })

    // 3. Initialize Financial Ledger (FeePayment records)
    if (matchingCourses.length > 0) {
      for (const course of matchingCourses) {
        await db.feePayment.create({
          data: {
            studentId: result.id,
            courseId: course.id,
            totalAmount: course.feeAmount || 0,
            amountPaid: 0,
            status: 'Unpaid'
          }
        })
      }
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Database connection failed') }
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
    // Deep Purge: Remove all institutional ties in a single transaction
    await db.$transaction([
      db.feePayment.deleteMany({ where: { studentId: id } }),
      db.submission.deleteMany({ where: { studentId: id } }),
      db.evaluation.deleteMany({ where: { studentId: id } }),
      db.student.delete({ where: { id } })
    ])

    revalidatePath('/')
    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: handleDatabaseError(error, 'Failed to remove student registry') }
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
