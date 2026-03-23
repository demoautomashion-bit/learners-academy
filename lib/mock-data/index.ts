import type { Teacher, Student, Course, Assignment, Submission, DashboardStats, ChartData, Schedule, Question, AssessmentTemplate, StudentTest } from '@/lib/types'

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Sarah Williams',
    email: 'sarah.williams@learnersacademy.com',
    phone: '+92 300 1234567',
    employeeId: 'EMP-001',
    subjects: ['Grammar', 'Writing', 'Literature'],
    qualifications: ['MA English Literature', 'TEFL Certified'],
    status: 'active',
    joinedAt: '2023-01-15',
    coursesCount: 4,
    studentsCount: 48,
    assignedClass: 'Level One',
  },
  {
    id: 'teacher-2',
    name: 'Michael Brown',
    email: 'michael.brown@learnersacademy.com',
    phone: '+92 301 2345678',
    employeeId: 'EMP-002',
    subjects: ['Speaking', 'Pronunciation', 'Conversation'],
    qualifications: ['PhD Linguistics', 'Cambridge CELTA'],
    status: 'active',
    joinedAt: '2023-03-20',
    coursesCount: 3,
    studentsCount: 36,
    assignedClass: 'Speaking Class',
  },
  {
    id: 'teacher-3',
    name: 'Emily Chen',
    email: 'emily.chen@learnersacademy.com',
    phone: '+92 302 3456789',
    employeeId: 'EMP-003',
    subjects: ['Business English', 'Academic Writing'],
    qualifications: ['MBA', 'TESOL Diploma'],
    status: 'active',
    joinedAt: '2023-06-10',
    coursesCount: 2,
    studentsCount: 24,
    assignedClass: 'IELTS Preparation Course',
  },
  {
    id: 'teacher-4',
    name: 'James Wilson',
    email: 'james.wilson@learnersacademy.com',
    phone: '+92 303 4567890',
    employeeId: 'EMP-004',
    subjects: ['IELTS Prep', 'TOEFL Prep'],
    qualifications: ['MA Applied Linguistics', 'British Council Certified'],
    status: 'inactive',
    joinedAt: '2022-09-01',
    coursesCount: 0,
    studentsCount: 0,
  },
]

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 111-2222',
    enrolledCourses: ['course-1', 'course-3'],
    status: 'active',
    enrolledAt: '2024-01-10',
    progress: 75,
    grade: 'A',
  },
  {
    id: 'student-2',
    name: 'Jessica Martinez',
    email: 'jessica.m@email.com',
    phone: '+1 (555) 222-3333',
    enrolledCourses: ['course-1'],
    status: 'active',
    enrolledAt: '2024-01-15',
    progress: 60,
    grade: 'B+',
  },
  {
    id: 'student-3',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 333-4444',
    enrolledCourses: ['course-2', 'course-4'],
    status: 'active',
    enrolledAt: '2024-02-01',
    progress: 45,
    grade: 'B',
  },
  {
    id: 'student-4',
    name: 'Amanda Johnson',
    email: 'amanda.j@email.com',
    phone: '+1 (555) 444-5555',
    enrolledCourses: ['course-1', 'course-2'],
    status: 'active',
    enrolledAt: '2024-02-10',
    progress: 90,
    grade: 'A+',
  },
  {
    id: 'student-5',
    name: 'Robert Thompson',
    email: 'robert.t@email.com',
    phone: '+1 (555) 555-6666',
    enrolledCourses: ['course-3'],
    status: 'inactive',
    enrolledAt: '2023-09-01',
    progress: 100,
    grade: 'A',
  },
  {
    id: 'student-6',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 666-7777',
    enrolledCourses: ['course-4', 'course-5'],
    status: 'active',
    enrolledAt: '2024-03-01',
    progress: 30,
    grade: 'B-',
  },
]

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'English Fundamentals',
    description: 'A comprehensive course covering essential English grammar, vocabulary, and basic communication skills for beginners.',
    level: 'beginner',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Williams',
    capacity: 25,
    enrolled: 22,
    status: 'active',
    schedule: 'Mon, Wed, Fri - 9:00 AM',
    duration: '12 weeks',
    startDate: '2024-01-08',
    endDate: '2024-04-05',
    milestones: [
      { id: 'm1', title: 'Midterm Assessment', date: '2024-02-15', completed: true, type: 'exam' },
      { id: 'm2', title: 'Final Project Submission', date: '2024-03-28', completed: false, type: 'project' },
      { id: 'm3', title: 'Course Review', date: '2024-04-02', completed: false, type: 'review' },
    ]
  },
  {
    id: 'course-2',
    title: 'Conversational English',
    description: 'Focus on speaking fluency, pronunciation, and real-world conversation skills with native speakers.',
    level: 'intermediate',
    teacherId: 'teacher-2',
    teacherName: 'Michael Brown',
    capacity: 20,
    enrolled: 18,
    status: 'active',
    schedule: 'Tue, Thu - 2:00 PM',
    duration: '8 weeks',
    startDate: '2024-02-01',
    endDate: '2024-03-28',
  },
  {
    id: 'course-3',
    title: 'Business English Mastery',
    description: 'Professional English communication for the corporate world, including presentations, meetings, and email writing.',
    level: 'advanced',
    teacherId: 'teacher-3',
    teacherName: 'Emily Chen',
    capacity: 15,
    enrolled: 12,
    status: 'active',
    schedule: 'Mon, Wed - 6:00 PM',
    duration: '10 weeks',
    startDate: '2024-01-15',
    endDate: '2024-03-25',
  },
  {
    id: 'course-4',
    title: 'IELTS Preparation Intensive',
    description: 'Comprehensive IELTS preparation covering all four modules: Listening, Reading, Writing, and Speaking.',
    level: 'intermediate',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Williams',
    capacity: 20,
    enrolled: 20,
    status: 'active',
    schedule: 'Sat, Sun - 10:00 AM',
    duration: '6 weeks',
    startDate: '2024-02-10',
    endDate: '2024-03-24',
  },
  {
    id: 'course-5',
    title: 'Creative Writing Workshop',
    description: 'Explore your creativity through various writing styles, storytelling techniques, and literary analysis.',
    level: 'advanced',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Williams',
    capacity: 12,
    enrolled: 8,
    status: 'active',
    schedule: 'Fri - 4:00 PM',
    duration: '8 weeks',
    startDate: '2024-03-01',
    endDate: '2024-04-26',
  },
  {
    id: 'course-6',
    title: 'English for Kids',
    description: 'Fun and engaging English lessons designed for young learners aged 6-12.',
    level: 'beginner',
    teacherId: 'teacher-2',
    teacherName: 'Michael Brown',
    capacity: 15,
    enrolled: 10,
    status: 'draft',
    schedule: 'Sat - 9:00 AM',
    duration: '16 weeks',
    startDate: '2024-04-01',
    endDate: '2024-07-20',
  },
]

