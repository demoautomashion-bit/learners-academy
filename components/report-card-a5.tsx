'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ReportCardValues {
  studentName: string
  fatherName?: string
  level: string
  midtermObtained: string | number
  finalObtained: string | number
  attendanceObtained: string | number
  participationObtained: string | number
  disciplineObtained: string | number
  extraCurricularObtained: string | number
  grandTotalObtained?: string | number
  percentage?: string
  grade: string
  dateAwarded?: string
  dateOfIssue?: string
  courseDuration?: string
  comments?: string
  overallResult?: string
}

interface ReportCardA5Props {
  initialValues?: Partial<ReportCardValues>
  onChange?: (values: ReportCardValues) => void
  readOnly?: boolean
  className?: string
  cardRef?: React.RefObject<HTMLDivElement>
}

export function ReportCardA5({
  initialValues,
  onChange,
  readOnly = false,
  className,
  cardRef
}: ReportCardA5Props) {
  const [values, setValues] = useState<ReportCardValues>({
    studentName: '',
    fatherName: '',
    level: '',
    midtermObtained: '',
    finalObtained: '',
    attendanceObtained: '',
    participationObtained: '',
    disciplineObtained: '',
    extraCurricularObtained: '',
    grandTotalObtained: '',
    percentage: '',
    grade: '',
    dateAwarded: 'June 04, 2026',
    comments: '',
    ...initialValues
  })

  // Sync state if initialValues changes
  useEffect(() => {
    if (initialValues) {
      setValues(prev => ({
        ...prev,
        ...initialValues
      }))
    }
  }, [initialValues])

  const handleValueChange = <K extends keyof ReportCardValues>(key: K, value: ReportCardValues[K]) => {
    if (readOnly) return
    const updated = { ...values, [key]: value }
    setValues(updated)
    if (onChange) {
      onChange(updated)
    }
  }

  const parseMark = (val: string | number | undefined): number => {
    if (val === undefined || val === null || val === '') return 0
    const parsed = parseFloat(String(val))
    return isNaN(parsed) ? 0 : parsed
  }

  const autoGrandTotal =
    parseMark(values.midtermObtained) +
    parseMark(values.finalObtained) +
    parseMark(values.attendanceObtained) +
    parseMark(values.participationObtained) +
    parseMark(values.disciplineObtained) +
    parseMark(values.extraCurricularObtained)

  const hasAnyMarks =
    values.midtermObtained !== '' ||
    values.finalObtained !== '' ||
    values.attendanceObtained !== '' ||
    values.participationObtained !== '' ||
    values.disciplineObtained !== '' ||
    values.extraCurricularObtained !== ''

  const displayGrandTotal = values.grandTotalObtained !== undefined && values.grandTotalObtained !== ''
    ? values.grandTotalObtained
    : (hasAnyMarks ? autoGrandTotal : '')

  const autoPercentage = hasAnyMarks ? ((autoGrandTotal / 300) * 100).toFixed(1) + '%' : ''
  const displayPercentage = values.percentage !== undefined && values.percentage !== ''
    ? values.percentage
    : autoPercentage

  return (
    <div
      ref={cardRef}
      className={cn(
        "report-card-a5-container relative bg-white overflow-hidden shadow-2xl mx-auto border border-slate-200 select-none",
        className
      )}
      style={{
        width: '210mm',
        height: '148mm',
        boxSizing: 'border-box',
        color: '#0f172a',
        fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Great+Vibes&display=swap');

        .a5-input {
          background: rgba(59, 130, 246, 0.04);
          border: 1px dashed rgba(59, 130, 246, 0.3);
          outline: none;
          color: #0b192c;
          font-family: inherit;
          transition: all 0.15s ease;
          border-radius: 2px;
        }

        .a5-input:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .a5-input:focus:not(:disabled) {
          background: rgba(59, 130, 246, 0.12);
          border: 1.5px solid #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        @media print {
          .a5-input {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .report-card-a5-container {
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        }
      `}} />

      {/* Decorative Geometric Header Shape (Top Right) */}
      <div className="absolute top-0 right-0 w-[42%] h-[24%] pointer-events-none z-0">
        <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="120,0 400,0 400,150 220,100" fill="#0052cc" opacity="0.9" />
          <polygon points="160,0 400,0 400,120 280,60" fill="#0080ff" opacity="0.85" />
          <polygon points="220,0 400,0 400,80 340,30" fill="#00c3ff" opacity="0.9" />
        </svg>
      </div>

      {/* Decorative Geometric Footer Shape (Bottom Left) */}
      <div className="absolute bottom-0 left-0 w-[35%] h-[22%] pointer-events-none z-0">
        <svg viewBox="0 0 350 140" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="0,30 220,140 0,140" fill="#002b80" opacity="0.95" />
          <polygon points="0,60 300,140 0,140" fill="#0052cc" opacity="0.85" />
          <polygon points="0,90 180,140 0,140" fill="#00a3e0" opacity="0.9" />
        </svg>
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 w-full h-full p-[8mm] flex flex-col justify-between">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-[14mm] h-[18mm] flex items-center justify-center relative">
              <svg viewBox="0 0 100 130" className="w-full h-full">
                {/* Mortarboard hat */}
                <polygon points="50,5 95,28 50,50 5,28" fill="#0052cc" />
                <polygon points="50,50 95,28 95,38 50,60" fill="#003399" />
                <rect x="44" y="45" width="12" height="15" fill="#0052cc" />
                {/* TLA Abstract Figure */}
                <path d="M50 55 C35 70, 30 90, 50 120 C70 90, 65 70, 50 55 Z" fill="#0080ff" />
                <circle cx="50" cy="70" r="8" fill="#ffffff" />
                <path d="M40 105 C45 118, 55 122, 70 120 C58 128, 42 124, 35 110 Z" fill="#00c3ff" />
              </svg>
            </div>
            <div>
              <h1 className="text-[20pt] font-[900] tracking-tight text-[#002b80] leading-none uppercase">
                THE LEARNERS ACADEMY
              </h1>
              <p className="text-[12pt] font-semibold italic text-[#0052cc] mt-[1mm] tracking-wide">
                English Language Program
              </p>
              <p className="text-[14pt] text-[#003399] mt-[0.5mm]" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Join to Learn
              </p>
            </div>
          </div>
          <div className="text-right pt-[2mm] pr-[4mm]">
            <h2 className="text-[22pt] font-[900] tracking-wider text-[#002b80] uppercase leading-none">
              REPORT CARD
            </h2>
          </div>
        </div>

        {/* Content Body: Left Details & Right Summary Table */}
        <div className="flex gap-[6mm] my-auto items-stretch">
          
          {/* Left Column: Student Details */}
          <div className="w-[52%] flex flex-col justify-between py-[1mm]">
            <div className="space-y-[3.5mm] text-[10.5pt] font-bold text-[#0f172a]">
              
              {/* Student Name */}
              <div className="flex items-baseline">
                <span className="shrink-0 w-[38mm] text-[#0f172a]">Student&apos;s Name:</span>
                <input
                  type="text"
                  value={values.studentName || ''}
                  onChange={(e) => handleValueChange('studentName', e.target.value)}
                  disabled={readOnly}
                  className="a5-input grow px-2 py-0.5 text-[10.5pt] font-bold text-[#0b192c]"
                />
              </div>

              {/* Father Name */}
              <div className="flex items-baseline">
                <span className="shrink-0 w-[38mm] text-[#0f172a]">Father&apos;s / Guardian&apos;s Name:</span>
                <input
                  type="text"
                  value={values.fatherName || ''}
                  onChange={(e) => handleValueChange('fatherName', e.target.value)}
                  disabled={readOnly}
                  className="a5-input grow px-2 py-0.5 text-[10.5pt] font-bold text-[#0b192c]"
                />
              </div>

              {/* Foundation / Level */}
              <div className="flex items-baseline">
                <span className="shrink-0 w-[38mm] text-[#0f172a]">Foundation / Level:</span>
                <input
                  type="text"
                  value={values.level || ''}
                  onChange={(e) => handleValueChange('level', e.target.value)}
                  disabled={readOnly}
                  className="a5-input grow px-2 py-0.5 text-[10.5pt] font-bold text-[#0b192c]"
                />
              </div>

              {/* Date Awarded */}
              <div className="flex items-baseline">
                <span className="shrink-0 w-[38mm] text-[#0f172a]">Date Awarded:</span>
                <input
                  type="text"
                  value={values.dateAwarded || values.dateOfIssue || ''}
                  onChange={(e) => handleValueChange('dateAwarded', e.target.value)}
                  disabled={readOnly}
                  className="a5-input grow px-2 py-0.5 text-[10.5pt] font-bold text-[#0b192c]"
                />
              </div>
            </div>

            {/* Certification Note */}
            <p className="text-[8.5pt] font-medium italic text-slate-700 leading-snug pr-4 mt-3">
              This report certifies the student&apos;s assessed performance in the English Language Program, offered by The Learners Academy.
            </p>
          </div>

          {/* Right Column: Assessment Summary Table */}
          <div className="w-[48%] flex flex-col justify-start">
            
            {/* Table Header Banner */}
            <div className="bg-[#002b80] text-white text-center py-1 rounded-t-lg shadow-sm">
              <h3 className="text-[10pt] font-[900] tracking-wider uppercase">
                ASSESSMENT SUMMARY
              </h3>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-slate-400 text-[8.5pt]">
              <thead>
                <tr className="bg-slate-100 text-[#0f172a] font-bold border-b border-slate-400">
                  <th className="border-r border-slate-400 px-2 py-1 text-left font-bold w-[54%]">Assessment Components</th>
                  <th className="border-r border-slate-400 px-1 py-1 text-center font-bold w-[23%]">Total Marks</th>
                  <th className="px-1 py-1 text-center font-bold w-[23%]">Obtained Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Midterm Test</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">100</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="100"
                      value={values.midtermObtained ?? ''}
                      onChange={(e) => handleValueChange('midtermObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Final Test</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">100</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="100"
                      value={values.finalObtained ?? ''}
                      onChange={(e) => handleValueChange('finalObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Attendance</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">60</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="60"
                      value={values.attendanceObtained ?? ''}
                      onChange={(e) => handleValueChange('attendanceObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Participation</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">20</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="20"
                      value={values.participationObtained ?? ''}
                      onChange={(e) => handleValueChange('participationObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Discipline</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">10</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="10"
                      value={values.disciplineObtained ?? ''}
                      onChange={(e) => handleValueChange('disciplineObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-semibold text-slate-800">Co-Curricular Activities</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">10</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="number" min="0" max="10"
                      value={values.extraCurricularObtained ?? ''}
                      onChange={(e) => handleValueChange('extraCurricularObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt]"
                    />
                  </td>
                </tr>
                {/* Grand Total Row */}
                <tr className="bg-slate-200 font-bold border-t-2 border-slate-400">
                  <td className="border-r border-slate-400 px-2 py-1 font-bold text-[#0f172a]">Grand Total</td>
                  <td className="border-r border-slate-400 px-1 py-1 text-center font-bold text-slate-900">300</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="text"
                      value={displayGrandTotal}
                      onChange={(e) => handleValueChange('grandTotalObtained', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt] text-[#002b80]"
                    />
                  </td>
                </tr>
                {/* Percentage Row */}
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-bold text-[#0f172a]" colSpan={2}>Percentage</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="text"
                      value={displayPercentage}
                      onChange={(e) => handleValueChange('percentage', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt] text-[#002b80]"
                    />
                  </td>
                </tr>
                {/* Grade Row */}
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-bold text-[#0f172a]" colSpan={2}>Grade</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="text"
                      value={values.grade || ''}
                      onChange={(e) => handleValueChange('grade', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt] text-[#002b80]"
                    />
                  </td>
                </tr>
                {/* Remarks Row */}
                <tr>
                  <td className="border-r border-slate-400 px-2 py-1 font-bold text-[#0f172a]" colSpan={2}>Remarks</td>
                  <td className="px-1 py-0.5 text-center">
                    <input
                      type="text"
                      value={values.comments || ''}
                      onChange={(e) => handleValueChange('comments', e.target.value)}
                      disabled={readOnly}
                      className="a5-input w-full text-center py-0.5 font-bold text-[8.5pt] text-[#002b80]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Row: Signatures */}
        <div className="flex justify-between items-end px-[12mm] pb-[1mm] pt-2">
          <div className="w-[38%] text-center">
            <div className="border-b-2 border-slate-800 mb-1" />
            <p className="text-[10pt] font-bold italic text-slate-800">Director</p>
          </div>
          <div className="w-[38%] text-center">
            <div className="border-b-2 border-slate-800 mb-1" />
            <p className="text-[10pt] font-bold italic text-slate-800">Instructor</p>
          </div>
        </div>

      </div>
    </div>
  )
}
