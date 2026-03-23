'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, GraduationCap, BookOpen, ArrowLeft, Mail, Lock, LayoutDashboard } from 'lucide-react'
import type { UserRole } from '@/lib/types/auth'
import { cn } from '@/lib/utils'

const portalOptions = [
  {
    role: 'admin' as UserRole,
    title: 'Admin',
    description: 'Manage institutional settings and oversight',
    icon: ShieldCheck,
    gradient: 'from-primary to-primary/80',
    color: 'oklch(0.62 0.17 240)',
    demoEmail: 'admin@learnersacademy.com',
  },
  {
    role: 'teacher' as UserRole,
    title: 'Teacher',
    description: 'Classroom management and student progress',
    icon: BookOpen,
    gradient: 'from-primary to-primary/80',
    color: 'oklch(0.62 0.17 240)',
    demoEmail: 'teacher@learnersacademy.com',
  },
  {
    role: 'student' as UserRole,
    title: 'Assessment',
    description: 'Access exams, assignments and grades',
    icon: LayoutDashboard,
    gradient: 'from-primary to-primary/80',
    color: 'oklch(0.62 0.17 240)',
    demoEmail: 'student@learnersacademy.com',
  },
]

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const selectedPortal = portalOptions.find(p => p.role === selectedRole)

  const handleSelectRole = (role: UserRole) => {
    if (role === 'student') {
      router.push('/student')
      return
    }
    const portal = portalOptions.find(p => p.role === role)
    setSelectedRole(role)
    setEmail(portal?.demoEmail || '')
    setPassword('demo123')
    setError('')
  }

  const handleBack = () => {
    setSelectedRole(null)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setError('')

    try {
      await login({ email, password, role: selectedRole })
      toast.success('Welcome back!', {
        description: `Signed in as ${selectedPortal?.title}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      toast.error('Login failed', {
        description: 'Please check your credentials and try again',
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-6 max-w-5xl mx-auto overflow-hidden">
      {/* Logo Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-12"
      >
        <Logo size="2xl" orientation="vertical" className="mb-4" />
        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em] font-sans opacity-70">
          Premium English Language Education
        </p>
      </motion.div>

      {/* Portal Selection */}
      {!selectedRole ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {portalOptions.map((portal, idx) => {
            const Icon = portal.icon
            return (
              <motion.button
                key={portal.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleSelectRole(portal.role)}
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300 aspect-square hover:shadow-2xl hover:border-primary/50 overflow-hidden"
              >
                {/* Background Brand Tint */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  style={{ backgroundColor: portal.color }}
                />
                
                {/* Hover Glow */}
                <div 
                  className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-full scale-50 group-hover:scale-100"
                  style={{ backgroundColor: portal.color }}
                />

                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                  `bg-linear-to-br ${portal.gradient}`
                )}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="font-serif text-2xl font-medium mb-2 text-foreground">
                  {portal.title} Portal
                </h3>
                <p className="text-sm text-center text-muted-foreground font-sans max-w-[200px] leading-relaxed">
                  {portal.description}
                </p>

                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    Go to Portal <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : (
        /* Login Form */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-0 shadow-2xl glass-2 overflow-hidden">
          <CardHeader className="pb-2 pt-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 -ml-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to portal selection
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPortal?.gradient} flex items-center justify-center shadow-md`}>
                {selectedPortal && (() => {
                  const Icon = selectedPortal.icon
                  return <Icon className="w-5 h-5 text-white" />
                })()}
              </div>
              <div>
                <CardTitle className="font-serif text-xl">{selectedPortal?.title} Login</CardTitle>
              </div>
            </div>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>

                {error && <FieldError>{error}</FieldError>}

                <div className="flex items-center justify-between">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-0 pb-4">
            <div className="w-full flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Demo Credentials</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="w-full bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                Email: <span className="text-foreground font-mono">{selectedPortal?.demoEmail}</span>
              </p>
              <p className="text-muted-foreground">
                Password: <span className="text-foreground font-mono">demo123</span>
              </p>
            </div>
          </CardFooter>
        </Card>
        </motion.div>
      )}
    </div>
  )
}
