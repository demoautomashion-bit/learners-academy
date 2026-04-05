'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Calculator, 
  Wallet, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Download,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function PayrollContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get('id')
  
  const { teachers, courses, students, feePayments, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  
  const [compensationModel, setCompensationModel] = useState<'fixed' | 'percentage'>('fixed')
  const [compensationRate, setCompensationRate] = useState<number>(1000)
  const [ledgerSearch, setLedgerSearch] = useState('')

  const teacher = teachers.find(t => t.id === teacherId || t.employeeId === teacherId)
  
  const financialData = useMemo(() => {
    if (!teacher) return { roster: [], paidCount: 0, unpaidCount: 0, totalPaidRevenue: 0 }
    
    const teacherCourses = courses?.filter(c => c.teacherId === teacher.id)
    let paidCount = 0
    let unpaidCount = 0
    let totalPaidRevenue = 0
    let roster: any[] = []

    teacherCourses.forEach(course => {
      const courseStudents = students?.filter(s => s.enrolledCourses?.includes(course.id))
      courseStudents.forEach(student => {
        const payment = feePayments.find((fp: any) => fp.studentId === student.id && fp.courseId === course.id)
        const isPaid = payment && (payment.status === 'paid' || payment.status === 'partial')
        
        if (isPaid) {
          paidCount++
          totalPaidRevenue += (payment.amountPaid || 0)
        } else {
          unpaidCount++
        }
        
        roster.push({
          id: `${student.id}-${course.id}`,
          studentName: student.name,
          studentId: student.studentId,
          courseName: course.title,
          timing: course.schedule,
          status: isPaid ? 'Paid' : 'Due',
          amount: isPaid ? payment.amountPaid : 0,
          totalFee: payment?.amount || 0
        })
      })
    })

    return { roster, paidCount, unpaidCount, totalPaidRevenue }
  }, [teacher, courses, students, feePayments])

  const filteredRoster = useMemo(() => {
    return financialData.roster?.filter(item => 
      item.studentName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.courseName.toLowerCase().includes(ledgerSearch.toLowerCase())
    )
  }, [financialData.roster, ledgerSearch])

  const computedSalary = compensationModel === 'fixed' 
    ? financialData.paidCount * compensationRate 
    : financialData.totalPaidRevenue * (compensationRate / 100)

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif">Professional Record Missing</h2>
        <p className="text-muted-foreground">The requested instructor's financial data could not be localized.</p>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/admin/teachers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registry
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/teachers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Institutional Payroll</h1>
            <div className="flex items-center gap-2 mt-1">
               <Avatar className="w-5 h-5 ring-1 ring-primary/20">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
               </Avatar>
               <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">{teacher.name} • {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl text-xs font-normal border-primary/10 hover:bg-primary/5 uppercase tracking-widest">
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
        </div>
      </div>

      {/* Global Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium">
          <CardContent className="p-6">
             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Total Faculty Revenue</p>
             <p className="text-3xl font-serif">Rs. {financialData.totalPaidRevenue.toLocaleString()}</p>
             <div className="flex items-center gap-1 mt-2 text-success">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-bold">12% growth vs last period</span>
             </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-success/5 bg-card/40 backdrop-blur-md shadow-premium">
          <CardContent className="p-6">
             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Paid Enrolments</p>
             <p className="text-3xl font-serif text-success">{financialData.paidCount}</p>
             <p className="text-[10px] text-muted-foreground mt-2 italic font-serif">Verified institutional payments</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-destructive/5 bg-card/40 backdrop-blur-md shadow-premium">
          <CardContent className="p-6">
             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Outstanding Dues</p>
             <p className="text-3xl font-serif text-destructive">{financialData.unpaidCount}</p>
             <p className="text-[10px] text-muted-foreground mt-2 italic font-serif">Pending audit resolution</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-primary/5 bg-primary/5 shadow-inner-premium border-2 border-dashed">
          <CardContent className="p-6 flex flex-col justify-center h-full">
             <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Calculated Payout</p>
             <p className="text-3xl font-serif text-primary">Rs. {computedSalary.toLocaleString()}</p>
             <p className="text-[9px] text-primary/60 mt-2 uppercase tracking-tighter">*Engineered based on {compensationModel} model</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Ledger */}
        <div className="lg:col-span-3 space-y-6">
           <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium overflow-hidden">
              <CardHeader className="border-b border-primary/5 bg-muted/10 h-20 flex flex-row items-center justify-between px-8">
                 <div>
                    <CardTitle className="font-serif flex items-center gap-3 text-xl">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       Instructor Batch Ledger
                    </CardTitle>
                 </div>
                 <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      placeholder="Search ledger entries..." 
                      className="pl-10 h-10 bg-background/50 border-primary/10 rounded-xl text-xs"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                    />
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/5 h-12 uppercase tracking-widest text-[9px]">
                       <TableRow className="hover:bg-transparent border-primary/5">
                          <TableHead className="pl-8">Student Candidate</TableHead>
                          <TableHead>Assigned Batch</TableHead>
                          <TableHead>Execution Schedule</TableHead>
                          <TableHead className="text-right">Ledger Status</TableHead>
                          <TableHead className="pr-8 text-right">Contribution</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredRoster?.map((item) => (
                          <TableRow key={item.id} className="hover:bg-primary/5 transition-colors duration-300 border-primary/5 h-16">
                             <TableCell className="pl-8">
                                <div>
                                   <p className="font-serif text-sm">{item.studentName}</p>
                                   <p className="text-[10px] text-muted-foreground uppercase">{item.studentId}</p>
                                </div>
                             </TableCell>
                             <TableCell className="font-normal text-xs">{item.courseName}</TableCell>
                             <TableCell className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.timing}</TableCell>
                             <TableCell className="text-right">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px] uppercase font-normal tracking-widest h-6 px-3",
                                    item.status === 'Paid' ? "bg-success/5 text-success border-success/20" : "bg-destructive/5 text-destructive border-destructive/20"
                                  )}
                                >
                                   {item.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <AlertCircle className="w-3 h-3 mr-1.5" />}
                                   {item.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="pr-8 text-right font-serif text-sm">
                                {item.status === 'Paid' ? `Rs. ${item.amount.toLocaleString()}` : '—'}
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
                 {filteredRoster.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center opacity-40">
                       <Calculator className="w-12 h-12 mb-4" />
                       <p className="font-serif">No ledger synchronized for current query.</p>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Salary Engine Sidebar */}
        <div className="space-y-6">
           <Card className="rounded-[2.5rem] border-primary/10 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl shadow-premium overflow-hidden border-2">
              <CardHeader className="bg-white/10 p-8 pb-4">
                 <CardTitle className="font-serif text-xl flex items-center gap-3">
                   <Calculator className="w-5 h-5 text-primary" />
                   Salary Engine
                 </CardTitle>
                 <CardDescription className="text-xs">Adjust compensation parameters for the active period</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Calculation Model</label>
                   <Select value={compensationModel} onValueChange={(val: any) => setCompensationModel(val)}>
                      <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-2xl">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-primary/10 shadow-premium">
                         <SelectItem value="fixed" className="rounded-xl">Fixed Head Count</SelectItem>
                         <SelectItem value="percentage" className="rounded-xl">Gross Revenue %</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Baseline Rate</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-serif text-xs">
                        {compensationModel === 'fixed' ? 'Rs.' : '%'}
                      </span>
                      <Input 
                        type="number" 
                        value={compensationRate}
                        onChange={(e) => setCompensationRate(Number(e.target.value) || 0)}
                        className="h-12 pl-12 bg-background/50 border-primary/20 rounded-2xl font-serif text-lg"
                      />
                   </div>
                   <p className="text-[9px] text-muted-foreground italic leading-relaxed opacity-60">
                     {compensationModel === 'fixed' 
                       ? 'Instructor receives a fixed amount for every student who has successfully cleared their dues.' 
                       : 'Instructor receives a percentage of the total gross revenue generated from their assigned batches.'}
                   </p>
                </div>

                <div className="pt-6 border-t border-primary/10 space-y-4">
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Period Forecast</p>
                         <p className="text-2xl font-serif text-primary">Rs. {computedSalary.toLocaleString()}</p>
                      </div>
                      <Wallet className="w-8 h-8 text-primary opacity-20" />
                   </div>
                   <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-primary/20">
                      Generate Payout Logic
                   </Button>
                </div>
              </CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md p-6">
              <div className="flex items-center gap-3 mb-4">
                 <Users className="w-4 h-4 text-muted-foreground opacity-40" />
                 <h4 className="text-[10px] uppercase tracking-widest font-bold">Faculty Composition</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Assigned Batches</span>
                    <span className="text-xs font-serif">{courses?.filter(c => c.teacherId === teacher.id).length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Direct Enrollments</span>
                    <span className="text-xs font-serif">{financialData.roster.length}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default function FacultyPayrollPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Calculator className="w-12 h-12 animate-pulse opacity-20" />
        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Synchronizing Financial Registry...</p>
      </div>
    }>
      <PayrollContent />
    </Suspense>
  )
}
