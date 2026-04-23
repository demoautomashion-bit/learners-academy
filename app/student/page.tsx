'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SecureInput } from '@/components/ui/secure-input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '@/contexts/data-context'
import { validateAccessToken } from '@/lib/actions/assessments'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'




export default function StudentAccessPage() {
  const router = useRouter()
  const { login, updateUser, setAssessmentSession } = useAuth()
  const { courses, assessments, students } = useData()
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState(1)

  const activeClasses = ACADEMY_LEVELS
  const activeTimings = SESSION_TIMINGS
  const handleAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsVerifying(true)
    const formData = new FormData(e.currentTarget)
    const tokenId = formData.get('accessToken') as string
    const studentId = formData.get('studentId') as string
    const selectedClass = formData.get('class') as string

    try {
      const result = await validateAccessToken(tokenId, studentId, selectedClass)
      
    if (!result.success || !result.data) {
      toast.error(result.error || "Verification failed")
      setIsVerifying(false)
      return
    }

      const { assessment, student: studentRecord } = result.data

      // 2. Establish authenticated session directly from verified student record
      setAssessmentSession(studentRecord)

      // 4. Save the current assessment context for the session
      sessionStorage.setItem('current_assessment_code', assessment.accessCode)
      sessionStorage.setItem('current_assessment_data', JSON.stringify(assessment))
      
      toast.success('Access Granted. Entering Assessment Portal...')
      router.push('/student/assessments')
    } catch (err) {
      console.error(err)
      toast.error('Portal connection failed. Please try again.')
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[450px]">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Card className="border-none shadow-2xl ring-1 ring-border bg-card/60 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="pt-6 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 border border-primary/20">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-3xl tracking-tight">
                    Assessment Portal
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Enter your academic credentials to access your scheduled tests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <form onSubmit={handleAccess} className="space-y-5">
                    <FieldGroup className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                            Student ID
                          </FieldLabel>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 z-10" />
                            <Input 
                              name="studentId" 
                              placeholder="STU-101" 
                              className="pl-8 h-10 bg-background/30 border-primary/5 focus:ring-primary/10"
                              required 
                            />
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                            Access Token
                          </FieldLabel>
                          <SecureInput 
                            name="accessToken" 
                            placeholder="LA-7721" 
                            className="h-10 bg-background/30 border-primary/5 focus:ring-primary/10"
                            required 
                          />
                        </Field>
                      </div>
                      
                      <Field>
                        <FieldLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                          Target Class
                        </FieldLabel>
                        <Select name="class" required>
                          <SelectTrigger className="h-12 bg-background/50 border-border">
                            <SelectValue placeholder="Select your class" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeClasses.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                          Session Timing
                        </FieldLabel>
                        <Select name="timing" required>
                          <SelectTrigger className="h-12 bg-background/50 border-border">
                            <SelectValue placeholder="Select timings" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeTimings.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-md font-semibold tracking-wide shadow-lg hover:shadow-primary/20 transition-all" 
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Verifying Academic Registry...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Enter Vault
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-xs text-muted-foreground uppercase tracking-widest font-bold h-10 hover:bg-primary/5 hover:text-primary transition-all"
                      onClick={() => router.push('/')}
                    >
                      Return to Master Selection
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Encrypted Session
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter font-bold">
                  <Shield className="w-3 h-3" />
                  Proctored System
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter font-bold">
                  <GraduationCap className="w-3 h-3" />
                  L.A. Integrity
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
