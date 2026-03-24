export * from './auth'

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  subjects: string[]
  qualifications: string[]
  status: 'active' | 'inactive'
  avatar?: string
  joinedAt: string
  coursesCount: number
  studentsCount: number
  assignedClass?: string
  employeePassword?: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  enrolledCourses: string[]
  status: 'active' | 'inactive' | 'graduated'
  avatar?: string
  guardianName?: string
  studentId?: string
  enrolledAt: string
  progress: number
  grade?: string
  classTiming?: string
}

export interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  teacherId: string
  teacherName: string
  capacity: number
  enrolled: number
  status: 'active' | 'draft' | 'completed' | 'archived'
  schedule: string
  duration: string
  startDate: string
  endDate: string
  roomNumber?: string
  thumbnail?: string
  milestones?: {
    id: string
    title: string
    date: string
    completed: boolean
    type: 'quiz' | 'exam' | 'project' | 'review'
  }[]
}

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  teacherId: string
  dueDate: string
  status: 'active' | 'closed' | 'draft'
  submissionsCount: number
  totalStudents: number
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  studentId: string
  studentName: string
  submittedAt: string
  status: 'pending' | 'graded' | 'late'
  grade?: number
  feedback?: string
  fileUrl?: string
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  activeEnrollments: number
  revenue: number
  revenueChange: number
  newEnrollments: number
  completionRate: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface Schedule {
  id: string
  classTitle: string
  teacherName: string
  timing: string
  roomNumber: string
  days: string[]
}

export type QuestionCategory = 'Grammar' | 'Vocab & Idioms' | 'Listening' | 'Reading' | 'Speaking' | 'Writing'
export type QuestionType = 'MCQ' | 'Subjective'

export interface Question {
  id: string
  category: QuestionCategory
  type: QuestionType
  content: string
  options?: string[] // For MCQ
  correctAnswer?: string
  phase: 'First Test' | 'Last Test' | 'Both'
}

export interface AssessmentTemplate {
  id: string
  title: string
  phase: 'First Test' | 'Last Test'
  classLevels: string[]
  nature: 'MCQ' | 'Subjective' | 'Mixed'
  totalMarks: number
  durationMinutes: number
  createdAt: string
  status: 'active' | 'draft' | 'archived'
  accessCode: string
}

export interface StudentTest {
  id: string
  templateId: string
  studentId: string
  studentName: string
  assignedAt: string
  completedAt?: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  randomizedQuestions: Question[]
  answers: Record<string, string>
  score?: number
  feedback?: string
}
