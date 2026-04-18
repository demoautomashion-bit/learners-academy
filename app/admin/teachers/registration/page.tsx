'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  UserCircle,
  Mail,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Hash,
  Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { motion } from 'framer-motion'

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
        tempPassword: formData.password,
        studentsCount: 0,
        id: crypto.randomUUID()
      } as any)
      toast.success("Staff member successfully added to the registry.")
      router.push('/admin/teachers')
    } catch (error) {
      toast.error("Failed to add staff member.")
    }
  }

  return (
    <PageShell className="relative overflow-hidden min-h-screen">
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-xl mx-auto pt-16 pb-32">
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
              Staff Registry
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl text-foreground font-medium tracking-tight">
              Add Staff Member
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-sm max-w-sm mx-auto opacity-60 leading-relaxed font-normal">
              Register a new teacher or administrative staff member with secure access and identity records.
            </motion.p>
          </div>

          {/* Registration Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-2 border-white/5 shadow-2xl rounded-[3rem] overflow-hidden relative isolate">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-[100px] -z-10" />
              
              <form onSubmit={handleSubmit}>
                <CardContent className="p-8 md:p-12 space-y-10">
                  
                  {/* Identity Block */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Identity</span>
                    </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Full Name</Label>
                          <div className="relative">
                            <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="name" 
                              placeholder="e.g. Alistair Vance"
                              value={formData.name} 
                              onChange={handleInputChange} 
                              required 
                              className="h-12 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal text-sm" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="email" 
                              type="email"
                              placeholder="vance@academy.edu"
                              value={formData.email} 
                              onChange={handleInputChange} 
                              required 
                              className="h-12 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal text-sm" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Staff ID</Label>
                          <div className="relative">
                            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="employeeId" 
                              value={formData.employeeId} 
                              onChange={handleInputChange} 
                              required 
                              className="h-12 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-mono text-xs" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2 group">
                          <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Contact</Label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                            <Input 
                              name="phone" 
                              placeholder="+92 300 0000000"
                              value={formData.phone} 
                              onChange={handleInputChange} 
                              required 
                              className="h-12 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal text-xs" 
                            />
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* Security Block */}
                  <div className="space-y-8 pt-10 border-t border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Access Control</span>
                    </div>

                    <div className="space-y-2 group max-w-xs">
                      <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Portal Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-all" />
                        <Input 
                          name="password" 
                          type="password"
                          placeholder="••••••••"
                          value={formData.password} 
                          onChange={handleInputChange} 
                          required 
                          className="h-12 pl-14 bg-muted/5 border-primary/5 focus:bg-background/80 focus:border-primary/20 rounded-2xl transition-all font-normal text-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Actions */}
                  <div className="flex flex-col gap-4 pt-10">
                    <Button 
                      type="submit"
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] shadow-2xl shadow-primary/20 transition-all group relative overflow-hidden text-base font-medium"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Add Staff Member <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => router.back()}
                      className="h-10 font-bold opacity-30 hover:opacity-100 text-[10px] tracking-[0.3em] uppercase rounded-xl"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-2" /> Cancel
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
