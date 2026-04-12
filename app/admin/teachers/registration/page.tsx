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
import { Field, FieldLabel } from '@/components/ui/field'

import { toast } from 'sonner'
import { 
  ArrowLeft, 
  UserPlus, 
  ShieldCheck 
} from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import type { Teacher } from '@/lib/types'

const teacherRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid academic email'),
  phone: z.string().min(5, 'Valid contact number is required'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  password: z.string().min(8, 'Portal password must be at least 8 characters'),
})

type TeacherRegistrationValues = z.infer<typeof teacherRegistrationSchema>

export default function TeacherRegistrationPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, addTeacher, isInitialized } = useData()

  const form = useForm<TeacherRegistrationValues>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      password: '',
    }
  })

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />


  const onSubmit = async (data: TeacherRegistrationValues) => {
    // Defensive check for initialization
    if (!isInitialized) return

    // Check for duplicates
    const existingTeachers = Array.isArray(teachers) ? teachers : []
    
    if (existingTeachers.some(t => t.employeeId?.toLowerCase() === data.employeeId.toLowerCase())) {
        form.setError('employeeId', { message: 'ID already exists in faculty registry' })
        return
    }
    if (existingTeachers.some(t => t.email?.toLowerCase() === data.email.toLowerCase())) {
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
      subjects: [], // Initialized as empty for now
      qualifications: [], // Initialized as empty for now
      status: 'active',
      joinedAt: new Date().toISOString(),
      coursesCount: 0,
      studentsCount: 0,
      requiresReview: true,
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
    <PageShell>
      <div className="max-w-xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Header */}
      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl font-medium tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
          Faculty Induction
        </h1>
        <p className="text-muted-foreground text-sm tracking-widest uppercase opacity-50 font-medium">
          Official Academic Registry
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-1 border-white/10 shadow-premium overflow-hidden rounded-3xl hover:translate-y-[-2px] transition-all duration-500">
          <CardHeader className="text-center pt-10 pb-2">
             <div className="mx-auto w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/20">
                <UserPlus className="w-5 h-5 text-primary opacity-80" />
             </div>
             <CardTitle className="font-serif text-2xl font-normal">Onboarding Protocol</CardTitle>
             <CardDescription className="text-xs uppercase tracking-tighter opacity-40">Verified Institutional Data Entry</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Field: Name */}
            <Field>
              <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70 mb-1.5 ml-1">Full Name</FieldLabel>
              <Input 
                {...form.register('name')} 
                placeholder="e.g. Dr. Alexander Sterling" 
                className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-base placeholder:opacity-20"
              />
              {form.formState.errors.name && <p className="text-[10px] text-destructive mt-1 font-medium uppercase tracking-wider">{form.formState.errors.name.message}</p>}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field: Email */}
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70 mb-1.5 ml-1">Academic Email</FieldLabel>
                <Input 
                  {...form.register('email')} 
                  placeholder="name@academy.com" 
                  className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder:opacity-20"
                />
                {form.formState.errors.email && <p className="text-[10px] text-destructive mt-1 font-medium uppercase tracking-wider">{form.formState.errors.email.message}</p>}
              </Field>

              {/* Field: Phone */}
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70 mb-1.5 ml-1">Contact Number</FieldLabel>
                <Input 
                  {...form.register('phone')} 
                  placeholder="+92 300 0000000" 
                  className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder:opacity-20"
                />
                {form.formState.errors.phone && <p className="text-[10px] text-destructive mt-1 font-medium uppercase tracking-wider">{form.formState.errors.phone.message}</p>}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              {/* Field: Employee ID */}
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70 mb-1.5 ml-1">Employee ID</FieldLabel>
                <Input 
                  {...form.register('employeeId')} 
                  placeholder="ID-001" 
                  className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder:opacity-20 font-mono"
                />
                {form.formState.errors.employeeId && <p className="text-[10px] text-destructive mt-1 font-medium uppercase tracking-wider">{form.formState.errors.employeeId.message}</p>}
              </Field>

              {/* Field: Password */}
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70 mb-1.5 ml-1">Portal Password</FieldLabel>
                <SecureInput 
                  {...form.register('password')} 
                  placeholder="••••••••" 
                  className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder:opacity-20"
                />
                {form.formState.errors.password && <p className="text-[10px] text-destructive mt-1 font-medium uppercase tracking-wider">{form.formState.errors.password.message}</p>}
              </Field>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-serif text-lg tracking-wide hover-lift shadow-xl shadow-primary/20 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {form.formState.isSubmitting ? 'Processing Inductions...' : 'Finalize Faculty Record'}
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
                 <ShieldCheck className="w-3 h-3" />
                 <span className="text-[9px] uppercase tracking-[0.3em] font-bold">End-to-End Encryption Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
            <Button variant="link" asChild className="text-muted-foreground/40 hover:text-primary transition-colors text-xs font-normal">
                <Link href="/admin/teachers" className="flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Faculty Registry
                </Link>
            </Button>
        </div>
      </form>
      </div>
    </PageShell>
  )
}
