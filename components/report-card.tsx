'use client'

import React, { useEffect, useRef, useState } from 'react'
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
  cardRef?: React.RefObject<HTMLDivElement>
}

export function ReportCard({
  initialValues,
  onChange,
  readOnly = false,
  className,
  cardRef
}: ReportCardProps) {
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

  const handleValueChange = <K extends keyof ReportCardValues>(key: K, value: ReportCardValues[K]) => {
    if (readOnly) return
    const updated = { ...values, [key]: value }
    setValues(updated)
    if (onChange) {
      onChange(updated)
    }
  }

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
    <div ref={cardRef} className={cn("report-card-container relative bg-white overflow-hidden shadow-2xl mx-auto", className)}
      style={{
        width: '210mm',
        height: '297mm',
        backgroundImage: 'url("/actual-result-card.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxSizing: 'border-box',
        color: '#0f172a'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        
        .rc-font-handwritten {
          font-family: 'Dancing Script', cursive;
        }
        .rc-font-sans {
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .rc-input-overlay {
          position: absolute;
          background: rgba(59, 130, 246, 0.1); /* Faint blue debug background */
          border: 1px dashed rgba(59, 130, 246, 0.3); /* Debug border */
          outline: none;
          color: #0f2950;
          font-weight: 700;
          text-align: center;
          transition: background 0.2s;
          z-index: 50; /* Ensures the input is above all elements and clickable */
        }
        
        .rc-input-overlay:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.15);
        }
        
        .rc-input-overlay:focus:not(:disabled) {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.6);
        }

        @media print {
          .rc-input-overlay {
            background: transparent !important;
            border: none !important;
          }
          .report-card-container {
            box-shadow: none !important;
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

      {/* ================= EDITABLE INPUT OVERLAYS ================= */}
      
      {/* Student Name — sits on the big line BELOW Mr./Mrs./Ms. */}
      <input
        type="text"
        value={values.studentName}
        onChange={(e) => handleValueChange('studentName', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-handwritten"
        style={{ top: '27%', left: '10%', width: '80%', height: '5%', fontSize: '36px', display: 'flex', alignItems: 'flex-end' }}
      />

      {/* Foundation / Level — sits ON the underline (shifted lower so text reads above the line) */}
      <input
        type="text"
        value={values.level}
        onChange={(e) => handleValueChange('level', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '36.5%', left: '32%', width: '24%', height: '2.2%', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center' }}
      />

      {/* Table: Obtained Marks Column — top values position the input squarely inside each cell */}
      <input
        type="number" min="0" max="100"
        value={values.midtermObtained}
        onChange={(e) => handleValueChange('midtermObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '45.2%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      <input
        type="number" min="0" max="100"
        value={values.finalObtained}
        onChange={(e) => handleValueChange('finalObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '48.8%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      <input
        type="number" min="0" max="60"
        value={values.attendanceObtained}
        onChange={(e) => handleValueChange('attendanceObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '52.4%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      <input
        type="number" min="0" max="20"
        value={values.participationObtained}
        onChange={(e) => handleValueChange('participationObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '56.0%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      <input
        type="number" min="0" max="10"
        value={values.disciplineObtained}
        onChange={(e) => handleValueChange('disciplineObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '59.6%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      <input
        type="number" min="0" max="10"
        value={values.extraCurricularObtained}
        onChange={(e) => handleValueChange('extraCurricularObtained', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '63.2%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '15px', padding: '0', lineHeight: '1' }}
      />
      
      {/* Grand Total Calculated Value */}
      <div 
        className="rc-input-overlay flex items-center justify-center rc-font-sans"
        style={{ top: '66.8%', left: '73%', width: '15.5%', height: '3.4%', fontSize: '16px', fontWeight: '700', color: '#0f2950' }}
      >
        {grandTotalObtained !== undefined && grandTotalObtained !== null && grandTotalObtained !== 0 ? grandTotalObtained : ''}
      </div>

      {/* Overall Result — shifted down so text sits ABOVE the line, not through it */}
      <input
        type="text"
        value={values.overallResult}
        onChange={(e) => handleValueChange('overallResult', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '70.5%', left: '32%', width: '14%', height: '3%', fontSize: '15px', display: 'flex', alignItems: 'center' }}
      />
      {/* Grade — shifted down to match Overall Result baseline */}
      <input
        type="text"
        value={values.grade}
        onChange={(e) => handleValueChange('grade', e.target.value)}
        disabled={readOnly}
        className="rc-input-overlay rc-font-sans"
        style={{ top: '70.5%', left: '67%', width: '14%', height: '3%', fontSize: '15px', display: 'flex', alignItems: 'center' }}
      />

      {/* Footer Dates Setup */}
      {/* Large white box to physically erase the original baked-in text from the image */}
      <div className="absolute bg-white z-40" style={{ bottom: '1.5%', left: '25%', width: '50%', height: '6%' }} />
      
      {/* New Editable Date Layout overlaid on the white blank-out box */}
      <div className="absolute z-50 flex flex-col items-center justify-center gap-1 w-[50%]" style={{ bottom: '2%', left: '25%' }}>
        <div className="flex items-center gap-2 justify-center w-full">
          <span className="rc-font-sans text-[12px] text-[#475569] font-medium">Date of Issue:</span>
          <input
            type="text"
            value={values.dateOfIssue}
            onChange={(e) => handleValueChange('dateOfIssue', e.target.value)}
            disabled={readOnly}
            className="rc-input-overlay bg-transparent text-[12px] text-[#0f2950] font-bold"
            style={{ position: 'relative', width: '130px', padding: '2px', top: 'auto', left: 'auto' }}
          />
        </div>
        <div className="flex items-center gap-2 justify-center w-full">
          <span className="rc-font-sans text-[12px] text-[#475569] font-medium">Course Duration:</span>
          <input
            type="text"
            value={values.courseDuration}
            onChange={(e) => handleValueChange('courseDuration', e.target.value)}
            disabled={readOnly}
            className="rc-input-overlay bg-transparent text-[12px] text-[#0f2950] font-bold"
            style={{ position: 'relative', width: '170px', padding: '2px', top: 'auto', left: 'auto' }}
          />
        </div>
      </div>

    </div>
  )
}
