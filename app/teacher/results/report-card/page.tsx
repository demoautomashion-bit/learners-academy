'use client'

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReportCardA5 } from '@/components/report-card-a5'
import { ReportCardL6A4 } from '@/components/report-card-l6-a4'
import { ReportCardAdvA4 } from '@/components/report-card-adv-a4'
import { generateTranscriptNumber } from '@/lib/utils/transcript-number'
import { isStudentInCourse } from '@/lib/utils/student-matching'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { getTierForLevel } from '@/lib/utils/card-tiers'
import { getTLAGrading } from '@/lib/utils/tla-grading'
import {
  Award, Printer, Save, Download, ArrowLeft, ChevronDown,
  FileImage, FileText, Archive, Users, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import html2canvas from 'html2canvas'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type DownloadFormat = 'pdf' | 'jpg' | 'png' | 'bulk-pdf' | 'bulk-jpg' | 'bulk-png' | 'zip-jpg' | 'bulk-zip-jpg'
type CompletionTier = 'complete' | 'unsaved' | 'incomplete'

interface StudentStatus {
  studentId: string
  name: string
  tier: CompletionTier
}

// ─────────────────────────────────────────────
// Canvas renderer — shared by all download handlers
// ─────────────────────────────────────────────
async function renderStudentCanvas(
  v: Partial<ReportCardValues>,
  studentName: string,
  cardTemplates: any[] = []
): Promise<HTMLCanvasElement> {
  const tierId = getTierForLevel(v.level || '')
  const isA5 = tierId === 'pre-foundation-lvl-5'

  if (isA5) {
    // A5 Landscape canvas resolution (2480 x 1748 px @ 300 DPI or 1754 x 1240)
    const W = 1754
    const H = 1240
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D not supported')

    // 1. Draw A5 Template Image via same-origin Blob to prevent canvas tainting
    let a5ObjUrl: string | null = null
    try {
      const res = await fetch("/result-card-a5-template.png")
      const blob = await res.blob()
      a5ObjUrl = URL.createObjectURL(blob)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, W, H)
          resolve()
        }
        img.onerror = reject
        img.src = a5ObjUrl!
      })
    } catch {
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, 0, 0, W, H)
          resolve()
        }
        img.onerror = reject
        img.src = "/result-card-a5-template.png"
      })
    } finally {
      if (a5ObjUrl) {
        URL.revokeObjectURL(a5ObjUrl)
      }
    }

    // Load Montserrat font for crisp output
    await document.fonts.load('bold 26px "Montserrat"')

    const drawLeftText = (text: string, xPct: number, yPct: number, fontSize = 26) => {
      if (!text) return
      ctx.save()
      ctx.font = `700 ${fontSize}px Montserrat, sans-serif`
      ctx.fillStyle = '#0b192c'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, (xPct / 100) * W, (yPct / 100) * H)
      ctx.restore()
    }

    const drawCenterText = (text: string, xPct: number, yPct: number, fontSize = 24, weight = '700') => {
      if (text === undefined || text === null || text === '') return
      ctx.save()
      ctx.font = `${weight} ${fontSize}px Montserrat, sans-serif`
      ctx.fillStyle = '#0b192c'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(text), (xPct / 100) * W, (yPct / 100) * H)
      ctx.restore()
    }

    // Student Info Overlays
    drawLeftText(v.studentName || studentName || '', 18.8, 38.2, 26)
    drawLeftText(v.fatherName || '', 27.2, 45.3, 26)
    drawLeftText(v.level || '', 21.2, 52.2, 26)
    drawLeftText(v.dateAwarded || v.dateOfIssue || 'June 04, 2026', 18.8, 59.3, 26)

    // Table Obtained Marks (Column Center X = 90.1%)
    const colCenterX = 90.1
    drawCenterText(v.midtermObtained !== undefined ? String(v.midtermObtained) : '', colCenterX, 32.9, 24)
    drawCenterText(v.finalObtained !== undefined ? String(v.finalObtained) : '', colCenterX, 37.9, 24)
    drawCenterText(v.attendanceObtained !== undefined ? String(v.attendanceObtained) : '', colCenterX, 42.9, 24)
    drawCenterText(v.participationObtained !== undefined ? String(v.participationObtained) : '', colCenterX, 47.9, 24)
    drawCenterText(v.disciplineObtained !== undefined ? String(v.disciplineObtained) : '', colCenterX, 52.9, 24)
    drawCenterText(v.extraCurricularObtained !== undefined ? String(v.extraCurricularObtained) : '', colCenterX, 57.9, 24)

    // Grand Total, Percentage, Grade, Remarks
    const grand = v.grandTotalObtained !== undefined && v.grandTotalObtained !== ''
      ? String(v.grandTotalObtained)
      : String(
          (parseFloat(String(v.midtermObtained || 0)) || 0) +
          (parseFloat(String(v.finalObtained || 0)) || 0) +
          (parseFloat(String(v.attendanceObtained || 0)) || 0) +
          (parseFloat(String(v.participationObtained || 0)) || 0) +
          (parseFloat(String(v.disciplineObtained || 0)) || 0) +
          (parseFloat(String(v.extraCurricularObtained || 0)) || 0)
        )
    drawCenterText(grand !== '0' ? grand : '', colCenterX, 62.9, 24, '800')

    const summaryCenterX = 84.8
    const autoPct = grand !== '0' ? ((parseFloat(grand) / 300) * 100).toFixed(1) + '%' : ''
    drawCenterText(v.percentage || autoPct, summaryCenterX, 68.1, 24, '800')
    drawCenterText(v.grade || '', summaryCenterX, 73.1, 24, '800')
    drawCenterText(v.comments || '', summaryCenterX, 78.1, 22, '700')

    return canvas
  }

  const normLevel = (v.level || '').toLowerCase().trim()
  const isL6 = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel === 'level 6' || normLevel === 'l. 6' || normLevel === 'l6'
  const isAdv = normLevel.includes('advanced') || normLevel.includes('adv')

  // A4 Resolution canvas (1240 x 1754 px @ 150 DPI)
  const W = 1240
  const H = 1754
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not supported')

  // Check for custom template background from DB or default to high-res JPG templates
  const customTpl = (cardTemplates || []).find((t: any) => t.level === 'lvl-6-lvl-advanced' || t.level === tierId)
  const customBg = customTpl?.backgroundUrl
  const bgSource = (customBg && customBg.startsWith('data:image/'))
    ? customBg
    : (isL6 ? "/level-6-template.jpg" : "/level-advanced-template.jpg")

  // 1. Draw Template Background safely
  try {
    const img = new Image()
    if (!bgSource.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, W, H)
          resolve()
        } catch (drawErr: any) {
          reject(new Error(`Canvas drawImage failed: ${drawErr?.message || drawErr}`))
        }
      }
      img.onerror = () => reject(new Error(`Failed to load background template image asset from "${bgSource}"`))
      img.src = bgSource
    })
  } catch (e: any) {
    console.error('renderStudentCanvas image loading warning:', e)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
  }

  // Load font safely
  try {
    await document.fonts.load('bold 26px "Montserrat"')
    await document.fonts.load('500 24px "Montserrat"')
  } catch (e) {}

  const drawLeftText = (text: string, xPct: number, yPct: number, fontSize = 24, weight = '500') => {
    if (!text) return
    ctx.save()
    ctx.font = `${weight} ${fontSize}px Montserrat, sans-serif`
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, (xPct / 100) * W, (yPct / 100) * H)
    ctx.restore()
  }

  const drawCenterText = (text: string, xPct: number, yPct: number, fontSize = 24, weight = '700') => {
    if (text === undefined || text === null || text === '') return
    ctx.save()
    ctx.font = `${weight} ${fontSize}px Montserrat, sans-serif`
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(text), (xPct / 100) * W, (yPct / 100) * H)
    ctx.restore()
  }

  // Student Info Overlay Text
  const defaultTrNo = generateTranscriptNumber(isL6 ? 'Level Six' : 'Advanced', 1)
  const nameY = 20.2
  const fatherY = 22.3
  const progY = 24.4
  const dateY = 26.5
  const trY = 28.6

  drawLeftText(v.studentName || studentName || '', 39.0, nameY, 24, '700')
  drawLeftText(v.fatherName || '', 45.5, fatherY, 24, '700')
  drawLeftText(v.level || (isL6 ? 'Level Six' : 'Advanced'), 48.0, progY, 24, '700')
  drawLeftText(v.dateOfCompletion || v.dateOfIssue || '', 52.0, dateY, 24, '700')
  drawLeftText((v as any).transcriptNo || defaultTrNo, 46.5, trY, 24, '700')

  // Obtained Marks Table (Column Center X = 84.7%)
  const colCenterX = 84.7

  drawCenterText((v as any).listeningMarks ?? v.midtermObtained ?? '', colCenterX, 38.8, 25, '700')
  drawCenterText((v as any).speakingMarks ?? v.finalObtained ?? '', colCenterX, 42.6, 25, '700')
  drawCenterText((v as any).readingMarks ?? v.attendanceObtained ?? '', colCenterX, 46.4, 25, '700')
  drawCenterText((v as any).writingMarks ?? v.participationObtained ?? '', colCenterX, 50.2, 25, '700')
  drawCenterText((v as any).grammarMarks ?? v.disciplineObtained ?? '', colCenterX, 53.8, 25, '700')
  drawCenterText((v as any).attendanceMarks ?? '', colCenterX, 57.5, 25, '700')
  drawCenterText((v as any).participationMarks ?? '', colCenterX, 61.2, 25, '700')
  drawCenterText((v as any).disciplineMarks ?? '', colCenterX, 64.9, 25, '700')

  // Grand Total
  const componentsList = [
    (v as any).listeningMarks ?? v.midtermObtained ?? 0,
    (v as any).speakingMarks ?? v.finalObtained ?? 0,
    (v as any).readingMarks ?? v.attendanceObtained ?? 0,
    (v as any).writingMarks ?? v.participationObtained ?? 0,
    (v as any).grammarMarks ?? v.disciplineObtained ?? 0,
    (v as any).attendanceMarks ?? 0,
    (v as any).participationMarks ?? 0,
    (v as any).disciplineMarks ?? 0
  ]
  const calcTotalScore = componentsList.reduce((sum: number, item) => sum + (parseFloat(String(item)) || 0), 0)
  const displayScore = (v as any).totalScore !== undefined && (v as any).totalScore !== '' ? String((v as any).totalScore) : String(calcTotalScore)
  drawCenterText(displayScore !== '0' ? displayScore : '', colCenterX, 68.6, 25, '700')

  // Academic Standing
  const calcPct = calcTotalScore > 0 ? ((calcTotalScore / 600) * 100).toFixed(1) + '%' : ''
  const tlaGrade = getTLAGrading(calcTotalScore > 0 ? (calcTotalScore / 600) * 100 : 0)

  const standY1 = 74.9
  const standY2 = 77.9

  drawLeftText(displayScore !== '0' ? displayScore : '', 43.5, standY1, 23, '700')
  drawLeftText(v.percentage || calcPct, 66.5, standY1, 23, '700')
  drawLeftText(v.grade || tlaGrade.grade, 43.5, standY2, 23, '700')
  drawLeftText(v.comments || tlaGrade.remark, 64.5, standY2, 22, '700')

  return canvas
}

