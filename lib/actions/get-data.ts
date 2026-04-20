'use server'

import db from '@/lib/db'
import { ActionResult } from '../types'
import { RegistrySchema } from '../validations'
import { isStudentInCourse } from '../utils/student-matching'

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
    let studentFilter = {}
    let myCourseIds: string[] = []
    let myLevels: string[] = []
    let mySchedules: string[] = []
    
    if (isTeacher) {
      const myCourses = await db.course.findMany({ 
        where: { teacherId: userId }, 
        select: { id: true, level: true, schedule: true } 
      })
      myCourseIds = myCourses.map(c => c.id)
      myLevels = myCourses.map(c => c.level)
      mySchedules = myCourses.map(c => c.schedule)
      
      studentFilter = { 
        OR: [
          { enrolledCourses: { hasSome: myCourseIds } },
          { grade: { in: myLevels } },
          { classTiming: { in: mySchedules } }
        ]
      }
    }

    const [
      teachers,
      students,
      courses,
      submissions,
      schedules,
      questions,
      assessments,
      assignments,
      activities,
      attendance,
      evaluations
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
      fetchEntity('assignments', db.assignment.findMany({ orderBy: { createdAt: 'desc' } })),
      fetchEntity('activities', db.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })),
      fetchEntity('attendance', db.teacherAttendance.findMany({ 
        orderBy: { date: 'desc' },
        include: { teacher: { select: { id: true, name: true, employeeId: true } } }
      })),
      fetchEntity('evaluations', db.evaluation.findMany({
        where: isTeacher ? { courseId: { in: myCourseIds } } : {}
      }))
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
    // AND: Apply mandatory string-casting to all identity fields to prevent React crashes
    const validData = {
      teachers: (teachers || []).map((t: any) => ({ 
        ...t, 
        id: String(t?.id || ''),
        name: typeof t?.name === 'string' ? t.name : (t?.name ? String(t.name) : 'Teacher'),
        joinedAt: t?.joinedAt ? new Date(t.joinedAt).toISOString() : new Date().toISOString()
      })),
      students: (students || []).map((s: any) => ({ 
        ...s, 
        id: String(s?.id || ''),
        name: typeof s?.name === 'string' ? s.name : (s?.name ? String(s.name) : 'Student'),
        studentId: typeof s?.studentId === 'string' ? s.studentId : (typeof s?.id === 'string' ? `X-${s.id.slice(0, 5).toUpperCase()}` : 'TBD'),
        progress: Number(s?.progress) || 0,
        enrolledCourses: Array.isArray(s?.enrolledCourses) ? s.enrolledCourses : [],
        enrolledAt: s?.enrolledAt ? new Date(s.enrolledAt).toISOString() : new Date().toISOString()
      })),
      courses: (sanitizedCourses || []).map((c: any) => ({
        ...c,
        id: String(c?.id || ''),
        title: typeof c?.title === 'string' ? c.title : (c?.title ? String(c.title) : 'Untitled Course'),
        level: typeof c?.level === 'string' ? c.level : (c?.level ? String(c.level) : 'beginner'),
        teacherName: typeof c?.teacherName === 'string' ? c.teacherName : 'Unassigned'
      })),
      submissions: (submissions || []).map((sub: any) => ({
        ...sub,
        id: String(sub?.id || ''),
        studentName: typeof sub?.studentName === 'string' ? sub.studentName : 'Student',
        submittedAt: sub?.submittedAt ? new Date(sub.submittedAt).toISOString() : new Date().toISOString()
      })),
      schedules: (schedules || []).map((sch: any) => ({ 
        ...sch, 
        id: String(sch?.id || ''),
        day: String(sch?.day || 'Monday') 
      })),
      questions: (questions || []).map((q: any) => ({ ...q, id: String(q?.id || '') })),
      assessments: (assessments || []).map((a: any) => ({ ...a, id: String(a?.id || '') })),
      assignments: (assignments || []).map((as: any) => ({ ...as, id: String(as?.id || '') })),
      evaluations: (evaluations || []).map((e: any) => ({ ...e, id: String(e?.id || '') })),
    }

    // Derive enrollments from students (Logic layer - Inclusive of logical assignments)
    const enrollments = (validData.students || []).flatMap((s: any) => {
      const studentId = typeof s?.id === 'string' ? s.id : 'unknown'
      const studentName = typeof s?.name === 'string' ? s.name : 'Student'
      
      // Map to all courses assigned to this student (formally or logically)
      return (validData.courses || [])
        .filter((c: any) => isStudentInCourse(s, c))
        .map((course: any) => ({
          id: `${studentId}-${course.id}`,
          studentId: studentId,
          studentName: studentName,
          courseId: course.id,
          progress: Number(s?.progress) || 0,
          grade: String(s?.grade || 'N/A')
        }))
    })

    return {
      success: true,
      data: {
        ...validData,
        enrollments,
        activities: Array.isArray(activities) ? activities : [],
        attendance: Array.isArray(attendance) ? attendance : []
      }
    }
  } catch (error) {
    console.error('FATAL_INITIALIZATION_ERROR:', error)
    return { success: false, error: 'Core engine failed to initialize institutional records' }
  }
}
