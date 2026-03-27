'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList, Clock, CheckCircle, ArrowRight, ChevronLeft, ChevronRight,
  Lock, Timer, AlertTriangle, Award, TrendingUp, XCircle, Volume2, BookOpen,
} from "lucide-react"
import { evaluateSubjective } from "@/lib/ai-auditor"
import type { AssessmentTemplate, Question, StudentTest } from "@/lib/types"

const AUTO_GRADED_TYPES = ['MCQ', 'True/False', 'Fill in the Blanks', 'Matching'] as const
const AI_GRADED_TYPES   = ['Subjective', 'Writing', 'Reading', 'Listening'] as const

export default function StudentAssessmentsPage() {
  const { user } = useAuth()
  const { assessments: mockAssessments, questions: mockQuestions, submitTestResult } = useData()

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  useEffect(() => { setSessionToken(sessionStorage.getItem('current_assessment_code')) }, [])

  const availableAssessments = mockAssessments.filter(a =>
    a.accessCode === sessionToken && a.status === 'active'
  )

  const [activeTest, setActiveTest]           = useState<AssessmentTemplate | null>(null)
  const [isTestEngineOpen, setIsTestEngineOpen] = useState(false)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft]   = useState(0)
  const [strikes, setStrikes]     = useState(0)
  const [isPaused, setIsPaused]   = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [aiAuditResults, setAiAuditResults] = useState<{ feedback: string; justification: string }>({ feedback: "", justification: "" })
  const audioRef = useRef<HTMLAudioElement>(null)

  // ── Start Test ──────────────────────────────────────────────────────────────
  const startTest = (assessment: AssessmentTemplate) => {
    const pool = mockQuestions.filter(q => {
      const phaseMatch = q.phase === assessment.phase || q.phase === 'Both'
      const natureMatch = assessment.nature === 'Mixed' || q.type === assessment.nature
      return phaseMatch && natureMatch
    })

    const seed = user?.id || 'anonymous'
    const deterministicRandom = (s: string) => {
      let hash = 0
      for (let i = 0; i < s.length; i++) { hash = (hash << 5) - hash + s.charCodeAt(i); hash |= 0 }
      return () => { hash = (hash * 16807) % 2147483647; return (hash - 1) / 2147483646 }
    }
    const rand = deterministicRandom(seed)
    const shuffled = [...pool].sort(() => rand() - 0.5)
    
    // Select the requested number of questions (or all if pool is smaller)
    const selected = shuffled.slice(0, assessment.questionCount || 10)

    setRandomizedQuestions(selected)
    setActiveTest(assessment)
    setTimeLeft(assessment.durationMinutes * 60)
    setIsTestEngineOpen(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setStrikes(0)
    setIsPaused(false)
    setShowResult(false)

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() =>
        toast.error("Please enable fullscreen for the best testing experience.")
      )
    }
  }

  // ── Auto-play audio for Listening questions ────────────────────────────────
  useEffect(() => {
    const q = randomizedQuestions[currentQuestionIndex]
    if (q?.type === 'Listening' && q.audioUrl && audioRef.current) {
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    }
  }, [currentQuestionIndex, randomizedQuestions])

  // ── Proctoring ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTestEngineOpen || showResult) return

    const handleViolation = (reason: string) => {
      setStrikes(prev => {
        const next = prev + 1
        if (next >= 3) { toast.error(`CRITICAL VIOLATION: ${reason}. Auto-submitting.`); finishTest(true); return next }
        setIsPaused(true)
        toast.warning(`${reason}: Warning ${next}/3.`, {
          duration: 5000,
          style: { backgroundColor: 'oklch(0.577 0.245 27.325)', color: 'white' },
          icon: <AlertTriangle className="w-5 h-5" />,
        })
        return next
      })
    }

    const onVisibility = () => { if (document.visibilityState === 'hidden') handleViolation("Tab Switch Detected") }
    const onBlur = () => handleViolation("App De-focus Detected")
    const onFullscreen = () => { if (!document.fullscreenElement) handleViolation("Fullscreen Exit Detected") }
    const preventKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) || e.key === 'F12') {
        e.preventDefault(); toast.error("Security: Action Disabled during Assessment")
      }
    }
    const preventRightClick = (e: MouseEvent) => e.preventDefault()

    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    document.addEventListener('fullscreenchange', onFullscreen)
    window.addEventListener('keydown', preventKeys)
    window.addEventListener('contextmenu', preventRightClick)
    return () => {
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('fullscreenchange', onFullscreen)
      window.removeEventListener('keydown', preventKeys)
      window.removeEventListener('contextmenu', preventRightClick)
    }
  }, [isTestEngineOpen, showResult])

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isTestEngineOpen && !isPaused && !showResult && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000)
      return () => clearInterval(t)
    } else if (timeLeft === 0 && isTestEngineOpen && !showResult) {
      finishTest(true)
    }
  }, [timeLeft, isTestEngineOpen, isPaused, showResult])

  // ── Score & Submit ─────────────────────────────────────────────────────────
  const finishTest = async (isAuto = false) => {
    setIsEvaluating(true)

    const totalScorable = randomizedQuestions.length
    const pointsPerQuestion = totalScorable > 0 ? (activeTest?.totalMarks || 100) / totalScorable : 0
    let totalScore = 0

    const finalPercentage = await (async () => {
      const autoGraded = randomizedQuestions.filter(q => (AUTO_GRADED_TYPES as readonly string[]).includes(q.type))
      const aiGraded   = randomizedQuestions.filter(q => (AI_GRADED_TYPES as readonly string[]).includes(q.type))

      // 1. Auto-graded questions
      autoGraded.forEach(q => {
        if (q.type === 'Matching') {
          try {
            const studentPairs = JSON.parse(answers[q.id] || '{}')
            const allCorrect = (q.matchPairs || []).every(p => studentPairs[p.left] === p.right)
            if (allCorrect) totalScore += pointsPerQuestion
          } catch {}
        } else if (q.type === 'Fill in the Blanks') {
          if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()) totalScore += pointsPerQuestion
        } else {
          // MCQ + True/False
          if (answers[q.id] === q.correctAnswer) totalScore += pointsPerQuestion
        }
      })

      // 2. AI-graded questions (Parallel Execution)
      let aiFeedbackChain = ""
      let aiJustificationChain = ""

      const auditPromises = aiGraded.map(q => evaluateSubjective(q, answers[q.id] || ""))
      const audits = await Promise.all(auditPromises)

      audits.forEach(audit => {
        totalScore += (audit.score * pointsPerQuestion)
        aiFeedbackChain += audit.feedback + " "
        aiJustificationChain += audit.justification + " "
      })

      setAiAuditResults({
        feedback: aiFeedbackChain || "Assessment complete. All questions were auto-graded.",
        justification: aiJustificationChain,
      })

      return Math.round(totalScore)
    })()

    setFinalScore(finalPercentage)
    setAiAuditResults({
      feedback: aiFeedbackChain || "Assessment complete. All questions were auto-graded.",
      justification: aiJustificationChain,
    })

    if (activeTest && user) {
      submitTestResult({
        id: `test-res-${Date.now()}`,
        templateId: activeTest.id,
        studentId: user.id,
        studentName: user.name,
        assignedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'Completed',
        randomizedQuestions,
        answers,
        score: finalPercentage,
        feedback: aiFeedbackChain,
      })
    }

    setIsEvaluating(false)
    setShowResult(true)
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
    if (isAuto) toast.error("Assessment auto-submitted due to proctoring violations.", {
      style: { backgroundColor: 'oklch(0.577 0.245 27.325)', color: 'white' },
    })
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ── Question render helper ─────────────────────────────────────────────────
  const renderQuestionInput = (q: Question) => {
    const qId = q.id
    const currentAnswer = answers[qId] || ''

    // True / False
    if (q.type === 'True/False') {
      return (
        <div className="grid grid-cols-2 gap-3 pt-4">
          {['True', 'False'].map(opt => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [qId]: opt })}
              className={`rounded-xl border-2 p-4 font-semibold text-sm transition-premium flex items-center justify-center gap-2 ${
                currentAnswer === opt
                  ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
                  : 'border-border text-foreground/70 hover:border-primary/30 hover:bg-muted/50'
              }`}
            >
              {opt === 'True'
                ? <CheckCircle className={`w-4 h-4 ${currentAnswer === opt ? 'text-primary' : 'text-muted-foreground/40'}`} />
                : <XCircle    className={`w-4 h-4 ${currentAnswer === opt ? 'text-primary' : 'text-muted-foreground/40'}`} />
              }
              {opt}
            </button>
          ))}
        </div>
      )
    }

    // Fill in the Blanks
    if (q.type === 'Fill in the Blanks') {
      const parts = q.content.split('____')
      return (
        <div className="pt-4 space-y-4">
          <p className="font-serif text-xl sm:text-2xl leading-loose text-foreground/90">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span className="inline-block relative mx-1 align-baseline">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
                      className="border-b-2 border-primary bg-transparent text-center text-primary font-semibold focus:outline-none w-32 pb-0.5 placeholder:text-muted-foreground/30"
                      placeholder="________"
                      autoComplete="off"
                    />
                  </span>
                )}
              </span>
            ))}
          </p>
          <p className="text-editorial-label text-xs">Type your answer in the blank above.</p>
        </div>
      )
    }

    // Writing
    if (q.type === 'Writing') {
      const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0
      return (
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-editorial-label text-xs">Essay Response</Label>
            <span className={`font-mono text-xs font-bold tabular-nums ${wordCount === 0 ? 'text-muted-foreground/40' : wordCount < 80 ? 'text-warning' : 'text-success'}`}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          <Textarea
            placeholder="Write your structured essay response here. Aim for at least 80 words."
            className="min-h-[300px] sm:min-h-[340px] resize-y text-base p-4 leading-relaxed bg-background/50 border-2 focus:border-primary/40 rounded-xl"
            value={currentAnswer}
            onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
            spellCheck={false}
          />
          {wordCount > 0 && wordCount < 80 && (
            <p className="text-xs text-warning/80 font-medium">Aim for at least 80 words for a complete academic response.</p>
          )}
        </div>
      )
    }

    // Column Matching
    if (q.type === 'Matching' && q.matchPairs) {
      const studentPairs: Record<string, string> = (() => {
        try { return JSON.parse(currentAnswer || '{}') } catch { return {} }
      })()
      // Ensure unique options in dropdown
      const allRights = Array.from(new Set([...q.matchPairs].map(p => p.right))).sort()

      return (
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <p className="text-editorial-label text-[10px] pl-1">Column A — Term</p>
            <p className="text-editorial-label text-[10px] pl-1">Column B — Match</p>
          </div>
          {q.matchPairs.map((pair, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-center">
              <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm font-medium leading-tight">
                {pair.left}
              </div>
              <Select
                value={studentPairs[pair.left] || ''}
                onValueChange={val => {
                  const updated = { ...studentPairs, [pair.left]: val }
                  setAnswers({ ...answers, [qId]: JSON.stringify(updated) })
                }}
              >
                <SelectTrigger className="h-9 text-sm border-2 rounded-xl focus:border-primary/40">
                  <SelectValue placeholder="Select match…" />
                </SelectTrigger>
                <SelectContent>
                  {allRights.map(right => (
                    <SelectItem key={right} value={right} className="text-sm">{right}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )
    }

    // MCQ
    if (q.type === 'MCQ') {
      return (
        <RadioGroup
          value={currentAnswer}
          onValueChange={val => setAnswers({ ...answers, [qId]: val })}
          className="grid gap-2 sm:grid-cols-2 pt-4"
        >
          {q.options?.map((opt, i) => (
            <div
              key={i}
              className={`group relative flex items-center space-x-3 rounded-xl border-2 p-3 sm:p-4 transition-premium cursor-pointer ${
                currentAnswer === opt
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/20 hover:bg-muted/40'
              }`}
              onClick={() => setAnswers({ ...answers, [qId]: opt })}
            >
              <RadioGroupItem value={opt} id={`opt-${i}`} className="sr-only" />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${currentAnswer === opt ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {currentAnswer === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm font-medium leading-tight">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      )
    }

    // Reading — Subjective answer below passage
    if (q.type === 'Reading') {
      return (
        <div className="space-y-3 pt-4">
          {q.passageText && (
            <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-4 space-y-2">
              <p className="text-editorial-label text-[10px] flex items-center gap-1.5 text-primary/70">
                <BookOpen className="w-3 h-3" /> Reading Passage
              </p>
              <div className="max-h-[180px] overflow-y-auto pr-1">
                <p className="font-serif text-base leading-relaxed text-foreground/80">{q.passageText}</p>
              </div>
            </div>
          )}
          <Label className="text-editorial-label text-xs">Comprehension Response</Label>
          <Textarea
            placeholder="Write your answer based on the passage above."
            className="min-h-[140px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
            value={currentAnswer}
            onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
            spellCheck={false}
          />
        </div>
      )
    }

    // Listening — audio player + text response
    if (q.type === 'Listening') {
      return (
        <div className="space-y-3 pt-4">
          {q.audioUrl && (
            <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-editorial-label text-[10px] text-primary/70 mb-1.5">Listening Clip — Play before answering</p>
                <audio ref={audioRef} controls src={q.audioUrl} className="w-full h-8" />
              </div>
            </div>
          )}
          <Label className="text-editorial-label text-xs">Your Response</Label>
          <Textarea
            placeholder="Describe or respond to what you heard..."
            className="min-h-[140px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
            value={currentAnswer}
            onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
            spellCheck={false}
          />
        </div>
      )
    }

    // Subjective (fallback)
    return (
      <div className="space-y-2 pt-4">
        <Label className="text-editorial-label text-xs">Your Academic Response</Label>
        <Textarea
          placeholder="Enter your detailed answer..."
          className="min-h-[220px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
          value={currentAnswer}
          onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
        />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <h1 className="font-serif leading-tight">Assessments</h1>
        <p className="mt-2 text-muted-foreground text-editorial-label">
          Access proctored academic tests and track your real-time results.
        </p>
      </div>

      {/* Listing */}
      <div className="grid gap-4 md:grid-cols-2">
        {availableAssessments.length === 0 ? (
          <Card className="md:col-span-2 border-dashed flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-serif font-semibold">No Assessments Assigned</p>
            <p className="text-sm mt-1">There are no active tests available for your access code.</p>
          </Card>
        ) : (
          availableAssessments.map(test => (
            <Card key={test.id} className="group overflow-hidden border-none shadow-sm ring-1 ring-border bg-card hover:ring-primary/40 transition-premium hover:shadow-md">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-[9px] tracking-widest uppercase font-bold text-primary border-primary/20 bg-primary/5">
                    {test.phase}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Clock className="w-3 h-3" /> {test.durationMinutes} min
                  </div>
                </div>
                <CardTitle className="mt-1 font-serif text-lg">{test.title}</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-wide">
                  {test.nature} · {test.totalMarks} Marks
                </CardDescription>
              </CardHeader>
              <CardFooter className="bg-muted/20 py-3">
                <Button onClick={() => startTest(test)} className="w-full gap-2 font-semibold text-sm">
                  Secure Entry <Lock className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* ── Test Engine Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isTestEngineOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-0 lg:p-8"
          >
            {/* Result screen */}
            {showResult ? (
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-card border shadow-2xl rounded-3xl overflow-hidden"
              >
                <div className="h-1.5 bg-success" />
                <div className="p-6 sm:p-8 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success ring-4 ring-success/10">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold">Assessment Complete</h2>
                    <p className="text-muted-foreground text-sm mt-1">Real-time results based on your performance.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Score', value: `${finalScore}%`, color: 'text-success' },
                      { label: 'Status', value: 'Completed', color: '' },
                      { label: 'Questions', value: String(randomizedQuestions.length), color: '' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{stat.label}</p>
                        <p className={`text-xl font-serif font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {aiAuditResults.feedback && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-left">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                        <TrendingUp className="w-3.5 h-3.5" /> AI Academic Audit
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">"{aiAuditResults.feedback}"</p>
                    </div>
                  )}
                  <Button onClick={() => setIsTestEngineOpen(false)} className="w-full h-11 font-semibold gap-2">
                    Return to Portal <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Active test */
              <div className="w-full h-full max-w-5xl flex flex-col bg-card/60 backdrop-blur-sm lg:rounded-3xl border shadow-2xl relative overflow-hidden">

                {/* Progress bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / randomizedQuestions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Top bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 pt-6 pb-3 border-b bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-base leading-none">{activeTest?.title}</h2>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-widest font-bold">
                        Question {currentQuestionIndex + 1} of {randomizedQuestions.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {strikes > 0 && (
                      <Badge variant="destructive" className="animate-pulse gap-1 text-[10px] rounded-full px-2 py-1">
                        <AlertTriangle className="w-3 h-3" /> {strikes}/3
                      </Badge>
                    )}
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-sm font-bold ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
                      <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>

                {/* Question area */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 lg:px-12 py-6">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 20, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.98 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        opacity: { duration: 0.2 }
                      }}
                      className="space-y-5 max-w-3xl mx-auto w-full"
                    >
                      {randomizedQuestions[currentQuestionIndex] && (
                        <>
                          <div className="space-y-3">
                            <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.25em] font-bold px-2 py-0.5">
                              {randomizedQuestions[currentQuestionIndex].category}
                            </Badge>
                            {/* Don't repeat the content as heading if it's a Fill in the Blanks — the input renders it inline */}
                            {randomizedQuestions[currentQuestionIndex].type !== 'Fill in the Blanks' && (
                              <h3 className="text-xl sm:text-2xl font-serif leading-snug text-foreground">
                                {randomizedQuestions[currentQuestionIndex].content}
                              </h3>
                            )}
                          </div>
                          {renderQuestionInput(randomizedQuestions[currentQuestionIndex])}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t bg-muted/20 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-xl gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>

                  {currentQuestionIndex === randomizedQuestions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => finishTest(false)}
                      className="bg-success hover:bg-success/90 rounded-xl px-6 font-bold gap-1.5 shadow-md shadow-success/20"
                    >
                      Finish & Submit <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(p => p + 1)}
                      className="rounded-xl px-6 font-bold gap-1.5"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Pause overlay */}
                {isPaused && (
                  <div className="absolute inset-0 z-[110] bg-background/80 backdrop-blur-lg flex items-center justify-center p-6">
                    <Card className="max-w-sm w-full border-destructive shadow-2xl">
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <CardTitle className="font-serif text-xl">Test Interrupted</CardTitle>
                        <p className="text-muted-foreground text-xs mt-1">
                          A proctoring violation was detected. Excessive violations result in auto-submission.
                        </p>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex justify-center gap-2 mb-4">
                          {[1, 2, 3].map(s => (
                            <div key={s} className={`w-10 h-1.5 rounded-full ${s <= strikes ? 'bg-destructive' : 'bg-muted'}`} />
                          ))}
                        </div>
                        <Button className="w-full font-bold" onClick={() => setIsPaused(false)}>
                          I Understand, Continue
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Evaluating overlay */}
                {isEvaluating && (
                  <div className="absolute inset-0 z-[120] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-16 h-16 mb-5">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-1">AI Academic Audit</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Reviewing your responses against institutional standards.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
