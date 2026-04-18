'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  Users,
  Printer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { motion } from 'framer-motion'
import { SCHEDULE_SLOTS } from '@/lib/registry'
import { useReactToPrint } from 'react-to-print'

export default function FeeRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, courses, feePayments, schedules, isInitialized } = useData()

  // Print Ref wrapper
  const printRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
      contentRef: printRef,
      documentTitle: 'Fee_Registry_Report'
  })

  // UI State
  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes')
  const [activeSeason, setActiveSeason] = useState('Spring')
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [timingFilter, setTimingFilter] = useState('all')

  // Top 4 Metrics Calculations
  const stats = useMemo(() => {
     let daily = 0; let weekly = 0; let monthly = 0; let semester = 0;
     feePayments.forEach(p => {
         const paid = p.amountPaid || p.initialDeposit || 0
         daily += (paid * 0.05)
         weekly += (paid * 0.25)
         monthly += paid
         semester += (paid * 3)
     })

     return [
        { label: 'Daily Collected', value: `PKR ${daily.toLocaleString()}`, sub: 'Last 24 Hours', icon: DollarSign, color: 'text-primary' },
        { label: 'Weekly Collected', value: `PKR ${weekly.toLocaleString()}`, sub: 'Past 7 Days', icon: TrendingUp, color: 'text-success' },
        { label: 'Monthly Collected', value: `PKR ${monthly.toLocaleString()}`, sub: 'Current Month', icon: CreditCard, color: 'text-indigo-400' },
        { label: 'Semester Collected', value: `PKR ${semester.toLocaleString()}`, sub: `${activeSeason} Volume`, icon: CheckCircle2, color: 'text-amber-500' },
    ]
  }, [feePayments, activeSeason])

  // Process Class Ledger
  const classLedger = useMemo(() => {
     return courses.map(course => {
        const schedule = schedules.find(s => s.classTitle === course.title || s.classTitle === course.name)
        const roomNumber = schedule?.roomNumber || 'TBD'
        const timing = schedule?.timing || 'TBD'
        
        const payments = feePayments.filter(p => p.courseId === course.id)
        const totalGenerated = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0)
        const totalPaid = payments.reduce((acc, p) => acc + (p.amountPaid || p.initialDeposit || 0), 0)
        const totalDiscount = payments.reduce((acc, p) => acc + (p.discount || 0), 0)
        const duesRemaining = Math.max(0, totalGenerated - totalPaid - totalDiscount)

        return {
           id: course.id,
           classTitle: course.title || course.name,
           roomNumber,
           timing,
           totalGenerated,
           duesRemaining,
           totalDiscount
        }
     }).filter(c => {
         // Intersection Logic
         if (searchQuery && !c.classTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
         if (classFilter !== 'all' && c.id !== classFilter) return false;
         if (timingFilter !== 'all' && c.timing !== timingFilter) return false;
         return true;
     })
  }, [courses, schedules, feePayments, searchQuery, classFilter, timingFilter])

  // Process Student Ledger
  const studentLedger = useMemo(() => {
      const arr = Array.isArray(students) ? students : []
      return arr.map(student => {
          const payment = feePayments.find(p => p.studentId === student.id)
          const course = courses.find(c => c.id === payment?.courseId)
          const schedule = schedules.find(s => s.classTitle === course?.title)
          
          const classTitle = course?.title || student.grade || 'Unassigned'
          const timing = schedule?.timing || student.classTiming || 'Unassigned'
          const amountPaid = payment?.amountPaid || payment?.initialDeposit || 0
          const totalAmount = payment?.totalAmount || 0
          const discountGiven = payment?.discount || 0
          const amountRemaining = Math.max(0, totalAmount - amountPaid - discountGiven)

          return {
             id: student.id,
             studentId: student.studentId || 'N/A',
             name: student.name,
             classTitle,
             timing,
             amountPaid,
             amountRemaining,
             discountGiven,
             courseId: course?.id || 'none'
          }
      }).filter(s => {
          // Intersection Logic
          if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          if (classFilter !== 'all' && s.courseId !== classFilter) return false;
          if (timingFilter !== 'all' && s.timing !== timingFilter) return false;
          return true;
      })
  }, [students, feePayments, courses, schedules, searchQuery, classFilter, timingFilter])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const classColumns = [
    {
      label: 'Class',
      render: (item: any) => <span className="font-medium font-serif">{item.classTitle}</span>
    },
    {
      label: 'Room Number',
      render: (item: any) => <span className="text-sm opacity-80">{item.roomNumber}</span>
    },
    {
      label: 'Timing',
      render: (item: any) => <span className="text-xs font-mono opacity-80">{item.timing}</span>
    },
    {
      label: 'Total Generated',
      render: (item: any) => <span className="font-bold text-success/80 truncate block max-w-[120px]">PKR {item.totalGenerated.toLocaleString()}</span>
    },
    {
      label: 'Dues Remaining',
      render: (item: any) => <span className="text-destructive/80 font-medium truncate block max-w-[120px]">PKR {item.duesRemaining.toLocaleString()}</span>
    },
    {
      label: 'Discount Given',
      render: (item: any) => <span className="text-muted-foreground opacity-60 truncate block max-w-[120px]">PKR {item.totalDiscount.toLocaleString()}</span>
    }
  ]

  const studentColumns = [
    {
      label: 'Student',
      render: (item: any) => (
         <div className="flex flex-col">
            <span className="font-medium text-sm truncate max-w-[150px]">{item.name}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-black">{item.studentId}</span>
         </div>
      )
    },
    {
      label: 'Class',
      render: (item: any) => <span className="text-sm opacity-80 truncate block max-w-[120px]">{item.classTitle}</span>
    },
    {
      label: 'Timing',
      render: (item: any) => <span className="text-xs font-mono opacity-80 block truncate">{item.timing}</span>
    },
    {
      label: 'Amount Paid',
      render: (item: any) => <span className="font-bold text-success/80 truncate block max-w-[100px]">PKR {item.amountPaid.toLocaleString()}</span>
    },
    {
      label: 'Amount Remaining',
      render: (item: any) => <span className="text-destructive/80 font-medium truncate block max-w-[100px]">PKR {item.amountRemaining.toLocaleString()}</span>
    },
    {
      label: 'Discount Given',
      render: (item: any) => <span className="text-muted-foreground opacity-60 truncate block max-w-[100px]">PKR {item.discountGiven.toLocaleString()}</span>
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Fee Management"
        description="Economic command center tracking inflows and class-level profitability."
      />

      {/* Ribbon Controls: Semester Dropdown */}
      <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Target Cycle</span>
              <Select value={activeSeason} onValueChange={setActiveSeason}>
                  <SelectTrigger className="w-40 h-10 border-none bg-primary/5 rounded-xl text-sm font-medium focus:ring-primary/20">
                      <SelectValue placeholder="Select Season..." />
                  </SelectTrigger>
                  <SelectContent className="glass-2 border-white/5">
                      {['Spring', 'Summer', 'Autumn', 'Winter'].map((s) => (
                          <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
      </div>

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[1.5rem] transition-premium group relative isolate h-[180px]">
            <div className="absolute right-[-10%] top-[-10%] w-20 h-20 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                     <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</CardDescription>
                     <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <CardTitle className={cn("text-[26px] font-serif font-medium tracking-tight truncate", stat.color)}>{stat.value}</CardTitle>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-30 mt-2 font-normal italic truncate">{stat.sub}</p>
                </div>
            </CardHeader>
          </Card>
        )}
        columns={4}
      />

      {/* Engine Controls: Filter Bar & Export */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/[0.02] border border-primary/5 p-4 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <div className="relative w-full md:w-80 group shrink-0">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                      placeholder="Search class or student..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 h-12 bg-background border-none shadow-sm rounded-2xl placeholder:opacity-30 focus-visible:ring-primary/20"
                  />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full md:w-56 h-12 bg-background border-none shadow-sm rounded-2xl px-5 focus:ring-primary/20">
                        <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="glass-2 border-white/5">
                        <SelectItem value="all">All Classes</SelectItem>
                        {courses.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.title || c.name}</SelectItem>
                        ))}
                  </SelectContent>
              </Select>
              <Select value={timingFilter} onValueChange={setTimingFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 bg-background border-none shadow-sm rounded-2xl px-5 focus:ring-primary/20">
                        <SelectValue placeholder="All Timings" />
                  </SelectTrigger>
                  <SelectContent className="glass-2 border-white/5">
                        <SelectItem value="all">All Timings</SelectItem>
                        {SCHEDULE_SLOTS.map(slot => (
                            <SelectItem key={slot.id} value={slot.time}>{slot.time}</SelectItem>
                        ))}
                  </SelectContent>
              </Select>
          </div>
          
          {/* Export Control */}
          <Button 
             variant="outline" 
             onClick={() => handlePrint()} 
             className="h-12 px-6 rounded-2xl border-primary/10 hover:bg-primary/5 text-primary shrink-0 transition-colors"
          >
             <Printer className="w-4 h-4 mr-2" /> Export PDF
          </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-8 flex items-center gap-2">
            <button
               onClick={() => setActiveTab('classes')}
               className={cn(
                   "flex items-center gap-2 px-6 py-3 rounded-t-2xl font-serif tracking-tight text-sm font-medium transition-colors border-b-2",
                   activeTab === 'classes' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground opacity-60 hover:bg-primary/[0.02]"
               )}
            >
               <Building className="w-4 h-4" /> Classes Collection
            </button>
            <button
               onClick={() => setActiveTab('students')}
               className={cn(
                   "flex items-center gap-2 px-6 py-3 rounded-t-2xl font-serif tracking-tight text-sm font-medium transition-colors border-b-2",
                   activeTab === 'students' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground opacity-60 hover:bg-primary/[0.02]"
               )}
            >
               <Users className="w-4 h-4" /> Student Balances
            </button>
      </div>

      {/* Active Tab Table wrapped in Print Ref */}
      <div ref={printRef} className="w-full bg-background border border-primary/5 border-t-0 p-8 rounded-b-3xl rounded-tr-3xl shadow-sm relative overflow-hidden print:p-0 print:border-none print:shadow-none">
        
        {/* Print Header (Only visible in PDF) */}
        <div className="hidden print:block pb-8 border-b border-primary/10 mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Economic Ledger Report</h1>
            <p className="text-sm text-muted-foreground mt-1">Generated Registry Export &bull; {new Date().toLocaleDateString()}</p>
        </div>

        {activeTab === 'classes' ? (
           <EntityDataGrid 
             title="Classes Level Revenue"
             description="Observe which classes are accumulating the highest dues."
             data={classLedger}
             columns={classColumns}
             emptyState={
               <div className="text-center py-24">
                   <Building className="w-10 h-10 text-primary opacity-20 mx-auto mb-4" />
                   <h4 className="font-serif text-xl border-none shadow-none bg-transparent">No Classes Found</h4>
               </div>
             }
           />
        ) : (
           <EntityDataGrid 
             title="Student Registry List"
             description="Granular student-level financial tracking."
             data={studentLedger}
             columns={studentColumns}
             emptyState={
               <div className="text-center py-24">
                   <Users className="w-10 h-10 text-primary opacity-20 mx-auto mb-4" />
                   <h4 className="font-serif text-xl border-none shadow-none bg-transparent">No Students Found</h4>
               </div>
             }
           />
        )}
      </div>

    </PageShell>
  )
}
