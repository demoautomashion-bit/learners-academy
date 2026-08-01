'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

// Pre-defined CEFR Options & Preset Grammar Tags
const CEFR_LEVELS = [
  { level: 'A1', label: 'A1 - Beginner', desc: 'Basic phrases & everyday expressions' },
  { level: 'A2', label: 'A2 - Elementary', desc: 'Routine sentences & direct exchanges' },
  { level: 'B1', label: 'B1 - Intermediate', desc: 'Main points on familiar matters & work' },
  { level: 'B2', label: 'B2 - Upper Intermediate', desc: 'Complex texts, abstract topics & technical' },
  { level: 'C1', label: 'C1 - Advanced', desc: 'Flexible, well-structured detailed express' },
  { level: 'C2', label: 'C2 - Proficient', desc: 'Spontaneous, precise & nuanced mastery' },
]

const QUICK_GRAMMAR_PRESETS = [
  'Present Perfect vs Past Simple',
  'Second Conditional (Hypothetical)',
  'Passive Voice in Formal Writing',
  'Reported Speech & Tense Shifts',
  'Relative Clauses (Defining/Non-defining)',
  'Modal Verbs of Deduction (Must/Might/Can\'t)',
  'Used to vs Would for Past Habits',
  'Third Conditional & Regrets'
]

const ACTIVITY_TYPES = [
  { id: 'roleplay', title: 'Interactive Roleplay', icon: MessageSquare },
  { id: 'fillin', title: 'Gap-Fill Worksheet', icon: FileText },
  { id: 'discussion', title: 'Debate / Discussion Prompts', icon: Brain },
  { id: 'matching', title: 'Structure Matching Game', icon: Puzzle },
]

