/**
 * Universal Normalization Central
 * Shared logic for string comparison across Admin, Teacher, and Core Data Engine.
 */

/**
 * Normalizes academic level strings for comparison.
 * Processes each word independently to avoid corrupting composite names
 * like "Foundation One" (where "one" inside "foundation" must not be replaced).
 */
export const normalizeAcademicLevel = (val: string) => {
  if (!val) return ''
  // Normalize each word independently — prevents "foundationone" → "foundati1"
  return val.toLowerCase()
    .split(/\s+/)
    .map(word => {
      if (word === 'level') return ''
      if (word === 'one') return '1'
      if (word === 'two') return '2'
      if (word === 'three') return '3'
      if (word === 'four') return '4'
      if (word === 'five') return '5'
      if (word === 'six') return '6'
      // Strip ordinal suffixes from standalone words (e.g. "1st" → "1")
      return word.replace(/(st|nd|rd|th)$/, '')
    })
    .filter(Boolean) // remove empty strings (from "level" → "")
    .join('')
    .trim()
}

/**
 * Normalizes timing strings for comparison.
 * Simple approach: lowercase and strip all whitespace/dots.
 * Both sides (student and course) go through this identically,
 * so minor format differences cancel out automatically.
 */
export const normalizeTiming = (t: string) => {
  if (!t) return ''
  return t.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
}
