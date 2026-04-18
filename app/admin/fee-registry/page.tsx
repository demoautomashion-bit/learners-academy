'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DollarSign,
  Search,
  MoreVertical,
  Plus,
  ArrowUpRight,
  TrendingDown,
  History,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Receipt,
  Scan,
  UserCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Student, Course } from '@/lib/types'
import { getActiveTrimester } from '@/lib/trimesters'
import { motion } from 'framer-motion'
import { useReactToPrint } from 'react-to-print'

export default function FeeRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, courses, feePayments, addFeeAccount, recordPayment, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSeason, setActiveSeason] = useState('Summer')
  
  // Dialog State
  const [isCollectOpen, setIsCollectOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  
  // Transaction State
  const [feeData, setFeeData] = useState({
    courseId: '',
    tuitionFee: 0,
    admissionFee: 0,
    discount: 0,
    paidAmount: 0
  })

  // Print Ref
  const receiptRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  })

  const currentTrimester = useMemo(() => getActiveTrimester(), [])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredStudents = (Array.isArray(students) ? students : []).filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRecordCollection = async () => {
    if (!selectedStudent || !feeData.courseId) return

    try {
        await addFeeAccount({
            studentId: selectedStudent.id,
            courseId: feeData.courseId,
            totalAmount: feeData.tuitionFee + feeData.admissionFee,
            discount: feeData.discount,
            initialDeposit: feeData.paidAmount
        })
        
        setIsCollectOpen(false)
        setIsReceiptOpen(true) // Open receipt view immediately after collection
        toast.active("Inflow Logged", {
            description: `Payment of PKR ${feeData.paidAmount.toLocaleString()} captured.`,
            icon: <CheckCircle2 className="w-4 h-4 text-success" />
        })
    } catch (error) {
        toast.error("Collection disrupted")
    }
  }

  const columns: Column<Student>[] = [
    {
      label: 'Financial Identity',
      render: (student) => (
        <div className="flex items-center gap-4 group/identity">
          <Avatar className="h-10 w-10 border border-primary/10 shadow-sm group-hover/identity:scale-105 transition-transform duration-500">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(student.name, 'S')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{student.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-[0.2em] font-black">{student.studentId}</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Account Status',
      render: (student) => {
        const payment = feePayments.find(p => p.studentId === student.id)
        return (
            <div className="flex items-center gap-3">
                <Badge 
                    variant="outline" 
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-lg border-2",
                        payment?.status === 'Paid' ? "bg-success/5 text-success border-success/20" : 
                        payment?.status === 'Partial' ? "bg-warning/5 text-warning border-warning/20" :
                        "bg-destructive/5 text-destructive border-destructive/20"
                    )}
                >
                    {payment?.status || 'Uninitialized'}
                </Badge>
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground opacity-40 font-bold uppercase tracking-tight">{currentTrimester.season} Cycle</span>
                </div>
            </div>
        )
      }
    },
    {
        label: 'Institutional Flow',
        render: (student) => {
            const payment = feePayments.find(p => p.studentId === student.id)
            return (
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-serif font-medium tracking-tight">PKR {payment?.amountPaid?.toLocaleString() || '0'}</span>
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                         <span className="text-[9px] text-muted-foreground opacity-40 uppercase font-black tracking-widest">{payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No Entry'}</span>
                    </div>
                </div>
            )
        }
    },
    {
      label: 'Actions',
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-primary/5 transition-all">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 glass-2 border-white/5 shadow-2xl">
            <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] opacity-40 px-4 py-4 font-black">Fiscal Command</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => {
                    setSelectedStudent(student)
                    setIsCollectOpen(true)
                }}
                className="gap-4 cursor-pointer p-4 focus:bg-success/5 text-success rounded-xl group"
            >
              <div className="w-10 h-10 rounded-xl bg-success/5 flex items-center justify-center border border-success/10 group-hover:bg-success group-hover:text-white transition-all">
                <Plus className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-tight">Record Collection</span>
                <span className="text-[9px] opacity-40 font-normal">Finalize Fee Slip Protocol</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
               onClick={() => {
                   setSelectedStudent(student)
                   setIsReceiptOpen(true)
               }}
               className="gap-4 cursor-pointer p-4 focus:bg-primary/5 transition-all rounded-xl mt-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                <Printer className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-tight">Generate Receipt</span>
                <span className="text-[9px] opacity-40 font-normal">Thermal Slip Export</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px'
    }
  ]

  const stats = [
    { label: 'Weekly Revenue', value: 'PKR 1.2M', sub: 'Current Temporal Momentum', icon: TrendingDown, color: 'text-success' },
    { label: 'Cycle Collection', value: 'PKR 4.8M', sub: `${currentTrimester.season} Trimester`, icon: DollarSign, color: 'text-primary' },
    { label: 'Identified Arrears', value: 'PKR 420k', sub: 'Critical Recovery Required', icon: Clock, color: 'text-warning' },
  ]

  // Receipt Content Helper
  const getReceiptData = () => {
      const payment = feePayments.find(p => p.studentId === selectedStudent?.id)
      const course = courses.find(c => c.id === payment?.courseId)
      return { payment, course }
  }

  const { payment, course } = getReceiptData()

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Fiscal Registry"
        description="Master ledger for student tuition collection, thermal slip generation, and seasonal revenue auditing."
        actions={
          <div className="flex items-center gap-4">
             <Button 
                variant="outline" 
                className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5"
                onClick={() => router.push('/admin/economics')}
            >
                <History className="w-4 h-4 mr-2 opacity-50" /> Economics Audit
             </Button>
             <Button className="h-11 px-8 font-normal bg-primary shadow-xl shadow-primary/20 rounded-xl">
                <Scan className="w-4 h-4 mr-2" /> Sync Collection Cycle
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[2rem] transition-all group relative isolate">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="p-10">
                <div className="flex items-center justify-between mb-8">
                     <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">{stat.label}</CardDescription>
                     <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                </div>
                <CardTitle className={cn("text-4xl font-serif font-medium tracking-tight", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-30 mt-4 font-bold italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <EntityDataGrid 
          title="Financial Dossier Index"
          description="Real-time trace of student account balances and institutional ingress velocity."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex items-center gap-1.5 p-1.5 bg-muted/10 border border-primary/5 rounded-2xl glass-2">
                    {['Spring', 'Summer', 'Autumn', 'Winter'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setActiveSeason(t)}
                            className={cn(
                                "px-5 py-2 text-[10px] uppercase tracking-widest transition-all font-black rounded-xl",
                                activeSeason === t 
                                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                    : "text-muted-foreground opacity-40 hover:opacity-100 hover:bg-primary/5"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Search Account ID or Identity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-none rounded-2xl"
                    />
                </div>
            </div>
          }
          emptyState={
            <div className="text-center py-32 space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/5">
                    <DollarSign className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="font-serif text-2xl font-medium tracking-tight">Ledger Empty</p>
                    <p className="text-xs text-muted-foreground opacity-40 italic">System awaiting student registration synchronization.</p>
                </div>
            </div>
          }
        />
      </div>

      {/* COLLECTION DIALOG */}
      <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
        <DialogContent className="sm:max-w-[520px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="p-10 md:p-14 space-y-12">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-center text-success mb-2">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Record Collection</DialogTitle>
                    <DialogDescription className="text-xs opacity-40 font-normal leading-relaxed">
                        Establishing a financial protocol for <span className="text-foreground font-bold">{selectedStudent?.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                     <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Academic Batch</Label>
                            <Select onValueChange={(v) => setFeeData(prev => ({ ...prev, courseId: v }))}>
                                <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-6 text-sm font-medium">
                                    <SelectValue placeholder="Identify Batch" />
                                </SelectTrigger>
                                <SelectContent className="glass-2 border-white/5 p-2">
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id} className="rounded-xl py-3">{c.title || c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Tuition Fee</Label>
                                <Input 
                                    type="number"
                                    value={feeData.tuitionFee}
                                    onChange={(e) => setFeeData(prev => ({ ...prev, tuitionFee: Number(e.target.value) }))}
                                    className="h-14 px-6 bg-muted/5 border-primary/5 rounded-2xl text-sm font-serif"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Admission Fee</Label>
                                <Input 
                                    type="number"
                                    value={feeData.admissionFee}
                                    onChange={(e) => setFeeData(prev => ({ ...prev, admissionFee: Number(e.target.value) }))}
                                    className="h-14 px-6 bg-muted/5 border-primary/5 rounded-2xl text-sm font-serif"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Discount (PKR)</Label>
                                <Input 
                                    type="number"
                                    value={feeData.discount}
                                    onChange={(e) => setFeeData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                                    className="h-14 px-6 bg-muted/5 border-primary/5 rounded-2xl text-sm font-serif"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black text-primary ml-1">Paid Amount (Inflow)</Label>
                                <Input 
                                    type="number"
                                    value={feeData.paidAmount}
                                    onChange={(e) => setFeeData(prev => ({ ...prev, paidAmount: Number(e.target.value) }))}
                                    className="h-14 px-6 bg-primary/5 border-primary/20 rounded-2xl text-sm font-serif text-primary font-bold"
                                />
                            </div>
                        </div>
                     </div>
                </div>

                <div className="flex flex-col gap-5 pt-4">
                    <Button 
                        onClick={handleRecordCollection}
                        className="w-full h-16 bg-primary hover:bg-primary/95 rounded-[1.75rem] shadow-2xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3 group/submit"
                    >
                        Finalize Collection <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-2 transition-transform" />
                    </Button>
                    <Button variant="ghost" onClick={() => setIsCollectOpen(false)} className="text-[10px] uppercase tracking-widest font-black opacity-30 hover:opacity-100">
                        Cancel Protocol
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* RECEIPT PREVIEW DIALOG */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[2rem] border-none shadow-2xl">
            <div className="p-12 text-center space-y-8">
                <div className="flex flex-col items-center gap-2 pb-6 border-b border-dashed border-gray-100">
                    <Receipt className="w-10 h-10 text-primary opacity-20 mb-2" />
                    <h3 className="font-serif text-2xl font-medium tracking-tight">Receipt Generated</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Thermal Slip Preview</p>
                </div>
                
                {/* Thermal Preview Card */}
                <div className="p-1 rounded-3xl bg-gray-50/50 border border-gray-100">
                     {/* THE ACTUAL THERMAL CONTENT (HIDDEN IN UI BUT FOR PRINT) */}
                    <div ref={receiptRef} className="bg-white p-8 w-[80mm] mx-auto text-black font-mono leading-tight text-left text-[11px] print:m-0 print:w-full">
                        <div className="text-center space-y-1 mb-6 border-b-2 border-black pb-4">
                            <h1 className="text-[14px] font-black uppercase">The Learners Academy</h1>
                            <p className="text-[10px] font-bold">ENGLISH LANGUAGE PROGRAM</p>
                            <p className="text-[8px] leading-tight">Suzuki Stop, Sar-e-Khartar, Mominabad,<br/>Alamdar Road.</p>
                            <p className="text-[8px]">Ph: +92-3093883386 / +92-3115455633</p>
                        </div>

                        <div className="space-y-1.5 mb-6 text-[10px]">
                            <div className="flex justify-between">
                                <span>Student ID:</span>
                                <span className="font-bold">{selectedStudent?.studentId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Name:</span>
                                <span className="font-bold uppercase">{selectedStudent?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Guardian:</span>
                                <span>{selectedStudent?.guardianName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t border-black pt-1 mt-2">
                                <span>Term:</span>
                                <span className="font-bold">{currentTrimester.season}-{currentTrimester.year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Class:</span>
                                <span className="font-bold">{course?.title?.split(' - ')?.[0] || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Timing:</span>
                                <span>{course?.schedule || (course as any)?.classTiming || 'TBD'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Teacher:</span>
                                <span className="font-bold uppercase">{course?.teacherName || 'Professional'}</span>
                            </div>
                        </div>

                        <table className="w-full mb-6 border-t-2 border-b-2 border-black py-2">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="py-1 text-left">Fee Type</th>
                                    <th className="py-1 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                <tr>
                                    <td className="py-1">Tuition Fee:</td>
                                    <td className="py-1 text-right">{payment?.totalAmount || 0}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Admission Fee:</td>
                                    <td className="py-1 text-right">0</td>
                                </tr>
                                <tr>
                                    <td className="py-1">Discount:</td>
                                    <td className="py-1 text-right">{payment?.discount || 0}</td>
                                </tr>
                                <tr className="border-t border-black pt-1">
                                    <td className="py-1 uppercase">Total Fee:</td>
                                    <td className="py-1 text-right">{ (payment?.totalAmount || 0) - (payment?.discount || 0) }</td>
                                </tr>
                                <tr>
                                    <td className="py-1 uppercase">Paid:</td>
                                    <td className="py-1 text-right">{payment?.amountPaid || 0}</td>
                                </tr>
                                <tr className="border-t-2 border-black font-black">
                                    <td className="py-1 uppercase">Dues:</td>
                                    <td className="py-1 text-right">{Math.max(0, (payment?.totalAmount || 0) - (payment?.discount || 0) - (payment?.amountPaid || 0))}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="text-center py-4 relative border-2 border-black mb-6">
                            <span className="text-[14px] font-black uppercase tracking-tighter opacity-10 absolute inset-0 flex items-center justify-center -rotate-12">THE LEARNERS ACADEMY</span>
                            <div className="relative border-4 border-primary/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center text-primary font-black -rotate-12">
                                <div className="text-center">
                                    <p className="text-[12px] leading-tight">PAID</p>
                                    <div className="w-full h-0.5 bg-primary/30 my-0.5" />
                                    <p className="text-[6px]">VERIFIED</p>
                                </div>
                            </div>
                            <p className="text-[8px] font-bold mt-2 uppercase tracking-widest">Received By</p>
                        </div>

                        <div className="text-[7px] leading-snug space-y-2 text-center uppercase tracking-tighter">
                            <p className="font-bold italic">"Registration process is completed. all fees paid are non-refundable under any circumstances."</p>
                            <div className="flex justify-between opacity-50 px-4">
                                <span>Software By: NextLumira Solutions</span>
                                <span>Office Copy</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-6">
                    <Button 
                        onClick={handlePrint}
                        className="h-16 bg-primary hover:bg-primary/95 rounded-[1.75rem] shadow-xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3"
                    >
                        Send to Thermal Printer <Printer className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="ghost" onClick={() => setIsReceiptOpen(false)} className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 h-10">
                        Close Preview
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
