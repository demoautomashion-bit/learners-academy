'use client'

import React from 'react'
import { format } from 'date-fns'

interface ReceiptContentProps {
  student: {
    name: string
    guardianName?: string
    studentId?: string
    classTiming?: string
  }
  course: {
    title: string
    teacherName?: string
  }
  type: 'OFFICE COPY' | 'STUDENT COPY'
  receiptId: string
  address: string
  tuitionFee?: number
  admissionFee?: number
  discount?: number
  totalFee?: number
  paid?: number
  dues?: number
  term?: string
}

export function ReceiptContent({
  student,
  course,
  type,
  receiptId,
  address,
  tuitionFee = 0,
  admissionFee = 0,
  discount = 0,
  totalFee,
  paid = 0,
  dues,
  term,
}: ReceiptContentProps) {
  const now = new Date()
  const dateStr = format(now, 'dd MMMM yyyy')

  const computedTotal = totalFee ?? (tuitionFee + admissionFee - discount)
  const computedDues = dues ?? (computedTotal - paid)

  const feeRows = [
    { label: 'Tution Fee:', value: tuitionFee },
    { label: 'Admission Fee:', value: admissionFee },
    { label: 'Discount:', value: discount },
    { label: 'Total Fee:', value: computedTotal, bold: true },
    { label: 'Paid:', value: paid, bold: true },
    { label: 'Dues:', value: computedDues, bold: true },
  ]

  return (
    <div className="w-[72mm] bg-white text-black font-mono text-[10.5px] leading-tight selection:bg-transparent print:p-0">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="text-center pb-2 border-b border-black border-dashed">
        {/* Emblem */}
        <div className="flex justify-center mb-1.5 pt-2">
          <div className="w-[38px] h-[38px] rounded-full border-2 border-black flex items-center justify-center relative">
            <div className="w-[30px] h-[30px] rounded-full border border-black flex items-center justify-center">
              <span className="text-[7px] font-black uppercase leading-[9px] text-center tracking-tighter">TLA</span>
            </div>
          </div>
        </div>
        <h1 className="font-black uppercase text-[12px] tracking-tight leading-tight">The Learners Academy</h1>
        <p className="text-[9px] font-bold uppercase tracking-wide leading-tight">{course.title || 'English Language Program'}</p>
        <p className="text-[8px] leading-snug mt-0.5 opacity-80">Address: {address}</p>
        <p className="text-[8px] opacity-80">Phone: +92-3083663386 / +92-3110456933</p>
      </div>

      {/* ── STUDENT INFO ───────────────────────────────────── */}
      <div className="pt-2 pb-1.5 space-y-[3px]">
        {/* Student ID + Date on same line */}
        <div className="flex justify-between">
          <span><span className="font-bold">Student&apos;s ID:</span> {student.studentId || 'N/A'}</span>
          <span><span className="font-bold">Date:</span> {dateStr}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Name:</span>
          <span>{student.name}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Father&apos;s Name:</span>
          <span>{student.guardianName || 'N/A'}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Term:</span>
          <span>{term || 'Spring-2026'}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Class:</span>
          <span>{course.title}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Timing:</span>
          <span>{student.classTiming || 'TBC'}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold shrink-0">Teacher:</span>
          <span>{course.teacherName || 'TBC'}</span>
        </div>
      </div>

      {/* ── FEE TABLE ──────────────────────────────────────── */}
      <table className="w-full border-collapse border border-black text-[10.5px] mt-1">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left px-1.5 py-1 font-bold border-r border-black">Fee Type</th>
            <th className="text-right px-1.5 py-1 font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {feeRows.map((row) => (
            <tr key={row.label} className="border-b border-black">
              <td className={`px-1.5 py-[3px] border-r border-black ${row.bold ? 'font-bold' : ''}`}>{row.label}</td>
              <td className={`px-1.5 py-[3px] text-right ${row.bold ? 'font-bold' : ''}`}>{row.value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── RECEIVED BY / PAID STAMP ───────────────────────── */}
      <div className="mt-2 mb-1.5 flex flex-col items-center gap-1">
        <span className="text-[9px] font-bold uppercase tracking-widest">Received By</span>
        {/* Circular PAID Stamp */}
        <div className="relative w-[62px] h-[62px] flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-black" />
          {/* Inner content */}
          <div className="absolute inset-[5px] rounded-full border border-black flex flex-col items-center justify-center">
            <span className="text-[7px] font-black uppercase tracking-[3px] leading-none">PAID</span>
            <div className="w-full border-t border-black my-[2px]" />
            <span className="text-[5px] font-bold uppercase tracking-tight text-center leading-none px-1">The Learners Academy</span>
          </div>
        </div>
      </div>

      {/* ── NOTE ───────────────────────────────────────────── */}
      <div className="border-t border-black border-dashed pt-2 mt-1">
        <p className="font-bold text-[9px] mb-0.5">Note:</p>
        <p className="text-[8.5px] italic leading-snug opacity-90">
          &quot;Students are advised to confirm their availability prior to enrolment. Once the registration process is completed, all fees paid are non-refundable under any circumstances.&quot;
        </p>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div className="mt-2 pt-1.5 border-t border-black border-dashed text-center space-y-0.5 pb-2">
        <p className="font-bold text-[9.5px] tracking-widest uppercase">{type}</p>
        <p className="text-[7.5px] opacity-50">Software By: NextLamine Solutions</p>
      </div>

    </div>
  )
}
