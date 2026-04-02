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
  joinedAt: Date | string
  coursesCount: number
  studentsCount: number
  assignedClass?: string
  employeePassword?: string
  requiresReview?: boolean
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
  enrolledAt: Date | string
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
  startDate: Date | string
  endDate: Date | string
  roomNumber?: string
  thumbnail?: string
  feeAmount: number
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
  dueDate: Date | string
  status: 'active' | 'closed' | 'draft'
  submissionsCount: number
  totalStudents: number
  createdAt: Date | string
}

export interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  studentId: string
  studentName: string
  submittedAt: Date | string
  status: 'pending' | 'graded' | 'late'
  grade?: number
  feedback?: string
  fileUrl?: string
  // AI Audit & Persistence
  randomizedQuestions?: Question[]
  answers?: Record<string, string>
  aiFeedback?: string
  aiJustification?: string
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
  slotId?: string
}

export type QuestionCategory = 'Grammar' | 'Vocab & Idioms' | 'Listening' | 'Reading' | 'Speaking' | 'Writing'
export type QuestionType = 'MCQ' | 'Subjective' | 'True/False' | 'Fill in the Blanks' | 'Writing' | 'Matching' | 'Reading' | 'Listening'

export interface Question {
  id: string
  category: QuestionCategory
  type: QuestionType
  content: string
  options?: string[] // For MCQ and True/False
  correctAnswer?: string
  imageUrl?: string
  phase: 'First Test' | 'Last Test' | 'Both'
  passageText?: string   // For Reading: passage shown above question
  audioUrl?: string      // For Listening: audio clip URL
  matchPairs?: { left: string; right: string }[] // For Matching: column pairs
  isApproved: boolean
}

export interface AssessmentTemplate {
  id: string
  title: string
  phase: 'First Test' | 'Last Test'
  classLevels: string[]
  nature: 'MCQ' | 'Subjective' | 'Mixed' | 'True/False' | 'Fill in the Blanks' | 'Writing' | 'Matching' | 'Reading' | 'Listening'
  totalMarks: number
  durationMinutes: number
  questionCount: number
  createdAt: string
  status: 'active' | 'draft' | 'archived' | 'pending_review'
  accessCode: string
  adminFeedback?: string
  submittedByTeacherId?: string
  submittedByTeacherName?: string
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

export interface TeacherAttendance {
  id: string
  teacherId: string
  date: Date | string
  status: 'Present' | 'Absent' | 'Late' | 'Leave'
  substituteCount: number
  note?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Expenditure {
  id: string
  amount: number
  category: string
  description: string
  date: Date | string
  createdAt: Date | string
}

export interface FeePayment {
  id: string
  studentId: string
  courseId: string
  amountPaid: number
  totalAmount: number
  status: 'Paid' | 'Partial' | 'Unpaid'
  paymentDate?: Date | string
  updatedAt: Date | string
  createdAt: Date | string
}
