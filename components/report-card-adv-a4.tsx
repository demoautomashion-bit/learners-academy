'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getTLAGrading } from '@/lib/utils/tla-grading'
import { generateTranscriptNumber } from '@/lib/utils/transcript-number'

export interface AdvancedTranscriptValues {
  studentName: string
  fatherName?: string
  programLevel?: string
  dateOfCompletion?: string
  transcriptNo?: string
  listeningMarks?: string | number
  speakingMarks?: string | number
  readingMarks?: string | number
  writingMarks?: string | number
  grammarMarks?: string | number
  attendanceMarks?: string | number
  participationMarks?: string | number
  disciplineMarks?: string | number
  totalScore?: string | number
  percentage?: string
  finalGrade?: string
  remarks?: string
}

interface AdvancedTranscriptProps {
  initialValues?: Partial<AdvancedTranscriptValues>
  onChange?: (values: AdvancedTranscriptValues) => void
  readOnly?: boolean
  className?: string
  cardRef?: React.RefObject<HTMLDivElement>
  sequenceNumber?: number
}

export function ReportCardAdvA4({
  initialValues,
  onChange,
  readOnly = false,
  className,
  cardRef,
  sequenceNumber = 1
}: AdvancedTranscriptProps) {
  const defaultDateOfCompletion = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const defaultTranscriptNo = generateTranscriptNumber('Advanced', sequenceNumber)

  const [values, setValues] = useState<AdvancedTranscriptValues>({
    studentName: '',
    fatherName: '',
    programLevel: 'Advanced',
    dateOfCompletion: defaultDateOfCompletion,
    transcriptNo: defaultTranscriptNo,
    listeningMarks: '',
    speakingMarks: '',
    readingMarks: '',
    writingMarks: '',
    grammarMarks: '',
    attendanceMarks: '',
    participationMarks: '',
    disciplineMarks: '',
    totalScore: '',
    percentage: '',
    finalGrade: '',
    remarks: '',
    ...initialValues
  })

  useEffect(() => {
    if (initialValues) {
      setValues(prev => ({
        ...prev,
        ...initialValues,
        dateOfCompletion: initialValues.dateOfCompletion || prev.dateOfCompletion || defaultDateOfCompletion,
        transcriptNo: initialValues.transcriptNo || prev.transcriptNo || defaultTranscriptNo
      }))
    }
  }, [initialValues, defaultTranscriptNo, defaultDateOfCompletion])

  const handleValueChange = <K extends keyof AdvancedTranscriptValues>(key: K, value: AdvancedTranscriptValues[K]) => {
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

  // Calculate auto totals
  const listening = parseMark(values.listeningMarks)
  const speaking = parseMark(values.speakingMarks)
  const reading = parseMark(values.readingMarks)
  const writing = parseMark(values.writingMarks)
  const grammar = parseMark(values.grammarMarks)
  const attendance = parseMark(values.attendanceMarks)
  const participation = parseMark(values.participationMarks)
  const discipline = parseMark(values.disciplineMarks)

  const hasAnyMarks =
    values.listeningMarks !== '' ||
    values.speakingMarks !== '' ||
    values.readingMarks !== '' ||
    values.writingMarks !== '' ||
    values.grammarMarks !== '' ||
    values.attendanceMarks !== '' ||
    values.participationMarks !== '' ||
    values.disciplineMarks !== ''

  const autoGrandTotal = listening + speaking + reading + writing + grammar + attendance + participation + discipline

  const displayTotalScore = values.totalScore !== undefined && values.totalScore !== ''
    ? values.totalScore
    : (hasAnyMarks ? autoGrandTotal : '')

  const autoPercentageNum = hasAnyMarks ? (autoGrandTotal / 600) * 100 : 0
  const autoPercentageStr = hasAnyMarks ? autoPercentageNum.toFixed(1) + '%' : ''
  
  const displayPercentage = values.percentage !== undefined && values.percentage !== ''
    ? values.percentage
    : autoPercentageStr

  // Grade & Remarks based on shared TLA logic
  const tlaGrading = getTLAGrading(autoPercentageNum)

  const displayGrade = values.finalGrade !== undefined && values.finalGrade !== ''
    ? values.finalGrade
    : (hasAnyMarks ? tlaGrading.grade : '')

  const displayRemarks = values.remarks !== undefined && values.remarks !== ''
    ? values.remarks
    : (hasAnyMarks ? tlaGrading.remark : '')

  return (
    <div
      ref={cardRef}
      className={cn(
        "report-card-adv-container relative bg-white overflow-hidden shadow-2xl mx-auto border border-slate-200 select-none",
        className
      )}
      style={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box',
        color: '#000000'
      }}
    >
      {/* Background Template Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/level-advanced-template.jpg"
        alt="Advanced Academic Transcript Template"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        crossOrigin="anonymous"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

        .adv-overlay-input {
          position: absolute;
          background: rgba(14, 165, 233, 0.04);
          border: 1px dashed rgba(14, 165, 233, 0.3);
          outline: none;
          color: #000000;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          line-height: 1;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
          border-radius: 2px;
          padding: 0 4px;
          box-sizing: border-box;
        }

        .adv-overlay-input:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.6);
        }

        .adv-overlay-input:focus:not(:disabled) {
          background: rgba(14, 165, 233, 0.12);
          border: 1.5px solid #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }

        @media print {
          .adv-overlay-input {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }
          .report-card-adv-container {
            box-shadow: none !important;
            border: none !important;
          }
        }
      ` }} />

      {/* STUDENT INFORMATION OVERLAYS */}
      <input
        type="text"
        value={values.studentName}
        onChange={e => handleValueChange('studentName', e.target.value)}
        disabled={readOnly}
        placeholder="Enter Student Name"
        className="adv-overlay-input font-bold"
        style={{ top: '20.0%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.fatherName || ''}
        onChange={e => handleValueChange('fatherName', e.target.value)}
        disabled={readOnly}
        placeholder="Enter Father's Name"
        className="adv-overlay-input font-bold"
        style={{ top: '22.1%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.programLevel || 'Advanced'}
        onChange={e => handleValueChange('programLevel', e.target.value)}
        disabled={readOnly}
        placeholder="Program / Level"
        className="adv-overlay-input font-bold"
        style={{ top: '24.2%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.dateOfCompletion || ''}
        onChange={e => handleValueChange('dateOfCompletion', e.target.value)}
        disabled={readOnly}
        placeholder="e.g. August 2026"
        className="adv-overlay-input font-bold"
        style={{ top: '26.3%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.transcriptNo || defaultTranscriptNo}
        onChange={e => handleValueChange('transcriptNo', e.target.value)}
        disabled={readOnly}
        placeholder="Transcript No."
        className="adv-overlay-input font-bold"
        style={{ top: '28.4%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      {/* OBTAINED MARKS OVERLAYS (Centered in 75.5% to 94% cell) */}
      <input
        type="text"
        value={values.listeningMarks ?? ''}
        onChange={e => handleValueChange('listeningMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '38.6%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.speakingMarks ?? ''}
        onChange={e => handleValueChange('speakingMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '42.4%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.readingMarks ?? ''}
        onChange={e => handleValueChange('readingMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '46.2%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.writingMarks ?? ''}
        onChange={e => handleValueChange('writingMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '50.0%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.grammarMarks ?? ''}
        onChange={e => handleValueChange('grammarMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '53.6%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.attendanceMarks ?? ''}
        onChange={e => handleValueChange('attendanceMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '57.3%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.participationMarks ?? ''}
        onChange={e => handleValueChange('participationMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '61.0%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.disciplineMarks ?? ''}
        onChange={e => handleValueChange('disciplineMarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '64.7%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      {/* GRAND TOTAL OBTAINED OVERLAY */}
      <input
        type="text"
        value={displayTotalScore}
        onChange={e => handleValueChange('totalScore', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input text-center font-bold"
        style={{ top: '68.4%', left: '75.5%', width: '18.5%', height: '3.3%', fontSize: '15px' }}
      />

      {/* ACADEMIC STANDING OVERLAYS */}
      <input
        type="text"
        value={displayTotalScore}
        onChange={e => handleValueChange('totalScore', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input font-bold"
        style={{ top: '75.2%', left: '43.5%', width: '12%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayPercentage}
        onChange={e => handleValueChange('percentage', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input font-bold"
        style={{ top: '75.2%', left: '66.5%', width: '26%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayGrade}
        onChange={e => handleValueChange('finalGrade', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input font-bold"
        style={{ top: '78.2%', left: '43.5%', width: '12%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayRemarks}
        onChange={e => handleValueChange('remarks', e.target.value)}
        disabled={readOnly}
        className="adv-overlay-input font-bold"
        style={{ top: '78.2%', left: '64.5%', width: '29%', height: '1.9%', fontSize: '13px' }}
      />
    </div>
  )
}
