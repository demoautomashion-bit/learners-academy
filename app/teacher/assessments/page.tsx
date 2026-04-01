'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Calendar,
  Users,
  ClipboardList,
  Edit,
  Trash2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Copy,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { generateSecureToken } from '@/lib/utils'
import { toggleAssessmentStatusAction } from '@/lib/actions/teacher-actions'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import type { AssessmentTemplate } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const assessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  phase: z.enum(['First Test', 'Last Test']),
  classLevel: z.string().min(1, 'Please select a class'),
  nature: z.enum(['MCQ', 'Subjective', 'Mixed', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening']),
  totalMarks: z.coerce.number().min(1, 'Marks must be positive'),
  duration: z.coerce.number().min(1, 'Duration must be positive'),
  questionCount: z.coerce.number().min(1, 'Count must be at least 1').max(50, 'Max 50 questions'),
  accessCode: z.string().min(5, 'Access code is required').regex(/^[A-Z0-9-]+$/, 'Letters, numbers, and hyphens only'),
})

type AssessmentFormValues = z.infer<typeof assessmentSchema>

export default function AssessmentsPage() {
  const { user } = useAuth()
  const { 
    assessments, 
    courses: mockCourses, 
    questions: mockQuestions, 
    publishAssessment, 
    removeAssessment,
    teachers,
    isInitialized
  } = useData()

  // Find current teacher's requiresReview flag
  const currentTeacher = teachers.find(t => t.id === user?.id)
  const requiresReview = !!currentTeacher?.requiresReview
  // toggleAssessmentStatusAction is imported at the top of the file
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      nature: 'Mixed',
      totalMarks: 100,
      duration: 60,
      questionCount: 15,
      accessCode: generateSecureToken(),
    }
  })

  const myClasses = mockCourses.filter(c => c.teacherId === user?.id)

  const filteredAssessments = assessments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = async (data: AssessmentFormValues) => {
    // Warn (but don't block) if the library has no questions for this phase
    const availableQuestions = mockQuestions.filter(q => q.phase === data.phase || q.phase === 'Both')
    if (availableQuestions.length === 0) {
      toast.warning(`No questions in Library for "${data.phase}". The exam will be empty until you add questions.`)
    }

    const newAssessment: AssessmentTemplate = {
      id: `test-${Date.now()}`,
      title: data.title,
      phase: data.phase,
      classLevels: [data.classLevel],
      nature: data.nature,
      totalMarks: data.totalMarks,
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
      setIsCreateOpen(false)
      reset()
      toast.success(requiresReview
        ? 'Paper submitted for admin review'
        : 'Assessment generated successfully'
      )
    } catch (error) {
      // Error handled by context
    }
  }

  const handleDelete = (id: string) => {
    removeAssessment(id)
    toast.success('Assessment deleted')
  }

  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Assessments
          </h1>
          <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
            Generate and manage exam papers for your terms
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hover-lift shadow-premium rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-[10px] uppercase tracking-widest font-normal">
                {requiresReview ? 'Submit for Review' : 'Generate Test'}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-primary/5 shadow-22xl p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-muted/5 border-b border-primary/5">
              <DialogTitle className="font-serif text-2xl font-normal">Generate New Test</DialogTitle>
              <DialogDescription className="text-editorial-meta text-xs">
                The system will automatically select questions from your Library block.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-8 space-y-6">
                <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel>Test Title</FieldLabel>
                  <Input {...register('title')} placeholder="e.g. Mid-term Assessment" />
                  {errors.title && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.title.message}</p>}
                </Field>
                <Field>
                  <FieldLabel>Test Phase</FieldLabel>
                  <Select onValueChange={(val) => setValue('phase', val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Test">First Test (Mid-term)</SelectItem>
                      <SelectItem value="Last Test">Last Test (Final-term)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.phase && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.phase.message}</p>}
                </Field>
                <Field>
                  <FieldLabel>Target Class</FieldLabel>
                  <Select onValueChange={(val) => setValue('classLevel', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {myClasses.map(c => (
                        <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classLevel && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.classLevel.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs">Question Nature</FieldLabel>
                  <Select defaultValue="Mixed" onValueChange={(val) => setValue('nature', val as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select nature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixed">Mixed (All Types)</SelectItem>
                      <SelectItem value="MCQ">MCQ Only</SelectItem>
                      <SelectItem value="Subjective">Subjective Only</SelectItem>
                      <SelectItem value="True/False">True / False Only</SelectItem>
                      <SelectItem value="Fill in the Blanks">Fill / Blank Only</SelectItem>
                      <SelectItem value="Matching">Matching Only</SelectItem>
                      <SelectItem value="Writing">Writing Only</SelectItem>
                      <SelectItem value="Reading">Reading Analysis</SelectItem>
                      <SelectItem value="Listening">Listening Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs">Questions</FieldLabel>
                    <Input {...register('questionCount', { valueAsNumber: true })} type="number" className="h-9" />
                    {errors.questionCount && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.questionCount.message}</p>}
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Total Marks</FieldLabel>
                    <Input {...register('totalMarks', { valueAsNumber: true })} type="number" className="h-9" />
                    {errors.totalMarks && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.totalMarks.message}</p>}
                  </Field>
                </div>
                
                <Field>
                  <FieldLabel className="text-xs">Duration (Mins)</FieldLabel>
                  <Input {...register('duration', { valueAsNumber: true })} type="number" className="h-9" />
                  {errors.duration && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.duration.message}</p>}
                </Field>
                <Field>
                  <FieldLabel>Access Token (Unique for Class)</FieldLabel>
                  <div className="flex gap-2">
                    <Input 
                      {...register('accessCode')} 
                      placeholder="LA-XXXX-YY" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setValue('accessCode', generateSecureToken())}
                      className="shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.accessCode && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.accessCode.message}</p>}
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="p-8 bg-muted/5 border-t border-primary/5 mt-0 flex flex-col sm:flex-row gap-3">
                {/* Review notice for flagged teachers */}
                {requiresReview && (
                  <div className="w-full mb-3 flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3">
                    <Info className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-warning">This paper will be reviewed before going live</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Your exam will be visible to the admin for approval. Students cannot access it until it is approved.
                      </p>
                    </div>
                  </div>
                )}
                <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? (requiresReview ? 'Submitting...' : 'Generating...')
                    : (requiresReview ? 'Submit for Review' : 'Generate Paper')
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div className="grid gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-md bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl h-12"
          />
        </div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {filteredAssessments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No assessments found
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                variants={STAGGER_ITEM}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <Card className="hover-lift overflow-hidden border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[2rem] h-full flex flex-col">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 p-6">
                    <div className="space-y-1">
                      <Badge variant={assessment.phase === 'First Test' ? 'outline' : 'secondary'} className="text-[10px] uppercase tracking-widest font-normal border-primary/20 bg-primary/5 text-primary">
                        {assessment.phase}
                      </Badge>
                      <CardTitle className="font-serif text-xl tracking-tight leading-none pt-1 font-normal group-hover:text-primary transition-colors">{assessment.title}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-premium opacity-40 hover:opacity-100"
                      onClick={() => handleDelete(assessment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col p-6 pt-0">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-70">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">{assessment.classLevels[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.nature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                        <span>{new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    {/* Status + Token strip */}
                      <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/20 border border-primary/5 group/token relative overflow-hidden transition-premium">
                        <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover/token:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest font-normal text-muted-foreground opacity-60">Registry Token</span>
                          <span className="font-sans text-sm font-normal tracking-wide text-primary">{assessment.accessCode}</span>
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                          {/* Status chip */}
                          {assessment.status === 'active' && (
                            <div className="flex items-center gap-2 pr-2 border-r border-border/50">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-primary">Live</span>
                              <Switch 
                                checked={true}
                                onCheckedChange={async (checked) => {
                                  const newStatus = checked ? 'active' : 'archived'
                                  publishAssessment({ ...assessment, status: newStatus })
                                  const res = await toggleAssessmentStatusAction(assessment.id, newStatus)
                                  if (res.success) {
                                    toast.success(`Exam ${checked ? 'Activated' : 'Stopped'}`)
                                  } else {
                                    toast.error("Failed to update status")
                                  }
                                }}
                                className="scale-75 data-[state=checked]:bg-primary"
                              />
                            </div>
                          )}
                          {assessment.status === 'archived' && (
                            <div className="flex items-center gap-2 pr-2 border-r border-border/50">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Stopped</span>
                              <Switch 
                                checked={false}
                                onCheckedChange={async (checked) => {
                                  const newStatus = checked ? 'active' : 'archived'
                                  publishAssessment({ ...assessment, status: newStatus })
                                  const res = await toggleAssessmentStatusAction(assessment.id, newStatus)
                                  if (res.success) {
                                    toast.success(`Exam ${checked ? 'Activated' : 'Stopped'}`)
                                  } else {
                                    toast.error("Failed to update status")
                                  }
                                }}
                                className="scale-75 data-[state=checked]:bg-primary"
                              />
                            </div>
                          )}
                          {assessment.status === 'pending_review' && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
                              <Clock className="w-3 h-3 text-warning" />
                              <span className="text-[9px] uppercase tracking-widest font-bold text-warning">Awaiting Admin Review</span>
                            </div>
                          )}
                          {assessment.status === 'draft' && assessment.adminFeedback && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                              <AlertCircle className="w-3 h-3 text-destructive" />
                              <span className="text-[9px] uppercase tracking-widest font-bold text-destructive">Revision Required</span>
                            </div>
                          )}
                          {/* Copy token — only when not pending */}
                          {assessment.status !== 'pending_review' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-premium"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(assessment.accessCode)
                                toast.success("Access Token Copied")
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Admin feedback block — shown when revision is required */}
                      {assessment.status === 'draft' && assessment.adminFeedback && (
                        <div className="border-l-4 border-warning/60 bg-warning/5 rounded-r-xl p-4">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-warning mb-1">Admin Feedback</p>
                          <p className="text-sm italic text-muted-foreground leading-relaxed">{assessment.adminFeedback}</p>
                        </div>
                      )}
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full group rounded-xl h-10 border-primary/10 hover:bg-primary/5 hover:text-primary transition-premium font-semibold">
                        Review Exam Paper
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