export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'Grammar Basics Quiz',
    description: 'Complete the quiz on parts of speech and sentence structure.',
    courseId: 'course-1',
    courseName: 'English Fundamentals',
    teacherId: 'teacher-1',
    dueDate: '2024-03-15',
    status: 'active',
    submissionsCount: 18,
    totalStudents: 22,
    createdAt: '2024-03-01',
  },
  {
    id: 'assignment-2',
    title: 'Presentation Practice',
    description: 'Record a 5-minute presentation on a topic of your choice.',
    courseId: 'course-2',
    courseName: 'Conversational English',
    teacherId: 'teacher-2',
    dueDate: '2024-03-20',
    status: 'active',
    submissionsCount: 12,
    totalStudents: 18,
    createdAt: '2024-03-05',
  },
  {
    id: 'assignment-3',
    title: 'Business Email Writing',
    description: 'Write three professional emails for different business scenarios.',
    courseId: 'course-3',
    courseName: 'Business English Mastery',
    teacherId: 'teacher-3',
    dueDate: '2024-03-18',
    status: 'active',
    submissionsCount: 10,
    totalStudents: 12,
    createdAt: '2024-03-08',
  },
  {
    id: 'assignment-4',
    title: 'IELTS Practice Test 1',
    description: 'Complete the full IELTS practice test and submit your answers.',
    courseId: 'course-4',
    courseName: 'IELTS Preparation Intensive',
    teacherId: 'teacher-1',
    dueDate: '2024-03-12',
    status: 'closed',
    submissionsCount: 20,
    totalStudents: 20,
    createdAt: '2024-02-28',
  },
]

