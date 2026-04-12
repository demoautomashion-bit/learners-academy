'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useState, useMemo } from 'react'
import { 
  BarChart, 
  BarChart2, 
  Search, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Users, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  LayoutGrid
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { TrimesterBanner } from '@/components/shared/trimester-banner'
import { getTrimesters, getDateRangeFromFilterKey } from '@/lib/trimesters'
import type { Course, FeePayment, Student } from '@/lib/types'

type TimePeriod = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

export default function BatchFinancialsPage() {
  const hasMounted = useHasMounted()
  const { courses, feePayments, students, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const currentYear = new Date().getFullYear()
  
  const trimesters = getTrimesters(currentYear)

  // Aggregate Data per Course
  const courseFinancials = (() => {
    if (!courses) return []

    const trimesterRange = getDateRangeFromFilterKey(periodFilter, currentYear)

    return (Array.isArray(courses) ? courses : []).map(course => {
      // Find all payments for this course
      const coursePayments = (Array.isArray(feePayments) ? feePayments : []).filter(fp => {
        const matchesCourse = fp.courseId === course.id
        if (!matchesCourse) return false
        
        // Timerange filter
        if (trimesterRange && fp.paymentDate) {
          const d = new Date(fp.paymentDate).getTime()
          return d >= trimesterRange.start.getTime() && d <= trimesterRange.end.getTime()
        }
        
        return true
      })

      const collected = coursePayments.reduce((sum, fp) => sum + (fp.amountPaid || 0), 0)
      const expected = (course.feeAmount || 0) * (course.enrolled || 0)
      const outstanding = expected - collected
      const collectionRate = expected > 0 ? (collected / expected) * 100 : 0

      return {
        ...course,
        collected,
        expected,
        outstanding,
        collectionRate,
        payments: coursePayments
      }
    })
  })()

  const filteredFinancials = (() => {
    return courseFinancials.filter(cf => {
      const matchesSearch = (cf.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cf.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || cf.status === statusFilter
      return matchesSearch && matchesStatus
    })
  })()

  const stats = (() => {
    const totalExpected = filteredFinancials.reduce((sum, f) => sum + f.expected, 0)
    const totalCollected = filteredFinancials.reduce((sum, f) => sum + f.collected, 0)
    const totalOutstanding = totalExpected - totalCollected
    const avgCollectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0

    return { totalExpected, totalCollected, totalOutstanding, avgCollectionRate }
  })()


  const selectedCourse = (courseFinancials || []).find(cf => cf.id === selectedCourseId)

  const handleExportCSV = () => {
    const headers = ["Class", "Instructor", "Enrolled", "Fee/Student", "Expected Total", "Collected", "Outstanding", "Collection %"]
    const rows = filteredFinancials.map(cf => [
      cf.title,
      cf.teacherName,
      cf.enrolled,
      cf.feeAmount,
      cf.expected,
      cf.collected,
      cf.outstanding,
      cf.collectionRate.toFixed(1) + '%'
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Batch_Financials_${periodFilter}_${currentYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      label: 'Batch Information',
      render: (cf) => (
        <div className="flex flex-col">
          <span className="font-serif text-base font-medium leading-none mb-1">{cf.title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 font-normal uppercase tracking-widest opacity-60">{cf.level}</Badge>
            <Badge className={cn(
              "text-[10px] h-3.5 px-1 py-0 font-normal",
              cf.status === 'active' ? "bg-success" : "bg-muted text-muted-foreground"
            )}>{cf.status}</Badge>
          </div>
        </div>
      ),
      width: '240px'
    },
    { label: 'Instructor', render: (cf) => <span className="text-sm font-normal text-foreground">{cf.teacherName}</span> },
    { label: 'Enrolled', render: (cf) => <span className="text-sm font-normal text-foreground">{cf.enrolled} Candidates</span> },
    { label: 'Revenue Target', render: (cf) => (
      <div className="flex flex-col">
        <span className="text-sm font-normal">Rs. {cf.expected.toLocaleString()}</span>
        <span className="text-[10px] text-muted-foreground opacity-60">Basis: Rs. {cf.feeAmount.toLocaleString()}/st</span>
      </div>
    )},
    { label: 'Actual Collected', render: (cf) => (
      <span className={cn(
        "font-serif text-base font-medium transition-colors",
        cf.collected >= cf.expected && cf.expected > 0 ? "text-success" : "text-primary"
      )}>
        Rs. {cf.collected.toLocaleString()}
      </span>
    )},
    { label: 'Dues', render: (cf) => (
      <span className={cn(
        "text-sm font-normal font-serif italic",
        cf.outstanding > 0 ? "text-destructive" : "text-success opacity-60"
      )}>
        {cf.outstanding > 0 ? `Rs. ${cf.outstanding.toLocaleString()} Due` : 'Clear'}
      </span>
    )},
    { label: 'Collection Rate', render: (cf) => (
      <div className="flex flex-col gap-1.5 w-32">
        <div className="flex justify-between items-center text-[10px] font-normal opacity-60">
          <span>{cf.collectionRate.toFixed(0)}%</span>
          {cf.collectionRate >= 100 && <CheckCircle className="w-2.5 h-2.5 text-success" />}
        </div>
        <Progress value={cf.collectionRate} className="h-1 bg-muted/30 [&>div]:bg-primary" />
      </div>
    )},
    { label: '', render: (cf) => (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => { setSelectedCourseId(cf.id); setIsDetailsOpen(true); }}
        className="hover:bg-primary/5 text-primary/60 hover:text-primary transition-all"
      >
        <Eye className="w-4 h-4 mr-2" /> Details
      </Button>
    )}
  ]



  

  return (
    <PageShell>
      <PageHeader 
        title="Batch Financials"
        description="Consolidated revenue analytics per academic batch. Track institution targets, actual receipts, and outstanding dues."
        actions={
          <div className="flex items-center gap-4">
            <Select value={periodFilter} onValueChange={(v: TimePeriod) => setPeriodFilter(v)}>
              <SelectTrigger className="w-[180px] h-11 text-xs font-normal border-primary/10 shadow-sm">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full Academic History</SelectItem>
                <SelectSeparator className="opacity-10" />
                {trimesters.map(t => (
                  <SelectItem key={t.filterKey} value={t.filterKey}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV} className="h-11 font-normal hover:bg-primary/5">
              <Download className="w-4 h-4 mr-2 opacity-60" /> Export CSV
            </Button>
          </div>
        }
      />

      <TrimesterBanner className="mb-8" />

      <EntityCardGrid 
        data={[
          { label: 'Period Expected', value: `Rs. ${stats.totalExpected.toLocaleString()}`, icon: TrendingUp, sub: 'Total Projected Revenue', color: 'text-foreground' },
          { label: 'Period Collected', value: `Rs. ${stats.totalCollected.toLocaleString()}`, icon: DollarSign, sub: 'Realized Institutional Flow', color: 'text-success' },
          { label: 'Accounts Receivable', value: `Rs. ${stats.totalOutstanding.toLocaleString()}`, icon: AlertCircle, sub: 'Uncollected Outstanding', color: 'text-destructive' },
          { label: 'Average Recovery', value: `${stats.avgCollectionRate.toFixed(1)}%`, icon: BarChart2, sub: 'Institutional Liquidity', color: 'text-primary' },
        ]}
        renderItem={(item, i) => (
          <Card key={i} className="glass-1 shadow-premium rounded-[2rem] overflow-hidden hover:translate-y-[-4px] transition-all duration-500">
            <CardContent className="pt-8 pb-7 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-xl mb-4 border border-white/5">
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">{item.label}</p>
              <h3 className={cn("font-serif text-xl font-medium", item.color)}>{item.value}</h3>
              <p className="text-[9px] text-muted-foreground mt-2 opacity-50 tracking-wider uppercase">{item.sub}</p>
            </CardContent>
          </Card>
        )}
        columns={4}
      />

      <EntityDataGrid 
        title="Batch Revenue Ledger"
        description="Displaying collections aggregated by academic session levels."
        data={filteredFinancials}
        columns={columns}
        actions={
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 text-xs font-normal bg-muted/10 border-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input 
                placeholder="Search batches or faculty..." 
                className="pl-10 h-10 bg-muted/10 border-none text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        }
      />

      {/* Drill-down Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] glass-3 border-white/10 p-0">
          {selectedCourse && (
            <div className="flex flex-col h-full">
              <div className="p-10 pb-6 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                      <LayoutGrid className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="font-serif text-3xl font-medium">{selectedCourse.title}</DialogTitle>
                      <p className="text-xs text-muted-foreground font-normal mt-1">{selectedCourse.teacherName} — {selectedCourse.schedule}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1">Batch Revenue</p>
                    <p className="font-serif text-2xl text-primary">Rs. {selectedCourse.collected.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                   <div className="bg-background/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Enrolled</p>
                      <p className="text-lg font-serif">{selectedCourse.enrolled}</p>
                   </div>
                   <div className="bg-background/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Fee/Student</p>
                      <p className="text-lg font-serif">Rs. {selectedCourse.feeAmount.toLocaleString()}</p>
                   </div>
                   <div className="bg-background/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Target</p>
                      <p className="text-lg font-serif">Rs. {selectedCourse.expected.toLocaleString()}</p>
                   </div>
                   <div className="bg-background/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Dues</p>
                      <p className="text-lg font-serif text-destructive">Rs. {selectedCourse.outstanding.toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="p-10 pt-8">
                <h4 className="font-serif text-xl font-medium mb-6">Student Payment Ledger</h4>
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted/10 text-[10px] uppercase tracking-widest font-bold opacity-40">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Expected Net</th>
                        <th className="px-6 py-4">Realized</th>
                        <th className="px-6 py-4">Balance</th>
                        <th className="px-6 py-4">Last Payment</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.filter(s => s.enrolledCourses.includes(selectedCourse.id)).map(student => {
                        const payment = feePayments.find(fp => fp.studentId === student.id && fp.courseId === selectedCourse.id)
                        const netTotal = payment ? (payment.totalAmount - (payment.discount || 0)) : selectedCourse.feeAmount
                        const realized = payment ? payment.amountPaid : 0
                        const balance = netTotal - realized

                        return (
                          <tr key={student.id} className="text-sm font-normal hover:bg-white/5 transition-colors">
                            <td className="px-6 py-5">
                              <p className="font-medium text-foreground">{student.name}</p>
                              <p className="text-[10px] opacity-40">{student.studentId || 'ID-TBC'}</p>
                            </td>
                            <td className="px-6 py-5 font-serif opacity-70">Rs. {netTotal.toLocaleString()}</td>
                            <td className="px-6 py-5 font-serif text-primary">Rs. {realized.toLocaleString()}</td>
                            <td className="px-6 py-5 font-serif text-destructive">
                               {balance > 0 ? `Rs. ${balance.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-6 py-5 text-xs opacity-50">
                               {payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No Records'}
                            </td>
                            <td className="px-6 py-5 text-right">
                               <Badge variant="outline" className={cn(
                                 "text-[10px] px-2 py-0 h-5 font-normal",
                                 balance === 0 ? "bg-success/5 text-success border-success/20" : 
                                 realized > 0 ? "bg-warning/5 text-warning border-warning/20" :
                                 "bg-destructive/5 text-destructive border-destructive/20"
                               )}>
                                 {balance === 0 ? 'Full' : realized > 0 ? 'Partial' : 'Unpaid'}
                               </Badge>
                            </td>
                          </tr>
                        )
                      })}
                      {students.filter(s => s.enrolledCourses.includes(selectedCourse.id)).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground italic font-normal">
                             No students currently tracked in this batch registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
