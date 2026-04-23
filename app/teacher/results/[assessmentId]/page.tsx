'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  Search,
  FileCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { cn } from '@/lib/utils'

export default function AssessmentWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { assessments, submissions, students, enrollments, gradeSubmission, isInitialized } = useData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [isGradeOpen, setIsGradeOpen] = useState(false)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />
  
  const assessmentId = params.assessmentId as string
  const assessment = assessments.find(a => a.id === assessmentId)
  const assessmentSubmissions = submissions?.filter(s => s.assignmentId === assessmentId) || []

  // Candidate Pool Tracking: Identify students enrolled in matching courses who haven't submitted yet
  const relevantCourseIds = assessment?.courseIds || []
  const enrolledStudentIds = enrollments
    ?.filter(e => relevantCourseIds.includes(e.courseId))
    .map(e => e.studentId) || []

  const submittedStudentIds = new Set(assessmentSubmissions.map(s => s.studentId))
  const pendingCandidates = students
    ?.filter(s => enrolledStudentIds.includes(s.id) && !submittedStudentIds.has(s.id))
    .map(s => ({
      id: `pending-${s.id}`,
      studentId: s.id,
      studentName: s.name,
      status: 'not_started',
      isPlaceholder: true
    })) || []
  
  if (!assessment) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-destructive opacity-30" />
      <h2 className="text-2xl font-serif font-medium">Assessment Registry Not Found</h2>
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Results
      </Button>
    </div>
  )

  const allEntries = [...assessmentSubmissions, ...pendingCandidates]

  const filteredSubmissions = allEntries.filter(s => 
    (s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = assessmentSubmissions?.filter(s => s.status === 'pending').length
  const completedCount = assessmentSubmissions?.filter(s => s.status === 'graded').length
  
  const gradedResults = assessmentSubmissions?.filter(r => r.grade !== undefined && r.grade !== null)
  const avgPercent = gradedResults.length > 0 
    ? Math.round(gradedResults.reduce((acc, r) => acc + ((r.grade! / assessment.totalMarks) * 100), 0) / gradedResults.length)
    : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Splash */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between items-center -mx-6 px-12 py-10 bg-primary/[0.03] border-b ">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/teacher/results')}
            className="hover:bg-primary/5 text-primary/60 hover:text-primary transition-all p-0 h-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-xs   font-normal">Back to Ledger</span>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-foreground font-serif text-3xl font-serif font-medium">
                {assessment.title}
              </h1>
              <Badge variant="outline" className="text-xs   font-normal h-6  text-primary/80 bg-primary/5 px-3">
                {assessment.phase}
              </Badge>
            </div>
            <p className="text-muted-foreground text-editorial-meta opacity-70 flex items-center gap-2">
              <span className="font-sans font-normal">{assessment.classLevels[0]}</span>
              <span className="opacity-20">•</span>
              <span className="font-sans font-normal">{assessment.nature} Framework</span>
              <span className="opacity-20">•</span>
              <span className="font-sans font-normal">{assessment.totalMarks} Points Max</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center px-6 py-4 bg-background/50   border  shadow-inner-premium text-center min-w-[120px]">
                <span className="text-xs   font-normal text-muted-foreground mb-1">Batch Avg</span>
                <span className="text-2xl font-serif font-normal text-primary">{avgPercent}%</span>
            </div>
            <div className="flex flex-col items-center px-6 py-4 bg-background/50   border  shadow-inner-premium text-center min-w-[120px]">
                <span className="text-xs   font-normal text-muted-foreground mb-1">Completion</span>
                <span className={cn("text-2xl font-serif font-normal", pendingCount > 0 ? "text-warning" : "text-success")}>
                    {completedCount} <span className="text-sm opacity-20 text-foreground">/ {assessmentSubmissions.length}</span>
                </span>
            </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start mt-8">
        {/* Left Column: List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                <Input
                    placeholder="Search student ID or identity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-14     text-base shadow-sm focus:ring-1 focus:ring-primary/20"
                />
             </div>
             <Button variant="outline" className="    opacity-60 hover:opacity-100 transition-all">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-xs   font-normal">Filters</span>
             </Button>
          </div>

          <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] flex flex-col">
             <CardContent className="p-6 flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/10 border-b  h-16">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Student List</th>
                                <th className="px-8 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Score</th>
                                <th className="px-8 py-4 text-right text-xs font-normal   text-muted-foreground opacity-60">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredSubmissions?.map((s) => (
                                 <tr key={s.id} className={cn("group transition-premium h-24", s.isPlaceholder ? "opacity-40 grayscale-[0.5]" : "hover:bg-primary/[0.02]")}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 shadow-sm border-2 border-background ring-2 ring-primary/5">
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs ">
                                                    {(s.studentName || 'S').split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-sans font-normal text-base text-foreground/80">{s.studentName}</span>
                                                <span className="text-xs text-muted-foreground/60 font-normal  ">{s.studentId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {s.status === 'graded' ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                                    <span className="font-sans font-normal text-base">{s.grade} <span className="opacity-20">/ {assessment.totalMarks}</span></span>
                                                </div>
                                                <span className="text-xs text-success/70   mt-1">Graded</span>
                                            </div>
                                        ) : s.status === 'pending' ? (
                                            <Badge variant="secondary" className="bg-warning/5 text-warning border-warning/10 h-7 px-4  text-xs  font-normal ">
                                                Awaiting Review
                                            </Badge>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground italic">
                                                <Clock className="w-3.5 h-3.5 opacity-40" />
                                                <span className="text-xs">Student has not started the test.</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {!s.isPlaceholder ? (
                                            <Button 
                                                variant={s.status === 'pending' ? 'default' : 'ghost'}
                                                onClick={() => {
                                                    setSelectedSubmission(s)
                                                    setGradeInput(s.grade?.toString() || '')
                                                    setFeedbackInput(s.feedback || '')
                                                    setIsGradeOpen(true)
                                                }}
                                                className="h-11  px-6 group/btn transition-all"
                                            >
                                                <span className="text-xs   font-normal">
                                                    {s.status === 'pending' ? 'Mark Paper' : 'Edit Marks'}
                                                </span>
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="opacity-20 font-normal text-[10px] uppercase tracking-tighter">Pending Action</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Context/Stats */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] flex flex-col">
                <CardHeader className="bg-primary/5 border-b  py-6">
                    <CardTitle className="font-serif text-xl font-medium">Student Answer Sheet</CardTitle>
                    <CardDescription className="text-xs font-normal opacity-40">Marking student submission manually.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-normal">Token Registry</span>
                            <span className="font-mono text-primary font-normal">{assessment.accessCode}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-normal">Block Duration</span>
                            <span className="font-normal">{assessment.durationMinutes} Minutes</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground font-normal">Taxonomy Type</span>
                            <span className="font-normal">{assessment.nature}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-1 bg-primary/5 overflow-hidden p-8 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] flex flex-col">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-primary opacity-60" />
                        <h4 className="font-serif text-lg font-medium">Performance Insights</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                        This batch is performing <span className="text-primary ">{avgPercent}%</span> effectively against the {assessment.phase} benchmarks.
                    </p>
                    <div className="pt-4 border-t ">
                         <div className="flex items-center justify-between mb-2">
                             <span className="text-xs   text-primary/40 ">Audit Progress</span>
                             <span className="text-xs  text-primary">{assessmentSubmissions.length > 0 ? Math.round((completedCount / assessmentSubmissions.length) * 100) : 0}%</span>
                         </div>
                         <div className="h-2 bg-background/50  overflow-hidden border ">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${assessmentSubmissions.length > 0 ? (completedCount / assessmentSubmissions.length) * 100 : 0}%` }}
                                className="h-full bg-primary"
                             />
                         </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Audit Dialog (Refined split-pane feel) */}
      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0  ">
          <div className="bg-primary/5 p-8 border-b  flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="font-serif text-3xl font-normal">Mark Results</DialogTitle>
              <DialogDescription className="text-editorial-meta text-xs">Review student answers and provide feedback.</DialogDescription>
            </div>
            <Badge className="bg-background  text-primary  text-xs font-normal  h-7 px-4">
              ID: {selectedSubmission?.studentId}
            </Badge>
          </div>

          <div className="flex-1 overflow-hidden grid md:grid-cols-2 items-stretch">
            {/* Left Hand: Student Responses */}
            <div className="p-8 overflow-y-auto space-y-6 bg-background border-r  premium-scrollbar">
               <h4 className="text-xs opacity-30 sticky top-0 bg-background py-2 font-medium">Candidate responses</h4>
               {selectedSubmission?.randomizedQuestions?.map((q: any, i: number) => (
                    <div key={q.id} className="space-y-4 pb-8 border-b  last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs  text-primary  ">Block {i+1} • {q.category}</span>
                        {q.correctAnswer && (
                          <span className="text-xs text-success/60 font-normal   italic">Reference: {q.correctAnswer}</span>
                        )}
                      </div>
                      <p className="text-base font-sans font-normal text-foreground/80 leading-relaxed bg-muted/5 p-4  border ">{q.content}</p>
                      <div className="p-5  bg-primary/5 border-l-4  text-sm font-normal">
                        <label className="text-xs   text-primary/40 block mb-2">Student Submission</label>
                        {selectedSubmission?.answers?.[q.id] || <span className="italic opacity-30">No response captured.</span>}
                      </div>
                    </div>
                ))}

                <div className="p-6 bg-warning/5  border border-warning/20">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        <span className="text-xs  text-warning  ">AI Audit Delta</span>
                    </div>
                    <p className="text-sm font-normal italic text-muted-foreground leading-relaxed">
                        "{selectedSubmission?.aiJustification || 'No specific AI analysis data available.'}"
                    </p>
                </div>
            </div>

            {/* Right Hand: Action & Grading */}
            <div className="p-10 bg-muted/5 flex flex-col justify-between overflow-y-auto">
               <div className="space-y-6">
                  <div className="space-y-4">
                     <h4 className="text-xs opacity-30 font-medium">Final evaluation</h4>
                     <label className="text-xs font-normal text-muted-foreground">Absolute Marks (0 - {assessment.totalMarks})</label>
                     <div className="flex items-center gap-4">
                        <Input 
                            type="number" 
                            placeholder="Enter score"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            max={assessment.totalMarks}
                            className="h-16 bg-background   text-3xl font-serif px-6 text-center focus:ring-primary/20"
                        />
                        <div className="text-muted-foreground/30 font-serif text-3xl">/</div>
                        <div className="w-20 h-16 bg-primary/5  flex items-center justify-center text-primary font-serif text-3xl opacity-40">
                            {assessment.totalMarks}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Comments</label>
                     <Textarea 
                        placeholder="Write formal feedback for the student and student's guardian..." 
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="bg-background   p-6 min-h-[200px] text-base leading-relaxed resize-none font-normal"
                     />
                  </div>
               </div>

                <div className="pt-8 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-primary/5  border ">
                        <FileCheck className="w-5 h-5 text-primary opacity-60" />
                        <p className="text-xs font-normal leading-tight text-primary/70">
                            By publishing, this grade will be recorded in the student's Academic Dossier and the Financial Roster.
                        </p>
                    </div>
                </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-background border-t  flex gap-4">
            <Button variant="ghost" onClick={() => setIsGradeOpen(false)} className=" px-8 h-12 text-muted-foreground">
                <span className="text-xs   font-normal">Discard</span>
            </Button>
            <Button 
              className="  bg-primary hover:bg-primary/90 flex-1 md:flex-none"
              onClick={() => {
                if (selectedSubmission) {
                  const score = parseFloat(gradeInput)
                  if (isNaN(score) || score < 0 || score > assessment.totalMarks) {
                    toast.error(`Please enter a valid marks between 0 and ${assessment.totalMarks}`)
                    return
                  }
                  gradeSubmission(
                    selectedSubmission.id, 
                    score, 
                    feedbackInput || ""
                  )
                  setIsGradeOpen(false)
                  toast.success("Academic evaluation published successfully.")
                }
              }}
            >
              <span className="text-xs   font-normal text-white">Publish Academic Score</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
