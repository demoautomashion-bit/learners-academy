import type { Teacher, Student, Course, Assignment, Submission, DashboardStats, ChartData, Schedule, Question, AssessmentTemplate, StudentTest } from '@/lib/types'

export const mockTeachers: Teacher[] = []

export const mockStudents: Student[] = []

export const mockCourses: Course[] = []

export const mockAssignments: Assignment[] = []

export const mockSubmissions: Submission[] = []

export const mockDashboardStats: DashboardStats = {
  totalStudents: 0,
  totalTeachers: 0,
  totalCourses: 0,
  activeEnrollments: 0,
  revenue: 0,
  revenueChange: 0,
  newEnrollments: 0,
  completionRate: 0,
}

export const mockEnrollmentTrend: ChartData[] = []

export const mockRevenueData: ChartData[] = []

export const mockCoursePopularity: ChartData[] = []

// Helper function to get teacher by ID
export function getTeacherById(id: string): Teacher | undefined {
  return mockTeachers.find(t => t.id === id)
}

// Helper function to get student by ID
export function getStudentById(id: string): Student | undefined {
  return mockStudents.find(s => s.id === id)
}

// Helper function to get course by ID
export function getCourseById(id: string): Course | undefined {
  return mockCourses.find(c => c.id === id)
}

// Helper function to get assignments by course
export function getAssignmentsByCourse(courseId: string): Assignment[] {
  return mockAssignments.filter(a => a.courseId === courseId)
}

// Helper function to get submissions by assignment
export function getSubmissionsByAssignment(assignmentId: string): Submission[] {
  return mockSubmissions.filter(s => s.assignmentId === assignmentId)
}

// Helper function to get student's submissions
export function getStudentSubmissions(studentId: string): Submission[] {
  return mockSubmissions.filter(s => s.studentId === studentId)
}

export const mockSchedules: Schedule[] = []

export const mockQuestions: Question[] = []

export const mockAssessments: AssessmentTemplate[] = []

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  progress: number
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
}

export const mockEnrollments: Enrollment[] = []
