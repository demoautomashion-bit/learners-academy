'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  TrendingUp, 
  FileText, 
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Target,
  BrainCircuit,
  MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { cn } from '@/lib/utils'

export default function StudentProfileDossierPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  if (!user?.id) return null
  const { students, enrollments, submissions, assessments, updateStudent, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  
  const studentId = params.id as string
  const student = students.find(s => s.id === studentId)
  
  const [evaluationInput, setEvaluationInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isInitialized) return <AssessmentSkeleton />
  if (!student) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-destructive opacity-30" />
      <h2 className="text-2xl font-serif">Student Identity Not Found</h2>
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Registry
      </Button>
    </div>
  )

  const studentEnrollment = enrollments.find(e => e.studentId === student.id)
  const studentSubmissions = submissions?.filter(s => s.studentId === studentId)
  const progress = studentEnrollment?.progress || 0
  
  const getPerformanceBadge = (p: number) => {
    if (p >= 80) return <Badge className="bg-success text-white border-none text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full">Exceptional Performance</Badge>
    if (p >= 60) return <Badge className="bg-primary text-white border-none text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full">Strong Progress</Badge>
    return <Badge className="bg-warning/20 text-warning border-warning/10 text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full">Academic Review Required</Badge>
  }

  const handleUpdateEvaluation = async () => {
    if (!evaluationInput.trim()) return
    setIsUpdating(true)
    try {
      await updateStudent(studentId, { grade: evaluationInput })
      toast.success("Intelligence profile updated.")
    } catch (err) {
      toast.error("Failed to persist data.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative -mx-6 px-12 py-12 bg-primary/5 border-b border-primary/5">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/teacher/students')}
          className="mb-8 hover:bg-primary/5 text-primary tracking-widest transition-all p-0 h-auto font-normal"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="text-[10px] uppercase">Registry Overview</span>
        </Button>

        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start group">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background ring-8 ring-primary/5 shadow-massive transition-premium">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="bg-primary/5 text-4xl font-serif text-primary">
                {student.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-success text-white p-2.5 rounded-2xl shadow-premium ring-4 ring-background">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-5xl font-serif font-normal text-foreground leading-none">
                    {student.name}
                  </h1>
                  {getPerformanceBadge(progress)}
               </div>
               <p className="text-muted-foreground text-editorial-meta opacity-60 flex items-center justify-center md:justify-start gap-3">
                 <span className="font-normal font-sans uppercase text-[10px] tracking-[0.2em]">{student.id}</span>
                 <span className="opacity-20">•</span>
                 <span className="font-normal font-sans text-sm italic">Admitted {new Date(student.enrolledAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
               <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-primary/5">
                  <Mail className="h-4 w-4 text-primary opacity-40" />
                  <span className="text-xs font-normal text-foreground/70">{student.email}</span>
               </div>
               <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-primary/5">
                  <Phone className="h-4 w-4 text-primary opacity-40" />
                  <span className="text-xs font-normal text-foreground/70">{student.phone || "+1 (555) 123-4567"}</span>
               </div>
            </div>
          </div>

          <div className="flex gap-4">
             <Button className="h-14 px-8 rounded-2xl bg-primary text-white shadow-premium hover:bg-primary/90 transition-premium">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="text-[10px] uppercase tracking-widest font-normal">Contact Guardian</span>
             </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Core Metrics */}
        <div className="lg:col-span-12 grid gap-4 md:grid-cols-4">
             <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
                <CardHeader className="pb-3">
                    <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Academic Mastery</CardDescription>
                    <CardTitle className="text-3xl font-sans font-normal">{progress}%</CardTitle>
                </CardHeader>
                <div className="px-6 pb-6">
                    <Progress value={progress} className="h-1.5 bg-primary/5" />
                </div>
             </Card>
             <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
                <CardHeader className="pb-3">
                    <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Assessments Taken</CardDescription>
                    <CardTitle className="text-3xl font-sans font-normal">{studentSubmissions.length}</CardTitle>
                </CardHeader>
             </Card>
             <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
                <CardHeader className="pb-3">
                    <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Current Rank</CardDescription>
                    <CardTitle className="text-3xl font-sans font-normal">Elite</CardTitle>
                </CardHeader>
             </Card>
             <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
                <CardHeader className="pb-3">
                    <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Session Attendance</CardDescription>
                    <CardTitle className="text-3xl font-sans font-normal">94%</CardTitle>
                </CardHeader>
             </Card>
        </div>

        {/* Left Column (Academic History) */}
        <div className="lg:col-span-8 space-y-8">
            <Card className="border-primary/5 bg-card/60 backdrop-blur-xl shadow-premium rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 bg-muted/5 border-b border-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-serif font-normal">Academic History Registry</CardTitle>
                            <CardDescription className="text-editorial-meta opacity-60">Historical performance data for this candidate across all examination blocks.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/10 h-16">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Examination Hub</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Institutional Rank</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {studentSubmissions?.map((s) => {
                                    const assessment = assessments.find(a => a.id === s.assignmentId)
                                    const percent = assessment?.totalMarks ? Math.round((s.grade! / assessment.totalMarks) * 100) : 0
                                    
                                    return (
                                        <tr key={s.id} className="group hover:bg-primary/[0.02] transition-premium h-24">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-serif font-normal text-lg">{assessment?.title || 'Unknown Test'}</span>
                                                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">{assessment?.phase} Framework</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {s.status === 'graded' ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-sans text-base font-normal">{s.grade} <span className="opacity-20">/ {assessment?.totalMarks}</span></span>
                                                        <span className="text-[10px] text-success uppercase tracking-widest font-normal">{percent}% Efficiency</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-warning/5 text-warning border-warning/10 text-[9px] uppercase tracking-widest font-normal">Awaiting Review</Badge>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => router.push(`/teacher/results/${s.assignmentId}`)}
                                                    className="rounded-xl px-4 hover:bg-primary/5 hover:text-primary"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 mr-2 opacity-40" />
                                                    <span className="text-[10px] uppercase font-normal tracking-widest">View Analysis</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {studentSubmissions.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-16 text-center text-muted-foreground italic font-serif text-lg opacity-40">
                                            No academic submissions recorded in the current institutional cycle.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column (Evaluation & Notes) */}
        <div className="lg:col-span-4 space-y-8">
            <Card className="border-primary/5 bg-card/60 backdrop-blur-xl shadow-premium rounded-[2rem] overflow-hidden flex flex-col h-full">
                <CardHeader className="p-8 bg-muted/5 border-b border-primary/5 space-y-2">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="w-5 h-5 text-primary opacity-60" />
                        <CardTitle className="font-serif text-xl font-normal">Institutional Evaluation</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground font-normal">Record qualitative insights and academic goals for the student registry.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8 flex-1">
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-40">Current Evaluation Note</label>
                        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 italic text-sm text-foreground/70 leading-relaxed min-h-[120px]">
                            "{student.grade || 'No formal evaluation captured yet for the current term.'}"
                        </div>
                    </div>

                    <div className="space-y-5 pt-8 border-t border-primary/5">
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-40 font-sans">Modify Narrative</label>
                            <Textarea 
                                placeholder="Update institutional evaluation..."
                                value={evaluationInput}
                                onChange={(e) => setEvaluationInput(e.target.value)}
                                className="bg-background border-primary/10 rounded-2xl p-6 min-h-[180px] text-sm leading-relaxed resize-none font-normal"
                            />
                        </div>
                        <Button 
                            className="w-full h-14 rounded-2xl bg-primary text-white shadow-premium hover:bg-primary/90 flex items-center justify-center"
                            onClick={handleUpdateEvaluation}
                            disabled={isUpdating || !evaluationInput.trim()}
                        >
                            {isUpdating ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="text-[10px] uppercase tracking-widest font-normal">Publish To Registry</span>
                            )}
                        </Button>
                    </div>
                </CardContent>
                <div className="p-8 bg-muted/5 border-t border-primary/5">
                     <p className="text-[9px] text-muted-foreground font-normal leading-relaxed opacity-50">
                        Institutional evaluations are permanent logs and visible to high-level administrative audits and parents. Use precise, professional academic language.
                     </p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  )
}