export const mockSubmissions: Submission[] = [
  {
    id: 'submission-1',
    assignmentId: 'assignment-1',
    assignmentTitle: 'Grammar Basics Quiz',
    studentId: 'student-1',
    studentName: 'Michael Chen',
    submittedAt: '2024-03-10T14:30:00Z',
    status: 'graded',
    grade: 95,
    feedback: 'Excellent work! Great understanding of grammar concepts.',
  },
  {
    id: 'submission-2',
    assignmentId: 'assignment-1',
    assignmentTitle: 'Grammar Basics Quiz',
    studentId: 'student-2',
    studentName: 'Jessica Martinez',
    submittedAt: '2024-03-12T10:15:00Z',
    status: 'graded',
    grade: 88,
    feedback: 'Good effort. Review verb tenses for improvement.',
  },
  {
    id: 'submission-3',
    assignmentId: 'assignment-2',
    assignmentTitle: 'Presentation Practice',
    studentId: 'student-3',
    studentName: 'David Kim',
    submittedAt: '2024-03-18T16:45:00Z',
    status: 'pending',
  },
  {
    id: 'submission-4',
    assignmentId: 'assignment-3',
    assignmentTitle: 'Business Email Writing',
    studentId: 'student-4',
    studentName: 'Amanda Johnson',
    submittedAt: '2024-03-17T09:00:00Z',
    status: 'graded',
    grade: 92,
    feedback: 'Professional tone and excellent structure. Minor formatting suggestions provided.',
  },
]

export const mockDashboardStats: DashboardStats = {
  totalStudents: 156,
  totalTeachers: 12,
  totalCourses: 18,
  activeEnrollments: 234,
  revenue: 48500,
  revenueChange: 12.5,
  newEnrollments: 24,
  completionRate: 87,
}

export const mockEnrollmentTrend: ChartData[] = [
  { name: 'Jan', value: 45, students: 45 },
  { name: 'Feb', value: 52, students: 52 },
  { name: 'Mar', value: 48, students: 48 },
  { name: 'Apr', value: 61, students: 61 },
  { name: 'May', value: 55, students: 55 },
  { name: 'Jun', value: 67, students: 67 },
]

export const mockRevenueData: ChartData[] = [
  { name: 'Jan', value: 12500 },
  { name: 'Feb', value: 15200 },
  { name: 'Mar', value: 13800 },
  { name: 'Apr', value: 18400 },
  { name: 'May', value: 16900 },
  { name: 'Jun', value: 21300 },
]

export const mockCoursePopularity: ChartData[] = [
  { name: 'Pre-Foundation', value: 22, enrolled: 22 },
  { name: 'IELTS Prep', value: 20, enrolled: 20 },
  { name: 'Beginners', value: 18, enrolled: 18 },
  { name: 'Level One', value: 12, enrolled: 12 },
  { name: 'Level Advanced', value: 8, enrolled: 8 },
]

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

export const mockSchedules: Schedule[] = [
  {
    id: 'schedule-1',
    classTitle: 'Level One',
    teacherName: 'Sarah Williams',
    timing: '08:00 AM - 09:00 AM',
    roomNumber: '101',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    id: 'schedule-2',
    classTitle: 'Speaking Class',
    teacherName: 'Michael Brown',
    timing: '10:00 AM - 11:00 AM',
    roomNumber: '102',
    days: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'schedule-3',
    classTitle: 'IELTS Preparation Course',
    teacherName: 'Emily Chen',
    timing: '02:00 PM - 03:00 PM',
    roomNumber: '205',
    days: ['Tue', 'Thu'],
  },
]

