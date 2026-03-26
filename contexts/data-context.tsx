'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { 
  Teacher, Student, Course, Assignment, Submission, 
  DashboardStats, Schedule, Question, 
  AssessmentTemplate, StudentTest 
} from '@/lib/types'

// Server Actions
import { getTeachers, addTeacher as dbAddTeacher, removeTeacher as dbRemoveTeacher, updateTeacherStatus as dbUpdateTeacherStatus } from '@/lib/actions/teachers'
import { getStudents, enrollStudent as dbEnrollStudent, removeStudent as dbRemoveStudent, updateStudentStatus as dbUpdateStudentStatus } from '@/lib/actions/students'
import { getCourses, addCourse as dbAddCourse, removeCourse as dbRemoveCourse, updateCourseStatus as dbUpdateCourseStatus } from '@/lib/actions/courses'
import { getQuestions, addQuestion as dbAddQuestion, deleteQuestion as dbDeleteQuestion, updateQuestion as dbUpdateQuestion } from '@/lib/actions/questions'
import { getAssessments, publishAssessment as dbPublishAssessment, removeAssessment as dbRemoveAssessment } from '@/lib/actions/assessments'
import { getSubmissions, submitTestResult as dbSubmitTestResult, gradeSubmission as dbGradeSubmission } from '@/lib/actions/submissions'
import { getSchedules, addSchedule as dbAddSchedule, updateSchedule as dbUpdateSchedule, removeSchedule as dbRemoveSchedule } from '@/lib/actions/schedules'

interface DataContextType {
  teachers: Teacher[]
  students: Student[]
  courses: Course[]
  assignments: Assignment[]
  submissions: Submission[]
  stats: DashboardStats
  schedules: Schedule[]
  questions: Question[]
  assessments: AssessmentTemplate[]
  enrollments: any[]
  isInitialized: boolean
  isLoading: boolean

  // Actions
  enrollStudent: (student: Student) => Promise<void>
  removeStudent: (id: string) => Promise<void>
  updateStudentStatus: (id: string, status: Student['status']) => Promise<void>
  publishAssessment: (assessment: AssessmentTemplate) => Promise<void>
  removeAssessment: (id: string) => Promise<void>
  submitTestResult: (result: StudentTest) => Promise<void>
  gradeSubmission: (id: string, grade: number, feedback: string) => Promise<void>
  updateCourseProgress: (courseId: string, progress: number) => void
  addQuestion: (question: Question) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  updateQuestion: (id: string, question: Partial<Question>) => Promise<void>
  addTeacher: (teacher: Teacher) => Promise<void>
  updateTeacherStatus: (id: string, status: Teacher['status']) => Promise<void>
  removeTeacher: (id: string) => Promise<void>
  addCourse: (course: Course) => Promise<void>
  updateCourseStatus: (id: string, status: Course['status']) => Promise<void>
  removeCourse: (id: string) => Promise<void>
  addSchedule: (schedule: Schedule) => Promise<void>
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>
  removeSchedule: (id: string) => Promise<void>
  resetToDefaults: () => void
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function computeStats(teachers: Teacher[], students: Student[], courses: Course[]): DashboardStats {
  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    activeEnrollments: students.filter(s => s.status === 'active').length,
    revenue: 0,
    revenueChange: 0,
    newEnrollments: 0,
    completionRate: 0,
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [t, s, c, q, a, sub, sch] = await Promise.all([
        getTeachers(),
        getStudents(),
        getCourses(),
        getQuestions(),
        getAssessments(),
        getSubmissions(),
        getSchedules(),
      ])
      setTeachers(t as unknown as Teacher[])
      setStudents(s as unknown as Student[])
      setCourses(c as unknown as Course[])
      setQuestions(q as unknown as Question[])
      setAssessments(a as unknown as AssessmentTemplate[])
      setSubmissions(sub as unknown as Submission[])
      setSchedules(sch as unknown as Schedule[])
    } catch (err) {
      console.error('Failed to load data from DB:', err)
      toast.error(err instanceof Error ? err.message.substring(0, 150) : 'Database operation failed')
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = computeStats(teachers, students, courses)

  // --- Teachers ---
  const addTeacher = useCallback(async (teacher: Teacher) => {
    await dbAddTeacher(teacher)
    await refresh()
  }, [refresh])

  const updateTeacherStatus = useCallback(async (id: string, status: Teacher['status']) => {
    await dbUpdateTeacherStatus(id, status)
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }, [])

  const removeTeacher = useCallback(async (id: string) => {
    await dbRemoveTeacher(id)
    setTeachers(prev => prev.filter(t => t.id !== id))
  }, [])

  // --- Students ---
  const enrollStudent = useCallback(async (student: Student) => {
    await dbEnrollStudent(student)
    await refresh()
  }, [refresh])

  const removeStudent = useCallback(async (id: string) => {
    await dbRemoveStudent(id)
    setStudents(prev => prev.filter(s => s.id !== id))
  }, [])

  const updateStudentStatus = useCallback(async (id: string, status: Student['status']) => {
    await dbUpdateStudentStatus(id, status)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }, [])

  // --- Courses ---
  const addCourse = useCallback(async (course: Course) => {
    await dbAddCourse(course)
    await refresh()
  }, [refresh])

  const removeCourse = useCallback(async (id: string) => {
    await dbRemoveCourse(id)
    setCourses(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateCourseStatus = useCallback(async (id: string, status: Course['status']) => {
    await dbUpdateCourseStatus(id, status)
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }, [])

  const updateCourseProgress = useCallback((courseId: string, progress: number) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress } : c))
  }, [])

