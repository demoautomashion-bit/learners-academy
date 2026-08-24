export const CARD_TEMPLATE_TIERS = [
  {
    id: 'pre-foundation-lvl-5',
    label: 'Pre Foundation - Level 5',
    levels: [
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
      'Speaking Class',
      'Grammar Speaking Class',
      'IELTS Preparation Course'
    ]
  },
  {
    id: 'lvl-6-lvl-advanced',
    label: 'Level 6 - Level Advanced',
    levels: [
      'Level Six',
      'Level Advanced'
    ]
  },
  {
    id: 'professional-advanced',
    label: 'Professional Advanced',
    levels: [
      'Professional Advanced'
    ]
  }
] as const

export function getTierForLevel(level: string): string {
  const matched = CARD_TEMPLATE_TIERS.find(t => (t.levels as readonly string[]).includes(level))
  return matched ? matched.id : 'pre-foundation-lvl-5' // Default fallback
}

export function isAdvancedOrSpecialCourse(levelOrTitle?: string): boolean {
  if (!levelOrTitle) return false
  const levelLower = levelOrTitle.toLowerCase()
  if (
    levelLower.includes('level 6') ||
    levelLower.includes('level six') ||
    levelLower.includes('advanced') ||
    levelLower.includes('professional') ||
    levelLower.includes('special')
  ) {
    return true
  }
  const tier = getTierForLevel(levelOrTitle)
  return tier === 'lvl-6-lvl-advanced' || tier === 'professional-advanced'
}