export const mockQuestions: Question[] = [
  {
    id: 'q-1',
    category: 'Grammar',
    type: 'MCQ',
    content: 'Which of the following is an example of the Present Perfect tense?',
    options: ['I went to the store.', 'I have gone to the store.', 'I am going to the store.', 'I will go to the store.'],
    correctAnswer: 'I have gone to the store.',
    phase: 'First Test',
  },
  {
    id: 'q-2',
    category: 'Vocab & Idioms',
    type: 'MCQ',
    content: 'What does the idiom "piece of cake" mean?',
    options: ['Something very easy.', 'Something delicious.', 'A small portion.', 'A complex task.'],
    correctAnswer: 'Something very easy.',
    phase: 'First Test',
  },
  {
    id: 'q-3',
    category: 'Reading',
    type: 'Subjective',
    content: 'Read the text and summarize the main argument in your own words.',
    phase: 'Last Test',
  },
  {
    id: 'q-4',
    category: 'Grammar',
    type: 'MCQ',
    content: 'Identify the passive voice sentence.',
    options: ['The cat chased the mouse.', 'The mouse was chased by the cat.', 'The cat is chasing the mouse.', 'The cat will chase the mouse.'],
    correctAnswer: 'The mouse was chased by the cat.',
    phase: 'Last Test',
  },
]

export const mockAssessments: AssessmentTemplate[] = [
  {
    id: 'test-1',
    title: 'Mid-term Assessment 2024',
    phase: 'First Test',
    classLevels: ['Level One', 'Level Two'],
    nature: 'Mixed',
    totalMarks: 50,
    durationMinutes: 60,
    createdAt: '2024-03-01',
    status: 'active',
  },
]

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  progress: number
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
}

export const mockEnrollments: Enrollment[] = [
  // Entries for student-1 / s1 (same student, aliased for the two different pages)
  { id: 'enr-1', studentId: 's1',       courseId: 'course-1', progress: 75, enrolledAt: '2024-01-10', status: 'active' },
  { id: 'enr-2', studentId: 's1',       courseId: 'course-3', progress: 40, enrolledAt: '2024-01-10', status: 'active' },
  { id: 'enr-3', studentId: 'student-1', courseId: 'course-1', progress: 75, enrolledAt: '2024-01-10', status: 'active' },
  { id: 'enr-4', studentId: 'student-1', courseId: 'course-3', progress: 40, enrolledAt: '2024-01-10', status: 'active' },
  { id: 'enr-5', studentId: 'student-2', courseId: 'course-1', progress: 60, enrolledAt: '2024-01-15', status: 'active' },
  { id: 'enr-6', studentId: 'student-3', courseId: 'course-2', progress: 45, enrolledAt: '2024-02-01', status: 'active' },
  { id: 'enr-7', studentId: 'student-3', courseId: 'course-4', progress: 45, enrolledAt: '2024-02-01', status: 'active' },
  { id: 'enr-8', studentId: 'student-4', courseId: 'course-1', progress: 90, enrolledAt: '2024-02-10', status: 'active' },
  { id: 'enr-9', studentId: 'student-4', courseId: 'course-2', progress: 88, enrolledAt: '2024-02-10', status: 'active' },
  { id: 'enr-10', studentId: 'student-5', courseId: 'course-3', progress: 100, enrolledAt: '2023-09-01', status: 'completed' },
  { id: 'enr-11', studentId: 'student-6', courseId: 'course-4', progress: 30, enrolledAt: '2024-03-01', status: 'active' },
  { id: 'enr-12', studentId: 'student-6', courseId: 'course-5', progress: 20, enrolledAt: '2024-03-01', status: 'active' },
]