// ─────────────────────────────────────────────
// Build card values for a student (mirrors page.tsx useEffect logic)
// Used by bulk operations — no interactive UI needed
// ─────────────────────────────────────────────
function buildCardValues(
  student: any,
  course: any,
  evaluations: any[],
  submissions: any[],
  assessments: any[],
  formatDateRange: (start: any, end: any) => string
): Partial<ReportCardValues> {
  const existingEval = evaluations.find(
    e => e.studentId === student.id && e.courseId === course.id
  )

  if (existingEval) {
    const scoresObj = (existingEval.scores as Record<string, number>) || {}
    const normLevel = (course.title || '').toLowerCase().trim()
    const isL6OrAdv = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel.includes('advanced') || normLevel.includes('adv')

    if (isL6OrAdv) {
      const listeningMarks = scoresObj.listening !== undefined ? scoresObj.listening : ''
      const speakingMarks = scoresObj.speaking !== undefined ? scoresObj.speaking : ''
      const readingMarks = scoresObj.reading !== undefined ? scoresObj.reading : ''
      const writingMarks = scoresObj.writing !== undefined ? scoresObj.writing : ''
      const grammarMarks = scoresObj.grammar !== undefined ? scoresObj.grammar : ''
      const attendanceMarks = existingEval.attendance !== undefined && existingEval.attendance !== null && existingEval.attendance !== 0 ? existingEval.attendance : (scoresObj.attendance ?? '')
      const participationMarks = existingEval.participation !== undefined && existingEval.participation !== null && existingEval.participation !== 0 ? existingEval.participation : (scoresObj.participation ?? '')
      const disciplineMarks = existingEval.discipline !== undefined && existingEval.discipline !== null && existingEval.discipline !== 0 ? existingEval.discipline : (scoresObj.discipline ?? '')

      const totalMarks = (Number(listeningMarks) || 0) + (Number(speakingMarks) || 0) + (Number(readingMarks) || 0) + (Number(writingMarks) || 0) + (Number(grammarMarks) || 0) + (Number(attendanceMarks) || 0) + (Number(participationMarks) || 0) + (Number(disciplineMarks) || 0)
      const pct = (totalMarks / 600) * 100
      const tlaResult = getTLAGrading(pct)

      return {
        studentName: student.name,
        fatherName: student.fatherName || student.guardianName || '',
        level: course.title,
        listeningMarks,
        speakingMarks,
        readingMarks,
        writingMarks,
        grammarMarks,
        attendanceMarks,
        participationMarks,
        disciplineMarks,
        totalScore: totalMarks > 0 ? totalMarks : '',
        percentage: totalMarks > 0 ? pct.toFixed(1) + '%' : '',
        overallResult: tlaResult.isPass ? 'PASS' : 'FAIL',
        grade: totalMarks > 0 ? tlaResult.grade : '',
        comments: totalMarks > 0 ? tlaResult.remark : '',
        dateOfIssue: new Date(existingEval.updatedAt || existingEval.createdAt).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        }),
        courseDuration: formatDateRange(course.startDate, course.endDate)
      }
    }

    const totalMarks =
      (existingEval.midterm || 0) + (existingEval.final || 0) +
      (existingEval.attendance || 0) + (existingEval.participation || 0) +
      (existingEval.discipline || 0) + (existingEval.extra || 0)
    const pct = (totalMarks / 300) * 100
    const tlaResult = getTLAGrading(pct)

    return {
      studentName: student.name,
      fatherName: student.fatherName || student.guardianName || '',
      level: course.title,
      midtermObtained: existingEval.midterm ?? '',
      finalObtained: existingEval.final ?? '',
      attendanceObtained: existingEval.attendance ?? '',
      participationObtained: existingEval.participation ?? '',
      disciplineObtained: existingEval.discipline ?? '',
      extraCurricularObtained: existingEval.extra ?? '',
      overallResult: tlaResult.isPass ? 'PASS' : 'FAIL',
      grade: tlaResult.grade,
      comments: tlaResult.remark,
      dateOfIssue: new Date(existingEval.updatedAt || existingEval.createdAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      }),
      courseDuration: formatDateRange(course.startDate, course.endDate)
    }
  }

  // Fallback: submissions + hardcoded defaults
  const studentSubmissions = submissions?.filter(s => s.studentId === student.id) || []
  let midtermMark: string | number = ''
  let finalMark: string | number = ''

  const midtermSub = studentSubmissions.find(s => {
    const ass = assessments.find(a => a.id === s.assignmentId)
    return ass?.phase === 'First Test'
  })
  if (midtermSub && midtermSub.grade !== undefined && midtermSub.grade !== null) {
    const ass = assessments.find(a => a.id === midtermSub.assignmentId)
    const max = ass?.totalMarks || 100
    midtermMark = Math.round((midtermSub.grade / max) * 100)
  }

  const finalSub = studentSubmissions.find(s => {
    const ass = assessments.find(a => a.id === s.assignmentId)
    return ass?.phase === 'Last Test'
  })
  if (finalSub && finalSub.grade !== undefined && finalSub.grade !== null) {
    const ass = assessments.find(a => a.id === finalSub.assignmentId)
    const max = ass?.totalMarks || 100
    finalMark = Math.round((finalSub.grade / max) * 100)
  }

  const attendanceMark = 56
  const participationMark = 18
  const disciplineMark = 9
  const extraMark = 8

  const grandTotalObtained =
    (typeof midtermMark === 'number' ? midtermMark : 0) +
    (typeof finalMark === 'number' ? finalMark : 0) +
    attendanceMark + participationMark + disciplineMark + extraMark

  const pct = (grandTotalObtained / 300) * 100
  const tlaResult = getTLAGrading(pct)

  return {
    studentName: student.name,
    fatherName: student.fatherName || student.guardianName || '',
    level: course.title,
    midtermObtained: midtermMark,
    finalObtained: finalMark,
    attendanceObtained: attendanceMark,
    participationObtained: participationMark,
    disciplineObtained: disciplineMark,
    extraCurricularObtained: extraMark,
    overallResult: tlaResult.isPass ? 'PASS' : 'FAIL',
    grade: tlaResult.grade,
    comments: tlaResult.remark,
    dateOfIssue: new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }),
    courseDuration: formatDateRange(course.startDate, course.endDate)
  }
}

