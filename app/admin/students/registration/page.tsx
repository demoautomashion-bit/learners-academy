'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  GraduationCap,
  Mail,
  Phone,
  UserCheck,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Hash,
  Clock,
  LayoutGrid
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { motion } from 'framer-motion'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'

export default function StudentRegistrationPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { enrollStudent, isInitialized } = useData()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guardianName: '',
    studentId: `STU-${Math.floor(10000 + Math.random() * 90000)}`,
    grade: '',
    classTiming: ''
  })

  // Animation variants
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await enrollStudent({
        ...formData,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        enrolledCourses: [],
        id: crypto.randomUUID()
      } as any)
      // Note: the enrollStudent action already triggers a success toast
      router.push('/admin/students')
    } catch (error: any) {
      // If executeAction already showed a toast, we don't need a second one here unless custom
      console.error('Registration failed:', error)
    }
  }

  return (
    <PageShell className="relative overflow-hidden min-h-screen">
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-xl mx-auto pt-8 pb-32">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="text-left space-y-1 ml-1">
            <motion.h1 variants={itemVariants} className="font-serif text-3xl text-foreground font-medium tracking-tight">
              Learner Admission
            </motion.h1>
          </div>

          {/* Admission Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-2 border-white/5 shadow-xl rounded-[2rem] overflow-hidden relative isolate">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-[100px] -z-10" />
              
              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 md:p-8 space-y-8">
                  
                  {/* Identity & Legal Block */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Identity Matrix</span>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Candidate Full Name</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="name" 
                            placeholder="e.g. Julian Thorne"
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            className="h-12 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-xl transition-all font-normal text-sm" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Guardian Name</Label>
                        <div className="relative">
                          <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="guardianName" 
                            placeholder="Sponsor Full Name"
                            value={formData.guardianName} 
                            onChange={handleInputChange} 
                            required 
                            className="h-12 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-xl transition-all font-normal text-sm" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Identity ID</Label>
                        <div className="relative">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="studentId" 
                            value={formData.studentId} 
                            onChange={handleInputChange} 
                            required 
                            className="h-12 pl-12 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-xl transition-all font-sans text-xs" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Contact</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="h-12 px-3 bg-muted/5 border-primary/10 rounded-xl text-[10px]" />
                            <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="h-12 px-3 bg-muted/5 border-primary/10 rounded-xl text-[10px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Architecture Block */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Placement</span>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Academic Tier</Label>
                        <Select onValueChange={(v) => handleSelectChange('grade', v)} required>
                          <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl focus:ring-primary/20 px-6 text-sm">
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-4 h-4 text-primary opacity-40" />
                                <SelectValue placeholder="Tier" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="glass-2 border-white/5">
                            {ACADEMY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level} className="text-xs focus:bg-primary/5 transition-colors">{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 group">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Session Slot</Label>
                        <Select onValueChange={(v) => handleSelectChange('classTiming', v)} required>
                          <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl focus:ring-primary/20 px-6 text-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary opacity-40" />
                                <SelectValue placeholder="Time" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="glass-2 border-white/5">
                            {SESSION_TIMINGS.map((time) => (
                                <SelectItem key={time} value={time} className="text-xs focus:bg-primary/5 transition-colors">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Global Success Button */}
                  <div className="flex flex-col gap-3 pt-6">
                    <Button 
                      type="submit"
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xl shadow-primary/20 transition-all group relative overflow-hidden text-sm font-medium"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Formalize Admission <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => router.back()}
                      className="h-10 font-semibold text-muted-foreground hover:text-foreground text-xs rounded-xl"
                    >
                      Cancel Admission
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
