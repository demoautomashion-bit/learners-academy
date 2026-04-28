'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReceiptContent } from './receipt-content'
import { Printer, X, MonitorSmartphone } from 'lucide-react'

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
}

const ADDRESS = "Tanzeem School, Suzuki Stop, Sar-e-Khartar, Mominabad, Alamdar Road Quetta, Pakistan"

export function ReceiptModal({ open, onOpenChange, student, course }: ReceiptModalProps) {
  const receiptId = `REC-${Math.floor(100000 + Math.random() * 900000)}`
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm'>('80mm')
  const [copies, setCopies] = useState<1 | 2>(2)

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 border-none bg-accent/5 backdrop-blur-xl max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:bg-transparent print:p-0 print:border-none print:shadow-none pointer-events-auto">
        
        <DialogHeader className="p-6 pb-4 bg-background/50 border-b border-border/10 print:hidden flex flex-row items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <div>
              <DialogTitle className="font-serif text-2xl font-medium tracking-tight flex items-center gap-2">
                 <Printer className="w-5 h-5 text-primary" /> Receipt Preview
              </DialogTitle>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1 font-bold">WYSIWYG View</p>
          </div>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 opacity-50" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 p-6 pt-4 print:p-0 print:block">
          
          {/* Controls UI */}
          <div className="w-full flex items-center justify-between bg-white dark:bg-black/50 p-3 rounded-2xl border border-black/5 dark:border-white/5 print:hidden shadow-sm">
             <div className="flex items-center gap-2">
                 <MonitorSmartphone className="w-4 h-4 text-muted-foreground ml-1" />
                 <span className="text-xs font-semibold text-muted-foreground mr-2">Paper:</span>
                 <div className="flex bg-muted/30 p-1 rounded-xl">
                    <button 
                       onClick={() => setPaperSize('58mm')}
                       className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paperSize === '58mm' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-black/5'}`}
                    >58mm</button>
                    <button 
                       onClick={() => setPaperSize('80mm')}
                       className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paperSize === '80mm' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-black/5'}`}
                    >80mm</button>
                 </div>
             </div>
             <Button 
                onClick={handlePrint} 
                className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20 h-10 px-6 font-semibold flex items-center gap-2"
             >
               <Printer className="w-4 h-4" />
               Print
             </Button>
          </div>

          {/* Printable Area Wrapper */}
          <div id="thermal-receipt-printable" className="bg-white shadow-2xl p-4 print:shadow-none print:p-0 relative flex flex-col items-center border border-black/10 print:border-none rounded-2xl print:rounded-none overflow-visible">
            
            <ReceiptContent 
              student={student} 
              course={course} 
              type={copies === 2 ? "OFFICE COPY" : "CUSTOMER COPY"} 
              receiptId={receiptId}
              address={ADDRESS}
              paperSize={paperSize}
            />

            {copies === 2 && (
              <>
                {/* Tear Line - strict widths mapped to papersize */}
                <div 
                   className="border-t-2 border-black border-dashed my-6 print:my-8 relative"
                   style={{ width: paperSize }}
                >
                    <span className="absolute left-1/2 -top-[7px] -translate-x-1/2 bg-white px-2 text-[8px] font-bold text-black uppercase tracking-widest z-10 print:bg-white text-center">Tear Here</span>
                </div>

                <ReceiptContent 
                  student={student} 
                  course={course} 
                  type="STUDENT COPY" 
                  receiptId={receiptId}
                  address={ADDRESS}
                  paperSize={paperSize}
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        @media print {
          /* 1. Ensure body has zero margins */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* 2. Hide everything under body EXCEPT the Radix UI portal */
          body > *:not([data-radix-portal]) {
            display: none !important;
          }

          /* 3. Hide the Dialog Backdrop Overlay (Radix adds this inside portal) */
          [data-radix-portal] > div > div:not([role="dialog"]) {
            display: none !important;
          }

          /* 4. Release the Dialog wrapper from fixed positioning Constraints */
          [data-radix-portal] > div {
             position: absolute !important;
             left: 0 !important;
             top: 0 !important;
             display: block !important;
          }

          /* 5. Set the Dialog Content to block flow to prevent absolute truncation bugs */
          [role="dialog"] {
            position: absolute !important;
            transform: none !important;
            /* Use a 4mm safe margin on each side (8mm total reduction) */
            width: calc(${paperSize} - 8mm) !important;
            max-width: calc(${paperSize} - 8mm) !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 4mm !important; /* Center the content within the page */
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            overflow: visible !important;
            left: 0 !important;
            top: 0 !important;
          }

          /* 6. Enforce hard constraints on the actual print root */
          #thermal-receipt-printable {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            display: block !important;
            overflow: visible !important;
          }

          /* 7. Strip Tailwind print:hidden classes via pure CSS */
          .print-hidden, .print\\:hidden, .print\\:hidden * {
             display: none !important;
          }

          /* 8. Accurate Thermal Pagination Setup */
          @page {
            size: ${paperSize} auto;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 9. Force Print Ink Colors for Borders and Texts */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </Dialog>
  )
}
