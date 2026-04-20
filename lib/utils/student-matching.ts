import { normalizeAcademicLevel, normalizeTiming } from './normalization'

/**
 * Universal Bridging Logic: Student-Course Matching
 * 
 * Determines if a student belongs to a specific course based on:
 * 1. Formal Enrollment (Explicit ID match in array)
 * 2. Logical Assignment (Academic Tier + Session Timing match)
 */
export function isStudentInCourse(student: Student, course: Course): boolean {
  if (!student || !course) return false

  // Gate 1: Formal Linkage (Immutable Database Record)
  const hasFormalLink = (student.enrolledCourses || []).includes(course.id)
  if (hasFormalLink) return true

  // Gate 2: Logical Affinity (Heuristic Matching)
  const studentLevel = normalizeAcademicLevel(student.grade || '')
  const courseLevel = normalizeAcademicLevel(course.level || '')
  
  // Direct match or partial overlaps (e.g., '1' in 'foundation1')
  const levelMatch = studentLevel === courseLevel || 
                    (studentLevel.length > 0 && courseLevel.includes(studentLevel)) ||
                    (courseLevel.length > 0 && studentLevel.includes(courseLevel))

  // Timing Normalization
  const studentTime = normalizeTiming(student.classTiming || '')
  const courseTime = normalizeTiming(course.schedule || '')

  const scheduleMatch = studentTime === courseTime

  return levelMatch && scheduleMatch
}
