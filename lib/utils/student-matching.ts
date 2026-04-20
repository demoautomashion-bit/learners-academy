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

  // Gate 1: Formal Linkage (Immutable Database Record)
  const hasFormalLink = (student.enrolledCourses || []).includes(course.id)
  if (hasFormalLink) return true

  // Gate 2: Logical Affinity (Heuristic Matching)
  // Advanced normalization to resolve variations in level and timing strings
  const normalize = (val: string) => {
    if (!val) return ''
    return val.toLowerCase()
      .replace(/\s+/g, '')           // Remove all whitespace
      .replace(/level/g, '')         // Remove the word 'level'
      .replace(/one/g, '1')          // Standardize numeric 'One'
      .replace(/two/g, '2')
      .replace(/three/g, '3')
      .replace(/four/g, '4')
      .replace(/five/g, '5')
      .replace(/st/g, '')            // Remove ordinal suffixes
      .replace(/nd/g, '')
      .replace(/rd/g, '')
      .replace(/th/g, '')
      .trim()
  }
  
  const studentLevel = normalize(student.grade || '')
  const courseLevel = normalize(course.level || '')
  
  // Direct match or partial overlaps (e.g., '1' in 'foundation1')
  const levelMatch = studentLevel === courseLevel || 
                    (studentLevel.length > 0 && courseLevel.includes(studentLevel)) ||
                    (courseLevel.length > 0 && studentLevel.includes(courseLevel))

  // Timing Normalization (Removes periods and spaces for AM/PM consistency)
  const normTiming = (t: string) => (t || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
  const scheduleMatch = normTiming(student.classTiming || '') === normTiming(course.schedule || '')

  return levelMatch && scheduleMatch
}
