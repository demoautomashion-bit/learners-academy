'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { User, Mail, Lock, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react'
import type { UserRole } from '@/lib/types/auth'

const roleOptions = [
  {
    role: 'teacher' as UserRole,
    title: 'Teacher',
    description: 'Join our faculty and teach students',
    icon: BookOpen,
  },
  {
    role: 'student' as UserRole,
    title: 'Student',
    description: 'Enroll and start learning',
    icon: GraduationCap,
  },
]

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleBack = () => {
    setSelectedRole(null)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register({ name, email, password, role: selectedRole })
      toast.success('Account created!', {
        description: 'Welcome to The Learners Academy',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      toast.error('Registration failed', {
        description: 'Please try again with different credentials',
      })
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Logo Header */}
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" className="mb-4" />
        <p className="text-muted-foreground text-center text-balance">
          Join Our Learning Community
        </p>
      </div>

      {/* Role Selection */}
      {!selectedRole ? (
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl">Create Account</CardTitle>
            <CardDescription>
              Choose how you want to join us
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.role}
                    onClick={() => setSelectedRole(option.role)}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-all duration-200 text-left hover-lift"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-0.5">
                        Register as {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong className="text-foreground">Note:</strong> Administrator accounts can only be created by existing administrators.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-2">
            <div className="w-full h-px bg-border" />
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      ) : (
        /* Registration Form */
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 -ml-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to role selection
            </button>
            <CardTitle className="font-serif text-xl">
              Register as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
            </CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>

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
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>

                {error && <FieldError>{error}</FieldError>}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{' '}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
