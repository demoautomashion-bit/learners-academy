'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Award, 
  GraduationCap,
  DollarSign,
  Clock,
  User,
  ShieldCheck,
  TrendingUp,
  History
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'

export default function StudentDossierPage() {
  const params = useParams()
  const router = useRouter()
  const { students, courses, feePayments, updateStudentSuccessMetrics, isInitialized } = useData()
  const hasMounted = useHasMounted()


  
  // Find student by ID or studentId
  const student = students.find(s => s.id === params.id || s.studentId === params.id)
  
  const [metricProgress, setMetricProgress] = useState(0)
  const [metricGrade, setMetricGrade] = useState('')

  useEffect(() => {
    if (student) {
      setMetricProgress(student.progress || 0)
      setMetricGrade(student.grade || '')
    }
  }, [student])

  const handleUpdateMetrics = async () => {
    if (!student) return
    try {
      await updateStudentSuccessMetrics(student.id, metricProgress, metricGrade)
      toast.success('Institutional metrics synchronized successfully')
    } catch (err) {
      toast.error('Failed to sync metrics')
    }
  }

  if (!isInitialized || !hasMounted) {
    return <DashboardSkeleton />
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif font-medium">Student Not Found</h2>
        <p className="text-muted-foreground">The requested student dossier does not exist in our registry.</p>
        <Button variant="outline" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Student List
        </Button>
      </div>
    )
  }

  const studentFees = feePayments?.filter(f => f.studentId === student.id)
  const totalPaid = studentFees.reduce((sum, f) => sum + (f.amountPaid || 0), 0)
  const totalDue = studentFees.reduce((sum, f) => sum + (f.totalAmount || 0), 0) - totalPaid

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="">
            <Link href="/admin/students">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-medium">Academic Dossier</h1>
            <p className="text-muted-foreground text-sm   opacity-60">Permanent Institutional Record</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={cn(
             "px-4 py-1.5  text-xs ",
             student.status === 'active' ? "bg-success hover:bg-success/90" : ""
           )}>
             {student.status}
           </Badge>
        </div>
      </div>

      {/* Top Summary Card */}
      <Card className="glass-1 border-none bg-gradient-to-br from-card/80 to-card/40 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
        <CardContent className="p-6 md:p-6 flex-1">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-8 ring-primary/5 shadow-2xl">
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-serif">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h2 className="md: font-serif text-2xl font-serif font-medium">{student.name}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2  bg-primary/20" /> {student.studentId || 'ID Pending'}</span>
                  <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                  <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {student.phone}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 items-stretch">
                <div className="bg-background/40  p-4  border ">
                   <p className="text-xs   text-muted-foreground mb-1  opacity-70">Academic Grade</p>
                   <p className="text-2xl font-serif text-primary">{student.grade || 'N/A'}</p>
                </div>
                <div className="bg-background/40  p-4  border ">
                   <p className="text-xs   text-muted-foreground mb-1  opacity-70">Attendance Trend</p>
                   <p className="text-2xl font-serif text-success">92%</p>
                </div>
                <div className="bg-background/40  p-4  border ">
                   <p className="text-xs   text-muted-foreground mb-1  opacity-70">Enrolled Since</p>
                   <p className="text-2xl font-serif">
                      <ClientDate date={student.enrolledAt} formatString="MMM yyyy" fallback="Loading..." />
                   </p>
                </div>
                <div className="bg-background/40  p-4  border ">
                   <p className="text-xs   text-muted-foreground mb-1  opacity-70">Portal Status</p>
                   <p className="text-2xl font-serif text-accent">Active</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions / Metrics Update */}
            <div className="w-full md:w-72 bg-background/20   p-6 border border-white/10 space-y-4">
               <h4 className="text-xs text-muted-foreground font-medium">Academic Controls</h4>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs  ">
                      <span>Progress</span>
                      <span className="text-primary">{metricProgress}%</span>
                    </div>
                    <Input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={metricProgress}
                      onChange={(e) => setMetricProgress(parseInt(e.target.value))}
                      className="h-1.5 p-0 bg-primary/10 accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs  ">Assigned Grade</span>
                    <Select value={metricGrade} onValueChange={setMetricGrade}>
                       <SelectTrigger className="h-9  bg-background/50 ">
                          <SelectValue placeholder="Grade" />
                       </SelectTrigger>
                       <SelectContent>
                          {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => (
                             <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleUpdateMetrics}
                    size="sm" 
                    className="w-full  bg-primary hover:bg-primary/90  mt-2"
                  >
                    Sync Records
                  </Button>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Academic Progress Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-3 text-xl font-serif font-medium">
                <TrendingUp className="w-5 h-5 text-primary" />
                Academic Progress & Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground   text-xs ">Overall Completion</span>
                  <span className="font-serif text-lg">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 items-stretch">
                <div className="flex items-center gap-4 p-5  bg-primary/5 border ">
                  <div className="w-12 h-12  bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs   text-muted-foreground ">Enrolled Classes</p>
                    <p className="text-xl font-serif">{student.enrolledCourses.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5  bg-success/5 border border-success/10">
                  <div className="w-12 h-12  bg-success/10 flex items-center justify-center">
                    <History className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xs   text-muted-foreground ">Active Term</p>
                    <p className="text-xl font-serif">Spring 2024</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h4 className="text-xs text-muted-foreground opacity-60 font-medium">Current Enrollments</h4>
                 {student.enrolledCourses?.map(courseId => {
                   const course = courses.find(c => c.id === courseId)
                   return (
                     <div key={courseId} className="flex items-center justify-between p-4  bg-background/40 border group hover: transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10  bg-muted flex items-center justify-center text-xs font-serif ">
                            {course?.title.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-serif">{course?.title || 'Unknown Course'}</p>
                            <p className="text-xs text-muted-foreground">{course?.schedule} • Teacher: {course?.teacherName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs   opacity-60">Active</Badge>
                     </div>
                   )
                 })}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-3 text-xl font-serif font-medium">
                <DollarSign className="w-5 h-5 text-success" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                <div className="bg-background/40 p-5  border ">
                   <p className="text-xs   text-muted-foreground mb-1 ">Total Paid</p>
                   <p className="text-2xl font-serif text-success">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-5  border ">
                   <p className="text-xs   text-muted-foreground mb-1 ">Current Dues</p>
                   <p className="text-2xl font-serif text-destructive">${totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-5  border  hidden md:block">
                   <p className="text-xs   text-muted-foreground mb-1 ">Payment Status</p>
                   <Badge className={cn(
                     "mt-1  text-xs  px-3",
                     totalDue === 0 ? "bg-success" : "bg-warning"
                   )}>
                     {totalDue === 0 ? 'Settled' : 'Action Required'}
                   </Badge>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-xs text-muted-foreground opacity-60 mb-4 font-medium">Transaction History</h4>
                <div className=" border  overflow-hidden bg-background/20">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="text-xs   ">Class Level</TableHead>
                        <TableHead className="text-xs   ">Amount</TableHead>
                        <TableHead className="text-xs   ">Date</TableHead>
                        <TableHead className="text-right text-xs   ">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentFees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm italic">
                            No payment records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        studentFees?.map((fee) => (
                          <TableRow key={fee.id} className="group hover:bg-primary/5 ">
                            <TableCell className="font-serif">
                              {courses.find(c => c.id === fee.courseId)?.title || 'Registry Level'}
                            </TableCell>
                            <TableCell className="font-sans text-sm font-medium">
                              ${fee.amountPaid.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-sans">
                              <ClientDate date={fee.paymentDate || fee.createdAt} formatString="MMM d, yyyy" fallback="---" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-xs px-2 py-0   ">
                                {fee.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Institutional History & Profile */}
        <div className="space-y-6">
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-3 text-xl font-serif font-medium">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Institutional Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8  bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs   text-muted-foreground ">Guardian Information</p>
                    <p className="text-sm font-serif">{student.guardianName || 'Institutional Delegate'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8  bg-muted flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs   text-muted-foreground ">Session Timing</p>
                    <p className="text-sm font-serif">{student.classTiming || 'Morning Session'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8  bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs   text-muted-foreground ">Enrollment Date</p>
                    <p className="text-sm font-serif font-sans opacity-80"><ClientDate date={student.enrolledAt} formatString="MMMM d, yyyy" fallback="---" /></p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t ">
                 <h4 className="text-xs text-muted-foreground opacity-60 mb-4 font-medium">Official Verification</h4>
                 <div className="p-4  bg-background/40 border border-dashed  text-center">
                    <p className="text-xs text-muted-foreground italic mb-2 font-normal">Digitally Signed by</p>
                    <p className="text-xs   font-serif">Academic Registrar</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-1 bg-gradient-to-br from-primary/5 to-accent/5 p-1 relative overflow-hidden group rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Award className="w-16 h-16" />
            </div>
            <div className="  p-6 space-y-4 relative z-10">
              <h4 className="font-serif text-lg font-medium">Academic Honors</h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12  bg-warning/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-warning" />
                 </div>
                 <div>
                    <p className="text-sm font-serif">Distinction Candidate</p>
                    <p className="text-xs text-muted-foreground  ">Term Excellence Award</p>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
