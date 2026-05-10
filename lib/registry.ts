/**
 * Central Institutional Registry
 * This file serves as the SINGLE SOURCE OF TRUTH for class levels, 
 * session timings, and other academic constants.
 */

export const ACADEMY_LEVELS = [
  'Pre-Foundation',
  'Foundation One',
  'Foundation Two',
  'Foundation Three',
  'Beginners',
  'Level One',
  'Level Two',
  'Level Three',
  'Level Four',
  'Level Five',
  'Level Six',
  'Level Advanced',
  'Professional Advanced',
  'Speaking Class',
  'Grammar Speaking Class',
  'IELTS Preparation Course'
] as const

export const SESSION_TIMINGS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM',
  '09:00 PM - 10:00 PM'
] as const

export const SCHEDULE_SLOTS = [
  { id: 'S-01', time: '03:00 PM - 04:00 PM' },
  { id: 'S-02', time: '04:00 PM - 05:00 PM' },
  { id: 'S-03', time: '05:00 PM - 06:00 PM' },
  { id: 'S-04', time: '06:00 PM - 07:00 PM' },
  { id: 'S-05', time: '07:00 PM - 08:00 PM' },
  { id: 'S-06', time: '08:00 PM - 09:00 PM' },
] as const

export const EXPENDITURE_CATEGORIES = [
  'Salaries',
  'Supplies',
  'Marketing',
  'Infrastructure',
  'Utilities',
  'Other'
] as const

export type AcademyLevel = typeof ACADEMY_LEVELS[number]
export type SessionTiming = typeof SESSION_TIMINGS[number]

/**
 * Determines if a class level is considered "Special" (paid monthly)
 * or "Normal" (paid as a 3-month split).
 */
export function isSpecialLevel(level: string): boolean {
  const specialKeywords = ['speaking', 'ielts', 'grammar']
  const normalizedLevel = level.toLowerCase()
  return specialKeywords.some(keyword => normalizedLevel.includes(keyword))
}
