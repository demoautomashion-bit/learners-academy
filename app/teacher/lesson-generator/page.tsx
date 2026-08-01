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
  ArrowRight,
  GraduationCap,
  Layers,
  Sparkle
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

// Pre-defined CEFR Options & Preset Grammar Tags
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
  const [activeMode, setActiveMode] = useState<'full' | 'activity'>('full')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Form State
  const [selectedCefr, setSelectedCefr] = useState('B1')
  const [duration, setDuration] = useState(45)
  const [grammarInput, setGrammarInput] = useState('')
  const [grammarTags, setGrammarTags] = useState<string[]>(['Present Perfect vs Past Simple'])
  const [customTopic, setCustomTopic] = useState('Travel & World Experiences')
  
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

  // Add Tag Helper
  const handleAddTag = (tag: string) => {
    if (tag && !grammarTags.includes(tag)) {
      setGrammarTags([...grammarTags, tag])
      setGrammarInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setGrammarTags(grammarTags.filter(t => t !== tagToRemove))
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
          `Formulate grammatically accurate affirmative, negative, and interrogative sentences at the ${selectedCefr} benchmark.`,
          `Apply target grammar naturally in real-life conversational scenarios and written tasks.`
        ],
        vocabulary: [
          { word: 'Already / Yet', def: 'Time markers used with present perfect to indicate completion relative to now.' },
          { word: 'Ever / Never', def: 'Adverbs referencing lifetime experiences up to the current moment.' },
          { word: 'Since / For', def: 'Prepositions specifying starting point vs total duration of an ongoing state.' },
          { word: 'Unspecified Time', def: 'Concept where the exact moment of an action is secondary to its present relevance.' }
        ],
        timeline: [
          {
            phase: 'Warm-Up & Schema Activation',
            time: '7 mins',
            activity: 'Two Truths and One Lie (Life Experiences)',
            instructions: 'Students write 3 statements about their past experiences using "I have...". Partners guess the false statement by asking follow-up Past Simple questions ("When did you do that?").'
          },
          {
            phase: 'Concept Checking & Direct Instruction',
            time: '12 mins',
            activity: 'Timeline Mapping & Form Analysis',
            instructions: 'Teacher draws a timeline on the board illustrating the difference between closed past events vs open present relevance. Elicit formula: [Have/Has + Past Participle].'
          },
          {
            phase: 'Guided Practice',
            time: '13 mins',
            activity: 'Grammar Transformation & Sentence Building',
            instructions: 'Students complete paired worksheets converting Past Simple sentences into Present Perfect where relevant, correcting deliberate errors in context.'
          },
          {
            phase: 'Production & Application',
            time: '10 mins',
            activity: 'Roleplay: Job Interviewer vs Candidate',
            instructions: 'Interviewer asks about work history using Present Perfect. Candidate responds with specifics in Past Simple.'
          },
          {
            phase: 'Wrap-up & Assessment',
            time: '3 mins',
            activity: 'Exit Ticket Quiz',
            instructions: 'Quick 3-question gap fill check before leaving class to evaluate immediate comprehension.'
          }
        ],
        activities: [
          {
            title: 'Roleplay: The World Traveler Interview',
            type: 'Speaking / Pair Work',
            duration: '12 mins',
            setup: 'Divide students into pairs (Student A: Reporter, Student B: Famous Traveler).',
            prompt: 'Student A asks 5 questions using "Have you ever visited...?". Student B answers with details using specific dates/years in Past Simple.'
          },
          {
            title: 'Spot the Slip: Error Correction Challenge',
            type: 'Collaborative Problem Solving',
            duration: '10 mins',
            setup: 'Group students in trios with 6 contextual sentences containing common errors.',
            prompt: 'Find and correct errors like: "I have seen that movie yesterday" → "I saw that movie yesterday".'
          }
        ],
        quiz: [
          {
            question: `Choose the correct form for ${selectedCefr} level context: "She _____ (live) in Madrid for three years before moving to London."`,
            options: ['has lived', 'lived', 'is living', 'was lived'],
            answer: 'lived',
            reason: 'The action is completed in the past with a finished time frame (before moving).'
          },
          {
            question: 'Which sentence correctly uses the target time marker?',
            options: [
              'I have already finished my assignment yesterday.',
              'I haven\'t finished my assignment yet.',
              'I didn\'t finish my assignment yet last week.',
              'I have finished my assignment ago.'
            ],
            answer: 'I haven\'t finished my assignment yet.',
            reason: '"Yet" is used with present perfect in negative sentences to show expectation.'
          }
        ],
        homework: `Write a short 120-word paragraph titled "My Greatest Journey So Far" using at least 4 Present Perfect sentences and 4 Past Simple sentences correctly.`
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
      {/* Page Header aligned with portal standard */}
      <PageHeader
        title="AI Lesson & Activity Generator"
        description="Design CEFR-aligned syllabi, structured lesson plans, and classroom activities tailored to target grammatical structures."
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
        
        {/* Left Column: Clean 3-Step Wizard Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            
            {/* Wizard Step Progress Bar Header */}
            <div className="border-b border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs font-medium text-primary">
                  {currentStep === 1 && 'Grammar & CEFR'}
                  {currentStep === 2 && 'Context & Duration'}
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
              {/* STEP 1: Grammar Structures & CEFR */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span>Target Grammatical Structure <span className="text-destructive">*</span></span>
                    </Label>

                    {/* Selected Tags list */}
                    {grammarTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {grammarTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1.5 py-1 px-2.5 text-xs font-normal"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-destructive transition-colors ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Input with Add Button */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Present Continuous for Future"
                        value={grammarInput}
                        onChange={(e) => setGrammarInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag(grammarInput.trim())
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddTag(grammarInput.trim())}
                        disabled={!grammarInput.trim()}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Presets */}
                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground block mb-2 font-medium">Quick Select Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_GRAMMAR_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddTag(preset)}
                            className="text-xs px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border transition-all text-left"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CEFR Level Selector */}
                  <div className="space-y-3 pt-2">
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
                            'py-2 px-1 rounded-lg text-xs font-bold transition-all border text-center',
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
                </motion.div>
              )}

              {/* STEP 2: Duration & Context Theme */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* Lesson Duration Buttons */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center justify-between">
                      <span>Lesson Duration</span>
                      <span className="text-xs font-mono text-primary flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {duration} Minutes
                      </span>
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={cn(
                            'py-2 rounded-lg text-xs font-semibold border transition-all',
                            duration === d
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:bg-accent'
                          )}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real World Topic Context */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-semibold">Real-World Context / Topic Theme</Label>
                    <Input
                      placeholder="e.g. Job Interviews, Travel, Technology"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Provides realistic thematic vocabulary and discussion scenarios.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Component Selection */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <Label className="text-sm font-semibold block">Syllabus Sections to Include</Label>
                  
                  <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/20">
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        checked={includeWarmup}
                        onCheckedChange={(c) => setIncludeWarmup(!!c)}
                      />
                      <span>Warm-up & Schema Activation</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        checked={includeVocab}
                        onCheckedChange={(c) => setIncludeVocab(!!c)}
                      />
                      <span>Target Vocabulary List</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        checked={includeActivities}
                        onCheckedChange={(c) => setIncludeActivities(!!c)}
                      />
                      <span>Pair & Group Classroom Activities</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                      <Checkbox
                        checked={includeAssessment}
                        onCheckedChange={(c) => setIncludeAssessment(!!c)}
                      />
                      <span>Formative Quiz & Homework Task</span>
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
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              ) : <div />}

              {currentStep < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((currentStep + 1) as any)}
                  className="gap-1 text-xs ml-auto"
                >
                  Next Step
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (grammarTags.length === 0 && !grammarInput.trim())}
                  className="w-full text-xs font-semibold gap-2 py-5 shadow-sm"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="text-xs gap-1.5"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    className="text-xs gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="text-xs gap-1.5"
                  >
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
                      {generationStep === 1 && 'Analyzing grammatical structures...'}
                      {generationStep === 2 && `Aligning with ${selectedCefr} CEFR criteria...`}
                      {generationStep === 3 && 'Formatting activities and assessment...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Academic Document Display */}
              {generatedResult && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
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

                      <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          Target Vocabulary & Markers
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
