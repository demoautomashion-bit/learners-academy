'use server'

import db from '@/lib/db'
import type { AssessmentTemplate } from '@/lib/types'

export async function getAssessments() {
  return db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function publishAssessment(assessment: Omit<AssessmentTemplate, 'id' | 'createdAt'>) {
  // Check for uniqueness if an access code is provided
  if (assessment.accessCode) {
    const existing = await db.assessmentTemplate.findFirst({
      where: { 
        accessCode: assessment.accessCode,
        status: 'active'
      }
    })
    if (existing) {
      throw new Error(`Token "${assessment.accessCode}" is already in use by another active assessment. Please choose a different one.`)
    }
  }

  const accessCode = assessment.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase()
  return db.assessmentTemplate.create({ 
    data: { 
      id: `test-${Date.now()}`,
      title: assessment.title,
      phase: assessment.phase,
      classLevels: assessment.classLevels,
      nature: assessment.nature,
      totalMarks: assessment.totalMarks,
      durationMinutes: assessment.durationMinutes,
      status: assessment.status || 'active',
      accessCode: accessCode,
      createdAt: new Date()
    } 
  })
}

export async function removeAssessment(id: string) {
  return db.assessmentTemplate.delete({ where: { id } })
}
