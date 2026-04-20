/**
 * Universal Normalization Central
 * Shared logic for string comparison across Admin, Teacher, and Core Data Engine.
 */

export const normalizeAcademicLevel = (val: string) => {
  if (!val) return ''
  return val.toLowerCase()
    .replace(/\s+/g, '')           // Remove all whitespace
    .replace(/level/g, '')         // Remove the word 'level'
    .replace(/one/g, '1')          // Standardize numeric 'One'
    .replace(/two/g, '2')
    .replace(/three/g, '3')
    .replace(/four/g, '4')
    .replace(/five/g, '5')
    .replace(/st/g, '')            // Remove ordinal suffixes
    .replace(/nd/g, '')
    .replace(/rd/g, '')
    .replace(/th/g, '')
    .trim()
}

export const normalizeTiming = (t: string) => {
  if (!t) return ''
  // 1. Basic normalization (lowercase, strip whitespace and dots)
  const base = t.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
  
  // 2. Harden time segments (handle 06:00 vs 6:00)
  // We look for any digit that is a '0' at the start of a segment (either start of string or after a non-digit like :)
  return base.replace(/(^|[^0-9])0([0-9])/g, '$1$2')
}
