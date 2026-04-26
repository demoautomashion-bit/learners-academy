/**
 * Seasonal Term Utility System
 * Based on the 3-month cycle:
 * - Spring: Mar, Apr, May
 * - Summer: Jun, Jul, Aug
 * - Autumn: Sep, Oct, Nov
 * - Winter: Dec, Jan, Feb
 */

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter'

export interface Term {
    season: Season
    year: number
    label: string
    id: string
}

export function getTermFromDate(date: Date): Term {
    const month = date.getMonth()
    const year = date.getFullYear()
    
    let season: Season
    let termYear = year

    if (month >= 2 && month <= 4) {
        season = 'Spring'
    } else if (month >= 5 && month <= 7) {
        season = 'Summer'
    } else if (month >= 8 && month <= 10) {
        season = 'Autumn'
    } else {
        season = 'Winter'
        // If it's Jan or Feb, it's actually the winter term that started in Dec of previous year
        // But we label it by the year it ends/is in.
        // Actually, let's keep it simple: Dec 2025, Jan 2026, Feb 2026 are "Winter 2026"
        if (month === 11) termYear = year + 1
    }

    return {
        season,
        year: termYear,
        label: `${season} ${termYear}`,
        id: `${season.toLowerCase()}-${termYear}`
    }
}

export function getTermList(): Term[] {
    const terms: Term[] = []
    const now = new Date()
    
    // Generate terms for the next 5 years (approx 20 terms)
    // Starting from 1 year ago to catch current and recent past, up to 4 years ahead
    let current = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    
    for (let i = 0; i < 24; i++) {
        const term = getTermFromDate(current)
        
        // Strictly exclude 2025 as requested
        if (term.year !== 2025 && !terms.find(t => t.id === term.id)) {
            terms.push(term)
        }
        
        // Advance 3 months
        current = new Date(current.getFullYear(), current.getMonth() + 3, 1)
    }
    
    // Sort terms by year and season
    return terms.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        const seasons: Season[] = ['Winter', 'Spring', 'Summer', 'Autumn']
        return seasons.indexOf(a.season) - seasons.indexOf(b.season)
    })
}

export function getDatesForTerm(termId: string): { start: Date, end: Date } {
    const [season, yearStr] = termId.split('-')
    const year = parseInt(yearStr)
    
    let startMonth: number
    let startYear = year

    switch (season) {
        case 'spring': startMonth = 2; break
        case 'summer': startMonth = 5; break
        case 'autumn': startMonth = 8; break
        case 'winter': 
            startMonth = 11
            startYear = year - 1
            break
        default: startMonth = 0
    }

    const start = new Date(startYear, startMonth, 1)
    const end = new Date(startYear, startMonth + 3, 0) // Last day of 3rd month
    
    return { start, end }
}
