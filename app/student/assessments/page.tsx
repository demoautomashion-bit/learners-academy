'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
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
  Lock, Timer, AlertTriangle, Award, TrendingUp, XCircle, Volume2, BookOpen, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { evaluateSubjective } from "@/lib/ai-auditor"
import { generateRandomizedQuestions } from "@/lib/actions/assessments"
import type { AssessmentTemplate, Question, StudentTest } from "@/lib/types"

const AUTO_GRADED_TYPES = ['MCQ', 'True/False', 'Fill in the Blanks', 'Matching'] as const
const AI_GRADED_TYPES   = ['Subjective', 'Writing', 'Reading', 'Listening'] as const

// ── Components ─────────────────────────────────────────────────────────────
function BlankInput({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void 
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="relative z-50 pointer-events-auto cursor-text border-b-2 border-primary bg-primary/5 text-center text-primary font-semibold focus:outline-none min-w-[140px] pb-1 px-3 rounded-t-md transition-all focus:bg-primary/10 focus:ring-2 focus:ring-primary/20 ring-offset-2"
      placeholder="Type here"
      autoComplete="off"
    />
  );
}

export default function StudentAssessmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { assessments: mockAssessments, questions: mockQuestions, submitTestResult } = useData()

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [storedAssessment, setStoredAssessment] = useState<AssessmentTemplate | null>(null)

  useEffect(() => { 
    setSessionToken(sessionStorage.getItem('current_assessment_code'))
    const storedData = sessionStorage.getItem('current_assessment_data')
    if (storedData) {
      try {
        setStoredAssessment(JSON.parse(storedData))
      } catch (e) {
        console.error("Failed to parse assessment session data", e)
      }
    }
  }, [])

  const availableAssessments = storedAssessment 
    ? [storedAssessment]
    : mockAssessments.filter(a => a.accessCode === sessionToken && a.status === 'active')

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
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false)
  const [adaptivePools, setAdaptivePools] = useState<Record<string, Question[]>>({ Easy: [], Medium: [], Hard: [] })
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('Medium')
  const [adaptiveHistory, setAdaptiveHistory] = useState<{questionId: string, difficulty: string, score: number}[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)

  // ── Start Test ──────────────────────────────────────────────────────────────
  const startTest = async (assessment: AssessmentTemplate) => {
    try {
      // Step 1: Explicit Identity Guard
      if (!user || !user.id || user.id === 'undefined' || user.id === 'null') {
        console.error("[Verification Failure] Auth data missing unique identifier", { user })
        toast.error("Institutional Link Not Established", { 
          description: "Your session identity is not yet stable. Please refresh or re-enter through the main portal."
        })
        return
      }

      toast.loading("Shuffling institutional registry blocks...", { id: "test-start" })
      
      // Step 5: Temporary Debug Audit
      console.log(`[Test Initiation] Attempting secure randomized session for ${user.id} on test ${assessment.id}`)
      
      // Step 6: Server Action with Hard Validation
      const result = await generateRandomizedQuestions(user.id, assessment.id)

      if (!result.success) {
        throw new Error(result.error || "Registry synthesis failed")
      }

      const isAdaptive = !!result.isAdaptive
      setIsAdaptiveMode(isAdaptive)

      if (isAdaptive && result.pools) {
         setAdaptivePools(result.pools)
         setCurrentDifficulty('Medium')
         setAdaptiveHistory([])
         
         const startPool = [...(result.pools.Medium || [])]
         const firstQ = startPool.pop()
         
         if (!firstQ) throw new Error("Adaptive initialization failed: No baseline (Medium) blocks available.")
         setAdaptivePools(prev => ({ ...prev, Medium: startPool }))
         setRandomizedQuestions([firstQ])
      } else {
         const selected = [...(result.questions || [])]
         setRandomizedQuestions(selected)
      }

      setActiveTest(assessment)
      setTimeLeft(assessment.durationMinutes * 60)
      setIsTestEngineOpen(true)
      setCurrentQuestionIndex(0)
      setAnswers({})
      setStrikes(0)
      setIsPaused(false)
      setShowResult(false)

      toast.success("Security Vault Entry Authorized", { id: "test-start" })

      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() =>
          toast.error("Please enable fullscreen for the best testing experience.")
        )
      }
    } catch (err: any) {
      console.error("[Test Start Error]", err)
      if (err.message?.includes("Duplicate response")) {
          sessionStorage.removeItem('current_assessment_code')
          sessionStorage.removeItem('current_assessment_data')
          router.push('/student')
      }
      toast.error(err.message || "Failed to initiate assessment sequence.", { id: "test-start" })
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

    let totalScore = 0

    if (isAdaptiveMode) {
      randomizedQuestions.forEach((q, i) => {
         const h = adaptiveHistory[i]
         const getPointsForQuestion = (qType: string) => {
            const allocationMap = activeTest?.markAllocation as Record<string, number> | undefined
            if (allocationMap) {
               const categoryTotalMarks = Number(allocationMap[qType]) || 0
               const categoryQuestionsCount = randomizedQuestions.filter(rq => rq.type === qType).length
               return categoryQuestionsCount > 0 ? categoryTotalMarks / categoryQuestionsCount : 0
            }
            const totalScorable = randomizedQuestions.length
            return totalScorable > 0 ? (activeTest?.totalMarks || 100) / totalScorable : 0
         }
         const points = getPointsForQuestion(q.type)
         totalScore += (h?.score || 0) * points
      })
      const finalCalculatedScore = Math.round(totalScore)
      setFinalScore(finalCalculatedScore)
      setIsEvaluating(false)
      setShowResult(true)
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
      if (isAuto) toast.error("Assessment auto-submitted due to proctoring violations.", {
         style: { backgroundColor: 'oklch(0.577 0.245 27.325)', color: 'white' },
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
             score: finalCalculatedScore,
             feedback: aiAuditResults.feedback || "Adaptive assessment complete.",
             evaluationCategory: activeTest.evaluationCategory,
          }).then(() => {
             // Task: Prevent retake loophole by clearing session immediately
             sessionStorage.removeItem('current_assessment_code')
             sessionStorage.removeItem('current_assessment_data')
          }).catch(console.error)
      }
      return
    }

    // 1. Auto-graded questions evaluation
    const autoGraded = randomizedQuestions.filter(q => (AUTO_GRADED_TYPES as readonly string[]).includes(q.type))
    const aiGraded   = randomizedQuestions.filter(q => (AI_GRADED_TYPES as readonly string[]).includes(q.type))

    const getPointsForQuestion = (qType: string) => {
      const allocationMap = activeTest?.markAllocation as Record<string, number> | undefined
      if (allocationMap) {
        const categoryTotalMarks = Number(allocationMap[qType]) || 0
        const categoryQuestionsCount = randomizedQuestions.filter(rq => rq.type === qType).length
        return categoryQuestionsCount > 0 ? categoryTotalMarks / categoryQuestionsCount : 0
      }
      // Fallback
      const totalScorable = randomizedQuestions.length
      return totalScorable > 0 ? (activeTest?.totalMarks || 100) / totalScorable : 0
    }

    autoGraded.forEach(q => {
      const points = getPointsForQuestion(q.type)
      if (q.type === 'Matching') {
        try {
          const studentPairs = JSON.parse(answers[q.id] || '{}')
          const allCorrect = (q.matchPairs || []).every(p => studentPairs[p.left] === p.right)
          if (allCorrect) totalScore += points
        } catch {}
      } else if (q.type === 'Fill in the Blanks') {
        const parts = q.content.split(/_{3,}/)
        const studentAnswer = parts.slice(0, -1).map((_, i) => (answers[`${q.id}-${i}`] || '').trim().toLowerCase()).join(' ')
        const correctAnswer = (q.correctAnswer || '').trim().toLowerCase()
        if (studentAnswer === correctAnswer) totalScore += points
      } else {
        if (answers[q.id] === q.correctAnswer) totalScore += points
      }
    })

    // 2. AI-graded questions evaluation
    // Layer 3 Fix: If a question has a correctAnswer (e.g. Listening MCQ-style), grade it locally.
    // Only send to AI evaluator if no correctAnswer exists (true subjective/writing).
    const locallyGradable = aiGraded.filter(q => q.correctAnswer && q.correctAnswer.trim() !== '')
    const trueSubjective  = aiGraded.filter(q => !q.correctAnswer || q.correctAnswer.trim() === '')

    // Grade locally-gradable AI-type questions (Listening, Reading with correctAnswer)
    locallyGradable.forEach(q => {
      const points = getPointsForQuestion(q.type)
      if (answers[q.id] === q.correctAnswer) totalScore += points
    })

    // Send true subjective questions to the AI auditor
    const auditPromises = trueSubjective.map(q => evaluateSubjective(q, answers[q.id] || ""))
    const audits = await Promise.all(auditPromises)

    let aiFeedbackChain = ""
    let aiJustificationChain = ""

    audits.forEach((audit, index) => {
      const q = trueSubjective[index]
      const points = getPointsForQuestion(q.type)
      totalScore += (audit.score * points)
      aiFeedbackChain += audit.feedback + " "
      aiJustificationChain += audit.justification + " "
    })

    const finalCalculatedScore = Math.round(totalScore)
    const totalMarks = activeTest?.totalMarks || 100
    const percentage = Math.round((finalCalculatedScore / totalMarks) * 100)

    // Layer 2 Fix: Score-aware fallback feedback (always meaningful, never blank)
    const scoreFeedback = aiFeedbackChain.trim() || (
      percentage >= 70
        ? "Strong academic performance. All key concepts were clearly demonstrated in your responses."
        : percentage >= 50
        ? "Satisfactory performance. A few areas need further reinforcement before the next assessment."
        : "Additional review is recommended. The core concepts were not sufficiently addressed in your responses."
    )

    // 3. Final State Update & Persistence
    setAiAuditResults({
      feedback: scoreFeedback,
      justification: aiJustificationChain || "Assessment auto-graded by institutional engine.",
    })
    setFinalScore(finalCalculatedScore)

    // Stop evaluating and show results instantly
    setIsEvaluating(false)
    setShowResult(true)
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
    if (isAuto) toast.error("Assessment auto-submitted due to proctoring violations.", {
      style: { backgroundColor: 'oklch(0.577 0.245 27.325)', color: 'white' },
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
        score: finalCalculatedScore,
        feedback: aiFeedbackChain,
        evaluationCategory: activeTest.evaluationCategory,
      }).then(() => {
        // Task: Prevent retake loophole by clearing session immediately
        sessionStorage.removeItem('current_assessment_code')
        sessionStorage.removeItem('current_assessment_data')
      }).catch(console.error)
    }
  }

  const handleAdaptiveSubmit = async () => {
     setIsEvaluating(true)
     const q = randomizedQuestions[currentQuestionIndex]
     const answer = answers[q.id] || ""
     let score = 0
     
     const isAuto = (AUTO_GRADED_TYPES as readonly string[]).includes(q.type)
     if (isAuto) {
        if (q.type === 'Matching') {
           try {
             const studentPairs = JSON.parse(answer || '{}')
             const allCorrect = (q.matchPairs || []).every(p => studentPairs[p.left] === p.right)
             if (allCorrect) score = 1
           } catch {}
        } else if (q.type === 'Fill in the Blanks') {
           const parts = q.content.split(/_{3,}/)
           const studentAnswer = parts.slice(0, -1).map((_, i) => (answers[`${q.id}-${i}`] || '').trim().toLowerCase()).join(' ')
           if (studentAnswer === q.correctAnswer?.toLowerCase().trim()) score = 1
        } else {
           if (answer === q.correctAnswer) score = 1
        }
     } else {
        const audit = await evaluateSubjective(q, answer)
        score = audit.score
        setAiAuditResults(prev => ({ 
           feedback: prev.feedback + audit.feedback + " ", 
           justification: prev.justification + audit.justification + " " 
        }))
     }

     setAdaptiveHistory(prev => {
        const newHistory = [...prev]
        newHistory[currentQuestionIndex] = { questionId: q.id, difficulty: currentDifficulty, score }
        return newHistory
     })

     const targetLength = activeTest?.questionCount || 10
     if (currentQuestionIndex + 1 >= targetLength) {
        finishTest(false)
        return
     }

     let nextDifficulty = currentDifficulty
     if (score > 0.8) {
        if (currentDifficulty === 'Easy') nextDifficulty = 'Medium'
        else nextDifficulty = 'Hard'
     } else if (score < 0.4) {
        if (currentDifficulty === 'Hard') nextDifficulty = 'Medium'
        else nextDifficulty = 'Easy'
     }

     let pool = [...(adaptivePools[nextDifficulty] || [])]
     if (pool.length === 0) {
        nextDifficulty = 'Medium'
        pool = [...(adaptivePools['Medium'] || [])]
     }
     if (pool.length === 0) {
        const fallbackDiff = Object.keys(adaptivePools).find(k => (adaptivePools[k] || []).length > 0)
        if (fallbackDiff) {
           nextDifficulty = fallbackDiff
           pool = [...adaptivePools[fallbackDiff]]
        } else {
           finishTest(false)
           return
        }
     }

     const nextQ = pool.pop()!
     setAdaptivePools(prev => ({ ...prev, [nextDifficulty]: pool }))
     setCurrentDifficulty(nextDifficulty)
     setRandomizedQuestions(prev => [...prev, nextQ])
     setCurrentQuestionIndex(prev => prev + 1)
     setIsEvaluating(false)
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ── Question render helper ─────────────────────────────────────────────────
  const renderQuestionInput = (q: Question) => {
    const qId = q.id
    const currentAnswer = answers[qId] || ''

    // ── Helper: Cloze / Gap Fill Renderer ────────────────────────────────────
    const renderClozeInput = (content: string, qId: string) => {
      const parts = content.split(/_{3,}/)
      return (
        <div className="pt-4 space-y-4">
          <div className="font-serif text-xl sm:text-2xl leading-relaxed text-foreground/90 flex flex-wrap items-center gap-x-3 gap-y-10">
            {parts.map((part, i) => (
              <span key={i} className="flex items-center gap-3 flex-wrap">
                <span>{part}</span>
                {i < parts.length - 1 && (
                  <div className="py-2">
                    <BlankInput 
                      value={answers[`${qId}-${i}`] || ''}
                      onChange={(val) => setAnswers(prev => ({ ...prev, [`${qId}-${i}`]: val }))}
                    />
                  </div>
                )}
              </span>
            ))}
          </div>
          <p className="text-editorial-label text-[10px] opacity-60 mt-4">Complete the sentence by filling all blanks above.</p>
        </div>
      )
    }

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
      return renderClozeInput(q.content, qId)
    }

    // Writing
    if (q.type === 'Writing') {
      const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0
      return (
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-editorial-label text-xs">Essay Response</Label>
            <span className={`font-sans text-xs font-bold tabular-nums ${wordCount === 0 ? 'text-muted-foreground/40' : wordCount < 80 ? 'text-warning' : 'text-success'}`}>
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
    if (q.type === 'Matching') {
      const studentPairs: Record<string, string> = (() => {
        try { return JSON.parse(currentAnswer || '{}') } catch { return {} }
      })()

      // Robust data normalization (handles both Array and String from JSON fields)
      const rawPairs = q.matchPairs || []
      const pairs = Array.isArray(rawPairs) 
        ? rawPairs 
        : typeof rawPairs === 'string' 
          ? JSON.parse(rawPairs) 
          : []

      const allRights = Array.from(new Set(pairs.map((p: any) => p.right))).sort()

      return (
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <p className="text-editorial-label text-[10px] pl-1">Column A — Term</p>
            <p className="text-editorial-label text-[10px] pl-1">Column B — Match</p>
          </div>
          {pairs.map((pair: any, i: number) => (
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
                <SelectContent className="z-[151]">
                  {allRights.map((right: any) => (
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

    // Reading — Interactive Blanks or Subjective
    if (q.type === 'Reading') {
      const isCloze = q.content.includes('____')
      return (
        <div className="space-y-6 pt-4">
          {q.passageText && (
            <div className="rounded-3xl border border-primary/10 bg-primary/[0.02] p-8 space-y-4 shadow-inner">
              <p className="text-editorial-label text-[10px] uppercase tracking-widest flex items-center gap-2 text-primary/70 font-bold">
                <BookOpen className="w-4 h-4" /> Institutional Reading Passage
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                <p className="font-serif text-lg leading-relaxed text-foreground/80 first-letter:text-4xl first-letter:font-bold first-letter:mr-1">{q.passageText}</p>
              </div>
            </div>
          )}
          
          {isCloze ? (
             <div className="bg-background/40 p-6 rounded-[2rem] border border-primary/5">
                <p className="text-editorial-label text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Task: Gap-Fill Analysis</p>
                {renderClozeInput(q.content, qId)}
             </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-editorial-label text-xs">Comprehension Response</Label>
              <Textarea
                placeholder="Write your answer based on the passage above."
                className="min-h-[140px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
                value={currentAnswer}
                onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      )
    }

    // Listening — Interactive Blanks or Subjective
    if (q.type === 'Listening') {
      const isCloze = q.content.includes('____')
      return (
        <div className="space-y-6 pt-4">
          {q.audioUrl && (
            <div className="rounded-3xl border border-primary/10 bg-primary/[0.02] p-6 flex flex-col gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-sm">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-editorial-label text-[10px] uppercase tracking-widest text-primary/70 font-bold mb-1">Auditory Assessment Clip</p>
                  <p className="text-xs text-muted-foreground opacity-60">Listen carefully before attempting the task below.</p>
                </div>
              </div>
              <div className="bg-background/50 p-2 rounded-2xl border border-primary/5">
                <audio ref={audioRef} controls src={q.audioUrl} className="w-full h-10" />
              </div>
            </div>
          )}

          {isCloze ? (
             <div className="bg-background/40 p-8 rounded-[2.5rem] border border-primary/5">
                <p className="text-editorial-label text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4 font-bold">Task: Auditory Gap-Fill Transcript</p>
                {renderClozeInput(q.content, qId)}
             </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-editorial-label text-xs">Your Response</Label>
              <Textarea
                placeholder="Describe or respond to what you heard..."
                className="min-h-[140px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
                value={currentAnswer}
                onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
                spellCheck={false}
              />
            </div>
          )}
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/10">
        <div className="space-y-1">
          <h1 className="font-serif text-5xl font-bold text-foreground drop-shadow-sm">Assessments</h1>
          <p className="text-muted-foreground text-editorial-label uppercase tracking-[0.2em] opacity-60">Proctored Academic Registry</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 px-5 py-3 rounded-2xl border border-primary/10 backdrop-blur-sm">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <p className="text-[10px] font-medium uppercase tracking-widest text-primary">Identity: {user?.name || 'Verifying...'}</p>
        </div>
      </div>

      {/* Available Assessments Section */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center gap-3">
           <BookOpen className="w-6 h-6 text-primary" />
           <h2 className="text-2xl font-serif font-normal">Active Institutional Assessments</h2>
        </div>

        {availableAssessments.length === 0 ? (
          <Card className="border-dashed border-primary/20 bg-primary/5 rounded-[3rem] p-16 text-center animate-in fade-in zoom-in duration-500">
            <Lock className="w-16 h-16 text-primary/20 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold">No active sessions found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">Your access token does not match any current active assessments in this academic branch.</p>
            <Button 
              onClick={() => router.push('/student')} 
              variant="outline"
              className="mt-8 rounded-xl px-8 font-bold border-primary/20 hover:bg-primary/5 text-primary"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Return to Credentials
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableAssessments.map((assessment) => {
              const isSessionReady = !!user && !!user.id && user.id !== 'undefined' && user.id !== 'null'
              
              return (
                <Card 
                  key={assessment.id} 
                  className={cn(
                    "group rounded-[2.5rem] border-primary/10 bg-card/40 backdrop-blur-2xl shadow-premium overflow-hidden hover:shadow-massive hover-lift transition-premium relative",
                    !isSessionReady && "opacity-60 grayscale-[0.5] cursor-not-allowed"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <CardHeader className="p-8 pb-4 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/5 border-primary/10 px-3 py-1 font-medium">{assessment.nature}</Badge>
                      <div className="p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/20 shadow-sm">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="font-serif text-2xl group-hover:text-primary transition-colors pr-4 font-semibold">{assessment.title}</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-40 mt-2">Institutional Examination Profile</CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 space-y-8">
                    <div className="grid grid-cols-2 gap-6 bg-primary/[0.03] p-4 rounded-2xl border border-primary/5">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest font-black text-primary/60">Duration</p>
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-primary" />
                          <span className="text-sm font-sans font-bold">{assessment.durationMinutes}m</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest font-black text-primary/60">Registry Blocks</p>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm font-sans font-bold">{assessment.questionCount || 10} Units</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => isSessionReady && startTest(assessment)}
                      disabled={!isSessionReady}
                      className={cn(
                        "w-full h-14 rounded-2xl text-[11px] uppercase tracking-widest font-bold shadow-xl group/btn transition-all duration-500",
                        isSessionReady 
                          ? "bg-primary text-white shadow-primary/20 hover:scale-[1.01] active:scale-95" 
                          : "bg-muted text-muted-foreground shadow-none"
                      )}
                    >
                      {isSessionReady ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                          Authorized Secure Entry
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Authenticating Identity...
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Test Engine Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isTestEngineOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl overflow-y-auto px-4 py-12 sm:px-8 lg:px-12 flex justify-center"
          >
            {/* Result screen */}
            {showResult ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-card border-primary/10 shadow-massive rounded-[3rem] h-fit mb-24"
              >
                <div className="h-1.5 bg-success/50 w-full rounded-t-full" />
                <div className="p-8 sm:p-10 text-center space-y-8">
                  <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success ring-8 ring-success/5 shadow-inner">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-foreground">Assessment Complete</h2>
                    <p className="text-muted-foreground text-sm mt-1 opacity-60">Your submission has been recorded.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    {[
                      { label: 'Final Score', value: `${finalScore} / ${activeTest?.totalMarks || 100}`, color: 'text-success' },
                      { label: 'Percentage', value: `${Math.round((finalScore / (activeTest?.totalMarks || 100)) * 100)}%`, color: finalScore / (activeTest?.totalMarks || 100) >= 0.5 ? 'text-success' : 'text-destructive' },
                      { label: 'Questions', value: `${randomizedQuestions.length} Blocks`, color: 'text-primary' },
                      { label: 'Status', value: finalScore / (activeTest?.totalMarks || 100) >= 0.5 ? 'Pass ✓' : 'Review ⚠', color: finalScore / (activeTest?.totalMarks || 100) >= 0.5 ? 'text-success' : 'text-amber-500' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60 mb-1">{stat.label}</p>
                        <p className={`text-xl font-serif font-semibold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {aiAuditResults.feedback && (
                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 text-left">
                      <h4 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
                        <TrendingUp className="w-4 h-4" /> AI Academic Audit
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">"{aiAuditResults.feedback}"</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-primary/5">
                    <Button 
                      onClick={() => {
                        sessionStorage.removeItem('current_assessment_code')
                        sessionStorage.removeItem('current_assessment_data')
                        setIsTestEngineOpen(false)
                        router.push('/student')
                      }} 
                      size="lg"
                      className="w-full h-14 font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Return to Credentials <ArrowRight className="w-5 h-5" />
                    </Button>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mt-4">Secure Session Termination</p>
                  </div>
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
                      <h2 className="font-serif font-semibold text-base leading-none">{activeTest?.title}</h2>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
                        Question {currentQuestionIndex + 1} of {randomizedQuestions.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {strikes > 0 && (
                      <Badge variant="destructive" className="animate-pulse gap-1 text-[10px] rounded-full px-2 py-1 font-medium">
                        <AlertTriangle className="w-3 h-3" /> {strikes}/3
                      </Badge>
                    )}
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans text-sm font-semibold ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
                      <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>

                {/* Question area */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 lg:px-12 py-6">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      className="space-y-5 max-w-3xl mx-auto w-full"
                    >
                      {randomizedQuestions[currentQuestionIndex] && (
                        <>
                          <div className="space-y-3">
                            <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.25em] font-medium px-2 py-0.5 bg-secondary/50 border-secondary/10">
                              {randomizedQuestions[currentQuestionIndex].category}
                            </Badge>
                            {/* Don't repeat the content as heading if it's a Fill in the Blanks — the input renders it inline */}
                            {randomizedQuestions[currentQuestionIndex].type !== 'Fill in the Blanks' && (
                              <h3 className="text-xl sm:text-2xl font-serif leading-snug text-foreground font-medium">
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
                  {!isAdaptiveMode ? (
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="rounded-xl gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                  ) : <div />}

                  {(isAdaptiveMode ? currentQuestionIndex === (activeTest?.questionCount || 10) - 1 : currentQuestionIndex === randomizedQuestions.length - 1) ? (
                    <Button
                      size="sm"
                      onClick={() => isAdaptiveMode ? handleAdaptiveSubmit() : finishTest(false)}
                      className="bg-success hover:bg-success/90 rounded-xl px-6 font-bold gap-1.5 shadow-md shadow-success/20"
                    >
                      Finish & Submit <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => isAdaptiveMode ? handleAdaptiveSubmit() : setCurrentQuestionIndex(p => p + 1)}
                      className="rounded-xl px-6 font-bold gap-1.5"
                    >
                      {isAdaptiveMode ? "Submit Answer & Continue" : "Next"} <ChevronRight className="w-4 h-4" />
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
