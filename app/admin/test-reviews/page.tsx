'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  MessageSquareWarning,
  Users,
  FileText,
  Timer,
  Hash,
  AlertCircle,
  Send,
  X,
  Search,
  Eye,
  Info
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useData } from '@/contexts/data-context'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'

export default function TestReviewsPage() {
  const { assessments, teachers, approveAssessment, rejectAssessment } = useData()
  const [expandedRejectId, setExpandedRejectId] = useState<string | null>(null)
  const [inspectPoolId, setInspectPoolId] = useState<string | null>(null)
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({})

  const pendingAssessments = assessments.filter(a => a.status === 'pending_review')
  const approvedCount = assessments.filter(a => a.status === 'active' && a.submittedByTeacherId).length
  const rejectedCount = assessments.filter(a => a.status === 'draft' && a.adminFeedback).length

  const getTeacherName = (assessment: any) => {
    if (assessment.submittedByTeacherName) return assessment.submittedByTeacherName
    if (assessment.submittedByTeacherId) {
      const t = teachers.find(t => t.id === assessment.submittedByTeacherId)
      return t ? t.name : 'Unknown Teacher'
    }
    return 'Submitted Teacher'
  }

  const getTeacherEmployeeId = (assessment: any) => {
    if (assessment.submittedByTeacherId) {
      const t = teachers.find(t => t.id === assessment.submittedByTeacherId)
      return t ? t.employeeId : '—'
    }
    return '—'
  }

  const handleApprove = async (id: string, title: string) => {
    try {
      await approveAssessment(id)
      toast.success(`"${title}" approved and is now live`)
      setExpandedRejectId(null)
    } catch (err) {
      toast.error("Failed to sync approval")
    }
  }

  const handleReject = async (id: string, title: string) => {
    const feedback = feedbackMap[id]?.trim()
    if (!feedback) {
      toast.error('Please write feedback before sending for revision')
      return
    }
    try {
      await rejectAssessment(id, feedback)
      toast.success(`Revision requested for "${title}"`)
      setExpandedRejectId(null)
      setFeedbackMap(prev => { const next = { ...prev }; delete next[id]; return next })
    } catch (err) {
      toast.error("Failed to sync feedback")
    }
  }

  const getPoolStrength = (assessment: any) => {
    const { questions } = useData()
    const pool = questions.filter(q => {
      const phaseMatch = q.phase === assessment.phase || q.phase === 'Both'
      const natureMatch = assessment.nature === 'Mixed' || q.type === assessment.nature
      return phaseMatch && natureMatch && q.isApproved
    })
    return { count: pool.length, questions: pool }
  }

  const selectedAssessmentForPool = pendingAssessments.find(a => a.id === inspectPoolId)
  const { count: poolCount, questions: poolQuestions } = selectedAssessmentForPool 
    ? getPoolStrength(selectedAssessmentForPool)
    : { count: 0, questions: [] }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={STAGGER_CONTAINER}
        className="flex flex-col gap-1"
      >
        <motion.div variants={STAGGER_ITEM}>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Test Review Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve exam papers submitted by supervised staff.
          </p>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={STAGGER_CONTAINER}
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-warning/10 shadow-premium">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-editorial-label flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-warning" />
                Pending Review
              </CardDescription>
              <CardTitle className="text-3xl font-serif font-normal text-warning">
                {pendingAssessments.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Awaiting your decision
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-success/10 shadow-premium">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-editorial-label flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Approved
              </CardDescription>
              <CardTitle className="text-3xl font-serif font-normal text-success">
                {approvedCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Live this term
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-destructive/10 shadow-premium">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-editorial-label flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                Sent for Revision
              </CardDescription>
              <CardTitle className="text-3xl font-serif font-normal text-destructive">
                {rejectedCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Awaiting teacher correction
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Review Queue */}
      {pendingAssessments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-success/5 border border-success/10 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-success/40" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-normal text-foreground">Queue is clear</h2>
            <p className="text-muted-foreground mt-1">All submitted papers have been reviewed.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
        >
          <AnimatePresence>
            {pendingAssessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                variants={STAGGER_ITEM}
                layout
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover-lift overflow-hidden border-none shadow-sm ring-1 ring-warning/20 h-full flex flex-col bg-card">
                  {/* Amber top accent */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-warning/40 via-warning to-warning/40" />

                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 pt-4">
                    <div className="space-y-1.5">
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-widest font-bold border-primary/20 bg-primary/5 text-primary"
                      >
                        {assessment.phase}
                      </Badge>
                      <CardTitle className="font-serif text-xl tracking-tight leading-tight">
                        {assessment.title}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-70">
                        {getTeacherName(assessment)} · {getTeacherEmployeeId(assessment)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 shrink-0 ml-2">
                      <Clock className="w-3 h-3 text-warning" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-warning">Pending</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 flex-1 flex flex-col">
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] uppercase tracking-wider font-bold text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">{assessment.classLevels[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.nature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.questionCount} questions</span>
                      </div>
                    </div>

                    {/* Access code preview */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-primary/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Access Token</span>
                          <span className="font-sans text-sm font-bold tracking-tighter text-primary">{assessment.accessCode}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Locked</span>
                      </div>

                      {/* Pool Strength Indicator */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/[0.02] border border-primary/10">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-primary/60">Library Strength</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <LibraryIcon className="w-3 h-3 text-primary" />
                            <span className="font-sans text-sm font-bold text-foreground">
                              {getPoolStrength(assessment).count} Approved <span className="font-normal text-muted-foreground">Questions</span>
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 group hover:bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-bold gap-1.5 px-3 rounded-xl"
                          onClick={() => setInspectPoolId(assessment.id)}
                        >
                          Inspect Pool <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </div>

                    {/* Action area — pushed to bottom */}
                    <div className="mt-auto pt-2 space-y-2">
                      {/* Approve */}
                      <Button
                        className="w-full h-10 rounded-xl bg-success hover:bg-success/90 text-white font-normal uppercase tracking-widest text-[11px] transition-premium gap-2"
                        onClick={() => handleApprove(assessment.id, assessment.title)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Paper
                      </Button>

                      {/* Reject — toggles feedback area */}
                      {expandedRejectId !== assessment.id ? (
                        <Button
                          variant="outline"
                          className="w-full h-10 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive font-normal uppercase tracking-widest text-[11px] transition-premium gap-2"
                          onClick={() => setExpandedRejectId(assessment.id)}
                        >
                          <MessageSquareWarning className="w-4 h-4" />
                          Send for Revision
                        </Button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Textarea
                            placeholder="Describe what needs to be improved..."
                            className="rounded-xl text-sm resize-none min-h-[80px] border-destructive/20 focus:ring-destructive/30 bg-destructive/5"
                            value={feedbackMap[assessment.id] || ''}
                            onChange={(e) =>
                              setFeedbackMap(prev => ({ ...prev, [assessment.id]: e.target.value }))
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 rounded-xl text-muted-foreground hover:text-foreground text-xs"
                              onClick={() => {
                                setExpandedRejectId(null)
                                setFeedbackMap(prev => { const n = { ...prev }; delete n[assessment.id]; return n })
                              }}
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs gap-1.5"
                              onClick={() => handleReject(assessment.id, assessment.title)}
                            >
                              <Send className="w-3.5 h-3.5" /> Send Feedback
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pool Inspection Dialog */}
      <Dialog open={!!inspectPoolId} onOpenChange={(open) => !open && setInspectPoolId(null)}>
        <DialogContent className="max-w-2xl overflow-hidden">
          {selectedAssessmentForPool && (
            <>
              <DialogHeader className="p-8 pb-6 border-b border-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary mb-2 border-primary/20">{selectedAssessmentForPool.phase}</Badge>
                    <DialogTitle className="font-serif text-3xl font-normal">Content Selection Pool</DialogTitle>
                    <DialogDescription className="text-editorial-meta mt-1">
                      Showing all approved questions eligible for the randomized <b>{selectedAssessmentForPool.questionCount}</b> question slots.
                    </DialogDescription>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pool Strength</span>
                    <span className="text-3xl font-serif text-primary">{poolQuestions.length}</span>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="px-2">
                <ScrollArea className="h-[50vh] p-6 pt-2">
                  <div className="space-y-4">
                    {poolQuestions.length === 0 ? (
                      <div className="py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive/20 mx-auto mb-4" />
                        <p className="text-muted-foreground">Crucial Error: No approved questions found for this criteria.</p>
                      </div>
                    ) : (
                      poolQuestions.map((q, i) => (
                        <div key={q.id} className="group relative bg-muted/20 hover:bg-muted/40 border border-primary/5 rounded-2xl p-4 transition-premium">
                           <div className="flex items-start gap-4">
                             <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-background border flex items-center justify-center text-[10px] font-bold text-muted-foreground/40">{i+1}</span>
                             <div className="space-y-2 flex-1">
                               <div className="flex items-center gap-2">
                                 <Badge variant="secondary" className="text-[8px] px-1.5 h-4 font-bold uppercase tracking-tighter bg-primary/10 text-primary border-none">{q.type}</Badge>
                                 <Badge variant="outline" className="text-[8px] px-1.5 h-4 font-normal uppercase tracking-tighter border-muted-foreground/20 text-muted-foreground">{q.category}</Badge>
                               </div>
                               <p className="text-sm font-normal leading-relaxed text-foreground/80">{q.content}</p>
                               {q.options && q.options.length > 0 && (
                                 <div className="flex flex-wrap gap-1.5 pt-1">
                                   {q.options.map((opt, idx) => (
                                     <span key={idx} className={`text-[9px] px-2 py-0.5 rounded-full ${opt === q.correctAnswer ? 'bg-success/10 text-success' : 'bg-background text-muted-foreground'}`}>
                                       {opt}
                                     </span>
                                   ))}
                                 </div>
                               )}
                             </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-8 pt-6 border-t border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-warning">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted Audit Trail</span>
                </div>
                <Button variant="outline" className="rounded-xl h-11 px-8 text-xs uppercase tracking-widest font-normal" onClick={() => setInspectPoolId(null)}>
                  Close Audit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LibraryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  )
}
