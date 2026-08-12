export interface TLAGradeResult {
  grade: string
  performance: string
  isPass: boolean
  remark: string
}

export const TLA_GRADING_REMARKS_POOLS: Record<string, { performance: string; remarks: string[] }> = {
  'A+': {
    performance: 'Outstanding',
    remarks: [
      'Outstanding result.',
      'Excellent achievement.',
      'Exceptional performance.',
      'Keep up the excellent work.'
    ]
  },
  'A': {
    performance: 'Excellent',
    remarks: [
      'Excellent result.',
      'Very well done.',
      'Strong performance.',
      'Keep up the good work.'
    ]
  },
  'B+': {
    performance: 'Very Good',
    remarks: [
      'Very good result.',
      'Well done.',
      'Consistent effort.',
      'Keep progressing.'
    ]
  },
  'B': {
    performance: 'Good',
    remarks: [
      'Good result.',
      'Good overall performance.',
      'Keep improving.',
      'Steady progress.'
    ]
  },
  'C+': {
    performance: 'Satisfactory',
    remarks: [
      'Satisfactory result.',
      'Good effort.',
      'Continue improving.',
      'More effort will help.'
    ]
  },
  'C': {
    performance: 'Fair',
    remarks: [
      'Fair result.',
      'Passed; keep improving.',
      'More practice needed.',
      'Aim higher next term.'
    ]
  },
  'D+': {
    performance: 'Needs Improvement',
    remarks: [
      'Needs improvement.',
      'More effort required.',
      'Work harder next term.',
      'Focus on weak areas.'
    ]
  },
  'D': {
    performance: 'Minimum Pass',
    remarks: [
      'Minimum pass achieved.',
      'Passed; improvement needed.',
      'More practice required.',
      'Needs consistent effort.'
    ]
  },
  'E+': {
    performance: 'Below Standard',
    remarks: [
      'Below standard.',
      'Significant improvement needed.',
      'Needs greater effort.',
      'Focus and practice more.'
    ]
  },
  'E': {
    performance: 'Poor',
    remarks: [
      'Poor performance.',
      'Major improvement needed.',
      'Serious effort required.',
      'Needs close attention.'
    ]
  },
  'F': {
    performance: 'Fail',
    remarks: [
      'Failed.',
      'Course repeat advised.',
      'Retake recommended.',
      'Below required standard.'
    ]
  }
}

export function getTLAGrading(percentage: number): TLAGradeResult {
  let grade = 'F'
  if (percentage >= 85) grade = 'A+'
  else if (percentage >= 80) grade = 'A'
  else if (percentage >= 75) grade = 'B+'
  else if (percentage >= 70) grade = 'B'
  else if (percentage >= 65) grade = 'C+'
  else if (percentage >= 60) grade = 'C'
  else if (percentage >= 55) grade = 'D+'
  else if (percentage >= 50) grade = 'D'
  else if (percentage >= 45) grade = 'E+'
  else if (percentage >= 40) grade = 'E'
  else grade = 'F'

  const tier = TLA_GRADING_REMARKS_POOLS[grade]
  const isPass = percentage >= 50

  // Randomly pick one remark from the pool
  const randomIndex = Math.floor(Math.random() * tier.remarks.length)
  const remark = tier.remarks[randomIndex]

  return {
    grade,
    performance: tier.performance,
    isPass,
    remark
  }
}
