'use server'

import db from '@/lib/db'
import type { AssessmentTemplate } from '@/lib/types'

export async function getAssessments() {
  return db.assessmentTemplate.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function publishAssessment(assessment: Omit<AssessmentTemplate, 'id' | 'createdAt'>) {
  const accessCode = assessment.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase()
  return db.assessmentTemplate.create({ data: { ...assessment, accessCode } as any })
}

export async function removeAssessment(id: string) {
  return db.assessmentTemplate.delete({ where: { id } })
}
