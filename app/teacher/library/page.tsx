'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Question, QuestionCategory, WritingGenre, WRITING_SUBTYPES } from '@/lib/types'
import { ACADEMY_LEVELS } from '@/lib/registry'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Plus, Search, Trash2, Edit, X, Library as LibraryIcon, Volume2, BookOpen, Check, Play, Pause, FileText, CheckSquare, Sparkles, UploadCloud, Loader2, Square } from 'lucide-react'
import Image from 'next/image'

interface ParsedImportQuestion extends Question {
  selected: boolean
}

const subQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['MCQ', 'True/False', 'True/False/Not Given', 'Yes/No/Not Given', 'MultiSelect', 'Fill in the Blanks', 'Subjective', 'Matching']),
  content: z.string().min(1, 'Question text required'),
  points: z.number().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  maxSelections: z.number().optional(),
  matchPairs: z.array(z.object({ left: z.string(), right: z.string() })).optional(),
})

const questionSchema = z.object({
  category: z.string().min(1, 'Required'),
  type: z.enum(['MCQ', 'Subjective', 'True/False', 'True/False/Not Given', 'Yes/No/Not Given', 'MultiSelect', 'Fill in the Blanks', 'Writing', 'Speaking', 'Matching', 'Reading', 'Listening']),
  phase: z.enum(['First Test', 'Last Test', 'Both']),
  content: z.string().min(1, 'Required'),
  options: z.string().optional(),
  correctAnswer: z.string().optional(),
  imageUrl: z.string().optional(),
  passageText: z.string().optional(),
  passageTitle: z.string().optional(),
  speakingTitle: z.string().optional(),
  prepTimeSeconds: z.coerce.number().optional(),
  speakingTimeSeconds: z.coerce.number().optional(),
  audioUrl: z.string().optional(),
  subQuestions: z.array(subQuestionSchema).optional(),
  writingGenre: z.string().optional(),
  writingSubType: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  wordLimitMin: z.coerce.number().optional(),
  wordLimitMax: z.coerce.number().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  classLevel: z.string().optional(),
  isIeltsFormat: z.boolean().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

const CATEGORIES: QuestionCategory[] = ['Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']

const TYPE_OPTIONS = [
  { value: 'MCQ',                  label: 'Multiple Choice (MCQ)' },
  { value: 'True/False',           label: 'True / False' },
  { value: 'True/False/Not Given', label: 'IELTS True / False / Not Given' },
  { value: 'Yes/No/Not Given',     label: 'IELTS Yes / No / Not Given' },
  { value: 'MultiSelect',          label: 'IELTS Multi-Select (Choose X of N)' },
  { value: 'Fill in the Blanks',   label: 'Fill in the Blanks / Note Completion' },
  { value: 'Matching',             label: 'Column / Heading Matching' },
  { value: 'Writing',              label: 'Writing Prompt' },
  { value: 'Speaking',             label: 'Speaking Task' },
  { value: 'Reading',              label: 'Reading Question Set' },
  { value: 'Listening',            label: 'Listening Question Set' },
  { value: 'Subjective',           label: 'Subjective (Open)' },
]

const TYPE_BADGE_COLORS: Record<string, string> = {
  'MCQ':                ' bg-primary/5 text-primary',
  'True/False':         'border-success/20 bg-success/5 text-success',
  'Fill in the Blanks': 'border-warning/20 bg-warning/5 text-warning',
  'Writing':            'border-muted-foreground/20 bg-muted/50 text-muted-foreground',
  'Matching':           'border-accent/20 bg-accent/5 text-foreground',
  'Reading':            ' bg-primary/5 text-primary/70',
  'Listening':          ' bg-primary/5 text-primary/70',
  'Subjective':         'border-muted-foreground/20 bg-muted/30 text-muted-foreground',
}

const ensureStringArray = (val: any): string[] => {
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean)
  if (typeof val === 'string' && val.trim().length > 0) {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean)
    } catch {
      return val.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

const ensureMatchPairs = (val: any): { left: string; right: string }[] => {
  if (Array.isArray(val)) {
    return val.filter(item => item && typeof item === 'object').map(item => ({
      left: String(item.left || '').trim(),
      right: String(item.right || '').trim()
    }))
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item === 'object').map(item => ({
          left: String(item.left || '').trim(),
          right: String(item.right || '').trim()
        }))
      }
    } catch {
      return []
    }
  }
  return []
}

