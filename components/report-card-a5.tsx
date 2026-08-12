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
        backgroundImage: 'url("/result-card-a5-template.png")',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxSizing: 'border-box',
        color: '#0f172a'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');

        .a5-overlay-input {
          position: absolute;
          background: rgba(59, 130, 246, 0.04);
          border: 1px dashed rgba(59, 130, 246, 0.3);
          outline: none;
          color: #0b192c;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          transition: all 0.15s ease;
          border-radius: 2px;
          padding: 0 4px;
        }

        .a5-overlay-input:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .a5-overlay-input:focus:not(:disabled) {
          background: rgba(59, 130, 246, 0.12);
          border: 1.5px solid #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        @media print {
          .a5-overlay-input {
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

      {/* Student's Name */}
      <input
        type="text"
        value={values.studentName || ''}
        onChange={(e) => handleValueChange('studentName', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input"
        style={{
          top: '36.0%',
          left: '18.5%',
          width: '33.2%',
          height: '4.8%',
          fontSize: '15px'
        }}
      />

      {/* Father's / Guardian's Name */}
      <input
        type="text"
        value={values.fatherName || ''}
        onChange={(e) => handleValueChange('fatherName', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input"
        style={{
          top: '43.1%',
          left: '26.8%',
          width: '24.9%',
          height: '4.8%',
          fontSize: '15px'
        }}
      />

      {/* Foundation / Level */}
      <input
        type="text"
        value={values.level || ''}
        onChange={(e) => handleValueChange('level', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input"
        style={{
          top: '50.0%',
          left: '20.8%',
          width: '30.9%',
          height: '4.8%',
          fontSize: '15px'
        }}
      />

      {/* Date Awarded */}
      <input
        type="text"
        value={values.dateAwarded || values.dateOfIssue || ''}
        onChange={(e) => handleValueChange('dateAwarded', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input"
        style={{
          top: '57.1%',
          left: '18.5%',
          width: '33.2%',
          height: '4.8%',
          fontSize: '15px'
        }}
      />

      {/* Obtained Marks Column */}
      {/* Midterm Test */}
      <input
        type="number" min="0" max="100"
        value={values.midtermObtained ?? ''}
        onChange={(e) => handleValueChange('midtermObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '30.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Final Test */}
      <input
        type="number" min="0" max="100"
        value={values.finalObtained ?? ''}
        onChange={(e) => handleValueChange('finalObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '35.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Attendance */}
      <input
        type="number" min="0" max="60"
        value={values.attendanceObtained ?? ''}
        onChange={(e) => handleValueChange('attendanceObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '40.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Participation */}
      <input
        type="number" min="0" max="20"
        value={values.participationObtained ?? ''}
        onChange={(e) => handleValueChange('participationObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '45.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Discipline */}
      <input
        type="number" min="0" max="10"
        value={values.disciplineObtained ?? ''}
        onChange={(e) => handleValueChange('disciplineObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '50.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Co-Curricular Activities */}
      <input
        type="number" min="0" max="10"
        value={values.extraCurricularObtained ?? ''}
        onChange={(e) => handleValueChange('extraCurricularObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '55.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px'
        }}
      />

      {/* Grand Total */}
      <input
        type="text"
        value={displayGrandTotal}
        onChange={(e) => handleValueChange('grandTotalObtained', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '60.6%',
          left: '83.7%',
          width: '12.8%',
          height: '4.6%',
          fontSize: '14px',
          fontWeight: '800'
        }}
      />

      {/* Percentage */}
      <input
        type="text"
        value={displayPercentage}
        onChange={(e) => handleValueChange('percentage', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '65.8%',
          left: '73.1%',
          width: '23.4%',
          height: '4.6%',
          fontSize: '14px',
          fontWeight: '800'
        }}
      />

      {/* Grade */}
      <input
        type="text"
        value={values.grade || ''}
        onChange={(e) => handleValueChange('grade', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '70.8%',
          left: '73.1%',
          width: '23.4%',
          height: '4.6%',
          fontSize: '14px',
          fontWeight: '800'
        }}
      />

      {/* Remarks */}
      <input
        type="text"
        value={values.comments || ''}
        onChange={(e) => handleValueChange('comments', e.target.value)}
        disabled={readOnly}
        className="a5-overlay-input text-center"
        style={{
          top: '75.8%',
          left: '73.1%',
          width: '23.4%',
          height: '4.6%',
          fontSize: '13px',
          fontWeight: '700'
        }}
      />
    </div>
  )
}
