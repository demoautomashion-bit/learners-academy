import type { Student, Course } from '@/lib/types'

/**
 * Universal Bridging Logic: Student-Course Matching
 * 
 * Determines if a student belongs to a specific course based on:
 * 1. Formal Enrollment (Explicit ID match in array)
 * 2. Logical Assignment (Academic Tier + Session Timing match)
 */
export function isStudentInCourse(student: Student, course: Course): boolean {
  if (!student || !course) return false

  // Gate 1: Formal Linkage
  const hasFormalLink = (student.enrolledCourses || []).includes(course.id)
  if (hasFormalLink) return true

  // Gate 2: Logical Affinity
  // Normalization included to resolve variations in level strings
  const normalize = (val: string) => (val || '').toLowerCase().replace(/\s+/g, '').trim()
  
  const studentLevel = normalize(student.grade || '')
  const courseLevel = normalize(course.level || '')
  const levelMatch = studentLevel === courseLevel || 
                    (studentLevel.includes('level1') && courseLevel.includes('levelone')) ||
                    (studentLevel.includes('levelone') && courseLevel.includes('level1'))

  const scheduleMatch = normalize(student.classTiming || '') === normalize(course.schedule || '')

  return levelMatch && scheduleMatch
}
