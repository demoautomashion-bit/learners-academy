'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { ReceiptContent } from '@/components/receipt/receipt-content'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

const ADDRESS = "Tanzeem School, Suzuki Stop, Sar-e-Khartar, Mominabad, Alamdar Road, Quetta, Pakistan"

function ReceiptPrintContent() {
  const searchParams = useSearchParams()
  const { students, courses, isInitialized } = useData()
  const [hasPrinted, setHasPrinted] = useState(false)

  const studentId  = searchParams?.get('studentId')
  const courseId   = searchParams?.get('courseId')
  const tuitionFee = Number(searchParams?.get('tuitionFee') || 0)
  const admissionFee = Number(searchParams?.get('admissionFee') || 0)
  const discount   = Number(searchParams?.get('discount') || 0)
  const totalFee   = Number(searchParams?.get('totalFee') || 0)
  const paid       = Number(searchParams?.get('paid') || 0)
  const dues       = Number(searchParams?.get('dues') || 0)
  const term       = searchParams?.get('term') || 'Spring-2026'
  const teacherName = searchParams?.get('teacherName') || ''

  const student = useMemo(() => students?.find(s => s.id === studentId), [students, studentId])
  const course  = useMemo(() => courses?.find(c => c.id === courseId),   [courses,  courseId])

  const receiptId = useMemo(() => `REC-${Math.floor(100000 + Math.random() * 900000)}`, [])

  useEffect(() => {
    if (isInitialized && student && course && !hasPrinted) {
      const timer = setTimeout(() => {
        window.print()
        setHasPrinted(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, student, course, hasPrinted])

  if (!isInitialized) return <DashboardSkeleton />
  if (!student || !course) return (
    <div className="flex items-center justify-center h-screen font-serif text-muted-foreground opacity-30 text-xs italic">
       Incomplete Archive Data. System halted.
    </div>
  )

  const sharedProps = {
    student: {
      name: student.name,
      guardianName: student.guardianName,
      studentId: student.studentId,
      classTiming: student.classTiming,
    },
    course: {
      title: course.title,
      teacherName,
    },
    receiptId,
    address: ADDRESS,
    tuitionFee,
    admissionFee,
    discount,
    totalFee: totalFee || undefined,
    paid,
    dues: dues || undefined,
    term,
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-start p-0">
      <div id="thermal-receipt-container" className="mx-auto bg-white">
        {/* Office Copy */}
        <ReceiptContent {...sharedProps} type="OFFICE COPY" />

        {/* Tear Line */}
        <div className="w-[72mm] border-t-2 border-black border-dashed my-6 relative">
          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-2 text-[8px] font-bold text-black opacity-30 print:hidden">
            ✂ Tear Here
          </span>
        </div>

        {/* Student Copy */}
        <ReceiptContent {...sharedProps} type="STUDENT COPY" />
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 72mm auto;
            margin: 0;
          }
          body {
            background-color: white;
            margin: 0;
            padding: 0;
          }
          #thermal-receipt-container {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function ReceiptPrintPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ReceiptPrintContent />
    </Suspense>
  )
}