// ─────────────────────────────────────────────
// Trigger a browser file download from a data URL
// ─────────────────────────────────────────────
function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ─────────────────────────────────────────────
// Completion tier color helpers
// ─────────────────────────────────────────────
const tierColor: Record<CompletionTier, string> = {
  complete: '#10b981',
  unsaved: '#f59e0b',
  incomplete: '#ef4444',
}

const tierLabel: Record<CompletionTier, string> = {
  complete: 'Saved to Registry',
  unsaved: 'Marks entered, not saved',
  incomplete: 'Missing test scores',
}

const tierIcon = {
  complete: CheckCircle2,
  unsaved: Clock,
  incomplete: AlertCircle,
}

// ─────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────
function ReportCardGeneratorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const {
    students,
    courses,
    submissions,
    assessments,
    evaluations,
    saveEvaluations,
    cardTemplates,
    isInitialized
  } = useData()

  // Selection states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all')

  // The values inside the card
  const [cardValues, setCardValues] = useState<Partial<ReportCardValues>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Download state
  const [activeDownload, setActiveDownload] = useState<DownloadFormat | null>(null)
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null)

  // Ref to the card DOM element
  const cardRef = useRef<HTMLDivElement>(null)

  // Container ref for mobile scaling
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Guard flag — stop overwriting teacher edits
  const isManuallyEdited = useRef(false)

  // ── Derived data ──────────────────────────────
  const teacherCourses = useMemo(
    () => courses?.filter(c => c.teacherId === user?.id) || [],
    [courses, user?.id]
  )

  const teacherStudents = students?.filter(student => {
    if (selectedCourseId && selectedCourseId !== 'all') {
      const course = teacherCourses.find(c => c.id === selectedCourseId)
      return course ? isStudentInCourse(student, course) : false
    }
    return teacherCourses.some(course => isStudentInCourse(student, course))
  }) || []

  // ── Format Course Dates ───────────────────────
  const formatDateRange = useCallback((start: any, end: any) => {
    if (!start || !end) return 'March 2026 To May 2026'
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
      const s = new Date(start).toLocaleDateString('en-US', options)
      const e = new Date(end).toLocaleDateString('en-US', options)
      return `${s} To ${e}`
    } catch {
      return 'March 2026 To May 2026'
    }
  }, [])

  // ── Completion stats per selected class ────────
  const classCompletionStats = useMemo(() => {
    if (selectedCourseId === 'all' || !isInitialized) return null

    const course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course) return null

    const classStudents = students?.filter(s => isStudentInCourse(s, course)) || []
    if (classStudents.length === 0) return null

    const statuses: StudentStatus[] = classStudents.map(student => {
      const hasDbRecord = evaluations.some(
        e => e.studentId === student.id && e.courseId === course.id
      )

      if (hasDbRecord) {
        return { studentId: student.id, name: student.name, tier: 'complete' }
      }

      // Check if submissions data gives non-zero midterm + final
      const studentSubs = submissions?.filter(s => s.studentId === student.id) || []
      const midtermSub = studentSubs.find(s => {
        const ass = assessments.find(a => a.id === s.assignmentId)
        return ass?.phase === 'First Test'
      })
      const finalSub = studentSubs.find(s => {
        const ass = assessments.find(a => a.id === s.assignmentId)
        return ass?.phase === 'Last Test'
      })
      const hasMidterm = midtermSub && midtermSub.grade !== undefined && midtermSub.grade !== null
      const hasFinal = finalSub && finalSub.grade !== undefined && finalSub.grade !== null

      if (hasMidterm && hasFinal) {
        return { studentId: student.id, name: student.name, tier: 'unsaved' }
      }
      return { studentId: student.id, name: student.name, tier: 'incomplete' }
    })

    const complete = statuses.filter(s => s.tier === 'complete').length
    const unsaved = statuses.filter(s => s.tier === 'unsaved').length
    const incomplete = statuses.filter(s => s.tier === 'incomplete').length

    return {
      total: classStudents.length,
      complete,
      unsaved,
      incomplete,
      studentStatuses: statuses,
      courseName: course.title
    }
  }, [selectedCourseId, teacherCourses, students, evaluations, submissions, assessments, isInitialized])

  // Bar fill percentage and color
  const barPct = classCompletionStats
    ? Math.round((classCompletionStats.complete / classCompletionStats.total) * 100)
    : 0
  const barColor =
    barPct >= 80 ? '#10b981' :
    barPct >= 50 ? '#f59e0b' :
    '#ef4444'

  // ── URL query parameter pre-fill ──────────────
  useEffect(() => {
    if (!isInitialized) return
    const studentIdParam = searchParams.get('studentId')
    if (studentIdParam) {
      const student = students.find(s => s.id === studentIdParam)
      if (student) {
        const studentCourse = teacherCourses.find(c => isStudentInCourse(student, c))
        if (studentCourse) setSelectedCourseId(studentCourse.id)
        setSelectedStudentId(student.id)
      }
    }
  }, [searchParams, isInitialized, students, teacherCourses])

  // ── Reset manual edit flag on selection change ─
  useEffect(() => {
    isManuallyEdited.current = false
  }, [selectedStudentId, selectedCourseId])

  // ── Auto-populate card values ─────────────────
  useEffect(() => {
    if (isManuallyEdited.current) return
    if (!isInitialized || selectedStudentId === 'all') {
      if (Object.keys(cardValues).length !== 0) setCardValues({})
      return
    }

    const student = students.find(s => s.id === selectedStudentId)
    if (!student) return

    let course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course || selectedCourseId === 'all') {
      course = teacherCourses.find(c => isStudentInCourse(student, c))
    }
    if (!course) return

    const newValues = buildCardValues(student, course, evaluations, submissions, assessments, formatDateRange)

    if (JSON.stringify(cardValues) !== JSON.stringify(newValues)) {
      setCardValues(newValues)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, selectedCourseId, isInitialized, students, teacherCourses, submissions, assessments, evaluations])

  // ── Mobile scaling ────────────────────────────
  useEffect(() => {
    if (selectedStudentId === 'all') return
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth - 48
        const cardWidth = 794
        setScale(parentWidth < cardWidth ? parentWidth / cardWidth : 1)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    const timer = setTimeout(updateScale, 150)
    return () => { window.removeEventListener('resize', updateScale); clearTimeout(timer) }
  }, [selectedStudentId])

  // ── Helpers for bulk course context ──────────────
  const getBulkStudents = useCallback(() => {
    if (selectedCourseId === 'all') return []
    const course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course) return []
    return (students?.filter(s => isStudentInCourse(s, course)) || []).map(s => ({ student: s, course }))
  }, [selectedCourseId, teacherCourses, students])

  // ─────────────────────────────────────────────
  // Handle Save
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (selectedStudentId === 'all') { toast.error('Please select a student first.'); return }
    const student = students.find(s => s.id === selectedStudentId)
    let course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course && selectedCourseId === 'all') {
      course = teacherCourses.find(c => isStudentInCourse(student, c))
    }
    if (!student || !course) { toast.error('Student and Course context matching error.'); return }

    setIsSaving(true)
    try {
      const normLevel = (course.title || cardValues.level || '').toLowerCase().trim()
      const isL6OrAdv = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel.includes('advanced') || normLevel.includes('adv')

      const evalPayload: any = {
        studentId: student.id,
        term: 'Term 1'
      }

      if (isL6OrAdv) {
        evalPayload.attendance = Number((cardValues as any).attendanceMarks) || 0
        evalPayload.participation = Number((cardValues as any).participationMarks) || 0
        evalPayload.discipline = Number((cardValues as any).disciplineMarks) || 0
        evalPayload.scores = {
          listening: Number((cardValues as any).listeningMarks) || 0,
          speaking: Number((cardValues as any).speakingMarks) || 0,
          reading: Number((cardValues as any).readingMarks) || 0,
          writing: Number((cardValues as any).writingMarks) || 0,
          grammar: Number((cardValues as any).grammarMarks) || 0
        }
      } else {
        evalPayload.midterm = Number(cardValues.midtermObtained) || 0
        evalPayload.final = Number(cardValues.finalObtained) || 0
        evalPayload.attendance = Number(cardValues.attendanceObtained) || 0
        evalPayload.participation = Number(cardValues.participationObtained) || 0
        evalPayload.discipline = Number(cardValues.disciplineObtained) || 0
        evalPayload.extra = Number(cardValues.extraCurricularObtained) || 0
      }

      await saveEvaluations(course.id, [evalPayload])
      toast.success('Report card marks synchronized and recorded successfully.')
    } catch {
      toast.error('Failed to save report card marks.')
    } finally {
      setIsSaving(false)
    }
  }

  // ─────────────────────────────────────────────
  // Handle Print
  // ─────────────────────────────────────────────
  const handlePrint = () => {
    if (selectedStudentId === 'all') { toast.error('Please select a student before printing.'); return }
    window.print()
  }

  // ─────────────────────────────────────────────
  // Download: Single PDF
  // ─────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (selectedStudentId === 'all') { toast.error('Please select a student before downloading.'); return }
    setActiveDownload('pdf')
    try {
      let dataUrl = ''
      const currentTier = getTierForLevel(cardValues.level || '')
      const normLevel = (cardValues.level || '').toLowerCase().trim()
      const isL6 = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel === 'level 6'
      const isAdv = normLevel.includes('advanced') || normLevel.includes('adv')
      const isA5 = currentTier === 'pre-foundation-lvl-5' && !isL6 && !isAdv

      if (isA5) {
        const cardEl = containerRef.current?.querySelector('.report-card-container') as HTMLElement | null
        if (cardEl) {
          const domCanvas = await html2canvas(cardEl, { scale: 3, useCORS: true, allowTaint: true, logging: false })
          dataUrl = domCanvas.toDataURL('image/jpeg', 0.95)
        } else {
          const canvas = await renderStudentCanvas(cardValues, cardValues.studentName || '', cardTemplates)
          dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        }

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 148, 105)
        pdf.addImage(dataUrl, 'JPEG', 0, 105, 148, 105)
        const name = (cardValues.studentName || 'report-card').replace(/\s+/g, '-').toLowerCase()
        pdf.save(`${name}-report-card-a5-2up.pdf`)
      } else {
        const canvas = await renderStudentCanvas(cardValues, cardValues.studentName || '', cardTemplates)
        dataUrl = canvas.toDataURL('image/jpeg', 0.95)

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297)
        const name = (cardValues.studentName || 'report-card').replace(/\s+/g, '-').toLowerCase()
        pdf.save(`${name}-report-card.pdf`)
      }

      toast.success('PDF downloaded successfully!')
    } catch (err: any) {
      console.error('PDF download error:', err)
      const details = err?.message || String(err)
      toast.error(`PDF Download Error: ${details}`, { duration: 10000 })
    } finally {
      setActiveDownload(null)
    }
  }

  // ─────────────────────────────────────────────
  // Download: Single Image (JPG or PNG)
  // ─────────────────────────────────────────────
  const handleDownloadImage = async (format: 'jpg' | 'png') => {
    if (selectedStudentId === 'all') { toast.error('Please select a student before downloading.'); return }
    setActiveDownload(format)
    try {
      let dataUrl = ''
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'png' ? undefined : 0.95

      const currentTier = getTierForLevel(cardValues.level || '')
      const normLevel = (cardValues.level || '').toLowerCase().trim()
      const isL6 = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel === 'level 6'
      const isAdv = normLevel.includes('advanced') || normLevel.includes('adv')
      const isA5 = currentTier === 'pre-foundation-lvl-5' && !isL6 && !isAdv

      if (isA5) {
        const cardEl = containerRef.current?.querySelector('.report-card-container') as HTMLElement | null
        if (cardEl) {
          const domCanvas = await html2canvas(cardEl, { scale: 3, useCORS: true, allowTaint: true, logging: false })
          dataUrl = domCanvas.toDataURL(mimeType, quality)
        } else {
          const canvas = await renderStudentCanvas(cardValues, cardValues.studentName || '', cardTemplates)
          dataUrl = canvas.toDataURL(mimeType, quality)
        }
      } else {
        const canvas = await renderStudentCanvas(cardValues, cardValues.studentName || '', cardTemplates)
        dataUrl = canvas.toDataURL(mimeType, quality)
      }

      const name = (cardValues.studentName || 'report-card').replace(/\s+/g, '-').toLowerCase()
      triggerDownload(dataUrl, `${name}-report-card.${format}`)
      toast.success(`${format.toUpperCase()} downloaded successfully!`)
    } catch (err: any) {
      console.error('Image download error:', err)
      const details = err?.message || String(err)
      toast.error(`Image Download Error: ${details}`, { duration: 10000 })
    } finally {
      setActiveDownload(null)
    }
  }

  // ─────────────────────────────────────────────
  // Download: Bulk PDF (all students in class)
  // ─────────────────────────────────────────────
  const handleBulkPDF = async () => {
    const pairs = getBulkStudents()
    if (pairs.length === 0) { toast.error('No students found in the selected class.'); return }
    setActiveDownload('bulk-pdf')
    setBulkProgress({ current: 0, total: pairs.length })
    try {
      const firstCourseTitle = pairs[0]?.course?.title || ''
      const currentTier = getTierForLevel(firstCourseTitle)
      const isA5 = currentTier === 'pre-foundation-lvl-5'

      if (isA5) {
        // A5 Portrait PDF with 2 cards per sheet
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
        
        for (let i = 0; i < pairs.length; i += 2) {
          if (i > 0) pdf.addPage()

          // Card 1 (Top)
          const pair1 = pairs[i]
          setBulkProgress({ current: i + 1, total: pairs.length })
          const val1 = buildCardValues(pair1.student, pair1.course, evaluations, submissions, assessments, formatDateRange)
          const canvas1 = await renderStudentCanvas(val1, pair1.student.name, cardTemplates)
          pdf.addImage(canvas1.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 148, 105)

          // Card 2 (Bottom) - If odd count, duplicate card 1 or render student 2
          if (i + 1 < pairs.length) {
            const pair2 = pairs[i + 1]
            setBulkProgress({ current: i + 2, total: pairs.length })
            const val2 = buildCardValues(pair2.student, pair2.course, evaluations, submissions, assessments, formatDateRange)
            const canvas2 = await renderStudentCanvas(val2, pair2.student.name, cardTemplates)
            pdf.addImage(canvas2.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 105, 148, 105)
          } else {
            // Duplicate single card for 2-up sheet
            pdf.addImage(canvas1.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 105, 148, 105)
          }
        }

        const courseName = firstCourseTitle.replace(/\s+/g, '-').toLowerCase()
        pdf.save(`${courseName}-bulk-report-cards-a5-2up.pdf`)
      } else {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        for (let i = 0; i < pairs.length; i++) {
          const { student, course } = pairs[i]
          setBulkProgress({ current: i + 1, total: pairs.length })
          const values = buildCardValues(student, course, evaluations, submissions, assessments, formatDateRange)
          const canvas = await renderStudentCanvas(values, student.name, cardTemplates)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
          if (i > 0) pdf.addPage()
          pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297)
        }
        const courseName = firstCourseTitle.replace(/\s+/g, '-').toLowerCase()
        pdf.save(`${courseName}-bulk-report-cards.pdf`)
      }

      toast.success(`Bulk PDF with ${pairs.length} cards downloaded!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate bulk PDF.')
    } finally {
      setActiveDownload(null)
      setBulkProgress(null)
    }
  }

  // ─────────────────────────────────────────────
  // Download: Bulk Images (sequential downloads)
  // ─────────────────────────────────────────────
  const handleBulkImages = async (format: 'jpg' | 'png') => {
    const pairs = getBulkStudents()
    if (pairs.length === 0) { toast.error('No students found in the selected class.'); return }
    setActiveDownload(format === 'jpg' ? 'bulk-jpg' : 'bulk-png')
    setBulkProgress({ current: 0, total: pairs.length })
    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'png' ? undefined : 0.95
      for (let i = 0; i < pairs.length; i++) {
        const { student, course } = pairs[i]
        setBulkProgress({ current: i + 1, total: pairs.length })
        const values = buildCardValues(student, course, evaluations, submissions, assessments, formatDateRange)
        const canvas = await renderStudentCanvas(values, student.name, cardTemplates)
        const dataUrl = canvas.toDataURL(mimeType, quality)
        const name = student.name.replace(/\s+/g, '-').toLowerCase()
        triggerDownload(dataUrl, `${name}-report-card.${format}`)
        // Brief pause between downloads to avoid browser throttling
        await new Promise(r => setTimeout(r, 300))
      }
      toast.success(`${pairs.length} ${format.toUpperCase()} files downloaded!`)
    } catch (err) {
      console.error(err)
      toast.error(`Failed to generate bulk ${format.toUpperCase()} files.`)
    } finally {
      setActiveDownload(null)
      setBulkProgress(null)
    }
  }

  // ─────────────────────────────────────────────
  // Download: ZIP of JPGs (single or bulk)
  // ─────────────────────────────────────────────
  const handleZipJPGs = async (bulk: boolean) => {
    if (!bulk && selectedStudentId === 'all') {
      toast.error('Please select a student before downloading.'); return
    }

    const pairs = bulk
      ? getBulkStudents()
      : (() => {
          const student = students.find(s => s.id === selectedStudentId)
          let course = teacherCourses.find(c => c.id === selectedCourseId)
          if (!course) course = teacherCourses.find(c => isStudentInCourse(student, c))
          return student && course ? [{ student, course }] : []
        })()

    if (pairs.length === 0) { toast.error('No student data available for ZIP.'); return }

    setActiveDownload(bulk ? 'bulk-zip-jpg' : 'zip-jpg')
    setBulkProgress({ current: 0, total: pairs.length })

    try {
      const zip = new JSZip()
      for (let i = 0; i < pairs.length; i++) {
        const { student, course } = pairs[i]
        setBulkProgress({ current: i + 1, total: pairs.length })
        const values = bulk
          ? buildCardValues(student, course, evaluations, submissions, assessments, formatDateRange)
          : cardValues
        const canvas = await renderStudentCanvas(values, student.name, cardTemplates)
        // Convert data URL to blob for zip
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        const base64 = dataUrl.split(',')[1]
        const name = student.name.replace(/\s+/g, '-').toLowerCase()
        zip.file(`${name}-report-card.jpg`, base64, { base64: true })
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      const url = URL.createObjectURL(blob)
      const zipName = bulk
        ? `${pairs[0].course.title.replace(/\s+/g, '-').toLowerCase()}-report-cards.zip`
        : `${pairs[0].student.name.replace(/\s+/g, '-').toLowerCase()}-report-card.zip`
      triggerDownload(url, zipName)
      URL.revokeObjectURL(url)
      toast.success(`ZIP with ${pairs.length} card${pairs.length > 1 ? 's' : ''} downloaded!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate ZIP file.')
    } finally {
      setActiveDownload(null)
      setBulkProgress(null)
    }
  }

  // ─────────────────────────────────────────────
  // Derived UI state
  // ─────────────────────────────────────────────
  const isAnyDownloading = activeDownload !== null
  const isClassSelected = selectedCourseId !== 'all'
  const clasHasStudents = getBulkStudents().length > 0

  const downloadButtonLabel = () => {
    if (!isAnyDownloading) return 'Download'
    if (bulkProgress) return `Generating ${bulkProgress.current} / ${bulkProgress.total}...`
    return 'Generating...'
  }

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  return (
    <PageShell>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, .no-print, button, .page-header-container, .filters-container {
            display: none !important;
          }
          main, .premium-scrollbar,
          div[class*="PageShell"], div[class*="SidebarInset"], div[class*="SidebarProvider"] {
            padding: 0 !important; margin: 0 !important; background: #ffffff !important;
            border: none !important; box-shadow: none !important;
            overflow: visible !important; display: block !important;
            height: auto !important; width: auto !important;
          }
          body { background: #ffffff !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}} />

      {/* Screen-only header */}
      <div className="no-print">
        <PageHeader
          title="Term Report Card Generator"
          description="Design, preview, and print official Academic Report Cards."
          actions={
            <Button variant="outline" onClick={() => router.back()} className="h-10 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Back</span>
            </Button>
          }
        />

        {/* Configuration Panel */}
        <Card className="mb-8 border-primary/5 shadow-md">
          <CardContent className="pt-6 flex flex-col gap-5">

            {/* Row 1: Selectors + Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Course Selector */}
                <div className="flex flex-col gap-1.5 w-60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Select Class</span>
                  <Select value={selectedCourseId} onValueChange={(val) => {
                    setSelectedCourseId(val)
                    setSelectedStudentId('all')
                  }}>
                    <SelectTrigger className="h-11 text-xs">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {teacherCourses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Selector */}
                <div className="flex flex-col gap-1.5 w-60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Select Student</span>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="h-11 text-xs">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Choose a Student...</SelectItem>
                      {teacherStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.studentId || 'No ID'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  className="h-11 px-5 font-normal text-xs border-primary/10 hover:bg-primary/5 text-primary"
                  onClick={handleSave}
                  disabled={isSaving || selectedStudentId === 'all'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Record Registry
                </Button>

                <Button
                  variant="outline"
                  className="h-11 px-5 font-normal text-xs"
                  onClick={handlePrint}
                  disabled={selectedStudentId === 'all'}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>

                {/* Split Download Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="h-11 px-5 font-normal text-xs bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-emerald-500/10 flex items-center gap-2"
                      disabled={isAnyDownloading}
                    >
                      {isAnyDownloading
                        ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />{downloadButtonLabel()}</>
                        : <><Download className="w-4 h-4" /> Download <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" /></>
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">

                    {/* Single student formats */}
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-60 pb-1">
                      This Student
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={handleDownloadPDF}
                      disabled={selectedStudentId === 'all'}
                      className="gap-2.5 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownloadImage('jpg')}
                      disabled={selectedStudentId === 'all'}
                      className="gap-2.5 text-xs"
                    >
                      <FileImage className="w-3.5 h-3.5 text-sky-500" />
                      Download JPG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownloadImage('png')}
                      disabled={selectedStudentId === 'all'}
                      className="gap-2.5 text-xs"
                    >
                      <FileImage className="w-3.5 h-3.5 text-violet-500" />
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleZipJPGs(false)}
                      disabled={selectedStudentId === 'all'}
                      className="gap-2.5 text-xs"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-500" />
                      ZIP of JPG
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Bulk formats */}
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-60 pb-1 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Whole Class
                      {!isClassSelected && <span className="text-[9px] text-amber-500 font-normal normal-case">(select a class first)</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={handleBulkPDF}
                      disabled={!isClassSelected || !clasHasStudents}
                      className="gap-2.5 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      Bulk PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkImages('jpg')}
                      disabled={!isClassSelected || !clasHasStudents}
                      className="gap-2.5 text-xs"
                    >
                      <FileImage className="w-3.5 h-3.5 text-sky-500" />
                      Bulk JPG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkImages('png')}
                      disabled={!isClassSelected || !clasHasStudents}
                      className="gap-2.5 text-xs"
                    >
                      <FileImage className="w-3.5 h-3.5 text-violet-500" />
                      Bulk PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleZipJPGs(true)}
                      disabled={!isClassSelected || !clasHasStudents}
                      className="gap-2.5 text-xs"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-500" />
                      Bulk ZIP of JPGs
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Row 2: Bulk progress bar (shown during bulk generation) */}
            {bulkProgress && (
              <div className="flex flex-col gap-1.5 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Generating cards...
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {bulkProgress.current} / {bulkProgress.total}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10b981] transition-all duration-300 ease-out"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Row 3: Completion Tracker — only when a class is selected */}
            {classCompletionStats && !bulkProgress && (
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-300">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground opacity-70">
                      Card Completion
                    </span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {classCompletionStats.courseName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold" style={{ color: barColor }}>
                      {classCompletionStats.complete}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {' '}/ {classCompletionStats.total}
                    </span>
                    <p className="text-[10px] text-muted-foreground opacity-60 mt-0.5">saved to registry</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${barPct}%`, backgroundColor: barColor }}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 flex-wrap">
                  {(
                    [
                      { tier: 'complete' as const, count: classCompletionStats.complete, label: 'Saved' },
                      { tier: 'unsaved' as const, count: classCompletionStats.unsaved, label: 'Has marks, unsaved' },
                      { tier: 'incomplete' as const, count: classCompletionStats.incomplete, label: 'Missing scores' },
                    ]
                  ).map(({ tier, count, label }) => (
                    <div key={tier} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: tierColor[tier] }} />
                      <span className="text-[10px] text-muted-foreground">{count} {label}</span>
                    </div>
                  ))}
                </div>

                {/* Student chips */}
                <div className="flex flex-wrap gap-2 pt-0.5 max-h-28 overflow-y-auto">
                  {classCompletionStats.studentStatuses.map(({ studentId, name, tier }) => {
                    const Icon = tierIcon[tier]
                    const isSelected = selectedStudentId === studentId
                    return (
                      <button
                        key={studentId}
                        onClick={() => setSelectedStudentId(studentId)}
                        title={`${name} — ${tierLabel[tier]}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 cursor-pointer hover:scale-[1.04] active:scale-[0.97]"
                        style={{
                          borderColor: isSelected ? tierColor[tier] : `${tierColor[tier]}55`,
                          backgroundColor: isSelected ? `${tierColor[tier]}18` : `${tierColor[tier]}09`,
                          color: tierColor[tier],
                          boxShadow: isSelected ? `0 0 0 2px ${tierColor[tier]}33` : 'none',
                        }}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[100px]">{name.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>

              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center p-4 md:p-8 bg-slate-100 rounded-3xl border border-slate-200 min-h-[500px] w-full overflow-hidden"
      >
        {selectedStudentId === 'all' ? (
          <div className="text-center py-20 text-slate-400 no-print">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-20 text-[#0f2950]" />
            <p className="font-serif text-xl font-medium">Select a student above to generate a preview.</p>
            <p className="text-xs mt-1">Grades and name will be fetched and pre-loaded automatically.</p>
          </div>
        ) : (
          (() => {
            const currentTier = getTierForLevel(cardValues.level || '')
            const normLevel = (cardValues.level || '').toLowerCase().trim()
            const isL6 = normLevel.includes('six') || normLevel.includes('lvl 6') || normLevel === 'level 6'
            const isAdv = normLevel.includes('advanced') || normLevel.includes('adv')
            const isA5 = currentTier === 'pre-foundation-lvl-5' && !isL6 && !isAdv

            const cardWidth = isA5 ? '210mm' : '210mm'
            const cardHeight = isA5 ? '148mm' : '297mm'

            return (
              <div
                className="origin-top transition-transform duration-200 bg-white shadow-xl"
                style={{
                  transform: `scale(${scale})`,
                  width: cardWidth,
                  height: cardHeight,
                  marginBottom: scale < 1 ? `calc(${cardHeight} * (${scale} - 1))` : '0px'
                }}
              >
                {isL6 ? (
                  <ReportCardL6A4
                    key={selectedStudentId}
                    initialValues={{
                      studentName: cardValues.studentName,
                      fatherName: cardValues.fatherName,
                      programLevel: 'Level Six',
                      listeningMarks: (cardValues as any).listeningMarks ?? cardValues.midtermObtained,
                      speakingMarks: (cardValues as any).speakingMarks ?? cardValues.finalObtained,
                      readingMarks: (cardValues as any).readingMarks ?? cardValues.attendanceObtained,
                      writingMarks: (cardValues as any).writingMarks ?? cardValues.participationObtained,
                      grammarMarks: (cardValues as any).grammarMarks ?? cardValues.disciplineObtained,
                      attendanceMarks: (cardValues as any).attendanceMarks,
                      participationMarks: (cardValues as any).participationMarks,
                      disciplineMarks: (cardValues as any).disciplineMarks,
                      totalScore: (cardValues as any).totalScore,
                      percentage: cardValues.percentage,
                      finalGrade: cardValues.grade,
                      remarks: cardValues.comments
                    }}
                    cardRef={cardRef as React.RefObject<HTMLDivElement>}
                    onChange={(newValues) => {
                      isManuallyEdited.current = true
                      setCardValues(prev => ({ ...prev, ...newValues, grade: newValues.finalGrade, comments: newValues.remarks }))
                    }}
                  />
                ) : isAdv ? (
                  <ReportCardAdvA4
                    key={selectedStudentId}
                    initialValues={{
                      studentName: cardValues.studentName,
                      fatherName: cardValues.fatherName,
                      programLevel: 'Advanced',
                      listeningMarks: (cardValues as any).listeningMarks ?? cardValues.midtermObtained,
                      speakingMarks: (cardValues as any).speakingMarks ?? cardValues.finalObtained,
                      readingMarks: (cardValues as any).readingMarks ?? cardValues.attendanceObtained,
                      writingMarks: (cardValues as any).writingMarks ?? cardValues.participationObtained,
                      grammarMarks: (cardValues as any).grammarMarks ?? cardValues.disciplineObtained,
                      attendanceMarks: (cardValues as any).attendanceMarks,
                      participationMarks: (cardValues as any).participationMarks,
                      disciplineMarks: (cardValues as any).disciplineMarks,
                      totalScore: (cardValues as any).totalScore,
                      percentage: cardValues.percentage,
                      finalGrade: cardValues.grade,
                      remarks: cardValues.comments
                    }}
                    cardRef={cardRef as React.RefObject<HTMLDivElement>}
                    onChange={(newValues) => {
                      isManuallyEdited.current = true
                      setCardValues(prev => ({ ...prev, ...newValues, grade: newValues.finalGrade, comments: newValues.remarks }))
                    }}
                  />
                ) : isA5 ? (
                  <ReportCardA5
                    key={selectedStudentId}
                    initialValues={cardValues}
                    cardRef={cardRef as React.RefObject<HTMLDivElement>}
                    onChange={(newValues) => {
                      isManuallyEdited.current = true
                      setCardValues(newValues)
                    }}
                  />
                ) : (
                  <ReportCard
                    key={selectedStudentId}
                    initialValues={cardValues}
                    cardRef={cardRef as React.RefObject<HTMLDivElement>}
                    onChange={(newValues) => {
                      isManuallyEdited.current = true
                      setCardValues(newValues)
                    }}
                  />
                )}
              </div>
            )
          })()
        )}
      </div>
    </PageShell>
  )
}

export default function ReportCardGeneratorPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ReportCardGeneratorContent />
    </Suspense>
  )
}
