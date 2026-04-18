'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  UserPlus, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Key, 
  Hash,
  ArrowRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { motion, AnimatePresence } from 'framer-motion'

export default function FacultyRegistrationPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { addTeacher, isInitialized } = useData()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    password: ''
  })

  // Animation variants for a staggered entrance
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1 
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addTeacher({
        ...formData,
        subjects: [],
        qualifications: [],
        status: 'active',
        joinedAt: new Date().toISOString(),
        coursesCount: 0,
        tempPassword: formData.password, // Storing for enrollment record
        studentsCount: 0,
        id: crypto.randomUUID()
      } as any)
      toast.success("Institutional identity established successfully")
      router.push('/admin/teachers')
    } catch (error) {
      toast.error("Registry protocol interrupted")
    }
  }

  return (
    <PageShell className="relative overflow-hidden">
      {/* Background Atmospheric Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-xl mx-auto pt-12 pb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] items-center uppercase tracking-[0.2em] font-bold text-primary mb-2">
              <Sparkles className="w-3 h-3" />
              Secure Onboarding
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-serif text-5xl text-foreground font-medium tracking-tight">
              Faculty Initialization
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-sm max-w-sm mx-auto opacity-60 leading-relaxed font-normal">
              Register a new institutional identity with encrypted access credentials and secure personnel history.
            </motion.p>
          </div>

          {/* Registration Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-2 border-primary/5 shadow-2xl rounded-[2.5rem] overflow-hidden relative isolate">
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
              
              <form onSubmit={handleSubmit}>
                <CardContent className="p-10 md:p-14 space-y-10">
                  
                  {/* Identity Block */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-px h-4 bg-primary" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Personnel Identity</span>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Legal Full Name</Label>
                        <div className="relative">
                          <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="name" 
                            placeholder="e.g. Dr. Alistair Vance"
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal placeholder:opacity-20" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Digital Protocol (Email)</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="email" 
                              type="email" 
                              placeholder="vance@academy.edu"
                              value={formData.email} 
                              onChange={handleInputChange} 
                              required 
                              className="h-14 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal placeholder:opacity-20" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Secure Contact</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="phone" 
                              placeholder="+92 300 1234567"
                              value={formData.phone} 
                              onChange={handleInputChange} 
                              required 
                              className="h-14 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal placeholder:opacity-20" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authorization Block */}
                  <div className="space-y-6 pt-6 border-t border-primary/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-px h-4 bg-primary" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Security Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Employee ID</Label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="employeeId" 
                            value={formData.employeeId} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-mono text-xs placeholder:opacity-20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Access Password</Label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="password" 
                            type="password" 
                            placeholder="••••••••"
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal placeholder:opacity-20" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-primary/[0.03] rounded-2xl border border-primary/10 flex items-start gap-4 mt-8 backdrop-blur-sm">
                      <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary/80">Security Protocol</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-normal opacity-70">
                          Account creation generates a secure crypt-hash of the password. This user will have operational authority based on their faculty tier.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-4 mt-6">
                    <Button 
                      type="submit"
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all group relative overflow-hidden font-normal tracking-wide"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Initialize Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => router.back()}
                      className="h-12 font-normal opacity-40 hover:opacity-100 text-xs tracking-widest uppercase rounded-2xl"
                    >
                      <ChevronLeft className="w-3 h-3 mr-2" /> Discard Registration
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageShell>
  )
}
