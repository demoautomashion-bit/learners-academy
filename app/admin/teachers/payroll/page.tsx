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
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'
import {
  getTrimesters,
  getDateRangeFromFilterKey,
} from '@/lib/trimesters'
import { TrimesterBanner } from '@/components/shared/trimester-banner'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'

type TimePeriod = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

function PayrollContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasMounted = useHasMounted()
  const teacherId = searchParams.get('id')
  
  const { teachers, courses, students, feePayments, isInitialized } = useData()
    
  const [compensationModel, setCompensationModel] = useState<'fixed' | 'percentage'>('fixed')
  const [compensationRate, setCompensationRate] = useState<number>(1000)
  const [ledgerSearch, setLedgerSearch] = useState('')

  const teacher = useMemo(() => 
    teachers.find(t => t.id === teacherId || t.employeeId === teacherId)
  , [teachers, teacherId])
  
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')
  const currentYear = useMemo(() => {
    return new Date().getFullYear()
  }, [])
  
  const trimesters = useMemo(() => getTrimesters(currentYear), [currentYear])
  
  const financialData = useMemo(() => {
    if (!hasMounted || !teacher) return { roster: [], paidCount: 0, unpaidCount: 0, totalPaidRevenue: 0 }
    
    const trimesterRange = getDateRangeFromFilterKey(periodFilter, currentYear)
    const teacherCourses = (courses || []).filter(c => c.teacherId === teacher.id)
    let paidCount = 0
    let unpaidCount = 0
    let totalPaidRevenue = 0
    let roster: any[] = []

    teacherCourses.forEach(course => {
      const courseStudents = (students || []).filter(s => s.enrolledCourses?.includes(course.id))
      courseStudents.forEach(student => {
        const payment = (feePayments || []).find((fp: any) => {
          const matches = fp.studentId === student.id && fp.courseId === course.id
          if (!matches) return false
          
          if (trimesterRange && fp.paymentDate) {
            const d = new Date(fp.paymentDate).getTime()
            return d >= trimesterRange.start.getTime() && d <= trimesterRange.end.getTime()
          }
          return true
        })

        const isPaid = payment && (payment.status === 'Paid' || payment.status === 'Partial')
        
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
          totalFee: payment?.totalAmount || 0,
          paymentDate: payment?.paymentDate
        })
      })
    })

    return { roster, paidCount, unpaidCount, totalPaidRevenue }
  }, [teacher, courses, students, feePayments, hasMounted, periodFilter, currentYear])

  const filteredRoster = useMemo(() => {
    if (!hasMounted) return []
    return (financialData.roster || []).filter(item => 
      item.studentName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.courseName.toLowerCase().includes(ledgerSearch.toLowerCase())
    )
  }, [financialData.roster, ledgerSearch, hasMounted])

  const computedSalary = compensationModel === 'fixed' 
    ? financialData.paidCount * compensationRate 
    : financialData.totalPaidRevenue * (compensationRate / 100)

  if (!hasMounted || !isInitialized) return <DashboardSkeleton />

  if (!teacher) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-serif font-medium">Professional Record Missing</h2>
          <p className="text-muted-foreground">The requested instructor's financial data could not be localized.</p>
          <Button variant="outline" asChild className="">
            <Link href="/admin/teachers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registry
            </Link>
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/teachers">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/5 hover:bg-white/5">
                <ArrowLeft className="h-4 w-4 opacity-70" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-tight">Faculty Payroll Engine</h1>
              <p className="text-xs text-muted-foreground opacity-50 uppercase tracking-widest mt-1">Salary Computation Module</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className=" font-normal  hover:bg-primary/5">
              <Download className="w-4 h-4 mr-2" />
              Export Audit
            </Button>
          </div>
        </div>

        {/* Global Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardContent className="p-6 flex-1">
               <p className="text-xs   text-muted-foreground  mb-2">Total Faculty Revenue</p>
               <p className="text-3xl font-serif">Rs. {financialData.totalPaidRevenue.toLocaleString()}</p>
               <div className="flex items-center gap-1 mt-2 text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs ">12% growth vs last period</span>
               </div>
            </CardContent>
          </Card>
          
          <Card className="glass-1 border-success/5 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardContent className="p-6 flex-1">
               <p className="text-xs   text-muted-foreground  mb-2">Paid Enrolments</p>
               <p className="text-3xl font-serif text-success">{financialData.paidCount}</p>
               <p className="text-xs text-muted-foreground mt-2 italic font-serif">Verified institutional payments</p>
            </CardContent>
          </Card>

          <Card className="glass-1 border-destructive/5 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardContent className="p-6 flex-1">
               <p className="text-xs   text-muted-foreground  mb-2">Outstanding Dues</p>
               <p className="text-3xl font-serif text-destructive">{financialData.unpaidCount}</p>
               <p className="text-xs text-muted-foreground mt-2 italic font-serif">Pending audit resolution</p>
            </CardContent>
          </Card>

          <Card className="glass-1 bg-primary/5 border-2 border-dashed rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardContent className="p-6 flex flex-col justify-center h-full flex-1">
               <p className="text-xs   text-primary  mb-1">Calculated Payout</p>
               <p className="text-3xl font-serif text-primary">Rs. {computedSalary.toLocaleString()}</p>
               <p className="text-xs text-primary/60 mt-2  ">*Engineered based on {compensationModel} model</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
          {/* Main Ledger */}
          <div className="lg:col-span-3 space-y-6">
             <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                <CardHeader className="border-b  bg-muted/10 h-20 flex flex-row items-center justify-between px-8">
                   <div>
                      <CardTitle className="font-serif flex items-center gap-3 text-xl font-medium">
                         <ShieldCheck className="w-5 h-5 text-primary" />
                         Instructor Batch Ledger
                      </CardTitle>
                   </div>
                   <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                      <Input 
                        placeholder="Search ledger entries..." 
                        className="pl-10 h-10 bg-background/50   text-xs"
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-6 flex-1">
                   <Table>
                      <TableHeader className="bg-muted/5 h-12   text-xs">
                         <TableRow className="hover:bg-transparent ">
                            <TableHead className="pl-8">Student Candidate</TableHead>
                            <TableHead>Assigned Batch</TableHead>
                            <TableHead>Execution Schedule</TableHead>
                            <TableHead className="text-right">Ledger Status</TableHead>
                            <TableHead className="pr-8 text-right">Contribution</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {(filteredRoster || []).map((item) => (
                            <TableRow key={item.id} className="hover:bg-primary/5 transition-colors duration-300  h-16">
                               <TableCell className="pl-8">
                                  <div>
                                     <p className="font-serif text-sm">{item.studentName}</p>
                                     <p className="text-xs text-muted-foreground ">{item.studentId}</p>
                                  </div>
                               </TableCell>
                               <TableCell className="font-normal text-xs">{item.courseName}</TableCell>
                               <TableCell className="text-xs text-muted-foreground  ">{item.timing}</TableCell>
                               <TableCell className="text-right">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs  font-normal  h-6 px-3",
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
             <Card className="glass-1 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden border-2 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                <CardHeader className="bg-white/10 p-8 pb-4">
                   <CardTitle className="font-serif text-xl flex items-center gap-3 font-medium">
                     <Calculator className="w-5 h-5 text-primary" />
                     Salary Engine
                   </CardTitle>
                   <CardDescription className="text-xs">Adjust compensation parameters for the active period</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6 flex-1">
                  <div className="space-y-2">
                     <label className="text-xs   text-muted-foreground ">Calculation Model</label>
                     <Select value={compensationModel} onValueChange={(val: any) => setCompensationModel(val)}>
                        <SelectTrigger className="h-12 bg-background/50  ">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="  ">
                           <SelectItem value="fixed" className="">Fixed Head Count</SelectItem>
                           <SelectItem value="percentage" className="">Gross Revenue %</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs   text-muted-foreground ">Baseline Rate</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-serif text-xs">
                          {compensationModel === 'fixed' ? 'Rs.' : '%'}
                        </span>
                        <Input 
                          type="number" 
                          value={compensationRate}
                          onChange={(e) => setCompensationRate(Number(e.target.value) || 0)}
                          className="h-12 pl-12 bg-background/50   font-serif text-lg"
                        />
                     </div>
                     <p className="text-xs text-muted-foreground italic leading-relaxed opacity-60">
                       {compensationModel === 'fixed' 
                         ? 'Instructor receives a fixed amount for every student who has successfully cleared their dues.' 
                         : 'Instructor receives a percentage of the total gross revenue generated from their assigned batches.'}
                     </p>
                  </div>

                  <div className="pt-6 border-t  space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-xs   text-muted-foreground">Period Forecast</p>
                           <p className="text-2xl font-serif text-primary">Rs. {computedSalary.toLocaleString()}</p>
                        </div>
                        <Wallet className="w-8 h-8 text-primary opacity-20" />
                     </div>
                     <Button className="w-full  bg-primary  shadow-xl shadow-primary/20">
                        Generate Payout Logic
                     </Button>
                  </div>
                </CardContent>
             </Card>

             <Card className="glass-1 p-6 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                   <Users className="w-4 h-4 text-muted-foreground opacity-40" />
                   <h4 className="text-xs font-medium">Faculty Composition</h4>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Assigned Batches</span>
                      <span className="text-xs font-serif">{(courses || []).filter(c => c.teacherId === teacher.id).length}</span>
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
    </PageShell>
  )
}

export default function FacultyPayrollPage() {
  const hasMounted = useHasMounted()
  const { isInitialized } = useData()
  
  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Calculator className="w-12 h-12 animate-pulse opacity-20" />
          <p className="text-xs   opacity-40 ">Synchronizing Financial Registry...</p>
        </div>
      </PageShell>
    }>
      <PayrollContent />
    </Suspense>
  )
}
