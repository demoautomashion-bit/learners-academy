'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as const,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await register(formData)
      toast.success('Account created successfully')
      // Redirect is handled by AuthProvider
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.message || 'Please check your inputs.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-linear-to-b from-background to-muted/30">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-8"
      >
        <Logo size="2xl" orientation="vertical" className="mb-4" />
        <h2 className="font-serif text-3xl font-bold text-center mb-2">Create Your Profile</h2>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-sans opacity-70">
          Join the Academy of Excellence
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
            <CardTitle className="font-serif text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground">
              Begin your academic journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Joining as...</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['teacher', 'student'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                      className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
                        formData.role === r 
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
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Full Name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Create Password" 
                    required 
                    className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-bold uppercase tracking-widest transition-premium mt-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-primary/5 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
