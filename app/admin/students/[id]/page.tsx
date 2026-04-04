'use client'

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

export default function StudentDossierPage() {
  const params = useParams()
  const router = useRouter()
  const { students, courses, feePayments, updateStudentSuccessMetrics } = useData()
  
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

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif">Student Not Found</h2>
        <p className="text-muted-foreground">The requested student dossier does not exist in our registry.</p>
        <Button variant="outline" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Student List
        </Button>
      </div>
    )
  }

  const studentFees = feePayments.filter(f => f.studentId === student.id)
  const totalPaid = studentFees.reduce((sum, f) => sum + (f.amountPaid || 0), 0)
  const totalDue = studentFees.reduce((sum, f) => sum + (f.totalAmount || 0), 0) - totalPaid

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/students">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Academic Dossier</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-60">Permanent Institutional Record</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={cn(
             "px-4 py-1.5 uppercase text-[10px] tracking-widest",
             student.status === 'active' ? "bg-success hover:bg-success/90" : ""
           )}>
             {student.status}
           </Badge>
        </div>
      </div>

      {/* Top Summary Card */}
      <Card className="border-none bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-premium overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-8 ring-primary/5 shadow-2xl">
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-serif">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl md:text-5xl font-serif tracking-tight">{student.name}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/20" /> {student.studentId || 'ID Pending'}</span>
                  <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                  <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {student.phone}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold opacity-70">Academic Grade</p>
                   <p className="text-2xl font-serif text-primary">{student.grade || 'N/A'}</p>
                </div>
                <div className="bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold opacity-70">Attendance Trend</p>
                   <p className="text-2xl font-serif text-success">92%</p>
                </div>
                <div className="bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold opacity-70">Enrolled Since</p>
                   <p className="text-2xl font-serif">
                     {new Date(student.enrolledAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                   </p>
                </div>
                <div className="bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold opacity-70">Portal Status</p>
                   <p className="text-2xl font-serif text-accent">Active</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions / Metrics Update */}
            <div className="w-full md:w-72 bg-background/20 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
               <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Academic Controls</h4>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
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
                    <span className="text-[10px] font-bold uppercase">Assigned Grade</span>
                    <Select value={metricGrade} onValueChange={setMetricGrade}>
                       <SelectTrigger className="h-9 rounded-xl bg-background/50 border-primary/10">
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
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-widest h-10 mt-2"
                  >
                    Sync Records
                  </Button>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Progress Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                Academic Progress & Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Overall Completion</span>
                  <span className="font-serif text-lg">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Enrolled Classes</p>
                    <p className="text-xl font-serif">{student.enrolledCourses.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-success/5 border border-success/10">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <History className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Term</p>
                    <p className="text-xl font-serif">Spring 2024</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-60 font-bold">Current Enrollments</h4>
                 {student.enrolledCourses.map(courseId => {
                   const course = courses.find(c => c.id === courseId)
                   return (
                     <div key={courseId} className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-serif uppercase">
                            {course?.title.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-serif">{course?.title || 'Unknown Course'}</p>
                            <p className="text-[10px] text-muted-foreground">{course?.schedule} • Teacher: {course?.teacherName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-60">Active</Badge>
                     </div>
                   )
                 })}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-success" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-background/40 p-5 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Total Paid</p>
                   <p className="text-2xl font-serif text-success">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-5 rounded-2xl border border-primary/5">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Current Dues</p>
                   <p className="text-2xl font-serif text-destructive">${totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-background/40 p-5 rounded-2xl border border-primary/5 hidden md:block">
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Payment Status</p>
                   <Badge className={cn(
                     "mt-1 uppercase text-[9px] tracking-widest px-3",
                     totalDue === 0 ? "bg-success" : "bg-warning"
                   )}>
                     {totalDue === 0 ? 'Settled' : 'Action Required'}
                   </Badge>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-4 font-bold">Transaction History</h4>
                <div className="rounded-2xl border border-primary/5 overflow-hidden bg-background/20">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="text-[10px] uppercase font-bold tracking-tight">Class Level</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-tight">Amount</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-tight">Date</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-bold tracking-tight">Status</TableHead>
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
                        studentFees.map((fee) => (
                          <TableRow key={fee.id} className="group hover:bg-primary/5 border-primary/5">
                            <TableCell className="font-serif">
                              {courses.find(c => c.id === fee.courseId)?.title || 'Registry Level'}
                            </TableCell>
                            <TableCell className="font-sans text-sm font-medium">
                              ${fee.amountPaid.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-sans">
                              {new Date(fee.paymentDate || fee.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-[9px] px-2 py-0 uppercase tracking-tighter border-primary/20">
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
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Institutional Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Guardian Information</p>
                    <p className="text-sm font-serif">{student.guardianName || 'Institutional Delegate'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Session Timing</p>
                    <p className="text-sm font-serif">{student.classTiming || 'Morning Session'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Enrollment Date</p>
                    <p className="text-sm font-serif font-sans opacity-80">{new Date(student.enrolledAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-primary/5">
                 <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-4 font-bold">Official Verification</h4>
                 <div className="p-4 rounded-2xl bg-background/40 border border-dashed border-primary/20 text-center">
                    <p className="text-[10px] text-muted-foreground italic mb-2 font-normal">Digitally Signed by</p>
                    <p className="text-xs uppercase tracking-widest font-serif">Academic Registrar</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-primary/5 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-md shadow-premium p-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Award className="w-16 h-16" />
            </div>
            <div className="bg-card/40 rounded-[2.3rem] p-6 space-y-4 relative z-10">
              <h4 className="font-serif text-lg">Academic Honors</h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-warning" />
                 </div>
                 <div>
                    <p className="text-sm font-serif">Distinction Candidate</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Term Excellence Award</p>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
