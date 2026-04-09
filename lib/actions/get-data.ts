'use server'

import db from '@/lib/db'
import { ActionResult } from '../types'

/**
 * Institutional Data Synchronization Engine
 * Fetches core registry data with error isolation and role-based filtering.
 * 
 * TODO: Implement pagination markers for >1000 records
 */
export async function getInitialData(userId?: string, role?: 'admin' | 'teacher'): Promise<ActionResult> {
  const fetchEntity = async (name: string, query: any) => {
    try {
      return await query
    } catch (error) {
      console.error(`FAILED_TO_FETCH_${name.toUpperCase()}:`, error)
      return [] // Fallback to empty array for non-critical data
    }
  }

  try {
    // Audit: Role-based filtering for performance
    const studentFilter = role === 'teacher' && userId 
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
      // FUTURE: Add .take(100) for pagination
      fetchEntity('teachers', db.teacher.findMany({ orderBy: { joinedAt: 'desc' } })),
      fetchEntity('students', db.student.findMany({ where: studentFilter, orderBy: { enrolledAt: 'desc' } })),
      fetchEntity('courses', db.course.findMany({ orderBy: { startDate: 'desc' } })),
      fetchEntity('submissions', db.submission.findMany({ orderBy: { submittedAt: 'desc' } })),
      fetchEntity('schedules', db.schedule.findMany({ orderBy: { classTitle: 'asc' } })),
      fetchEntity('questions', db.question.findMany({ orderBy: { category: 'asc' } })),
      fetchEntity('assessments', db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })),
      fetchEntity('assignments', db.assignment.findMany({ orderBy: { createdAt: 'desc' } }))
    ])

    // Derive enrollments from students' enrolledCourses
    const enrollments = (students || []).flatMap(s => 
      (s.enrolledCourses || []).map(courseId => ({
        id: `${s.id}-${courseId}`,
        studentId: s.id,
        studentName: s.name,
        courseId,
        progress: s.progress || 0,
        grade: s.grade || 'N/A'
      }))
    )

    return {
      success: true,
      data: {
        teachers: teachers || [],
        students: students || [],
        courses: courses || [],
        submissions: submissions || [],
        schedules: schedules || [],
        questions: questions || [],
        assessments: assessments || [],
        assignments: assignments || [], 
        enrollments: enrollments || [], 
      }
    }
  } catch (error) {
    console.error('FATAL_INITIALIZATION_ERROR:', error)
    return { success: false, error: 'Core engine failed to initialize' }
  }
}
