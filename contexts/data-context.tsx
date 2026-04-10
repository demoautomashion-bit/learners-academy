'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition, useMemo, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { 
  Teacher, Student, Course, Assignment, Submission, 
  DashboardStats, Schedule, Question, 
  AssessmentTemplate, StudentTest 
} from '@/lib/types'

// Server Actions
import { getTeachers, addTeacher as dbAddTeacher, removeTeacher as dbRemoveTeacher, updateTeacherStatus as dbUpdateTeacherStatus, updateTeacherReviewFlag as dbUpdateTeacherReviewFlag, updateTeacher as dbUpdateTeacher } from '@/lib/actions/teachers'
import { getStudents, enrollStudent as dbEnrollStudent, removeStudent as dbRemoveStudent, updateStudentStatus as dbUpdateStudentStatus, updateStudent as dbUpdateStudent, updateStudentSuccessMetrics as dbUpdateStudentSuccessMetrics } from '@/lib/actions/students'
import { getCourses, addCourse as dbAddCourse, removeCourse as dbRemoveCourse, updateCourseStatus as dbUpdateCourseStatus, updateCourse as dbUpdateCourse } from '@/lib/actions/courses'
import { getQuestions, addQuestion as dbAddQuestion, deleteQuestion as dbDeleteQuestion, updateQuestion as dbUpdateQuestion, toggleQuestionApproval as dbApproveQuestion } from '@/lib/actions/questions'
import { getAssessments, publishAssessment as dbPublishAssessment, removeAssessment as dbRemoveAssessment, updateAssessmentReviewAction, updateAssessmentStatus as dbUpdateAssessmentStatus } from '@/lib/actions/assessments'
import { getSubmissions, submitTestResult as dbSubmitTestResult, gradeSubmission as dbGradeSubmission } from '@/lib/actions/submissions'
import { getSchedules, addSchedule as dbAddSchedule, updateSchedule as dbUpdateSchedule, removeSchedule as dbRemoveSchedule } from '@/lib/actions/schedules'
import { getFeePayments, recordPayment as dbRecordPayment, updateClassFee as dbUpdateClassFee, addFeeAccount as dbAddFeeAccount } from '@/lib/actions/fees'
import { getEconomicStats, addExpenditure as dbAddExpenditure } from '@/lib/actions/economics'
import { getInitialData } from '@/lib/actions/get-data'
import { useAuth } from '@/contexts/auth-context'
import { calculateStudentOverallProgress } from '@/lib/utils/student-progress'

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
  hasError: boolean

  // Actions
  enrollStudent: (student: any) => Promise<void>
  removeStudent: (id: string) => Promise<void>
  updateStudentStatus: (id: string, status: Student['status']) => Promise<void>
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>
  updateStudentSuccessMetrics: (id: string, progress: number, grade?: string) => Promise<void>
  publishAssessment: (assessment: AssessmentTemplate) => Promise<void>
  updateAssessmentStatus: (id: string, status: AssessmentTemplate['status']) => Promise<void>
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
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>
  updateTeacherReviewFlag: (id: string, flag: boolean) => Promise<void>
  approveQuestion: (id: string, flag: boolean) => Promise<void>
  approveAssessment: (id: string) => Promise<void>
  rejectAssessment: (id: string, feedback: string) => Promise<void>
  resetToDefaults: () => void
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function computeStats(
  teachers: Teacher[], 
  students: Student[], 
  courses: Course[], 
  submissions: Submission[],
  assessments: AssessmentTemplate[],
  econ: any | null,
  referenceDate?: Date
): DashboardStats {
  const now = referenceDate || new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newEnrollments = students.filter(s => {
    const d = new Date(s.enrolledAt)
    return d >= thirtyDaysAgo
  }).length

  // Use centralized utility for completion rate
  const totalStudents = students.length
  const totalCompletionProgress = students.reduce((acc, s) => acc + calculateStudentOverallProgress(s, submissions, assessments), 0)
  const averageCompletion = totalStudents > 0 ? Math.round(totalCompletionProgress / totalStudents) : 0

  return {
    totalStudents,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    activeEnrollments: (students || []).filter(s => s && s.status === 'active').length,
    revenue: econ?.actualRevenue || 0,
    revenueChange: econ?.revenueChange || 0,
    newEnrollments: econ?.newEnrollments || newEnrollments,
    completionRate: averageCompletion,
    netMargin: econ?.netMargin || 0
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
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [economics, setEconomics] = useState<any | null>(null)
  const [feePayments, setFeePayments] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { user } = useAuth()
  const [hasMounted, setHasMounted] = useState(false)
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const refresh = useCallback(async () => {
    // Basic guard: Prevent duplicate concurrent refreshes or early sync without auth identity
    if (isRefreshingRef.current) return;
    
    // Safety Audit: Ensure we don't fetch role-specific data until the identity is stable
    // Special exception: allow public home page and student landing to proceed
    const isPublicPage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/student')
    if (!isPublicPage && (!user?.id || !user?.role)) {
      console.warn('[DataProvider] Sync deferred: User identity not yet verified.')
      setIsLoading(false) // CRITICAL: Release the loading lock for login/public pages
      return
    }
    
    isRefreshingRef.current = true
    setIsLoading(true)
    const normalizeDate = (d: any) => (d instanceof Date ? d.toISOString() : d)

    try {
      console.log(`[DataProvider] Syncing with institutional registry for user: ${user?.id || 'Public'}...`)
      setHasError(false)
      
      const [initRes, econData] = await Promise.all([
        getInitialData(user?.id, user?.role as any),
        getEconomicStats().catch(err => {
          console.error("FAILED_TO_FETCH_SECONDARY_ECONOMICS:", err)
          return null
        })
      ])

      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.error || "Initialization failed")
      }

      const { 
        teachers: t = [], 
        students: s = [], 
        courses: c = [], 
        questions: q = [], 
        assessments: a = [], 
        submissions: sub = [], 
        schedules: sch = [], 
        assignments: asgn = [], 
        enrollments: enr = [] 
      } = initRes.data || {}

      startTransition(() => {
        setTeachers((t || []).map((item: any) => ({ ...item, joinedAt: normalizeDate(item.joinedAt) })) as unknown as Teacher[])
        setStudents((s || []).map((item: any) => ({ ...item, enrolledAt: normalizeDate(item.enrolledAt) })) as unknown as Student[])
        
        const normalizedCourses = (c || []).map((item: any) => ({ 
          ...item, 
          startDate: normalizeDate(item.startDate),
          endDate: normalizeDate(item.endDate)
        })) as unknown as Course[]
        setCourses(normalizedCourses)
        
        setQuestions(q as unknown as Question[])
        setAssessments(a as unknown as AssessmentTemplate[])
        setSubmissions((sub || []).map((item: any) => ({ ...item, submittedAt: normalizeDate(item.submittedAt) })) as unknown as Submission[])
        setSchedules(sch as unknown as Schedule[])
        setAssignments(asgn as Assignment[])
        
        // Advanced Mapping: Link enrollments to course objects by ID
        const normalizedEnrollments = (enr || []).map((en: any) => ({
          ...en,
          course: normalizedCourses.find(nc => nc.id === en.courseId)
        }))
        setEnrollments(normalizedEnrollments)
        
        if (econData && econData.success) {
          setEconomics(econData.data)
          setFeePayments(econData.data?.feePayments || [])
        }
      })
    } catch (err) {
      console.error('CRITICAL_INITIALIZATION_ERROR:', err)
      // Only set hasError if the entire fetch fails (initRes.success was false)
      setHasError(true)
      toast.error("Institutional link disrupted. Attempting recovery...")
    } finally {
      setIsInitialized(true)
      setIsLoading(false)
      isRefreshingRef.current = false
    }
  }, [user?.id, user?.role]) // Only re-create refresh when auth identity changes

  useEffect(() => {
    refresh()
  }, [refresh])

  // Stability Guard: Ensure stats are only calculated with a stable date on the client
  // or use a fixed date for server-side pre-rendering to match initial client state
  const stats = useMemo(() => {
    if (!isInitialized || !hasMounted) {
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        revenue: 0,
        revenueChange: 0,
        newEnrollments: 0,
        completionRate: 0,
        netMargin: 0
      }
    }
    return computeStats(teachers, students, courses, submissions, assessments, economics)
  }, [teachers, students, courses, submissions, assessments, economics, isInitialized, hasMounted])

  const [isRefreshing, startTransitionAction] = useTransition()

  const executeAction = useCallback(async (
    action: () => Promise<any>, 
    successMsg?: string, 
    errorMsg?: string
  ) => {
    try {
      const result = await action()
      
      // Standardized response handling
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          throw new Error(result.error || 'Operation failed')
        }
      }

      await refresh()
      if (successMsg) toast.success(successMsg)
      return result
    } catch (err) {
      console.error('[DataProvider] ACTION_ERROR:', err)
      const message = err instanceof Error ? err.message : 'Institutional record sync failed'
      toast.error(errorMsg || message)
      // Standard recovery: sync state anyway to ensure UI isn't stale
      await refresh()
      throw err
    }
  }, [refresh])

  // --- Teachers ---
  const addTeacher = useCallback(async (teacher: Teacher) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbAddTeacher(teacher)
      if (res.success && res.data) {
        setTeachers(prev => [res.data as Teacher, ...prev])
      }
      return res
    }, "Teacher added to registry", "Failed to add teacher")
  }, [executeAction, user])

  const updateTeacherStatus = useCallback(async (id: string, status: 'active' | 'inactive') => {
    if (!user?.id) return
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await executeAction(() => dbUpdateTeacherStatus(id, status))
  }, [executeAction, user])

  const removeTeacher = useCallback(async (id: string) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbRemoveTeacher(id)
      if (res.success) {
        setTeachers(prev => prev.filter(t => t.id !== id))
      }
      return res
    }, "Teacher removed", "Failed to remove teacher")
  }, [executeAction, user])

  // --- Students ---
  const enrollStudent = useCallback(async (student: any) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbEnrollStudent(student)
      if (res.success && res.data) {
        setStudents(prev => [res.data as Student, ...prev])
      }
      return res
    }, "Student enrolled successfully", "Enrollment failed")
  }, [executeAction, user])

  const removeStudent = useCallback(async (id: string) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbRemoveStudent(id)
      if (res.success) {
        setStudents(prev => prev.filter(s => s.id !== id))
      }
      return res
    }, "Student registry purged")
  }, [executeAction, user])

  const updateStudentStatus = useCallback(async (id: string, status: Student['status']) => {
    if (!user?.id) return
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    await executeAction(() => dbUpdateStudentStatus(id, status))
  }, [executeAction, user])

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    if (!user?.id) return
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
    await executeAction(() => dbUpdateStudent(id, data), "Academic profile updated")
  }, [executeAction, user])

  const updateStudentSuccessMetrics = useCallback(async (id: string, progress: number, grade?: string) => {
    if (!user?.id) return
    setStudents(prev => prev.map(s => s.id === id ? { ...s, progress, grade } : s))
    await executeAction(() => dbUpdateStudentSuccessMetrics(id, progress, user.id, grade))
  }, [executeAction, user])


  // --- Courses ---
  const addCourse = useCallback(async (course: Course) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbAddCourse(course)
      if (res.success && res.data) {
        setCourses(prev => [res.data as Course, ...prev])
      }
      return res
    }, "Course created")
  }, [executeAction, user])

  const removeCourse = useCallback(async (id: string) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbRemoveCourse(id)
      if (res.success) {
        setCourses(prev => prev.filter(c => c.id !== id))
      }
      return res
    }, "Course deleted")
  }, [executeAction, user])

  const updateCourseStatus = useCallback(async (id: string, status: Course['status']) => {
    if (!user?.id) return
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    await executeAction(() => dbUpdateCourseStatus(id, status))
  }, [executeAction, user])

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    if (!user?.id) return
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    await executeAction(() => dbUpdateCourse(id, data), "Course curriculum updated")
  }, [executeAction, user])

  const updateCourseProgress = useCallback((courseId: string, progress: number) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: progress } : c))
  }, [])

  // --- Questions ---
  const addQuestion = useCallback(async (question: Question) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbAddQuestion(question)
      if (res.success && res.data) {
        setQuestions(prev => [res.data as Question, ...prev])
      }
      return res
    }, "Block added to library")
  }, [executeAction, user])

  const deleteQuestion = useCallback(async (id: string) => {
    if (!user?.id) return
    await executeAction(async () => {
      const res = await dbDeleteQuestion(id)
      if (res.success) {
        setQuestions(prev => prev.filter(q => q.id !== id))
      }
      return res
    }, "Block removed")
  }, [executeAction, user])

  const updateQuestion = useCallback(async (id: string, data: Partial<Question>) => {
    if (!user?.id) return
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q))
    await executeAction(() => dbUpdateQuestion(id, data), "Block updated")
  }, [executeAction, user])

  // --- Assessments & Tests ---
  const publishAssessment = useCallback(async (assessment: AssessmentTemplate) => {
    await executeAction(() => dbPublishAssessment(assessment), "Assessment published successfully")
  }, [executeAction])

  const updateAssessmentStatus = useCallback(async (id: string, status: AssessmentTemplate['status']) => {
    await executeAction(() => dbUpdateAssessmentStatus(id, status), "Assessment status updated")
  }, [executeAction])

  const removeAssessment = useCallback(async (id: string) => {
    await executeAction(() => dbRemoveAssessment(id), "Test permanently deleted")
  }, [executeAction])

  const updateTeacher = useCallback(async (id: string, data: Partial<Teacher>) => {
    await executeAction(() => dbUpdateTeacher(id, data), "Institutional record updated")
  }, [executeAction])

  // --- Review System ---
  const updateTeacherReviewFlag = useCallback(async (id: string, flag: boolean) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, requiresReview: flag } : t))
    await executeAction(() => dbUpdateTeacherReviewFlag(id, flag))
  }, [executeAction])

  const approveQuestion = useCallback(async (id: string, flag: boolean) => {
    await executeAction(() => dbApproveQuestion(id, flag))
  }, [executeAction])

  const approveAssessment = useCallback(async (id: string) => {
    await executeAction(() => updateAssessmentReviewAction(id, 'active'), "Assessment approved")
  }, [executeAction])

  const rejectAssessment = useCallback(async (id: string, feedback: string) => {
    await executeAction(() => updateAssessmentReviewAction(id, 'draft', feedback), "Assessment sent back for revision")
  }, [executeAction])

  // --- Submissions ---
  const submitTestResult = useCallback(async (result: StudentTest) => {
    const template = assessments.find(a => a.id === result.templateId)
    await executeAction(() => dbSubmitTestResult(result, template?.title || 'Test'), "Results stored in registry")
  }, [assessments, executeAction])

  const gradeSubmission = useCallback(async (id: string, grade: number, feedback: string) => {
    await executeAction(() => dbGradeSubmission(id, grade, feedback), "Institutional score recorded")
  }, [executeAction])

  // --- Schedules ---
  const addSchedule = useCallback(async (schedule: Schedule) => {
    await executeAction(() => dbAddSchedule(schedule), "Schedule updated")
  }, [executeAction])

  const updateSchedule = useCallback(async (id: string, data: Partial<Schedule>) => {
    await executeAction(() => dbUpdateSchedule(id, data), "Schedule entry modified")
  }, [executeAction])

  const removeSchedule = useCallback(async (id: string) => {
    await executeAction(() => dbRemoveSchedule(id), "Schedule entry deleted")
  }, [executeAction])

  // --- Economics & Fees ---
  const addExpenditure = useCallback(async (data: any) => {
    await executeAction(() => dbAddExpenditure(data), "Institutional outflow recorded")
  }, [executeAction])

  const recordPayment = useCallback(async (id: string, amount: number) => {
    await executeAction(() => dbRecordPayment(id, amount), "Payment captured")
  }, [executeAction])

  const addFeeAccount = useCallback(async (data: any) => {
    await executeAction(() => dbAddFeeAccount(data), "Student fee account initialized")
  }, [executeAction])

  const updateClassFee = useCallback(async (id: string, amount: number) => {
    await executeAction(() => dbUpdateClassFee(id, amount), "Class tuition fee modified")
  }, [executeAction])

  const resetToDefaults = useCallback(() => {
    toast.info('Reset is not available in database mode')
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-8">
        <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <div className="h-6 w-6 text-destructive">⚠️</div>
        </div>
        <h2 className="text-2xl font-serif mb-2">Connection unstable</h2>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
          We were unable to synchronize with the institutional database. 
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-2 rounded-xl text-xs uppercase tracking-widest font-normal hover:bg-primary/90 transition-all shadow-premium"
        >
          Reload Portal
        </button>
      </div>
    )
  }

  // Hydration & Authentication Guard
  // Only block rendering if we are on a protected route that REQUIRES authenticated data
  const isProtectedRoute = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/admin') || 
     window.location.pathname.startsWith('/teacher') || 
     (window.location.pathname.startsWith('/student') && window.location.pathname !== '/student'))

  if (!isInitialized && isLoading && isProtectedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
           <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Syncing Registry Blocks...</p>
        </div>
      </div>
    )
  }

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
      hasError,
      enrollStudent,
      removeStudent,
      updateStudentStatus,
      updateStudent,
      updateStudentSuccessMetrics,
      publishAssessment,
      updateAssessmentStatus,
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
      updateTeacher,
      updateTeacherReviewFlag,
      approveQuestion,
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
