'use client'

import { useState } from 'react'
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
  Lightbulb,
  Check
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

const QUICK_IDIOM_PRESETS = [
  'Break the ice',
  'Hit the nail on the head',
  'Burn the midnight oil',
  'Bite the bullet',
  'See eye to eye',
]

const ACTIVITY_STYLES = [
  { id: 'roleplay', title: 'Pair Roleplay', icon: MessageSquare },
  { id: 'discussion', title: 'Debate / Discussion', icon: Brain },
  { id: 'gapfill', title: 'Gap-Fill Worksheet', icon: FileText },
  { id: 'game', title: 'Matching Game', icon: Puzzle },
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90]

export default function LessonGeneratorPage() {
  const [activeMode, setActiveMode] = useState<'full' | 'activity'>('full')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Form State: Dedicated Flexible Inputs
  const [selectedCefr, setSelectedCefr] = useState('B1')
  const [duration, setDuration] = useState(45)
  const [customTopic, setCustomTopic] = useState('Travel & World Experiences')
  
  // Tag Inputs State
  const [grammarInput, setGrammarInput] = useState('')
  const [grammarTags, setGrammarTags] = useState<string[]>(['Present Perfect vs Past Simple'])

  const [vocabInput, setVocabInput] = useState('')
  const [vocabTags, setVocabTags] = useState<string[]>(['itinerary', 'destination', 'embark'])

  const [idiomsInput, setIdiomsInput] = useState('')
  const [idiomTags, setIdiomTags] = useState<string[]>(['break the ice', 'hit the road'])

  const [selectedActivities, setSelectedActivities] = useState<string[]>(['roleplay', 'discussion'])

  // Form Options Checkboxes
  const [includeWarmup, setIncludeWarmup] = useState(true)
  const [includeVocab, setIncludeVocab] = useState(true)
  const [includeActivities, setIncludeActivities] = useState(true)
  const [includeHomework, setIncludeHomework] = useState(true)
  const [includeAssessment, setIncludeAssessment] = useState(true)

  // AI Loading & Result States
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generatedResult, setGeneratedResult] = useState<any>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

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

  const toggleActivityStyle = (id: string) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(a => a !== id))
    } else {
      setSelectedActivities([...selectedActivities, id])
    }
  }

  // Mock Generation Trigger
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
      
      setGeneratedResult({
        title: `Mastering ${grammarTags.join(' & ') || 'Grammatical Structures'}`,
        cefr: selectedCefr,
        duration: `${duration} Minutes`,
        theme: customTopic || 'General Academic Context',
        objectives: [
          `Distinguish between finished past actions and ongoing states using ${grammarTags[0] || 'the target structure'}.`,
          `Formulate grammatically accurate sentences incorporating target vocabulary: ${vocabTags.slice(0, 3).join(', ') || 'essential terms'}.`,
          `Apply idioms such as "${idiomTags[0] || 'break the ice'}" naturally in conversational scenarios.`
        ],
        vocabulary: vocabTags.map(v => ({ word: v, def: `Target key vocabulary term aligned to ${selectedCefr} level.` })),
        idioms: idiomTags.map(idm => ({ expression: idm, usage: 'Common English idiom used for natural speaking fluency.' })),
        timeline: [
          {
            phase: 'Warm-Up & Schema Activation',
            time: `${Math.round(duration * 0.15)} mins`,
            activity: `Icebreaker: "${idiomTags[0] || 'Break the Ice'}" Discussion`,
            instructions: `Students discuss past experiences using targeted vocabulary (${vocabTags.slice(0, 2).join(', ') || 'key terms'}).`
          },
          {
            phase: 'Direct Instruction & Form Analysis',
            time: `${Math.round(duration * 0.25)} mins`,
            activity: 'Structure & Meaning Mapping',
            instructions: `Teacher explains ${grammarTags.join(', ')} with timeline diagrams and contrastive analysis.`
          },
          {
            phase: 'Guided Practice',
            time: `${Math.round(duration * 0.3)} mins`,
            activity: 'Sentence Transformation & Idiom Matching',
            instructions: `Worksheet activity incorporating target idioms (${idiomTags.join(', ') || 'idioms'}) and vocabulary.`
          },
          {
            phase: 'Production & Application',
            time: `${Math.round(duration * 0.2)} mins`,
            activity: `Pair Work: ${selectedActivities.join(' & ').toUpperCase()} Roleplay`,
            instructions: `Students engage in a real-world scenario focused on "${customTopic}".`
          },
          {
            phase: 'Wrap-up & Exit Quiz',
            time: `${Math.round(duration * 0.1)} mins`,
            activity: 'Comprehension Exit Ticket',
            instructions: 'Quick 3-question evaluation of grammar accuracy and vocabulary usage.'
          }
        ],
        activities: [
          {
            title: `Interactive Roleplay: ${customTopic}`,
            type: 'Pair Activity',
            duration: '15 mins',
            setup: 'Divide students into pairs with role cards.',
            prompt: `Incorporate at least 2 target idioms (${idiomTags.slice(0, 2).join(', ') || 'idioms'}) while using ${grammarTags[0] || 'target grammar'}.`
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
        homework: `Write a 120-word paragraph about "${customTopic}" utilizing target grammar and at least 2 key vocabulary terms.`
      })
    }, 2400)
  }

  const handleCopy = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSave = () => {
    setIsSaved(true)
  }

  return (
    <PageShell>
      {/* Page Header */}
      <PageHeader
        title="AI Lesson & Activity Generator"
        description="Design CEFR-aligned syllabi, structured lesson plans, vocabulary, and idioms tailored to your classroom needs."
        badgeText="Academic Tool"
        icon={Wand2}
        action={
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border">
            <Button
              variant={activeMode === 'full' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('full')}
              className="text-xs gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Full Syllabus
            </Button>
            <Button
              variant={activeMode === 'activity' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('activity')}
              className="text-xs gap-1.5"
            >
              <Puzzle className="w-3.5 h-3.5" />
              Activity Generator
            </Button>
          </div>
        }
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: 3-Step Wizard Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            
            {/* Wizard Step Progress Bar Header */}
            <div className="border-b border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs font-medium text-primary">
                  {currentStep === 1 && 'Grammar, Vocab & Idioms'}
                  {currentStep === 2 && 'CEFR, Context & Duration'}
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
              {/* STEP 1: Dedicated Grammar, Vocabulary, Idioms & Activity Inputs */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  
                  {/* 1. Target Grammar Field */}
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

                  {/* 2. Target Vocabulary Field */}
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

                  {/* 3. Target Idioms Field */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Target Idioms & Phrases</span>
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

                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[11px] text-muted-foreground mr-1">Quick Idioms:</span>
                      {QUICK_IDIOM_PRESETS.slice(0, 3).map((idm) => (
                        <button
                          key={idm}
                          type="button"
                          onClick={() => handleAddTag(idm, idiomTags, setIdiomTags, setIdiomsInput)}
                          className="text-[10px] px-2 py-0.5 rounded bg-muted/60 hover:bg-accent text-muted-foreground hover:text-foreground border border-border"
                        >
                          + {idm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Preferred Activity Styles */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <Label className="text-xs font-semibold block">Preferred Classroom Dynamics</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIVITY_STYLES.map((act) => {
                        const Icon = act.icon
                        const isSelected = selectedActivities.includes(act.id)
                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => toggleActivityStyle(act.id)}
                            className={cn(
                              'p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all',
                              isSelected
                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                : 'bg-background border-border text-muted-foreground hover:bg-accent'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              {act.title}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CEFR Level, Context & Non-Sticky Fluid Duration */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  
                  {/* CEFR Level Selector */}
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
                    <p className="text-xs text-muted-foreground italic">
                      {CEFR_LEVELS.find(c => c.level === selectedCefr)?.desc}
                    </p>
                  </div>

                  {/* Smooth Fluid Duration Selector */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Lesson Duration</Label>
                      <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {duration} Minutes
                      </Badge>
                    </div>

                    {/* Smooth Duration Pills */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={cn(
                            'py-2 rounded-md text-xs font-semibold border transition-all text-center',
                            duration === d
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-muted/40 border-border text-muted-foreground hover:bg-accent'
                          )}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real World Topic Context */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-sm font-semibold">Real-World Topic Theme</Label>
                    <Input
                      placeholder="e.g. Job Interviews, Travel, Technology"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Component Selection */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <Label className="text-sm font-semibold block">Syllabus Sections to Include</Label>
                  
                  <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/20">
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeWarmup} onCheckedChange={(c) => setIncludeWarmup(!!c)} />
                      <span>Warm-up & Schema Activation</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeVocab} onCheckedChange={(c) => setIncludeVocab(!!c)} />
                      <span>Target Vocabulary & Idioms List</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeActivities} onCheckedChange={(c) => setIncludeActivities(!!c)} />
                      <span>Pair & Group Classroom Activities</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox checked={includeAssessment} onCheckedChange={(c) => setIncludeAssessment(!!c)} />
                      <span>Exit Quiz Check & Homework Task</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </CardContent>

            {/* FIXED Wizard Navigation Footer (Prevents Button Truncation) */}
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
              ) : (
                <div />
              )}

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
                      <span>Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Academic Syllabus</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Academic Document Preview Sheet */}
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
                  {generatedResult ? 'Generated academic plan ready for class use.' : 'Configure parameters and generate to view output.'}
                </p>
              </div>

              {generatedResult && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs gap-1.5">
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSave} className="text-xs gap-1.5">
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                </div>
              )}
            </div>

            {/* Document Content Body */}
            <div className="p-6 flex-1 flex flex-col">
              
              {/* Empty Initial State */}
              {!isGenerating && !generatedResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-muted/20 my-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">No Syllabus Generated Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
                    Complete the 3 configuration steps on the left to synthesize a CEFR-aligned syllabus document.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Structuring Academic Plan</h4>
                    <p className="text-xs text-muted-foreground animate-pulse">
                      {generationStep === 1 && 'Integrating custom grammar, vocabulary & idioms...'}
                      {generationStep === 2 && `Aligning with ${selectedCefr} CEFR criteria...`}
                      {generationStep === 3 && 'Formatting activities and assessment...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Academic Document Display */}
              {generatedResult && !isGenerating && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Formal Document Title Banner */}
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

                  {/* Tabs for Clean Document Organization */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full mb-4">
                      <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
                      <TabsTrigger value="timeline" className="text-xs font-medium">Timeline</TabsTrigger>
                      <TabsTrigger value="activities" className="text-xs font-medium">Activities</TabsTrigger>
                      <TabsTrigger value="assessment" className="text-xs font-medium">Assessment</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-1.5 pt-1">
                          {generatedResult.objectives.map((obj: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Vocabulary Section */}
                      {generatedResult.vocabulary?.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            Featured Vocabulary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {generatedResult.vocabulary.map((v: any, i: number) => (
                              <div key={i} className="p-2.5 rounded bg-background border border-border">
                                <span className="text-xs font-semibold text-foreground block">{v.word}</span>
                                <span className="text-[11px] text-muted-foreground block">{v.def}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Idioms Section */}
                      {generatedResult.idioms?.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <Quote className="w-4 h-4" />
                            Target Idioms & Collocations
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {generatedResult.idioms.map((idm: any, i: number) => (
                              <div key={i} className="p-2.5 rounded bg-background border border-border">
                                <span className="text-xs font-semibold text-primary block">"{idm.expression}"</span>
                                <span className="text-[11px] text-muted-foreground block">{idm.usage}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* TIMELINE TAB */}
                    <TabsContent value="timeline" className="space-y-3">
                      {generatedResult.timeline.map((step: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-lg border border-border bg-card space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">{step.phase}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {step.time}
                            </Badge>
                          </div>
                          <h5 className="text-xs font-medium text-primary">{step.activity}</h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">{step.instructions}</p>
                        </div>
                      ))}
                    </TabsContent>

                    {/* ACTIVITIES TAB */}
                    <TabsContent value="activities" className="space-y-4">
                      {generatedResult.activities.map((act: any, i: number) => (
                        <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px]">
                              {act.type}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">{act.duration}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{act.title}</h4>
                          <p className="text-xs text-muted-foreground">{act.setup}</p>
                          <div className="p-3 rounded bg-muted/40 border border-border text-xs italic text-foreground">
                            "{act.prompt}"
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    {/* ASSESSMENT TAB */}
                    <TabsContent value="assessment" className="space-y-4">
                      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Exit Quiz Check</h4>
                        {generatedResult.quiz.map((q: any, i: number) => (
                          <div key={i} className="p-3 rounded bg-muted/20 space-y-2 text-xs">
                            <span className="font-medium text-foreground block">Q{i + 1}: {q.question}</span>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    'p-2 rounded border text-xs',
                                    opt === q.answer ? 'bg-primary/10 border-primary/30 font-semibold text-primary' : 'bg-background border-border'
                                  )}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Homework Assignment</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {generatedResult.homework}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
