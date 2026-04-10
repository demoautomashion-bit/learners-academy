'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useState, useMemo } from 'react'
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  Plus,
  MoreVertical,
  CheckCircle,
  HeartHandshake,
  Printer,
  Leaf
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'
import {
  getTrimesters,
  getActiveTrimester,
  getDateRangeFromFilterKey,
} from '@/lib/trimesters'
import { TrimesterBanner } from '@/components/shared/trimester-banner'

type TimePeriod = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

export default function FeeRegistryPage() {
  const { students, courses, feePayments, recordPayment, addFeeAccount, isInitialized } = useData()
  const hasMounted = useHasMounted()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All')
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')

  // Live Preview State for Dialog
  const [tempTotal, setTempTotal] = useState(0)
  const [tempDiscount, setTempDiscount] = useState(0)

  const today = useMemo(() => {
    if (!hasMounted) return new Date()
    return new Date()
  }, [hasMounted])

  const currentYear = useMemo(() => {
    if (!hasMounted) return new Date().getFullYear()
    return new Date().getFullYear()
  }, [hasMounted])

  const trimesters = useMemo(() => getTrimesters(currentYear), [currentYear, hasMounted])
  
  const activeTrimester = useMemo(() => {
    if (!hasMounted) return null
    return getActiveTrimester()
  }, [hasMounted])

  const stats = useMemo(() => {
    if (!hasMounted) return { daily: 0, weekly: 0, monthly: 0, totalOutstanding: 0, totalDiscounts: 0, trimesterCollection: 0 }
    const safePayments = Array.isArray(feePayments) ? feePayments : []

    const daily = safePayments
      .filter(p => p.paymentDate && isSameDay(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)
    
    const weekly = safePayments
      .filter(p => p.paymentDate && isSameWeek(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)
    
    const monthly = safePayments
      .filter(p => p.paymentDate && isSameMonth(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)

    const totalOutstanding = safePayments
      .reduce((sum, p) => sum + (p.totalAmount - (p.discount || 0) - p.amountPaid), 0)

    const totalDiscounts = safePayments
      .reduce((sum, p) => sum + (p.discount || 0), 0)

    // Trimester collection — uses active period filter if set, otherwise current trimester
    const trimesterRange = periodFilter !== 'all'
      ? getDateRangeFromFilterKey(periodFilter, currentYear)
      : { start: activeTrimester.start, end: activeTrimester.end }

    const trimesterCollection = trimesterRange
      ? safePayments
          .filter(p => {
            if (!p.paymentDate) return false
            const d = new Date(p.paymentDate).getTime()
            return d >= trimesterRange.start.getTime() && d <= trimesterRange.end.getTime()
          })
          .reduce((sum, p) => sum + p.amountPaid, 0)
      : 0

    return { daily, weekly, monthly, totalOutstanding, totalDiscounts, trimesterCollection }
  }, [feePayments, today, hasMounted, periodFilter, currentYear, activeTrimester])

  const filteredPayments = useMemo(() => {
    if (!hasMounted) return []
    return (Array.isArray(feePayments) ? feePayments : []).filter(p => {
      if (!p.student || !p.course) return false
      const matchesSearch = (p.student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.course.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [feePayments, searchQuery, filterStatus, hasMounted])

  if (!isInitialized || !hasMounted) return <DashboardSkeleton />

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      studentId: formData.get('studentId') as string,
      courseId: formData.get('courseId') as string,
      totalAmount: Number(formData.get('totalAmount')),
      discount: Number(formData.get('discount') || 0),
      initialDeposit: Number(formData.get('initialDeposit')),
    }

    startTransition(async () => {
      try {
        await addFeeAccount(data)
        setIsAddAccountOpen(false)
        setTempTotal(0)
        setTempDiscount(0)
        toast.success("Academic account initialized.")
      } catch (error) {
        toast.error("Failed to link account.")
      }
    })
  }

  const handleQuickPayment = async (paymentId: string) => {
    const amount = prompt("Enter payment amount (Rs.):")
    if (!amount || isNaN(Number(amount))) return

    startTransition(async () => {
      try {
        await recordPayment(paymentId, Number(amount))
        toast.success("Payment recorded.")
      } catch (error) {
        toast.error("Ledger update failed.")
      }
    })
  }

  const columns: Column<any>[] = [
    {
      label: 'Name',
      render: (entry) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform">
            <AvatarImage src={entry.student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-normal">
              {entry?.student?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-normal text-foreground leading-none mb-1">{entry.student.name}</p>
            <p className="text-xs text-muted-foreground font-normal">ID: {entry.student.studentId || 'GEN-ST'}</p>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Class',
      render: (entry) => (
        <div className="flex flex-col">
          <span className="text-sm font-normal text-foreground leading-tight">{entry.course.title}</span>
          <span className="text-xs text-primary/70 font-normal mt-1 opacity-70">{entry.course.level}</span>
        </div>
      )
    },
    {
      label: 'ID & Timing',
      render: (entry) => (
        <div className="flex flex-col">
          <span className="text-xs font-normal text-foreground">{entry.student.studentId || 'GEN-ST'}</span>
          <div className="flex items-center gap-1.5 opacity-50 mt-1">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-xs font-normal">{entry.student.classTiming || 'TBC'}</span>
          </div>
        </div>
      )
    },
    {
      label: 'Status',
      render: (entry) => (
        <div className={cn(
          "inline-flex items-center gap-2.5 px-3.5 py-1.5 text-xs border border-transparent font-normal transition-all rounded-full",
          entry.status === 'Paid' && "bg-success/5 text-success border-success/10",
          entry.status === 'Partial' && "bg-warning/5 text-warning border-warning/10",
          entry.status === 'Unpaid' && "bg-destructive/5 text-destructive border-destructive/10"
        )}>
          {entry.status}
        </div>
      )
    },
    {
      label: 'Dues (Rs.)',
      render: (entry) => {
        const netFee = entry.totalAmount - (entry.discount || 0)
        const balance = netFee - entry.amountPaid
        const progress = (entry.amountPaid / netFee) * 100
        return (
          <div className="flex flex-col gap-2 pr-6">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-foreground leading-none">Net: {netFee.toLocaleString()}</span>
                    {entry.discount > 0 && <span className="text-[10px] text-primary/60 italic font-medium">(-{entry.discount.toLocaleString()})</span>}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 opacity-60">Base: {entry.totalAmount.toLocaleString()}</span>
              </div>
              {balance > 0 ? (
                <span className="text-xs text-destructive font-serif font-normal italic">Rs. {balance.toLocaleString()} Due</span>
              ) : (
                <CheckCircle className="w-3 h-3 text-success opacity-40" />
              )}
            </div>
            <Progress value={progress} className="h-1 bg-muted/30 [&>div]:bg-primary" />
          </div>
        )
      },
      width: '240px'
    },
    {
      label: 'Action',
      render: (entry) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5 transition-all">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuItem onClick={() => handleQuickPayment(entry.id)} className="gap-3 cursor-pointer py-3 focus:bg-primary/10 transition-all font-normal">
              <Plus className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs font-medium text-primary">Record Payment</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const dues = entry.totalAmount - (entry.discount || 0) - entry.amountPaid
              const params = new URLSearchParams({
                studentId:     entry.student.id,
                courseId:      entry.course.id,
                tuitionFee:    String(entry.totalAmount || 0),
                admissionFee:  String(0),
                discount:      String(entry.discount || 0),
                totalFee:      String((entry.totalAmount || 0) - (entry.discount || 0)),
                paid:          String(entry.amountPaid || 0),
                dues:          String(dues > 0 ? dues : 0),
                term:          `${activeTrimester.season}-${activeTrimester.year}`,
                teacherName:   entry.course.teacherName || '',
              })
              window.open(`/admin/print/receipt?${params.toString()}`, '_blank')
            }} className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <Printer className="w-4 h-4 text-muted-foreground opacity-60" /> <span className="text-xs">Generate Receipt</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-muted font-normal">
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-60" /> <span className="text-xs">Issue Statement</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal">
              <AlertCircle className="w-4 h-4 opacity-70" /> <span className="text-xs">Send Due Reminder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Fee Registry"
        description="Administrative ledger for tuition collection, payment scheduling, and real-time financial tracking across all academic sessions."
        actions={
          <div className="flex items-center gap-4">
            <Select value={periodFilter} onValueChange={(v: TimePeriod) => setPeriodFilter(v)}>
              <SelectTrigger className="w-[200px] h-11 text-xs font-normal border-primary/10 shadow-sm">
                <SelectValue placeholder="Select Trimester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectSeparator className="opacity-10" />
                {trimesters.map(t => (
                  <SelectItem key={t.filterKey} value={t.filterKey}>
                    {t.label} &nbsp;·&nbsp; {t.range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddAccountOpen} onOpenChange={(open) => { setIsAddAccountOpen(open); if(!open){ setTempTotal(0); setTempDiscount(0); } }}>
              <DialogTrigger asChild>
                <Button className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Add Student Account
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-white/10 rounded-[2rem] glass-3">
              <DialogHeader className="p-10 pb-0 text-center">
                <div className="mx-auto w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                    <CreditCard className="w-7 h-7 text-primary opacity-80" />
                </div>
                <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Initiate Academic Account</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-2">
                    Fiscal Institutional Entry Protocol
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="p-10 pt-6 space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Select Student</Label>
                      <Select name="studentId" required>
                        <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                          <SelectValue placeholder="Candidate UID" />
                        </SelectTrigger>
                        <SelectContent>
                          {students?.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.studentId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Academic Level</Label>
                      <Select name="courseId" required>
                        <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                          <SelectValue placeholder="Enrolled Batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Total Flexible Fee (Rs.)</Label>
                      <Input 
                        name="totalAmount" 
                        type="number" 
                        required 
                        placeholder="0.00" 
                        onChange={(e) => setTempTotal(Number(e.target.value))}
                        className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Philanthropic Relief (Rs.)</Label>
                      <Input 
                        name="discount" 
                        type="number" 
                        placeholder="Scholarship Amount" 
                        onChange={(e) => setTempDiscount(Number(e.target.value))}
                        className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Net Calculated Tuition</span>
                    <span className="font-serif text-2xl text-primary drop-shadow-sm">Rs. {(tempTotal - tempDiscount).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Initial Deposit (Rs.)</Label>
                    <Input name="initialDeposit" type="number" defaultValue={0} className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl" />
                  </div>
                </div>
                <DialogFooter className="pt-4 gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddAccountOpen(false)} className="rounded-xl text-muted-foreground hover:text-foreground">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="px-8 rounded-xl bg-primary text-primary-foreground font-serif text-lg tracking-wide hover-lift shadow-xl shadow-primary/20">
                    {isPending ? 'Processing...' : 'Authorize Registration'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        }
      />

      <TrimesterBanner className="mb-8" />


      <div className="grid grid-cols-6 gap-5 mb-12">
        {[
          { label: 'Daily Collection', value: stats.daily, info: 'Current Cycle', icon: Clock, color: 'text-primary' },
          { label: 'Weekly Velocity', value: stats.weekly, info: 'Active Term', icon: ArrowUpRight, color: 'text-success' },
          { label: 'Monthly Volume', value: stats.monthly, info: 'Projected Flow', icon: DollarSign, color: 'text-primary' },
          { label: 'Outstanding Dues', value: stats.totalOutstanding, info: 'Uncollected', icon: AlertCircle, color: 'text-destructive' },
          { label: 'Institutional Relief', value: stats.totalDiscounts, info: 'Philanthropic Investment', icon: HeartHandshake, color: 'text-indigo-400' },
          { 
            label: periodFilter !== 'all' ? `${trimesters.find(t => t.filterKey === periodFilter)?.label ?? 'Trimester'} Collection` : `${activeTrimester.label} Collection`,
            value: stats.trimesterCollection,
            info: 'Trimester Revenue',
            icon: Leaf,
            color: 'text-primary'
          },
        ].map((stat, i) => (
          <Card key={i} className="glass-1 border-white/10 shadow-premium overflow-hidden rounded-[2rem] hover:translate-y-[-4px] transition-all duration-500">
            <CardContent className="pt-8 pb-7">
              <div className="flex flex-col gap-4 text-center">
                <div className="mx-auto w-10 h-10 bg-primary/5 flex items-center justify-center border border-white/5 rounded-xl">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">{stat.label}</p>
                  <h3 className="font-serif text-xl font-medium tracking-tight">
                    Rs. {stat.value.toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-muted-foreground mt-2 font-normal opacity-50 tracking-wider uppercase italic">{stat.info}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EntityDataGrid 
        title="Student Accounts"
        data={filteredPayments}
        columns={columns}
        emptyState={
          <div className="text-center py-32 opacity-30">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-serif text-xl font-normal">No registry entries found</p>
            <p className="text-xs mt-2 font-normal">System awaiting transactional data</p>
          </div>
        }
        actions={
          <div className="flex items-center gap-6">
            <div className="flex gap-1 bg-muted/20 p-1 border ">
              {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={cn(
                    "px-4 py-1.5 text-xs transition-all font-normal",
                    filterStatus === status 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search registry entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm"
              />
            </div>
          </div>
        }
      />
    </PageShell>
  )
}
