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
  
  return val.toLowerCase()
    .replace(/level\s*/g, '') // Remove "level" prefix/infix
    .replace(/grade\s*/g, '') // Remove "grade" prefix/infix
    .split(/\s+/)
    .map(word => {
      const numberMap: Record<string, string> = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8',
        'nine': '9', 'ten': '10'
      }
      
      // Convert number words to digits
      if (numberMap[word]) return numberMap[word]
      
      // Strip common suffixes from numbers (1st -> 1, 2nd -> 2)
      return word.replace(/^(\d+)(st|nd|rd|th)$/, '$1')
    })
    .filter(Boolean)
    .join('')
    .replace(/[^a-z0-9]/g, '') // Pure alphanumeric for final comparison
    .trim()
}

export const normalizeTiming = (t: string) => {
  if (!t) return ''
  // 1. Lowercase and remove all spaces/dots/special chars
  let cleaned = t.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
  
  // 2. Remove leading zeros from hours globally (e.g., 08:00-09:00 -> 8:00-9:00)
  cleaned = cleaned.replace(/(^|[^0-9])0(\d:)/g, '$1$2')
  
  return cleaned
}
