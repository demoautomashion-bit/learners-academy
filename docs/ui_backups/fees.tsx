'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight,
  HandCoins,
  History,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getFeePayments, recordPayment } from '@/lib/actions/fees'

export default function FeeRegistryPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const data = await getFeePayments()
      setPayments(data)
    } catch (error) {
      toast.error('Failed to load fee registry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleRecordPayment = async () => {
    if (!selectedPayment || !paymentAmount) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await recordPayment(selectedPayment.id, amount)
      toast.success(`Rs. ${amount.toLocaleString()} recorded for ${selectedPayment.student.name}`)
      setIsModalOpen(false)
      setPaymentAmount('')
      fetchPayments()
    } catch (error) {
      toast.error('Failed to update payment record')
    }
  }

  const filteredPayments = payments.filter(p => 
    p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalExpected: payments.reduce((acc, p) => acc + p.totalAmount, 0),
    totalCollected: payments.reduce((acc, p) => acc + p.amountPaid, 0),
    pendingCount: payments.filter(p => p.status !== 'Paid').length
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20 px-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
             Institutional Fee Registry
          </h1>
          <p className="font-sans text-[10px] tracking-[0.3em] font-black uppercase opacity-30">
             Financial Audit // Real-time Tuition Tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search student or class..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-11 pl-10 rounded-xl border-primary/10 bg-card/60 backdrop-blur-md focus-visible:ring-primary/20 transition-all font-medium text-sm"
              />
           </div>
           <Button variant="outline" className="h-11 px-5 rounded-xl border-primary/10 bg-card hover:bg-primary/5 transition-premium font-bold tracking-tight text-sm">
              <Download className="w-3.5 h-3.5 opacity-40 mr-2" />
              Export Reports
           </Button>
        </div>
      </div>

      {/* 2. Quick Summary Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SummaryCard label="Actual Collection" value={`Rs. ${stats.totalCollected.toLocaleString()}`} icon={HandCoins} color="oklch(0.70 0.17 160)" />
         <SummaryCard label="Outstanding Balance" value={`Rs. ${(stats.totalExpected - stats.totalCollected).toLocaleString()}`} icon={AlertCircle} color="oklch(0.78 0.18 75)" />
         <SummaryCard label="Payment Compliance" value={`${payments.length > 0 ? Math.round(((payments.length - stats.pendingCount) / payments.length) * 100) : 0}%`} icon={History} color="oklch(0.62 0.17 240)" />
      </div>

      {/* 3. The Main Ledger */}
      <Card className="border-primary/5 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl min-h-[600px]">
         <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="font-serif text-xl font-bold">Billing Registry</CardTitle>
               <CardDescription className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Active Student-Course Payment states</CardDescription>
            </div>
            <Badge variant="outline" className="font-sans text-[10px] font-black uppercase tracking-widest border-primary/10 opacity-40 px-3 py-1">
               System Live // Term Auto-Audit
            </Badge>
         </CardHeader>
         <CardContent className="p-0">
            {loading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-20">
                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                 <p className="font-sans text-[10px] font-black uppercase tracking-widest">Parsing Registry...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Receipt className="w-6 h-6 text-primary opacity-20" />
                 </div>
                 <div className="text-center space-y-1">
                    <p className="font-serif text-lg font-bold opacity-30">No Billing Records Found</p>
                    <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-black opacity-10">Records will appear upon student enrollment in classes</p>
                 </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="font-sans border-b border-primary/5 bg-muted/5">
                         <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Student Personnel</th>
                         <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Enrolled Course</th>
                         <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Total Fee</th>
                         <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Amount Paid</th>
                         <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Remaining</th>
                         <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Status</th>
                         <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Audit Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-primary/5">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/10 transition-premium group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <span className="font-sans text-xs font-black tracking-tighter">{p.student.name.split(' ').map((n: string) => n[0]).join('')}</span>
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="font-serif font-bold text-base text-foreground/80">{p.student.name}</p>
                                    <p className="text-[10px] font-sans font-bold text-muted-foreground/30 uppercase tracking-widest">{p.student.studentId || 'No ID'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6 font-medium text-sm text-foreground/70">{p.course.title}</td>
                           <td className="px-6 py-6 font-serif font-bold text-base opacity-40">Rs. {p.totalAmount.toLocaleString()}</td>
                           <td className="px-6 py-6 font-serif font-bold text-base text-primary">Rs. {p.amountPaid.toLocaleString()}</td>
                           <td className="px-6 py-6 font-serif font-bold text-base text-destructive/50">Rs. {(p.totalAmount - p.amountPaid).toLocaleString()}</td>
                           <td className="px-6 py-6 text-center">
                              <div className="flex items-center gap-2">
                                 <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    p.status === 'Paid' ? "bg-success shadow-[0_0_10px_rgba(var(--success),0.6)]" : 
                                    p.status === 'Partial' ? "bg-warning" : "bg-destructive/40"
                                 )} />
                                 <span className="font-sans text-[10px] font-black uppercase tracking-widest opacity-40">{p.status}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Button 
                                onClick={() => {
                                  setSelectedPayment(p)
                                  setIsModalOpen(true)
                                }}
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-4 rounded-xl border border-primary/5 font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-premium gap-2"
                              >
                                 Record Payment
                                 <ArrowRight className="w-3 h-3" />
                              </Button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            )}
         </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-primary/10 bg-card/95 backdrop-blur-3xl p-8">
          <DialogHeader className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
               <DialogTitle className="font-serif text-2xl font-bold">Registry Audit</DialogTitle>
               <HandCoins className="w-6 h-6 text-primary opacity-30" />
            </div>
            <DialogDescription className="text-xs font-sans tracking-tight">
               Recording institutional fees for <span className="font-bold text-foreground">{(selectedPayment as any)?.student?.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
             <div className="p-5 rounded-2xl bg-primary/5 border border-primary/5 space-y-3">
                <div className="font-sans flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                   <span>Enrolled Class</span>
                   <span>Fee Amount</span>
                </div>
                <div className="flex justify-between items-baseline font-serif">
                   <p className="text-base font-bold text-foreground/80">{(selectedPayment as any)?.course?.title}</p>
                   <p className="text-xl font-bold text-primary">Rs. {(selectedPayment as any)?.totalAmount?.toLocaleString()}</p>
                </div>
                <div className="h-px bg-primary/10 w-full" />
                <div className="flex justify-between items-center text-[11px] font-bold">
                   <span className="font-sans opacity-40 uppercase tracking-widest">Already Collected</span>
                   <span className="text-success">Rs. {(selectedPayment as any)?.amountPaid?.toLocaleString()}</span>
                </div>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="font-sans text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Payment Amount (PKR)</label>
                 <Input 
                   type="number" 
                   autoFocus
                   placeholder="Enter amount to record..." 
                   value={paymentAmount}
                   onChange={(e) => setPaymentAmount(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleRecordPayment()}
                   className="h-14 rounded-2xl text-lg font-serif font-bold border-primary/10 bg-white/50 focus:ring-primary/20 transition-all"
                 />
               </div>
             </div>

             <div className="flex flex-col gap-3 pt-4">
                <Button 
                   onClick={handleRecordPayment}
                   className="h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-base tracking-tight"
                >
                   Verify and Synchronize
                </Button>
                <Button 
                   variant="ghost" 
                   onClick={() => setIsModalOpen(false)}
                   className="h-12 rounded-2xl text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-transparent"
                >
                   Cancel Audit
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, color }: any) {
   return (
      <Card className="border-primary/5 shadow-sm hover-lift transition-premium group overflow-hidden">
         <CardContent className="p-8 relative">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <Icon className="w-24 h-24" style={{ color }} />
            </div>
            <div className="space-y-1 relative z-10">
               <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{label}</span>
               <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground/90">{value}</h2>
                  <div className="p-1.5 rounded-lg border border-primary/5 bg-card/40">
                     <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
