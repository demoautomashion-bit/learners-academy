/**
 * Institutional Trimester Registry
 * Single source of truth for the academy's four-term academic year.
 *
 * Summer → June 5    – September 4
 * Autumn → September 5 – December 4
 * Winter → December 5  – March 4  (spans two calendar years)
 * Spring → March 5   – June 4
 */

export type TrimesterSeason = 'Spring' | 'Summer' | 'Autumn' | 'Winter'

export interface Trimester {
  season: TrimesterSeason
  year: number
  label: string        // e.g. "Summer 2026"
  shortLabel: string   // e.g. "Summer '26"
  range: string        // e.g. "Jun 5 – Sep 4"
  start: Date
  end: Date
  filterKey: string    // e.g. "summer"
}

const RANGE_LABELS: Record<TrimesterSeason, string> = {
  Spring: 'Mar 5 – Jun 4',
  Summer: 'Jun 5 – Sep 4',
  Autumn: 'Sep 5 – Dec 4',
  Winter: 'Dec 5 – Mar 4',
}

const SEASON_ORDER: TrimesterSeason[] = ['Spring', 'Summer', 'Autumn', 'Winter']

/**
 * Build a Trimester object for a given season and year.
 * 'year' is always the year the term STARTS in.
 * Winter is the only cross-year term: starts Dec 5 of 'year', ends Mar 4 of 'year+1'.
 */
export function buildTrimester(season: TrimesterSeason, year: number): Trimester {
  let start: Date
  let end: Date

  switch (season) {
    case 'Spring':
      start = new Date(year, 2, 5, 0, 0, 0, 0)         // Mar 5
      end   = new Date(year, 5, 4, 23, 59, 59, 999)     // Jun 4
      break
    case 'Summer':
      start = new Date(year, 5, 5, 0, 0, 0, 0)          // Jun 5
      end   = new Date(year, 8, 4, 23, 59, 59, 999)     // Sep 4
      break
    case 'Autumn':
      start = new Date(year, 8, 5, 0, 0, 0, 0)          // Sep 5
      end   = new Date(year, 11, 4, 23, 59, 59, 999)    // Dec 4
      break
    case 'Winter':
      start = new Date(year, 11, 5, 0, 0, 0, 0)         // Dec 5 of 'year'
      end   = new Date(year + 1, 2, 4, 23, 59, 59, 999) // Mar 4 of 'year+1'
      break
  }

  return {
    season,
    year,
    label: `${season} ${year}`,
    shortLabel: `${season} '${String(year).slice(2)}`,
    range: RANGE_LABELS[season],
    start,
    end,
    filterKey: season.toLowerCase(),
  }
}

/**
 * Returns all four Trimester objects for a given year, in calendar order.
 */
export function getTrimesters(year: number): Trimester[] {
  return SEASON_ORDER.map((season) => buildTrimester(season, year))
}

/**
 * Returns the Trimester that contains the given date (defaults to today).
 * Accounts for the 5th-of-the-month boundaries.
 *
 * Boundaries:
 *   Spring  → Mar 5  to Jun 4
 *   Summer  → Jun 5  to Sep 4
 *   Autumn  → Sep 5  to Dec 4
 *   Winter  → Dec 5  to Mar 4  (year assigned = year Dec starts)
 */
export function getActiveTrimester(date?: Date): Trimester {
  const d = date ?? new Date()
  const month = d.getMonth() // 0-indexed
  const day   = d.getDate()
  const year  = d.getFullYear()

  // Jan, Feb → Winter that started Dec of previous year
  if (month === 0 || month === 1) {
    return buildTrimester('Winter', year - 1)
  }

  // Mar 1-4 → still Winter (started Dec of previous year)
  if (month === 2 && day < 5) {
    return buildTrimester('Winter', year - 1)
  }

  // Mar 5 – Jun 4 → Spring
  if (month === 2 || month === 3 || month === 4) {
    return buildTrimester('Spring', year)
  }
  if (month === 5 && day < 5) {
    return buildTrimester('Spring', year)
  }

  // Jun 5 – Sep 4 → Summer
  if (month === 5 || month === 6 || month === 7) {
    return buildTrimester('Summer', year)
  }
  if (month === 8 && day < 5) {
    return buildTrimester('Summer', year)
  }

  // Sep 5 – Dec 4 → Autumn
  if (month === 8 || month === 9 || month === 10) {
    return buildTrimester('Autumn', year)
  }
  if (month === 11 && day < 5) {
    return buildTrimester('Autumn', year)
  }

  // Dec 5 – Dec 31 → Winter (starts this year)
  return buildTrimester('Winter', year)
}

/**
 * Returns a sorted list of Trimester objects spanning from one year ago
 * to two years ahead — useful for populating dropdowns.
 */
export function getTrimesterList(): Trimester[] {
  const now = new Date()
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]
  const list: Trimester[] = []

  years.forEach((year) => {
    SEASON_ORDER.forEach((season) => {
      list.push(buildTrimester(season, year))
    })
  })

  // Sort by start date ascending
  return list.sort((a, b) => a.start.getTime() - b.start.getTime())
}

/**
 * Returns { start, end } Date objects for a given season and year.
 */
export function getTrimesterDateRange(
  season: TrimesterSeason,
  year: number
): { start: Date; end: Date } {
  const { start, end } = buildTrimester(season, year)
  return { start, end }
}

/**
 * Given a filterKey (e.g. "summer") and a year, returns the date range.
 * Returns null if the key is not a valid trimester season.
 */
export function getDateRangeFromFilterKey(
  key: string,
  year: number
): { start: Date; end: Date } | null {
  const season = SEASON_ORDER.find((s) => s.toLowerCase() === key.toLowerCase())
  if (!season) return null
  return getTrimesterDateRange(season, year)
}

/**
 * Returns how many days remain in the given trimester from today.
 * Returns 0 if the trimester has already ended.
 */
export function getDaysRemaining(trimester: Trimester): number {
  const now = new Date()
  if (now > trimester.end) return 0
  const diff = trimester.end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * A date is "within" a trimester if it falls between start and end (inclusive).
 */
export function isWithinTrimester(date: Date | string, trimester: Trimester): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d >= trimester.start && d <= trimester.end
}

export { SEASON_ORDER, RANGE_LABELS }
