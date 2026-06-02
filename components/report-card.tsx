'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ReportCardValues {
  studentName: string
  level: string
  midtermObtained: string | number
  finalObtained: string | number
  attendanceObtained: string | number
  participationObtained: string | number
  disciplineObtained: string | number
  extraCurricularObtained: string | number
  overallResult: string
  grade: string
  dateOfIssue: string
  courseDuration: string
}

interface ReportCardProps {
  initialValues?: Partial<ReportCardValues>
  onChange?: (values: ReportCardValues) => void
  readOnly?: boolean
  className?: string
}

export function ReportCard({
  initialValues,
  onChange,
  readOnly = false,
  className
}: ReportCardProps) {
  // Initialize state with default values matching the jpeg defaults
  const [values, setValues] = useState<ReportCardValues>({
    studentName: '',
    level: '',
    midtermObtained: '',
    finalObtained: '',
    attendanceObtained: '',
    participationObtained: '',
    disciplineObtained: '',
    extraCurricularObtained: '',
    overallResult: '',
    grade: '',
    dateOfIssue: 'June 04, 2026',
    courseDuration: 'March 2026 To May 2026',
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

  // Propagate changes to parent
  const handleValueChange = <K extends keyof ReportCardValues>(key: K, value: ReportCardValues[K]) => {
    if (readOnly) return
    const updated = { ...values, [key]: value }
    setValues(updated)
    if (onChange) {
      onChange(updated)
    }
  }

  // Parse marks for grand total
  const parseMark = (val: string | number): number => {
    if (val === undefined || val === null || val === '') return 0
    const parsed = parseFloat(String(val))
    return isNaN(parsed) ? 0 : parsed
  }

  const grandTotalObtained = 
    parseMark(values.midtermObtained) +
    parseMark(values.finalObtained) +
    parseMark(values.attendanceObtained) +
    parseMark(values.participationObtained) +
    parseMark(values.disciplineObtained) +
    parseMark(values.extraCurricularObtained)

  return (
    <div className={cn("report-card-container relative bg-white overflow-hidden shadow-2xl mx-auto border-8 border-double border-[#d97706]/30", className)}
      style={{
        width: '210mm',
        height: '297mm',
        padding: '24mm 20mm',
        boxSizing: 'border-box',
        color: '#0f172a',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Dynamic Font Imports via style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .rc-font-handwritten {
          font-family: 'Dancing Script', cursive;
        }
        .rc-font-signature {
          font-family: 'Great Vibes', cursive;
        }
        .rc-font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .rc-font-sans {
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        /* Interactive Input Styles for Screen */
        .rc-input-editable {
          background: transparent;
          border: none;
          outline: none;
          color: #1e3a8a;
          font-weight: 500;
          transition: all 0.2s ease;
          border-bottom: 1px dashed rgba(30, 58, 138, 0.3);
          padding: 2px 4px;
        }
        
        .rc-input-editable:hover:not(:disabled) {
          background: rgba(30, 58, 138, 0.03);
          border-bottom: 1px dashed #1e3a8a;
        }
        
        .rc-input-editable:focus:not(:disabled) {
          background: rgba(30, 58, 138, 0.05);
          border-bottom: 1.5px solid #1e3a8a;
          color: #0f172a;
        }
        
        /* Table Styles */
        .rc-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 13px;
        }
        .rc-table th {
          background-color: #ffffff;
          border: 1px solid #1e293b;
          color: #000000;
          font-weight: 700;
          padding: 8px 12px;
          text-transform: none;
          font-family: 'Inter', sans-serif;
        }
        .rc-table td {
          border: 1px solid #1e293b;
          padding: 8px 12px;
          color: #000000;
          font-family: 'Inter', sans-serif;
        }
        
        /* Print media overrides */
        @media print {
          .rc-input-editable {
            border-bottom: none !important;
            background: transparent !important;
            padding: 0 !important;
            color: #000000 !important;
          }
          .report-card-container {
            box-shadow: none !important;
            border-color: #d97706 !important;
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

      {/* ================= BACKGROUND GRAPHICS (SVG) ================= */}
      {/* Top Right Corner Geometry */}
      <div className="absolute top-0 right-0 w-[80mm] h-[80mm] pointer-events-none select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Main Dark Blue Polygon */}
          <polygon points="100,0 20,0 100,80" fill="#0f2950" />
          <polygon points="100,0 60,0 100,40" fill="#1b3e70" />
          <polygon points="100,0 80,0 100,20" fill="#245190" />
          {/* Gold Accent Line */}
          <polygon points="100,82 17,0 20,0 100,80" fill="#d97706" />
        </svg>
      </div>

      {/* Bottom Left Corner Geometry */}
      <div className="absolute bottom-0 left-0 w-[80mm] h-[80mm] pointer-events-none select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Main Dark Blue Polygon */}
          <polygon points="0,100 0,20 80,100" fill="#0f2950" />
          <polygon points="0,100 0,60 40,100" fill="#1b3e70" />
          <polygon points="0,100 0,80 20,100" fill="#245190" />
          {/* Gold Accent Line */}
          <polygon points="0,18 -3,20 80,100 83,100" fill="#d97706" />
        </svg>
      </div>

      {/* Elegant Border Frame Offset */}
      <div className="absolute inset-[3mm] border border-[#d97706]/40 pointer-events-none" />

      {/* ================= CONTENT CONTAINER ================= */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2">
            {/* Custom SVG logo designed to match the JPEG's logo */}
            <div className="relative w-14 h-14 flex items-center justify-center bg-transparent">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Mortarboard icon in blue */}
                <path d="M 50 15 L 85 30 L 50 45 L 15 30 Z" fill="#1e40af" />
                <path d="M 30 36.5 L 30 65 C 30 75, 70 75, 70 65 L 70 36.5" fill="none" stroke="#1e40af" strokeWidth="6" strokeLinecap="round" />
                <path d="M 80 32 L 80 60 L 83 60 L 83 33" fill="#1e40af" />
                <circle cx="81.5" cy="62" r="3.5" fill="#d97706" />
                {/* Abstract columns / leaves underneath */}
                <path d="M 40 50 C 35 60, 45 80, 50 85 C 55 80, 65 60, 60 50 C 50 55, 50 55, 40 50 Z" fill="#1e40af" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="rc-font-sans font-semibold text-[11px] tracking-[0.2em] text-[#64748b] leading-tight">The</span>
              <span className="rc-font-serif font-black text-3xl text-[#0f2950] tracking-wide leading-none">LEARNERS</span>
              <span className="rc-font-serif font-black text-3xl text-[#0f2950] tracking-wide leading-none">ACADEMY</span>
            </div>
          </div>
          
          {/* Join to Learn Script tagline */}
          <div className="rc-font-handwritten text-[#b45309] text-2xl font-medium tracking-wide mt-1">
            Join to Learn
          </div>
          
          {/* REPORT CARD Heading */}
          <h1 className="rc-font-serif font-black text-[2.75rem] tracking-[0.08em] text-[#0f2950] uppercase mt-4 mb-2">
            REPORT CARD
          </h1>

          {/* Student Name field */}
          <div className="flex items-end justify-center w-full max-w-[550px] mt-6">
            <span className="rc-font-handwritten text-3xl text-[#1e293b] mr-4 whitespace-nowrap select-none">
              Mr. / Mrs. / Ms.
            </span>
            <input
              type="text"
              value={values.studentName}
              onChange={(e) => handleValueChange('studentName', e.target.value)}
              disabled={readOnly}
              placeholder="Student Full Name"
              className="rc-input-editable rc-font-handwritten text-3xl flex-1 text-center font-bold text-[#1e40af] pb-1 min-w-0"
              style={{ fontSize: '28px' }}
            />
          </div>
        </div>

        {/* ================= CERTIFICATE BODY STATEMENT ================= */}
        <div className="text-center px-4 mt-6 leading-relaxed">
          <p className="rc-font-serif italic text-sm text-[#334155] font-medium">
            This report certifies the student's assessed performance in the English Language Program,
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="rc-font-serif italic text-sm text-[#334155] font-medium whitespace-nowrap">
              Foundation / Level
            </span>
            <input
              type="text"
              value={values.level}
              onChange={(e) => handleValueChange('level', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Level One"
              className="rc-input-editable text-center font-bold text-sm text-[#0f2950] w-64 pb-0.5"
            />
            <span className="rc-font-serif italic text-sm text-[#334155] font-medium whitespace-nowrap">
              , offered by The Learners Academy.
            </span>
          </div>
        </div>

        {/* ================= ASSESSMENT SUMMARY TABLE ================= */}
        <div className="px-2 mt-4">
          <div className="rc-font-sans font-bold text-sm text-black mb-1 select-none">
            Assessment Summary
          </div>
          
          <table className="rc-table">
            <thead>
              <tr>
                <th className="text-left w-[40%] font-bold">Marking Areas</th>
                <th className="text-center w-[20%] font-bold">Total Marks</th>
                <th className="text-center w-[20%] font-bold">Required Marks</th>
                <th className="text-center w-[20%] font-bold">Obtained Marks</th>
              </tr>
            </thead>
            <tbody>
              {/* Midterm Test */}
              <tr>
                <td className="font-semibold">Midterm Test</td>
                <td className="text-center select-none">100</td>
                <td className="text-center select-none">40</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={values.midtermObtained}
                    onChange={(e) => handleValueChange('midtermObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Final Test */}
              <tr>
                <td className="font-semibold">Final Test</td>
                <td className="text-center select-none">100</td>
                <td className="text-center select-none">40</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={values.finalObtained}
                    onChange={(e) => handleValueChange('finalObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Attendance */}
              <tr>
                <td className="font-semibold">Attendance</td>
                <td className="text-center select-none">60</td>
                <td className="text-center select-none">30</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={values.attendanceObtained}
                    onChange={(e) => handleValueChange('attendanceObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Participation */}
              <tr>
                <td className="font-semibold">Participation</td>
                <td className="text-center select-none">20</td>
                <td className="text-center select-none">10</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={values.participationObtained}
                    onChange={(e) => handleValueChange('participationObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Discipline */}
              <tr>
                <td className="font-semibold">Discipline</td>
                <td className="text-center select-none">10</td>
                <td className="text-center select-none">5</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={values.disciplineObtained}
                    onChange={(e) => handleValueChange('disciplineObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Extra-Curricular Activities */}
              <tr>
                <td className="font-semibold">Extra-Curricular Activities</td>
                <td className="text-center select-none">10</td>
                <td className="text-center select-none">5</td>
                <td className="text-center p-0">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={values.extraCurricularObtained}
                    onChange={(e) => handleValueChange('extraCurricularObtained', e.target.value)}
                    disabled={readOnly}
                    className="rc-input-editable w-full h-full text-center py-2"
                  />
                </td>
              </tr>
              {/* Grand Total Row */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
                <td className="font-bold">Grand Total</td>
                <td className="text-center select-none">300</td>
                <td className="text-center select-none">130</td>
                <td className="text-center font-bold text-blue-900">{grandTotalObtained !== undefined && grandTotalObtained !== null ? grandTotalObtained : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= OVERALL RESULT & GRADE ================= */}
        <div className="flex items-center justify-between px-2 mt-4 select-none">
          <div className="flex items-center gap-2 flex-1">
            <span className="rc-font-sans font-bold text-sm text-black whitespace-nowrap">Overall Result:</span>
            <input
              type="text"
              value={values.overallResult}
              onChange={(e) => handleValueChange('overallResult', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. PASS"
              className="rc-input-editable font-bold text-[#0f2950] text-sm flex-1 max-w-[200px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rc-font-sans font-bold text-sm text-black">Grade:</span>
            <input
              type="text"
              value={values.grade}
              onChange={(e) => handleValueChange('grade', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. A+"
              className="rc-input-editable font-bold text-[#0f2950] text-sm w-28 text-center"
            />
          </div>
        </div>

        {/* Divider line above footer signatures */}
        <div className="border-b border-[#0f172a]/30 my-4" />

        {/* ================= SIGNATURES & STAMPS ================= */}
        <div className="grid grid-cols-3 items-end px-2">
          
          {/* Executive Director Area */}
          <div className="flex flex-col items-center relative select-none">
            {/* Mock signature and seal overlay */}
            <div className="absolute bottom-[20px] left-[5px] flex items-center justify-center pointer-events-none select-none">
              {/* Blue ink handwritten signature mockup */}
              <span className="rc-font-signature text-blue-700 text-5xl font-normal opacity-90 transform -rotate-12 translate-x-2 -translate-y-1">
                J. Smith
              </span>
              
              {/* Transparent Blue Seal */}
              <div className="w-[85px] h-[85px] border-2 border-dashed border-blue-600/40 rounded-full absolute flex items-center justify-center transform scale-90 rotate-12 opacity-80">
                <div className="w-[75px] h-[75px] border border-double border-blue-600/40 rounded-full flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[6px] font-bold text-blue-600/60 uppercase tracking-tight">The Learners Academy</span>
                  <span className="text-[8px] font-black text-blue-600/80 uppercase tracking-tighter my-0.5">Executive</span>
                  <span className="text-[8px] font-black text-blue-600/80 uppercase tracking-tighter">Director</span>
                </div>
              </div>
            </div>
            
            <div className="w-full border-t border-slate-400 mt-12" />
            <span className="rc-font-serif text-xs font-bold italic text-slate-800 mt-2">Executive Director</span>
          </div>

          {/* Date of Issue and Duration (Center) */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="rc-font-sans text-[10px] text-[#475569] font-medium">Date of Issue:</span>
              <input
                type="text"
                value={values.dateOfIssue}
                onChange={(e) => handleValueChange('dateOfIssue', e.target.value)}
                disabled={readOnly}
                placeholder="June 04, 2026"
                className="rc-input-editable text-center font-bold text-[10px] text-slate-900 w-32 pb-0.5"
              />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="rc-font-sans text-[10px] text-[#475569] font-medium">Course Duration:</span>
              <input
                type="text"
                value={values.courseDuration}
                onChange={(e) => handleValueChange('courseDuration', e.target.value)}
                disabled={readOnly}
                placeholder="March 2026 To May 2026"
                className="rc-input-editable text-center font-bold text-[10px] text-slate-900 w-44 pb-0.5"
              />
            </div>
          </div>

          {/* Instructor Area */}
          <div className="flex flex-col items-center">
            <div className="w-full border-t border-slate-400 mt-12" />
            <span className="rc-font-serif text-xs font-bold italic text-slate-800 mt-2">Instructor</span>
          </div>

        </div>

      </div>
    </div>
  )
}
