'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Submission, StudentTest, ActionResult } from '@/lib/types'
import { isStudentInCourse } from '../utils/student-matching'

export async function getSubmissions(): Promise<ActionResult<Submission[]>> {
  try {
    const data = await db.submission.findMany({ orderBy: { submittedAt: 'desc' } })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getSubmissions]:', error)
    return { success: false, error: 'Failed to access submission registry' }
  }
}

export async function submitTestResult(result: StudentTest, assignmentTitle: string): Promise<ActionResult<Submission>> {
  try {
    const evaluationCategory = result.evaluationCategory || 'None'
    
    // 1. Create the submission record
    const res = await db.submission.create({
      data: {
        assignmentId: result.templateId,
        assignmentTitle,
        studentId: result.studentId,
        studentName: result.studentName,
        status: 'graded',
        grade: result.score,
        randomizedQuestions: result.randomizedQuestions as any,
        answers: result.answers as any,
        aiFeedback: result.feedback,
        aiJustification: 'AI evaluation complete.',
        evaluationCategory: evaluationCategory,
      }
    })

    // 2. Automated Sync with Evaluation Sheet (Enhanced with Logical Affinity)
    if (evaluationCategory === 'Midterm' || evaluationCategory === 'Final') {
      const assessment = await db.assessmentTemplate.findUnique({
        where: { id: result.templateId },
        select: { courseIds: true, id: true }
      })

      const student = await db.student.findUnique({
        where: { id: result.studentId }
      })

      if (assessment && student) {
        // Fetch all courses that are linked to this assessment
        const courses = await db.course.findMany({
          where: { id: { in: assessment.courseIds } }
        })

        // Identify target courses where the student belongs (Formal OR Logical)
        const targetCourses = courses
          .filter(course => isStudentInCourse(student, course))
          .map(c => c.id)

        const field = evaluationCategory === 'Midterm' ? 'midterm' : 'final'
        const score = result.score || 0

        // Update Evaluations for all matching courses
        await Promise.all(targetCourses.map(courseId => 
          db.evaluation.upsert({
            where: {
              studentId_courseId_term: {
                studentId: result.studentId,
                courseId: courseId,
                term: "Term 1" // Standardized default
              }
            },
            update: { [field]: score },
            create: {
              studentId: result.studentId,
              courseId: courseId,
              term: "Term 1",
              [field]: score
            }
          })
        ))
      }
    }

    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [submitTestResult]:', error)
    return { success: false, error: 'Failed to commit test results to database' }
  }
}


export async function gradeSubmission(id: string, grade: number, feedback: string): Promise<ActionResult<Submission>> {
  try {
    const res = await db.submission.update({
      where: { id },
      data: { grade, feedback, status: 'graded' }
    })

    // Automated Sync with Evaluation Sheet for manual grading
    if (res.evaluationCategory === 'Midterm' || res.evaluationCategory === 'Final') {
      const assessment = await db.assessmentTemplate.findUnique({
        where: { id: res.assignmentId },
        select: { courseIds: true }
      })

      const student = await db.student.findUnique({
        where: { id: res.studentId }
      })

      if (assessment && student) {
        const courses = await db.course.findMany({
          where: { id: { in: assessment.courseIds } }
        })

        const targetCourses = courses
          .filter(course => isStudentInCourse(student, course))
          .map(c => c.id)

        const field = res.evaluationCategory === 'Midterm' ? 'midterm' : 'final'
        
        await Promise.all(targetCourses.map(courseId => 
          db.evaluation.upsert({
            where: {
              studentId_courseId_term: {
                studentId: res.studentId,
                courseId: courseId,
                term: "Term 1"
              }
            },
            update: { [field]: grade },
            create: {
              studentId: res.studentId,
              courseId: courseId,
              term: "Term 1",
              [field]: grade
            }
          })
        ))
      }
    }

    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [gradeSubmission]:', error)
    return { success: false, error: 'Failed to record institutional score' }
  }
}
