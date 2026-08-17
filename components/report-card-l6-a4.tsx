'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getTLAGrading } from '@/lib/utils/tla-grading'
import { generateTranscriptNumber } from '@/lib/utils/transcript-number'

export interface LevelSixTranscriptValues {
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

interface LevelSixTranscriptProps {
  initialValues?: Partial<LevelSixTranscriptValues>
  onChange?: (values: LevelSixTranscriptValues) => void
  readOnly?: boolean
  className?: string
  cardRef?: React.RefObject<HTMLDivElement>
  sequenceNumber?: number
}

export function ReportCardL6A4({
  initialValues,
  onChange,
  readOnly = false,
  className,
  cardRef,
  sequenceNumber = 1
}: LevelSixTranscriptProps) {
  const defaultTranscriptNo = generateTranscriptNumber('Level Six', sequenceNumber)

  const [values, setValues] = useState<LevelSixTranscriptValues>({
    studentName: '',
    fatherName: '',
    programLevel: 'Level Six',
    dateOfCompletion: '',
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
        transcriptNo: initialValues.transcriptNo || prev.transcriptNo || defaultTranscriptNo
      }))
    }
  }, [initialValues, defaultTranscriptNo])

  const handleValueChange = <K extends keyof LevelSixTranscriptValues>(key: K, value: LevelSixTranscriptValues[K]) => {
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
        "report-card-l6-container relative bg-white overflow-hidden shadow-2xl mx-auto border border-slate-200 select-none",
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
        src="/level-6-template.jpg"
        alt="Level Six Academic Transcript Template"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        crossOrigin="anonymous"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

        .l6-overlay-input {
          position: absolute;
          background: rgba(14, 165, 233, 0.04);
          border: 1px dashed rgba(14, 165, 233, 0.3);
          outline: none;
          color: #000000;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          line-height: 1.2;
          transition: all 0.15s ease;
          border-radius: 2px;
          padding: 0 4px;
        }

        .l6-overlay-input:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.6);
        }

        .l6-overlay-input:focus:not(:disabled) {
          background: rgba(14, 165, 233, 0.12);
          border: 1.5px solid #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }

        @media print {
          .l6-overlay-input {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }
          .report-card-l6-container {
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
        className="l6-overlay-input font-bold"
        style={{ top: '19.3%', left: '39.0%', width: '53.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.fatherName || ''}
        onChange={e => handleValueChange('fatherName', e.target.value)}
        disabled={readOnly}
        placeholder="Enter Father's Name"
        className="l6-overlay-input font-bold"
        style={{ top: '21.4%', left: '45.5%', width: '46.5%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.programLevel || 'Level Six'}
        onChange={e => handleValueChange('programLevel', e.target.value)}
        disabled={readOnly}
        placeholder="Program / Level"
        className="l6-overlay-input font-bold"
        style={{ top: '23.5%', left: '48.0%', width: '44.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.dateOfCompletion || ''}
        onChange={e => handleValueChange('dateOfCompletion', e.target.value)}
        disabled={readOnly}
        placeholder="e.g. August 2026"
        className="l6-overlay-input font-bold"
        style={{ top: '25.6%', left: '52.0%', width: '40.0%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={values.transcriptNo || defaultTranscriptNo}
        onChange={e => handleValueChange('transcriptNo', e.target.value)}
        disabled={readOnly}
        placeholder="Transcript No."
        className="l6-overlay-input font-bold"
        style={{ top: '27.7%', left: '46.5%', width: '45.5%', height: '1.9%', fontSize: '14px' }}
      />

      {/* OBTAINED MARKS OVERLAYS (Centered in 75.5% to 94% cell) */}
      <input
        type="text"
        value={values.listeningMarks ?? ''}
        onChange={e => handleValueChange('listeningMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '37.2%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.speakingMarks ?? ''}
        onChange={e => handleValueChange('speakingMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '41.0%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.readingMarks ?? ''}
        onChange={e => handleValueChange('readingMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '44.8%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.writingMarks ?? ''}
        onChange={e => handleValueChange('writingMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '48.6%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.grammarMarks ?? ''}
        onChange={e => handleValueChange('grammarMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '52.2%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.attendanceMarks ?? ''}
        onChange={e => handleValueChange('attendanceMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '55.9%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.participationMarks ?? ''}
        onChange={e => handleValueChange('participationMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '59.6%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      <input
        type="text"
        value={values.disciplineMarks ?? ''}
        onChange={e => handleValueChange('disciplineMarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '63.3%', left: '75.5%', width: '18.5%', height: '3.2%', fontSize: '15px' }}
      />

      {/* GRAND TOTAL OBTAINED OVERLAY */}
      <input
        type="text"
        value={displayTotalScore}
        onChange={e => handleValueChange('totalScore', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input text-center font-bold"
        style={{ top: '67.0%', left: '75.5%', width: '18.5%', height: '3.3%', fontSize: '15px' }}
      />

      {/* ACADEMIC STANDING OVERLAYS */}
      <input
        type="text"
        value={displayTotalScore}
        onChange={e => handleValueChange('totalScore', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input font-bold"
        style={{ top: '75.2%', left: '43.5%', width: '12%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayPercentage}
        onChange={e => handleValueChange('percentage', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input font-bold"
        style={{ top: '75.2%', left: '66.5%', width: '26%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayGrade}
        onChange={e => handleValueChange('finalGrade', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input font-bold"
        style={{ top: '78.2%', left: '43.5%', width: '12%', height: '1.9%', fontSize: '14px' }}
      />

      <input
        type="text"
        value={displayRemarks}
        onChange={e => handleValueChange('remarks', e.target.value)}
        disabled={readOnly}
        className="l6-overlay-input font-bold"
        style={{ top: '78.2%', left: '64.5%', width: '29%', height: '1.9%', fontSize: '13px' }}
      />
    </div>
  )
}
