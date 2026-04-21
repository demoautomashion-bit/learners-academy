'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition, useMemo, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { 
  Teacher, Student, Course, Assignment, Submission, 
  DashboardStats, Schedule, Question, 
  AssessmentTemplate, StudentTest 
} from '@/lib/types'

// Server Actions & Validations
import { getTeachers, addTeacher as dbAddTeacher, removeTeacher as dbRemoveTeacher, updateTeacherStatus as dbUpdateTeacherStatus, updateTeacherReviewFlag as dbUpdateTeacherReviewFlag, updateTeacher as dbUpdateTeacher } from '@/lib/actions/teachers'
import { getStudents, enrollStudent as dbEnrollStudent, removeStudent as dbRemoveStudent, updateStudentStatus as dbUpdateStudentStatus, updateStudent as dbUpdateStudent, updateStudentSuccessMetrics as dbUpdateStudentSuccessMetrics } from '@/lib/actions/students'
import { getCourses, addCourse as dbAddCourse, removeCourse as dbRemoveCourse, updateCourseStatus as dbUpdateCourseStatus, updateCourse as dbUpdateCourse } from '@/lib/actions/courses'
import { getQuestions, addQuestion as dbAddQuestion, deleteQuestion as dbDeleteQuestion, updateQuestion as dbUpdateQuestion, toggleQuestionApproval as dbApproveQuestion } from '@/lib/actions/questions'
import { getAssessments, publishAssessment as dbPublishAssessment, removeAssessment as dbRemoveAssessment, updateAssessmentReviewAction, updateAssessmentStatus as dbUpdateAssessmentStatus } from '@/lib/actions/assessments'
import { getSubmissions, submitTestResult as dbSubmitTestResult, gradeSubmission as dbGradeSubmission } from '@/lib/actions/submissions'
import { getSchedules, addSchedule as dbAddSchedule, updateSchedule as dbUpdateSchedule, removeSchedule as dbRemoveSchedule } from '@/lib/actions/schedules'
import { getFeePayments, recordPayment as dbRecordPayment, updateClassFee as dbUpdateClassFee, addFeeAccount as dbAddFeeAccount } from '@/lib/actions/fees'
import { getEconomicStats, addExpenditure as dbAddExpenditure } from '@/lib/actions/economics'
import { markAttendance as dbMarkAttendance, addAttendanceEvent as dbAddAttendanceEvent } from '@/lib/actions/attendance'
import { logActivity as dbLogActivity } from '@/lib/actions/activities'
import { saveEvaluations as dbSaveEvaluations } from '@/lib/actions/evaluations'
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
  activities: any[]
  attendance: any[]
  evaluations: any[]
  isInitialized: boolean
  isLoading: boolean
  errorMsg: string | null

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
  logActivity: (action: string, category: string) => Promise<void>
  markAttendance: (teacherId: string, date: string, status: string, subCount?: number) => Promise<void>
  addAttendanceEvent: (teacherId: string, date: string, event: any) => Promise<void>
  saveEvaluations: (courseId: string, data: any[]) => Promise<void>
  resetToDefaults: () => void
  refresh: () => Promise<void>
  retryConnection: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function computeStats(
  teachers: Teacher[], 
  students: Student[], 
  courses: Course[], 
  submissions: Submission[],
  assessments: AssessmentTemplate[],
  econ: any | null,
  questions: Question[]
): DashboardStats {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newEnrollments = students.filter(s => {
    const d = new Date(s.enrolledAt)
    return d >= thirtyDaysAgo
  }).length

  const totalStudents = students.length
  const totalCompletionProgress = students.reduce((acc, s) => acc + calculateStudentOverallProgress(s, submissions, assessments), 0)
  const averageCompletion = totalStudents > 0 ? Math.round(totalCompletionProgress / totalStudents) : 0

  // Calculate real metrics from database state
  const totalRevenue = econ?.actualRevenue || econ?.feePayments?.reduce((acc: number, p: any) => acc + (p.amountPaid || 0), 0) || 0
  const totalExpenditure = econ?.expenditures?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0) || 0
  const netMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenditure) / totalRevenue) * 100) : 0

  return {
    totalStudents,
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
    totalCourses: Array.isArray(courses) ? courses.length : 0,
    activeEnrollments: Array.isArray(students) ? students.filter(s => s && s.status === 'active').length : 0,
    revenue: totalRevenue,
    revenueChange: econ?.revenueChange || 0,
    newEnrollments: econ?.newEnrollments || newEnrollments,
    completionRate: averageCompletion,
    netMargin: netMargin || econ?.netMargin || 0,
    libraryCount: Array.isArray(questions) ? questions.length : 0
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
  const [activities, setActivities] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { user } = useAuth()
  const isRefreshingRef = useRef(false)
  const retryCountRef = useRef(0)
  const [, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return
    
    // Safety Audit: Only sync if we have a stable identity OR we are on a landing page
    const isLandingPage = typeof window !== 'undefined' && 
      (window.location.pathname === '/' || window.location.pathname === '/student')
      
    if (!isLandingPage && (!user?.id || !user?.role)) {
      setIsLoading(false)
      setIsInitialized(true)
      return
    }
    
    isRefreshingRef.current = true
    setIsLoading(true)

    try {
      // We don't reset hasError here to avoid flickering if it's already set
      // setHasError(false)
      
      const [initRes, econData] = await Promise.all([
        getInitialData(user?.id, user?.role as any),
        getEconomicStats().catch(() => ({ success: false, data: null }))
      ])

      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.error || "Institutional link failure")
      }

      // Success! Reset the retry counter
      retryCountRef.current = 0
      setErrorMsg(null)

      startTransition(() => {
        const d = initRes.data
        setTeachers(Array.isArray(d.teachers) ? d.teachers : [])
        setStudents(Array.isArray(d.students) ? d.students : [])
        setCourses(Array.isArray(d.courses) ? d.courses : [])
        setQuestions(Array.isArray(d.questions) ? d.questions : [])
        setAssessments(Array.isArray(d.assessments) ? d.assessments : [])
        setSubmissions(Array.isArray(d.submissions) ? d.submissions : [])
        setSchedules(Array.isArray(d.schedules) ? d.schedules : [])
        setAssignments(Array.isArray(d.assignments) ? d.assignments : [])
        setEnrollments(Array.isArray(d.enrollments) ? d.enrollments : [])
        setActivities(Array.isArray(d.activities) ? d.activities : [])
        setAttendance(Array.isArray(d.attendance) ? d.attendance : [])
        
        if (econData && econData.success) {
          setEconomics(econData.data)
          setFeePayments(econData.data?.feePayments || [])
        }
        
        setEvaluations(Array.isArray(d.evaluations) ? d.evaluations : [])
      })
    } catch (err) {
      console.error('[DataProvider] SYNC_FAILURE:', err)
      
      if (retryCountRef.current < 2) {
        retryCountRef.current++
        console.log(`[DataProvider] Attempting automated recovery (${retryCountRef.current}/2)...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        isRefreshingRef.current = false // Allow the retry call to proceed
        return refresh()
      }

      setErrorMsg((err as any)?.message || "Automatic synchronization failed after retries.")
      toast.error("Institutional Link Disrupted")
    } finally {
      setIsInitialized(true)
      setIsLoading(false)
      isRefreshingRef.current = false
    }
  }, [user?.id, user?.role])

  const retryConnection = useCallback(async () => {
    setHasError(false)
    retryCountRef.current = 0
    await refresh()
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(() => {
    if (!isInitialized) return {
      totalStudents: 0, totalTeachers: 0, totalCourses: 0, activeEnrollments: 0,
      revenue: 0, revenueChange: 0, newEnrollments: 0, completionRate: 0, netMargin: 0
    }
    return computeStats(teachers, students, courses, submissions, assessments, economics, questions)
  }, [teachers, students, courses, submissions, assessments, economics, questions, isInitialized])

  const executeAction = useCallback(async (
    action: () => Promise<any>, 
    successMsg?: string, 
    errorMsg?: string
  ) => {
    try {
      const result = await action()
      if (result && typeof result === 'object' && 'success' in result && !result.success) {
        throw new Error(result.error || 'Operation failed')
      }
      await refresh()
      if (successMsg) toast.success(successMsg)
      return result
    } catch (err: any) {
      // Prioritize the error message from the server action if available
      const specificError = err.message || 'Registry sync failed'
      console.error('[DataProvider] ACTION_ERROR:', err)
      toast.error(errorMsg || specificError)
      await refresh()
      throw err
    }
  }, [refresh])

  // --- Wrapper Actions ---
  const addTeacher = useCallback((t: Teacher) => executeAction(() => dbAddTeacher(t), "Teacher added"), [executeAction])
  const updateTeacherStatus = useCallback((id: string, status: any) => executeAction(() => dbUpdateTeacherStatus(id, status)), [executeAction])
  const removeTeacher = useCallback((id: string) => executeAction(() => dbRemoveTeacher(id), "Teacher removed"), [executeAction])
  const enrollStudent = useCallback((s: any) => executeAction(() => dbEnrollStudent(s), "Student enrolled"), [executeAction])
  const removeStudent = useCallback((id: string) => executeAction(() => dbRemoveStudent(id), "Student registry purged"), [executeAction])
  const updateStudentStatus = useCallback((id: string, s: any) => executeAction(() => dbUpdateStudentStatus(id, s)), [executeAction])
  const updateStudent = useCallback((id: string, d: any) => executeAction(() => dbUpdateStudent(id, d), "Profile updated"), [executeAction])
  const updateStudentSuccessMetrics = useCallback((id: string, p: number, g?: string) => executeAction(() => dbUpdateStudentSuccessMetrics(id, p, user?.id || '', g)), [executeAction, user?.id])
  const addCourse = useCallback((c: Course) => executeAction(() => dbAddCourse(c), "Course created"), [executeAction])
  const removeCourse = useCallback((id: string) => executeAction(() => dbRemoveCourse(id), "Course deleted"), [executeAction])
  const updateCourseStatus = useCallback((id: string, s: any) => executeAction(() => dbUpdateCourseStatus(id, s)), [executeAction])
  const updateCourse = useCallback((id: string, d: any) => executeAction(() => dbUpdateCourse(id, d), "Curriculum updated"), [executeAction])
  const updateCourseProgress = useCallback((id: string, p: number) => setCourses(prev => prev.map(c => c.id === id ? { ...c, enrolled: p } : c)), [])
  const addQuestion = useCallback((q: Question) => executeAction(() => dbAddQuestion(q), "Block added"), [executeAction])
  const deleteQuestion = useCallback((id: string) => executeAction(() => dbDeleteQuestion(id), "Block removed"), [executeAction])
  const updateQuestion = useCallback((id: string, d: any) => executeAction(() => dbUpdateQuestion(id, d), "Block updated"), [executeAction])
  const publishAssessment = useCallback((a: any) => executeAction(() => dbPublishAssessment(a), "Assessment published"), [executeAction])
  const updateAssessmentStatus = useCallback((id: string, s: any) => executeAction(() => dbUpdateAssessmentStatus(id, s)), [executeAction])
  const removeAssessment = useCallback((id: string) => executeAction(() => dbRemoveAssessment(id), "Permanently deleted"), [executeAction])
  const updateTeacherReviewFlag = useCallback((id: string, f: boolean) => executeAction(() => dbUpdateTeacherReviewFlag(id, f)), [executeAction])
  const approveQuestion = useCallback((id: string, f: boolean) => executeAction(() => dbApproveQuestion(id, f)), [executeAction])
  const approveAssessment = useCallback((id: string) => executeAction(() => updateAssessmentReviewAction(id, 'active'), "Approved"), [executeAction])
  const rejectAssessment = useCallback((id: string, f: string) => executeAction(() => updateAssessmentReviewAction(id, 'draft', f), "Sent back"), [executeAction])
  const submitTestResult = useCallback((r: StudentTest) => executeAction(() => dbSubmitTestResult(r, assessments.find(a => a.id === r.templateId)?.title || 'Test'), "Results stored"), [assessments, executeAction])
  const gradeSubmission = useCallback((id: string, g: number, f: string) => executeAction(() => dbGradeSubmission(id, g, f), "Score recorded"), [executeAction])
  const addSchedule = useCallback((s: Schedule) => executeAction(() => dbAddSchedule(s), "Schedule updated"), [executeAction])
  const updateSchedule = useCallback((id: string, d: any) => executeAction(() => dbUpdateSchedule(id, d)), [executeAction])
  const removeSchedule = useCallback((id: string) => executeAction(() => dbRemoveSchedule(id)), [executeAction])
  const addExpenditure = useCallback((d: any) => executeAction(() => dbAddExpenditure(d)), [executeAction])
  const recordPayment = useCallback((id: string, a: number) => executeAction(() => dbRecordPayment(id, a), "Payment captured"), [executeAction])
  const addFeeAccount = useCallback((d: any) => executeAction(() => dbAddFeeAccount(d), "Account initialized"), [executeAction])
  const updateClassFee = useCallback((id: string, a: number) => executeAction(() => dbUpdateClassFee(id, a), "Fee modified"), [executeAction])
  const updateTeacherProfile = useCallback((id: string, d: any) => executeAction(() => dbUpdateTeacher(id, d)), [executeAction])
  const logActivity = useCallback((a: string, c: string) => executeAction(() => dbLogActivity(user?.name || 'Admin', a, c)), [executeAction, user?.name])
  const markAttendance = useCallback((tid: string, date: string, s: string, sc?: number) => executeAction(() => dbMarkAttendance(tid, date, s, sc)), [executeAction])
  const addAttendanceEvent = useCallback((tid: string, date: string, e: any) => executeAction(() => dbAddAttendanceEvent(tid, date, e)), [executeAction])
  const saveEvaluations = useCallback((courseId: string, data: any[]) => executeAction(() => dbSaveEvaluations(courseId, data), "Evaluation Matrix Synchronized"), [executeAction])

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-8">
        <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <div className="h-6 w-6 text-destructive">⚠️</div>
        </div>
        <h2 className="text-2xl font-serif mb-2">Institutional Link Disrupted</h2>
        <p className="text-muted-foreground mb-4 max-w-xs mx-auto">Unable to synchronize with the registry.</p>
        <div className="p-4 bg-muted/50 rounded-xl border border-border mb-8 max-w-md">
            <p className="text-[10px] font-mono text-destructive uppercase tracking-widest mb-1 opacity-50">Diagnostic Trace</p>
            <p className="text-xs font-medium">{errorMsg}</p>
        </div>
        <button onClick={retryConnection} className="bg-primary text-white px-6 py-2 rounded-xl text-xs uppercase tracking-widest font-normal hover:bg-primary/90 transition-all shadow-premium mb-3 w-48">Retry Connection</button>
        <button onClick={() => window.location.reload()} className="bg-background text-foreground border border-border px-6 py-2 rounded-xl text-xs uppercase tracking-widest font-normal hover:bg-muted transition-all w-48">Reload Portal</button>
      </div>
    )
  }

  // Stability Guard: Strictly block rendering until data is ready
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
           <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Syncing Registry Blocks...</p>
        </div>
      </div>
    )
  }

  return (
    <DataContext.Provider value={{
      teachers, students, courses, assignments, submissions, stats, schedules, questions, assessments, economics, feePayments, enrollments, activities, attendance, evaluations, isInitialized, isLoading, errorMsg,
      enrollStudent, removeStudent, updateStudentStatus, updateStudent, updateStudentSuccessMetrics, publishAssessment, updateAssessmentStatus, removeAssessment, submitTestResult, gradeSubmission, updateCourseProgress, addQuestion, deleteQuestion, updateQuestion, addTeacher, updateTeacherStatus, removeTeacher, addCourse, updateCourseStatus, updateCourse, removeCourse, addSchedule, updateSchedule, removeSchedule, addExpenditure, recordPayment, addFeeAccount, updateClassFee, updateTeacher: updateTeacherProfile, updateTeacherReviewFlag, approveQuestion, approveAssessment, rejectAssessment, logActivity, markAttendance, addAttendanceEvent, saveEvaluations, resetToDefaults: () => {}, refresh, retryConnection,
    }}>
      {children}
    </DataContext.Provider>
  )
}

/**
 * Universal Sanitization Layer
 * Ensures all entity properties are safe for UI rendering even if null in DB
 */
function sanitize<T>(data: any, type: 'teacher' | 'student' | 'course' | 'question' | 'assessment' | 'submission'): T[] {
  if (!Array.isArray(data)) return []
  
  return data.map(item => {
    if (!item) return item

    const base = { ...item }

    switch (type) {
      case 'student':
      case 'teacher':
        base.name = base.name || (type === 'student' ? 'Unknown Candidate' : 'Professional Faculty')
        base.avatar = base.avatar || ''
        break
      case 'course':
        base.name = base.name || 'Untitled Batch'
        base.instructorName = base.instructorName || 'Unassigned'
        break
      case 'assessment':
        base.title = base.title || 'Untitled Assessment'
        base.classLevels = Array.isArray(base.classLevels) ? base.classLevels : ['Foundation']
        base.nature = base.nature || 'Mixed'
        break
      case 'question':
        base.content = base.content || 'Content Pending Audit'
        base.options = Array.isArray(base.options) ? base.options : []
        break
    }
    return base as T
  })
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) throw new Error('useData must be used within a DataProvider')
  
  // Safe Consumption Layer
  return {
    ...context,
    teachers: sanitize<Teacher>(context.teachers, 'teacher'),
    students: sanitize<Student>(context.students, 'student'),
    courses: sanitize<Course>(context.courses, 'course'),
    questions: sanitize<Question>(context.questions, 'question'),
    assessments: sanitize<AssessmentTemplate>(context.assessments, 'assessment'),
    submissions: Array.isArray(context.submissions) ? context.submissions : [],
    schedules: Array.isArray(context.schedules) ? context.schedules : [],
    assignments: Array.isArray(context.assignments) ? context.assignments : [],
    enrollments: Array.isArray(context.enrollments) ? context.enrollments : [],
    feePayments: Array.isArray(context.feePayments) ? context.feePayments : [],
    activities: Array.isArray(context.activities) ? context.activities : [],
    attendance: Array.isArray(context.attendance) ? context.attendance : [],
    evaluations: Array.isArray(context.evaluations) ? context.evaluations : [],
    isInitialized: !!context.isInitialized,
  }
}
