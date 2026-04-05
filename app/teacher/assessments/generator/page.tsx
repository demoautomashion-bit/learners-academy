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
  title: z.string().min(5, 'Institutional title must be formal and descriptive'),
  phase: z.enum(['First Test', 'Last Test']),
  courseId: z.string().min(1, 'Please select a target academic course'), // UUID based
  classLevel: z.string().optional(), // Legacy display name
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
})

type AssessmentFormValues = z.infer<typeof assessmentSchema>

export default function AssessmentGeneratorPage() {
  const router = useRouter()
  const { user } = useAuth()
  if (!user?.id) return null
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
      }
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
      toast.error(`Fatal: No institutional blocks found for phase ${data.phase}. Creation aborted.`)
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
    }

    try {
      await publishAssessment(newAssessment)
      toast.success(requiresReview 
        ? "Institutional registry updated. Awaiting administrative review."
        : "Automated exam generation successful. Paper is now LIVE."
      )
      router.push('/teacher/assessments')
    } catch (err) {
      toast.error("Generation failed. Check cloud connectivity.")
    }
  }

  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Profile */}
      <div className="space-y-4">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/teacher/assessments')}
            className="hover:bg-primary/5 text-primary p-0 h-auto font-normal opacity-60 group transition-premium"
        >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs   font-normal">Abort Generation</span>
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10  border ">
                      <BrainCircuit className="w-6 h-6 text-primary" />
                   </div>
                   <h1 className="text-3xl font-serif text-foreground leading-none font-medium">Examination Workshop</h1>
                </div>
                <p className="text-muted-foreground text-sm opacity-70">
                    Automated pedagogical engine for cross-cycle assessment synthesis and registry.
                </p>
            </div>
            {requiresReview && (
              <Badge variant="outline" className="h-10 px-6  bg-warning/5 text-warning border-warning/10 text-xs   font-normal flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" /> Institutional Review Required
              </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
         {/* Configuration Side */}
         <div className="lg:col-span-8 space-y-6">
            <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
               <CardHeader className="p-8 border-b ">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <CardTitle className="text-xl font-serif text-foreground/80 font-medium">Generative Logic Configuration</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40">System parameters for academic block selection.</CardDescription>
                     </div>
                     <Settings className="w-5 h-5 text-primary/30" />
                  </div>
               </CardHeader>
               <CardContent className="p-6 flex-1">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-6">
                         <div className="space-y-2">
                            <label className="text-xs   font-normal opacity-40">Institutional Title</label>
                            <Input 
                               {...register('title')}
                               placeholder="e.g. Cambridge A-Level Mock Examination (Mid-Term)"
                               className="h-12 bg-muted/5   px-6 font-serif text-lg focus:ring-1 focus:ring-primary/20 transition-premium"
                            />
                            {errors.title && <p className="text-xs text-destructive   font-normal mt-1">{errors.title.message}</p>}
                         </div>
 
                         <div className="grid grid-cols-2 gap-6 items-stretch">
                            <div className="space-y-2">
                               <label className="text-xs   font-normal opacity-40">Target Term Cycle</label>
                               <Select onValueChange={(val) => setValue('phase', val as any)}>
                                  <SelectTrigger className="h-12 bg-muted/5   px-6 text-xs   font-normal">
                                     <SelectValue placeholder="Select Cycle" />
                                  </SelectTrigger>
                                  <SelectContent className="">
                                     <SelectItem value="First Test" className="text-xs  ">Mid-Term Cycle</SelectItem>
                                     <SelectItem value="Last Test" className="text-xs  ">Final-Term Cycle</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs   font-normal opacity-40">Target Academic Course</label>
                               <Select onValueChange={(val) => setValue('courseId', val)}>
                                  <SelectTrigger className="h-12 bg-muted/5   px-6 text-xs   font-normal">
                                     <SelectValue placeholder="Select Course" />
                                  </SelectTrigger>
                                  <SelectContent className="">
                                     {myClasses?.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs  ">{c.title}</SelectItem>
                                     ))}
                                  </SelectContent>
                                </Select>
                                {errors.courseId && <p className="text-xs text-destructive font-normal mt-1">{errors.courseId.message}</p>}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-6 items-stretch">
                            <div className="space-y-2">
                               <label className="text-xs   font-normal opacity-40">Examination Nature</label>
                               <Select defaultValue="Mixed" onValueChange={(val) => setValue('nature', val as any)}>
                                  <SelectTrigger className="h-12 bg-muted/5   px-6 text-xs   font-normal">
                                     <SelectValue placeholder="Select Nature" />
                                  </SelectTrigger>
                                  <SelectContent className="">
                                     <SelectItem value="Mixed" className="text-xs  ">Mixed Synthesised</SelectItem>
                                     <SelectItem value="MCQ" className="text-xs  ">MCQ Focus</SelectItem>
                                     <SelectItem value="Subjective" className="text-xs  ">Subjective Synthesis</SelectItem>
                                     <SelectItem value="True/False" className="text-xs  ">Binary Logic</SelectItem>
                                     <SelectItem value="Fill in the Blanks" className="text-xs  ">Cloze Analysis</SelectItem>
                                     <SelectItem value="Matching" className="text-xs  ">Graph Relationships</SelectItem>
                                     <SelectItem value="Writing" className="text-xs  ">Analytical Composition</SelectItem>
                                     <SelectItem value="Reading" className="text-xs  ">Textual Critical Analysis</SelectItem>
                                     <SelectItem value="Listening" className="text-xs  ">Auditory Critical Analysis</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs   font-normal opacity-40">Block Count</label>
                               <div className="relative">
                                  <Input 
                                     type="number"
                                     {...register('questionCount', { valueAsNumber: true })}
                                     className="h-12 bg-muted/5   px-6 font-sans text-sm"
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                     <Zap className="w-3.5 h-3.5 text-primary opacity-40" />
                                     <span className="text-xs    opacity-30">Selection Target</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-8 border-t ">
                        <div className="flex items-center gap-3">
                           <Boxes className="w-5 h-5 text-primary opacity-50" />
                           <h3 className="opacity-50 font-sans text-xl font-serif font-medium">Synthesized Mark Allocation (Total: {totalCalculatedMarks})</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
                           {['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening'].map(type => {
                              const isDisabled = watchNature !== 'Mixed' && watchNature !== type
                              return (
                                 <div key={type} className={cn("space-y-2 transition-premium", isDisabled && "opacity-20 pointer-events-none")}>
                                    <label className="text-xs    text-muted-foreground truncate">{type}</label>
                                    <Input 
                                       type="number"
                                       {...register(`markAllocation.${type}` as any, { valueAsNumber: true })}
                                       className="h-11 bg-background   text-center font-sans"
                                    />
                                 </div>
                              )
                           })}
                        </div>
                     </div>

                      <div className="grid grid-cols-2 gap-6 pt-8 border-t items-stretch">
                        <div className="space-y-2">
                           <label className="text-xs   font-normal opacity-40">Access Code</label>
                           <div className="flex gap-2">
                              <Input 
                                 {...register('accessCode')}
                                 className="h-12 bg-primary/5   px-6 font-mono text-sm  text-primary"
                              />
                              <Button 
                                 type="button" 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => setValue('accessCode', generateSecureToken())}
                                 className="shrink-0 h-12 w-12  bg-card border  hover:bg-primary/5"
                              >
                                 <RefreshCw className="w-4 h-4 opacity-40" />
                              </Button>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs   font-normal opacity-40">Duration (Minutes)</label>
                           <Input 
                              type="number"
                              {...register('duration', { valueAsNumber: true })}
                              className="h-12 bg-muted/5   px-6 font-sans text-sm"
                           />
                        </div>
                      </div>

                      <div className="pt-8 flex gap-3">
                          <Button 
                             type="submit" 
                             disabled={isSubmitting} 
                             className="flex-1  bg-primary  hover: hover-lift transition-premium group"
                          >
                             {isSubmitting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                             ) : (
                                <>
                                   <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                   <span className="text-xs   font-normal">Publish Assessment</span>
                                </>
                             )}
                          </Button>
                          <Button 
                             type="button" 
                             variant="outline" 
                             onClick={() => router.back()}
                             className="h-12 px-8   bg-card hover:bg-muted/10 transition-premium"
                          >
                             <span className="text-xs   font-normal">Abandon Selection</span>
                          </Button>
                      </div>
                  </form>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-6 focus-mode-sidebar sticky top-10">
            <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                <CardHeader className="p-6 bg-primary/5 border-b  space-y-2">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-primary opacity-60" />
                        <CardTitle className="font-serif text-xl font-medium">Synthesis Intelligence</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-normal opacity-40">LA-Automated Block Audit</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1">
                   <div className="space-y-4">
                      <div className="flex items-baseline justify-between">
                         <span className="text-xs   font-normal opacity-40">Available Blocks</span>
                         <span className="text-3xl font-normal font-sans">{availableBlocks.length}</span>
                      </div>
                      <Progress value={(availableBlocks.length / 50) * 100} className="h-1 bg-primary/5" />
                      <p className="text-xs text-muted-foreground/60 leading-relaxed font-normal">
                         System is targeting {watch('questionCount')} blocks. {availableBlocks.length < (watch('questionCount') || 0) ? 
                            "Alert: Insufficient blocks in registry to meet target." : 
                            "Block density is optimal for target synthesis."}
                      </p>
                   </div>

                   <div className="space-y-4 pt-6 border-t ">
                      <h4 className="text-xs opacity-40 font-medium">Block Nature Density</h4>
                      <div className="grid gap-2">
                         {['MCQ', 'Subjective', 'Reading', 'Listening', 'Writing'].map(type => (
                           <div key={type} className="flex items-center justify-between p-4  bg-muted/5 border  group transition-premium hover:bg-card">
                              <span className="text-xs   font-normal opacity-60">{type} Units</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-sm font-sans font-normal">{natureStats[type] || 0}</span>
                                 <div className={cn("w-2 h-2 ", (natureStats[type] || 0) > 0 ? "bg-success" : "bg-muted-foreground/20")} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
 
                   <div className="pt-6 border-t ">
                      <div className=" bg-info/5 border border-info/20 p-5 space-y-3">
                         <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-info opacity-60" />
                            <span className="text-xs   font-normal text-info">Synthesis Log</span>
                         </div>
                         <p className="text-xs leading-relaxed text-muted-foreground font-normal italic">
                            The LA-Synthesis engine selects blocks that have not been encountered in the last 12 weeks to ensure zero repetition during examination cycles.
                         </p>
                      </div>
                   </div>
                </CardContent>
            </Card>

            <Card className="glass-1 bg-primary/5 border overflow-hidden p-6 space-y-4 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                <div className="flex items-center gap-3">
                   <Target className="w-5 h-5 text-primary opacity-60" />
                   <h3 className="font-serif text-foreground/80 text-xl font-serif font-medium">Institutional Audit</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs   font-normal opacity-40">Confidence</span>
                      <span className={cn("text-xs font-normal  ", availableBlocks.length > 20 ? "text-success" : "text-warning")}>
                         {availableBlocks.length > 20 ? "High" : "Review Advised"}
                      </span>
                   </div>
                   <div className="flex justify-between items-center bg-card p-4  shadow-sm border ">
                        <span className="text-xs   font-normal opacity-40">Review Threshold</span>
                        <Badge variant="outline" className="text-xs font-normal   ">{requiresReview ? "Mandatory" : "Optional"}</Badge>
                   </div>
                </div>
            </Card>
         </div>
      </div>
    </div>
  )
}
