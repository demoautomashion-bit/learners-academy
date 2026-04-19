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
  type: string
  receiptId: string
  address: string
  tuitionFee?: number
  admissionFee?: number
  discount?: number
  totalFee?: number
  paid?: number
  dues?: number
  term?: string
  paperSize?: '80mm' | '58mm'
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
  paperSize = '80mm'
}: ReceiptContentProps) {
  const now = new Date()
  const dateStr = format(now, 'dd MMM yyyy')
  const timeStr = format(now, 'hh:mm a')

  const computedTotal = totalFee ?? (tuitionFee + admissionFee - discount)
  const computedDues = dues ?? (computedTotal - paid)

  const feeRows = [
    { label: 'Tuition Fee:', value: tuitionFee },
    { label: 'Admission Fee:', value: admissionFee },
    { label: 'Discount:', value: discount },
    { label: 'Total Fee:', value: computedTotal, bold: true },
    { label: 'Paid:', value: paid, bold: true },
    { label: 'Dues:', value: computedDues, bold: true },
  ]

  return (
    <div 
      className="bg-white text-black font-mono leading-tight selection:bg-transparent print:p-0 mx-auto overflow-hidden break-words text-[10.5px]"
      style={{ width: paperSize, minWidth: 0 }}
    >
      {/* HEADER SECTION */}
      <div className="flex items-start pb-2 border-b border-black border-dashed mt-1">
        <div className="w-[14mm] shrink-0 pt-1">
          {/* Logo container matching specific exact dimensions */}
          <img src="/placeholder-logo.svg" alt="Logo" className="w-[12mm] h-[12mm] object-contain grayscale" />
        </div>
        <div className="flex-1 text-center pr-[14mm] flex flex-col items-center justify-center">
          <h1 className="font-bold uppercase text-[12px] leading-tight text-black">THE LEARNERS ACADEMY</h1>
          <h2 className="font-bold uppercase text-[10px] leading-tight mt-0.5 text-black">English Language Program</h2>
          <p className="text-[9px] mt-1 leading-snug font-medium text-black">{address}</p>
          <p className="text-[9px] leading-snug font-medium text-black">+92-3083663386 / +92-3110456933</p>
        </div>
      </div>

      {/* STUDENT INFO SECTION */}
      <div className="pt-2 pb-1.5 flex flex-col gap-[1px] text-black w-full">
        <div className="flex justify-between items-start w-full">
          <div className="flex-1 flex justify-between pr-2">
             <span className="font-bold shrink-0">Student&apos;s ID:</span>
             <span className="text-right flex-1 break-words ml-2">{student.studentId || 'N/A'}</span>
          </div>
          <div className="shrink-0 w-[26mm] flex justify-between pl-1">
             <span className="font-bold">Date:</span>
             <span className="text-right whitespace-nowrap">{dateStr}</span>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <span className="font-bold shrink-0">Name:</span>
          <span className="text-right flex-1 break-words ml-2">{student.name}</span>
        </div>
        
        <div className="flex justify-between w-full">
          <span className="font-bold shrink-0">Father&apos;s Name:</span>
          <span className="text-right flex-1 break-words ml-2">{student.guardianName || 'N/A'}</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="font-bold shrink-0">Term:</span>
          <span className="text-right flex-1 break-words ml-2">{term || 'Spring-2026'}</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="font-bold shrink-0">Class:</span>
          <span className="text-right flex-1 break-words ml-2">{course.title}</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="font-bold shrink-0">Timing:</span>
          <span className="text-right flex-1 break-words ml-2">{student.classTiming || '-'}</span>
        </div>

        <div className="flex justify-between items-start w-full">
          <div className="flex-1 flex justify-between pr-2">
             <span className="font-bold shrink-0">Teacher:</span>
             <span className="text-right flex-1 break-words ml-2">{course.teacherName || 'TBC'}</span>
          </div>
          <div className="shrink-0 w-[26mm] flex justify-between pl-1">
             <span className="font-bold">Time:</span>
             <span className="text-right whitespace-nowrap uppercase">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* FEE TABLE */}
      <table className="w-full border-collapse border border-black mt-1 text-[10px] text-black">
        <thead>
          <tr className="border-b border-black text-black">
            <th className="text-left px-1.5 py-1 font-bold border-r border-black w-2/3">Fee Type</th>
            <th className="text-right px-1.5 py-1 font-bold w-1/3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {feeRows.map((row) => (
            <tr key={row.label} className="border-b border-black last:border-b-0 text-black">
              <td className={`px-1.5 py-[3px] border-r border-black ${row.bold ? 'font-bold' : ''}`}>
                {row.label}
              </td>
              <td className={`px-1.5 py-[3px] text-right ${row.bold ? 'font-bold' : ''}`}>
                {row.value.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* STAMP SECTION (CRITICAL REQUIREMENT) */}
      <div className="mt-2 w-full border border-black p-1 flex flex-col items-center justify-start h-[20mm] relative overflow-visible box-border">
        <span className="text-[8px] font-bold uppercase tracking-widest absolute -top-[5px] left-2 bg-white px-1 z-10 text-black print:bg-white print:z-10">Received By</span>
        
        {/* Placeholder for circular stamp */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16mm] h-[16mm] flex items-center justify-center rounded-full border-2 border-black opacity-90 text-black print:border-black print:opacity-100">
           <div className="w-[14mm] h-[14mm] rounded-full border border-black flex items-center justify-center">
              <span className="text-[5px] font-black uppercase tracking-[2px] transform -rotate-[15deg]">PAID</span>
           </div>
        </div>
      </div>

      {/* NOTE */}
      <div className="border-t border-black border-dashed pt-1.5 mt-2 text-black text-center">
        <p className="font-bold text-[9px] mb-0.5">Note:</p>
        <p className="text-[8.5px] italic leading-snug px-1">
          &quot;Students are advised to confirm their availability prior to enrolment. Once the registration process is completed, all fees paid are non-refundable under any circumstances.&quot;
        </p>
      </div>

      {/* FOOTER SECTION */}
      <div className="mt-2 pt-1.5 border-t border-black border-dashed text-center space-y-0.5 pb-2 text-black">
        <p className="font-bold text-[9.5px] tracking-widest uppercase">{type}</p>
        <p className="text-[7.5px] opacity-70 print:opacity-100">Software By: NextLamine Solutions</p>
      </div>

    </div>
  )
}
