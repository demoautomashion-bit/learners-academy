'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  Calendar,
  Printer,
  ChevronLeft
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Button } from '@/components/ui/button'

export default function ReceiptPrintPage() {
  const hasMounted = useHasMounted()
  const searchParams = useSearchParams()
  const { students, isInitialized } = useData()
  
  const studentId = searchParams.get('studentId')
  const amount = searchParams.get('amount')
  const date = searchParams.get('date') || new Date().toLocaleDateString()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const student = students.find(s => s.id === studentId)

  return (
    <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0">
      {/* Print Controls - Hidden during print */}
      <div className="mb-12 flex items-center justify-between print:hidden max-w-2xl mx-auto bg-primary/5 p-6 rounded-3xl border border-primary/10">
        <Button variant="ghost" className="font-normal" onClick={() => window.history.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Registry
        </Button>
        <Button className="font-normal bg-primary shadow-lg shadow-primary/20" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Commit to Print
        </Button>
      </div>

      {/* Main Receipt Shell */}
      <div className="max-w-2xl mx-auto border-2 border-black/5 p-16 relative overflow-hidden bg-white shadow-2xl print:shadow-none print:border-none print:max-w-[190mm]">
        {/* Anti-Forgery Hologram Pattern (Faded) */}
        <div className="absolute top-0 right-0 opacity-[0.03] rotate-45 translate-x-12 -translate-y-12">
            <Logo size="xl" variant="dark" showText={false} />
        </div>

        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-black pb-12 mb-12">
            <div className="space-y-4">
                <Logo size="lg" variant="dark" />
                <div className="space-y-1 text-[10px] uppercase tracking-widest font-bold opacity-60">
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Sector F-7, Jinnah Avenue, Islamabad</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> +92 51 000 0000</div>
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> accounts@thelearnersacademy.edu.pk</div>
                </div>
            </div>
            <div className="text-right">
                <h1 className="text-4xl font-medium tracking-tighter uppercase mb-2">Receipt</h1>
                <div className="flex flex-col items-end gap-1.5 pt-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40">
                        <Hash className="w-3 h-3" /> SERIAL: ORD-{Math.floor(100000 + Math.random() * 900000)}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40">
                        <Calendar className="w-3 h-3" /> DATE: {date}
                    </div>
                </div>
            </div>
        </div>

        {/* Payer Information */}
        <div className="grid grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 block">Candidate Identity</span>
                <div className="space-y-1">
                    <p className="text-xl font-medium">{student?.name || 'Institutional Candidate'}</p>
                    <p className="text-xs opacity-60">Ref ID: {student?.studentId || 'REF-TBD'}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1">{student?.level} Tier</p>
                </div>
            </div>
            <div className="space-y-4 text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 block">Payment Purpose</span>
                <div className="space-y-1">
                    <p className="text-lg font-medium">Monthly Academic Tuition</p>
                    <p className="text-xs opacity-60">Cycle: June - July 2026</p>
                </div>
            </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-black mb-16 px-10 py-12 text-white flex justify-between items-center rounded-sm">
            <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 block">Amount Collected</span>
                <p className="text-4xl font-medium font-serif">PKR {Number(amount || 0).toLocaleString()}</p>
            </div>
            <div className="text-right space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 block">Status</span>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 border border-white/20 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Successfully Logged</span>
                </div>
            </div>
        </div>

        {/* Legal Disclaimer & Audit */}
        <div className="space-y-8">
            <div className="p-8 bg-black/[0.02] border border-black/5 rounded-sm">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-30 block mb-4 underline">Institutional Clause</span>
                <p className="text-[10px] leading-relaxed opacity-60 font-medium">
                    This is an electronically generated receipt verified by the institutional ledger. This document serves as a proof of transaction for the specified academic period. No refunds are applicable on disbursed tuition fees under academy policy clause 14-B.
                </p>
            </div>
            
            <div className="flex justify-between items-end pt-8">
                <div className="space-y-2">
                    <div className="w-48 h-px bg-black opacity-10" />
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-20 block">Institutional Seal Location</span>
                </div>
                <div className="text-right space-y-2">
                    <p className="text-xs font-bold leading-none">Authorized Accountant</p>
                    <span className="text-[9px] uppercase tracking-widest opacity-30 block">Electronic Signature Appended</span>
                </div>
            </div>
        </div>

        {/* Footer Pattern */}
        <div className="mt-24 pt-8 border-t border-black/5 flex justify-center">
            <span className="text-[8px] uppercase tracking-[0.5em] font-bold opacity-20">The Learners Academy - Islamabad Branch</span>
        </div>
      </div>
    </div>
  )
}
