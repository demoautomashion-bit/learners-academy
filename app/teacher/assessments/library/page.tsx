'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { getTeacherAudioFiles, uploadAudioFile } from '@/lib/actions/audio'
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
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  BrainCircuit, 
  Zap, 
  Library, 
  Eye,
  FileText,
  Volume2,
  ListRestart,
  CheckCircle2,
  AlertCircle,
  Flame,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { Question, QuestionCategory, QuestionType } from '@/lib/types'
import { cn } from '@/lib/utils'

const subQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['MCQ', 'True/False', 'Fill in the Blanks', 'Subjective', 'Matching']),
  content: z.string().min(1, 'Question text required'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  matchPairs: z.array(z.object({ left: z.string(), right: z.string() })).optional(),
})

const questionSchema = z.object({
  category: z.enum(['Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']),
  type: z.enum(['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening']),
  content: z.string().min(5, 'Question content must be detailed'),
  phase: z.enum(['First Test', 'Last Test', 'Both']),
  classLevel: z.string().optional(),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  passageText: z.string().optional(),
  audioUrl: z.string().optional(),
  subQuestions: z.array(subQuestionSchema).optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

export default function AssessmentLibraryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { questions, courses, addQuestion, deleteQuestion, deleteQuestionsByPhase, isInitialized } = useData()

  // Teacher's own classes only
  const myClasses = courses?.filter(c => c.teacherId === user?.id) || []

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [clearPhase, setClearPhase] = useState<'First Test' | 'Last Test' | 'Both' | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [audioRepo, setAudioRepo] = useState<string[]>([])
  const [showManualAudio, setShowManualAudio] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

  if (!isInitialized) return <DashboardSkeleton />

  // Load Audio Repository
  const loadAudio = async () => {
    const res = await getTeacherAudioFiles(user?.id || '')
    if (res.success && res.data) setAudioRepo(res.data.map((f: any) => f.url))
  }

  useEffect(() => {
    loadAudio()
  }, [isAddOpen])

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading("Uploading institutional asset to Vercel Blob...")

    try {
      const sanitizedName = `audio/${user?.id || 'teacher'}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const blob = await upload(sanitizedName, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: true,
      })

      toast.success("Asset verified and stored in Vercel Blob.", { id: toastId })
      await loadAudio()
      setValue('audioUrl', blob.url)
      setShowManualAudio(false)
    } catch (err: any) {
      toast.error(err.message || "Upload rejected.", { id: toastId })
    } finally {
      setIsUploading(false)
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      category: 'Grammar',
      type: 'MCQ',
      phase: 'Both',
      options: ['', '', '', '']
    }
  })

  const watchType = watch('type')

  const filteredQuestions = questions?.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || q.type === typeFilter
    const matchesPhase = phaseFilter === 'all' || q.phase === phaseFilter || q.phase === 'Both'
    return matchesSearch && matchesType && matchesPhase
  })

  const onSubmit = async (data: QuestionFormValues) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      ...data,
      teacherId: user?.id,
      classLevel: data.classLevel || undefined,
      isApproved: true
    }
    
    try {
      await addQuestion(newQuestion)
      setIsAddOpen(false)
      reset()
      toast.success("Institutional block added to library")
    } catch (err) {
      toast.error("Failed to persist block")
    }
  }

  const handleClearBank = async () => {
    if (!clearPhase) return
    setIsClearing(true)
    try {
      await deleteQuestionsByPhase(clearPhase)
      toast.success(
        clearPhase === 'Both'
          ? "All question blocks purged from bank."
          : `${clearPhase === 'First Test' ? 'Mid-Term' : 'Final-Term'} blocks purged.`
      )
      setIsClearOpen(false)
      setClearPhase(null)
    } catch (err) {
      toast.error("Purge operation failed.")
    } finally {
      setIsClearing(false)
    }
  }

  // Count questions by phase for the warning display
  const firstTestCount = questions?.filter(q => q.phase === 'First Test' || q.phase === 'Both').length || 0
  const lastTestCount = questions?.filter(q => q.phase === 'Last Test' || q.phase === 'Both').length || 0
  const totalCount = questions?.length || 0

  const phaseCountMap = {
    'First Test': firstTestCount,
    'Last Test': lastTestCount,
    'Both': totalCount,
  }

  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/teacher/assessments')}
            className="mb-4 hover:bg-primary/5 text-primary p-0 h-auto font-normal opacity-60"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-xs">Back to Assessments</span>
          </Button>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10  border ">
                <Library className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h1 className="font-serif text-foreground leading-none text-3xl font-medium">Assessment Design Library</h1>
                <p className="mt-2 text-muted-foreground text-xs opacity-70">
                    Manage institutional question blocks for automated exam generation.
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Clear Bank Button */}
          <Dialog open={isClearOpen} onOpenChange={(open) => { setIsClearOpen(open); if (!open) setClearPhase(null) }}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/20 transition-all gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Delete Questions</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader className="pb-4 border-b border-destructive/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-destructive/10 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <DialogTitle className="text-2xl font-serif font-normal text-destructive">Clear Question Bank</DialogTitle>
                </div>
                <DialogDescription className="text-xs leading-relaxed opacity-70">
                  Select a term to purge. This action is permanent and cannot be undone. Only your own question blocks will be deleted.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30 mb-4">Select Term to Clear</p>

                {(['First Test', 'Last Test', 'Both'] as const).map((phase) => {
                  const label = phase === 'First Test' ? 'Mid-Term Only' : phase === 'Last Test' ? 'Final-Term Only' : 'Both Terms (Full Wipe)'
                  const count = phaseCountMap[phase]
                  const isSelected = clearPhase === phase
                  return (
                    <button
                      key={phase}
                      onClick={() => setClearPhase(phase)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        isSelected
                          ? "bg-destructive/10 border-destructive/40 shadow-sm"
                          : "bg-muted/5 border-primary/5 hover:bg-muted/10 hover:border-primary/10"
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className={cn("text-sm font-bold", isSelected ? "text-destructive" : "text-foreground/80")}>{label}</p>
                        <p className="text-[10px] text-muted-foreground opacity-60">
                          {phase === 'Both' ? 'All' : phase === 'First Test' ? 'First Test & Both' : 'Last Test & Both'} questions
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs h-6 px-3",
                          isSelected ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-muted/10 border-primary/10"
                        )}
                      >
                        ~{count} blocks
                      </Badge>
                    </button>
                  )
                })}
              </div>

              <DialogFooter className="gap-3 border-t border-primary/5 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => { setIsClearOpen(false); setClearPhase(null) }}
                  className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!clearPhase || isClearing}
                  onClick={handleClearBank}
                  className="gap-2 text-xs uppercase tracking-widest font-bold"
                >
                  {isClearing ? (
                    <ListRestart className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isClearing ? 'Purging...' : 'Confirm Purge'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Question Button */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 transition-all gap-2">
                <Plus className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Add Block</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="bg-muted/5 border-b pb-6">
                <DialogTitle className="text-3xl font-serif font-normal">Create Design Block</DialogTitle>
                <DialogDescription className="text-xs">
                  Blocks are modular components used to build complex examination papers.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <div className="max-h-[min(650px,70vh)] overflow-y-auto px-1 space-y-6 premium-scrollbar">
                  <div className="grid grid-cols-2 gap-6 items-stretch">
                     <div className="space-y-2">
                        <label className="text-xs opacity-40">Pedagogical Category</label>
                        <Select defaultValue="Grammar" onValueChange={(v) => setValue('category', v as any)}>
                           <SelectTrigger className="h-12 bg-muted/20">
                              <SelectValue placeholder="Select Category" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="Grammar">Grammar Taxonomy</SelectItem>
                              <SelectItem value="Vocab & Idioms">Lexis & Idioms</SelectItem>
                              <SelectItem value="Reading">Reading Analysis</SelectItem>
                              <SelectItem value="Listening">Auditory Focus</SelectItem>
                              <SelectItem value="Writing">Composition</SelectItem>
                              <SelectItem value="Speaking">Elocution</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs opacity-40">Institutional Block Type</label>
                        <Select defaultValue="MCQ" onValueChange={(v) => setValue('type', v as any)}>
                           <SelectTrigger className="h-12 bg-muted/20">
                              <SelectValue placeholder="Select Type" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="MCQ">Multiple Choice</SelectItem>
                              <SelectItem value="Subjective">Open Synthesis</SelectItem>
                              <SelectItem value="True/False">Binary Decision</SelectItem>
                              <SelectItem value="Fill in the Blanks">Cloze Entry</SelectItem>
                              <SelectItem value="Matching">Relational Mapping</SelectItem>
                              <SelectItem value="Reading">Passage Analysis</SelectItem>
                              <SelectItem value="Listening">Auditory Analysis</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {/* Class Level + Phase Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs opacity-40">Target Class</label>
                      <Select onValueChange={(v) => setValue('classLevel', v === 'none' ? undefined : v)}>
                        <SelectTrigger className="h-12 bg-muted/20">
                          <SelectValue placeholder="Select Class (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Specific Class</SelectItem>
                          {myClasses.map(c => (
                            <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs opacity-40">Curricular Phase</label>
                       <Select defaultValue="Both" onValueChange={(v) => setValue('phase', v as any)}>
                          <SelectTrigger className="h-12 bg-muted/20">
                             <SelectValue placeholder="Target Phase" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="Both">Full Academic Cycle</SelectItem>
                             <SelectItem value="First Test">Mid-Term Cycle</SelectItem>
                             <SelectItem value="Last Test">Final-Term Cycle</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs opacity-40">Block Content / Narrative</label>
                      <Textarea 
                        {...register('content')}
                        placeholder={
                          watchType === 'Listening' ? "Enter the transcript here. Use '____' for gaps (e.g., 'The capital is ____.')" :
                          watchType === 'Reading' ? "Enter the comprehension task or summary here. Use '____' for gaps." :
                          "Input the core pedagogical content here..."
                        }
                        className="min-h-[120px] bg-muted/20 p-4 text-sm resize-none focus:ring-1 focus:ring-primary/20"
                      />
                     {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                  </div>

                  {watchType === 'Reading' && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs opacity-40">Reading Passage</label>
                      <Textarea 
                        {...register('passageText')}
                        placeholder="Input the analysis text..."
                        className="min-h-[180px] bg-primary/5 p-4 text-sm italic"
                      />
                    </div>
                  )}

                  {watchType === 'Listening' && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs opacity-40">Institutional Audio Repository</label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={loadAudio}
                            className="h-6 px-2 text-[10px] opacity-40 hover:opacity-100 flex items-center gap-1"
                          >
                            <ListRestart className={cn("w-3 h-3", isUploading && "animate-spin")} /> Refresh
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            disabled={isUploading}
                            onClick={() => audioInputRef.current?.click()}
                            className="h-6 px-2 text-[10px] bg-primary/5 text-primary hover:bg-primary/10 flex items-center gap-1 rounded-md"
                          >
                            <Plus className="w-3 h-3" /> Upload
                          </Button>
                          <input 
                            type="file" 
                            ref={audioInputRef} 
                            className="hidden" 
                            accept="audio/*"
                            onChange={handleAudioUpload}
                          />
                        </div>
                      </div>
                      <Select onValueChange={(v) => {
                        if (v === 'manual') {
                          setShowManualAudio(true)
                          setValue('audioUrl', '')
                        } else {
                          setShowManualAudio(false)
                          setValue('audioUrl', v)
                        }
                      }}>
                         <SelectTrigger className="h-12 bg-primary/5 text-[10px] font-mono">
                            <SelectValue placeholder="Select Audio File from Vault..." />
                         </SelectTrigger>
                         <SelectContent>
                            {audioRepo.length > 0 ? (
                              audioRepo.map(file => (
                                <SelectItem key={file} value={file} className="font-mono text-[10px] truncate max-w-md">{file}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No files found in Vault</SelectItem>
                            )}
                            <SelectItem value="manual" className="border-t mt-2 opacity-60">Custom External Link...</SelectItem>
                         </SelectContent>
                      </Select>
                      {showManualAudio && (
                        <Input 
                          {...register('audioUrl')}
                          placeholder="Paste custom link (e.g. https://...)"
                          className="mt-2 h-10 bg-muted/10 text-[10px]"
                        />
                      )}
                    </div>
                  )}

                  {/* Multi-Blank Transcript Preview & Dedicated Answer Key Inputs */}
                  {(() => {
                    const contentVal = watch('content') || ''
                    const blankMatches = contentVal.match(/_{3,}/g) || []
                    const hasBlanks = blankMatches.length > 0

                    if (!hasBlanks) return null

                    const parts = contentVal.split(/_{3,}/)

                    return (
                      <div className="space-y-4 pt-4 border-t border-primary/10">
                        {/* Live Transcript Preview */}
                        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Student View Live Preview ({blankMatches.length} {blankMatches.length === 1 ? 'Blank' : 'Blanks'})
                          </p>
                          <div className="text-sm font-serif leading-relaxed text-foreground flex flex-wrap items-baseline gap-1 pt-1">
                            {parts.map((part, i) => (
                              <span key={i} className="inline flex-wrap items-baseline">
                                <span>{part}</span>
                                {i < parts.length - 1 && (
                                  <span className="inline-flex items-center justify-center bg-primary/15 text-primary font-sans font-bold text-[10px] px-2 py-0.5 rounded border border-primary/20 mx-1 align-baseline">
                                    [{i + 1}] ____
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Order-Wise Blank Answer Key Inputs */}
                        <div className="space-y-3 bg-muted/20 border border-border/80 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">
                              Order-Wise Answer Key ({blankMatches.length} {blankMatches.length === 1 ? 'Blank' : 'Blanks'})
                            </label>
                            <span className="text-[10px] text-muted-foreground">Specify exact answer for each blank</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {blankMatches.map((_, idx) => {
                              const currentCorrect = watch('correctAnswer') || ''
                              const currentArray = currentCorrect.split(',').map(s => s.trim())
                              const val = currentArray[idx] || ''

                              return (
                                <div key={idx} className="flex items-center gap-2 bg-background border rounded-xl p-2.5 shadow-xs">
                                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                  </span>
                                  <Input
                                    placeholder={`Answer for Blank #${idx + 1}...`}
                                    value={val}
                                    onChange={(e) => {
                                      const updated = [...currentArray]
                                      while (updated.length < blankMatches.length) updated.push('')
                                      updated[idx] = e.target.value
                                      setValue('correctAnswer', updated.join(', '))
                                    }}
                                    className="h-8 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Sub-Questions Builder for Reading and Listening */}
                  {(watchType === 'Reading' || watchType === 'Listening') && (
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Comprehension Sub-Questions
                          </label>
                          <p className="text-[10px] text-muted-foreground">Attach multiple questions (MCQ, True/False, Blanks, Subjective) under this passage/audio.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const current = watch('subQuestions') || []
                            setValue('subQuestions', [
                              ...current,
                              {
                                id: `sub_${Date.now()}_${current.length + 1}`,
                                type: 'MCQ',
                                content: '',
                                options: ['', '', '', ''],
                                correctAnswer: ''
                              }
                            ])
                          }}
                          className="h-8 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Sub-Question
                        </Button>
                      </div>

                      {/* Render Sub-Questions List */}
                      {(() => {
                        const subs = watch('subQuestions') || []
                        if (subs.length === 0) {
                          return (
                            <div className="p-4 border border-dashed rounded-2xl text-center bg-muted/10">
                              <p className="text-xs text-muted-foreground italic">No sub-questions added. Click "Add Sub-Question" above to attach questions to this passage.</p>
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-4">
                            {subs.map((sq, sIdx) => (
                              <div key={sq.id} className="p-4 border rounded-2xl bg-card/60 space-y-3 relative shadow-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <span className="text-xs font-bold text-primary">Question #{sIdx + 1}</span>
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={sq.type}
                                      onValueChange={(newType: any) => {
                                        const updated = [...subs]
                                        updated[sIdx] = { ...sq, type: newType, options: newType === 'MCQ' ? ['', '', '', ''] : sq.options }
                                        setValue('subQuestions', updated)
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-[10px] w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True / False</SelectItem>
                                        <SelectItem value="Fill in the Blanks">Fill in Blanks</SelectItem>
                                        <SelectItem value="Subjective">Open Synthesis</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        const updated = subs.filter((_, idx) => idx !== sIdx)
                                        setValue('subQuestions', updated)
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Sub-Question Content */}
                                <Input
                                  placeholder={`Enter Question #${sIdx + 1} text...`}
                                  value={sq.content}
                                  onChange={(e) => {
                                    const updated = [...subs]
                                    updated[sIdx].content = e.target.value
                                    setValue('subQuestions', updated)
                                  }}
                                  className="h-9 text-xs"
                                />

                                {/* MCQ Options */}
                                {sq.type === 'MCQ' && (
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {[0, 1, 2, 3].map(oIdx => (
                                      <Input
                                        key={oIdx}
                                        placeholder={`Option ${oIdx + 1}`}
                                        value={(sq.options || [])[oIdx] || ''}
                                        onChange={(e) => {
                                          const updated = [...subs]
                                          const opts = [...(updated[sIdx].options || ['', '', '', ''])]
                                          opts[oIdx] = e.target.value
                                          updated[sIdx].options = opts
                                          setValue('subQuestions', updated)
                                        }}
                                        className="h-8 text-xs bg-muted/10"
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* True/False Options */}
                                {sq.type === 'True/False' && (
                                  <div className="flex gap-4 items-center text-xs pt-1">
                                    <span className="text-muted-foreground text-[10px]">Correct Answer:</span>
                                    {['True', 'False'].map(tf => (
                                      <label key={tf} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`tf_${sq.id}`}
                                          checked={sq.correctAnswer === tf}
                                          onChange={() => {
                                            const updated = [...subs]
                                            updated[sIdx].correctAnswer = tf
                                            setValue('subQuestions', updated)
                                          }}
                                        />
                                        <span>{tf}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {/* Correct Answer Key Input (MCQ / Blanks / Subjective) */}
                                {sq.type !== 'True/False' && (
                                  <Input
                                    placeholder={
                                      sq.type === 'Subjective' ? "Reference Model Answer (for AI evaluation)..." : "Correct Answer..."
                                    }
                                    value={sq.correctAnswer || ''}
                                    onChange={(e) => {
                                      const updated = [...subs]
                                      updated[sIdx].correctAnswer = e.target.value
                                      setValue('subQuestions', updated)
                                    }}
                                    className="h-8 text-xs bg-success/5 border-success/20"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {watchType === 'MCQ' && (
                    <div className="space-y-4 pt-4 border-t">
                      <label className="text-xs opacity-40">Distractor Options</label>
                      <div className="grid grid-cols-2 gap-4 items-stretch">
                         {[0, 1, 2, 3].map(i => (
                           <div key={i} className="relative">
                              <Input 
                                placeholder={`Option ${i+1}`}
                                onChange={(e) => {
                                  const opt = watch('options') || []
                                  opt[i] = e.target.value
                                  setValue('options', opt)
                                }}
                                className="h-12 bg-muted/10"
                              />
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                     <label className="text-xs opacity-40">Validated Key (Institutional Resolution)</label>
                     <Input 
                        {...register('correctAnswer')}
                        placeholder="The correct solution for auto-grading (or comma-separated for multi-blanks)..."
                        className="h-12 bg-success/5 border-success/10 font-medium text-xs"
                     />
                  </div>
                </div>

                <DialogFooter className="bg-muted/5 border-t pt-6 flex gap-3">
                   <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="h-12 px-6 text-xs">Abandon</Button>
                   <Button type="submit" disabled={isSubmitting} className="bg-primary">
                      {isSubmitting ? "Persisting..." : <span className="text-xs">Publish to Library</span>}
                   </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters Hub */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-60 transition-all" />
            <Input 
              placeholder="Query institutional block content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 focus:ring-1 focus:ring-primary/20 transition-all"
            />
         </div>
         <div className="flex items-center gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
               <SelectTrigger className="w-[180px] h-14 text-xs">
                  <SelectValue placeholder="All Design Nature" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Nature</SelectItem>
                  <SelectItem value="MCQ">MCQ</SelectItem>
                  <SelectItem value="Subjective">Synthesis</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Listening">Auditory</SelectItem>
                  <SelectItem value="Writing">Composition</SelectItem>
               </SelectContent>
            </Select>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
               <SelectTrigger className="w-[180px] h-14 text-xs">
                  <SelectValue placeholder="All Term Cycles" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">Full Cycle</SelectItem>
                  <SelectItem value="First Test">Mid-term</SelectItem>
                  <SelectItem value="Last Test">Final-term</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>

      {/* Questions Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-2 items-stretch"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredQuestions?.map((q) => (
            <motion.div 
              key={q.id} 
              variants={STAGGER_ITEM}
              layout
              className="group"
            >
              <Card className="glass-1 h-full overflow-hidden flex flex-col hover-lift transition-all rounded-2xl shadow-premium hover:translate-y-[-2px]">
                <CardHeader className="p-8 pb-4 space-y-4">
                   <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary px-3 h-6">
                        {q.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 hover:bg-destructive/10 transition-all"
                          onClick={() => {
                            deleteQuestion(q.id)
                            toast.success("Institutional block removed")
                          }}
                        >
                           <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground/60 text-xs flex-wrap">
                      <Zap className="w-3 h-3 text-warning" />
                      <span>{q.category}</span>
                      <span className="opacity-20">•</span>
                      <span>Phase: {q.phase}</span>
                      {q.classLevel && (
                        <>
                          <span className="opacity-20">•</span>
                          <span className="text-primary/60 font-medium">{q.classLevel}</span>
                        </>
                      )}
                   </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex-1 flex flex-col space-y-6">
                   <div className="flex-1">
                      <p className="text-lg font-serif font-normal text-foreground/80 leading-relaxed line-clamp-4 italic">
                        "{q.content}"
                      </p>
                   </div>
                   
                   {q.type === 'MCQ' && q.options && (
                      <div className="grid grid-cols-2 gap-3 pt-4 items-stretch">
                         {q.options?.filter(o => !!o).map((opt, i) => (
                           <div key={i} className="p-3 bg-muted/10 border text-xs font-normal truncate">
                             <span className="opacity-30 mr-2">{String.fromCharCode(65 + i)}:</span>
                             {opt}
                           </div>
                         ))}
                      </div>
                   )}

                   {q.passageText && (
                      <div className="p-4 bg-primary/5 border text-xs font-normal italic line-clamp-2 opacity-60">
                         {q.passageText}
                      </div>
                   )}

                   <div className="pt-6 border-t flex items-center justify-between">
                      <div className="space-y-0.5">
                         <span className="text-xs text-muted-foreground opacity-40">System Resolution</span>
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            <span className="text-xs font-normal text-success">{q.correctAnswer || 'Manual Logic'}</span>
                         </div>
                      </div>
                      <Button variant="ghost" size="sm" className="group/btn hover:bg-primary/5 transition-all">
                         <Eye className="w-3.5 h-3.5 mr-2 opacity-40 group-hover/btn:opacity-100" />
                         <span className="text-xs">View Block</span>
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredQuestions.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-6">
             <div className="bg-primary/5 p-8 w-fit mx-auto border">
                <BrainCircuit className="w-12 h-12 text-primary opacity-20" />
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-serif text-muted-foreground opacity-40">No institutional blocks found.</p>
                <p className="text-xs font-normal text-muted-foreground opacity-30">Modify search query or nature categorization.</p>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