export default function QuestionLibraryPage() {
  const { user } = useAuth()
  const { questions, addQuestion, bulkAddQuestions, updateQuestion, deleteQuestion, deleteQuestionsByPhase, isInitialized, teachers, approveQuestion, audioFiles, courses } = useData()
  
  const currentTeacher = teachers.find(t => t.id === user?.id)
  const requiresReview = currentTeacher?.requiresReview ?? true
  
  const [activeTab, setActiveTab] = useState<QuestionCategory>('Grammar')
  const [searchQuery, setSearchQuery] = useState('')
  
  const teacherLevels = useMemo(() => {
    const myCourses = (courses || []).filter(c => c.teacherId === user?.id)
    return Array.from(new Set(myCourses.map(c => c.level))).sort()
  }, [courses, user?.id])

  const [levelFilter, setLevelFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')

  useEffect(() => {
    if (teacherLevels.length > 0 && !levelFilter) {
      setLevelFilter(teacherLevels[0])
    }
  }, [teacherLevels, levelFilter])
  const [isOpen, setIsOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deletePhase, setDeletePhase] = useState<'First Test' | 'Last Test' | 'Both' | null>(null)
  const [matchPairs, setMatchPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' },
  ])
  const [blankAnswers, setBlankAnswers] = useState<string[]>([])

  // Smart AI Document Importer State
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [parsedQuestions, setParsedQuestions] = useState<ParsedImportQuestion[]>([])
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload')
  const [isSavingBatch, setIsSavingBatch] = useState(false)

  const handleRunAIExtraction = async () => {
    if (!importText || importText.trim().length === 0) {
      toast.error('Please paste text or select a file first.')
      return
    }

    setIsExtracting(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await fetch('/api/teacher/import-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: importText,
          defaultClassLevel: levelFilter || teacherLevels[0] || 'Level 1',
          defaultPhase: phaseFilter !== 'all' ? phaseFilter : 'First Test',
          defaultCategory: activeTab
        })
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to parse document')
      }

      if (!data.questions || data.questions.length === 0) {
        toast.error('No questions could be extracted from this text.')
        return
      }

      const formatted: ParsedImportQuestion[] = data.questions.map((q: any, idx: number) => ({
        id: `import_${Date.now()}_${idx}`,
        category: q.category || activeTab,
        type: q.type || 'MCQ',
        phase: q.phase || 'First Test',
        difficulty: q.difficulty || 'Medium',
        classLevel: q.classLevel || levelFilter || teacherLevels[0] || 'Level 1',
        content: q.content || '',
        options: ensureStringArray(q.options),
        correctAnswer: q.correctAnswer || '',
        evaluationCriteria: q.evaluationCriteria || '',
        writingGenre: q.writingGenre || undefined,
        wordLimitMin: q.wordLimitMin || undefined,
        wordLimitMax: q.wordLimitMax || undefined,
        matchPairs: ensureMatchPairs(q.matchPairs),
        selected: true
      }))

      setParsedQuestions(formatted)
      setImportStep('preview')
      toast.success(`Successfully extracted ${formatted.length} questions!`)
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('Extraction error:', err)
      if (err.name === 'AbortError') {
        toast.error('Document processing timed out (exceeded 25s limit). Please try uploading a shorter section of the file.')
      } else {
        toast.error(err?.message || 'Error extracting questions. Please try again.')
      }
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    const isBinaryDocument = fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')

    if (isBinaryDocument) {
      setIsExtracting(true)
      toast.info(`Extracting text from ${file.name}...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('defaultClassLevel', levelFilter || teacherLevels[0] || 'Level 1')
        formData.append('defaultPhase', phaseFilter !== 'all' ? phaseFilter : 'First Test')
        formData.append('defaultCategory', activeTab)

        const response = await fetch('/api/teacher/import-questions', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await response.json()
        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to extract questions from document')
        }

        if (!data.questions || data.questions.length === 0) {
          toast.error('No questions could be extracted from this document.')
          return
        }

        const formatted: ParsedImportQuestion[] = data.questions.map((q: any, idx: number) => ({
          id: `import_${Date.now()}_${idx}`,
          category: q.category || activeTab,
          type: q.type || 'MCQ',
          phase: q.phase || 'First Test',
          difficulty: q.difficulty || 'Medium',
          classLevel: q.classLevel || levelFilter || teacherLevels[0] || 'Level 1',
          content: q.content || '',
          options: ensureStringArray(q.options),
          correctAnswer: q.correctAnswer || '',
          evaluationCriteria: q.evaluationCriteria || '',
          writingGenre: q.writingGenre || undefined,
          wordLimitMin: q.wordLimitMin || undefined,
          wordLimitMax: q.wordLimitMax || undefined,
          matchPairs: ensureMatchPairs(q.matchPairs),
          selected: true
        }))

        setParsedQuestions(formatted)
        setImportStep('preview')
        if (data.extractedTextSnippet) {
          setImportText(data.extractedTextSnippet)
        }
        toast.success(`Successfully extracted ${formatted.length} questions from ${file.name}!`)
      } catch (err: any) {
        console.error('File extraction error:', err)
        toast.error(err?.message || 'Error extracting document questions.')
      } finally {
        setIsExtracting(false)
      }
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          setImportText(content)
          toast.info(`Loaded text file: ${file.name}`)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleBatchSave = async () => {
    const selected = parsedQuestions.filter(q => q.selected)
    if (selected.length === 0) {
      toast.error('Please select at least one question to import.')
      return
    }

    setIsSavingBatch(true)
    try {
      const preparedQuestions: Question[] = selected.map(item => {
        const { selected: _, id: __, ...itemData } = item
        return {
          ...itemData,
          teacherId: user?.id || itemData.teacherId,
          isApproved: !requiresReview,
          options: ensureStringArray(itemData.options),
          matchPairs: ensureMatchPairs(itemData.matchPairs)
        } as Question
      })

      await bulkAddQuestions(preparedQuestions)
      toast.success(`Successfully added ${selected.length} questions to your library!`)
      setIsImportOpen(false)
      setImportStep('upload')
      setImportText('')
      setParsedQuestions([])
    } catch (err: any) {
      console.error('Batch save error:', err)
      toast.error('Failed to import questions.')
    } finally {
      setIsSavingBatch(false)
    }
  }

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
      defaultValues: { type: 'MCQ', phase: 'Both', difficulty: 'Medium' },
    })
  
  const [playingPreview, setPlayingPreview] = useState(false)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const selectedType = watch('type')
  const selectedCategory = watch('category')
  const imageUrl = watch('imageUrl')
  const correctAnswer = watch('correctAnswer')

  const filteredQuestions = (questions || []).filter((q: Question) => {
    const categoryMatch = q.category === activeTab
    const searchMatch = (q.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    const levelMatch = !levelFilter || q.classLevel === levelFilter
    const difficultyMatch = difficultyFilter === 'all' || (q.difficulty || 'Medium') === difficultyFilter
    const phaseMatch = phaseFilter === 'all' || q.phase === phaseFilter || (q.phase === 'Both' && (phaseFilter === 'First Test' || phaseFilter === 'Last Test'))
    return categoryMatch && searchMatch && levelMatch && difficultyMatch && phaseMatch
  })

  const classBasedStats = useMemo(() => {
    const stats: Record<string, { total: number; types: Record<string, number> }> = {}
    
    questions.forEach((q: Question) => {
      const level = q.classLevel || 'Unassigned'
      if (!stats[level]) {
        stats[level] = { total: 0, types: {} }
      }
      stats[level].total++
      stats[level].types[q.type] = (stats[level].types[q.type] || 0) + 1
    })
    
    return stats
  }, [questions])

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleClose = () => {
    setIsOpen(false)
    setEditingQuestion(null)
    reset({
      category: activeTab,
      type: 'MCQ',
      phase: 'Both',
      difficulty: 'Medium',
      content: '',
      options: '',
      correctAnswer: '',
      imageUrl: '',
      passageText: '',
      audioUrl: '',
      writingGenre: undefined,
      writingSubType: undefined,
      evaluationCriteria: '',
      wordLimitMin: undefined,
      wordLimitMax: undefined,
      classLevel: undefined
    })
    setMatchPairs([{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }])
    setBlankAnswers([])
  }

  const handleEdit = (q: Question) => {
    setEditingQuestion(q)
    setValue('category', q.category)
    setValue('type', q.type as any)
    setValue('phase', q.phase as any)
    setValue('difficulty', q.difficulty as any)
    setValue('content', q.content)
    setValue('options', q.options?.join(', ') || '')
    setValue('correctAnswer', q.correctAnswer || '')
    setValue('imageUrl', q.imageUrl || '')
    setValue('passageText', q.passageText || '')
    setValue('passageTitle', q.passageTitle || '')
    setValue('speakingTitle', q.speakingTitle || '')
    setValue('prepTimeSeconds', q.prepTimeSeconds || 30)
    setValue('speakingTimeSeconds', q.speakingTimeSeconds || 60)
    setValue('subQuestions', q.subQuestions || [])
    setValue('audioUrl', q.audioUrl || '')
    setValue('writingGenre', q.writingGenre)
    setValue('writingSubType', q.writingSubType)
    setValue('evaluationCriteria', q.evaluationCriteria || '')
    setValue('wordLimitMin', q.wordLimitMin)
    setValue('wordLimitMax', q.wordLimitMax)
    setValue('classLevel', q.classLevel || undefined)
    
    if (q.type === 'Matching' && q.matchPairs) {
      setMatchPairs(q.matchPairs as any)
    }
    
    let parsedBlankAnswers: string[] = []
    if (q.type === 'Fill in the Blanks' || ((q.type === 'Reading' || q.type === 'Listening') && q.content?.includes('____'))) {
      try {
        parsedBlankAnswers = JSON.parse(q.correctAnswer || '[]')
        if (!Array.isArray(parsedBlankAnswers)) parsedBlankAnswers = [q.correctAnswer || '']
      } catch {
        parsedBlankAnswers = [q.correctAnswer || '']
      }
    }
    setBlankAnswers(parsedBlankAnswers)
    
    setIsOpen(true)
  }

  const updatePair = (i: number, field: 'left' | 'right', val: string) =>
    setMatchPairs(prev => prev?.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  const onSubmit = async (data: QuestionFormValues) => {
    const validPairs = matchPairs?.filter(p => p.left.trim() && p.right.trim())
    if (data.type === 'Matching' && validPairs.length < 2) {
      toast.error('Add at least 2 complete pairs for a Matching question.')
      return
    }

    const contentValue = data.content || ''
    const isCloze = contentValue.includes('____')
    const isMultiBlankType = data.type === 'Fill in the Blanks' || ((data.type === 'Reading' || data.type === 'Listening') && isCloze)
    
    let finalCorrectAnswer = data.correctAnswer || ''
    if (isMultiBlankType) {
      const blankCount = Math.max(1, (contentValue.match(/_{3,}/g) || []).length)
      finalCorrectAnswer = JSON.stringify(blankAnswers.slice(0, blankCount))
    }

    const questionData: Question = {
      id: editingQuestion ? editingQuestion.id : Math.random().toString(36).substr(2, 9),
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
      correctAnswer: finalCorrectAnswer,
      imageUrl: data.imageUrl || undefined,
      passageText: data.passageText || undefined,
      passageTitle: data.passageTitle || undefined,
      speakingTitle: data.type === 'Speaking' ? data.speakingTitle : undefined,
      prepTimeSeconds: data.type === 'Speaking' ? data.prepTimeSeconds : undefined,
      speakingTimeSeconds: data.type === 'Speaking' ? data.speakingTimeSeconds : undefined,
      subQuestions: data.subQuestions || undefined,
      audioUrl: data.audioUrl || undefined,
      matchPairs: data.type === 'Matching' ? validPairs : undefined,
      writingGenre: data.type === 'Writing' ? (data.writingGenre as WritingGenre) : undefined,
      writingSubType: data.type === 'Writing' ? data.writingSubType : undefined,
      evaluationCriteria: data.type === 'Writing' ? data.evaluationCriteria : undefined,
      wordLimitMin: data.type === 'Writing' ? data.wordLimitMin : undefined,
      wordLimitMax: data.type === 'Writing' ? data.wordLimitMax : undefined,
      isApproved: editingQuestion ? editingQuestion.isApproved : !requiresReview,
      teacherId: user.id,
      difficulty: data.difficulty as any,
      classLevel: data.classLevel
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, questionData)
        toast.success('Question updated successfully')
      } else {
        await addQuestion(questionData)
        toast.success('Question added to your bank')
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save question:', error)
    }
  };

  const handleBulkDelete = async () => {
    if (!deletePhase) return;
    try {
      await deleteQuestionsByPhase(deletePhase, levelFilter || undefined)
      toast.success(`${deletePhase === 'Both' ? 'All' : deletePhase} blocks deleted successfully for this class`)
    } catch (error) {
      toast.error('Failed to clear bank')
    } finally {
      setDeletePhase(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground font-medium">My Question Bank</h1>
          <p className="text-muted-foreground mt-1 text-sm opacity-70">
            Manage your private repository of {CATEGORIES.length} academic categories.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Smart AI Document Importer Button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setImportStep('upload')
              setIsImportOpen(true)
            }} 
            className="hover-lift border-primary/20 bg-primary/5 text-primary gap-1.5 h-10 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Import Document</span>
          </Button>

          {/* AI Import Modal Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
              <DialogHeader className="bg-muted/10 border-b p-6 text-left">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-serif font-medium">
                      Smart AI Document Importer
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Upload a test document (.docx, .pdf, .txt, .csv) or paste exam text to automatically extract and format questions into your bank.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {importStep === 'upload' ? (
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors rounded-2xl p-6 text-center bg-primary/5 space-y-3">
                    <UploadCloud className="w-10 h-10 mx-auto text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload Test Document or File</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Supports .txt, .csv, .docx, .pdf text files</p>
                    </div>
                    <label className="inline-flex cursor-pointer">
                      <input 
                        type="file" 
                        accept=".txt,.csv,.doc,.docx,.pdf" 
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                      <span className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                        Choose File
                      </span>
                    </label>
                  </div>

                  <div className="relative flex items-center gap-2 my-2">
                    <div className="flex-1 border-t"></div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">or paste text directly</span>
                    <div className="flex-1 border-t"></div>
                  </div>

                  <Textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={7}
                    placeholder="Paste raw exam text, multiple choice questions, or writing prompts here... e.g.:&#10;1. Which word is a noun?&#10;A) Run B) Quick C) Happiness D) Gently&#10;Answer: C"
                    className="text-xs font-mono resize-none rounded-xl"
                  />

                  <DialogFooter className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportOpen(false)} className="rounded-xl text-xs">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRunAIExtraction} 
                      disabled={isExtracting || !importText.trim()}
                      className="rounded-xl text-xs gap-2"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                          <span>AI Extracting Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                          <span>Extract & Structure Questions</span>
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Master Controls Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/20 rounded-xl border">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5 font-medium px-2"
                        onClick={() => {
                          const allSelected = parsedQuestions.every(q => q.selected)
                          setParsedQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })))
                        }}
                      >
                        {parsedQuestions.every(q => q.selected) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span>
                          {parsedQuestions.every(q => q.selected) ? 'Deselect All' : 'Select All'}
                        </span>
                      </Button>

                      <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-none">
                        {parsedQuestions.filter(q => q.selected).length} of {parsedQuestions.length} Selected
                      </Badge>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setImportStep('upload')}
                      className="text-xs text-muted-foreground hover:text-foreground h-8"
                    >
                      ← Edit Text / Upload Again
                    </Button>
                  </div>

                  {/* Extracted Questions Preview List */}
                  <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1 premium-scrollbar">
                    {parsedQuestions.map((q, idx) => (
                      <div 
                        key={q.id} 
                        className={`p-4 border rounded-xl space-y-3 transition-all ${
                          q.selected ? 'bg-card border-primary/20 shadow-xs' : 'bg-muted/20 opacity-60 border-dashed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                setParsedQuestions(prev => prev.map(item => item.id === q.id ? { ...item, selected: !item.selected } : item))
                              }}
                              className="focus:outline-hidden"
                            >
                              {q.selected ? (
                                <CheckSquare className="w-4 h-4 text-primary" />
                              ) : (
                                <Square className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>

                            <Select 
                              value={q.type} 
                              onValueChange={(val) => {
                                setParsedQuestions(prev => prev.map(item => item.id === q.id ? { ...item, type: val as any } : item))
                              }}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-24 bg-muted/30 border-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['MCQ', 'True/False', 'Matching', 'Fill in the Blanks', 'Subjective', 'Writing'].map(t => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select 
                              value={q.difficulty || 'Medium'} 
                              onValueChange={(val) => {
                                setParsedQuestions(prev => prev.map(item => item.id === q.id ? { ...item, difficulty: val as any } : item))
                              }}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-20 bg-muted/30 border-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy" className="text-xs">Easy</SelectItem>
                                <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                                <SelectItem value="Hard" className="text-xs">Hard</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select 
                              value={q.phase || 'First Test'} 
                              onValueChange={(val) => {
                                setParsedQuestions(prev => prev.map(item => item.id === q.id ? { ...item, phase: val as any } : item))
                              }}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-24 bg-muted/30 border-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="First Test" className="text-xs">First Test</SelectItem>
                                <SelectItem value="Last Test" className="text-xs">Last Test</SelectItem>
                                <SelectItem value="Both" className="text-xs">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-destructive/70 hover:text-destructive"
                            onClick={() => {
                              setParsedQuestions(prev => prev.filter(item => item.id !== q.id))
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Editable Question Content Prompt */}
                        <Textarea
                          value={q.content}
                          onChange={(e) => {
                            const val = e.target.value
                            setParsedQuestions(prev => prev.map(item => item.id === q.id ? { ...item, content: val } : item))
                          }}
                          rows={2}
                          className="text-xs resize-none bg-muted/10 border-primary/5 rounded-lg"
                        />

                        {/* Options / Answer Keys Preview */}
                        {q.type === 'MCQ' && q.options && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <Input
                                key={oIdx}
                                value={opt}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setParsedQuestions(prev => prev.map(item => {
                                    if (item.id !== q.id) return item
                                    const opts = [...(item.options || [])]
                                    opts[oIdx] = val
                                    return { ...item, options: opts }
                                  }))
                                }}
                                className={`h-7 text-xs ${opt === q.correctAnswer ? 'border-success/40 bg-success/5 font-medium' : 'bg-muted/10'}`}
                              />
                            ))}
                          </div>
                        )}

                        {q.evaluationCriteria && (
                          <div className="text-[11px] p-2 bg-primary/5 border border-primary/10 rounded-lg space-y-1">
                            <span className="font-bold text-primary block text-[10px] uppercase">AI Evaluation Rubric:</span>
                            <p className="text-foreground/80 leading-normal">{q.evaluationCriteria}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="pt-2 flex justify-between items-center border-t">
                    <Button variant="outline" onClick={() => setIsImportOpen(false)} className="rounded-xl text-xs">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBatchSave} 
                      disabled={isSavingBatch || parsedQuestions.filter(q => q.selected).length === 0}
                      className="rounded-xl text-xs gap-2"
                    >
                      {isSavingBatch ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                          <span>Importing Questions...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-primary-foreground" />
                          <span>Confirm & Import Selected ({parsedQuestions.filter(q => q.selected).length})</span>
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); else setIsOpen(true) }}>
            <DialogTrigger asChild>
              <Button className="hover-lift rounded-xl h-10">
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-xs font-normal">Add Question</span>
              </Button>
            </DialogTrigger>

          <DialogContent className="max-w-xl p-0 overflow-hidden   ">
            <DialogHeader className="bg-muted/5 border-b  p-6 text-left items-start">
              <DialogTitle className="text-xl font-serif font-normal">
                {editingQuestion ? 'Edit Question Block' : 'Add to Library'}
              </DialogTitle>
              <DialogDescription className="text-xs opacity-60">
                {editingQuestion ? 'Update this pedagogical block in your institutional repository.' : 'Fields adapt to the selected block type for institutional precision.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 max-h-[min(500px,50vh)] overflow-y-auto space-y-4 premium-scrollbar">
                <FieldGroup className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 items-stretch">
                    <Field>
                      <FieldLabel className="text-xs   opacity-60">Category</FieldLabel>
                      <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                        <SelectTrigger className="h-10 text-sm "><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent className="">
                          {CATEGORIES?.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-xs text-destructive font-normal   mt-1 opacity-80">{errors.category.message}</p>}
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs   opacity-60">Phase</FieldLabel>
                      <Select defaultValue="Both" onValueChange={(v) => setValue('phase', v as any)}>
                        <SelectTrigger className="h-10 text-sm "><SelectValue /></SelectTrigger>
                        <SelectContent className="">
                          <SelectItem value="First Test" className="text-sm">First Test</SelectItem>
                          <SelectItem value="Last Test" className="text-sm">Last Test</SelectItem>
                          <SelectItem value="Both" className="text-sm">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs   opacity-60">Difficulty</FieldLabel>
                      <Select defaultValue="Medium" onValueChange={(v) => setValue('difficulty', v as any)}>
                        <SelectTrigger className="h-10 text-sm "><SelectValue /></SelectTrigger>
                        <SelectContent className="">
                          <SelectItem value="Easy" className="text-sm">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-sm">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-sm">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  
                  <Field>
                    <FieldLabel className="text-xs opacity-60">Target Academic Level</FieldLabel>
                    <Select value={watch('classLevel')} onValueChange={(v) => setValue('classLevel', v)}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder={teacherLevels.length > 0 ? "Select Level" : "No Classes Assigned"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherLevels.map(level => (
                          <SelectItem key={level} value={level} className="text-sm">{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs">Question Type</FieldLabel>
                    <Select defaultValue="MCQ" onValueChange={(v) => setValue('type', v as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS?.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  {selectedType === 'Speaking' && (
                    <div className="space-y-4 pt-2 border-t border-primary/10">
                      <Field>
                        <FieldLabel className="text-xs flex items-center gap-1.5 font-bold">
                          <Volume2 className="w-3.5 h-3.5 text-primary" /> Speaking Topic / Prompt Title
                        </FieldLabel>
                        <Input
                          {...register('speakingTitle')}
                          className="h-10 text-xs font-serif font-semibold bg-primary/5 border-primary/20"
                          placeholder="e.g., Describe a Memorable Trip or Event"
                        />
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel className="text-xs opacity-70 font-semibold">Preparation Time (Seconds)</FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            max={300}
                            defaultValue={30}
                            {...register('prepTimeSeconds')}
                            className="h-9 text-xs"
                            placeholder="30"
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs opacity-70 font-semibold">Speaking Time Limit (Seconds)</FieldLabel>
                          <Input
                            type="number"
                            min={10}
                            max={600}
                            defaultValue={60}
                            {...register('speakingTimeSeconds')}
                            className="h-9 text-xs"
                            placeholder="60"
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel className="text-xs flex items-center gap-1.5 font-semibold">
                          Evaluation Rubric / Focus Criteria (for AI Auditor)
                        </FieldLabel>
                        <Textarea
                          {...register('evaluationCriteria')}
                          rows={3}
                          className="text-xs resize-none bg-muted/10 p-3"
                          placeholder="e.g., Check for clear pronunciation, rich vocabulary, logical cohesion, and minimal hesitations."
                        />
                      </Field>
                    </div>
                  )}

                  {(selectedCategory === 'Reading' || selectedType === 'Reading') && (
                    <div className="space-y-4 pt-2 border-t border-primary/10">
                      <Field>
                        <FieldLabel className="text-xs flex items-center gap-1.5 font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-primary" /> Reading Passage Title
                        </FieldLabel>
                        <Input
                          {...register('passageTitle')}
                          className="h-10 text-xs font-serif font-semibold bg-primary/5"
                          placeholder="e.g., The Future of Renewable Energy"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs flex items-center gap-1.5 font-bold">
                          <FileText className="w-3.5 h-3.5 text-primary" /> Reading Passage Text
                        </FieldLabel>
                        <Textarea
                          {...register('passageText')}
                          rows={6}
                          className="text-xs resize-y bg-primary/5 font-serif leading-relaxed"
                          placeholder="Paste the full reading passage here. Students read this before answering."
                        />
                      </Field>
                    </div>
                  )}

                  {/* Sub-Questions Builder for Reading and Listening */}
                  {(selectedCategory === 'Reading' || selectedCategory === 'Listening') && (
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                              Comprehension Sub-Questions
                            </label>
                            {(() => {
                              const subs = watch('subQuestions') || []
                              const totalPts = subs.reduce((sum, sq) => sum + (sq.points || (sq.type === 'Subjective' ? 3 : 1)), 0)
                              return subs.length > 0 ? (
                                <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                                  Total: {totalPts} {totalPts === 1 ? 'Mark' : 'Marks'}
                                </Badge>
                              ) : null
                            })()}
                          </div>
                          <p className="text-[10px] text-muted-foreground">Attach multiple questions (MCQ, True/False, Blanks, Subjective) under this passage/audio with custom marks.</p>
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
                                points: 1,
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
                                    <div className="flex items-center gap-1 bg-muted/30 border px-2 py-0.5 rounded-lg">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Marks:</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={sq.points !== undefined ? sq.points : (sq.type === 'Subjective' ? 3 : 1)}
                                        onChange={(e) => {
                                          const updated = [...subs]
                                          updated[sIdx].points = Math.max(1, parseInt(e.target.value) || 1)
                                          setValue('subQuestions', updated)
                                        }}
                                        className="w-10 text-xs font-bold bg-transparent border-none outline-none text-right focus:ring-0 p-0"
                                      />
                                    </div>

                                    <Select
                                       value={sq.type}
                                       onValueChange={(newType: any) => {
                                         const updated = [...subs]
                                         const defaultPts = newType === 'Subjective' ? 3 : 1
                                         updated[sIdx] = { 
                                           ...sq, 
                                           type: newType, 
                                           points: defaultPts, 
                                           options: (newType === 'MCQ' || newType === 'MultiSelect') ? ['', '', '', '', ''] : sq.options,
                                           maxSelections: newType === 'MultiSelect' ? 2 : undefined
                                         }
                                         setValue('subQuestions', updated)
                                       }}
                                     >
                                       <SelectTrigger className="h-7 text-[10px] w-36">
                                         <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                         <SelectItem value="True/False">True / False</SelectItem>
                                         <SelectItem value="True/False/Not Given">True / False / Not Given</SelectItem>
                                         <SelectItem value="Yes/No/Not Given">Yes / No / Not Given</SelectItem>
                                         <SelectItem value="MultiSelect">Multi-Select (Choose X)</SelectItem>
                                         <SelectItem value="Fill in the Blanks">Fill in Blanks / Note</SelectItem>
                                         <SelectItem value="Matching">Matching Items</SelectItem>
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
                                <Textarea
                                  placeholder={`Enter Question #${sIdx + 1} text (supports line breaks and bullet points)...`}
                                  value={sq.content}
                                  onChange={(e) => {
                                    const updated = [...subs]
                                    updated[sIdx].content = e.target.value
                                    setValue('subQuestions', updated)
                                  }}
                                  rows={3}
                                  className="text-xs bg-background/80 font-serif leading-relaxed resize-y p-3"
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

                                {/* True/False/Not Given Options */}
                                {sq.type === 'True/False/Not Given' && (
                                  <div className="flex gap-4 items-center text-xs pt-1">
                                    <span className="text-muted-foreground text-[10px]">Correct Answer:</span>
                                    {['TRUE', 'FALSE', 'NOT GIVEN'].map(tf => (
                                      <label key={tf} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`tfng_${sq.id}`}
                                          checked={sq.correctAnswer === tf}
                                          onChange={() => {
                                            const updated = [...subs]
                                            updated[sIdx].correctAnswer = tf
                                            setValue('subQuestions', updated)
                                          }}
                                        />
                                        <span className="font-semibold">{tf}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {/* Yes/No/Not Given Options */}
                                {sq.type === 'Yes/No/Not Given' && (
                                  <div className="flex gap-4 items-center text-xs pt-1">
                                    <span className="text-muted-foreground text-[10px]">Correct Answer:</span>
                                    {['YES', 'NO', 'NOT GIVEN'].map(tf => (
                                      <label key={tf} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`yng_${sq.id}`}
                                          checked={sq.correctAnswer === tf}
                                          onChange={() => {
                                            const updated = [...subs]
                                            updated[sIdx].correctAnswer = tf
                                            setValue('subQuestions', updated)
                                          }}
                                        />
                                        <span className="font-semibold">{tf}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {/* MultiSelect Options & Config */}
                                {sq.type === 'MultiSelect' && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-muted-foreground">Select Max Allowed Answers:</span>
                                      <input
                                        type="number"
                                        min="2"
                                        max="5"
                                        value={sq.maxSelections || 2}
                                        onChange={(e) => {
                                          const updated = [...subs]
                                          updated[sIdx].maxSelections = parseInt(e.target.value) || 2
                                          setValue('subQuestions', updated)
                                        }}
                                        className="w-12 h-6 text-xs font-bold border rounded px-1"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {['A', 'B', 'C', 'D', 'E'].map((optKey, oIdx) => (
                                        <Input
                                          key={optKey}
                                          placeholder={`Option ${optKey}`}
                                          value={(sq.options || [])[oIdx] || ''}
                                          onChange={(e) => {
                                            const updated = [...subs]
                                            const opts = [...(updated[sIdx].options || ['', '', '', '', ''])]
                                            opts[oIdx] = e.target.value
                                            updated[sIdx].options = opts
                                            setValue('subQuestions', updated)
                                          }}
                                          className="h-8 text-xs bg-muted/10"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Multi-Blank Answer Key Input for Reading/Listening Fill in the Blanks */}
                                {sq.type === 'Fill in the Blanks' && (selectedCategory === 'Reading' || selectedCategory === 'Listening') && sq.content.includes('____') ? (
                                  <div className="space-y-2 pt-1 border-t border-primary/10">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                        Answer Keys ({Math.max(1, (sq.content.match(/_{3,}/g) || []).length)} Blanks Detected — 1 Mark Each)
                                      </span>
                                    </div>
                                    <div className="grid gap-2">
                                      {Array.from({ length: Math.max(1, (sq.content.match(/_{3,}/g) || []).length) }).map((_, bIdx) => {
                                        let currentBlanks: string[] = []
                                        try {
                                          currentBlanks = JSON.parse(sq.correctAnswer || '[]')
                                          if (!Array.isArray(currentBlanks)) currentBlanks = [sq.correctAnswer || '']
                                        } catch {
                                          currentBlanks = (sq.correctAnswer || '').split(';').map(s => s.trim())
                                        }

                                        return (
                                          <div key={bIdx} className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0">
                                              Blank #{bIdx + 1}:
                                            </span>
                                            <Input
                                              placeholder={`Acceptable answers for Blank #${bIdx + 1} (e.g. Kings / King's)...`}
                                              value={currentBlanks[bIdx] || ''}
                                              onChange={(e) => {
                                                const updated = [...subs]
                                                const blankCount = Math.max(1, (sq.content.match(/_{3,}/g) || []).length)
                                                const newBlanks = [...currentBlanks]
                                                newBlanks[bIdx] = e.target.value
                                                updated[sIdx].correctAnswer = JSON.stringify(newBlanks.slice(0, blankCount))
                                                updated[sIdx].points = blankCount // Auto-set 1 Mark per blank
                                                setValue('subQuestions', updated)
                                              }}
                                              className="h-8 text-xs bg-success/5 border-success/20 font-semibold flex-1"
                                            />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : sq.type !== 'True/False' && sq.type !== 'True/False/Not Given' && sq.type !== 'Yes/No/Not Given' && (
                                  <Input
                                    placeholder={
                                      sq.type === 'Subjective' ? "Reference Model Answer (for AI evaluation)..." :
                                      sq.type === 'MultiSelect' ? "Correct Answers (comma separated, e.g. B, C)..." :
                                      sq.type === 'Fill in the Blanks' ? "Acceptable answers (separated by slash, e.g. 125 / $125)..." :
                                      "Correct Answer..."
                                    }
                                    value={sq.correctAnswer || ''}
                                    onChange={(e) => {
                                      const updated = [...subs]
                                      updated[sIdx].correctAnswer = e.target.value
                                      setValue('subQuestions', updated)
                                    }}
                                    className="h-8 text-xs bg-success/5 border-success/20 font-semibold"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {selectedCategory === 'Listening' && (
                    <Field>
                      <FieldLabel className="text-xs flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3" /> Institutional Audio Library
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Select value={watch('audioUrl')} onValueChange={(v) => setValue('audioUrl', v)}>
                          <SelectTrigger className="h-10 text-xs flex-1">
                            <SelectValue placeholder="Select from your library..." />
                          </SelectTrigger>
                          <SelectContent>
                            {audioFiles?.length > 0 ? (
                              audioFiles.map(f => (
                                <SelectItem key={f.id} value={f.url} className="text-xs">
                                  {f.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled className="text-xs">No assets found in library</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {watch('audioUrl') && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 shrink-0"
                            onClick={() => {
                              if (playingPreview) {
                                previewAudioRef.current?.pause()
                                setPlayingPreview(false)
                              } else {
                                if (previewAudioRef.current) {
                                  previewAudioRef.current.src = watch('audioUrl') || ''
                                  previewAudioRef.current.play()
                                  setPlayingPreview(true)
                                }
                              }
                            }}
                          >
                            {playingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                      <audio ref={previewAudioRef} onEnded={() => setPlayingPreview(false)} className="hidden" />
                      {!audioFiles?.length && (
                        <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
                          Your audio vault is empty. Please add assets in the <Link href="/teacher/audio-library" className="text-primary hover:underline">Audio Library</Link> first.
                        </p>
                      )}
                    </Field>
                  )}

                  {selectedType === 'Writing' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 items-stretch">
                        <Field>
                          <FieldLabel className="text-xs flex items-center gap-1">
                            <FileText className="w-3 h-3 text-primary" /> Writing Genre
                          </FieldLabel>
                          <Select 
                            value={watch('writingGenre') || ''} 
                            onValueChange={(v) => {
                              setValue('writingGenre', v)
                              setValue('writingSubType', '')
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Genre..." /></SelectTrigger>
                            <SelectContent>
                              {Object.keys(WRITING_SUBTYPES).map((genre) => (
                                <SelectItem key={genre} value={genre} className="text-xs">{genre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs flex items-center gap-1">
                            Writing Sub-Type / Style
                          </FieldLabel>
                          <Select 
                            value={watch('writingSubType') || ''} 
                            onValueChange={(v) => setValue('writingSubType', v)}
                            disabled={!watch('writingGenre')}
                          >
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={watch('writingGenre') ? "Select Sub-type..." : "Pick genre first"} /></SelectTrigger>
                            <SelectContent>
                              {watch('writingGenre') && WRITING_SUBTYPES[watch('writingGenre') as WritingGenre]?.map((sub) => (
                                <SelectItem key={sub} value={sub} className="text-xs">{sub}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-stretch">
                        <Field>
                          <FieldLabel className="text-xs">Min Target Words</FieldLabel>
                          <Input 
                            type="number" 
                            {...register('wordLimitMin')} 
                            className="h-8 text-xs" 
                            placeholder="e.g. 150" 
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">Max Target Words</FieldLabel>
                          <Input 
                            type="number" 
                            {...register('wordLimitMax')} 
                            className="h-8 text-xs" 
                            placeholder="e.g. 250" 
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel className="text-xs flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-primary" /> Evaluation Criteria ("Things to Look For")
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">Shown to students & AI grader</span>
                        </FieldLabel>

                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {[
                            'Proper Structure & Paragraphing',
                            'Formal Tone & Register',
                            'Salutation & Sign-off',
                            'Required Key Points',
                            'Vocabulary & Grammar'
                          ].map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const current = watch('evaluationCriteria') || ''
                                if (current.includes(tag)) return
                                const updated = current ? `${current}\n- ${tag}` : `- ${tag}`
                                setValue('evaluationCriteria', updated)
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>

                        <Textarea
                          {...register('evaluationCriteria')}
                          rows={3}
                          className="text-xs resize-none"
                          placeholder="List key elements, required points, structure guidelines, or style requirements students must demonstrate..."
                        />
                      </Field>
                    </>
                  )}

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
                    {errors.content && <p className="text-xs text-destructive  mt-0.5">{errors.content.message}</p>}
                  </Field>

                  {selectedCategory !== 'Listening' && (
                    <Field>
                      <FieldLabel className="text-xs">Visual Aid (Optional)</FieldLabel>
                      {imageUrl ? (
                        <div className="relative w-full h-24  overflow-hidden border">
                          <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={() => setValue('imageUrl', '')}
                            className="absolute top-1 right-1 bg-destructive text-white p-0.5  shadow">
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

                  {selectedType === 'MCQ' && (
                    <Field>
                      <FieldLabel className="text-xs">Options (comma-separated)</FieldLabel>
                      <Input {...register('options')} className="h-8 text-xs" placeholder="Option A, Option B, Option C, Option D" />
                    </Field>
                  )}

                  {selectedType === 'Matching' && (
                    <Field>
                      <FieldLabel className="text-xs">Match Pairs</FieldLabel>
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-[1fr_1fr_20px] gap-1.5 px-0.5 items-stretch">
                          <span className="text-xs    text-muted-foreground/60">Column A</span>
                          <span className="text-xs    text-muted-foreground/60">Column B</span>
                          <span />
                        </div>
                        {matchPairs?.map((pair, i) => (
                          <div key={i} className="grid grid-cols-[1fr_1fr_20px] gap-1.5 items-center items-stretch">
                            <Input value={pair.left} onChange={e => updatePair(i, 'left', e.target.value)}
                              className="h-7 text-xs" placeholder={`Term ${i + 1}`} />
                            <Input value={pair.right} onChange={e => updatePair(i, 'right', e.target.value)}
                              className="h-7 text-xs" placeholder={`Match ${i + 1}`} />
                            <button type="button" onClick={() => setMatchPairs(p => p?.filter((_, idx) => idx !== i))}
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

                  {(selectedType === 'MCQ' || selectedType === 'True/False' || selectedType === 'Fill in the Blanks' || ((selectedType === 'Reading' || selectedType === 'Listening') && (watch('content') || '').includes('____'))) && (
                    <Field>
                      <FieldLabel className="text-xs">Correct Answer</FieldLabel>
                      {selectedType === 'True/False' ? (
                        <div className="grid grid-cols-2 gap-2 items-stretch">
                          {['True', 'False'].map(opt => (
                            <button key={opt} type="button" onClick={() => setValue('correctAnswer', opt)}
                              className={`h-8  border-2 text-xs  transition-premium ${correctAnswer === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : selectedType === 'Fill in the Blanks' || ((selectedType === 'Reading' || selectedType === 'Listening') && (watch('content') || '').includes('____')) ? (
                        <div className="space-y-2">
                          {Array.from({ length: Math.max(1, (watch('content') || '').match(/_{3,}/g)?.length || 1) }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs font-medium w-16 text-muted-foreground">Blank {i + 1}</span>
                              <Input 
                                value={blankAnswers[i] || ''} 
                                onChange={e => {
                                  const newAnswers = [...blankAnswers]
                                  newAnswers[i] = e.target.value
                                  setBlankAnswers(newAnswers)
                                }} 
                                className="h-8 text-xs flex-1" 
                                placeholder={`Exact answer for blank ${i + 1}`} 
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input {...register('correctAnswer')} className="h-8 text-xs" placeholder="Exact correct answer" />
                      )}
                    </Field>
                  )}

                  {(selectedType === 'Subjective' || selectedType === 'Writing') && (
                    <Field>
                      <FieldLabel className="text-xs flex items-center gap-1.5">
                        Reference / Expected Answer Key
                        <span className="text-[10px] text-primary/50 font-normal normal-case">(AI Rubric — used to guide marking)</span>
                      </FieldLabel>
                      <Textarea
                        {...register('correctAnswer')}
                        rows={3}
                        className="text-xs resize-none"
                        placeholder={
                          selectedType === 'Writing'
                            ? 'Describe the key points, arguments, and structure expected in a full mark answer...'
                            : 'Describe the key concepts, facts, and terminology expected in a correct answer...'
                        }
                      />
                      <p className="text-[10px] text-muted-foreground opacity-50 mt-0.5">
                        The AI evaluator uses this as a rubric. Semantically similar answers — even with different wording — will receive full marks.
                      </p>
                    </Field>
                  )}
                </FieldGroup>
              </div>

              <DialogFooter className="bg-muted/5 border-t  p-6 mt-0 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  <span className="text-xs   font-normal">Cancel</span>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <span className="text-xs   font-normal">
                    {isSubmitting ? (editingQuestion ? 'Saving...' : 'Adding...') : (editingQuestion ? 'Save Changes' : 'Add Block')}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_200px] items-stretch">
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuestionCategory)}>
            {/* 2-Tier Responsive Control Toolbar */}
            <div className="mt-4 space-y-3">
              {/* Row 1: Primary Scope (Search + Category Select) */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
                  <Input 
                    placeholder={`Search in ${activeTab}...`} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-9 h-11 text-sm transition-premium focus:ring-1 focus:ring-primary/20 rounded-xl" 
                  />
                </div>
                <Select value={activeTab} onValueChange={(v) => setActiveTab(v as QuestionCategory)}>
                  <SelectTrigger className="h-11 w-full sm:w-52 text-xs font-medium bg-card border-primary/10 rounded-xl shadow-sm shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-muted-foreground font-normal">Category:</span>
                      <SelectValue>{activeTab}</SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES?.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Secondary Attribute Refinement Filters & Clear Bank */}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="h-11 flex-1 sm:flex-none sm:w-44 text-xs bg-muted/10 border-primary/5 rounded-xl">
                    <SelectValue placeholder={teacherLevels.length > 0 ? "Select Level" : "No Classes"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherLevels.map(level => (
                      <SelectItem key={level} value={level} className="text-xs">{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="h-11 flex-1 sm:flex-none sm:w-36 text-xs bg-muted/10 border-primary/5 rounded-xl">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs font-medium">All Difficulties</SelectItem>
                    <SelectItem value="Easy" className="text-xs">Easy</SelectItem>
                    <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                    <SelectItem value="Hard" className="text-xs">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="h-11 flex-1 sm:flex-none sm:w-36 text-xs bg-muted/10 border-primary/5 rounded-xl">
                    <SelectValue placeholder="Test Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs font-medium">All Tests</SelectItem>
                    <SelectItem value="First Test" className="text-xs">First Test</SelectItem>
                    <SelectItem value="Last Test" className="text-xs">Last Test</SelectItem>
                    <SelectItem value="Both" className="text-xs">Both Tests</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 border-destructive/20 text-destructive hover:bg-destructive/10 shrink-0 shadow-sm rounded-xl px-3 text-xs ml-auto">
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Clear Bank
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setDeletePhase('First Test')} className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      Delete First Test blocks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletePhase('Last Test')} className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      Delete Last Test blocks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletePhase('Both')} className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      Delete All blocks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <AlertDialog open={!!deletePhase} onOpenChange={(open) => !open && setDeletePhase(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete 
                    {deletePhase === 'Both' ? ' all blocks ' : ` all ${deletePhase} blocks `} 
                    for the currently selected class <strong>{levelFilter || 'All Classes'}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                    Yes, clear bank
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <motion.div 
              className="grid gap-4 mt-6"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
            >
              {filteredQuestions.length === 0 ? (
                <Card className="glass-1 border-dashed py-16 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/5 p-4  mb-4">
                      <LibraryIcon className="w-8 h-8 text-primary/30" />
                    </div>
                    <p className="font-sans text-lg font-normal">Empty Category</p>
                    <p className="text-editorial-meta opacity-60 text-sm mt-1">No blocks found in the {activeTab} registry.</p>
                  </div>
                </Card>
              ) : (
                filteredQuestions.map(q => (
                  <motion.div key={q.id} variants={STAGGER_ITEM}>
                    <Card className="glass-1 overflow-hidden hover-lift transition-premium flex flex-col rounded-2xl shadow-premium hover:translate-y-[-2px] h-full">
                      <div className="p-4 sm:p-6">
                        {/* Mobile Streamlined View */}
                        <div className="md:hidden space-y-3">
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className={`text-xs px-2 h-5 font-normal border-none ${TYPE_BADGE_COLORS[q.type] || ''}`}>
                                {q.type}
                              </Badge>
                              <Badge variant="outline" className={`text-xs px-2 h-5 font-normal border-none ${
                                q.difficulty === 'Easy' ? 'bg-success/5 text-success' : 
                                q.difficulty === 'Hard' ? 'bg-destructive/5 text-destructive' : 
                                'bg-warning/5 text-warning'
                              }`}>
                                {q.difficulty || 'Medium'}
                              </Badge>
                              {q.classLevel && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-bold border-primary/10 text-primary/80">
                                  {q.classLevel}
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-1 items-center shrink-0">
                              {!q.isApproved && !requiresReview && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 px-2 border-success/30 hover:bg-success/10 text-[11px] gap-1"
                                  onClick={() => { approveQuestion(q.id, true); toast.success('Question Approved') }}
                                >
                                  <Check className="w-3 h-3 text-success" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-7 h-7 hover:bg-muted"
                                onClick={() => handleEdit(q)}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="w-7 h-7 hover:bg-destructive/10 text-destructive/70"
                                onClick={() => { deleteQuestion(q.id); toast.success('Question removed') }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-foreground/90 font-sans leading-relaxed line-clamp-3">{q.content}</p>

                          {(q.passageText || q.audioUrl || q.writingGenre || q.phase) && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-normal bg-muted/40 text-muted-foreground">
                                {q.phase}
                              </Badge>
                              {q.type === 'Writing' && q.writingGenre && (
                                <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal border-primary/20 bg-primary/5 text-primary">
                                  {q.writingGenre}
                                </Badge>
                              )}
                              {q.passageText && (
                                <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal text-primary/70 gap-1">
                                  <BookOpen className="w-2.5 h-2.5" /> Passage
                                </Badge>
                              )}
                              {q.audioUrl && (
                                <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal text-primary/70 gap-1">
                                  <Volume2 className="w-2.5 h-2.5" /> Audio
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Full View */}
                        <div className="hidden md:flex justify-between items-start gap-6">
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className={`text-xs px-2 h-5 font-normal   border-none ${TYPE_BADGE_COLORS[q.type] || ''}`}>
                                {q.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs px-2 h-5 font-normal   bg-muted/30">
                                {q.phase}
                              </Badge>
                              {q.type === 'Writing' && (q.writingGenre || q.writingSubType) && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-normal border-primary/20 bg-primary/5 text-primary gap-1">
                                  <FileText className="w-2.5 h-2.5" />
                                  {q.writingGenre}{q.writingSubType ? ` • ${q.writingSubType}` : ''}
                                </Badge>
                              )}
                              {q.type === 'Writing' && (q.wordLimitMin || q.wordLimitMax) && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-normal border-muted-foreground/20 bg-muted/20 text-muted-foreground">
                                  {q.wordLimitMin && q.wordLimitMax ? `${q.wordLimitMin}–${q.wordLimitMax} words` : q.wordLimitMin ? `Min ${q.wordLimitMin} w` : `Max ${q.wordLimitMax} w`}
                                </Badge>
                              )}
                              {q.passageText && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-normal    text-primary/60 gap-1">
                                  <BookOpen className="w-2.5 h-2.5" /> Passage
                                </Badge>
                              )}
                              {q.audioUrl && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-normal    text-primary/60 gap-1">
                                  <Volume2 className="w-2.5 h-2.5" /> Audio
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs px-2 h-5 font-normal border-none ${
                                q.difficulty === 'Easy' ? 'bg-success/5 text-success' : 
                                q.difficulty === 'Hard' ? 'bg-destructive/5 text-destructive' : 
                                'bg-warning/5 text-warning'
                              }`}>
                                {q.difficulty || 'Medium'}
                              </Badge>
                              <Badge variant={q.isApproved ? 'outline' : 'secondary'} className={`text-xs px-2 h-5    ${q.isApproved ? 'border-success/30 bg-success/5 text-success' : 'border-warning/30 bg-warning/5 text-warning'}`}>
                                {q.isApproved ? 'Approved' : 'Pending Review'}
                              </Badge>
                              {q.classLevel && (
                                <Badge variant="outline" className="text-xs px-2 h-5 font-bold border-primary/10 text-primary/80">
                                  {q.classLevel}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">{q.content}</p>

                            {q.type === 'Matching' && (() => {
                               const pairs = ensureMatchPairs(q.matchPairs)
                               if (pairs.length === 0) return null
                               return (
                                 <div className="space-y-1">
                                   {pairs.slice(0, 3).map((pair, i) => (
                                     <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                       <span className="font-sans bg-muted px-1.5 py-0.5 rounded text-xs">{pair.left}</span>
                                       <span className="text-muted-foreground/30 ">::</span>
                                       <span className="font-sans bg-muted px-1.5 py-0.5 rounded text-xs">{pair.right}</span>
                                     </div>
                                   ))}
                                   {pairs.length > 3 && (
                                     <p className="text-xs text-muted-foreground/50">+{pairs.length - 3} more pairs</p>
                                   )}
                                 </div>
                               )
                             })()}

                             {q.type === 'MCQ' && (() => {
                               const opts = ensureStringArray(q.options)
                               if (opts.length === 0) return null
                               return (
                                 <div className="flex flex-wrap gap-1">
                                   {opts.map((opt, i) => (
                                     <span key={i} className={`text-xs px-2 py-0.5  font-medium ${opt === q.correctAnswer ? 'bg-success/10 text-success ring-1 ring-success/20' : 'bg-muted text-muted-foreground'}`}>
                                       {opt}
                                     </span>
                                   ))}
                                 </div>
                               )
                             })()}

                            {q.imageUrl && (
                              <div className="relative w-full h-24  overflow-hidden border  mt-1">
                                <Image src={q.imageUrl} alt="Visual aid" fill className="object-cover" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                            {!q.isApproved && !requiresReview && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-success/30 hover:bg-success/10  transition-premium  gap-2"
                                onClick={() => { approveQuestion(q.id, true); toast.success('Question Approved') }}
                              >
                                <Check className="w-3 h-3" /> Quick Approve
                              </Button>
                            )}
                            <div className="flex gap-1 items-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 hover:bg-muted  transition-premium"
                                onClick={() => handleEdit(q)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon"
                                className="w-8 hover:bg-destructive/10 hover:  transition-premium"
                                onClick={() => { deleteQuestion(q.id); toast.success('Question removed') }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="p-6 border-b ">
              <CardTitle className="opacity-60 text-xl font-serif font-medium">Block Registry Intelligence</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-normal opacity-50">Total Library Blocks</span>
                <span className="text-3xl font-sans font-normal text-primary">{questions.length}</span>
              </div>
              
              <div className="space-y-6 max-h-[500px] overflow-y-auto premium-scrollbar pr-2">
                {Object.entries(classBasedStats).sort(([a], [b]) => a.localeCompare(b)).map(([level, data]) => (
                  <div key={level} className="pt-4 border-t first:border-t-0 first:pt-0 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/70">{level}</p>
                      <Badge variant="secondary" className="h-5 px-2 text-[10px] font-bold bg-primary/10 text-primary border-none">
                        {data.total} Total
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(data.types).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center group">
                          <span className="text-[11px] text-muted-foreground font-medium transition-colors group-hover:text-foreground">
                            {type}
                          </span>
                          <span className="text-[11px] font-mono opacity-40">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {questions.length === 0 && (
                <p className="text-xs text-center text-muted-foreground italic opacity-50 py-8">
                  No data available for analysis.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
