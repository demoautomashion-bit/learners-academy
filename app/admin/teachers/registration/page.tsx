'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  ArrowRight,
  X,
  ShieldCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
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
      toast.success("Faculty member registered")
      router.push('/admin/teachers')
    } catch (error) {
      toast.error("Registration failed")
    }
  }

  return (
    <PageShell className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10 bg-background/50 backdrop-blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px]"
      >
        <div className="glass-3 border-white/10 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            <button 
              onClick={() => router.back()}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-40 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
            <h1 className="text-3xl font-serif font-medium tracking-tight mb-2">Register Faculty</h1>
            <p className="text-[13px] text-muted-foreground font-normal leading-relaxed opacity-60">
              Initialize a new faculty account within the institution.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-8">
            
            {/* Identity Group */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">Identity Details</span>
              <div className="bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-black/[0.03] dark:border-white/[0.03]">
                <div className="px-6 py-4 flex items-center gap-4 group">
                  <Label className="w-24 text-[13px] font-normal opacity-50 group-focus-within:opacity-100 transition-opacity">Full Name</Label>
                  <Input 
                    name="name"
                    placeholder="e.g. Alistair Vance"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-[14px] font-normal placeholder:opacity-20"
                  />
                </div>
                <div className="h-px bg-black/[0.05] dark:bg-white/[0.05] mx-6" />
                <div className="px-6 py-4 flex items-center gap-4 group">
                  <Label className="w-24 text-[13px] font-normal opacity-50 group-focus-within:opacity-100 transition-opacity">Email</Label>
                  <Input 
                    name="email"
                    type="email"
                    placeholder="vance@academy.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-[14px] font-normal placeholder:opacity-20"
                  />
                </div>
                <div className="h-px bg-black/[0.05] dark:bg-white/[0.05] mx-6" />
                <div className="px-6 py-4 flex items-center gap-4 group">
                  <Label className="w-24 text-[13px] font-normal opacity-50 group-focus-within:opacity-100 transition-opacity">Contact</Label>
                  <Input 
                    name="phone"
                    placeholder="+92 300 0000000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-[14px] font-normal placeholder:opacity-20"
                  />
                </div>
              </div>
            </div>

            {/* Security Group */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">Security & Access</span>
              <div className="bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-black/[0.03] dark:border-white/[0.03]">
                <div className="px-6 py-4 flex items-center gap-4 group">
                  <Label className="w-24 text-[13px] font-normal opacity-50 group-focus-within:opacity-100 transition-opacity">Staff ID</Label>
                  <Input 
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-[14px] font-mono placeholder:opacity-20"
                  />
                </div>
                <div className="h-px bg-black/[0.05] dark:bg-white/[0.05] mx-6" />
                <div className="px-6 py-4 flex items-center gap-4 group">
                  <Label className="w-24 text-[13px] font-normal opacity-50 group-focus-within:opacity-100 transition-opacity">Password</Label>
                  <Input 
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-[14px] font-normal placeholder:opacity-20"
                  />
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="pt-2">
              <Button 
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] font-medium text-[15px] group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Complete Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted Institutional Protocol</span>
              </div>
            </div>

          </form>
        </div>
      </motion.div>
    </PageShell>
  )
}
