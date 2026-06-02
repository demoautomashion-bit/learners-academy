'use client'

import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react'
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
import { ReportCard, ReportCardValues } from '@/components/report-card'
import { isStudentInCourse } from '@/lib/utils/student-matching'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Award, Printer, Save, Download, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'

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
    isInitialized 
  } = useData()

  // Selection states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all')
  
  // The values inside the card
  const [cardValues, setCardValues] = useState<Partial<ReportCardValues>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Ref to the card DOM element for PDF capture
  const cardRef = useRef<HTMLDivElement>(null)

  // Guard flag — once the teacher edits any field, stop overwriting their changes
  const isManuallyEdited = useRef(false)

  // Filter courses taught by this teacher
  const teacherCourses = useMemo(() => courses?.filter(c => c.teacherId === user?.id) || [], [courses, user?.id])
  
  // Filter students based on selected course
  const teacherStudents = students?.filter(student => {
    if (selectedCourseId && selectedCourseId !== 'all') {
      const course = teacherCourses.find(c => c.id === selectedCourseId)
      return course ? isStudentInCourse(student, course) : false
    }
    return teacherCourses.some(course => isStudentInCourse(student, course))
  }) || []

  // Handle URL query parameters for pre-filling (from Student Dossier link)
  useEffect(() => {
    if (!isInitialized) return
    const studentIdParam = searchParams.get('studentId')
    if (studentIdParam) {
      const student = students.find(s => s.id === studentIdParam)
      if (student) {
        // Find the course this student is enrolled in
        const studentCourse = teacherCourses.find(c => isStudentInCourse(student, c))
        if (studentCourse) {
          setSelectedCourseId(studentCourse.id)
        }
        setSelectedStudentId(student.id)
      }
    }
  }, [searchParams, isInitialized, students, teacherCourses])

  // Reset manual edit flag whenever student or course selection changes
  useEffect(() => {
    isManuallyEdited.current = false
  }, [selectedStudentId, selectedCourseId])

  // Pull existing records or calculate marks whenever student/course selections change
  // Skip recalculation if the teacher has manually edited any field
  useEffect(() => {
    if (isManuallyEdited.current) return
    if (!isInitialized || selectedStudentId === 'all') {
      if (Object.keys(cardValues).length !== 0) {
        setCardValues({})
      }
      return
    }

    const student = students.find(s => s.id === selectedStudentId)
    if (!student) return

    // Find course (either explicit selected course, or the first matched course)
    let course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course || selectedCourseId === 'all') {
      course = teacherCourses.find(c => isStudentInCourse(student, c))
    }

    if (!course) return

    // 1. Check if an evaluation already exists in the database
    const existingEval = evaluations.find(
      e => e.studentId === student.id && e.courseId === course.id
    )

    let newValues: Partial<ReportCardValues> = {}

    if (existingEval) {
      const totalMarks = (existingEval.midterm || 0) + (existingEval.final || 0) + (existingEval.attendance || 0) + (existingEval.participation || 0) + (existingEval.discipline || 0) + (existingEval.extra || 0)
      let calcGrade = 'B'
      const pct = (totalMarks / 300) * 100
      if (pct >= 90) calcGrade = 'A+'
      else if (pct >= 80) calcGrade = 'A'
      else if (pct >= 70) calcGrade = 'B+'
      else if (pct >= 60) calcGrade = 'B'
      else if (pct >= 50) calcGrade = 'C'
      else calcGrade = 'F'

      newValues = {
        studentName: student.name,
        level: course.title,
        midtermObtained: existingEval.midterm ?? '',
        finalObtained: existingEval.final ?? '',
        attendanceObtained: existingEval.attendance ?? '',
        participationObtained: existingEval.participation ?? '',
        disciplineObtained: existingEval.discipline ?? '',
        extraCurricularObtained: existingEval.extra ?? '',
        overallResult: totalMarks >= 130 ? 'PASS' : 'FAIL',
        grade: calcGrade,
        dateOfIssue: new Date(existingEval.updatedAt || existingEval.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        courseDuration: formatDateRange(course.startDate, course.endDate)
      }
    } else {
      // 2. No evaluation found: Auto-populate marks from submissions registry
      const studentSubmissions = submissions?.filter(s => s.studentId === student.id) || []
      
      let midtermMark: string | number = ''
      let finalMark: string | number = ''

      // Find Midterm Submissions
      const midtermSub = studentSubmissions.find(s => {
        const ass = assessments.find(a => a.id === s.assignmentId)
        return ass?.phase === 'First Test'
      })
      if (midtermSub && midtermSub.grade !== undefined && midtermSub.grade !== null) {
        const ass = assessments.find(a => a.id === midtermSub.assignmentId)
        const max = ass?.totalMarks || 100
        // Scale to 100
        midtermMark = Math.round((midtermSub.grade / max) * 100)
      }

      // Find Final Submissions
      const finalSub = studentSubmissions.find(s => {
        const ass = assessments.find(a => a.id === s.assignmentId)
        return ass?.phase === 'Last Test'
      })
      if (finalSub && finalSub.grade !== undefined && finalSub.grade !== null) {
        const ass = assessments.find(a => a.id === finalSub.assignmentId)
        const max = ass?.totalMarks || 100
        // Scale to 100
        finalMark = Math.round((finalSub.grade / max) * 100)
      }

      // Pre-calculate attendance from mock student attendance metrics (default to 94% scaled to 60 marks -> 56, or calculate)
      const attendanceMark = 56 // Default matching typical 94% attendance
      const participationMark = 18 // Default out of 20
      const disciplineMark = 9 // Default out of 10
      const extraMark = 8 // Default out of 10

      const grandTotalObtained = 
        (typeof midtermMark === 'number' ? midtermMark : 0) +
        (typeof finalMark === 'number' ? finalMark : 0) +
        attendanceMark + participationMark + disciplineMark + extraMark

      const isPass = grandTotalObtained >= 130
      
      // Compute grade mapping
      let calculatedGrade = 'B'
      const pct = (grandTotalObtained / 300) * 100
      if (pct >= 90) calculatedGrade = 'A+'
      else if (pct >= 80) calculatedGrade = 'A'
      else if (pct >= 70) calculatedGrade = 'B+'
      else if (pct >= 60) calculatedGrade = 'B'
      else if (pct >= 50) calculatedGrade = 'C'
      else calculatedGrade = 'F'

      newValues = {
        studentName: student.name,
        level: course.title,
        midtermObtained: midtermMark,
        finalObtained: finalMark,
        attendanceObtained: attendanceMark,
        participationObtained: participationMark,
        disciplineObtained: disciplineMark,
        extraCurricularObtained: extraMark,
        overallResult: isPass ? 'PASS' : 'FAIL',
        grade: calculatedGrade,
        dateOfIssue: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        courseDuration: formatDateRange(course.startDate, course.endDate)
      }
    }

    if (JSON.stringify(cardValues) !== JSON.stringify(newValues)) {
      setCardValues(newValues)
    }

  // NOTE: cardValues intentionally removed from deps — adding it caused the infinite loop.
  // The isManuallyEdited guard above ensures edits are never overwritten.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, selectedCourseId, isInitialized, students, teacherCourses, submissions, assessments, evaluations])

  // Format Course Dates
  const formatDateRange = (start: any, end: any) => {
    if (!start || !end) return 'March 2026 To May 2026'
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
      const s = new Date(start).toLocaleDateString('en-US', options)
      const e = new Date(end).toLocaleDateString('en-US', options)
      return `${s} To ${e}`
    } catch {
      return 'March 2026 To May 2026'
    }
  }

  // Handle Save
  const handleSave = async () => {
    if (selectedStudentId === 'all') {
      toast.error('Please select a student first.')
      return
    }

    const student = students.find(s => s.id === selectedStudentId)
    let course = teacherCourses.find(c => c.id === selectedCourseId)
    if (!course && selectedCourseId === 'all') {
      course = teacherCourses.find(c => isStudentInCourse(student, c))
    }

    if (!student || !course) {
      toast.error('Student and Course context matching error.')
      return
    }

    setIsSaving(true)
    try {
      // Upsert report card evaluations
      await saveEvaluations(course.id, [{
        studentId: student.id,
        midterm: Number(cardValues.midtermObtained) || 0,
        final: Number(cardValues.finalObtained) || 0,
        attendance: Number(cardValues.attendanceObtained) || 0,
        participation: Number(cardValues.participationObtained) || 0,
        discipline: Number(cardValues.disciplineObtained) || 0,
        extra: Number(cardValues.extraCurricularObtained) || 0,
        term: 'Term 1'
      }])
      toast.success('Report card marks synchronized and recorded successfully.')
    } catch (error) {
      toast.error('Failed to save report card marks.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Print
  const handlePrint = () => {
    if (selectedStudentId === 'all') {
      toast.error('Please select a student before printing.')
      return
    }
    window.print()
  }

  // Handle Download — pure Canvas API, no external library needed
  const handleDownloadPDF = async () => {
    if (selectedStudentId === 'all') {
      toast.error('Please select a student before downloading.')
      return
    }
    setIsDownloading(true)
    try {
      // A4 canvas at 150 DPI
      const W = 1240
      const H = 1754
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D not supported')

      // 1. Draw the background image
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve() }
        img.onerror = reject
        img.src = '/actual-result-card.jpeg'
      })

      // Load fonts explicitly so canvas can use them
      await document.fonts.load('bold 55px "Dancing Script"')
      await document.fonts.load('bold 32px "Dancing Script"')
      await document.fonts.load('bold 28px "Inter"')

      // Helper: draw horizontally centered text within a bounding box
      const draw = (
        text: string,
        xPct: number,
        yPct: number,
        wPct: number,
        fontSize: number,
        fontFamily = 'Inter, sans-serif'
      ) => {
        if (!text) return
        const cx = ((xPct + wPct / 2) / 100) * W
        const cy = (yPct / 100) * H
        ctx.save()
        ctx.font = `bold ${fontSize}px ${fontFamily}`
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, cx, cy, (wPct / 100) * W)
        ctx.restore()
      }

      const v = cardValues

      // 2. Student name
      draw(v.studentName || '', 10, 30.2, 80, 55, '"Dancing Script", cursive')
      // 3. Level
      draw(v.level || '', 32, 36.8, 24, 32, '"Dancing Script", cursive')
      
      // 4. Mark rows — Using calculated mathematical loop to prevent downward vertical drift
      const marksFontSize = 28
      const marksX = 72.5
      const marksW = 15.5
      const startY = 46.1
      const gapY = 3.53
      
      draw(String(v.midtermObtained ?? ''), marksX, startY, marksW, marksFontSize)
      draw(String(v.finalObtained ?? ''), marksX, startY + gapY, marksW, marksFontSize)
      draw(String(v.attendanceObtained ?? ''), marksX, startY + gapY * 2, marksW, marksFontSize)
      draw(String(v.participationObtained ?? ''), marksX, startY + gapY * 3, marksW, marksFontSize)
      draw(String(v.disciplineObtained ?? ''), marksX, startY + gapY * 4, marksW, marksFontSize)
      draw(String(v.extraCurricularObtained ?? ''), marksX, startY + gapY * 5, marksW, marksFontSize)
      
      // 5. Grand total
      const grand = [
        v.midtermObtained, v.finalObtained, v.attendanceObtained,
        v.participationObtained, v.disciplineObtained, v.extraCurricularObtained
      ].reduce((sum, val) => sum + (parseFloat(String(val ?? 0)) || 0), 0)
      if (grand > 0) draw(String(grand), marksX, startY + gapY * 6, marksW, 30)
      // 6. Result & Grade
      draw(v.overallResult || '', 32, 72.0, 14, 30)
      draw(v.grade || '', 67, 72.0, 14, 30)
      // 7. Erase baked-in dates and redraw editable values (expanded white box)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(Math.round(0.20 * W), Math.round(0.93 * H), Math.round(0.60 * W), Math.round(0.07 * H))
      ctx.font = 'italic 20px Inter, sans-serif'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Date of Issue: ${v.dateOfIssue || ''}`, W * 0.5, H * 0.954)
      ctx.fillText(`Course Duration: ${v.courseDuration || ''}`, W * 0.5, H * 0.969)

      // 8. Generate PDF and trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297)
      const name = (v.studentName || 'report-card').replace(/\s+/g, '-').toLowerCase()
      pdf.save(`${name}-report-card.pdf`)
      toast.success('Report card downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate download. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  return (
    <PageShell>
      {/* Hide elements in print mode */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide sidebars and layout UI */
          aside,
          header,
          .no-print,
          button,
          .page-header-container,
          .filters-container {
            display: none !important;
          }
          
          /* Full sheet container overrides */
          main, 
          .premium-scrollbar,
          div[class*="PageShell"],
          div[class*="SidebarInset"],
          div[class*="SidebarProvider"] {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            display: block !important;
            height: auto !important;
            width: auto !important;
          }

          body {
            background: #ffffff !important;
          }
          
          /* Force page margins */
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}} />

      {/* Screen only Header */}
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
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 flex-1">
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

              <div className="flex flex-col gap-1.5 w-60">
                <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Select Student</span>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="h-11 text-xs">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Choose a Student...</SelectItem>
                    {teacherStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name} ({student.studentId || 'No ID'})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
              <Button
                className="h-11 px-6 font-normal text-xs bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-emerald-500/10"
                onClick={handleDownloadPDF}
                disabled={selectedStudentId === 'all' || isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-slate-100 rounded-3xl border border-slate-200 overflow-x-auto min-h-[500px]">
        {selectedStudentId === 'all' ? (
          <div className="text-center py-20 text-slate-400 no-print">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-20 text-[#0f2950]" />
            <p className="font-serif text-xl font-medium">Select a student above to generate a preview.</p>
            <p className="text-xs mt-1">Grades and name will be fetched and pre-loaded automatically.</p>
          </div>
        ) : (
          <div className="transform scale-95 md:scale-100 origin-center bg-white shadow-xl">
            <ReportCard 
              key={selectedStudentId}
              initialValues={cardValues}
              cardRef={cardRef}
              onChange={(newValues) => {
                isManuallyEdited.current = true
                setCardValues(newValues)
              }}
            />
          </div>
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
