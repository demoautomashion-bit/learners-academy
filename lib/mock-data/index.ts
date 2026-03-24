import type { Teacher, Student, Course, Assignment, Submission, DashboardStats, ChartData, Schedule, Question, AssessmentTemplate, StudentTest } from '@/lib/types'

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@learnersacademy.com',
    phone: '+92 300 1234567',
    employeeId: 'EMP-101',
    subjects: ['English', 'Literature'],
    qualifications: ['MA English', 'TEFL'],
    status: 'active',
    joinedAt: '2023-01-15',
    coursesCount: 2,
    studentsCount: 24,
  }
]

export const mockStudents: Student[] = [
  { id: 'S-001', studentId: 'S-001', name: 'Zaid Khan', email: 'zaid@mail.com', guardianName: 'Ahmed Khan', phone: '0300-1112223', enrolledCourses: ['C-101'], status: 'active', progress: 75, grade: 'A', enrolledAt: '2024-01-10', classTiming: '3:00 PM - 4:00 PM' },
  { id: 'S-002', studentId: 'S-002', name: 'Ayesha Bibi', email: 'ayesha@mail.com', guardianName: 'Bilal Ahmed', phone: '0300-4445556', enrolledCourses: ['C-101'], status: 'active', progress: 82, grade: 'A-', enrolledAt: '2024-01-12', classTiming: '3:00 PM - 4:00 PM' },
  { id: 'S-003', studentId: 'S-003', name: 'Osman Ali', email: 'osman@mail.com', guardianName: 'Sajid Ali', phone: '0300-7778889', enrolledCourses: ['C-102'], status: 'active', progress: 65, grade: 'B+', enrolledAt: '2024-01-15', classTiming: '4:00 PM - 5:00 PM' },
  { id: 'S-004', studentId: 'S-004', name: 'Fatima Zahra', email: 'fatima@mail.com', guardianName: 'Yasin Shah', phone: '0300-9990001', enrolledCourses: ['C-102'], status: 'active', progress: 90, grade: 'A+', enrolledAt: '2024-01-20', classTiming: '4:00 PM - 5:00 PM' },
  { id: 'S-005', studentId: 'S-005', name: 'Hamza Malik', email: 'hamza@mail.com', guardianName: 'Malik Khan', phone: '0300-2223334', enrolledCourses: ['C-101'], status: 'active', progress: 70, grade: 'B', enrolledAt: '2024-02-01', classTiming: '3:00 PM - 4:00 PM' },
]

export const mockCourses: Course[] = [
  {
    id: 'C-101',
    title: 'Foundation One (F-01)',
    description: 'Basics of English grammar and conversation.',
    level: 'beginner',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Ahmed',
    capacity: 20,
    enrolled: 12,
    status: 'active',
    schedule: 'Mon, Wed, Fri',
    duration: '3 Months',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    roomNumber: 'R-01',
  },
  {
    id: 'C-102',
    title: 'Advanced Fluency (A-01)',
    description: 'Advanced linguistics and public speaking.',
    level: 'advanced',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Ahmed',
    capacity: 15,
    enrolled: 8,
    status: 'active',
    schedule: 'Tue, Thu',
    duration: '4 Months',
    startDate: '2024-03-01',
    endDate: '2024-07-01',
    roomNumber: 'R-03',
  }
]

export const mockAssignments: Assignment[] = []

export const mockSubmissions: Submission[] = [
  { id: 'sub-1', assignmentId: 'test-1', assignmentTitle: 'Mid-term Grammar', studentId: 'S-001', studentName: 'Zaid Khan', submittedAt: '2024-03-15', status: 'graded', grade: 90 },
  { id: 'sub-2', assignmentId: 'test-1', assignmentTitle: 'Mid-term Grammar', studentId: 'S-002', studentName: 'Ayesha Bibi', submittedAt: '2024-03-15', status: 'graded', grade: 84 },
  { id: 'sub-3', assignmentId: 'test-2', assignmentTitle: 'Final Vocabulary', studentId: 'S-003', studentName: 'Osman Ali', submittedAt: '2024-03-20', status: 'pending' },
]

export const mockDashboardStats: DashboardStats = {
  totalStudents: 25,
  totalTeachers: 5,
  totalCourses: 12,
  activeEnrollments: 45,
  revenue: 125000,
  revenueChange: 12,
  newEnrollments: 8,
  completionRate: 88,
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

export const mockAssessments: AssessmentTemplate[] = [
  {
    id: 'test-1',
    title: 'Mid-term Grammar',
    phase: 'First Test',
    classLevels: ['Foundation One'],
    nature: 'MCQ',
    totalMarks: 50,
    durationMinutes: 60,
    createdAt: '2024-03-01',
    status: 'active',
    accessCode: 'GRM101',
  },
  {
    id: 'test-2',
    title: 'Final Vocabulary',
    phase: 'Last Test',
    classLevels: ['Advanced Fluency'],
    nature: 'Mixed',
    totalMarks: 100,
    durationMinutes: 120,
    createdAt: '2024-03-10',
    status: 'active',
    accessCode: 'VOC202',
  }
]

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  progress: number
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
}

export const mockEnrollments: Enrollment[] = []
