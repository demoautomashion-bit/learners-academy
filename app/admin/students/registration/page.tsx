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
  const { addStudent, isInitialized } = useData()
  
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
      await addStudent({
        ...formData,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        enrolledCourses: [],
        id: crypto.randomUUID()
      } as any)
      toast.active("Candidate identity established", {
          description: "New learner has been formalized in the institutional registry."
      })
      router.push('/admin/students')
    } catch (error) {
      toast.error("Admission Registry Interrupted")
    }
  }

  return (
    <PageShell className="relative overflow-hidden min-h-screen">
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-3xl mx-auto pt-16 pb-32">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] items-center uppercase tracking-[0.3em] font-bold text-primary mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Institutional Enrollment
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl text-foreground font-medium tracking-tight">
              Learner Admission
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-sm max-w-sm mx-auto opacity-60 leading-relaxed font-normal">
              Formalize a new academic odyssey by initializing secure identity records and session scheduling.
            </motion.p>
          </div>

          {/* Admission Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-2 border-white/5 shadow-2xl rounded-[3rem] overflow-hidden relative isolate">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-[100px] -z-10" />
              
              <form onSubmit={handleSubmit}>
                <CardContent className="p-10 md:p-16 space-y-12">
                  
                  {/* Identity & Legal Block */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Identity Matrix</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Legal Full Name</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="name" 
                            placeholder="e.g. Julian Thorne"
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Guardian Authority</Label>
                        <div className="relative">
                          <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="guardianName" 
                            placeholder="Full Name of Sponsor"
                            value={formData.guardianName} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Institutional ID</Label>
                        <div className="relative">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                          <Input 
                            name="studentId" 
                            value={formData.studentId} 
                            onChange={handleInputChange} 
                            required 
                            className="h-14 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-mono text-sm" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Contact Protocol</Label>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary opacity-20" />
                              <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="h-14 pl-10 bg-muted/5 border-primary/10 rounded-2xl text-xs" />
                           </div>
                           <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary opacity-20" />
                              <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="h-14 pl-10 bg-muted/5 border-primary/10 rounded-2xl text-xs" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Architecture Block */}
                  <div className="space-y-8 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Placement Allocation</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Academic Class</Label>
                        <Select onValueChange={(v) => handleSelectChange('grade', v)} required>
                          <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl focus:ring-primary/20 px-6">
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-4 h-4 text-primary opacity-40" />
                                <SelectValue placeholder="Select Tier Placement" />
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
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Session Timing</Label>
                        <Select onValueChange={(v) => handleSelectChange('classTiming', v)} required>
                          <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl focus:ring-primary/20 px-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary opacity-40" />
                                <SelectValue placeholder="Select Daily Slot" />
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
                  <div className="flex flex-col gap-6 pt-10">
                    <Button 
                      type="submit"
                      className="w-full h-18 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all group relative overflow-hidden text-base font-medium"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Formalize Admission <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => router.back()}
                      className="h-12 font-bold opacity-30 hover:opacity-100 text-[10px] tracking-[0.3em] uppercase rounded-2xl"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-2" /> Discard Admission
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
