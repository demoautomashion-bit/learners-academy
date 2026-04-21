import { normalizeAcademicLevel, normalizeTiming } from './normalization'

/**
 * Universal Bridging Logic: Student-Course Matching
 * 
 * Determines if a student belongs to a specific course based on:
 * 1. Formal Enrollment (Explicit ID match in array)
 * 2. Logical Assignment (Academic Tier + Session Timing match)
 */
export function isStudentInCourse(student: any, course: any): boolean {
  if (!student || !course) return false

  // Gate 1: Formal Linkage (Primary Database Record)
  // Ensure we check for existence of enrolledCourses array
  if (Array.isArray(student.enrolledCourses) && student.enrolledCourses.includes(course.id)) {
    return true
  }

  // Gate 2: Logical Affinity (Heuristic Matching for unlinked records)
  // Normalizing levels: "Level One" -> "1", "Foundation 1" -> "foundation1"
  const studentLevel = normalizeAcademicLevel(student.grade || student.level || '')
  const courseLevel = normalizeAcademicLevel(course.level || course.title || '')
  
  if (!studentLevel || !courseLevel) return false

  // Direct level match
  const levelMatch = studentLevel === courseLevel || 
                    studentLevel.includes(courseLevel) ||
                    courseLevel.includes(studentLevel)

  // Timing Normalization: "04:00 PM - 05:00 PM" -> "04:00pm-05:00pm"
  const studentTime = normalizeTiming(student.classTiming || student.timing || student.schedule || '')
  const courseTime = normalizeTiming(course.schedule || course.timing || '')

  // Special Case: If both are empty, we don't match on timing
  if (!studentTime || !courseTime) return false

  const scheduleMatch = studentTime === courseTime || 
                        studentTime.includes(courseTime) || 
                        courseTime.includes(studentTime)

  return levelMatch && scheduleMatch
}
