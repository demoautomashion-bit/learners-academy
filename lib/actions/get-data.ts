'use server'

import db from '@/lib/db'
import { ActionResult } from '../types'
import { RegistrySchema } from '../validations'

/**
 * Institutional Data Synchronization Engine
 * Hardened with Zod validation to ensure zero-crash rendering.
 */
export async function getInitialData(userId?: string, role?: 'admin' | 'teacher'): Promise<ActionResult> {
  const fetchEntity = async (name: string, query: any) => {
    try {
      return await query
    } catch (error) {
      console.error(`FAILED_TO_FETCH_${name.toUpperCase()}:`, error)
      return [] // Fallback to empty array for non-critical data isolation
    }
  }

  try {
    const isTeacher = role === 'teacher' && userId
    const studentFilter = isTeacher
      ? { enrolledCourses: { hasSome: await db.course.findMany({ where: { teacherId: userId }, select: { id: true } }).then(courses => courses.map(c => c.id)) } }
      : {}

    const [
      teachers,
      students,
      courses,
      submissions,
      schedules,
      questions,
      assessments,
      assignments
    ] = await Promise.all([
      fetchEntity('teachers', db.teacher.findMany({ orderBy: { joinedAt: 'desc' } })),
      fetchEntity('students', db.student.findMany({ where: studentFilter, orderBy: { enrolledAt: 'desc' } })),
      fetchEntity('courses', db.course.findMany({ 
        orderBy: { startDate: 'desc' } 
      })),
      fetchEntity('submissions', db.submission.findMany({ orderBy: { submittedAt: 'desc' } })),
      fetchEntity('schedules', db.schedule.findMany({ orderBy: { classTitle: 'asc' } })),
      fetchEntity('questions', db.question.findMany({ orderBy: { category: 'asc' } })),
      fetchEntity('assessments', db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })),
      fetchEntity('assignments', db.assignment.findMany({ orderBy: { createdAt: 'desc' } }))
    ])

    // Data Transformation: Ensure numeric fields are populated correctly
    const sanitizedCourses = (courses || []).map((c: any) => ({
      ...c,
      enrolled: Number(c.enrolled) || 0
    }))

    // VALIDATION FIREWALL: Catch malformed records before they reach the UI
    const validation = RegistrySchema.safeParse({
      teachers,
      students,
      courses: sanitizedCourses,
      submissions,
      schedules,
      questions,
      assessments,
      assignments
    })

    if (!validation.success) {
      console.error('REGISTRY_VALIDATION_FAILED:', validation.error.format())
    }

    // Capture validated data or fallback to raw if critical failures occur
    const validData = validation.success ? validation.data : {
      teachers: (teachers || []).map((t: any) => ({ 
        ...t, 
        name: t?.name || 'Teacher',
        joinedAt: t?.joinedAt || new Date().toISOString()
      })),
      students: (students || []).map((s: any) => ({ 
        ...s, 
        name: s?.name || 'Student',
        progress: s?.progress || 0,
        enrolledCourses: Array.isArray(s?.enrolledCourses) ? s.enrolledCourses : [],
        enrolledAt: s?.enrolledAt || new Date().toISOString()
      })),
      courses: sanitizedCourses || [],
      submissions: (submissions || []).map((sub: any) => ({
        ...sub,
        studentName: sub?.studentName || 'Student',
        submittedAt: sub?.submittedAt || new Date().toISOString()
      })),
      schedules: schedules || [],
      questions: questions || [],
      assessments: assessments || [],
      assignments: assignments || [],
    }

    // Derive enrollments from students' enrolledCourses (Logic layer)
    const enrollments = (validData.students || []).flatMap((s: any) => {
      const courses = Array.isArray(s?.enrolledCourses) ? s.enrolledCourses : []
      return courses.map((courseId: string) => ({
        id: `${s.id}-${courseId}`,
        studentId: s.id,
        studentName: s.name,
        courseId,
        progress: s.progress || 0,
        grade: s.grade || 'N/A'
      }))
    })

    return {
      success: true,
      data: {
        ...validData,
        enrollments,
      }
    }
  } catch (error) {
    console.error('FATAL_INITIALIZATION_ERROR:', error)
    return { success: false, error: 'Core engine failed to initialize institutional records' }
  }
}
