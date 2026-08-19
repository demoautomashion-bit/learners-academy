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
  Lock, Timer, AlertTriangle, Award, TrendingUp, XCircle, Volume2, BookOpen, Zap, CheckSquare, Mic, Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { evaluateSubjective } from "@/lib/ai-auditor"
import { generateRandomizedQuestions } from "@/lib/actions/assessments"
import { submitTestResult as directSubmitTestResult } from "@/lib/actions/submissions"
import type { AssessmentTemplate, Question, StudentTest } from "@/lib/types"

const AUTO_GRADED_TYPES = ['MCQ', 'True/False', 'True/False/Not Given', 'Yes/No/Not Given', 'MultiSelect', 'Fill in the Blanks', 'Matching'] as const
const AI_GRADED_TYPES   = ['Subjective', 'Writing', 'Reading', 'Listening', 'Speaking'] as const

// ── Components ─────────────────────────────────────────────────────────────
function WatermarkOverlay({ name, id }: { name: string; id: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden opacity-[0.03] select-none" aria-hidden="true">
      <div className="absolute inset-0 flex flex-wrap gap-20 p-20 rotate-[-25deg] scale-150">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="text-xl font-bold whitespace-nowrap tracking-widest text-foreground uppercase">
            {name} — {id}
          </div>
        ))}
      </div>
    </div>
  )
}

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
      className="relative z-50 pointer-events-auto cursor-text border-b-2 border-primary bg-primary/5 text-center text-primary font-semibold focus:outline-none min-w-[100px] sm:min-w-[140px] pb-1 px-3 rounded-t-md transition-all focus:bg-primary/10 focus:ring-2 focus:ring-primary/20 ring-offset-2"
      placeholder="…"
      autoComplete="one-time-code"
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="none"
      inputMode="text"
      data-gramm="false"
    />
  );
}

