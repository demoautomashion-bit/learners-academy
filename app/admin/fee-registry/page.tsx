'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useRef, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  Users,
  Printer,
  Receipt,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { SCHEDULE_SLOTS } from '@/lib/registry'
import { getActiveTrimester } from '@/lib/trimesters'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import Image from 'next/image'

export default function FeeRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, courses, feePayments, schedules, addFeeAccount, isInitialized } = useData()

  // Print Ref wrapper for Grid Export
  const printGridRef = useRef<HTMLDivElement>(null)
  const handleGridPrint = useReactToPrint({
      contentRef: printGridRef,
      documentTitle: 'Fee_Registry_Report'
  })

  // Print Ref wrapper for Thermal Receipt
  const thermalReceiptRef = useRef<HTMLDivElement>(null)
  const handleThermalPrint = useReactToPrint({
      contentRef: thermalReceiptRef,
      documentTitle: 'Thermal_POS_Receipt'
  })

  // UI State
  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes')
  const [activeSeason, setActiveSeason] = useState('Spring')
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [timingFilter, setTimingFilter] = useState('all')

  // Transaction State
  const [isCollectOpen, setIsCollectOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  
  const [feeData, setFeeData] = useState({
    courseId: '',
    tuitionFee: 0,
    admissionFee: 0,
    discount: 0,
    paidAmount: 0
  })

  const currentTrimester = useMemo(() => getActiveTrimester(), [])

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
          const teacherName = schedule?.teacherName || 'Unassigned'
          const amountPaid = payment?.amountPaid || payment?.initialDeposit || 0
          const totalAmount = payment?.totalAmount || 0
          const discountGiven = payment?.discount || 0
          const amountRemaining = Math.max(0, totalAmount - amountPaid - discountGiven)

          return {
             id: student.id,
             studentId: student.studentId || 'N/A',
             name: student.name,
             fatherName: student.parentName || 'N/A',
             classTitle,
             timing,
             teacherName,
             amountPaid,
             amountRemaining,
             discountGiven,
             courseId: course?.id || 'none'
          }
      }).filter(s => {
          if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          if (classFilter !== 'all' && s.courseId !== classFilter) return false;
          if (timingFilter !== 'all' && s.timing !== timingFilter) return false;
          return true;
      })
  }, [students, feePayments, courses, schedules, searchQuery, classFilter, timingFilter])

  // Capture targeted student logic
  const selectedStudentTarget = studentLedger.find(s => s.id === selectedStudentId)

  // Auto-fill target class when a student is selected
  useEffect(() => {
     if (selectedStudentTarget && isCollectOpen && selectedStudentTarget.courseId !== 'none') {
         setFeeData(prev => ({ ...prev, courseId: selectedStudentTarget.courseId }))
     }
  }, [selectedStudentTarget, isCollectOpen])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleRecordCollection = async () => {
    if (!selectedStudentId || !feeData.courseId) return

    try {
        await addFeeAccount({
            studentId: selectedStudentId,
            courseId: feeData.courseId,
            totalAmount: feeData.tuitionFee + feeData.admissionFee,
            discount: feeData.discount,
            initialDeposit: feeData.paidAmount,
            amountPaid: feeData.paidAmount
        })
        
        setIsCollectOpen(false)
        setIsReceiptOpen(true) // Sequence instantly swaps
        toast.active("Inflow Logged", {
            description: `Payment captured, initiating POS Sequence.`,
            icon: <CheckCircle2 className="w-4 h-4 text-success" />
        })
    } catch (error) {
        toast.error("Collection disrupted")
    }
  }

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
      label: 'Actions',
      render: (item: any) => (
         <div className="flex items-center gap-2">
           <Button 
              size="sm" 
              onClick={() => {
                  setSelectedStudentId(item.id)
                  setFeeData({ courseId: item.courseId, tuitionFee: 0, admissionFee: 0, discount: 0, paidAmount: 0 })
                  setIsCollectOpen(true)
              }}
              className="h-8 bg-success/10 text-success hover:bg-success hover:text-white transition-colors"
           >
               Record Payment
           </Button>
           <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                  setSelectedStudentId(item.id)
                  // Use existing logic just to view receipt
                  // We simulate loading the receipt data
                  setFeeData({ courseId: item.courseId, tuitionFee: item.totalAmount || 0, admissionFee: 0, discount: item.discountGiven || 0, paidAmount: item.amountPaid || 0 })
                  setIsReceiptOpen(true)
              }}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              title="Print Last Receipt"
           >
               <Receipt className="w-4 h-4" />
           </Button>
         </div>
      )
    }
  ]

  // The Thermal Component Layout builder
  const renderThermalCopy = (copyType: 'Student Copy' | 'Office Copy') => {
      if (!selectedStudentTarget) return null
      
      const tId = selectedStudentTarget.studentId
      const tName = selectedStudentTarget.name
      const tFather = selectedStudentTarget.fatherName
      const tTerm = `${activeSeason}-${new Date().getFullYear()}`
      const tClass = selectedStudentTarget.classTitle
      const tTiming = selectedStudentTarget.timing
      const tTeacher = selectedStudentTarget.teacherName
      
      const tTuition = feeData.tuitionFee || 0
      const tAdmission = feeData.admissionFee || 0
      const tDiscount = feeData.discount || 0
      const tTotal = tTuition + tAdmission - tDiscount
      const tPaid = feeData.paidAmount || 0
      const tDues = Math.max(0, tTotal - tPaid)
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      
      return (
          <div className="w-[300px] flex flex-col font-mono text-[11px] text-black bg-white leading-tight mx-auto print:mx-0">
             {/* Header */}
             <div className="flex items-center gap-3 border-b-2 border-dashed border-black pb-3 mb-3">
                 <div className="w-10 h-14 bg-black/10 shrink-0" /> {/* Logo Placeholder */}
                 <div className="flex flex-col text-center w-full">
                     <span className="font-bold text-sm tracking-tighter">THE LEARNERS ACADEMY</span>
                     <span className="font-bold text-xs tracking-tighter uppercase">English Language Program</span>
                     <span className="text-[9px] mt-1">Address: Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.</span>
                     <span className="text-[9px]">Phone: +92-3003583286 / +92-3115455533</span>
                 </div>
             </div>
             
             {/* Identity Body */}
             <div className="flex justify-between mb-1.5">
                 <span className="font-bold">Student's ID:</span>
                 <span className="ml-2 font-bold w-[190px]">{tId}</span>
                 <div className="flex flex-col items-end">
                     <span>Date:{dateStr}</span>
                 </div>
             </div>
             <div className="flex mb-1.5"><span className="font-bold w-[90px]">Name:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tName}</span></div>
             <div className="flex mb-1.5"><span className="font-bold w-[90px]">Father's Name:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tFather}</span></div>
             <div className="flex mb-1.5"><span className="font-bold w-[90px]">Term:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tTerm}</span></div>
             <div className="flex mb-1.5"><span className="font-bold w-[90px]">Class:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tClass}</span></div>
             <div className="flex mb-1.5"><span className="font-bold w-[90px]">Timing:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tTiming}</span></div>
             <div className="flex mb-3"><span className="font-bold w-[90px]">Teacher:</span><span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{tTeacher}</span></div>

             {/* Ledger Matrix */}
             <table className="w-full border-collapse border border-black mb-3 text-[11px]">
                 <thead>
                    <tr className="border-b border-black">
                        <td colSpan={2} className="px-1 font-bold">Fee Type</td>
                        <td className="px-1 text-right font-bold">Amount</td>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="border-b border-black/20"><td colSpan={2} className="px-1 py-1 font-bold">Tution Fee:</td><td className="px-1 py-1 text-right">{tTuition}</td></tr>
                    <tr className="border-b border-black/20"><td colSpan={2} className="px-1 py-1 font-bold">Admission Fee:</td><td className="px-1 py-1 text-right">{tAdmission}</td></tr>
                    <tr className="border-b border-black/20"><td colSpan={2} className="px-1 py-1 font-bold">Discount:</td><td className="px-1 py-1 text-right">{tDiscount}</td></tr>
                    <tr className="border-b border-black/20"><td colSpan={2} className="px-1 py-1 font-bold">Total Fee:</td><td className="px-1 py-1 text-right font-bold">{tTotal}</td></tr>
                    <tr className="border-b border-black/20"><td colSpan={2} className="px-1 py-1 font-bold">Paid:</td><td className="px-1 py-1 text-right font-bold">{tPaid}</td></tr>
                    <tr className=""><td colSpan={2} className="px-1 py-1 font-bold">Dues:</td><td className="px-1 py-1 text-right font-bold">{tDues}</td></tr>
                 </tbody>
             </table>

             {/* Signature Stamp Box */}
             <div className="w-full border-2 border-black flex flex-col items-center justify-center p-2 h-[80px] relative mb-3 overflow-hidden">
                 <div className="absolute top-0 w-full bg-black text-white text-[10px] text-center font-bold">Received By</div>
                 {/* Empty space for physical stamp. We don't render an image here so they can physically stamp it */}
             </div>

             {/* Footer Note */}
             <div className="text-[9px] text-center mb-2 px-2 italic font-bold">
                 "Students are advised to confirm their availability prior to enrolment. Once the registration process is completed, all fees paid are non-refundable under any circumstances."
             </div>
             
             <div className="text-center font-bold mb-2">{copyType}</div>
             <div className="text-[8px] text-center mb-4">Software By: Nexilumina Solutions</div>
          </div>
      )
  }

  return (
    <PageShell>
      <PageHeader 
        title="Fee Management"
        description="Economic command center tracking inflows and class-level profitability."
        actions={
            <Button onClick={() => setIsCollectOpen(true)} className="font-medium bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all h-11 px-8 rounded-xl shrink-0">
               <Plus className="w-4 h-4 mr-2" /> Log Transaction
            </Button>
        }
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
             onClick={() => handleGridPrint()} 
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
      <div ref={printGridRef} className="w-full bg-background border border-primary/5 border-t-0 p-8 rounded-b-3xl rounded-tr-3xl shadow-sm relative overflow-hidden print:p-0 print:border-none print:shadow-none">
        
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

      {/* Fee Collection Dialog */}
      <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
        <DialogContent className="sm:max-w-[420px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="p-8 space-y-6">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl font-medium tracking-tight">Record Payment</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {/* Select Student (if not pre-populated) */}
                    <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Target Student</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm focus:ring-primary/20">
                                <SelectValue placeholder="Select student..." />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5 max-h-48">
                                {studentLedger.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.studentId})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Auto-filled Identity Details block */}
                    {selectedStudentTarget && (
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="opacity-50">Class</span>
                              <span className="font-bold">{selectedStudentTarget.classTitle}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                              <span className="opacity-50">Timing</span>
                              <span className="font-mono font-bold">{selectedStudentTarget.timing}</span>
                           </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Tuition Fee</Label>
                            <Input 
                                type="number"
                                value={feeData.tuitionFee || ''}
                                onChange={(e) => setFeeData(p => ({ ...p, tuitionFee: +e.target.value }))}
                                className="h-12 bg-muted/5 rounded-xl border-primary/5"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Admission Fee</Label>
                            <Input 
                                type="number"
                                value={feeData.admissionFee || ''}
                                onChange={(e) => setFeeData(p => ({ ...p, admissionFee: +e.target.value }))}
                                className="h-12 bg-muted/5 rounded-xl border-primary/5"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 text-primary">Discount Given</Label>
                            <Input 
                                type="number"
                                value={feeData.discount || ''}
                                onChange={(e) => setFeeData(p => ({ ...p, discount: +e.target.value }))}
                                className="h-12 bg-primary/5 text-primary rounded-xl border-primary/10 font-bold"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 text-success">Total Amount Paid</Label>
                            <Input 
                                type="number"
                                value={feeData.paidAmount || ''}
                                onChange={(e) => setFeeData(p => ({ ...p, paidAmount: +e.target.value }))}
                                className="h-12 bg-success/5 text-success rounded-xl border-success/20 font-bold"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button 
                        onClick={handleRecordCollection}
                        className="w-full h-12 bg-success hover:bg-success/90 text-white rounded-xl shadow-xl shadow-success/20 transition-all font-medium flex items-center justify-center gap-2 group/submit"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-1 group-hover/submit:scale-110 transition-transform" /> Confirm Collection
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsCollectOpen(false)} 
                        className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 hover:opacity-100 h-10"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* POS Receipt Preview Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#f4f4f5] dark:bg-[#1a1a1a] border-primary/10 p-6 overflow-hidden rounded-[2rem] shadow-2xl">
            <DialogHeader className="mb-4">
                <DialogTitle className="font-serif text-2xl font-medium tracking-tight text-center">Receipt Generated</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center">
                
                {/* The Hidden/Visible Receipt Wrap. 
                    We display it visually to the user, but it's wrapped in receiptRef for printing exclusively. 
                    It acts as a preview here. */}
                <div className="relative border-4 border-dashed border-primary/10 bg-white p-4 shadow-sm w-[332px] mx-auto h-[400px] overflow-y-auto mb-6 custom-scrollbar">
                     <div ref={thermalReceiptRef} className="w-[300px] bg-white print:m-0">
                         {renderThermalCopy('Student Copy')}
                         <div className="w-full border-t-2 border-dashed border-black/30 my-4 flex justify-center relative">
                             <div className="bg-white px-2 absolute -top-2.5 text-black/50 text-[10px]">✂</div>
                         </div>
                         {renderThermalCopy('Office Copy')}
                     </div>
                </div>

                <Button 
                    onClick={() => handleThermalPrint()}
                    className="w-full max-w-[332px] h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all font-bold text-lg flex items-center justify-center gap-3"
                >
                    <Receipt className="w-5 h-5" /> Execute Thermal Print
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </PageShell>
  )
}
