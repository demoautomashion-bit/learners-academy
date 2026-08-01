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
  
  // Form State
  const [selectedCefr, setSelectedCefr] = useState('B1')
  const [duration, setDuration] = useState(45)
  const [customTopic, setCustomTopic] = useState('Travel & World Experiences')
  
  // Tag Inputs State
  const [grammarInput, setGrammarInput] = useState('')
  const [grammarTags, setGrammarTags] = useState<string[]>(['Present Perfect vs Past Simple', 'Passive Voice'])

  const [vocabInput, setVocabInput] = useState('')
  const [vocabTags, setVocabTags] = useState<string[]>(['itinerary', 'destination', 'embark'])

  const [idiomsInput, setIdiomsInput] = useState('')
  const [idiomTags, setIdiomTags] = useState<string[]>(['break the ice', 'hit the road'])

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

  // Trigger Mock File Download
  const handleDownloadFile = (ext: string) => {
    const title = generatedResult?.title || 'Academic_Syllabus'
    setDownloadToast(`Downloading ${title}.${ext}...`)
    setTimeout(() => {
      setDownloadToast(null)
    }, 2500)
  }

  // Save generated syllabus to PostgreSQL database via POST /api/lessons
  const handleSaveToDatabase = async () => {
    if (!generatedResult) return

    setIsSaving(true)
    try {
      const payload = {
        title: generatedResult.title,
        scope: syllabusScope,
        cefr: selectedCefr,
        topic: customTopic || 'General Context',
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
    if (grammarTags.length === 0 && !grammarInput.trim()) return

    setIsGenerating(true)
    setGenerationStep(1)
    setGeneratedResult(null)
    setIsSaved(false)

    setTimeout(() => setGenerationStep(2), 700)
    setTimeout(() => setGenerationStep(3), 1500)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationStep(0)

      if (syllabusScope === 'term') {
        // 3-Month Term Roadmap Data Structure
        const totalSessions = termWeeks * sessionsPerWeek
        const roadmapWeeks = []

        for (let w = 1; w <= termWeeks; w++) {
          const weekDays = []
          for (let d = 1; d <= sessionsPerWeek; d++) {
            const sessionNum = (w - 1) * sessionsPerWeek + d
            
            if (w === 6 && d === sessionsPerWeek) {
              weekDays.push({
                day: `Session ${sessionNum} (Week ${w}, Day ${d})`,
                topic: 'MID-TERM REVIEW & PROGRESS CHECK',
                type: 'Assessment',
                objective: 'Evaluate mid-term grammar mastery and oral presentation.'
              })
            } else if (w === 12 && d === sessionsPerWeek) {
              weekDays.push({
                day: `Session ${sessionNum} (Week ${w}, Day ${d})`,
                topic: 'FINAL TERM WRITTEN & ORAL EVALUATION',
                type: 'Exam',
                objective: 'Comprehensive term assessment aligned to CEFR criteria.'
              })
            } else {
              weekDays.push({
                day: `Session ${sessionNum} (Week ${w}, Day ${d})`,
                topic: `${grammarTags[(sessionNum - 1) % grammarTags.length] || 'Core Structure'} - Module ${d}`,
                type: 'Instruction & Practice',
                objective: `Master target structure in "${customTopic}" context with featured vocabulary.`
              })
            }
          }

          roadmapWeeks.push({
            weekNum: w,
            title: `Week ${w}: ${grammarTags[(w - 1) % grammarTags.length] || 'Academic Module'} Mastery`,
            days: weekDays
          })
        }

        setGeneratedResult({
          isTerm: true,
          title: `3-Month (${termWeeks}-Week) Comprehensive Course Roadmap`,
          cefr: selectedCefr,
          duration: `${totalSessions} Sessions (${sessionsPerWeek}x / week)`,
          theme: customTopic || 'General Context',
          totalSessions,
          weeks: roadmapWeeks,
          objectives: [
            `Complete ${termWeeks}-week progressive mastery from basic structures to ${selectedCefr} CEFR proficiency.`,
            `Systematically cover ${grammarTags.length} core grammar units with daily classroom timelines.`,
            `Conduct mid-term review (Week 6) and final term assessment (Week 12).`
          ]
        })
      } else {
        // Single Lesson Data Structure
        setGeneratedResult({
          isTerm: false,
          title: `Mastering ${grammarTags.join(' & ') || 'Grammatical Structures'}`,
          cefr: selectedCefr,
          duration: `${duration} Minutes`,
          theme: customTopic || 'General Context',
          objectives: [
            `Distinguish between finished past actions and ongoing states using ${grammarTags[0] || 'target structure'}.`,
            `Formulate grammatically accurate sentences incorporating target vocabulary: ${vocabTags.slice(0, 3).join(', ')}.`,
            `Apply idioms such as "${idiomTags[0] || 'break the ice'}" naturally in conversational scenarios.`
          ],
          vocabulary: vocabTags.map(v => ({ word: v, def: `Target key vocabulary term aligned to ${selectedCefr} level.` })),
          idioms: idiomTags.map(idm => ({ expression: idm, usage: 'Common English idiom used for natural speaking fluency.' })),
          timeline: [
            {
              phase: 'Warm-Up & Schema Activation',
              time: `${Math.round(duration * 0.15)} mins`,
              activity: `Icebreaker: "${idiomTags[0] || 'Break the Ice'}" Discussion`,
              instructions: `Students discuss past experiences using targeted vocabulary.`
            },
            {
              phase: 'Direct Instruction',
              time: `${Math.round(duration * 0.25)} mins`,
              activity: 'Form & Meaning Mapping',
              instructions: `Teacher explains ${grammarTags.join(', ')} with timeline diagrams.`
            },
            {
              phase: 'Guided Practice',
              time: `${Math.round(duration * 0.3)} mins`,
              activity: 'Sentence Transformation & Worksheet',
              instructions: `Worksheet activity incorporating target idioms and vocabulary.`
            },
            {
              phase: 'Production & Application',
              time: `${Math.round(duration * 0.2)} mins`,
              activity: 'Pair Work Roleplay',
              instructions: `Students engage in a real-world scenario focused on "${customTopic}".`
            },
            {
              phase: 'Wrap-up & Exit Quiz',
              time: `${Math.round(duration * 0.1)} mins`,
              activity: 'Comprehension Exit Ticket',
              instructions: 'Quick 3-question evaluation of immediate comprehension.'
            }
          ],
          quiz: [
            {
              question: `Which option correctly completes the ${selectedCefr}-level context?`,
              options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
              answer: 'Option A (Correct)',
              reason: 'Proper alignment with target grammatical rules.'
            }
          ],
          homework: `Write a 120-word paragraph about "${customTopic}" utilizing target grammar.`
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4 animate-bounce" />
          {downloadToast}
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
      <div className="flex items-center gap-3 mt-6 bg-card border border-border p-2 rounded-xl">
        <span className="text-xs font-semibold text-muted-foreground px-2">Generation Scope:</span>
        <Button
          variant={syllabusScope === 'single' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSyllabusScope('single')}
          className="text-xs gap-1.5 flex-1 md:flex-none"
        >
          <Clock className="w-3.5 h-3.5" />
          Single Session Plan (30-90m)
        </Button>
        <Button
          variant={syllabusScope === 'term' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSyllabusScope('term')}
          className="text-xs gap-1.5 flex-1 md:flex-none"
        >
          <Calendar className="w-3.5 h-3.5" />
          Full 3-Month Term Roadmap (12 Weeks)
        </Button>
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
                    <div className="grid grid-cols-6 gap-1.5">
                      {CEFR_LEVELS.map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setSelectedCefr(item.level)}
                          className={cn(
                            'py-2.5 px-1 rounded-lg text-xs font-bold transition-all border text-center',
                            selectedCefr === item.level
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:bg-accent'
                          )}
                        >
                          {item.level}
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
                              onClick={() => setSessionsPerWeek(s)}
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
            <CardFooter className="border-t border-border pt-4 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="gap-1 text-xs shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              ) : <div />}

              {currentStep < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((currentStep + 1) as any)}
                  className="gap-1 text-xs ml-auto shrink-0"
                >
                  Next Step
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (grammarTags.length === 0 && !grammarInput.trim())}
                  className="flex-1 text-xs font-semibold gap-2 py-5 shadow-sm ml-auto"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Syllabus...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate {syllabusScope === 'term' ? 'Full 3-Month Term Roadmap' : 'Single Plan'}</span>
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
            <div className="p-4 md:p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
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
                <div className="flex flex-wrap items-center gap-2">
                  {/* Real Database Save Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveToDatabase}
                    disabled={isSaving || isSaved}
                    className="text-xs gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                    {isSaving ? 'Saving to DB...' : isSaved ? 'Saved to DB' : 'Save to Library'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadFile('pdf')}
                    className="text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    Download PDF
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadFile('docx')}
                    className="text-xs gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download Word
                  </Button>

                  <Button size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print
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
                        Context: <span className="font-medium text-foreground">{generatedResult.theme}</span>
                      </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      {generatedResult.title}
                    </h2>
                  </div>

                  {/* 3-MONTH TERM DAY-BY-DAY ROADMAP VIEW */}
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

                      {/* 12-Week Day-by-Day Timeline */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                          12-Week Day-by-Day Syllabus Roadmap
                        </h4>
                        
                        {generatedResult.weeks.map((w: any) => (
                          <div key={w.weekNum} className="border border-border rounded-lg bg-card overflow-hidden">
                            <div className="bg-muted/40 p-3 border-b border-border flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{w.title}</span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                Week {w.weekNum} of {termWeeks}
                              </Badge>
                            </div>
                            
                            <div className="p-3 space-y-2">
                              {w.days.map((d: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    'p-2.5 rounded border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2',
                                    d.type === 'Exam'
                                      ? 'bg-destructive/10 border-destructive/30 font-semibold'
                                      : d.type === 'Assessment'
                                      ? 'bg-primary/10 border-primary/30 font-semibold'
                                      : 'bg-background border-border'
                                  )}
                                >
                                  <div>
                                    <span className="text-xs font-bold text-foreground block">{d.day}</span>
                                    <span className="text-xs text-primary font-medium">{d.topic}</span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{d.objective}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
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
