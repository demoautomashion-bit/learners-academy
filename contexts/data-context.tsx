'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition, type ReactNode } from 'react'
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

function computeStats(teachers: Teacher[], students: Student[], courses: Course[], econ: any | null): DashboardStats {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newEnrollments = students.filter(s => {
    const d = new Date(s.enrolledAt)
    return d >= thirtyDaysAgo
  }).length

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    activeEnrollments: students.filter(s => s.status === 'active').length,
    revenue: econ?.actualRevenue || 0,
    revenueChange: (econ?.actualRevenue / (econ?.totalExpenditure || 1)) * 100,
    newEnrollments: econ?.newEnrollments || newEnrollments,
    completionRate: 0,
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

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const normalizeDate = (d: any) => (d instanceof Date ? d.toISOString() : d)

    try {
      setHasError(false)
      // Parallel fetch: eliminates sequential round-trip penalty
      const [initRes, econData] = await Promise.all([
        getInitialData(),
        getEconomicStats().catch(err => {
          console.error("Failed to fetch secondary economics:", err)
          return null
        })
      ])

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
      setHasError(true)
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

  const stats = computeStats(teachers, students, courses, economics)
  const [isRefreshing, startTransitionAction] = useTransition()

  const executeAction = useCallback(async (
    action: () => Promise<any>, 
    successMsg?: string, 
    errorMsg?: string
  ) => {
    try {
      await action()
      await refresh()
      if (successMsg) toast.success(successMsg)
    } catch (err) {
      console.error('ACTION_ERROR:', err)
      toast.error(errorMsg || (err instanceof Error ? err.message : 'Database operation failed'))
      await refresh()
    }
  }, [refresh])

  // --- Teachers ---
  const addTeacher = useCallback(async (teacher: Teacher) => {
    await executeAction(() => dbAddTeacher(teacher), "Teacher added to registry", "Failed to add teacher")
  }, [executeAction])

  const updateTeacherStatus = useCallback(async (id: string, status: 'active' | 'inactive') => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await executeAction(() => dbUpdateTeacherStatus(id, status))
  }, [executeAction])

  const removeTeacher = useCallback(async (id: string) => {
    await executeAction(() => dbRemoveTeacher(id), "Teacher removed", "Failed to remove teacher")
  }, [executeAction])

  // --- Students ---
  const enrollStudent = useCallback(async (student: any) => {
    await executeAction(() => dbEnrollStudent(student), "Student enrolled successfully", "Enrollment failed")
  }, [executeAction])

  const removeStudent = useCallback(async (id: string) => {
    await executeAction(() => dbRemoveStudent(id), "Student registry purged")
  }, [executeAction])

  const updateStudentStatus = useCallback(async (id: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    await executeAction(() => dbUpdateStudentStatus(id, status))
  }, [executeAction])

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    await executeAction(() => dbUpdateStudent(id, data), "Academic profile updated")
  }, [executeAction])

  const updateStudentSuccessMetrics = useCallback(async (id: string, progress: number, grade?: string) => {
    await executeAction(() => dbUpdateStudentSuccessMetrics(id, progress, grade))
  }, [executeAction])


  // --- Courses ---
  const addCourse = useCallback(async (course: Course) => {
    await executeAction(() => dbAddCourse(course), "Course created")
  }, [executeAction])

  const removeCourse = useCallback(async (id: string) => {
    await executeAction(() => dbRemoveCourse(id), "Course deleted")
  }, [executeAction])

  const updateCourseStatus = useCallback(async (id: string, status: Course['status']) => {
    await executeAction(() => dbUpdateCourseStatus(id, status))
  }, [executeAction])

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    await executeAction(() => dbUpdateCourse(id, data), "Course curriculum updated")
  }, [executeAction])

  const updateCourseProgress = useCallback((courseId: string, progress: number) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: progress } : c))
  }, [])

  // --- Questions ---
  const addQuestion = useCallback(async (question: Question) => {
    await executeAction(() => dbAddQuestion(question), "Block added to library")
  }, [executeAction])

  const deleteQuestion = useCallback(async (id: string) => {
    await executeAction(() => dbDeleteQuestion(id), "Block removed")
  }, [executeAction])

  const updateQuestion = useCallback(async (id: string, data: Partial<Question>) => {
    await executeAction(() => dbUpdateQuestion(id, data), "Block updated")
  }, [executeAction])

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
