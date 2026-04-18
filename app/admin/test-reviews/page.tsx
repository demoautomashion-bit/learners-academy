'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useData } from '@/contexts/data-context'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StabilityBoundary } from '@/components/stability/stability-boundary'
import { cn } from '@/lib/utils'

export default function TestReviewsPage() {
  const hasMounted = useHasMounted()
  const { assessments, teachers, questions, approveAssessment, rejectAssessment, isInitialized } = useData()

  const [expandedRejectId, setExpandedRejectId] = useState<string | null>(null)
  const [inspectPoolId, setInspectPoolId] = useState<string | null>(null)
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({})

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const pendingAssessments = (assessments || []).filter(a => a.status === 'pending_review')
  const approvedCount = (assessments || []).filter(a => a.status === 'active' && a.submittedByTeacherId).length
  const rejectedCount = (assessments || []).filter(a => a.status === 'draft' && a.adminFeedback).length

  const handleApprove = async (id: string, title: string) => {
    try {
      await approveAssessment(id)
      toast.success(`"${title}" approved for use`)
      setExpandedRejectId(null)
    } catch (err) {
      toast.error("Critical Audit Failure: Authorization sync failed")
    }
  }

  const handleReject = async (id: string, title: string) => {
    const feedback = feedbackMap[id]?.trim()
    if (!feedback) {
      toast.error('Please provide feedback for the teacher')
      return
    }
    try {
      await rejectAssessment(id, feedback)
      toast.success(`Revision protocol initiated for "${title}"`)
      setExpandedRejectId(null)
      setFeedbackMap(prev => { const next = { ...prev }; delete next[id]; return next })
    } catch (err) {
      toast.error("Critical Audit Failure: Feedback transmission failed")
    }
  }

  const getPoolStrength = (assessment: any) => {
    const pool = (questions || []).filter(q => {
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
    <PageShell>
      <PageHeader 
        title="Assessment Audit"
        description="Approve or request changes to tests created by teachers."
      />

      <div className="grid gap-6 md:grid-cols-3 items-stretch mt-8">
        {[
            { label: 'Pending Review', value: pendingAssessments.length, sub: 'Needs decision', icon: Clock, color: 'text-warning' },
            { label: 'Approved Tests', value: approvedCount, sub: 'Active', icon: CheckCircle2, color: 'text-success' },
            { label: 'Revisions', value: rejectedCount, sub: 'Waiting for teacher', icon: AlertCircle, color: 'text-destructive' },
        ].map((stat, i) => (
            <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium rounded-2xl overflow-hidden group">
                <CardHeader className="pb-6 relative isolate">
                    <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                        <stat.icon className="w-10 h-10" />
                    </div>
                    <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{stat.label}</CardDescription>
                    <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 mt-2 font-normal italic">{stat.sub}</p>
                </CardHeader>
            </Card>
        ))}
      </div>

      <StabilityBoundary name="Assessment Audit Grid">
        <div className="mt-12">
          {pendingAssessments.length === 0 ? (
              <div className="py-32 text-center opacity-20">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-6" />
                  <p className="font-serif text-2xl">All reviews complete</p>
                  <p className="text-sm mt-2">There are no pending assessments to review.</p>
              </div>
          ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                      {pendingAssessments.map((assessment) => (
                          <motion.div
                              key={assessment.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              layout
                          >
                              <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl h-full flex flex-col group hover:translate-y-[-2px] transition-all">
                                  <div className="h-1 bg-warning/20 group-hover:bg-warning transition-colors" />
                                  <CardHeader className="p-8 pb-4">
                                       <div className="flex items-center justify-between mb-2">
                                          <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-bold border-primary/10 opacity-60 px-3">{assessment.phase}</Badge>
                                          <div className="flex items-center gap-1.5 text-warning">
                                              <Clock className="w-3 h-3" />
                                              <span className="text-[9px] font-bold uppercase tracking-widest">Pending</span>
                                          </div>
                                       </div>
                                       <CardTitle className="font-serif text-xl font-medium tracking-tight mb-1">{assessment.title}</CardTitle>
                                       <CardDescription className="text-[10px] uppercase font-normal opacity-40 italic">
                                          ID: {assessment.submittedByTeacherId || 'System'}
                                       </CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 py-6 border-y border-primary/5">
                                          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                              <Users className="w-3.5 h-3.5 opacity-30" />
                                              <span className="truncate">{assessment.classLevels?.[0] || 'Any Level'}</span>
                                          </div>
                                          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                              <FileText className="w-3.5 h-3.5 opacity-30" />
                                              <span>{assessment.nature}</span>
                                          </div>
                                          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                              <Timer className="w-3.5 h-3.5 opacity-30" />
                                              <span>{assessment.durationMinutes}m</span>
                                          </div>
                                          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                              <Hash className="w-3.5 h-3.5 opacity-30" />
                                              <span>{assessment.questionCount} Slots</span>
                                          </div>
                                      </div>

                                      <div className="mt-8 p-6 bg-primary/[0.02] border border-primary/5 rounded-2xl">
                                          <div className="flex items-center justify-between mb-4">
                                              <div>
                                                  <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold block mb-1">Question Pool</span>
                                                  <span className="text-xs font-serif font-medium">{getPoolStrength(assessment).count} Questions Available</span>
                                              </div>
                                              <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-8 text-[9px] uppercase tracking-widest font-bold hover:bg-primary/5"
                                                  onClick={() => setInspectPoolId(assessment.id)}
                                              >
                                                  Inspect <Eye className="w-3.5 h-3.5 ml-2" />
                                              </Button>
                                          </div>
                                          <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                                              <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Access Token</span>
                                              <span className="text-xs font-serif text-primary opacity-60 tracking-wider font-bold">{assessment.accessCode}</span>
                                          </div>
                                      </div>

                                      <div className="mt-auto pt-8 space-y-3">
                                          <Button 
                                              className="w-full h-11 font-normal bg-success hover:bg-success/90 shadow-lg shadow-success/10"
                                              onClick={() => handleApprove(assessment.id, assessment.title)}
                                          >
                                              Approve Test
                                          </Button>
                                          
                                          {expandedRejectId !== assessment.id ? (
                                              <Button 
                                                  variant="outline" 
                                                  className="w-full h-11 font-normal border-destructive/10 text-destructive/60 hover:bg-destructive/5 hover:text-destructive"
                                                  onClick={() => setExpandedRejectId(assessment.id)}
                                              >
                                                  Request Revision
                                              </Button>
                                          ) : (
                                              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                  <Textarea 
                                                      placeholder="Specify issues clearly..." 
                                                      className="min-h-[100px] text-xs font-normal bg-destructive/5 border-none resize-none"
                                                      value={feedbackMap[assessment.id] || ''}
                                                      onChange={(e) => setFeedbackMap(prev => ({ ...prev, [assessment.id]: e.target.value }))}
                                                  />
                                                  <div className="flex gap-2">
                                                      <Button 
                                                          variant="ghost" 
                                                          size="sm" 
                                                          className="flex-1 text-[10px] font-normal"
                                                          onClick={() => setExpandedRejectId(null)}
                                                      >
                                                          Cancel
                                                      </Button>
                                                      <Button 
                                                          size="sm" 
                                                          className="flex-1 text-[10px] font-normal bg-destructive"
                                                          onClick={() => handleReject(assessment.id, assessment.title)}
                                                      >
                                                          Send Feedback
                                                      </Button>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </CardContent>
                              </Card>
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
          )}
        </div>
      </StabilityBoundary>

      {/* Pool Inspection Dialog */}
      <Dialog open={!!inspectPoolId} onOpenChange={(open) => !open && setInspectPoolId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] glass-2">
          {selectedAssessmentForPool && (
            <>
              <DialogHeader className="p-12 pb-6 border-b border-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em] font-bold border-primary/10 opacity-60 mb-2">{selectedAssessmentForPool.phase}</Badge>
                    <DialogTitle className="font-serif text-3xl font-normal tracking-tight">Content Selection Pool</DialogTitle>
                    <DialogDescription className="text-xs font-normal opacity-40 mt-1">
                      Displaying all verified library content eligible for the randomized <b>{selectedAssessmentForPool.questionCount}</b> audit slots.
                    </DialogDescription>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">Pool Density</span>
                    <span className="text-4xl font-serif text-primary">{poolQuestions.length}</span>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="h-[50vh] px-12 py-8">
                <div className="space-y-6">
                  {poolQuestions.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-serif text-xl">Critical Error: Zero Matches</p>
                    </div>
                  ) : (
                    poolQuestions.map((q, i) => (
                      <div key={q.id} className="group relative bg-primary/[0.02] hover:bg-primary/[0.04] border border-primary/5 p-6 rounded-2xl transition-all">
                         <div className="flex items-start gap-6">
                           <span className="flex-shrink-0 w-8 h-8 bg-background border border-primary/5 rounded-xl flex items-center justify-center text-[10px] font-bold opacity-30">{i+1}</span>
                           <div className="space-y-4 flex-1">
                             <div className="flex items-center gap-2">
                               <Badge className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold">{q.type}</Badge>
                               <Badge variant="outline" className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-normal border-primary/5 opacity-40">{q.category}</Badge>
                             </div>
                             <p className="text-sm font-normal leading-relaxed text-foreground/80">{q.content}</p>
                             {q.options && q.options.length > 0 && (
                               <div className="flex flex-wrap gap-2 pt-2">
                                 {q.options.map((opt, idx) => (
                                   <span key={idx} className={cn(
                                        "text-[10px] px-3 py-1 rounded-lg border",
                                        opt === q.correctAnswer ? "bg-success/5 border-success/10 text-success font-bold" : "bg-background border-primary/5 text-muted-foreground opacity-60"
                                   )}>
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

              <div className="p-12 pt-6 border-t border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-4 h-4 opacity-40" />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Verified by Admin</span>
                </div>
                <Button variant="outline" className="font-normal h-11 px-8 rounded-xl border-primary/10" onClick={() => setInspectPoolId(null)}>
                  Close Audit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
