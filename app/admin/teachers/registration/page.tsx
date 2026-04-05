'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SecureInput } from '@/components/ui/secure-input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  IdCard,
  Target,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import type { Teacher } from '@/lib/types'

const teacherRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid academic email'),
  phone: z.string().min(5, 'Valid contact number is required'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  password: z.string().min(8, 'Portal password must be at least 8 characters'),
  subjects: z.string().min(2, 'List primary subjects taught'),
  qualifications: z.string().min(2, 'Enter academic qualifications'),
})

type TeacherRegistrationValues = z.infer<typeof teacherRegistrationSchema>

export default function TeacherRegistrationPage() {
  const router = useRouter()
  const { teachers, addTeacher, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />

  const form = useForm<TeacherRegistrationValues>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      password: '',
      subjects: '',
      qualifications: '',
    }
  })

  const onSubmit = async (data: TeacherRegistrationValues) => {
    // Check for duplicates
    if (teachers.some(t => t.employeeId.toLowerCase() === data.employeeId.toLowerCase())) {
        form.setError('employeeId', { message: 'ID already exists in faculty registry' })
        return
    }
    if (teachers.some(t => t.email.toLowerCase() === data.email.toLowerCase())) {
        form.setError('email', { message: 'Email is already registered' })
        return
    }

    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      employeeId: data.employeeId,
      employeePassword: data.password,
      subjects: data.subjects.split(',').map(s => s.trim()),
      qualifications: data.qualifications.split(',').map(q => q.trim()),
      status: 'active',
      joinedAt: new Date().toISOString(),
      coursesCount: 0,
      studentsCount: 0,
      requiresReview: true, // Default to true for new teachers
    }

    try {
      await addTeacher(newTeacher)
      toast.success('Professional Onboarding Finalized')
      router.push('/admin/teachers')
    } catch (err) {
      // Handled by context
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/teachers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Faculty Onboarding</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-60">Register New Academic Instructor</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => form.reset()}
          className="rounded-xl border-primary/10 hover:bg-primary/5 font-normal text-xs uppercase tracking-widest"
        >
          Reset Protocol
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Personal Protocols */}
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Personal Protocols
              </CardTitle>
              <CardDescription>Verified identity and contact information</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Field>
                <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Full Name</FieldLabel>
                <Input 
                  {...form.register('name')} 
                  placeholder="Instructor Full Name" 
                  className="h-12 bg-background/50 border-primary/10 rounded-xl"
                />
                {form.formState.errors.name && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.name.message}</p>}
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Academic Email</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      {...form.register('email')} 
                      placeholder="teacher@academy.com" 
                      className="h-12 pl-10 bg-background/50 border-primary/10 rounded-xl"
                    />
                  </div>
                  {form.formState.errors.email && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.email.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      {...form.register('phone')} 
                      placeholder="+92 300 0000000" 
                      className="h-12 pl-10 bg-background/50 border-primary/10 rounded-xl"
                    />
                  </div>
                  {form.formState.errors.phone && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.phone.message}</p>}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Institutional Security */}
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium overflow-hidden">
            <CardHeader className="bg-success/5 border-b border-primary/5 py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-success" />
                </div>
                Institutional Security
              </CardTitle>
              <CardDescription>Authentication and employee identity records</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Employee ID</FieldLabel>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      {...form.register('employeeId')} 
                      placeholder="e.g. EMP-101" 
                      className="h-12 pl-10 bg-background/50 border-primary/10 rounded-xl"
                    />
                  </div>
                  {form.formState.errors.employeeId && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.employeeId.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Portal Password</FieldLabel>
                  <SecureInput 
                    {...form.register('password')} 
                    placeholder="Min. 8 characters" 
                    className="h-12 bg-background/50 border-primary/10 rounded-xl"
                  />
                  {form.formState.errors.password && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.password.message}</p>}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Academic Specialization */}
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md shadow-premium overflow-hidden">
            <CardHeader className="bg-accent/5 border-b border-primary/5 py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-accent" />
                </div>
                Academic Specialization
              </CardTitle>
              <CardDescription>Subject expertise and official qualifications</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Field>
                <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Primary Subjects</FieldLabel>
                <Input 
                  {...form.register('subjects')} 
                  placeholder="e.g. English Grammar, IELTS, Speaking (Comma separated)" 
                  className="h-12 bg-background/50 border-primary/10 rounded-xl"
                />
                {form.formState.errors.subjects && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.subjects.message}</p>}
              </Field>
              <Field>
                <FieldLabel className="text-editorial-label text-[10px] font-bold uppercase tracking-widest opacity-60">Qualifications</FieldLabel>
                <Input 
                  {...form.register('qualifications')} 
                  placeholder="e.g. MA English, CELTA Certified (Comma separated)" 
                  className="h-12 bg-background/50 border-primary/10 rounded-xl"
                />
                {form.formState.errors.qualifications && <p className="text-[10px] text-destructive mt-1 font-bold">{form.formState.errors.qualifications.message}</p>}
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-primary/5 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl shadow-premium p-1 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <Sparkles className="w-32 h-32" />
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-[2.3rem] p-8 space-y-6 relative z-10 h-full border border-white/20">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Live Dossier Preview</h4>
               </div>
               
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-4 ring-background shadow-xl">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-serif">
                        {form.watch('name')?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                       <p className="text-xl font-serif leading-none mb-1">{form.watch('name') || 'Pending Name'}</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{form.watch('employeeId') || 'EMP-TBC'}</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-primary/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Mail className="w-4 h-4 text-muted-foreground opacity-40" />
                       <p className="text-[11px] font-sans truncate">{form.watch('email') || 'Email Pending'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <BookOpen className="w-4 h-4 text-muted-foreground opacity-40" />
                       <div className="flex flex-wrap gap-1">
                         {form.watch('subjects') ? form.watch('subjects').split(',').map((s, i) => (
                           <Badge key={i} variant="outline" className="text-[8px] bg-background/50 h-5 px-1.5">{s.trim()}</Badge>
                         )) : <span className="text-[11px] text-muted-foreground italic">No subjects assigned</span>}
                       </div>
                    </div>
                 </div>

                 <div className="pt-8">
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                      className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-primary/20 group overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {form.formState.isSubmitting ? 'Onboarding...' : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Finalize Records
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Button>
                 </div>
               </div>
            </div>
          </Card>
          
          <Card className="rounded-[2.5rem] border-primary/5 bg-card/40 backdrop-blur-md p-6 border-dashed border-2">
             <div className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Security Compliance</p>
             </div>
             <p className="text-xs mt-2 text-muted-foreground leading-relaxed">
               All new faculty onboarding triggers an automatic <span className="text-primary font-bold">Paper Review Protocol</span>. Direct publication access is granted post administrative audit.
             </p>
          </Card>
        </div>
      </form>
    </div>
  )
}