export default function LessonGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'full' | 'activity'>('full')
  
  // Form State
  const [selectedCefr, setSelectedCefr] = useState('B1')
  const [duration, setDuration] = useState([45])
  const [grammarInput, setGrammarInput] = useState('')
  const [grammarTags, setGrammarTags] = useState<string[]>(['Present Perfect vs Past Simple'])
  const [customTopic, setCustomTopic] = useState('Travel & World Experiences')
  const [activityType, setActivityType] = useState('roleplay')
  
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

    // Step animation sequence
    setTimeout(() => setGenerationStep(2), 700)
    setTimeout(() => setGenerationStep(3), 1500)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationStep(0)
      
      // Set Rich Mock Generated Data
      setGeneratedResult({
        title: `Mastering ${grammarTags.join(' & ') || 'Grammatical Structures'}`,
        cefr: selectedCefr,
        duration: `${duration[0]} Minutes`,
        theme: customTopic || 'General Context',
        objectives: [
          `Distinguish between finished past actions and actions connected to the present using ${grammarTags[0] || 'the target structure'}.`,
          `Formulate grammatically accurate affirmative, negative, and interrogative sentences at the ${selectedCefr} benchmark.`,
          `Apply target grammar naturally in real-life conversational scenarios and written tasks.`
        ],
        vocabulary: [
          { word: 'Already / Yet', def: 'Time markers used with present perfect to indicate completion relative to now.' },
          { word: 'Ever / Never', def: 'Adverbs referencing lifetime experiences up to the current moment.' },
          { word: 'Since / For', def: 'Prepositions specifying starting point vs total duration of an ongoing state.' },
          { word: 'Unspecified Time', def: 'Concept where the exact moment of an action is less important than its outcome.' }
        ],
        timeline: [
          {
            phase: 'Warm-Up & Schema Activation',
            time: '7 mins',
            activity: 'Two Truths and One Lie (Life Experiences)',
            instructions: 'Students write 3 statements about their past experiences (2 true, 1 false) using "I have...". Partners guess the false statement by asking follow-up Past Simple questions ("When did you do that?").'
          },
          {
            phase: 'Concept Checking & Direct Instruction',
            time: '12 mins',
            activity: 'Timeline Mapping & Form Analysis',
            instructions: 'Teacher draws a timeline on the board illustrating the difference between closed past events vs open present relevance. Elicit formula: [Have/Has + Past Participle] vs [Verb + -ed/V2].'
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
            instructions: 'Interviewer asks about work history using Present Perfect ("Have you ever managed a project?"). Candidate responds with specifics in Past Simple ("Yes, I managed a logistics team in 2023").'
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
            prompt: 'Student A asks 5 questions using "Have you ever visited...?" or "Have you ever tried...?". Student B answers with details using specific dates/years in Past Simple.'
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
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 p-6 md:p-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Wand2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              AI Lesson & Activity Generator
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
              CEFR Aligned
            </Badge>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Input grammatical structures to instantly create tailored lesson plans, classroom activities, and assessments.
          </p>
        </div>

        {/* Generator Mode Switcher */}
        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-white/10 flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('full')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'full'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Full Lesson Syllabus
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            Standalone Activity
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                {activeTab === 'full' ? 'Syllabus Parameters' : 'Activity Parameters'}
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Customize target structures, CEFR level, and lesson components.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Target Grammatical Structures */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-200 flex items-center justify-between">
                  <span>Grammatical Structure(s) <span className="text-rose-400">*</span></span>
                  <span className="text-xs text-slate-400">{grammarTags.length} selected</span>
                </Label>

                {/* Selected Tags list */}
                {grammarTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {grammarTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30 gap-1.5 py-1 px-2.5 text-xs font-normal"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-400 transition-colors"
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
                    placeholder="e.g. Present Continuous for Future Plans"
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag(grammarInput.trim())
                      }
                    }}
                    className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag(grammarInput.trim())}
                    disabled={!grammarInput.trim()}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Select Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_GRAMMAR_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddTag(preset)}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-white/5 hover:border-indigo-500/30 transition-all text-left"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CEFR Level Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-200 flex items-center justify-between">
                  <span>CEFR Mastery Benchmark</span>
                  <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 font-mono text-xs">
                    {selectedCefr} Level
                  </Badge>
                </Label>
                <div className="grid grid-cols-6 gap-1.5">
                  {CEFR_LEVELS.map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedCefr(item.level)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                        selectedCefr === item.level
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-500/20'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {item.level}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  {CEFR_LEVELS.find(c => c.level === selectedCefr)?.desc}
                </p>
              </div>

              {/* Lesson Duration */}
              {activeTab === 'full' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-200">
                    <span>Lesson Duration</span>
                    <span className="text-indigo-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {duration[0]} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={90}
                    step={15}
                    value={duration[0]}
                    onChange={(e) => setDuration([parseInt(e.target.value)])}
                    className="w-full accent-indigo-500 bg-slate-950/60 rounded-lg cursor-pointer h-2 py-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15 min</span>
                    <span>30 min</span>
                    <span>45 min</span>
                    <span>60 min</span>
                    <span>90 min</span>
                  </div>
                </div>
              )}

              {/* Standalone Activity Specific options */}
              {activeTab === 'activity' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-200">Activity Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_TYPES.map((act) => {
                      const Icon = act.icon
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setActivityType(act.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                            activityType === act.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                          <span className="text-xs font-semibold leading-tight">{act.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Custom Topic / Context Theme */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">
                  Real-World Context / Topic Theme (Optional)
                </Label>
                <Input
                  placeholder="e.g. Technology & Artificial Intelligence, Travel"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Included Sections Checkboxes */}
              {activeTab === 'full' && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Syllabus Components to Include
                  </Label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <Checkbox
                        checked={includeWarmup}
                        onCheckedChange={(c) => setIncludeWarmup(!!c)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600"
                      />
                      <span>Warm-up Activity</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <Checkbox
                        checked={includeVocab}
                        onCheckedChange={(c) => setIncludeVocab(!!c)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600"
                      />
                      <span>Target Vocabulary</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <Checkbox
                        checked={includeActivities}
                        onCheckedChange={(c) => setIncludeActivities(!!c)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600"
                      />
                      <span>Pair/Group Activities</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <Checkbox
                        checked={includeAssessment}
                        onCheckedChange={(c) => setIncludeAssessment(!!c)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600"
                      />
                      <span>Exit Quiz / Assessment</span>
                    </label>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-white/5 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (grammarTags.length === 0 && !grammarInput.trim())}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Structuring Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Generate {activeTab === 'full' ? 'Syllabus & Lesson Plan' : 'Activity'}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Panel: Result Preview & Output */}
        <div className="lg:col-span-7">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl min-h-[600px] flex flex-col shadow-2xl">
            
            {/* Output Header Controls */}
            <div className="p-4 md:p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Generated Output Preview
                </h2>
                <p className="text-slate-400 text-xs">
                  {generatedResult ? 'Interactive preview ready. Review and customize before export.' : 'Awaiting teacher generation prompt.'}
                </p>
              </div>

              {/* Action Buttons */}
              {generatedResult && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs gap-1.5"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                    {isSaved ? 'Saved to Library' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Export
                  </Button>
                </div>
              )}
            </div>

            {/* Output Content Body */}
            <div className="p-6 flex-1 flex flex-col">
              
              {/* 1. Empty Initial State */}
              {!isGenerating && !generatedResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-slate-950/40 my-auto">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Wand2 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Ready to Design Your Syllabus</h3>
                  <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
                    Select or enter target grammatical structures on the left panel, pick a CEFR level benchmark, and click generate to instantly view your tailored lesson plan.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10 text-[11px] py-1">
                      ✨ Automatic Objectives
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10 text-[11px] py-1">
                      🎯 CEFR Level Standard
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10 text-[11px] py-1">
                      🧩 Custom Activities & Quiz
                    </Badge>
                  </div>
                </div>
              )}

              {/* 2. Realistic Simulated Loading State */}
              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Sparkles className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">Synthesizing Pedagogical Plan</h3>
                    <p className="text-xs text-indigo-400 font-mono animate-pulse">
                      {generationStep === 1 && 'Analyzing target grammatical structures...'}
                      {generationStep === 2 && `Aligning lesson plan with ${selectedCefr} CEFR criteria...`}
                      {generationStep === 3 && 'Generating interactive exercises & exit assessment...'}
                    </p>
                  </div>

                  {/* Shimmer Placeholder Boxes */}
                  <div className="w-full max-w-md space-y-3 pt-4">
                    <div className="h-4 bg-slate-800/80 rounded animate-pulse w-3/4 mx-auto" />
                    <div className="h-4 bg-slate-800/60 rounded animate-pulse w-1/2 mx-auto" />
                    <div className="h-4 bg-slate-800/40 rounded animate-pulse w-5/6 mx-auto" />
                  </div>
                </div>
              )}

              {/* 3. Generated Result Content Display */}
              {generatedResult && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Result Header Banner */}
                  <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-5 rounded-2xl border border-indigo-500/20">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs font-mono">
                          {generatedResult.cefr} Level
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-mono">
                          {generatedResult.duration}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Theme: <span className="text-slate-200">{generatedResult.theme}</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {generatedResult.title}
                    </h3>
                  </div>

                  {/* Tabs for Result Sections */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-slate-950/80 p-1 border border-white/10 rounded-xl grid grid-cols-4 mb-6">
                      <TabsTrigger value="overview" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        Timeline
                      </TabsTrigger>
                      <TabsTrigger value="activities" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        Activities
                      </TabsTrigger>
                      <TabsTrigger value="assessment" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        Quiz & Homework
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: OVERVIEW & OBJECTIVES */}
                    <TabsContent value="overview" className="space-y-6">
                      {/* Objectives Card */}
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                          <Target className="w-4 h-4 text-indigo-400" />
                          Lesson Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                          {generatedResult.objectives.map((obj: string, i: number) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Vocabulary Card */}
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          Target Vocabulary & Markers
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {generatedResult.vocabulary.map((v: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
                              <span className="text-xs font-bold text-white block mb-0.5">{v.word}</span>
                              <span className="text-[11px] text-slate-400 leading-snug block">{v.def}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* TAB 2: LESSON TIMELINE */}
                    <TabsContent value="timeline" className="space-y-4">
                      <div className="relative border-l-2 border-indigo-500/20 ml-3 pl-6 space-y-6 my-2">
                        {generatedResult.timeline.map((step: any, i: number) => (
                          <div key={i} className="relative group">
                            {/* Dot */}
                            <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
                            
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{step.phase}</span>
                                <Badge variant="outline" className="text-[10px] font-mono text-indigo-400 border-indigo-500/30">
                                  {step.time}
                                </Badge>
                              </div>
                              <h5 className="text-xs font-semibold text-indigo-300">{step.activity}</h5>
                              <p className="text-xs text-slate-300 leading-relaxed">{step.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* TAB 3: ACTIVITIES */}
                    <TabsContent value="activities" className="space-y-4">
                      {generatedResult.activities.map((act: any, i: number) => (
                        <Card key={i} className="bg-slate-950/50 border-white/5">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                {act.type}
                              </Badge>
                              <span className="text-[11px] font-mono text-slate-400">{act.duration}</span>
                            </div>
                            <CardTitle className="text-sm font-bold text-white mt-2">{act.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-xs">
                            <div>
                              <span className="font-semibold text-slate-400 block mb-1">Teacher Setup:</span>
                              <p className="text-slate-300">{act.setup}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-200">
                              <span className="font-semibold text-indigo-300 block mb-1">Activity Prompt:</span>
                              <p className="italic">{act.prompt}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* TAB 4: QUIZ & HOMEWORK */}
                    <TabsContent value="assessment" className="space-y-6">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-4">
                        <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-400" />
                          CEFR Formative Assessment Quiz
                        </h4>
                        
                        {generatedResult.quiz.map((q: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-2 text-xs">
                            <span className="font-bold text-white block">Q{i + 1}: {q.question}</span>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded border text-[11px] ${
                                    opt === q.answer
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                                      : 'bg-slate-950/40 border-white/5 text-slate-400'
                                  }`}
                                >
                                  {opt} {opt === q.answer && '✓'}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 italic pt-1">Explanation: {q.reason}</p>
                          </div>
                        ))}
                      </div>

                      {/* Homework Assignment */}
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                        <h4 className="text-sm font-semibold text-indigo-300">Suggested Homework Task</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-white/5">
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
    </div>
  )
}