function canonicalizeIeltsAnswer(val: string): string {
  const clean = String(val || '').trim().toUpperCase().replace(/^["']|["']$/g, '')
  if (clean === 'T' || clean === 'TRUE') return 'TRUE'
  if (clean === 'F' || clean === 'FALSE') return 'FALSE'
  if (clean === 'NG' || clean === 'NOT GIVEN' || clean === 'NOTGIVEN') return 'NOT GIVEN'
  if (clean === 'Y' || clean === 'YES') return 'YES'
  if (clean === 'N' || clean === 'NO') return 'NO'
  return clean
}

function parseMultiBlankCorrectAnswers(rawCorrect: string, numBlanks: number): string[][] {
  const raw = String(rawCorrect || '').trim()
  if (!raw) return Array.from({ length: numBlanks }, () => [])

  let blankItems: string[] = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      blankItems = parsed.map(s => String(s).trim())
    }
  } catch {}

  if (blankItems.length === 0) {
    if (raw.includes(';')) {
      blankItems = raw.split(';').map(s => s.trim())
    } else if (raw.includes(',')) {
      blankItems = raw.split(',').map(s => s.trim())
    } else {
      blankItems = [raw]
    }
  }

  const result: string[][] = []
  for (let i = 0; i < numBlanks; i++) {
    const item = blankItems[i] || (blankItems.length === 1 && numBlanks > 1 ? blankItems[0].split(' ')[i] : '') || ''
    const variants = item.split(/[\/|;]/).map(s => s.trim().toLowerCase().replace(/^["']|["']$/g, '')).filter(Boolean)
    result.push(variants)
  }
  return result
}

function evaluateMultiSelect(sqAns: string, rawCorrect: string, options?: string[], sqPts: number = 1, maxSelections?: number): number {
  let studentChoices: string[] = []
  try {
    const parsed = JSON.parse(sqAns)
    if (Array.isArray(parsed)) studentChoices = parsed.map(s => String(s).trim())
    else studentChoices = String(sqAns).split(',').map(s => s.trim())
  } catch {
    studentChoices = String(sqAns || '').split(',').map(s => s.trim())
  }

  let correctChoicesRaw: string[] = []
  try {
    const parsed = JSON.parse(rawCorrect || '[]')
    if (Array.isArray(parsed)) correctChoicesRaw = parsed.map(s => String(s).trim())
    else correctChoicesRaw = String(rawCorrect || '').split(/[,;]/).map(s => s.trim())
  } catch {
    correctChoicesRaw = String(rawCorrect || '').split(/[,;]/).map(s => s.trim())
  }

  studentChoices = studentChoices.map(c => c.replace(/^["']|["']$/g, '')).filter(Boolean)
  correctChoicesRaw = correctChoicesRaw.map(c => c.replace(/^["']|["']$/g, '')).filter(Boolean)

  if (correctChoicesRaw.length === 0) return 0

  const letterToText: Record<string, string> = {}
  const textToLetter: Record<string, string> = {}
  if (options && Array.isArray(options)) {
    options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx)
      const textClean = opt.trim().toLowerCase().replace(/^["']|["']$/g, '')
      letterToText[letter] = textClean
      letterToText[letter.toLowerCase()] = textClean
      textToLetter[textClean] = letter
    })
  }

  const targetKeysSet = new Set<string>()
  correctChoicesRaw.forEach(choice => {
    const upper = choice.toUpperCase()
    targetKeysSet.add(upper)
    const lower = choice.toLowerCase()
    targetKeysSet.add(lower)
    if (letterToText[upper]) targetKeysSet.add(letterToText[upper])
    if (textToLetter[lower]) targetKeysSet.add(textToLetter[lower])
  })

  let matchCount = 0
  studentChoices.forEach(pick => {
    const upper = pick.toUpperCase()
    const lower = pick.toLowerCase()
    const textEquivalent = letterToText[upper] || letterToText[lower]
    if (targetKeysSet.has(upper) || targetKeysSet.has(lower) || (textEquivalent && targetKeysSet.has(textEquivalent))) {
      matchCount++
    }
  })

  const targetCount = Math.max(1, correctChoicesRaw.length)
  return (matchCount / targetCount) * sqPts
}

function scoreMultiBlank(q: Question, answers: Record<string, string>, points: number): number {
  const parts = q.content.split(/_{3,}/)
  const numBlanks = Math.max(1, parts.length - 1)
  let correctBlanks = 0
  let parsedCorrect: string[] = []
  
  const rawCorrect = q.correctAnswer || ''

  try {
    const parsed = JSON.parse(rawCorrect)
    if (Array.isArray(parsed)) {
      parsedCorrect = parsed.map(s => String(s).trim())
    } else if (rawCorrect.includes(',')) {
      parsedCorrect = rawCorrect.split(',').map(s => s.trim())
    } else {
      parsedCorrect = [rawCorrect.trim()]
    }
  } catch {
    if (rawCorrect.includes(',')) {
      parsedCorrect = rawCorrect.split(',').map(s => s.trim())
    } else {
      parsedCorrect = [rawCorrect.trim()]
    }
  }

  for (let i = 0; i < numBlanks; i++) {
    const studentAns = (answers[`${q.id}-${i}`] || '').trim().toLowerCase()
    let correctAns = ''

    if (parsedCorrect.length >= numBlanks) {
      correctAns = (parsedCorrect[i] || '').trim().toLowerCase()
    } else if (parsedCorrect.length === 1) {
      const legacySplit = (parsedCorrect[0] || '').trim().toLowerCase().split(' ')
      correctAns = legacySplit[i] || legacySplit[0] || ''
    } else {
      correctAns = (parsedCorrect[i] || '').trim().toLowerCase()
    }

    if (studentAns && studentAns === correctAns) {
      correctBlanks++
    }
  }
  return points * (correctBlanks / numBlanks)
}

export default function StudentAssessmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { assessments: mockAssessments, questions: mockQuestions } = useData()

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [testTotalMarks, setTestTotalMarks] = useState(100)
  const [aiAuditResults, setAiAuditResults] = useState<{ feedback: string; justification: string }>({ feedback: "", justification: "" })
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false)
  const [adaptivePools, setAdaptivePools] = useState<Record<string, Question[]>>({ Easy: [], Medium: [], Hard: [] })
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('Medium')
  const [adaptiveHistory, setAdaptiveHistory] = useState<{questionId: string, difficulty: string, score: number}[]>([])

  const [isBlackedOut, setIsBlackedOut] = useState(false)
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null)
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const activeRecordingIntervalRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [proctoringLogs, setProctoringLogs] = useState<any[]>([])
  const currentQuestionIndexRef = useRef(currentQuestionIndex)
  const randomizedQuestionsRef = useRef(randomizedQuestions)
  const isSubmittingInProgress = useRef(false)

  const answersRef = useRef(answers)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex
  }, [currentQuestionIndex])

  useEffect(() => {
    randomizedQuestionsRef.current = randomizedQuestions
  }, [randomizedQuestions])

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
      
      const savedAnswers = sessionStorage.getItem(`assessment_answers_${assessment.id}`)
      let initialAnswers: Record<string, string> = {}
      if (savedAnswers) {
        try { initialAnswers = JSON.parse(savedAnswers) } catch (e) {}
      }
      setAnswers(initialAnswers)

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

  // ── Auto-save answers to sessionStorage on every change ───────────────────
  useEffect(() => {
    if (activeTest?.id && Object.keys(answers).length > 0) {
      try {
        sessionStorage.setItem(`assessment_answers_${activeTest.id}`, JSON.stringify(answers))
      } catch (e) {}
    }
  }, [answers, activeTest?.id])

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
      if (isSubmittingInProgress.current) return
      const currentIdx = currentQuestionIndexRef.current
      const currentQ = randomizedQuestionsRef.current[currentIdx]
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        violation: reason,
        questionIndex: currentIdx + 1,
        questionText: currentQ?.content || "N/A"
      }
      setProctoringLogs(prev => [...prev, log])

      if (reason === "Print Screen Attempted") {
        setIsBlackedOut(true)
      }
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

    const onVisibility = () => { 
      if (document.visibilityState === 'hidden') {
        setIsPaused(true)
        handleViolation("Tab Switch Detected")
      }
    }
    const onBlur = () => {
      handleViolation("Window Focus Lost")
    }
    const onFullscreen = () => { 
      const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
      if (isIOS || !document.fullscreenEnabled) return;
      if (!document.fullscreenElement) handleViolation("Fullscreen Exit Detected") 
    }
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        handleViolation("Print Screen Attempted")
      }
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) || e.key === 'F12') {
        e.preventDefault(); 
        handleViolation("Clipboard/Inspector Action")
      }
    }
    const preventRightClick = (e: MouseEvent) => e.preventDefault()
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation("Copy Attempted")
    }

    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    if (!isIOS && document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', onFullscreen)
    }
    window.addEventListener('keydown', preventKeys)
    window.addEventListener('contextmenu', preventRightClick)
    window.addEventListener('copy', preventCopy)
    return () => {
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      if (!isIOS && document.fullscreenEnabled) {
        document.removeEventListener('fullscreenchange', onFullscreen)
      }
      window.removeEventListener('keydown', preventKeys)
      window.removeEventListener('contextmenu', preventRightClick)
      window.removeEventListener('copy', preventCopy)
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

  // ── Submission Retry Helper ─────────────────────────────────────────────────
  // Retries the submission up to maxRetries times with exponential backoff.
  // This gracefully handles temporary DB connection-pool exhaustion under high load.
  const submitWithRetry = async (
    fn: () => Promise<{ success?: boolean } | void>,
    maxRetries = 4
  ): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn()
        // Treat as success if the server returns anything other than explicit failure
        if (!result || (result as any).success !== false) return true
      } catch (err) {
        console.error(`[submitWithRetry] Attempt ${attempt} failed:`, err)
      }
      if (attempt < maxRetries) {
        // Exponential backoff: 800ms, 1600ms, 2400ms…
        await new Promise(r => setTimeout(r, attempt * 800))
      }
    }
    return false
  }

  // ── Score & Submit ─────────────────────────────────────────────────────────
  const finishTest = async (isAuto = false) => {
    if (isSubmittingInProgress.current) return
    isSubmittingInProgress.current = true

    setIsEvaluating(true)

    // Hydrate answers from answersRef, state, and sessionStorage fallback
    let activeAnswers = { ...answersRef.current, ...answers }
    if (activeTest?.id) {
      const saved = sessionStorage.getItem(`assessment_answers_${activeTest.id}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          activeAnswers = { ...parsed, ...activeAnswers }
        } catch (e) {}
      }
    }

    let totalScore = 0

    if (isAdaptiveMode) {
      randomizedQuestions.forEach((q, i) => {
         const h = adaptiveHistory[i]
         const getPointsForQuestion = (qType: string) => {
            const allocationMap = activeTest?.markAllocation as Record<string, number> | undefined
            if (allocationMap && allocationMap[qType] !== undefined && allocationMap[qType] !== null) {
               return Number(allocationMap[qType]) || 1
            }
            return 1 // Fallback
         }
         const points = getPointsForQuestion(q.type)
         totalScore += (h?.score || 0) * points
      })
      const completedTotal = randomizedQuestions.reduce((sum, q) => {
        const allocationMap = activeTest?.markAllocation as Record<string, number> | undefined
        return sum + (allocationMap && allocationMap[q.type] !== undefined ? (Number(allocationMap[q.type]) || 1) : 1)
      }, 0)
      const targetLength = activeTest?.questionCount || 10
      const remainingCount = Math.max(0, targetLength - randomizedQuestions.length)
      const avgPoints = completedTotal / (randomizedQuestions.length || 1)
      const rawTotalMarks = completedTotal + (remainingCount * avgPoints)
      
      // Scale out of 100
      const finalCalculatedScore = Math.round((totalScore / rawTotalMarks) * 100)
      setTestTotalMarks(100)
      setFinalScore(finalCalculatedScore)
      setIsEvaluating(false)
      setShowResult(true)
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
      if (isAuto) toast.error("Assessment auto-submitted due to proctoring violations.", {
         style: { backgroundColor: 'oklch(0.577 0.245 27.325)', color: 'white' },
      })
      if (activeTest && user) {
          setIsSubmitting(true)
          setSubmitError(null)
          try {
              const adaptivePayload = {
                 id: `test-res-${Date.now()}`,
                 templateId: activeTest.id,
                 studentId: user.id,
                 studentName: user.name,
                 assignedAt: new Date().toISOString(),
                 completedAt: new Date().toISOString(),
                 status: 'Completed',
                 randomizedQuestions,
                 answers: { ...activeAnswers, __proctoringLogs: proctoringLogs },
                 score: finalCalculatedScore,
                 feedback: aiAuditResults.feedback || "Adaptive assessment complete.",
                 evaluationCategory: activeTest.evaluationCategory,
              }
              const saved = await submitWithRetry(() => directSubmitTestResult(adaptivePayload, activeTest?.title || 'Test'))
              if (saved) {
                 // Only clear the session after the DB confirms success
                 sessionStorage.removeItem('current_assessment_code')
                 sessionStorage.removeItem('current_assessment_data')
                 if (activeTest?.id) sessionStorage.removeItem(`assessment_answers_${activeTest.id}`)
              } else {
                 setSubmitError("The server is under heavy load. Your score is displayed below — please inform your teacher to check the registry, or try refreshing this page.")
              }
          } catch (err) {
              console.error("Adaptive submission error:", err)
              setSubmitError("An error occurred during results serialization. Your score is displayed below.")
          } finally {
              setIsSubmitting(false)
          }
      }
      return
    }

    // 1. Auto-graded questions evaluation (Excluding parent questions that contain sub-questions)
    const autoGraded = randomizedQuestions.filter(q => 
      (AUTO_GRADED_TYPES as readonly string[]).includes(q.type) && (!q.subQuestions || q.subQuestions.length === 0)
    )

    const aiTyped = randomizedQuestions.filter(q => (AI_GRADED_TYPES as readonly string[]).includes(q.type))

    const alwaysAI = aiTyped.filter(q => q.type === 'Subjective' || q.type === 'Writing' || q.type === 'Speaking')
    const clozeAIType = aiTyped.filter(q =>
      (q.type === 'Reading' || q.type === 'Listening') && 
      q.content.includes('____') && 
      (!q.subQuestions || q.subQuestions.length === 0)
    )
    const openAIType = aiTyped.filter(q =>
      (q.type === 'Reading' || q.type === 'Listening') &&
      !q.content.includes('____') &&
      (!q.correctAnswer || q.correctAnswer.trim() === '') &&
      (!q.subQuestions || q.subQuestions.length === 0)
    )
    const locallyGradable = aiTyped.filter(q =>
      (q.type === 'Reading' || q.type === 'Listening') &&
      !q.content.includes('____') &&
      q.correctAnswer && q.correctAnswer.trim() !== '' &&
      (!q.subQuestions || q.subQuestions.length === 0)
    )

    const normalizeAns = (val: any) => String(val || '').trim().toLowerCase().replace(/^["']|["']$/g, '')

    const getPointsForQuestion = (qType: string) => {
      const allocationMap = activeTest?.markAllocation as Record<string, number> | undefined
      if (allocationMap && allocationMap[qType] !== undefined && allocationMap[qType] !== null) {
        return Number(allocationMap[qType]) || 1
      }
      return 1 // Fallback
    }

    // Grade auto-graded questions
    autoGraded.forEach(q => {
      const points = getPointsForQuestion(q.type)
      if (q.type === 'Matching') {
        try {
          const studentPairs = JSON.parse(activeAnswers[q.id] || '{}')
          const allCorrect = (q.matchPairs || []).every(p => normalizeAns(studentPairs[p.left]) === normalizeAns(p.right))
          if (allCorrect) totalScore += points
        } catch {}
      } else if (q.type === 'Fill in the Blanks') {
        totalScore += scoreMultiBlank(q, activeAnswers, points)
      } else if (q.type === 'MultiSelect') {
        totalScore += evaluateMultiSelect(activeAnswers[q.id] || '', q.correctAnswer || '', q.options, points)
      } else if (q.type === 'True/False/Not Given' || q.type === 'Yes/No/Not Given' || q.type === 'True/False') {
        const studentCanonical = canonicalizeIeltsAnswer(activeAnswers[q.id] || '')
        const correctCanonical = canonicalizeIeltsAnswer(q.correctAnswer || '')
        if (studentCanonical && studentCanonical === correctCanonical) {
          totalScore += points
        }
      } else {
        if (normalizeAns(activeAnswers[q.id]) === normalizeAns(q.correctAnswer)) totalScore += points
      }
    })

    // Grade Cloze-style Reading/Listening (same logic as Fill in the Blanks)
    clozeAIType.forEach(q => {
      const points = getPointsForQuestion(q.type)
      totalScore += scoreMultiBlank(q, activeAnswers, points)
    })

    // Grade locally-gradable MCQ-style Listening/Reading (exact match, no blanks, has correctAnswer)
    locallyGradable.forEach(q => {
      const points = getPointsForQuestion(q.type)
      const studentCanonical = canonicalizeIeltsAnswer(activeAnswers[q.id] || '')
      const correctCanonical = canonicalizeIeltsAnswer(q.correctAnswer || '')
      if ((studentCanonical && studentCanonical === correctCanonical) || (normalizeAns(activeAnswers[q.id]) === normalizeAns(q.correctAnswer))) {
        totalScore += points
      }
    })

    // Grade sub-questions nested under Reading/Listening sets
    const subQuestionPromises: { sq: any; parentQ: Question; sqKey: string; points: number; promise?: Promise<any> }[] = []

    randomizedQuestions.forEach(q => {
      if (q.subQuestions && q.subQuestions.length > 0) {
        q.subQuestions.forEach(sq => {
          const sqKey = `${q.id}_sub_${sq.id}`
          const sqAns = activeAnswers[sqKey] || ''
          const sqPts = sq.points || (sq.type === 'Subjective' ? 3 : 1)

          if (sq.type === 'MCQ' || sq.type === 'True/False' || sq.type === 'True/False/Not Given' || sq.type === 'Yes/No/Not Given') {
            const studentCanonical = canonicalizeIeltsAnswer(sqAns)
            const correctCanonical = canonicalizeIeltsAnswer(sq.correctAnswer || '')
            const normalizedStudent = sqAns.trim().toLowerCase().replace(/^["']|["']$/g, '')
            const normalizedCorrect = (sq.correctAnswer || '').trim().toLowerCase().replace(/^["']|["']$/g, '')
            if ((studentCanonical && studentCanonical === correctCanonical) || (normalizedStudent && normalizedStudent === normalizedCorrect)) {
              totalScore += sqPts
            }
          } else if (sq.type === 'MultiSelect') {
            totalScore += evaluateMultiSelect(sqAns, sq.correctAnswer || '', sq.options, sqPts, sq.maxSelections)
          } else if (sq.type === 'Fill in the Blanks') {
            if (sq.content.includes('____')) {
              // Multi-blank subquestion evaluation: 1 Mark per Blank
              const blankCount = Math.max(1, (sq.content.match(/_{3,}/g) || []).length)
              const parsedBlanks = parseMultiBlankCorrectAnswers(sq.correctAnswer || '', blankCount)

              for (let bIdx = 0; bIdx < blankCount; bIdx++) {
                const blankKey = `${sqKey}_blank_${bIdx}`
                // Fallback lookup: try explicit blank key or flat index
                const studentAns = (activeAnswers[blankKey] || activeAnswers[`${sqKey}_${bIdx}`] || activeAnswers[`${q.id}_sub_${sq.id}_${bIdx}`] || '').trim().toLowerCase().replace(/^["']|["']$/g, '')
                const allowedVariants = parsedBlanks[bIdx] || []
                
                if (studentAns && allowedVariants.some(alt => alt === studentAns)) {
                  totalScore += 1 // 1 Mark per correct blank
                }
              }
            } else {
              const allowed = (sq.correctAnswer || '').split(/[\/|;]/).map(s => s.trim().toLowerCase().replace(/^["']|["']$/g, ''))
              if (sqAns && allowed.some(alt => alt === sqAns.trim().toLowerCase().replace(/^["']|["']$/g, ''))) {
                totalScore += sqPts
              }
            }
          } else if (sq.type === 'Subjective') {
            const subQObj = {
              category: q.category,
              type: 'Subjective',
              content: sq.content,
              correctAnswer: sq.correctAnswer || ''
            }
            subQuestionPromises.push({
              sq,
              parentQ: q,
              sqKey,
              points: sqPts,
              promise: isAuto ? Promise.resolve({
                score: sqAns.trim().length > 10 ? 0.75 : sqAns.trim().length > 0 ? 0.4 : 0,
                feedback: "Sub-question answered.",
                justification: "Auto-graded on submission."
              }) : evaluateSubjective(subQObj as any, sqAns)
            })
          }
        })
      }
    })

    if (subQuestionPromises.length > 0) {
      const subAudits = await Promise.all(subQuestionPromises.map(p => p.promise!))
      subAudits.forEach((audit, idx) => {
        const item = subQuestionPromises[idx]
        totalScore += (audit.score * item.points)
      })
    }

    // Send Subjective, Writing, and open-ended Reading/Listening to AI evaluator
    const trueSubjective = [...alwaysAI, ...openAIType]
    const auditPromises = trueSubjective.map(async (q) => {
      const studentAns = (activeAnswers[q.id] || "").trim()

      if (!studentAns) {
        return {
          score: 0,
          feedback: "Question not answered.",
          justification: "No response submitted."
        }
      }

      // Fast resilient fallback for auto-submitted tests (prevents network drops when backgrounded)
      if (isAuto) {
        const wordCount = studentAns.split(/\s+/).length
        const score = wordCount >= 25 ? 0.9 : wordCount >= 12 ? 0.75 : wordCount >= 4 ? 0.5 : 0.3
        return {
          score,
          feedback: "Response recorded prior to proctoring auto-submission.",
          justification: `Auto-submitted response (${wordCount} words). Evaluated for partial credit.`
        }
      }

      try {
        if (q.type === 'Speaking' && studentAns.startsWith('data:audio')) {
          const res = await fetch(studentAns)
          const blob = await res.blob()
          const formData = new FormData()
          formData.append('file', blob, 'speech.webm')
          formData.append('question', JSON.stringify(q))

          const apiRes = await fetch('/api/evaluate-speaking', {
            method: 'POST',
            body: formData,
          })
          if (apiRes.ok) {
            const data = await apiRes.json()
            return {
              score: typeof data.score === 'number' ? data.score : 0.7,
              feedback: data.feedback || 'Speaking evaluation completed.',
              justification: data.transcript ? `Speech Transcript: "${data.transcript}". ${data.justification || ''}` : (data.justification || 'Evaluated via Whisper & AI.')
            }
          }
        }
        return await evaluateSubjective(q, studentAns)
      } catch (err) {
        console.error('AI evaluation fallback triggered:', err)
        const wordCount = studentAns.split(/\s+/).length
        const score = wordCount >= 15 ? 0.75 : 0.5
        return {
          score,
          feedback: "Response recorded and credited.",
          justification: "Evaluated with local partial credit."
        }
      }
    })
    const audits = await Promise.all(auditPromises)

    let aiFeedbackChain = ""
    let aiJustificationChain = ""

    audits.forEach((audit, index) => {
      const q = trueSubjective[index]
      const points = getPointsForQuestion(q.type)
      totalScore += (audit.score * points)
      
      const qNumber = randomizedQuestions.findIndex(rq => rq.id === q.id) + 1
      if (audit.feedback.trim()) aiFeedbackChain += `**Q${qNumber}:** ${audit.feedback.trim()}\n\n`
      if (audit.justification.trim()) aiJustificationChain += `**Q${qNumber}:** ${audit.justification.trim()}\n\n`
    })

    const rawScore = Math.round(totalScore)
    const rawTotalMarks = randomizedQuestions.reduce((sum, q) => {
      if (q.subQuestions && q.subQuestions.length > 0) {
        return sum + q.subQuestions.reduce((subSum, sq) => {
          if (sq.type === 'Fill in the Blanks' && (q.category === 'Reading' || q.category === 'Listening') && sq.content.includes('____')) {
            return subSum + Math.max(1, (sq.content.match(/_{3,}/g) || []).length)
          }
          return subSum + (sq.points || (sq.type === 'Subjective' ? 3 : 1))
        }, 0)
      }
      return sum + getPointsForQuestion(q.type)
    }, 0) || 100
    
    // Scale out of 100
    const finalCalculatedScore = Math.min(100, Math.round((rawScore / rawTotalMarks) * 100))
    const totalMarks = 100
    setTestTotalMarks(totalMarks)
    const percentage = finalCalculatedScore

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
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const submissionPayload = {
          id: `test-res-${Date.now()}`,
          templateId: activeTest.id,
          studentId: user.id,
          studentName: user.name,
          assignedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          status: 'Completed',
          randomizedQuestions,
          answers: { ...activeAnswers, __proctoringLogs: proctoringLogs },
          score: finalCalculatedScore,
          feedback: scoreFeedback,
          evaluationCategory: activeTest.evaluationCategory,
        }
        const saved = await submitWithRetry(() => directSubmitTestResult(submissionPayload, activeTest?.title || 'Test'))
        if (saved) {
          // Only clear session after confirmed DB success — prevents silent data loss
          sessionStorage.removeItem('current_assessment_code')
          sessionStorage.removeItem('current_assessment_data')
          if (activeTest?.id) sessionStorage.removeItem(`assessment_answers_${activeTest.id}`)
        } else {
          setSubmitError("The server is under heavy load. Your score is displayed below — please inform your teacher to check the registry, or try refreshing this page.")
        }
      } catch (err) {
        console.error("Submission error:", err)
        setSubmitError("An error occurred during submission. Your score is displayed below.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleAdaptiveSubmit = async () => {
     setIsEvaluating(true)
     const q = randomizedQuestions[currentQuestionIndex]
     const answer = answers[q.id] || ""
     let score = 0
     
     const isAutoType = (AUTO_GRADED_TYPES as readonly string[]).includes(q.type)
     const isAlwaysAI = q.type === 'Subjective' || q.type === 'Writing'
     const isClozeAI = (q.type === 'Reading' || q.type === 'Listening') && q.content.includes('____')
     const isLocalMCQStyle = (q.type === 'Reading' || q.type === 'Listening') && !q.content.includes('____') && q.correctAnswer && q.correctAnswer.trim() !== ''

     if (q.subQuestions && q.subQuestions.length > 0) {
        let subScore = 0
        let totalSubPts = 0
        q.subQuestions.forEach(sq => {
          const sqKey = `${q.id}_sub_${sq.id}`
          const sqAns = answers[sqKey] || ''
          const sqPts = sq.points || (sq.type === 'Subjective' ? 3 : 1)
          totalSubPts += sqPts

          if (sq.type === 'MCQ' || sq.type === 'True/False' || sq.type === 'True/False/Not Given' || sq.type === 'Yes/No/Not Given') {
            const studentCanonical = canonicalizeIeltsAnswer(sqAns)
            const correctCanonical = canonicalizeIeltsAnswer(sq.correctAnswer || '')
            const normalizedStudent = sqAns.trim().toLowerCase().replace(/^["']|["']$/g, '')
            const normalizedCorrect = (sq.correctAnswer || '').trim().toLowerCase().replace(/^["']|["']$/g, '')
            if ((studentCanonical && studentCanonical === correctCanonical) || (normalizedStudent && normalizedStudent === normalizedCorrect)) {
              subScore += sqPts
            }
          } else if (sq.type === 'MultiSelect') {
            subScore += evaluateMultiSelect(sqAns, sq.correctAnswer || '', sq.options, sqPts, sq.maxSelections)
          } else if (sq.type === 'Fill in the Blanks') {
            if (sq.content.includes('____')) {
              const blankCount = Math.max(1, (sq.content.match(/_{3,}/g) || []).length)
              const parsedBlanks = parseMultiBlankCorrectAnswers(sq.correctAnswer || '', blankCount)
              for (let bIdx = 0; bIdx < blankCount; bIdx++) {
                const blankKey = `${sqKey}_blank_${bIdx}`
                const studentAns = (answers[blankKey] || answers[`${sqKey}_${bIdx}`] || answers[`${q.id}_sub_${sq.id}_${bIdx}`] || '').trim().toLowerCase().replace(/^["']|["']$/g, '')
                const allowedVariants = parsedBlanks[bIdx] || []
                if (studentAns && allowedVariants.some(alt => alt === studentAns)) {
                  subScore += (sqPts / blankCount)
                }
              }
            } else {
              const allowed = (sq.correctAnswer || '').split(/[\/|;]/).map(s => s.trim().toLowerCase().replace(/^["']|["']$/g, ''))
              if (sqAns && allowed.some(alt => alt === sqAns.trim().toLowerCase().replace(/^["']|["']$/g, ''))) {
                subScore += sqPts
              }
            }
          }
        })
        score = totalSubPts > 0 ? (subScore / totalSubPts) : 0
     } else if (isAutoType) {
        if (q.type === 'Matching') {
           try {
             const studentPairs = JSON.parse(answer || '{}')
             const allCorrect = (q.matchPairs || []).every(p => studentPairs[p.left] === p.right)
             if (allCorrect) score = 1
           } catch {}
        } else if (q.type === 'Fill in the Blanks') {
           score = scoreMultiBlank(q, answers, 1)
        } else if (q.type === 'MultiSelect') {
           score = evaluateMultiSelect(answer, q.correctAnswer || '', q.options, 1)
        } else if (q.type === 'True/False/Not Given' || q.type === 'Yes/No/Not Given' || q.type === 'True/False') {
           const studentCanonical = canonicalizeIeltsAnswer(answer)
           const correctCanonical = canonicalizeIeltsAnswer(q.correctAnswer || '')
           if (studentCanonical && studentCanonical === correctCanonical) score = 1
        } else {
           if (answer === q.correctAnswer) score = 1
        }
     } else if (isClozeAI) {
        // Cloze-style Reading/Listening — use multi-blank extraction
        score = scoreMultiBlank(q, answers, 1)
     } else if (isLocalMCQStyle) {
        // MCQ-style Reading/Listening with exactAnswer — exact match
        const studentCanonical = canonicalizeIeltsAnswer(answer)
        const correctCanonical = canonicalizeIeltsAnswer(q.correctAnswer || '')
        if ((studentCanonical && studentCanonical === correctCanonical) || answer === q.correctAnswer) score = 1
     } else {
        // Subjective, Writing, open-ended Reading/Listening — always use AI evaluator
        const audit = await evaluateSubjective(q, answer)
        score = audit.score
        const qNumber = currentQuestionIndex + 1;
        setAiAuditResults(prev => ({ 
            feedback: prev.feedback + (audit.feedback.trim() ? `**Q${qNumber}:** ${audit.feedback.trim()}\n\n` : ""), 
            justification: prev.justification + (audit.justification.trim() ? `**Q${qNumber}:** ${audit.justification.trim()}\n\n` : "") 
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
          <div className="font-serif text-xl sm:text-2xl leading-relaxed text-foreground/90 flex flex-wrap items-center gap-x-3 gap-y-4 sm:gap-y-10">
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
              onClick={() => setAnswers(prev => ({ ...prev, [qId]: opt }))}
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
      const minWords = q.wordLimitMin || 80
      const maxWords = q.wordLimitMax

      const isUnderMin = wordCount > 0 && wordCount < minWords
      const isOverMax = !!(maxWords && wordCount > maxWords)

      const specificWritingType = q.writingSubType 
        ? `${q.writingSubType} (${q.writingGenre || 'Writing'})` 
        : q.writingGenre 
        ? `${q.writingGenre} Writing` 
        : 'Writing Prompt'

      return (
        <div className="space-y-4 pt-3">
          {/* Detailed Task & Word Count Target Header Bar */}
          <div className="bg-primary/[0.03] border border-primary/15 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary text-primary-foreground font-semibold text-xs py-1 px-3 rounded-lg shadow-sm border-none">
                  Task Type: {specificWritingType}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Word Limit:</span>
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-bold bg-muted border border-border/50">
                  Min: {minWords} words
                </Badge>
                {maxWords ? (
                  <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-bold bg-muted border border-border/50">
                    Max: {maxWords} words
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-normal opacity-70 bg-muted border border-border/50">
                    No Max Limit
                  </Badge>
                )}
              </div>
            </div>

            {/* Word Count Live Meter */}
            <div className="flex items-center justify-between pt-1 border-t border-primary/10">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                Current Word Count:
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-sans text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full border ${
                  wordCount === 0 
                    ? 'bg-muted text-muted-foreground/50 border-transparent' :
                  isUnderMin 
                    ? 'bg-warning/10 text-warning border-warning/30' :
                  isOverMax 
                    ? 'bg-destructive/10 text-destructive border-destructive/30' :
                  'bg-success/10 text-success border-success/30'
                }`}>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {wordCount === 0 ? '(Start typing)' : isUnderMin ? `(${minWords - wordCount} more needed)` : isOverMax ? `(${wordCount - maxWords} words over max)` : '(Target met ✓)'}
                </span>
              </div>
            </div>
          </div>

          {/* Evaluation Criteria Checklist Box if provided */}
          {q.evaluationCriteria && (
            <div className="bg-muted/40 border border-primary/15 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-primary text-xs">
                <CheckSquare className="w-3.5 h-3.5" />
                Key Guidelines & Evaluation Focus:
              </div>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed font-sans text-xs pl-5">
                {q.evaluationCriteria}
              </p>
            </div>
          )}

          <Textarea
            placeholder={`Draft your ${q.writingSubType || q.writingGenre || 'writing'} response here...`}
            className="min-h-[280px] sm:min-h-[340px] resize-y text-base p-4 leading-relaxed bg-background/50 border-2 focus:border-primary/40 rounded-xl"
            value={currentAnswer}
            onChange={e => setAnswers(prev => ({ ...prev, [qId]: e.target.value }))}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
            autoComplete="one-time-code"
            inputMode="text"
            data-gramm="false"
          />

          {isUnderMin && (
            <p className="text-xs text-warning font-medium">
              Aim for at least {minWords} words for a complete academic response.
            </p>
          )}
          {isOverMax && (
            <p className="text-xs text-destructive font-medium">
              Response exceeds max target limit of {maxWords} words. Consider editing for conciseness.
            </p>
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
              <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm font-medium leading-tight w-full">
                {pair.left}
              </div>
              <Select
                value={studentPairs[pair.left] || ''}
                onValueChange={val => {
                  const updated = { ...studentPairs, [pair.left]: val }
                  setAnswers(prev => ({ ...prev, [qId]: JSON.stringify(updated) }))
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
          onValueChange={val => setAnswers(prev => ({ ...prev, [qId]: val }))}
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
              onClick={() => setAnswers(prev => ({ ...prev, [qId]: opt }))}
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

    // Reading — Interactive Blanks, Sub-Questions Set, or Subjective
    if (q.type === 'Reading') {
      const isCloze = q.content.includes('____')
      const hasSubQuestions = q.subQuestions && q.subQuestions.length > 0

      return (
        <div className="space-y-6 pt-4">
          {q.passageText && (
            <div className="rounded-3xl border border-primary/10 bg-primary/[0.02] p-8 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <p className="text-editorial-label text-[10px] uppercase tracking-widest flex items-center gap-2 text-primary/70 font-bold">
                  <BookOpen className="w-4 h-4" /> Reading Comprehension Passage
                </p>
                {q.passageTitle && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-serif text-xs font-semibold">
                    {q.passageTitle}
                  </Badge>
                )}
              </div>
              {q.passageTitle && (
                <h3 className="font-serif text-2xl font-bold text-foreground drop-shadow-xs pt-1">
                  {q.passageTitle}
                </h3>
              )}
              <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                <p className="font-serif text-lg leading-relaxed text-foreground/85 whitespace-pre-line first-letter:text-4xl first-letter:font-bold first-letter:mr-1">{q.passageText}</p>
              </div>
            </div>
          )}
          
          {hasSubQuestions ? (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-serif text-lg font-bold text-foreground">Comprehension Sub-Questions ({q.subQuestions?.length})</h4>
                <Badge variant="outline" className="text-[10px] uppercase">Mixed Question Set</Badge>
              </div>

              <div className="space-y-6">
                {q.subQuestions?.map((sq, idx) => {
                  const sqKey = `${qId}_sub_${sq.id}`
                  const sqAns = answers[sqKey] || ''

                  return (
                    <div key={sq.id} className="p-6 border-2 border-primary/10 rounded-3xl bg-background/60 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-primary">Question #{idx + 1} ({sq.type})</span>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                          {sq.points || (sq.type === 'Subjective' ? 3 : 1)} {sq.points === 1 ? 'Mark' : 'Marks'}
                        </Badge>
                      </div>
                      <p className="text-base font-serif font-medium text-foreground whitespace-pre-wrap leading-relaxed">{sq.content}</p>

                      {/* Sub MCQ / True-False / True-False-Not-Given / Yes-No-Not-Given */}
                      {(sq.type === 'MCQ' || sq.type === 'True/False' || sq.type === 'True/False/Not Given' || sq.type === 'Yes/No/Not Given') && (
                        <RadioGroup value={sqAns} onValueChange={(val) => setAnswers(prev => ({ ...prev, [sqKey]: val }))} className="space-y-2 pt-1">
                          {(
                            sq.type === 'True/False' ? ['True', 'False'] : 
                            sq.type === 'True/False/Not Given' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : 
                            sq.type === 'Yes/No/Not Given' ? ['YES', 'NO', 'NOT GIVEN'] : 
                            (sq.options || [])
                          ).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/30 cursor-pointer">
                              <RadioGroupItem value={opt} id={`${sqKey}_${oIdx}`} />
                              <Label htmlFor={`${sqKey}_${oIdx}`} className="flex-1 text-sm font-medium cursor-pointer">{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {/* Sub MultiSelect */}
                      {sq.type === 'MultiSelect' && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] font-bold text-primary">Select up to {sq.maxSelections || 2} answers:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(sq.options || ['A', 'B', 'C', 'D', 'E']).filter(o => o.trim()).map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx)
                              let currentPicks: string[] = []
                              try {
                                currentPicks = JSON.parse(sqAns)
                                if (!Array.isArray(currentPicks)) currentPicks = sqAns ? sqAns.split(',') : []
                              } catch {
                                currentPicks = sqAns ? sqAns.split(',') : []
                              }
                              const isChecked = currentPicks.includes(letter)

                              return (
                                <div
                                  key={oIdx}
                                  onClick={() => {
                                    let newPicks = [...currentPicks]
                                    if (isChecked) {
                                      newPicks = newPicks.filter(p => p !== letter)
                                    } else {
                                      if (newPicks.length < (sq.maxSelections || 2)) {
                                        newPicks.push(letter)
                                      } else {
                                        toast.info(`You can only select up to ${sq.maxSelections || 2} options`)
                                        return
                                      }
                                    }
                                    setAnswers(prev => ({ ...prev, [sqKey]: JSON.stringify(newPicks) }))
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                    isChecked ? "bg-primary/10 border-primary/40 font-bold" : "hover:bg-muted/30"
                                  )}
                                >
                                  <div className={cn("w-5 h-5 rounded flex items-center justify-center text-xs font-bold border", isChecked ? "bg-primary text-white border-primary" : "border-muted-foreground/30")}>
                                    {letter}
                                  </div>
                                  <span className="text-sm">{opt}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sub Blanks / Subjective */}
                      {sq.type === 'Fill in the Blanks' ? (
                        sq.content.includes('____') ? (
                          <div className="space-y-4 pt-1">
                            {/* Render prompt text with numbered badges [(1) ____] */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-primary/10 font-serif text-base leading-relaxed whitespace-pre-wrap">
                              {(() => {
                                const parts = sq.content.split(/_{3,}/)
                                return parts.map((part, pIdx) => (
                                  <span key={pIdx}>
                                    <span>{part}</span>
                                    {pIdx < parts.length - 1 && (
                                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-sans font-bold text-xs px-2 py-0.5 rounded-lg border border-primary/20 mx-1 align-baseline">
                                        [({pIdx + 1}) ____]
                                      </span>
                                    )}
                                  </span>
                                ))
                              })()}
                            </div>

                            {/* Order-Wise Numbered Input Sheet (1 Mark per Blank) */}
                            <div className="bg-background/80 border-2 border-primary/15 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                  <CheckSquare className="w-3.5 h-3.5" /> Order-Wise Answer Sheet ({Math.max(1, (sq.content.match(/_{3,}/g) || []).length)} Blanks — 1 Mark Each)
                                </span>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {Array.from({ length: Math.max(1, (sq.content.match(/_{3,}/g) || []).length) }).map((_, bIdx) => {
                                  const blankKey = `${sqKey}_blank_${bIdx}`
                                  const val = answers[blankKey] || ''
                                  return (
                                    <div key={bIdx} className="flex items-center gap-2 bg-muted/20 border p-2.5 rounded-xl">
                                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                                        #{bIdx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <Label htmlFor={`sq-blank-${blankKey}`} className="text-[9px] uppercase font-bold text-muted-foreground block">
                                          Blank #{bIdx + 1} Answer (1 Mark)
                                        </Label>
                                        <input
                                          id={`sq-blank-${blankKey}`}
                                          type="text"
                                          value={val}
                                          onChange={(e) => setAnswers(prev => ({ ...prev, [blankKey]: e.target.value }))}
                                          placeholder={`Answer for Blank #${bIdx + 1}...`}
                                          className="w-full text-xs font-medium bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground"
                                        />
                                      </div>
                                      {val.trim() && <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Textarea
                            placeholder="Type exact answer for the blank..."
                            value={sqAns}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [sqKey]: e.target.value }))}
                            className="min-h-[80px] text-sm bg-background border-2 rounded-xl"
                          />
                        )
                      ) : sq.type === 'Subjective' && (
                        <Textarea
                          placeholder="Write your response..."
                          value={sqAns}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [sqKey]: e.target.value }))}
                          className="min-h-[80px] text-sm bg-background border-2 rounded-xl"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : isCloze ? (
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
                onChange={e => setAnswers(prev => ({ ...prev, [qId]: e.target.value }))}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                autoComplete="one-time-code"
                inputMode="text"
                data-gramm="false"
              />
            </div>
          )}
        </div>
      )
    }

    // Listening — Integrated Audio Player, Passage with Numbered Blank Slots & Order-Wise Response Sheet
    if (q.type === 'Listening') {
      const isCloze = q.content.includes('____')
      const blankMatches = q.content.match(/_{3,}/g) || []
      const blankCount = Math.max(1, blankMatches.length)
      const parts = q.content.split(/_{3,}/)

      return (
        <div className="space-y-6 pt-2">
          {/* Integrated Listening Audio Player & Title Header */}
          <div className="rounded-3xl border border-primary/15 bg-primary/[0.03] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shrink-0 shadow-md">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    Auditory Exercise
                  </Badge>
                  {isCloze && (
                    <Badge variant="secondary" className="text-[10px] font-medium bg-muted">
                      {blankCount} {blankCount === 1 ? 'Blank' : 'Order-Wise Blanks'}
                    </Badge>
                  )}
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground mt-1">
                  Listening Audio & Transcript
                </h4>
              </div>
            </div>

            {q.audioUrl ? (
              <div className="bg-background/80 p-3 rounded-2xl border border-primary/10 shadow-inner">
                <audio ref={audioRef} controls src={q.audioUrl} className="w-full h-10" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No audio clip attached.</p>
            )}
          </div>

          {isCloze ? (
            <div className="space-y-6">
              {/* Passage text with clear numbered slots */}
              <div className="bg-muted/30 border border-primary/10 p-6 sm:p-8 rounded-3xl space-y-3 shadow-inner">
                <p className="text-editorial-label text-[10px] uppercase tracking-widest text-primary/80 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Passage Transcript (Read while listening):
                </p>
                <div className="font-serif text-lg sm:text-xl leading-relaxed text-foreground/90 flex flex-wrap items-baseline gap-x-2 gap-y-3 pt-2">
                  {parts.map((part, i) => (
                    <span key={i} className="inline flex-wrap items-baseline">
                      <span>{part}</span>
                      {i < parts.length - 1 && (
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-sans font-bold text-xs px-2.5 py-1 rounded-lg border border-primary/20 mx-1 align-baseline shadow-xs">
                          [{i + 1}] ____
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dedicated Order-Wise Numbered Response Sheet */}
              <div className="bg-background/80 border-2 border-primary/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <h5 className="font-serif font-bold text-sm text-foreground">
                      Order-Wise Answer Sheet ({blankCount} {blankCount === 1 ? 'Entry' : 'Entries'})
                    </h5>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Type your answer for each numbered blank
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: blankCount }).map((_, i) => {
                    const val = answers[`${qId}-${i}`] || ''
                    return (
                      <div key={i} className="flex items-center gap-3 bg-muted/20 border border-border/60 p-3 rounded-2xl transition-all focus-within:border-primary/50 focus-within:bg-background shadow-xs">
                        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={`blank-input-${qId}-${i}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">
                            Blank #{i + 1} Answer
                          </Label>
                          <input
                            id={`blank-input-${qId}-${i}`}
                            type="text"
                            value={val}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [`${qId}-${i}`]: e.target.value }))}
                            placeholder={`Type exact word for Blank #${i + 1}...`}
                            className="w-full text-sm font-medium bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/40"
                          />
                        </div>
                        {val.trim() && (
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-editorial-label text-xs">Your Listening Response</Label>
              <Textarea
                placeholder="Describe or respond to what you heard..."
                className="min-h-[160px] text-base p-4 bg-background/50 border-2 focus:border-primary/40 rounded-xl"
                value={currentAnswer}
                onChange={e => setAnswers({ ...answers, [qId]: e.target.value })}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                autoComplete="one-time-code"
                inputMode="text"
                data-gramm="false"
              />
            </div>
          )}
        </div>
      )
    }

    // Speaking — Live Microphone Recorder
    if (q.type === 'Speaking') {
      const topicTitle = q.speakingTitle || q.content || 'Spoken English Evaluation'
      const prepTime = q.prepTimeSeconds || 30
      const speakTime = q.speakingTimeSeconds || 60
      const isCurrentlyRecording = activeRecordingId === qId

      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaStreamRef.current = stream
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorderRef.current = mediaRecorder
          const audioChunks: Blob[] = []

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data)
          }

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            const reader = new FileReader()
            reader.readAsDataURL(audioBlob)
            reader.onloadend = () => {
              setAnswers(prev => ({ ...prev, [qId]: reader.result as string }))
              toast.success('Speech response recorded successfully!')
            }
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach(track => track.stop())
            }
            setActiveRecordingId(null)
            if (activeRecordingIntervalRef.current) clearInterval(activeRecordingIntervalRef.current)
          }

          mediaRecorder.start()
          setActiveRecordingId(qId)
          setRecordingSecondsLeft(speakTime)

          activeRecordingIntervalRef.current = setInterval(() => {
            setRecordingSecondsLeft(prev => {
              if (prev <= 1) {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop()
                }
                return 0
              }
              return prev - 1
            })
          }, 1000)

          toast.info('Microphone active! Speak now...')
        } catch (err) {
          toast.error('Microphone permission denied or device not found.')
        }
      }

      const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }

      return (
        <div className="space-y-6 pt-4">
          <div className="rounded-3xl border-2 border-primary/20 bg-primary/[0.02] p-5 sm:p-8 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-primary/10 pb-4 gap-3">
              <div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                  Speaking Assessment Task
                </Badge>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-2 drop-shadow-xs">
                  {topicTitle}
                </h3>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-left sm:text-right bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Prep Time</span>
                  <span className="text-xs font-bold text-primary">{prepTime}s</span>
                </div>
                <div className="text-left sm:text-right bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Speak Max</span>
                  <span className="text-xs font-bold text-primary">{speakTime}s</span>
                </div>
              </div>
            </div>

            {q.content && q.content !== topicTitle && (
              <div className="p-4 rounded-2xl bg-background/80 border border-primary/10 text-sm font-serif leading-relaxed text-foreground/85">
                {q.content}
              </div>
            )}

            {/* Responsive Live Microphone Control Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-background/95 border-2 border-primary/20 flex flex-col items-center justify-center space-y-5 text-center shadow-lg relative overflow-hidden max-w-lg mx-auto">
              <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300", isCurrentlyRecording ? "bg-destructive/10 border-destructive animate-ping" : "bg-primary/10 border-primary/30")}>
                <Mic className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", isCurrentlyRecording ? "text-destructive" : "text-primary")} />
              </div>

              <div className="space-y-1 max-w-xs sm:max-w-md">
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  {isCurrentlyRecording ? "Microphone Active — Recording Speech..." : "Record Your Spoken Answer"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isCurrentlyRecording ? "Speak clearly. Click stop when you finish your response." : "Click below to activate microphone and start speaking."}
                </p>
              </div>

              {/* Responsive Controls & Task Timer */}
              <div className="w-full max-w-xs sm:max-w-sm space-y-3">
                {!answers[qId] ? (
                  isCurrentlyRecording ? (
                    <Button
                      type="button"
                      size="lg"
                      onClick={stopRecording}
                      className="w-full h-11 sm:h-12 rounded-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg gap-2 text-xs sm:text-sm animate-pulse"
                    >
                      <div className="w-3 h-3 rounded-sm bg-white shrink-0" />
                      Stop Recording ({recordingSecondsLeft}s left)
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      onClick={startRecording}
                      className="w-full h-11 sm:h-12 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 text-xs sm:text-sm"
                    >
                      <Mic className="w-4 h-4 shrink-0" /> Start Recording ({speakTime}s max)
                    </Button>
                  )
                ) : (
                  <div className="space-y-3 w-full p-4 rounded-2xl bg-success/10 border border-success/20">
                    <p className="text-xs font-bold text-success flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Response Captured
                    </p>
                    <audio controls src={currentAnswer} className="w-full h-9 rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswers(prev => ({ ...prev, [qId]: '' }))}
                      className="w-full h-9 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      Re-record Response
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          autoComplete="one-time-code"
          inputMode="text"
          data-gramm="false"
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
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground drop-shadow-sm">Assessments</h1>
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
                    "group rounded-3xl sm:rounded-[2.5rem] border-primary/10 bg-card/40 backdrop-blur-2xl shadow-premium overflow-hidden hover:shadow-massive hover-lift transition-premium relative",
                    !isSessionReady && "opacity-60 grayscale-[0.5] cursor-not-allowed"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <CardHeader className="p-6 sm:p-8 pb-4 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/5 border-primary/10 px-3 py-1 font-medium">{assessment.nature}</Badge>
                      <div className="p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/20 shadow-sm">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="font-serif text-2xl group-hover:text-primary transition-colors pr-4 font-semibold">{assessment.title}</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-40 mt-2">Institutional Examination Profile</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 sm:p-8 pt-0 space-y-8">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-primary/[0.03] p-4 rounded-2xl border border-primary/5">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-background flex flex-col select-none touch-none"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              WebkitTouchCallout: 'none' 
            }}
          >
            {user && <WatermarkOverlay name={user.name} id={user.studentId || user.id} />}
            
            {/* Blackout Guard */}
            {isBlackedOut && (
              <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center text-center p-10">
                <AlertTriangle className="w-20 h-20 text-destructive mb-6 animate-pulse" />
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Security Violation Detected</h2>
                <p className="text-muted-foreground max-w-md mb-8">Screen capture attempts are strictly prohibited during institutional assessments. This action has been logged in your academic record.</p>
                <Button onClick={() => setIsBlackedOut(false)} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                  I Understand, Resume Test
                </Button>
              </div>
            )}
            
            {/* Header */}
            {/* Result screen */}
            {showResult ? (
              <div className="flex-1 w-full overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-8 touch-auto select-text premium-scrollbar">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-lg bg-card border-primary/10 shadow-massive rounded-[3rem] h-fit my-auto overflow-hidden border flex flex-col"
                >
                  <div className="h-1.5 bg-success/50 w-full shrink-0 rounded-t-full" />
                  <div className="p-8 sm:p-10 text-center space-y-8">
                    {/* Submitting spinner overlay */}
                    {isSubmitting && (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest animate-pulse">Securing your submission…</p>
                      </div>
                    )}
                    {/* Error banner — only shown if all retries failed */}
                    {submitError && !isSubmitting && (
                      <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-left">
                        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-destructive text-xs leading-relaxed">{submitError}</p>
                      </div>
                    )}
                    <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success ring-8 ring-success/5 shadow-inner">
                      <Award className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-foreground">Assessment Complete</h2>
                      <p className="text-muted-foreground text-sm mt-1 opacity-60">
                        {isSubmitting ? "Saving your results, please wait…" : submitError ? "Score recorded locally — see note above." : "Your submission has been recorded."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      {[
                        { label: 'Final Score', value: `${finalScore} / ${testTotalMarks}`, color: 'text-success' },
                        { label: 'Percentage', value: `${Math.round((finalScore / testTotalMarks) * 100)}%`, color: finalScore / testTotalMarks >= 0.5 ? 'text-success' : 'text-destructive' },
                        { label: 'Questions', value: `${randomizedQuestions.length} Blocks`, color: 'text-primary' },
                        { label: 'Status', value: finalScore / testTotalMarks >= 0.5 ? 'Pass ✓' : 'Review ⚠', color: finalScore / testTotalMarks >= 0.5 ? 'text-success' : 'text-amber-500' },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl bg-muted/30 p-3">
                          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60 mb-1">{stat.label}</p>
                          <p className={`text-xl font-serif font-semibold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    {aiAuditResults.feedback && (
                      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 text-left max-h-48 overflow-y-auto premium-scrollbar">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-3 sticky top-0 bg-background/5 backdrop-blur-sm pb-1">
                          <TrendingUp className="w-4 h-4" /> AI Academic Audit
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed italic whitespace-pre-wrap">"{aiAuditResults.feedback}"</p>
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
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full h-14 font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <><Clock className="w-5 h-5 animate-spin" /> Please wait…</>
                        ) : (
                          <>Return to Credentials <ArrowRight className="w-5 h-5" /></>
                        )}
                      </Button>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mt-4">
                        {isSubmitting ? "Do not close this tab" : "Secure Session Termination"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
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
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.25em] font-medium px-2 py-0.5 bg-secondary/50 border-secondary/10">
                                {randomizedQuestions[currentQuestionIndex].category}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] uppercase tracking-[0.25em] font-bold px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">
                                {randomizedQuestions[currentQuestionIndex].type === 'Writing' 
                                  ? (randomizedQuestions[currentQuestionIndex].writingSubType || randomizedQuestions[currentQuestionIndex].writingGenre || 'Writing Prompt') 
                                  : randomizedQuestions[currentQuestionIndex].type}
                              </Badge>
                            </div>
                            {/* Don't repeat the content as heading if it's Reading or Fill in the Blanks */}
                            {randomizedQuestions[currentQuestionIndex].type !== 'Fill in the Blanks' && 
                             randomizedQuestions[currentQuestionIndex].type !== 'Reading' && (
                              <h3 className="text-xl sm:text-2xl font-serif leading-snug text-foreground font-bold whitespace-pre-wrap">
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
                      size="lg"
                      onClick={() => isAdaptiveMode ? handleAdaptiveSubmit() : finishTest(false)}
                      className="bg-success hover:bg-success/90 rounded-xl px-8 h-12 sm:h-10 font-bold gap-1.5 shadow-md shadow-success/20"
                    >
                      Finish & Submit <CheckCircle className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => isAdaptiveMode ? handleAdaptiveSubmit() : setCurrentQuestionIndex(p => p + 1)}
                      className="rounded-xl px-8 h-12 sm:h-10 font-bold gap-1.5"
                    >
                      {isAdaptiveMode ? "Submit Answer & Continue" : "Next"} <ChevronRight className="w-5 h-5" />
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
