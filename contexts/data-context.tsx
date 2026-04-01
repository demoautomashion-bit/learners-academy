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
import { getStudents, enrollStudent as dbEnrollStudent, removeStudent as dbRemoveStudent, updateStudentStatus as dbUpdateStudentStatus, updateStudent as dbUpdateStudent, updateStudentSuccessMetrics as dbUpdateStudentSuccessMetrics } from '@/lib/actions/students'
import { getCourses, addCourse as dbAddCourse, removeCourse as dbRemoveCourse, updateCourseStatus as dbUpdateCourseStatus, updateCourse as dbUpdateCourse } from '@/lib/actions/courses'
import { getQuestions, addQuestion as dbAddQuestion, deleteQuestion as dbDeleteQuestion, updateQuestion as dbUpdateQuestion } from '@/lib/actions/questions'
import { getAssessments, publishAssessment as dbPublishAssessment, removeAssessment as dbRemoveAssessment } from '@/lib/actions/assessments'
import { getSubmissions, submitTestResult as dbSubmitTestResult, gradeSubmission as dbGradeSubmission } from '@/lib/actions/submissions'
import { getSchedules, addSchedule as dbAddSchedule, updateSchedule as dbUpdateSchedule, removeSchedule as dbRemoveSchedule } from '@/lib/actions/schedules'
import { getFeePayments, recordPayment as dbRecordPayment, updateClassFee as dbUpdateClassFee, addFeeAccount as dbAddFeeAccount } from '@/lib/actions/fees'
import { getEconomicStats, addExpenditure as dbAddExpenditure } from '@/lib/actions/economics'
import { getInitialData } from '@/lib/actions/get-data'

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
  economics: any | null
  feePayments: any[]
  isInitialized: boolean
  isLoading: boolean

  // Actions
  enrollStudent: (student: any) => Promise<void>
  removeStudent: (id: string) => Promise<void>
  updateStudentStatus: (id: string, status: Student['status']) => Promise<void>
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>
  updateStudentSuccessMetrics: (id: string, progress: number, grade?: string) => Promise<void>
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
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>
  removeCourse: (id: string) => Promise<void>
  addSchedule: (schedule: Schedule) => Promise<void>
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>
  removeSchedule: (id: string) => Promise<void>
  addExpenditure: (data: any) => Promise<void>
  recordPayment: (id: string, amount: number) => Promise<void>
  addFeeAccount: (data: any) => Promise<void>
  updateClassFee: (id: string, amount: number) => Promise<void>
  updateTeacherReviewFlag: (id: string, flag: boolean) => void
  approveAssessment: (id: string) => void
  rejectAssessment: (id: string, feedback: string) => void
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
    newEnrollments: 3, // Mock based on recent students
    completionRate: 0,
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [economics, setEconomics] = useState<any | null>(null)
  const [feePayments, setFeePayments] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const normalizeDate = (d: any) => (d instanceof Date ? d.toISOString() : d)

    try {
      // 1. Single consolidated fetch for core data
      const initRes = await getInitialData()
      const econData = await getEconomicStats().catch(err => {
        console.error("Failed to fetch secondary economics:", err)
        return null
      })

      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.error || "Initialization failed")
      }

      const { 
        teachers: t, students: s, courses: c, questions: q, 
        assessments: a, submissions: sub, schedules: sch, 
        assignments: asgn, enrollments: enr 
      } = initRes.data

      startTransition(() => {
        setTeachers(t.map((item: any) => ({ ...item, joinedAt: normalizeDate(item.joinedAt) })) as unknown as Teacher[])
        setStudents(s.map((item: any) => ({ ...item, enrolledAt: normalizeDate(item.enrolledAt) })) as unknown as Student[])
        setCourses(c.map((item: any) => ({ 
          ...item, 
          startDate: normalizeDate(item.startDate),
          endDate: normalizeDate(item.endDate)
        })) as unknown as Course[])
        setQuestions(q as unknown as Question[])
        setAssessments(a as unknown as AssessmentTemplate[])
        setSubmissions(sub.map((item: any) => ({ ...item, submittedAt: normalizeDate(item.submittedAt) })) as unknown as Submission[])
        setSchedules(sch as unknown as Schedule[])
        setAssignments(asgn as Assignment[])
        setEnrollments(enr as any[])
        
        if (econData) {
          setEconomics(econData)
          setFeePayments(econData.feePayments || [])
        }
      })
    } catch (err) {
      console.error('CRITICAL_INITIALIZATION_ERROR:', err)
      toast.error("Cloud connection unstable. Using local bridge.")
    } finally {
      // Ensure the UI flag is always flipped to clear the skeleton
      setIsInitialized(true)
      setIsLoading(false)
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
    await refresh()
  }, [refresh])

  const removeTeacher = useCallback(async (id: string) => {
    await dbRemoveTeacher(id)
    await refresh()
  }, [refresh])

  // --- Students ---
  const enrollStudent = useCallback(async (student: any) => {
    await dbEnrollStudent(student)
    await refresh()
  }, [refresh])

  const removeStudent = useCallback(async (id: string) => {
    await dbRemoveStudent(id)
    await refresh()
  }, [refresh])

  const updateStudentStatus = useCallback(async (id: string, status: Student['status']) => {
    await dbUpdateStudentStatus(id, status)
    await refresh()
  }, [refresh])

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    await dbUpdateStudent(id, data)
    await refresh()
  }, [refresh])

  const updateStudentSuccessMetrics = useCallback(async (id: string, progress: number, grade?: string) => {
    await dbUpdateStudentSuccessMetrics(id, progress, grade)
    await refresh()
  }, [refresh])

  // --- Courses ---
  const addCourse = useCallback(async (course: Course) => {
    await dbAddCourse(course)
    await refresh()
  }, [refresh])

  const removeCourse = useCallback(async (id: string) => {
    await dbRemoveCourse(id)
    await refresh()
  }, [refresh])

  const updateCourseStatus = useCallback(async (id: string, status: Course['status']) => {
    await dbUpdateCourseStatus(id, status)
    await refresh()
  }, [refresh])

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    await dbUpdateCourse(id, data)
    await refresh()
  }, [refresh])

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
    await refresh()
  }, [refresh])

  const updateQuestion = useCallback(async (id: string, data: Partial<Question>) => {
    await dbUpdateQuestion(id, data)
    await refresh()
  }, [refresh])

  const publishAssessment = useCallback(async (assessment: AssessmentTemplate) => {
    await dbPublishAssessment(assessment)
    await refresh()
  }, [refresh])

  const removeAssessment = useCallback(async (id: string) => {
    await dbRemoveAssessment(id)
    await refresh()
  }, [refresh])

  // --- Review System (local state only, backend phase later) ---
  const updateTeacherReviewFlag = useCallback((id: string, flag: boolean) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, requiresReview: flag } : t))
  }, [])

  const approveAssessment = useCallback((id: string) => {
    setAssessments(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'active' as const, adminFeedback: undefined } : a
    ))
  }, [])

  const rejectAssessment = useCallback((id: string, feedback: string) => {
    setAssessments(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'draft' as const, adminFeedback: feedback } : a
    ))
  }, [])

  // --- Submissions ---
  const submitTestResult = useCallback(async (result: StudentTest) => {
    const template = assessments.find(a => a.id === result.templateId)
    await dbSubmitTestResult(result, template?.title || 'Test')
    await refresh()
  }, [assessments, refresh])

  const gradeSubmission = useCallback(async (id: string, grade: number, feedback: string) => {
    await dbGradeSubmission(id, grade, feedback)
    await refresh()
  }, [refresh])

  // --- Schedules ---
  const addSchedule = useCallback(async (schedule: Schedule) => {
    await dbAddSchedule(schedule)
    await refresh()
  }, [refresh])

  const updateSchedule = useCallback(async (id: string, data: Partial<Schedule>) => {
    await dbUpdateSchedule(id, data)
    await refresh()
  }, [refresh])

  const removeSchedule = useCallback(async (id: string) => {
    await dbRemoveSchedule(id)
    await refresh()
  }, [refresh])

  // --- Economics & Fees ---
  const addExpenditure = useCallback(async (data: any) => {
    await dbAddExpenditure(data)
    await refresh()
  }, [refresh])

  const recordPayment = useCallback(async (id: string, amount: number) => {
    await dbRecordPayment(id, amount)
    await refresh()
  }, [refresh])

  const addFeeAccount = useCallback(async (data: any) => {
    await dbAddFeeAccount(data)
    await refresh()
  }, [refresh])

  const updateClassFee = useCallback(async (id: string, amount: number) => {
    await dbUpdateClassFee(id, amount)
    await refresh()
  }, [refresh])

  const resetToDefaults = useCallback(() => {
    toast.info('Reset is not available in database mode')
  }, [])

  if (!mounted) return <div id="data-hydrating" />

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
      economics,
      feePayments,
      enrollments,
      isInitialized,
      isLoading,
      enrollStudent,
      removeStudent,
      updateStudentStatus,
      updateStudent,
      updateStudentSuccessMetrics,
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
      updateCourse,
      removeCourse,
      addSchedule,
      updateSchedule,
      removeSchedule,
      addExpenditure,
      recordPayment,
      addFeeAccount,
      updateClassFee,
      updateTeacherReviewFlag,
      approveAssessment,
      rejectAssessment,
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
