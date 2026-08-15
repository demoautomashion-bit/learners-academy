export function generateTranscriptNumber(
  level: 'Level Six' | 'Advanced' | string,
  sequenceNumber: number = 1,
  date: Date = new Date()
): string {
  const normLevel = (level || '').toLowerCase().trim()
  const isL6 = normLevel.includes('6') || normLevel.includes('six')
  const prefix = isL6 ? 'TLA-L6' : 'TLA-ADV'

  const seqStr = String(sequenceNumber).padStart(3, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${prefix}-${seqStr}-T/${month}/${year}`
}
