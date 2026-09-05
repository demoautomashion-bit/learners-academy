'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  BookOpen,
  Wand2,
  Clock,
  Target,
  CheckCircle2,
  Copy,
  Printer,
  RefreshCw,
  Plus,
  X,
  FileText,
  HelpCircle,
  Puzzle,
  Brain,
  MessageSquare,
  BookmarkPlus,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Quote,
  Check,
  Calendar,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { exportSyllabusToWord, exportSyllabusToPDF } from '@/lib/export-utils'
import { generateGranularTermRoadmap, getGrammarDetailsForStructure, DayArchetype } from '@/lib/curriculum-generator'

const ARCHETYPE_OPTIONS: Array<{ type: DayArchetype; label: string; icon: string; color: string }> = [
  { type: 'grammar', label: '📘 Grammar & Structure', icon: '📘', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { type: 'activity', label: '🎮 Extra Activity & Fluency', icon: '🎮', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { type: 'discussion', label: '🗣️ Discussion & Debate', icon: '🗣️', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { type: 'reading', label: '📖 Book & Reading', icon: '📖', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
]

// Pre-defined CEFR Options & Presets
const CEFR_LEVELS = [
  { level: 'A1', label: 'A1 - Beginner', desc: 'Basic phrases & everyday expressions' },
  { level: 'A2', label: 'A2 - Elementary', desc: 'Routine sentences & direct exchanges' },
  { level: 'B1', label: 'B1 - Intermediate', desc: 'Main points on familiar matters & work' },
  { level: 'B2', label: 'B2 - Upper Intermediate', desc: 'Complex texts, abstract topics & technical' },
  { level: 'C1', label: 'C1 - Advanced', desc: 'Flexible, well-structured detailed expression' },
  { level: 'C2', label: 'C2 - Proficient', desc: 'Spontaneous, precise & nuanced mastery' },
]

const QUICK_GRAMMAR_PRESETS = [
  'Present Perfect vs Past Simple',
  'Second Conditional (Hypothetical)',
  'Passive Voice in Formal Writing',
  'Reported Speech & Tense Shifts',
  'Relative Clauses',
  'Modal Verbs of Deduction',
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90]

export default function LessonGeneratorPage() {
  const { user } = useAuth()
  
  // Scope Switcher: 'single' vs 'term'
  const [syllabusScope, setSyllabusScope] = useState<'single' | 'term'>('single')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Term Specific State
  const [termWeeks, setTermWeeks] = useState(12) // 12 weeks = 3 months
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3)
  const [termViewMode, setTermViewMode] = useState<'roadmap' | 'cards'>('roadmap')
  const [weeklyArchetypes, setWeeklyArchetypes] = useState<DayArchetype[]>(['grammar', 'activity', 'discussion'])

  // Day-of-Week & Detail Level Options
  const [detailLevel, setDetailLevel] = useState<'simplified' | 'detailed'>('detailed')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday'])

  const handleSessionsChange = (count: number) => {
    setSessionsPerWeek(count)
    if (count === 2) {
      setWeeklyArchetypes(['grammar', 'discussion'])
      setSelectedDays(['Tuesday', 'Thursday'])
    } else if (count === 3) {
      setWeeklyArchetypes(['grammar', 'activity', 'discussion'])
      setSelectedDays(['Monday', 'Wednesday', 'Friday'])
    } else if (count === 5) {
      setWeeklyArchetypes(['grammar', 'reading', 'activity', 'grammar', 'discussion'])
      setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    }
  }
  
  // Form State
  const [selectedCefr, setSelectedCefr] = useState('B1')
  const [duration, setDuration] = useState(45)
  const [customTopic, setCustomTopic] = useState('')
  
  // Tag Inputs State
  const [grammarInput, setGrammarInput] = useState('')
  const [grammarTags, setGrammarTags] = useState<string[]>([])

  const [vocabInput, setVocabInput] = useState('')
  const [vocabTags, setVocabTags] = useState<string[]>([])

  const [idiomsInput, setIdiomsInput] = useState('')
  const [idiomTags, setIdiomTags] = useState<string[]>([])

  // Form Options Checkboxes
  const [includeWarmup, setIncludeWarmup] = useState(true)
  const [includeVocab, setIncludeVocab] = useState(true)
  const [includeActivities, setIncludeActivities] = useState(true)
  const [includeAssessment, setIncludeAssessment] = useState(true)

  // AI Loading & Result States
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generatedResult, setGeneratedResult] = useState<any>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [downloadToast, setDownloadToast] = useState<string | null>(null)

  // Generic Tag Helper
  const handleAddTag = (
    inputVal: string,
    tagsList: string[],
    setTags: (tags: string[]) => void,
    setInput: (val: string) => void
  ) => {
    const trimmed = inputVal.trim()
    if (trimmed && !tagsList.includes(trimmed)) {
      setTags([...tagsList, trimmed])
      setInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string, tagsList: string[], setTags: (tags: string[]) => void) => {
    setTags(tagsList.filter(t => t !== tagToRemove))
  }

  // Trigger Real File Download
  const handleDownloadFile = (ext: string) => {
    if (!generatedResult) return
    const title = generatedResult?.title || 'Academic_Syllabus'
    setDownloadToast(`Exporting ${title}.${ext}...`)

    if (ext === 'docx' || ext === 'doc') {
      exportSyllabusToWord(generatedResult)
    } else if (ext === 'pdf') {
      exportSyllabusToPDF(generatedResult)
    }

    setTimeout(() => {
      setDownloadToast(null)
    }, 2500)
  }

  // Save generated syllabus to PostgreSQL database via POST /api/lessons
  // Save generated syllabus to PostgreSQL database via POST /api/lessons
  const handleSaveToDatabase = async () => {
    if (!generatedResult) return

    setIsSaving(true)
    try {
      const payload = {
        title: generatedResult.title,
        scope: syllabusScope,
        cefr: selectedCefr,
        topic: customTopic.trim() || undefined,
        duration: generatedResult.duration,
        grammar: grammarTags,
        vocabulary: generatedResult.vocabulary || null,
        idioms: generatedResult.idioms || null,
        timeline: generatedResult.timeline || null,
        weeks: generatedResult.weeks || null,
        quiz: generatedResult.quiz || null,
        homework: generatedResult.homework || null,
        teacherId: user?.id || 'cl-teacher-1',
        teacherName: user?.name || 'Teacher'
      }

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Failed to save to database:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Dynamic Generation Engine based on teacher inputs
  const handleGenerate = () => {
    let activeGrammar = [...grammarTags]
    if (grammarInput.trim() && !activeGrammar.includes(grammarInput.trim())) {
      activeGrammar.push(grammarInput.trim())
      setGrammarTags(activeGrammar)
      setGrammarInput('')
    }

    let activeVocab = [...vocabTags]
    if (vocabInput.trim() && !activeVocab.includes(vocabInput.trim())) {
      activeVocab.push(vocabInput.trim())
      setVocabTags(activeVocab)
      setVocabInput('')
    }

    let activeIdioms = [...idiomTags]
    if (idiomsInput.trim() && !activeIdioms.includes(idiomsInput.trim())) {
      activeIdioms.push(idiomsInput.trim())
      setIdiomTags(activeIdioms)
      setIdiomsInput('')
    }

    if (activeGrammar.length === 0) return

    setIsGenerating(true)
    setGenerationStep(1)
    setGeneratedResult(null)
    setIsSaved(false)

    const cleanTopic = customTopic.trim()

    setTimeout(() => setGenerationStep(2), 700)
    setTimeout(() => setGenerationStep(3), 1500)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationStep(0)

      if (syllabusScope === 'term') {
        // Granular Multi-Week Course Roadmap Generation Engine
        const totalSessions = termWeeks * sessionsPerWeek
        const roadmapWeeks = generateGranularTermRoadmap({
          termWeeks,
          sessionsPerWeek,
          cefr: selectedCefr,
          theme: cleanTopic,
          grammarTags: activeGrammar,
          vocabTags: activeVocab,
          idiomTags: activeIdioms,
          weeklyArchetypes,
          selectedDays,
          detailLevel
        })

        setGeneratedResult({
          isTerm: true,
          detailLevel,
          title: `${termWeeks}-Week (${totalSessions} Sessions) Syllabus Roadmap`,
          cefr: selectedCefr,
          duration: `${totalSessions} Sessions (${sessionsPerWeek}x / week)`,
          theme: cleanTopic || undefined,
          totalSessions,
          selectedDays,
          weeks: roadmapWeeks,
          objectives: [
            `Complete ${termWeeks}-week progressive mastery from basic structures to ${selectedCefr} CEFR proficiency.`,
            `Systematically cover target grammar (${activeGrammar.join(', ')}), vocabulary, and activities on ${selectedDays.join(', ')}.`,
            `Conduct mid-term review (Week ${Math.floor(termWeeks / 2)}) and final graduation assessment (Week ${termWeeks}).`
          ]
        })
      } else {
        // Single Lesson Data Structure using Dynamic Grammar Details
        const primaryG = activeGrammar[0] || 'Grammatical Structures'
        const gInfo = getGrammarDetailsForStructure(primaryG, selectedCefr)

        const objectives = [
          `Master structural form and application of ${primaryG}: ${gInfo.rule}`
        ]
        if (activeVocab.length > 0) {
          objectives.push(`Formulate grammatically accurate sentences incorporating target vocabulary: ${activeVocab.slice(0, 3).join(', ')}.`)
        }
        if (activeIdioms.length > 0) {
          objectives.push(`Apply idioms such as "${activeIdioms[0]}" naturally in conversational scenarios.`)
        }

        setGeneratedResult({
          isTerm: false,
          detailLevel,
          title: `Mastering ${activeGrammar.join(' & ') || 'Grammatical Structures'}`,
          cefr: selectedCefr,
          duration: `${duration} Minutes`,
          theme: cleanTopic || undefined,
          grammarFocus: gInfo.rule,
          boardLayout: gInfo.board,
          grammarScopeLimit: gInfo.scope,
          objectives,
          vocabulary: activeVocab.map(v => ({ word: v, def: `Target key vocabulary term aligned to ${selectedCefr} level.` })),
          idioms: activeIdioms.map(idm => ({ expression: idm, usage: 'Common English idiom used for natural speaking fluency.' })),
          timeline: detailLevel === 'simplified' ? [
            {
              phase: 'Warm-Up & Schema',
              time: `${Math.round(duration * 0.2)} mins`,
              activity: `Icebreaker Discussion`,
              instructions: cleanTopic ? `Students discuss topic context "${cleanTopic}" in pairs.` : `Students discuss target grammar concepts in pairs.`
            },
            {
              phase: 'Core Instruction',
              time: `${Math.round(duration * 0.45)} mins`,
              activity: `Form & Meaning: ${gInfo.topic}`,
              instructions: `Explain structural rule: ${gInfo.rule}`
            },
            {
              phase: 'Guided Application',
              time: `${Math.round(duration * 0.35)} mins`,
              activity: 'Pair Practice',
              instructions: `Practice applying ${primaryG}${activeVocab.length > 0 ? ` and vocabulary (${activeVocab.slice(0, 3).join(', ')})` : ''}.`
            }
          ] : [
            {
              phase: 'Warm-Up & Schema Activation',
              time: `${Math.round(duration * 0.15)} mins`,
              activity: `Icebreaker Discussion`,
              instructions: `Students activate prior knowledge on target concepts.`
            },
            {
              phase: 'Direct Instruction',
              time: `${Math.round(duration * 0.25)} mins`,
              activity: `Form & Meaning: ${gInfo.topic}`,
              instructions: `Teacher explains board formula: ${gInfo.board}.`
            },
            {
              phase: 'Guided Practice',
              time: `${Math.round(duration * 0.3)} mins`,
              activity: 'Sentence Transformation Drills',
              instructions: `Worksheet activity incorporating target concepts.`
            },
            {
              phase: 'Production & Application',
              time: `${Math.round(duration * 0.2)} mins`,
              activity: 'Pair Work Practice',
              instructions: cleanTopic ? `Students engage in a real-world scenario focused on "${cleanTopic}".` : `Students engage in target sentence production.`
            },
            {
              phase: 'Wrap-up & Exit Check',
              time: `${Math.round(duration * 0.1)} mins`,
              activity: 'Comprehension Exit Ticket',
              instructions: gInfo.ccqs[0] || 'Quick evaluation of immediate comprehension.'
            }
          ],
          ccqs: detailLevel === 'simplified' ? [] : gInfo.ccqs,
          quiz: [
            {
              question: `Which option correctly completes the ${selectedCefr}-level context using ${primaryG}?`,
              options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
              answer: 'Option A (Correct)',
              reason: gInfo.rule
            }
          ],
          homework: cleanTopic
            ? `Write a 120-word paragraph about "${cleanTopic}" utilizing target structure (${primaryG}).`
            : `Write a 120-word paragraph utilizing target structure (${primaryG}).`
        })
      }
    }, 2400)
  }

  const handleCopy = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <PageShell>
      {/* Toast Download Notification */}
      {downloadToast && (
        <motion.div
          initial={{ opacity: 0, y: -10, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -10, x: '-50%' }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-xl border border-primary/20 text-xs font-semibold flex items-center gap-2 max-w-[90vw] whitespace-nowrap"
        >
          <Download className="w-4 h-4 animate-bounce shrink-0" />
          <span>{downloadToast}</span>
        </motion.div>
      )}

      {/* Page Header */}
      <PageHeader
        title="AI Lesson & Term Syllabus Generator"
        description="Synthesize single-session lesson plans or full 3-month (12-week) day-by-day term syllabi tailored to CEFR standards."
        badgeText="Academic Tool"
        icon={Wand2}
        action={
          <Link href="/teacher/lesson-generator/saved">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              View Saved Syllabi Library
            </Button>
          </Link>
        }
      />

      {/* Main Scope Switcher Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 bg-card border border-border p-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground tracking-tight">Generation Scope:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <Button
            variant={syllabusScope === 'single' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSyllabusScope('single')}
            className={cn(
              'text-xs gap-1.5 h-9 px-3 font-medium transition-all rounded-lg text-center',
              syllabusScope === 'single'
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Single Session Plan</span>
          </Button>
          <Button
            variant={syllabusScope === 'term' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSyllabusScope('term')}
            className={cn(
              'text-xs gap-1.5 h-9 px-3 font-medium transition-all rounded-lg text-center',
              syllabusScope === 'term'
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3-Month Term Roadmap</span>
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: 3-Step Wizard Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            
            {/* Wizard Header Progress Bar */}
            <div className="border-b border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs font-medium text-primary">
                  {currentStep === 1 && 'Grammar, Vocab & Idioms'}
                  {currentStep === 2 && (syllabusScope === 'term' ? 'Term Scope & CEFR' : 'CEFR & Duration')}
                  {currentStep === 3 && 'Syllabus Components'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    onClick={() => setCurrentStep(step as any)}
                    className={cn(
                      'h-1.5 rounded-full cursor-pointer transition-all',
                      step === currentStep
                        ? 'bg-primary shadow-sm'
                        : step < currentStep
                        ? 'bg-primary/40'
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>

            <CardContent className="pt-6 space-y-6">
              
              {/* STEP 1: Grammar, Vocab, Idioms */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  
                  {/* Grammar Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Grammar Structure(s) <span className="text-destructive">*</span></span>
                      <span className="text-[11px] text-muted-foreground">{grammarTags.length} added</span>
                    </Label>

                    {grammarTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {grammarTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1.5 py-0.5 px-2 text-xs font-normal">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag, grammarTags, setGrammarTags)}>
                              <X className="w-3 h-3 hover:text-destructive" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Second Conditional"
                        value={grammarInput}
                        onChange={(e) => setGrammarInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag(grammarInput, grammarTags, setGrammarTags, setGrammarInput)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(grammarInput, grammarTags, setGrammarTags, setGrammarInput)}
                        disabled={!grammarInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Vocabulary Input */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Target Vocabulary & Terms</span>
                      <span className="text-[11px] text-muted-foreground">{vocabTags.length} added</span>
                    </Label>

                    {vocabTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {vocabTags.map((v) => (
                          <Badge key={v} variant="outline" className="gap-1.5 py-0.5 px-2 text-xs font-normal bg-muted/40">
                            {v}
                            <button type="button" onClick={() => handleRemoveTag(v, vocabTags, setVocabTags)}>
                              <X className="w-3 h-3 hover:text-destructive" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. itinerary, compromise"
                        value={vocabInput}
                        onChange={(e) => setVocabInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag(vocabInput, vocabTags, setVocabTags, setVocabInput)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(vocabInput, vocabTags, setVocabTags, setVocabInput)}
                        disabled={!vocabInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Idioms Input */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Target Idioms & Collocations</span>
                      <span className="text-[11px] text-muted-foreground">{idiomTags.length} added</span>
                    </Label>

                    {idiomTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {idiomTags.map((idm) => (
                          <Badge key={idm} variant="secondary" className="gap-1.5 py-0.5 px-2 text-xs font-normal bg-primary/10 text-primary">
                            "{idm}"
                            <button type="button" onClick={() => handleRemoveTag(idm, idiomTags, setIdiomTags)}>
                              <X className="w-3 h-3 hover:text-destructive" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. break the ice"
                        value={idiomsInput}
                        onChange={(e) => setIdiomsInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag(idiomsInput, idiomTags, setIdiomTags, setIdiomsInput)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(idiomsInput, idiomTags, setIdiomTags, setIdiomsInput)}
                        disabled={!idiomsInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CEFR Level & Scope / Duration */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  
                  {/* CEFR Level */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span>CEFR Benchmark Level</span>
                      <Badge variant="outline" className="font-mono text-xs text-primary">
                        {selectedCefr} Level
                      </Badge>
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {CEFR_LEVELS.map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setSelectedCefr(item.level)}
                          className={cn(
                            'py-2.5 px-2 rounded-lg text-xs font-bold transition-all border text-center flex flex-col items-center justify-center gap-0.5',
                            selectedCefr === item.level
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:bg-accent'
                          )}
                        >
                          <span>{item.level}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Term Specific Controls */}
                  {syllabusScope === 'term' ? (
                    <div className="space-y-4 pt-2 border-t border-border">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Term Duration</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[4, 8, 12].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setTermWeeks(w)}
                              className={cn(
                                'py-2 rounded-md text-xs font-semibold border transition-all text-center',
                                termWeeks === w
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-muted/40 border-border text-muted-foreground'
                              )}
                            >
                              {w === 12 ? '3 Months (12w)' : `${w} Weeks`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Sessions Per Week</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[2, 3, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSessionsChange(s)}
                              className={cn(
                                'py-2 rounded-md text-xs font-semibold border transition-all text-center',
                                sessionsPerWeek === s
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-muted/40 border-border text-muted-foreground'
                              )}
                            >
                              {s}x Weekly
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lesson Detail Level Selector */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Lesson Format & Detail Level</Label>
                          <Badge variant="outline" className="text-[11px] capitalize font-mono">
                            {detailLevel === 'simplified' ? '⚡ Simplified' : '📘 Fully Detailed'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailLevel('simplified')}
                            className={cn(
                              'py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-0.5 text-center',
                              detailLevel === 'simplified'
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-muted/30 border-border text-muted-foreground hover:bg-accent'
                            )}
                          >
                            <span className="font-bold">⚡ Simplified</span>
                            <span className="text-[10px] opacity-80 font-normal">Clean overview summaries</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailLevel('detailed')}
                            className={cn(
                              'py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-0.5 text-center',
                              detailLevel === 'detailed'
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-muted/30 border-border text-muted-foreground hover:bg-accent'
                            )}
                          >
                            <span className="font-bold">📘 Fully Detailed</span>
                            <span className="text-[10px] opacity-80 font-normal">Board formulas, CCQs & games</span>
                          </button>
                        </div>
                      </div>

                      {/* Teaching Days of the Week Selector */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Teaching Days of the Week</Label>
                          <span className="text-[11px] text-muted-foreground">{selectedDays.length} days selected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                            const isSelected = selectedDays.includes(day)
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    if (selectedDays.length > 1) {
                                      setSelectedDays(selectedDays.filter(d => d !== day))
                                    }
                                  } else {
                                    setSelectedDays([...selectedDays, day])
                                  }
                                }}
                                className={cn(
                                  'px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-accent'
                                )}
                              >
                                {day}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Weekly Schedule Timetable Configurator */}
                      <div className="space-y-2.5 pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Weekly Day-Label Archetypes</Label>
                          <span className="text-[11px] text-muted-foreground">Tailor each day's lesson type</span>
                        </div>

                        <div className="space-y-2">
                          {Array.from({ length: sessionsPerWeek }).map((_, idx) => {
                            const currentType = weeklyArchetypes[idx] || 'grammar'
                            const dayName = selectedDays[idx % selectedDays.length] || `Day ${idx + 1}`
                            return (
                              <div key={idx} className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 min-w-0 shrink-0">
                                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span>{dayName}</span>
                                  <span className="text-[11px] font-normal text-muted-foreground shrink-0">(S{idx + 1})</span>
                                </span>

                                <select
                                  value={currentType}
                                  onChange={(e) => {
                                    const updated = [...weeklyArchetypes]
                                    updated[idx] = e.target.value as DayArchetype
                                    setWeeklyArchetypes(updated)
                                  }}
                                  className="text-xs font-semibold bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[55%] truncate shrink-0 cursor-pointer shadow-sm"
                                >
                                  {ARCHETYPE_OPTIONS.map((opt) => (
                                    <option key={opt.type} value={opt.type}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Lesson Duration */
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Single Session Duration</Label>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {duration} Minutes
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {DURATION_OPTIONS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDuration(d)}
                            className={cn(
                              'py-2 rounded-md text-xs font-semibold border transition-all text-center',
                              duration === d
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/40 border-border text-muted-foreground'
                            )}
                          >
                            {d}m
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Topic Context */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-sm font-semibold">Real-World Topic Theme</Label>
                    <Input
                      placeholder="e.g. Travel, Business English, Technology"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Component Toggles */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <Label className="text-sm font-semibold block">Syllabus Components to Include</Label>
                  
                  <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/20">
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeWarmup} onCheckedChange={(c) => setIncludeWarmup(!!c)} />
                      <span>Daily Warm-up & Schema Activation</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeVocab} onCheckedChange={(c) => setIncludeVocab(!!c)} />
                      <span>Target Vocabulary & Idioms List</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeActivities} onCheckedChange={(c) => setIncludeActivities(!!c)} />
                      <span>Pair/Group Classroom Dynamics</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeAssessment} onCheckedChange={(c) => setIncludeAssessment(!!c)} />
                      <span>Mid-Term & Final Evaluation Milestones</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </CardContent>

            {/* Wizard Navigation Footer */}
            <CardFooter className="border-t border-border pt-4 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="gap-1 text-xs shrink-0 w-full xs:w-auto"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              ) : <div />}

              {currentStep < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((currentStep + 1) as any)}
                  className="gap-1 text-xs ml-auto shrink-0 w-full xs:w-auto"
                >
                  Next Step
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (grammarTags.length === 0 && !grammarInput.trim())}
                  className="w-full xs:flex-1 text-xs font-semibold gap-2 py-5 shadow-sm ml-auto"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Syllabus...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">Generate {syllabusScope === 'term' ? 'Full 3-Month Term Roadmap' : 'Single Plan'}</span>
                      <span className="inline sm:hidden">Generate {syllabusScope === 'term' ? '3-Month Roadmap' : 'Single Plan'}</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Academic Document Preview */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card shadow-sm min-h-[600px] flex flex-col">
            
            {/* Header Toolbar */}
            <div className="p-4 md:p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Syllabus Document Preview
                </h3>
                <p className="text-xs text-muted-foreground">
                  {generatedResult ? 'Generated academic document ready for export.' : 'Configure scope and generate to view output.'}
                </p>
              </div>

              {generatedResult && (
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Real Database Save Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveToDatabase}
                    disabled={isSaving || isSaved}
                    className="text-xs gap-1.5 h-9 justify-center"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                    <span>{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadFile('pdf')}
                    className="text-xs gap-1.5 h-9 justify-center"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>PDF</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadFile('docx')}
                    className="text-xs gap-1.5 h-9 justify-center"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Word</span>
                  </Button>

                  <Button size="sm" onClick={() => window.print()} className="text-xs gap-1.5 h-9 justify-center">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Document Body */}
            <div className="p-6 flex-1 flex flex-col">
              
              {!isGenerating && !generatedResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-muted/20 my-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">No Syllabus Generated Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
                    Select a scope (Single Lesson or 3-Month Term), complete the 3 configuration steps, and generate to view output.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Synthesizing Course Structure</h4>
                    <p className="text-xs text-muted-foreground animate-pulse">
                      {generationStep === 1 && 'Building weekly progression roadmap...'}
                      {generationStep === 2 && `Aligning with ${selectedCefr} CEFR criteria...`}
                      {generationStep === 3 && 'Formatting daily objectives and milestones...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Result View */}
              {generatedResult && !isGenerating && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Title Banner */}
                  <div className="border-b border-border pb-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {generatedResult.cefr} Level
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {generatedResult.duration}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Context: <span className="font-medium text-foreground">{generatedResult.theme || 'General / Core English'}</span>
                      </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      {generatedResult.title}
                    </h2>
                  </div>

                  {/* 3-MONTH TERM DAY-BY-DAY ROADMAP VIEW */}
                  {/* 3-MONTH TERM GRANULAR ROADMAP & GUIDEBOOK VIEW */}
                  {generatedResult.isTerm ? (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Term Overview & Goals</h4>
                        <ul className="space-y-1.5">
                          {generatedResult.objectives.map((obj: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* View Mode Switcher Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                            Curriculum View Mode
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Switch between high-level course matrix and daily lesson execution plans.
                          </p>
                        </div>

                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0">
                          <button
                            type="button"
                            onClick={() => setTermViewMode('roadmap')}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                              termViewMode === 'roadmap'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Roadmap Matrix</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTermViewMode('cards')}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                              termViewMode === 'cards'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span>Daily Teacher Cards</span>
                          </button>
                        </div>
                      </div>

                      {/* MODE 1: ROADMAP MATRIX VIEW */}
                      {termViewMode === 'roadmap' ? (
                        <div className="space-y-4">
                          {generatedResult.weeks.map((w: any) => (
                            <div key={w.weekNum} className="border border-border rounded-lg bg-card overflow-hidden shadow-xs">
                              <div className="bg-muted/40 p-3 border-b border-border flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">{w.title}</span>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  Week {w.weekNum} of {termWeeks}
                                </Badge>
                              </div>
                              
                              <div className="p-3 space-y-3">
                                {w.days.map((d: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      'p-3 rounded-lg border text-xs space-y-2 transition-all',
                                      d.type === 'Exam'
                                        ? 'bg-destructive/10 border-destructive/30'
                                        : d.type === 'Assessment'
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-background border-border hover:border-primary/40'
                                    )}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">{d.day}</span>
                                        <Badge
                                          variant={d.type === 'Exam' ? 'destructive' : d.type === 'Assessment' ? 'default' : 'secondary'}
                                          className="text-[9px] px-1.5 py-0"
                                        >
                                          {d.type || 'Instruction'}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="text-xs font-semibold text-primary">{d.topic}</h5>
                                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                        <strong className="text-foreground font-medium">Grammar Focus:</strong> {d.grammarFocus}
                                      </p>
                                    </div>

                                    {d.vocabList && d.vocabList.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Target Vocab:</span>
                                        {d.vocabList.map((v: string, vi: number) => (
                                          <span key={vi} className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                                            {v}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {d.activityType && (
                                      <div className="bg-muted/30 p-2 rounded text-[11px] text-foreground border border-border/50 flex items-start gap-2">
                                        <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                          <strong className="text-primary font-semibold">{d.activityType}:</strong>{' '}
                                          <span className="text-muted-foreground">{d.activityDetail}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* MODE 2: DAILY TEACHER GUIDEBOOK CARDS VIEW */
                        <div className="space-y-4">
                          {generatedResult.weeks.map((w: any) => (
                            <div key={w.weekNum} className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                                {w.title}
                              </h4>

                              {w.days.map((d: any, idx: number) => (
                                <div key={idx} className="border border-border rounded-xl bg-card p-4 space-y-3 shadow-xs">
                                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-primary block">{d.day}</span>
                                      <h3 className="text-sm font-bold text-foreground">{d.topic}</h3>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">Grammar Sub-Rule & Objective</span>
                                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/60">
                                      {d.grammarFocus}
                                    </p>
                                  </div>

                                  {/* Grammar Day Specifics: Scope Limit & Board Formula */}
                                  {d.grammarScopeLimit && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-xs space-y-1">
                                      <span className="font-bold text-amber-700 dark:text-amber-400 block">⚠️ Grammar Scope Limit (How much to teach today):</span>
                                      <p className="text-amber-800 dark:text-amber-300 leading-normal">{d.grammarScopeLimit}</p>
                                    </div>
                                  )}

                                  {d.boardLayout && (
                                    <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-lg text-xs space-y-1 font-mono">
                                      <span className="font-bold text-blue-700 dark:text-blue-400 block font-sans">📐 Whiteboard Formula / Board Layout:</span>
                                      <p className="text-blue-900 dark:text-blue-200">{d.boardLayout}</p>
                                    </div>
                                  )}

                                  {/* Discussion Day Specifics: CEFR Debate Prompts & Functional Phrases */}
                                  {d.discussionTopics && d.discussionTopics.length > 0 && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg space-y-2">
                                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        🗣️ CEFR Discussion & Debate Prompts:
                                      </span>
                                      {d.discussionTopics.map((dt: any, dti: number) => (
                                        <div key={dti} className="bg-background/80 p-2 rounded border border-emerald-500/20 text-xs">
                                          <strong className="text-foreground">{dt.topic}:</strong>{' '}
                                          <span className="text-muted-foreground italic">"{dt.prompt}"</span>
                                        </div>
                                      ))}

                                      {d.functionalPhrases && (
                                        <div className="space-y-1 pt-1">
                                          <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Functional Speaking Phrases:</span>
                                          <div className="flex flex-wrap gap-1">
                                            {d.functionalPhrases.map((phrase: string, pi: number) => (
                                              <Badge key={pi} variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-700 border-emerald-300">
                                                {phrase}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Extra Activity Day Specifics: Game Blueprint & Rules */}
                                  {d.activityGame && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg space-y-2">
                                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                          🎮 Classroom Fluency Game: {d.activityGame.gameName}
                                        </span>
                                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-300 text-purple-700">
                                          Game Blueprint
                                        </Badge>
                                      </div>

                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div><strong className="text-foreground font-semibold">Materials Needed:</strong> {d.activityGame.materials.join(', ')}</div>
                                        <div><strong className="text-foreground font-semibold">Execution Rules:</strong></div>
                                        <ol className="list-decimal list-inside space-y-0.5 pl-1 text-[11px]">
                                          {d.activityGame.rules.map((rule: string, ri: number) => (
                                            <li key={ri}>{rule}</li>
                                          ))}
                                        </ol>
                                        <div className="pt-1 text-purple-800 dark:text-purple-300 font-medium"><strong className="text-foreground">Scoring System:</strong> {d.activityGame.scoring}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Book / Reading Day Specifics: Passage & Questions */}
                                  {d.readingPassage && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg space-y-2">
                                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                                          📖 Book Reading: {d.readingPassage.passageTitle}
                                        </span>
                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-300 text-amber-700">
                                          {d.readingPassage.readingStrategy}
                                        </Badge>
                                      </div>

                                      <div className="text-xs space-y-1">
                                        <strong className="text-foreground font-semibold">Reading Comprehension Questions:</strong>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                                          {d.readingPassage.comprehensionQuestions.map((cq: string, cqi: number) => (
                                            <li key={cqi}>{cq}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {d.vocabList && d.vocabList.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">Target Classroom Vocabulary</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {d.vocabList.map((v: string, vi: number) => (
                                          <Badge key={vi} variant="secondary" className="text-xs font-mono font-normal">
                                            {v}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {d.ccqs && d.ccqs.length > 0 && (
                                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg space-y-1">
                                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        Concept Check Questions (CCQs) for Teacher:
                                      </span>
                                      <ul className="space-y-1 pt-1">
                                        {d.ccqs.map((q: string, qi: number) => (
                                          <li key={qi} className="text-xs text-foreground/90 flex items-start gap-2">
                                            <span className="text-primary font-bold">?</span>
                                            <span>{q}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {d.phases && d.phases.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">4-Phase Classroom Timeline</span>
                                      <div className="grid grid-cols-1 gap-2">
                                        {d.phases.map((p: any, pi: number) => (
                                          <div key={pi} className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">{p.phase}</span>
                                                <Badge variant="outline" className="text-[10px] font-mono">{p.time}</Badge>
                                              </div>
                                              <p className="text-[11px] text-muted-foreground">{p.instructions}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SINGLE LESSON PREVIEW */
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid grid-cols-4 w-full mb-4">
                        <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
                        <TabsTrigger value="timeline" className="text-xs font-medium">Timeline</TabsTrigger>
                        <TabsTrigger value="activities" className="text-xs font-medium">Activities</TabsTrigger>
                        <TabsTrigger value="assessment" className="text-xs font-medium">Assessment</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Learning Objectives</h4>
                          <ul className="space-y-1.5 pt-1">
                            {generatedResult.objectives.map((obj: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-3">
                        {generatedResult.timeline.map((step: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-lg border border-border bg-card space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground">{step.phase}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">{step.time}</Badge>
                            </div>
                            <h5 className="text-xs font-medium text-primary">{step.activity}</h5>
                            <p className="text-xs text-muted-foreground">{step.instructions}</p>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="activities" className="space-y-4">
                        {generatedResult.activities?.map((act: any, i: number) => (
                          <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">{act.title}</h4>
                            <p className="text-xs text-muted-foreground">{act.setup}</p>
                            <div className="p-3 rounded bg-muted/40 border border-border text-xs italic text-foreground">
                              "{act.prompt}"
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="assessment" className="space-y-4">
                        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Exit Quiz Check</h4>
                          {generatedResult.quiz?.map((q: any, i: number) => (
                            <div key={i} className="p-3 rounded bg-muted/20 space-y-2 text-xs">
                              <span className="font-medium text-foreground block">Q{i + 1}: {q.question}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
