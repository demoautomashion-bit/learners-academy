'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { 
  Teacher, Student, Course, Assignment, Submission, 
  DashboardStats, ChartData, Schedule, Question, 
  AssessmentTemplate, StudentTest 
} from '@/lib/types'

const DATA_STORAGE_KEY = 'learners_academy_data'

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
  
  // Actions
  enrollStudent: (student: Student) => void
  removeStudent: (id: string) => void
  updateStudentStatus: (id: string, status: Student['status']) => void
  publishAssessment: (assessment: AssessmentTemplate) => void
  removeAssessment: (id: string) => void
  submitTestResult: (result: StudentTest) => void
  gradeSubmission: (id: string, grade: number, feedback: string) => void
  updateCourseProgress: (courseId: string, progress: number) => void
  addQuestion: (question: Question) => void
  deleteQuestion: (id: string) => void
  
  // Teachers
  addTeacher: (teacher: Teacher) => void
  updateTeacherStatus: (id: string, status: Teacher['status']) => void
  removeTeacher: (id: string) => void
  
  // Courses
  addCourse: (course: Course) => void
  updateCourseStatus: (id: string, status: Course['status']) => void
  removeCourse: (id: string) => void
  
  // Schedule
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (id: string, updates: Partial<Schedule>) => void
  removeSchedule: (id: string) => void
  
  // Reset
  resetToDefaults: () => void
  isInitialized: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{
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
  }>({
    teachers: [],
    students: [],
    courses: [],
    assignments: [],
    submissions: [],
    stats: { totalStudents: 0, totalTeachers: 0, totalCourses: 0, activeEnrollments: 0, revenue: 0, revenueChange: 0, newEnrollments: 0, completionRate: 0 },
    schedules: [],
    questions: [],
    assessments: [],
    enrollments: [],
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage or mockData
  useEffect(() => {
    const initializeData = () => {
      try {
        const stored = localStorage.getItem(DATA_STORAGE_KEY)
        if (stored) {
          setData(JSON.parse(stored))
          console.log('Restored data from storage')
        } else {
          // Fallback to empty initial state
          const initial = {
            teachers: [],
            students: [],
            courses: [],
            assignments: [],
            submissions: [],
            stats: { totalStudents: 0, totalTeachers: 0, totalCourses: 0, activeEnrollments: 0, revenue: 0, revenueChange: 0, newEnrollments: 0, completionRate: 0 },
            schedules: [],
            questions: [],
            assessments: [],
            enrollments: [],
          }
          setData(initial)
          localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(initial))
          console.log('Initialized with mock data')
        }
      } catch (error) {
        console.error('Failed to initialize data:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [])

  // Persist state changes to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isInitialized])

  // Helper to generate a unique access code for assessments
  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Actions
  const enrollStudent = useCallback((student: Student) => {
    setData(prev => {
      // Create actual enrollment records for each enrolled course ID
      const newEnrollments = student.enrolledCourses.map(courseId => ({
        id: `enr-${Date.now()}-${courseId}`,
        studentId: student.id,
        courseId: courseId,
        enrolledAt: student.enrolledAt,
        progress: 0,
        status: 'active'
      }))

      // Update enrollment counters on the courses
      const updatedCourses = prev.courses.map(course => {
        if (student.enrolledCourses.includes(course.id)) {
          return { ...course, enrolled: (course.enrolled || 0) + 1 }
        }
        return course
      })

      return {
        ...prev,
        students: [...prev.students, student],
        enrollments: [...prev.enrollments, ...newEnrollments],
        courses: updatedCourses,
        stats: {
          ...prev.stats,
          totalStudents: prev.stats.totalStudents + 1
        }
      }
    })
  }, [])

  const removeStudent = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      stats: {
        ...prev.stats,
        totalStudents: Math.max(0, prev.stats.totalStudents - 1)
      }
    }))
  }, [])

  const updateStudentStatus = useCallback((id: string, status: Student['status']) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, status } : s)
    }))
  }, [])

  const publishAssessment = useCallback((assessment: AssessmentTemplate) => {
    const assessmentWithCode = {
      ...assessment,
      accessCode: assessment.accessCode || generateAccessCode()
    }
    setData(prev => ({
      ...prev,
      assessments: [assessmentWithCode, ...prev.assessments]
    }))
  }, [])

  const removeAssessment = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      assessments: prev.assessments.filter(a => a.id !== id)
    }))
  }, [])

  const submitTestResult = useCallback((result: StudentTest) => {
    setData(prev => {
      const template = prev.assessments.find(a => a.id === result.templateId)
      
      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        assignmentId: result.templateId,
        assignmentTitle: template?.title || 'Test',
        studentId: result.studentId,
        studentName: result.studentName,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        grade: result.score,
        // Rich Metadata Persistence
        randomizedQuestions: result.randomizedQuestions,
        answers: result.answers,
        aiFeedback: result.feedback,
        aiJustification: "AI evaluation complete. Reviewing content-aware score."
      }

      return {
        ...prev,
        submissions: [newSubmission, ...prev.submissions],
      }
    })
    
    toast.success('Test submitted successfully')
  }, [])

  const gradeSubmission = useCallback((id: string, grade: number, feedback: string) => {
    setData(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => 
        s.id === id ? { ...s, grade, feedback, status: 'graded' } : s
      )
    }))
    toast.success('Grade published to student')
  }, [])

  const updateCourseProgress = useCallback((courseId: string, progress: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === courseId ? { ...c, progress } : c)
    }))
  }, [])

  const addQuestion = useCallback((question: Question) => {
    setData(prev => ({
      ...prev,
      questions: [question, ...prev.questions]
    }))
  }, [])

  const deleteQuestion = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
  }, [])

  const addTeacher = useCallback((teacher: Teacher) => {
    setData(prev => ({
      ...prev,
      teachers: [...prev.teachers, teacher],
    }))
  }, [])

  const updateTeacherStatus = useCallback((id: string, status: Teacher['status']) => {
    setData(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => t.id === id ? { ...t, status } : t),
    }))
  }, [])

  const removeTeacher = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== id),
    }))
  }, [])

  const addCourse = useCallback((course: Course) => {
    setData(prev => {
      // Increment teacher's course count if a real teacher is assigned
      const updatedTeachers = prev.teachers.map(t => 
        t.id === course.teacherId ? { ...t, coursesCount: (t.coursesCount || 0) + 1 } : t
      )
      
      return {
        ...prev,
        teachers: updatedTeachers,
        courses: [...prev.courses, course],
      }
    })
  }, [])

  const updateCourseStatus = useCallback((id: string, status: Course['status']) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, status } : c),
    }))
  }, [])

  const removeCourse = useCallback((id: string) => {
    setData(prev => {
      const courseToRemove = prev.courses.find(c => c.id === id)
      // Decrement teacher's course count
      const updatedTeachers = prev.teachers.map(t => 
        t.id === courseToRemove?.teacherId ? { ...t, coursesCount: Math.max(0, (t.coursesCount || 0) - 1) } : t
      )

      return {
        ...prev,
        teachers: updatedTeachers,
        courses: prev.courses.filter(c => c.id !== id),
      }
    })
  }, [])

  const addSchedule = useCallback((schedule: Schedule) => {
    setData(prev => ({
      ...prev,
      schedules: [schedule, ...prev.schedules],
    }))
  }, [])

  const updateSchedule = useCallback((id: string, updates: Partial<Schedule>) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.id === id ? { ...s, ...updates } : s),
    }))
  }, [])

  const removeSchedule = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.id !== id),
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(DATA_STORAGE_KEY)
    const initial = {
      teachers: [],
      students: [],
      courses: [],
      assignments: [],
      submissions: [],
      stats: { totalStudents: 0, totalTeachers: 0, totalCourses: 0, activeEnrollments: 0, revenue: 0, revenueChange: 0, newEnrollments: 0, completionRate: 0 },
      schedules: [],
      questions: [],
      assessments: [],
      enrollments: [],
    }
    setData(initial)
    toast.info('Database reset to defaults')
  }, [])

  return (
    <DataContext.Provider value={{
      ...data,
      enrollStudent,
      removeStudent,
      updateStudentStatus,
      publishAssessment,
      removeAssessment,
      submitTestResult,
      updateCourseProgress,
      addQuestion,
      deleteQuestion,
      addTeacher,
      updateTeacherStatus,
      removeTeacher,
      addCourse,
      updateCourseStatus,
      removeCourse,
      addSchedule,
      updateSchedule,
      removeSchedule,
      gradeSubmission,
      resetToDefaults,
      isInitialized,
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
