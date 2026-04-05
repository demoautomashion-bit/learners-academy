'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
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
  Filter, 
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
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { Question, QuestionCategory, QuestionType } from '@/lib/types'

const questionSchema = z.object({
  category: z.enum(['Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']),
  type: z.enum(['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening']),
  content: z.string().min(5, 'Question content must be detailed'),
  phase: z.enum(['First Test', 'Last Test', 'Both']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  passageText: z.string().optional(),
  audioUrl: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

export default function AssessmentLibraryPage() {
  const router = useRouter()
  const { questions, addQuestion, deleteQuestion, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)

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
      isApproved: true // Direct publish for now
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

  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
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
            <span className="text-[10px] uppercase tracking-widest">Back to Assessments</span>
          </Button>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Library className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h1 className="text-4xl font-serif font-normal text-foreground leading-none">Assessment Design Library</h1>
                <p className="mt-2 text-muted-foreground text-editorial-meta opacity-70">
                    Manage institutional question blocks for automated exam generation.
                </p>
             </div>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary text-white shadow-premium hover:shadow-massive hover-lift transition-premium">
              <Plus className="w-5 h-5 mr-3" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Add Institutional Block</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="bg-muted/5 border-b border-primary/5 pb-6">
              <DialogTitle className="text-3xl font-serif font-normal">Create Design Block</DialogTitle>
              <DialogDescription className="text-editorial-meta text-xs">
                Blocks are modular components used to build complex examination papers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
              <div className="max-h-[min(650px,70vh)] overflow-y-auto px-1 space-y-6 premium-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Pedagogical Category</label>
                      <Select defaultValue="Grammar" onValueChange={(v) => setValue('category', v as any)}>
                         <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl">
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
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Institutional Block Type</label>
                      <Select defaultValue="MCQ" onValueChange={(v) => setValue('type', v as any)}>
                         <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl">
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

                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Block Content / Narrative</label>
                   <Textarea 
                      {...register('content')}
                      placeholder="Input the core pedagogical content here..."
                      className="min-h-[120px] bg-muted/20 border-primary/5 rounded-2xl p-4 text-sm resize-none focus:ring-1 focus:ring-primary/20"
                   />
                   {errors.content && <p className="text-[10px] text-destructive uppercase tracking-widest font-bold">{errors.content.message}</p>}
                </div>

                {watchType === 'Reading' && (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Reading Passage</label>
                    <Textarea 
                      {...register('passageText')}
                      placeholder="Input the analysis text..."
                      className="min-h-[180px] bg-primary/5 border-primary/5 rounded-2xl p-4 text-sm italic"
                    />
                  </div>
                )}

                {watchType === 'MCQ' && (
                  <div className="space-y-4 pt-4 border-t border-primary/5">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Distractor Options</label>
                    <div className="grid grid-cols-2 gap-4">
                       {[0, 1, 2, 3].map(i => (
                         <div key={i} className="relative">
                            <Input 
                              placeholder={`Option ${i+1}`}
                              onChange={(e) => {
                                const opt = watch('options') || []
                                opt[i] = e.target.value
                                setValue('options', opt)
                              }}
                              className="h-12 bg-muted/10 border-primary/5 rounded-xl"
                            />
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-primary/5">
                   <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Validated Key (Institutional Resolution)</label>
                   <Input 
                      {...register('correctAnswer')}
                      placeholder="The correct solution for auto-grading..."
                      className="h-12 bg-success/5 border-success/10 rounded-xl font-medium"
                   />
                </div>

                <div className="space-y-2 pt-4 border-t border-primary/5">
                   <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Curricular Phase</label>
                   <Select defaultValue="Both" onValueChange={(v) => setValue('phase', v as any)}>
                      <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl">
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

              <DialogFooter className="bg-muted/5 border-t border-primary/5 pt-6 flex gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="h-12 rounded-xl px-6 border-primary/10 text-[10px] uppercase tracking-widest font-bold">Abandon</Button>
                 <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl px-10 bg-primary text-white shadow-premium">
                    {isSubmitting ? "Persisting..." : <span className="text-[10px] uppercase tracking-widest font-bold">Publish to Library</span>}
                 </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Hub */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-60 transition-premium" />
            <Input 
              placeholder="Query institutional block content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-[1.5rem] focus:ring-1 focus:ring-primary/20 transition-premium"
            />
         </div>
         <div className="flex items-center gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
               <SelectTrigger className="w-[180px] h-14 bg-card/40 backdrop-blur-md border-primary/5 rounded-[1.5rem] text-[10px] uppercase tracking-widest font-bold">
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
               <SelectTrigger className="w-[180px] h-14 bg-card/40 backdrop-blur-md border-primary/5 rounded-[1.5rem] text-[10px] uppercase tracking-widest font-bold">
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
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-2"
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
              <Card className="h-full border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[2.5rem] overflow-hidden flex flex-col hover-lift hover:shadow-massive transition-premium">
                <CardHeader className="p-8 pb-4 space-y-4">
                   <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black border-primary/10 bg-primary/5 text-primary px-3 h-6">
                        {q.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => {
                            deleteQuestion(q.id)
                            toast.success("Institutional block removed")
                          }}
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground/60 text-[9px] uppercase tracking-widest font-bold">
                      <Zap className="w-3 h-3 text-warning" />
                      <span>{q.category}</span>
                      <span className="opacity-20">•</span>
                      <span>Phase: {q.phase}</span>
                   </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex-1 flex flex-col space-y-6">
                   <div className="flex-1">
                      <p className="text-lg font-serif font-normal text-foreground/80 leading-relaxed line-clamp-4 italic">
                        "{q.content}"
                      </p>
                   </div>
                   
                   {q.type === 'MCQ' && q.options && (
                      <div className="grid grid-cols-2 gap-3 pt-4">
                         {q.options?.filter(o => !!o).map((opt, i) => (
                           <div key={i} className="p-3 rounded-2xl bg-muted/10 border border-primary/5 text-[10px] font-normal truncate">
                             <span className="opacity-30 mr-2">{String.fromCharCode(65 + i)}:</span>
                             {opt}
                           </div>
                         ))}
                      </div>
                   )}

                   {q.passageText && (
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/5 text-[10px] font-normal italic line-clamp-2 opacity-60">
                         {q.passageText}
                      </div>
                   )}

                   <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                         <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground opacity-40">System Resolution</span>
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            <span className="text-xs font-normal text-success">{q.correctAnswer || 'Manual Logic'}</span>
                         </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-10 rounded-xl px-4 group/btn hover:bg-primary/5 hover:text-primary transition-all">
                         <Eye className="w-3.5 h-3.5 mr-2 opacity-40 group-hover/btn:opacity-100" />
                         <span className="text-[9px] uppercase tracking-widest font-bold">View Block</span>
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredQuestions.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-6">
             <div className="bg-primary/5 p-8 rounded-full w-fit mx-auto border border-primary/5">
                <BrainCircuit className="w-12 h-12 text-primary opacity-20" />
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-serif text-muted-foreground opacity-40">No institutional blocks found.</p>
                <p className="text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-30">Modify search query or nature categorization.</p>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
