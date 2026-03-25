'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Loader2, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('student')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login({ email, role })
      toast.success('Successfully logged in')
      // Redirect is handled by AuthProvider
    } catch (error: any) {
      toast.error('Login Failed', {
        description: error.message || 'Please check your credentials.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-linear-to-b from-background to-muted/30">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-6"
      >
        <Logo size="2xl" orientation="vertical" className="mb-4" />
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-sans opacity-70 text-center">
          Identity & Access Management
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="font-serif text-3xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your academy credentials below
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'teacher', 'student'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
                        role === r 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="name@learnersacademy.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl focus:ring-primary/20"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl font-bold uppercase tracking-widest transition-premium" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'Authenticating...' : 'Enter Portal'}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-primary/5 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
