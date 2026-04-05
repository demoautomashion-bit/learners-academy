import { Student, Submission, AssessmentTemplate } from '../types'

/**
 * Institutional Progress Calculation Utility
 * Shared across Admin (Audits) and Teacher (Registry) portals
 * 
 * Future: Add pagination and performance optimizations for large student sets
 */

export function calculateStudentOverallProgress(
  student: Student,
  allSubmissions: Submission[],
  allAssessments: AssessmentTemplate[]
): number {
  const studentSubmissions = allSubmissions.filter(s => s.studentId === student.id)
  if (studentSubmissions.length === 0) return 0

  // Only count graded or completed submissions
  const completedCount = studentSubmissions.filter(s => s.status === 'graded').length
  
  // Find assessments applicable to student's enrolled levels/courses
  const relevantAssessments = allAssessments.filter(a => 
    (a.courseIds && a.courseIds.some(cid => student.enrolledCourses.includes(cid))) ||
    (a.classLevels && a.classLevels.some(level => student.classTiming?.includes(level))) // Fallback for legacy
  )
  
  if (relevantAssessments.length === 0) return 0

  return Math.round((completedCount / relevantAssessments.length) * 100)
}

export function calculateStudentAverageGrade(
  student: Student,
  allSubmissions: Submission[],
  allAssessments: AssessmentTemplate[]
): number {
  const gradedSubmissions = allSubmissions.filter(s => 
    s.studentId === student.id && 
    s.status === 'graded' && 
    s.grade !== undefined
  )

  if (gradedSubmissions.length === 0) return 0

  let totalPercentage = 0
  gradedSubmissions.forEach(sub => {
    const assessment = allAssessments.find(a => a.id === sub.assignmentId)
    if (assessment && assessment.totalMarks > 0) {
      totalPercentage += (sub.grade! / assessment.totalMarks) * 100
    }
  })

  return Math.round(totalPercentage / gradedSubmissions.length)
}

export function getInstitutionalGrade(percentage: number): string {
  if (percentage >= 85) return 'A+'
  if (percentage >= 75) return 'A'
  if (percentage >= 65) return 'B'
  if (percentage >= 55) return 'C'
  if (percentage >= 45) return 'D'
  if (percentage >= 40) return 'E'
  return 'F'
}
