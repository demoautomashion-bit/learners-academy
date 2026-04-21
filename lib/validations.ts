import { z } from 'zod'

// --- Base Schemas ---
const DateSchema = z.union([z.date(), z.string().datetime(), z.string()]).transform((val) => {
  if (val instanceof Date) return val.toISOString()
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  } catch {
    return new Date().toISOString()
  }
})

// --- Entity Schemas ---
export const TeacherSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default('N/A'),
  employeeId: z.string(),
  subjects: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  joinedAt: DateSchema,
  coursesCount: z.number().default(0),
  studentsCount: z.number().default(0),
})

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default('N/A'),
  enrolledCourses: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'graduated']).catch('active'),
  enrolledAt: DateSchema,
  progress: z.number().min(0).max(100).default(0).catch(0),
  grade: z.string().optional().default('N/A').catch('N/A'),
})

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.string().default('beginner'),
  teacherId: z.string(),
  teacherName: z.string().default('Unassigned'),
  capacity: z.number().min(1).default(30).catch(30),
  enrolled: z.number().default(0).catch(0),
  status: z.enum(['active', 'draft', 'completed', 'archived', 'inactive']).catch('draft'),
  startDate: DateSchema,
  endDate: DateSchema,
  feeAmount: z.number().default(0),
})

export const SubmissionSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  submittedAt: DateSchema,
  status: z.enum(['pending', 'graded', 'late']).default('pending'),
  grade: z.number().optional(),
})

export const RegistrySchema = z.object({
  teachers: z.array(TeacherSchema).default([]),
  students: z.array(StudentSchema).default([]),
  courses: z.array(CourseSchema).default([]),
  submissions: z.array(SubmissionSchema).default([]),
  questions: z.array(z.any()).default([]),
  assessments: z.array(z.any()).default([]),
  assignments: z.array(z.any()).default([]),
})
