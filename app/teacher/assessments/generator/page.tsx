'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  Plus, 
  RefreshCw, 
  History, 
  Zap, 
  Terminal, 
  FileText, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Settings,
  Boxes,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { generateSecureToken } from '@/lib/utils'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { AssessmentTemplate, QuestionType } from '@/lib/types'
import { cn } from '@/lib/utils'

const assessmentSchema = z.object({
  title: z.string().min(5, 'Test title must be formal and descriptive'),
  phase: z.enum(['First Test', 'Last Test']),
  courseId: z.string().min(1, 'Please select a target course'), 
  classLevel: z.string().optional(),
  nature: z.enum(['MCQ', 'Subjective', 'Mixed', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening']),
  totalMarks: z.coerce.number().optional(),
  markAllocation: z.object({
    MCQ: z.coerce.number().min(0).default(0),
    Subjective: z.coerce.number().min(0).default(0),
    'True/False': z.coerce.number().min(0).default(0),
    'Fill in the Blanks': z.coerce.number().min(0).default(0),
    Writing: z.coerce.number().min(0).default(0),
    Matching: z.coerce.number().min(0).default(0),
    Reading: z.coerce.number().min(0).default(0),
    Listening: z.coerce.number().min(0).default(0),
  }).optional(),
  duration: z.coerce.number().min(1, 'Duration must be positive'),
  questionCount: z.coerce.number().min(1, 'Count must be at least 1').max(100, 'Max 100 questions'),
  accessCode: z.string().min(5, 'Access code is required').regex(/^[A-Z0-9-]+$/, 'Letters, numbers, and hyphens only'),
  isAdaptive: z.boolean().default(false),
})

type AssessmentFormValues = z.infer<typeof assessmentSchema>

export default function AssessmentGeneratorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    courses, 
    questions, 
    publishAssessment, 
    teachers,
    isInitialized 
  } = useData()

  const currentTeacher = teachers.find(t => t.id === user?.id)
  const requiresReview = !!currentTeacher?.requiresReview
  const myClasses = courses?.filter(c => c.teacherId === user?.id)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      nature: 'Mixed',
      phase: 'First Test',
      totalMarks: 100,
      duration: 60,
      questionCount: 15,
      accessCode: '',
      markAllocation: {
        MCQ: 0, Subjective: 0, 'True/False': 0, 'Fill in the Blanks': 0,
        Writing: 0, Matching: 0, Reading: 0, Listening: 0
      },
      isAdaptive: false
    }
  })

  // Seed access code client-side only to avoid SSR hydration mismatch
  // (Math.random() produces different values on server vs client)
  useEffect(() => {
    setValue('accessCode', generateSecureToken())
  }, [])

  // Live Watch Calculations
  const watchNature = watch('nature')
  const watchAlloc = watch('markAllocation')
  const watchPhase = watch('phase')

  const availableBlocks = useMemo(() => {
     return questions?.filter(q => q.phase === watchPhase || q.phase === 'Both')
  }, [questions, watchPhase])

  const natureStats = useMemo(() => {
     const stats: Record<string, number> = {}
     availableBlocks.forEach(q => {
        stats[q.type] = (stats[q.type] || 0) + 1
     })
     return stats
  }, [availableBlocks])

  const totalCalculatedMarks = useMemo(() => {
    if (!watchAlloc) return 0;
    if (watchNature === 'Mixed') {
      return Object.values(watchAlloc).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
    } else {
      return Number(watchAlloc[watchNature as keyof typeof watchAlloc]) || 0;
    }
  }, [watchAlloc, watchNature])

  const onSubmit = async (data: AssessmentFormValues) => {
    if (availableBlocks.length === 0) {
      toast.error(`Fatal: No questions found for phase ${data.phase}. Creation aborted.`)
      return
    }

    const selectedCourse = courses.find(c => c.id === data.courseId)

    const newAssessment: AssessmentTemplate = {
      id: `test-${Date.now()}`,
      title: data.title,
      phase: data.phase,
      courseIds: [data.courseId], // ID-based linking
      classLevels: [selectedCourse?.title || 'Unknown'], // Fallback for display
      nature: data.nature,
      totalMarks: totalCalculatedMarks > 0 ? totalCalculatedMarks : (data.totalMarks || 100),
      markAllocation: data.markAllocation,
      durationMinutes: data.duration,
      questionCount: data.questionCount,
      createdAt: new Date().toISOString(),
      status: requiresReview ? 'pending_review' : 'active',
      accessCode: data.accessCode,
      submittedByTeacherId: user?.id,
      submittedByTeacherName: user?.name,
      isAdaptive: data.isAdaptive,
    }

    try {
      await publishAssessment(newAssessment)
      toast.success(requiresReview 
        ? "Test submitted for review."
        : "Test successfully created."
      )
      router.push('/teacher/assessments')
    } catch (err) {
      toast.error("Process failed. Please verify connection.")
    }
  }

  if (!user?.id) return null
  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/teacher/assessments')}
            className="hover:bg-primary/5 text-primary p-0 h-auto font-normal opacity-60 group transition-all"
        >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-normal">Exit</span>
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/10">
                      <BrainCircuit className="w-6 h-6 text-primary" />
                   </div>
                   <h1 className="text-3xl font-serif text-foreground leading-none font-medium">Create New Test</h1>
                </div>
                <p className="text-muted-foreground text-sm opacity-60">
                    Smart system to help you create and organize student tests.
                </p>
            </div>
            {requiresReview && (
              <Badge variant="outline" className="h-10 px-6 bg-warning/5 text-warning border-warning/10 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 rounded-xl">
                 <AlertCircle className="w-4 h-4" /> Approval Required
              </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-8 space-y-6">
            <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:translate-y-[-2px]">
               <CardHeader className="p-10 border-b border-primary/5">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <CardTitle className="text-2xl font-serif text-foreground/80 font-medium">Setup & Configuration</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40 italic">Set the basic settings for your test.</CardDescription>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/30">
                        <Settings className="w-5 h-5" />
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-10 pt-8">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                       <div className="space-y-8">
                          <div className="space-y-3">
                             <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Test Title</label>
                             <Input 
                                {...register('title')}
                                placeholder="e.g. Mid-Term Mock Test"
                                className="h-14 bg-muted/5 border-primary/5 px-8 font-serif text-xl rounded-2xl focus:ring-1 focus:ring-primary/20 transition-all placeholder:opacity-20"
                             />
                             {errors.title && <p className="text-xs text-destructive font-medium mt-2 ml-1">{errors.title.message}</p>}
                          </div>
 
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Test Period</label>
                                <div className="grid grid-cols-2 gap-3 p-1.5 bg-muted/10 border border-primary/5 rounded-2xl">
                                    {['First Test', 'Last Test'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setValue('phase', p as any)}
                                            className={cn(
                                                "h-11 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                                                watchPhase === p ? "bg-primary text-white shadow-lg" : "text-muted-foreground/60 hover:text-foreground hover:bg-primary/5"
                                            )}
                                        >
                                            {p === 'First Test' ? 'Mid-Term' : 'Final-Term'}
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Assigned Group</label>
                                <Select onValueChange={(val) => setValue('courseId', val)}>
                                   <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-8 text-sm font-medium focus:ring-1 focus:ring-primary/20">
                                      <SelectValue placeholder="Select Class" />
                                   </SelectTrigger>
                                   <SelectContent className="glass-2 border-primary/5 rounded-2xl">
                                      {myClasses?.map(c => (
                                         <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 text-sm">{c.title}</SelectItem>
                                      ))}
                                   </SelectContent>
                                 </Select>
                                 {errors.courseId && <p className="text-xs text-destructive font-medium mt-2 ml-1">{errors.courseId.message}</p>}
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Question Format</label>
                                <Select defaultValue="Mixed" onValueChange={(val) => setValue('nature', val as any)}>
                                   <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-8 text-sm font-medium focus:ring-1 focus:ring-primary/20">
                                      <SelectValue placeholder="Select Format" />
                                   </SelectTrigger>
                                   <SelectContent className="glass-2 border-primary/5 rounded-2xl max-h-[300px]">
                                      <SelectItem value="Mixed" className="rounded-xl py-3">Comprehensive (Mixed)</SelectItem>
                                      <SelectItem value="MCQ" className="rounded-xl py-3">Objective (MCQ)</SelectItem>
                                      <SelectItem value="Subjective" className="rounded-xl py-3">Subjective</SelectItem>
                                      <SelectItem value="True/False" className="rounded-xl py-3">True/False</SelectItem>
                                      <SelectItem value="Fill in the Blanks" className="rounded-xl py-3">Cloze (Blanks)</SelectItem>
                                      <SelectItem value="Matching" className="rounded-xl py-3">Matching</SelectItem>
                                      <SelectItem value="Writing" className="rounded-xl py-3">Essay / Writing</SelectItem>
                                      <SelectItem value="Reading" className="rounded-xl py-3">Reading Comprehension</SelectItem>
                                      <SelectItem value="Listening" className="rounded-xl py-3">Listening Audio</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Number of Questions</label>
                                <div className="relative">
                                   <Input 
                                      type="number"
                                      {...register('questionCount', { valueAsNumber: true })}
                                      className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-8 font-sans text-sm focus:ring-1 focus:ring-primary/20"
                                   />
                                   <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
                                      <Zap className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Questions</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8 pt-10 border-t border-primary/5">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-3 text-primary/60">
                              <Boxes className="w-5 h-5" />
                              <h3 className="font-serif text-xl font-medium text-foreground/80">Mark Distribution</h3>
                           </div>
                           <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted/10 border border-primary/5">
                              {['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening'].map((type, i) => {
                                 const val = Number(watchAlloc?.[type as keyof typeof watchAlloc]) || 0
                                 const width = totalCalculatedMarks > 0 ? (val / totalCalculatedMarks) * 100 : 0
                                 const colors = ['bg-primary', 'bg-indigo-400', 'bg-success', 'bg-amber-400', 'bg-destructive', 'bg-purple-400', 'bg-cyan-400', 'bg-pink-400']
                                 return (
                                    <motion.div 
                                      key={type}
                                      animate={{ width: `${width}%` }}
                                      className={cn(colors[i % colors.length], "h-full opacity-80 shadow-inner")}
                                    />
                                 )
                              })}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           {['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening'].map(type => {
                              const isDisabled = watchNature !== 'Mixed' && watchNature !== type
                              return (
                                 <div key={type} className={cn("space-y-2.5 transition-all", isDisabled && "opacity-20 pointer-events-none grayscale")}>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{type}</label>
                                    <Input 
                                       type="number"
                                       {...register(`markAllocation.${type}` as any, { valueAsNumber: true })}
                                       className="h-12 bg-muted/5 border-primary/5 rounded-xl text-center font-sans focus:ring-primary/20"
                                    />
                                 </div>
                              )
                           })}
                        </div>
                     </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-primary/5">
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Test Access Code</label>
                           <div className="flex gap-2">
                              <Input 
                                 {...register('accessCode')}
                                 className="h-14 bg-primary/5 border-primary/20 px-8 font-mono text-sm tracking-wider text-primary rounded-2xl"
                              />
                              <Button 
                                 type="button" 
                                 variant="outline" 
                                 size="icon" 
                                 onClick={() => setValue('accessCode', generateSecureToken())}
                                 className="shrink-0 h-14 w-14 bg-background border-primary/10 hover:bg-primary/5 rounded-2xl transition-all"
                              >
                                 <RefreshCw className="w-4 h-4 opacity-40" />
                              </Button>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Time Limit (Min)</label>
                           <Input 
                              type="number"
                              {...register('duration', { valueAsNumber: true })}
                              className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-8 font-sans text-sm focus:ring-1 focus:ring-primary/20"
                           />
                        </div>
                      </div>

                      {/* Adaptive Toggle */}
                       <div className="pt-10 border-t border-primary/5">
                        <label className="flex items-center gap-5 cursor-pointer p-6 bg-primary/[0.03] border border-primary/10 rounded-[2rem] hover:bg-primary/[0.06] transition-all group">
                          <input 
                            type="checkbox" 
                            {...register('isAdaptive')}
                            className="w-6 h-6 rounded-lg border-primary/30 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-bold tracking-tight">Adaptive Testing Mode</p>
                            <p className="text-xs text-muted-foreground opacity-60 font-normal">System dynamically adjusts difficulty based on student performance.</p>
                          </div>
                        </label>
                      </div>

                       <div className="pt-12 flex flex-col md:flex-row gap-4">
                           <Button 
                              type="submit" 
                              disabled={isSubmitting} 
                              className="flex-1 h-14 bg-primary hover:bg-primary/95 shadow-2xl shadow-primary/20 rounded-2xl transition-all group"
                           >
                              {isSubmitting ? (
                                 <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                 <div className="flex items-center justify-center gap-3">
                                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Publish Test</span>
                                 </div>
                              )}
                           </Button>
                           <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => router.back()}
                              className="h-14 px-10 text-xs font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
                           >
                              Abandon
                           </Button>
                       </div>
                  </form>
               </CardContent>
            </Card>
         </div>

          <div className="lg:col-span-4 space-y-8 sticky top-8">
            <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-8 bg-primary/5 border-b border-primary/5 space-y-3">
                    <div className="flex items-center gap-3 text-primary/60">
                        <Terminal className="w-5 h-5" />
                        <CardTitle className="font-serif text-xl font-medium tracking-tight">Question Bank Stats</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-baseline justify-between mb-2">
                         <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Questions Available</span>
                         <span className="text-4xl font-sans font-light">{availableBlocks.length}</span>
                      </div>
                      <Progress value={Math.min((availableBlocks.length / 50) * 100, 100)} className="h-1.5 bg-primary/5" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed opacity-60">
                         {availableBlocks.length < (watch('questionCount') || 0) ? 
                            "Insufficient question bank for current settings." : 
                            "Optimal question density confirmed for selection."}
                      </p>
                   </div>

                   <div className="space-y-4 pt-8 border-t border-primary/5">
                      <h4 className="text-[10px] uppercase tracking-widest font-black opacity-30">Type Availability</h4>
                      <div className="grid gap-3">
                         {['MCQ', 'Subjective', 'Reading', 'Listening', 'Writing'].map(type => (
                            <div key={type} className="flex items-center justify-between p-4 bg-muted/5 border border-primary/5 rounded-2xl hover:bg-muted/10 transition-all group">
                               <span className="text-xs font-medium opacity-60">{type} Units</span>
                               <div className="flex items-center gap-3">
                                  <span className="text-sm font-sans font-bold">{natureStats[type] || 0}</span>
                                  <div className={cn("w-1.5 h-1.5 rounded-full ", (natureStats[type] || 0) > 0 ? "bg-success" : "bg-muted-foreground/20")} />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
 
                   <div className="pt-8 border-t border-primary/5">
                      <div className="bg-primary/[0.03] border border-primary/10 p-6 rounded-2xl space-y-3 shadow-inner">
                         <div className="flex items-center gap-2 text-primary">
                            <History className="w-4 h-4 opacity-60" />
                            <span className="text-[10px] uppercase tracking-widest font-black">Proctor Note</span>
                         </div>
                         <p className="text-[11px] leading-relaxed text-muted-foreground font-medium italic opacity-60">
                            Smart selection ensures zero question repetition across 12-week cycles for maximum integrity.
                         </p>
                      </div>
                   </div>
                </CardContent>
            </Card>

            <Card className="glass-1 bg-primary/5 border-primary/5 overflow-hidden p-10 rounded-[2.5rem] shadow-2xl relative isolate">
                <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/10 blur-3xl -z-10" />
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-2.5 bg-background rounded-xl border border-primary/5 shadow-sm">
                      <Target className="w-5 h-5 text-primary" />
                   </div>
                   <h3 className="font-serif text-xl font-medium tracking-tight">Audit Status</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Confidence</span>
                      <span className={cn("text-xs font-bold px-3 py-1 rounded-lg ", availableBlocks.length > 20 ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                         {availableBlocks.length > 20 ? "Optimal" : "Low Density"}
                      </span>
                   </div>
                   <div className="flex justify-between items-center bg-background/40 p-5 border border-primary/5 rounded-2xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Admin Review</span>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black py-1 h-auto border-primary/20">{requiresReview ? "Required" : "Skipped"}</Badge>
                   </div>
                </div>
            </Card>
         </div>
      </div>
    </div>
  )
}
