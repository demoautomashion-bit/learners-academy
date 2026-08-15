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
        color: '#000000',
        fontFamily: "'Montserrat', 'Inter', sans-serif"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');

        .l6-input-field {
          background: rgba(14, 165, 233, 0.03);
          border: 1px dashed rgba(14, 165, 233, 0.3);
          outline: none;
          color: #000;
          font-family: inherit;
          transition: all 0.15s ease;
          border-radius: 2px;
          padding: 0 4px;
        }

        .l6-input-field:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.6);
        }

        .l6-input-field:focus:not(:disabled) {
          background: rgba(14, 165, 233, 0.12);
          border: 1.5px solid #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }

        @media print {
          .l6-input-field {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .report-card-l6-container {
            box-shadow: none !important;
            border: none !important;
          }
        }
      ` }} />

      {/* Main Layout Container */}
      <div className="flex h-full w-full relative">
        
        {/* Left Dark Navy Banner */}
        <div className="w-[17%] bg-[#061447] h-full relative flex items-center justify-center shrink-0">
          <div className="transform -rotate-90 whitespace-nowrap text-white font-extrabold text-[42px] tracking-[0.25em] uppercase select-none">
            ACADEMIC TRANSCRIPT
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-[83%] h-full flex flex-col justify-between pt-10 pb-4 px-12 relative bg-white">

          {/* Header Section */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-4">
              <img 
                src="/Logo.jpg.jpeg" 
                alt="Logo" 
                className="w-16 h-20 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[#0e294b] font-medium text-lg leading-tight">The</span>
                <span className="text-[#0a3875] font-black text-4xl tracking-wider uppercase leading-none">
                  LEARNERS
                </span>
                <span className="text-[#0e294b] font-semibold text-lg leading-tight">Academy</span>
                <span className="text-[#092b5a] font-bold text-base mt-1">
                  English Language Program
                </span>
              </div>
            </div>
            <div className="pl-20 mt-1">
              <span className="font-serif italic text-[#3b82f6] text-xl tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Join To Learn
              </span>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="mt-6">
            <h2 className="text-[#000000] font-extrabold text-lg tracking-wide uppercase mb-3">
              STUDENT INFORMATION
            </h2>

            <div className="grid grid-cols-[160px_1fr] gap-y-2 text-base font-semibold text-slate-800 items-center">
              <div>Name:</div>
              <div>
                <input
                  type="text"
                  value={values.studentName}
                  onChange={e => handleValueChange('studentName', e.target.value)}
                  disabled={readOnly}
                  placeholder="Enter Student Name"
                  className="l6-input-field w-full text-base font-bold"
                />
              </div>

              <div>Father's Name:</div>
              <div>
                <input
                  type="text"
                  value={values.fatherName || ''}
                  onChange={e => handleValueChange('fatherName', e.target.value)}
                  disabled={readOnly}
                  placeholder="Enter Father's Name"
                  className="l6-input-field w-full text-base font-bold"
                />
              </div>

              <div>Program / Level:</div>
              <div>
                <input
                  type="text"
                  value={values.programLevel || 'Level Six'}
                  onChange={e => handleValueChange('programLevel', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full text-base font-extrabold"
                />
              </div>

              <div>Date of Completion:</div>
              <div>
                <input
                  type="text"
                  value={values.dateOfCompletion || ''}
                  onChange={e => handleValueChange('dateOfCompletion', e.target.value)}
                  disabled={readOnly}
                  placeholder="e.g. August 2026"
                  className="l6-input-field w-full text-base font-bold"
                />
              </div>

              <div>Transcript No.:</div>
              <div>
                <input
                  type="text"
                  value={values.transcriptNo || defaultTranscriptNo}
                  onChange={e => handleValueChange('transcriptNo', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full text-base font-black tracking-wide"
                />
              </div>
            </div>
          </div>

          {/* Performance Summary Table */}
          <div className="mt-4">
            <h2 className="text-[#000000] font-extrabold text-lg tracking-wide uppercase mb-3">
              PERFORMANCE SUMMARY
            </h2>

            <table className="w-full border-collapse border border-slate-900 text-sm">
              <thead>
                <tr className="bg-[#041549] text-white text-xs font-extrabold tracking-wider uppercase">
                  <th className="border border-slate-900 py-2.5 px-4 text-left w-[45%]">ASSESSMENT COMPONENTS</th>
                  <th className="border border-slate-900 py-2.5 px-4 text-center w-[25%]">TOTAL MARKS</th>
                  <th className="border border-slate-900 py-2.5 px-4 text-center w-[30%]">OBTAINED MARKS</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-900">
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Listening</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">100</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.listeningMarks ?? ''}
                      onChange={e => handleValueChange('listeningMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Speaking</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">100</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.speakingMarks ?? ''}
                      onChange={e => handleValueChange('speakingMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Reading</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">100</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.readingMarks ?? ''}
                      onChange={e => handleValueChange('readingMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Writing</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">100</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.writingMarks ?? ''}
                      onChange={e => handleValueChange('writingMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Grammar</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">100</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.grammarMarks ?? ''}
                      onChange={e => handleValueChange('grammarMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Attendance</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">60</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.attendanceMarks ?? ''}
                      onChange={e => handleValueChange('attendanceMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Participation</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">30</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.participationMarks ?? ''}
                      onChange={e => handleValueChange('participationMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-2 px-4 font-bold">Discipline</td>
                  <td className="border border-slate-900 py-2 px-4 text-center font-extrabold">10</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={values.disciplineMarks ?? ''}
                      onChange={e => handleValueChange('disciplineMarks', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-bold"
                    />
                  </td>
                </tr>
                <tr className="bg-[#dcd9d4] text-slate-950 font-black">
                  <td className="border border-slate-900 py-2.5 px-4 tracking-wider uppercase font-black">GRAND TOTAL</td>
                  <td className="border border-slate-900 py-2.5 px-4 text-center font-black text-base">600</td>
                  <td className="border border-slate-900 py-1 px-2 text-center">
                    <input
                      type="text"
                      value={displayTotalScore}
                      onChange={e => handleValueChange('totalScore', e.target.value)}
                      disabled={readOnly}
                      className="l6-input-field w-24 text-center font-black text-base"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Standing Section */}
          <div className="mt-4">
            <h2 className="text-[#000000] font-extrabold text-lg tracking-wide uppercase mb-2">
              ACADEMIC STANDING
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base font-semibold text-slate-900">
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Total Score:</span>
                <input
                  type="text"
                  value={displayTotalScore}
                  onChange={e => handleValueChange('totalScore', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Percentage:</span>
                <input
                  type="text"
                  value={displayPercentage}
                  onChange={e => handleValueChange('percentage', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Final Grade:</span>
                <input
                  type="text"
                  value={displayGrade}
                  onChange={e => handleValueChange('finalGrade', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Remarks:</span>
                <input
                  type="text"
                  value={displayRemarks}
                  onChange={e => handleValueChange('remarks', e.target.value)}
                  disabled={readOnly}
                  className="l6-input-field w-full font-bold"
                />
              </div>
            </div>
          </div>

          {/* Certification Paragraph */}
          <div className="mt-4 text-xs font-medium text-slate-800 leading-relaxed">
            This transcript certifies that the student has completed Level Six of the English Language Program at The Learners Academy. The grades and evaluations recorded herein reflect the student’s performance in the assessed components during the stated period of study.
          </div>

          {/* Signatures & Footer Banner */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex justify-between items-end px-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-48 border-b border-slate-400"></div>
                <span className="text-xs font-semibold text-slate-800">Executive Director</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-48 border-b border-slate-400"></div>
                <span className="text-xs font-semibold text-slate-800">Instructor, Level Six</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Full Width Address Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#061447] text-white py-1.5 text-[10px] font-extrabold tracking-widest text-center uppercase z-10">
        THE LEARNERS ACADEMY | ALAMDAR ROAD, QUETTA, PAKISTAN | +92 300 3883286 | +92 311 5455533
      </div>
    </div>
  )
}
