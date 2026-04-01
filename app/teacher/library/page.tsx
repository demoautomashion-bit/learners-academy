'use client'

import { useState } from 'react'
import { useData } from '@/contexts/data-context'
import type { Question, QuestionCategory } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { toast } from 'sonner'
import { Plus, Search, Trash2, Edit, X, Library as LibraryIcon, Volume2, BookOpen } from 'lucide-react'
import Image from 'next/image'

const questionSchema = z.object({
  category: z.string().min(1, 'Required'),
  type: z.enum(['MCQ', 'Subjective', 'True/False', 'Fill in the Blanks', 'Writing', 'Matching', 'Reading', 'Listening']),
  phase: z.enum(['First Test', 'Last Test', 'Both']),
  content: z.string().min(1, 'Required'),
  options: z.string().optional(),
  correctAnswer: z.string().optional(),
  imageUrl: z.string().optional(),
  passageText: z.string().optional(),
  audioUrl: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

const CATEGORIES: QuestionCategory[] = ['Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']

const TYPE_OPTIONS = [
  { value: 'MCQ',               label: 'Multiple Choice (MCQ)' },
  { value: 'True/False',        label: 'True / False' },
  { value: 'Fill in the Blanks',label: 'Fill in the Blanks' },
  { value: 'Writing',           label: 'Writing Prompt' },
  { value: 'Matching',          label: 'Column Matching' },
  { value: 'Reading',           label: 'Reading Question' },
  { value: 'Listening',         label: 'Listening Question' },
  { value: 'Subjective',        label: 'Subjective (Open)' },
]

const TYPE_BADGE_COLORS: Record<string, string> = {
  'MCQ':                'border-primary/20 bg-primary/5 text-primary',
  'True/False':         'border-success/20 bg-success/5 text-success',
  'Fill in the Blanks': 'border-warning/20 bg-warning/5 text-warning',
  'Writing':            'border-muted-foreground/20 bg-muted/50 text-muted-foreground',
  'Matching':           'border-accent/20 bg-accent/5 text-foreground',
  'Reading':            'border-primary/15 bg-primary/5 text-primary/70',
  'Listening':          'border-primary/15 bg-primary/5 text-primary/70',
  'Subjective':         'border-muted-foreground/20 bg-muted/30 text-muted-foreground',
}

export default function QuestionLibraryPage() {
  const { questions, addQuestion, deleteQuestion, isInitialized } = useData()
  
  if (!isInitialized) return <DashboardSkeleton />

  const [activeTab, setActiveTab] = useState<QuestionCategory>('Grammar')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [matchPairs, setMatchPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' },
  ])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
      defaultValues: { type: 'MCQ', phase: 'Both' },
    })

  const selectedType = watch('type')
  const selectedCategory = watch('category')
  const imageUrl = watch('imageUrl')
  const correctAnswer = watch('correctAnswer')

  const filteredQuestions = questions.filter((q: Question) =>
    q.category === activeTab && q.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClose = () => {
    setIsOpen(false)
    reset()
    setMatchPairs([{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }])
  }

  const updatePair = (i: number, field: 'left' | 'right', val: string) =>
    setMatchPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  const onSubmit = async (data: QuestionFormValues) => {
    const validPairs = matchPairs.filter(p => p.left.trim() && p.right.trim())
    if (data.type === 'Matching' && validPairs.length < 2) {
      toast.error('Add at least 2 complete pairs for a Matching question.')
      return
    }

    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      category: data.category as QuestionCategory,
      type: data.type as any,
      content: data.content,
      phase: data.phase,
      options:
        data.type === 'MCQ' && data.options
          ? data.options.split(',').map((o: string) => o.trim())
          : data.type === 'True/False'
          ? ['True', 'False']
          : undefined,
      correctAnswer: data.correctAnswer || '',
      imageUrl: data.imageUrl || undefined,
      passageText: data.passageText || undefined,
      audioUrl: data.audioUrl || undefined,
      matchPairs: data.type === 'Matching' ? validPairs : undefined,
    }

    try {
      await addQuestion(newQuestion)
      handleClose()
      toast.success('Question added to library')
    } catch {
      // Error handled by context
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-normal text-foreground">Assessment Library</h1>
          <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
            Curate your institutional question bank across {CATEGORIES.length} academic categories.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); else setIsOpen(true) }}>
          <DialogTrigger asChild>
            <Button className="hover-lift shadow-premium rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-[10px] uppercase tracking-widest font-normal">Add Question</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl border-primary/5 shadow-22xl p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-muted/5 border-b border-primary/5 text-left items-start">
              <DialogTitle className="text-2xl font-normal">Add to Library</DialogTitle>
              <DialogDescription className="text-editorial-meta text-xs">
                Fields adapt to the selected block type for institutional precision.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[min(500px,50vh)] overflow-y-auto px-6 py-4 space-y-4 premium-scrollbar">
                <FieldGroup className="space-y-4">
                  {/* Category + Phase row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel className="text-xs">Category</FieldLabel>
                      <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-[10px] text-destructive font-normal uppercase tracking-widest mt-1 opacity-80">{errors.category.message}</p>}
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs">Phase</FieldLabel>
                      <Select defaultValue="Both" onValueChange={(v) => setValue('phase', v as any)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Test" className="text-xs">First Test</SelectItem>
                          <SelectItem value="Last Test" className="text-xs">Last Test</SelectItem>
                          <SelectItem value="Both" className="text-xs">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Type */}
                  <Field>
                    <FieldLabel className="text-xs">Question Type</FieldLabel>
                    <Select defaultValue="MCQ" onValueChange={(v) => setValue('type', v as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Reading passage — shown only when category === Reading */}
                  {selectedCategory === 'Reading' && (
                    <Field>
                      <FieldLabel className="text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Reading Passage
                      </FieldLabel>
                      <Textarea
                        {...register('passageText')}
                        rows={4}
                        className="text-xs resize-none"
                        placeholder="Paste the full reading passage here. Students read this before answering."
                      />
                    </Field>
                  )}

                  {/* Audio URL — shown only when category === Listening */}
                  {selectedCategory === 'Listening' && (
                    <Field>
                      <FieldLabel className="text-xs flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3" /> Audio Clip URL
                      </FieldLabel>
                      <Input
                        {...register('audioUrl')}
                        className="h-8 text-xs"
                        placeholder="https://... (.mp3, .wav, .ogg)"
                      />
                    </Field>
                  )}

                  {/* Content — label and placeholder adapt to type */}
                  <Field>
                    <FieldLabel className="text-xs">
                      {selectedType === 'True/False'        ? 'Statement to evaluate'
                      : selectedType === 'Fill in the Blanks' ? 'Sentence (use ____ for the blank)'
                      : selectedType === 'Writing'          ? 'Essay Prompt / Title'
                      : selectedType === 'Matching'         ? 'Instructions (optional)'
                      : 'Question / Prompt'}
                    </FieldLabel>
                    <Textarea
                      {...register('content')}
                      rows={selectedType === 'Matching' ? 1 : 2}
                      className="text-sm resize-none"
                      placeholder={
                        selectedType === 'True/False'         ? '"The sun rises in the west."'
                        : selectedType === 'Fill in the Blanks' ? '"The capital of France is ____."'
                        : selectedType === 'Writing'           ? '"Write about the effects of social media on youth."'
                        : selectedType === 'Matching'          ? 'Match each term in Column A to its definition in Column B.'
                        : 'Enter your question here...'
                      }
                    />
                    {errors.content && <p className="text-[10px] text-destructive font-bold mt-0.5">{errors.content.message}</p>}
                  </Field>

                  {/* Image URL — all types except Listening */}
                  {selectedCategory !== 'Listening' && (
                    <Field>
                      <FieldLabel className="text-xs">Visual Aid (Optional)</FieldLabel>
                      {imageUrl ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border">
                          <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={() => setValue('imageUrl', '')}
                            className="absolute top-1 right-1 bg-destructive text-white p-0.5 rounded-full shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Input className="h-8 text-xs" placeholder="Paste image URL (optional)"
                          value={watch('imageUrl') || ''}
                          onChange={(e) => setValue('imageUrl', e.target.value)} />
                      )}
                    </Field>
                  )}

                  {/* MCQ options */}
                  {selectedType === 'MCQ' && (
                    <Field>
                      <FieldLabel className="text-xs">Options (comma-separated)</FieldLabel>
                      <Input {...register('options')} className="h-8 text-xs" placeholder="Option A, Option B, Option C, Option D" />
                    </Field>
                  )}

                  {/* Matching pair builder */}
                  {selectedType === 'Matching' && (
                    <Field>
                      <FieldLabel className="text-xs">Match Pairs</FieldLabel>
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-[1fr_1fr_20px] gap-1.5 px-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Column A</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Column B</span>
                          <span />
                        </div>
                        {matchPairs.map((pair, i) => (
                          <div key={i} className="grid grid-cols-[1fr_1fr_20px] gap-1.5 items-center">
                            <Input value={pair.left} onChange={e => updatePair(i, 'left', e.target.value)}
                              className="h-7 text-xs" placeholder={`Term ${i + 1}`} />
                            <Input value={pair.right} onChange={e => updatePair(i, 'right', e.target.value)}
                              className="h-7 text-xs" placeholder={`Match ${i + 1}`} />
                            <button type="button" onClick={() => setMatchPairs(p => p.filter((_, idx) => idx !== i))}
                              disabled={matchPairs.length <= 2}
                              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-premium">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm"
                          onClick={() => setMatchPairs(p => [...p, { left: '', right: '' }])}
                          className="h-7 text-xs gap-1 text-primary/70 hover:text-primary hover:bg-primary/5 w-full">
                          <Plus className="w-3 h-3" /> Add Pair
                        </Button>
                      </div>
                    </Field>
                  )}

                  {/* Correct Answer — MCQ, True/False, Fill in the Blanks */}
                  {(selectedType === 'MCQ' || selectedType === 'True/False' || selectedType === 'Fill in the Blanks') && (
                    <Field>
                      <FieldLabel className="text-xs">Correct Answer</FieldLabel>
                      {selectedType === 'True/False' ? (
                        <div className="grid grid-cols-2 gap-2">
                          {['True', 'False'].map(opt => (
                            <button key={opt} type="button" onClick={() => setValue('correctAnswer', opt)}
                              className={`h-8 rounded-lg border-2 text-xs font-bold transition-premium ${correctAnswer === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Input {...register('correctAnswer')} className="h-8 text-xs" placeholder="Exact correct answer" />
                      )}
                    </Field>
                  )}
                </FieldGroup>
              </div>

              <DialogFooter className="p-6 bg-muted/5 border-t border-primary/5 mt-0 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl px-6 h-11">
                  <span className="text-[10px] uppercase tracking-widest font-normal">Cancel</span>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6 h-11 shadow-premium">
                  <span className="text-[10px] uppercase tracking-widest font-normal">
                    {isSubmitting ? 'Adding...' : 'Add to Library'}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Library Grid */}
      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuestionCategory)}>
            <TabsList className="bg-card/40 backdrop-blur-md border border-primary/5 p-1 w-full justify-start overflow-x-auto no-scrollbar h-12 rounded-2xl">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} className="flex-1 md:flex-none h-10 px-6 text-[10px] uppercase tracking-widest font-normal rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-premium">{cat}</TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                <Input placeholder={`Search in ${activeTab}...`} value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-sm transition-premium focus:ring-1 focus:ring-primary/20" />
              </div>

              <motion.div 
                className="grid gap-4"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="visible"
              >
                {filteredQuestions.length === 0 ? (
                  <Card className="border-dashed border-primary/10 py-16 bg-muted/5 rounded-[2rem]">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="bg-primary/5 p-4 rounded-full mb-4">
                        <LibraryIcon className="w-8 h-8 text-primary/30" />
                      </div>
                      <p className="font-sans text-lg font-normal">Empty Category</p>
                      <p className="text-editorial-meta opacity-60 text-sm mt-1">No blocks found in the {activeTab} registry.</p>
                    </div>
                  </Card>
                ) : (
                  filteredQuestions.map(q => (
                    <motion.div key={q.id} variants={STAGGER_ITEM}>
                      <Card className="overflow-hidden border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem] hover-lift transition-premium flex flex-col">
                        <div className="p-6">
                          <div className="flex justify-between items-start gap-6">
                            <div className="space-y-3 flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className={`text-[9px] px-2 h-5 font-normal uppercase tracking-widest border-none ${TYPE_BADGE_COLORS[q.type] || ''}`}>
                                {q.type}
                              </Badge>
                              <Badge variant="secondary" className="text-[9px] px-2 h-5 font-normal uppercase tracking-widest bg-muted/30">
                                {q.phase}
                              </Badge>
                              {q.passageText && (
                                <Badge variant="outline" className="text-[9px] px-2 h-5 font-normal uppercase tracking-widest border-primary/10 text-primary/60 gap-1">
                                  <BookOpen className="w-2.5 h-2.5" /> Passage
                                </Badge>
                              )}
                              {q.audioUrl && (
                                <Badge variant="outline" className="text-[9px] px-2 h-5 font-normal uppercase tracking-widest border-primary/10 text-primary/60 gap-1">
                                  <Volume2 className="w-2.5 h-2.5" /> Audio
                                </Badge>
                              )}
                            </div>

                            {/* Content */}
                            <p className="text-base text-foreground/80 leading-relaxed font-sans font-normal">{q.content}</p>

                            {/* Match pairs preview */}
                            {q.type === 'Matching' && q.matchPairs && (
                              <div className="space-y-1">
                                {(q.matchPairs as { left: string; right: string }[]).slice(0, 3).map((pair, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-sans bg-muted px-1.5 py-0.5 rounded text-[10px]">{pair.left}</span>
                                    <span className="text-muted-foreground/30 font-bold">::</span>
                                    <span className="font-sans bg-muted px-1.5 py-0.5 rounded text-[10px]">{pair.right}</span>
                                  </div>
                                ))}
                                {(q.matchPairs as any[]).length > 3 && (
                                  <p className="text-[10px] text-muted-foreground/50">+{(q.matchPairs as any[]).length - 3} more pairs</p>
                                )}
                              </div>
                            )}

                            {/* MCQ options */}
                            {q.type === 'MCQ' && q.options && (
                              <div className="flex flex-wrap gap-1">
                                {q.options.map((opt, i) => (
                                  <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${opt === q.correctAnswer ? 'bg-success/10 text-success ring-1 ring-success/20' : 'bg-muted text-muted-foreground'}`}>
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Image */}
                            {q.imageUrl && (
                              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-primary/5 mt-1">
                                <Image src={q.imageUrl} alt="Visual aid" fill className="object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-xl transition-premium">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-premium"
                              onClick={() => { deleteQuestion(q.id); toast.success('Question removed') }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </Tabs>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <Card className="border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem] overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5">
              <CardTitle className="text-[10px] uppercase tracking-widest font-normal opacity-60">Block Registry Intelligence</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-widest font-normal opacity-50">Total Blocks</span>
                <span className="text-3xl font-sans font-normal text-primary">{questions.length}</span>
              </div>
              <div className="pt-4 border-t border-primary/5 space-y-2.5">
                <p className="text-[8px] uppercase tracking-[0.2em] font-normal opacity-40">By Taxonomy</p>
                {TYPE_OPTIONS.map(t => {
                  const count = questions.filter((q: Question) => q.type === t.value).length
                  return count > 0 ? (
                    <div key={t.value} className="flex justify-between items-center group">
                      <span className="text-xs text-muted-foreground font-normal transition-colors group-hover:text-foreground">{t.value}</span>
                      <Badge variant="outline" className="h-4 px-1.5 text-[8px] border-primary/5 bg-primary/[0.02] font-normal">{count}</Badge>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
