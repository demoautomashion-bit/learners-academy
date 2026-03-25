'use client'

import { useState, useEffect, useCallback } from "react"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Timer,
  AlertTriangle,
  Award,
  BarChart3,
  TrendingUp,
  XCircle,
  Maximize2
} from "lucide-react"
import { evaluateSubjective } from "@/lib/ai-auditor"
import type { AssessmentTemplate, Question, StudentTest } from "@/lib/types"

export default function StudentAssessmentsPage() {
  const { user } = useAuth()
  const { assessments: mockAssessments, questions: mockQuestions, courses: mockCourses, submitTestResult } = useData()

  // Filter assessments by the student's enrolled class level
  const userEnrolledCourseIds = user?.enrolledCourses || []
  const userCourseTitles = mockCourses
    .filter(c => userEnrolledCourseIds.includes(c.id))
    .map(c => c.title)

  const availableAssessments = mockAssessments.filter(a => 
    a.classLevels.some(level => userCourseTitles.includes(level)) || a.classLevels.length === 0
  )
  const [activeTest, setActiveTest] = useState<AssessmentTemplate | null>(null)
  const [isTestEngineOpen, setIsTestEngineOpen] = useState(false)
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [aiAuditResults, setAiAuditResults] = useState<{ feedback: string; justification: string }>({ feedback: "", justification: "" })

  // Test Engine Logic
  const startTest = (assessment: AssessmentTemplate) => {
    // Filter questions by phase AND class level (or general questions)
    const pool = mockQuestions.filter(q => 
      (q.phase === assessment.phase || q.phase === 'Both') 
    )
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    // Use assessment specific mark/length if possible, otherwise default to 10
    const selected = shuffled.slice(0, 10)     
    setRandomizedQuestions(selected)
    setActiveTest(assessment)
    setTimeLeft(assessment.durationMinutes * 60)
    setIsTestEngineOpen(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setStrikes(0)
    setIsPaused(false)
    setShowResult(false)

    // Attempt Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Please enable fullscreen for the best testing experience.")
      })
    }
  }

  // Proctoring Logic (The Shield)
  useEffect(() => {
    if (!isTestEngineOpen || showResult) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation("Tab Switching Detected")
      }
    }

    const handleBlur = () => {
      handleViolation("App De-focus Detected")
    }

    const handleViolation = (reason: string) => {
      setStrikes(prev => {
        const next = prev + 1
        if (next >= 3) {
          toast.error("CRITICAL VIOLATION: Excessive tab switching. Auto-submitting assessment.")
          finishTest(true)
          return next
        }
        setIsPaused(true)
        toast.warning(`${reason}: Warning ${next}/3. Please stay on the test screen.`, {
          duration: 5000,
          icon: <AlertTriangle className="w-5 h-5 text-warning" />
        })
        return next
      })
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isTestEngineOpen, showResult])

  // Timer
  useEffect(() => {
    if (isTestEngineOpen && !isPaused && !showResult && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && isTestEngineOpen && !showResult) {
      finishTest(true)
    }
  }, [timeLeft, isTestEngineOpen, isPaused, showResult])

  const calculateScore = () => {
    let score = 0
    let scorableQuestions = 0
    randomizedQuestions.forEach(q => {
      if (q.type === 'MCQ') {
        scorableQuestions++
        if (answers[q.id] === q.correctAnswer) {
          score += 1
        }
      }
      // Subjective questions are not auto-graded for academic integrity
    })
    return scorableQuestions > 0 ? Math.round((score / scorableQuestions) * 100) : 0
  }

  const finishTest = async (isAuto = false) => {
    setIsEvaluating(true)
    
    // 1. Calculate base MCQ score
    let basePoints = 0
    let totalScorable = 0
    const subjectiveQuestions = randomizedQuestions.filter(q => q.type === 'Subjective')
    const mcqQuestions = randomizedQuestions.filter(q => q.type === 'MCQ')

    mcqQuestions.forEach(q => {
      totalScorable++
      if (answers[q.id] === q.correctAnswer) basePoints++
    })

    // 2. Perform AI Audit on Subjective Questions
    let subjectivePoints = 0
    let aiFeedbackChain = ""
    let aiJustificationChain = ""

    for (const q of subjectiveQuestions) {
      totalScorable++
      const audit = await evaluateSubjective(q, answers[q.id] || "")
      subjectivePoints += audit.score
      aiFeedbackChain += audit.feedback + " "
      aiJustificationChain += audit.justification + " "
    }

    const finalPercentage = Math.round(((basePoints + subjectivePoints) / totalScorable) * 100)
    setFinalScore(finalPercentage)
    setAiAuditResults({ 
      feedback: aiFeedbackChain || "Assessment complete. No subjective audits required.", 
      justification: aiJustificationChain 
    })
    
    // 3. Submit result to global registry
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
        feedback: aiFeedbackChain
      })
    }

    setIsEvaluating(false)
    setShowResult(true)
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
    if (isAuto) {
      toast.error("Assessment auto-submitted due to time or violations.")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFeedback = (score: number) => {
    if (score >= 90) return "Exceptional mastery! Your understanding of the material is world-class."
    if (score >= 70) return "Great performance! You have a solid grasp of the core concepts."
    if (score >= 50) return "Good effort. Review the categories where points were missed to improve for the final test."
    return "Needs improvement. We recommend scheduling a focus session with your teacher."
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif leading-tight">
            Assessments
          </h1>
          <p className="mt-2 text-muted-foreground text-editorial-label">
            Access proctored academic tests and track your real-time results.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {availableAssessments.length === 0 ? (
          <Card className="md:col-span-2 border-dashed flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-lg">No Assessments Assigned</p>
            <p className="text-sm">There are no proctored tests available for your current academic level.</p>
          </Card>
        ) : (
          availableAssessments.map((test) => (
          <Card key={test.id} className="group overflow-hidden border-none shadow-sm ring-1 ring-border bg-card hover:ring-primary/50 transition-all hover:shadow-lg">
            <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-bold text-primary border-primary/20 bg-primary/5">
                  {test.phase}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {test.durationMinutes} mins
                </div>
              </div>
              <CardTitle className="mt-2 font-serif text-xl">{test.title}</CardTitle>
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-wide">
                Nature: {test.nature} • {test.totalMarks} Marks
              </CardDescription>
            </CardHeader>
            <CardFooter className="bg-muted/30 py-4">
              <Button 
                onClick={() => startTest(test)} 
                className="w-full group/btn font-semibold tracking-wide"
              >
                Secure Entry
                <Lock className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
          ))
        )}
      </div>

      {/* Zen Mode Engine */}
      <AnimatePresence>
        {isTestEngineOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-0 lg:p-8"
          >
            {showResult ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl bg-card border shadow-2xl rounded-3xl overflow-hidden"
              >
                <div className="h-2 bg-success" />
                <div className="p-8 text-center space-y-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-success/10 flex items-center justify-center text-success mb-6 ring-4 ring-success/5">
                    <Award className="w-12 h-12" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-serif font-bold mb-2 text-foreground">Assessment Audit Complete</h2>
                    <p className="text-muted-foreground">Real-time analytical results based on your performance.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4 bg-muted/30 border-none">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Score</p>
                      <p className="text-3xl font-serif text-success">{finalScore}%</p>
                    </Card>
                    <Card className="p-4 bg-muted/30 border-none">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Status</p>
                      <p className="text-lg font-bold text-foreground">Completed</p>
                    </Card>
                    <Card className="p-4 bg-muted/30 border-none">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Timing</p>
                      <p className="text-lg font-bold text-foreground">{formatTime(activeTest!.durationMinutes * 60 - timeLeft)}</p>
                    </Card>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-left">
                    <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
                      <TrendingUp className="w-4 h-4" />
                      AI Academic Audit
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      "{aiAuditResults.feedback}"
                    </p>
                  </div>

                  <Button onClick={() => setIsTestEngineOpen(false)} className="w-full h-12 text-lg font-semibold tracking-wide">
                    Return to Portal
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full max-w-5xl flex flex-col bg-card/50 backdrop-blur-sm lg:rounded-3xl border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / randomizedQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex items-center justify-between p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-lg leading-none">{activeTest?.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
                        Question {currentQuestionIndex + 1} of {randomizedQuestions.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {strikes > 0 && (
                      <Badge variant="destructive" className="animate-pulse flex items-center gap-1.5 px-3 py-1.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Warning {strikes}/3
                      </Badge>
                    )}
                    <div className={`flex items-center gap-2.5 px-5 py-2 rounded-full font-mono text-lg font-bold shadow-inner ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
                      <Timer className="w-5 h-5" />
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-8 max-w-3xl mx-auto"
                    >
                      <div className="space-y-4">
                        <Badge variant="secondary" className="px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold">
                          {randomizedQuestions[currentQuestionIndex].category}
                        </Badge>
                        <h3 className="text-2xl lg:text-3xl font-serif leading-tight text-foreground">
                          {randomizedQuestions[currentQuestionIndex].content}
                        </h3>
                      </div>

                      {randomizedQuestions[currentQuestionIndex].type === 'MCQ' ? (
                        <RadioGroup 
                          value={answers[randomizedQuestions[currentQuestionIndex].id]}
                          onValueChange={(val) => setAnswers({...answers, [randomizedQuestions[currentQuestionIndex].id]: val})}
                          className="grid gap-4 sm:grid-cols-2 pt-4"
                        >
                          {randomizedQuestions[currentQuestionIndex].options?.map((opt, i) => (
                            <div 
                              key={i} 
                              className={`group relative flex items-center space-x-3 rounded-2xl border-2 p-6 transition-all cursor-pointer ${answers[randomizedQuestions[currentQuestionIndex].id] === opt ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'hover:border-primary/20 hover:bg-muted/50'}`} 
                              onClick={() => setAnswers({...answers, [randomizedQuestions[currentQuestionIndex].id]: opt})}
                            >
                              <RadioGroupItem value={opt} id={`opt-${i}`} className="sr-only" />
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${answers[randomizedQuestions[currentQuestionIndex].id] === opt ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                {answers[randomizedQuestions[currentQuestionIndex].id] === opt && <div className="w-3 h-3 rounded-full bg-primary" />}
                              </div>
                              <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-lg font-medium leading-tight">{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="space-y-3 pt-4">
                          <Label className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground ml-1">Type your academic response</Label>
                          <Textarea 
                            placeholder="Enter your detailed answer..." 
                            className="min-h-[250px] text-lg p-6 bg-background/50 border-2 focus:border-primary/40 focus:ring-primary/10 rounded-2xl"
                            value={answers[randomizedQuestions[currentQuestionIndex].id] || ''}
                            onChange={(e) => setAnswers({...answers, [randomizedQuestions[currentQuestionIndex].id]: e.target.value})}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="p-6 lg:p-8 border-t bg-muted/20 flex justify-between items-center sm:justify-between">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-xl px-8"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-4">
                    {currentQuestionIndex === randomizedQuestions.length - 1 ? (
                      <Button 
                        size="lg"
                        onClick={() => finishTest(false)} 
                        className="bg-success hover:bg-success/90 rounded-xl px-12 font-bold shadow-lg shadow-success/20"
                      >
                        Finish & Submit
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        size="lg"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="rounded-xl px-12 font-bold shadow-lg shadow-primary/20"
                      >
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {isPaused && (
                  <div className="absolute inset-0 z-[110] bg-background/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <Card className="max-w-md border-destructive shadow-2xl">
                      <CardHeader>
                        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                          <AlertTriangle className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-2xl font-serif">Test Interrupted</CardTitle>
                        <CardDescription>
                          A violation occurred (window de-focus or tab switch). Excessive violations will result in auto-submission.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center gap-2 mb-6">
                          {[1, 2, 3].map(s => (
                            <div 
                              key={s} 
                              className={`w-12 h-2 rounded-full ${s <= strikes ? 'bg-destructive animate-pulse' : 'bg-muted'}`} 
                            />
                          ))}
                        </div>
                        <Button 
                          className="w-full h-12 text-lg font-bold tracking-wide" 
                          onClick={() => setIsPaused(false)}
                        >
                          I Understand, Continue
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {isEvaluating && (
                  <div className="absolute inset-0 z-[120] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">AI Academic Audit</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      Reviewing your subjective responses against institutional academic standards.
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
