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
