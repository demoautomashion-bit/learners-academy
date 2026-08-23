'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Submission, StudentTest, ActionResult } from '@/lib/types'
import { isStudentInCourse } from '../utils/student-matching'

export async function getSubmissions(): Promise<ActionResult<Submission[]>> {
  try {
    const data = await db.submission.findMany({ orderBy: { submittedAt: 'desc' } })
    return { success: true, data: data as unknown as Submission[] }
  } catch (error) {
    console.error('DATABASE_ERROR [getSubmissions]:', error)
    return { success: false, error: 'Failed to access submission registry' }
  }
}

async function syncSubmissionToEvaluation(
  studentId: string,
  templateId: string,
  assignmentTitle: string,
  score: number,
  categoryFromSub?: string | null
) {
  try {
    const assessment = await db.assessmentTemplate.findUnique({
      where: { id: templateId },
      select: { courseIds: true, id: true, nature: true, title: true, phase: true, evaluationCategory: true }
    })

    const student = await db.student.findFirst({
      where: {
        OR: [
          { id: studentId },
          { studentId: studentId }
        ]
      }
    })

    if (!student) return

    const canonicalStudentId = student.id

    // 1. Identify Target Courses (3-tier fallback matching)
    let targetCourseIds: string[] = []

    if (assessment && assessment.courseIds && assessment.courseIds.length > 0) {
      const courses = await db.course.findMany({
        where: { id: { in: assessment.courseIds } }
      })
      targetCourseIds = courses.filter(course => isStudentInCourse(student, course)).map(c => c.id)
    }

    if (targetCourseIds.length === 0 && student.enrolledCourses && student.enrolledCourses.length > 0) {
      const courses = await db.course.findMany({
        where: {
          OR: [
            { id: { in: student.enrolledCourses } },
            { title: { in: student.enrolledCourses } }
          ]
        }
      })
      targetCourseIds = courses.map(c => c.id)
    }

    if (targetCourseIds.length === 0) {
      const allCourses = await db.course.findMany()
      targetCourseIds = allCourses.filter(course => isStudentInCourse(student, course)).map(c => c.id)
    }

    if (targetCourseIds.length === 0) return

    // 2. Identify Evaluation Field or Skill JSON key
    const evalCategory = categoryFromSub || assessment?.evaluationCategory || 'None'
    const nature = assessment?.nature || ''
    const title = (assessment?.title || assignmentTitle || '').toLowerCase()
    const phase = assessment?.phase || ''

    // Detect skill key for advanced/professional marksheets
    let skillKey: string | null = null
    const checkSkillStr = `${evalCategory} ${nature} ${title}`.toLowerCase()
    if (checkSkillStr.includes('speaking')) skillKey = 'speaking'
    else if (checkSkillStr.includes('listening')) skillKey = 'listening'
    else if (checkSkillStr.includes('reading')) skillKey = 'reading'
    else if (checkSkillStr.includes('writing') || checkSkillStr.includes('essay')) skillKey = 'writing'
    else if (checkSkillStr.includes('grammar')) skillKey = 'grammar'
    else if (checkSkillStr.includes('spelling')) skillKey = 'spelling'
    else if (checkSkillStr.includes('vocabulary')) skillKey = 'vocabulary'

    const numericScore = Math.round(Number(score) || 0)

    for (const courseId of targetCourseIds) {
      const existingEval = await db.evaluation.findUnique({
        where: {
          studentId_courseId_term: {
            studentId: canonicalStudentId,
            courseId,
            term: "Term 1"
          }
        }
      })

      const existingScoresObj = (existingEval?.scores && typeof existingEval.scores === 'object')
        ? (existingEval.scores as Record<string, any>)
        : {}

      const updatedScoresObj = { ...existingScoresObj }

      if (skillKey) {
        updatedScoresObj[skillKey] = numericScore
      }

      let updateData: Record<string, any> = {
        scores: updatedScoresObj
      }
      let createData: Record<string, any> = {
        studentId: canonicalStudentId,
        courseId,
        term: "Term 1",
        scores: updatedScoresObj
      }

      if (evalCategory === 'Midterm') {
        updateData.midterm = numericScore
        createData.midterm = numericScore
      } else if (evalCategory === 'Final') {
        updateData.final = numericScore
        createData.final = numericScore
      } else {
        // Fallback for standalone/skill tests
        if (phase === 'Last Test' || title.includes('final')) {
          updateData.final = numericScore
          createData.final = numericScore
        } else {
          updateData.midterm = numericScore
          createData.midterm = numericScore
        }
      }

      await db.evaluation.upsert({
        where: {
          studentId_courseId_term: {
            studentId: canonicalStudentId,
            courseId,
            term: "Term 1"
          }
        },
        update: updateData as any,
        create: createData as any
      })
    }
  } catch (syncError) {
    console.error('SYNC_ERROR [syncSubmissionToEvaluation] Evaluation sheet sync failed (submission saved):', syncError)
  }
}

export async function submitTestResult(result: StudentTest, assignmentTitle: string): Promise<ActionResult<Submission>> {
  try {
    const evaluationCategory = result.evaluationCategory || 'None'

    // Resolve target student to obtain canonical DB primary key (CUID)
    const student = await db.student.findFirst({
      where: {
        OR: [
          { id: result.studentId },
          { studentId: result.studentId }
        ]
      }
    })

    const targetStudentId = student?.id || result.studentId
    const targetStudentName = student?.name || result.studentName
    
    // 1. Create the submission record using canonical Student ID
    const res = await db.submission.create({
      data: {
        assignmentId: result.templateId,
        assignmentTitle,
        studentId: targetStudentId,
        studentName: targetStudentName,
        status: 'graded',
        grade: result.score,
        randomizedQuestions: result.randomizedQuestions as any,
        answers: result.answers as any,
        aiFeedback: result.feedback,
        aiJustification: 'AI evaluation complete.',
        evaluationCategory: evaluationCategory,
      }
    })

    // 2. Automated Sync with Evaluation Sheet & Skill JSON
    await syncSubmissionToEvaluation(targetStudentId, result.templateId, assignmentTitle, result.score || 0, evaluationCategory)

    return { success: true, data: res as unknown as Submission }
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
    await syncSubmissionToEvaluation(res.studentId, res.assignmentId, res.assignmentTitle, grade, res.evaluationCategory)

    return { success: true, data: res as unknown as Submission }
  } catch (error) {
    console.error('DATABASE_ERROR [gradeSubmission]:', error)
    return { success: false, error: 'Failed to record institutional score' }
  }
}