  // --- Questions ---
  const addQuestion = useCallback(async (question: Question) => {
    await dbAddQuestion(question)
    await refresh()
  }, [refresh])

  const deleteQuestion = useCallback(async (id: string) => {
    await dbDeleteQuestion(id)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }, [])

  const updateQuestion = useCallback(async (id: string, data: Partial<Question>) => {
    await dbUpdateQuestion(id, data)
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q))
  }, [])

  // --- Assessments ---
  const publishAssessment = useCallback(async (assessment: AssessmentTemplate) => {
    await dbPublishAssessment(assessment)
    await refresh()
  }, [refresh])

  const removeAssessment = useCallback(async (id: string) => {
    await dbRemoveAssessment(id)
    setAssessments(prev => prev.filter(a => a.id !== id))
  }, [])

  // --- Submissions ---
  const submitTestResult = useCallback(async (result: StudentTest) => {
    const template = assessments.find(a => a.id === result.templateId)
    await dbSubmitTestResult(result, template?.title || 'Test')
    await refresh()
    toast.success('Test submitted successfully')
  }, [assessments, refresh])

  const gradeSubmission = useCallback(async (id: string, grade: number, feedback: string) => {
    await dbGradeSubmission(id, grade, feedback)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, grade, feedback, status: 'graded' } : s))
    toast.success('Grade published to student')
  }, [])

  // --- Schedules ---
  const addSchedule = useCallback(async (schedule: Schedule) => {
    await dbAddSchedule(schedule)
    await refresh()
  }, [refresh])

  const updateSchedule = useCallback(async (id: string, data: Partial<Schedule>) => {
    await dbUpdateSchedule(id, data)
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }, [])

  const removeSchedule = useCallback(async (id: string) => {
    await dbRemoveSchedule(id)
    setSchedules(prev => prev.filter(s => s.id !== id))
  }, [])

  const resetToDefaults = useCallback(() => {
    toast.info('Reset is not available in database mode')
  }, [])

  return (
    <DataContext.Provider value={{
      teachers,
      students,
      courses,
      assignments,
      submissions,
      stats,
      schedules,
      questions,
      assessments,
      enrollments: [],
      isInitialized,
      isLoading,
      enrollStudent,
      removeStudent,
      updateStudentStatus,
      publishAssessment,
      removeAssessment,
      submitTestResult,
      gradeSubmission,
      updateCourseProgress,
      addQuestion,
      deleteQuestion,
      updateQuestion,
      addTeacher,
      updateTeacherStatus,
      removeTeacher,
      addCourse,
      updateCourseStatus,
      removeCourse,
      addSchedule,
      updateSchedule,
      removeSchedule,
      resetToDefaults,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
