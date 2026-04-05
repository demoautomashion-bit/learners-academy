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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Phone, 
  User, 
  IdCard,
  Target,
  Clock,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import type { Student } from '@/lib/types'
import { SESSION_TIMINGS } from '@/lib/registry'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  guardianName: z.string().min(2, 'Guardian name must be at least 2 characters'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  password: z.string().min(8, 'Portal password must be at least 8 characters'),
  phone: z.string().min(5, 'Valid contact number is required for portal alerts'),
  course: z.string().min(1, 'Please select an academic batch'),
  timing: z.string().min(1, 'Please select a session timing'),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

export default function StudentRegistrationPage() {
  const router = useRouter()
  const { students, courses, enrollStudent, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      guardianName: '',
      studentId: '',
      password: '',
      phone: '',
      course: '',
      timing: '',
    }
  })

  const onSubmit = async (data: RegistrationFormValues) => {
    // Check for duplicate Student ID
    if (students.some(s => s.studentId?.toLowerCase() === data.studentId.toLowerCase())) {
        form.setError('studentId', { message: 'ID already exists in institutional database' })
        return
    }

    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9), // Fallback if enrollStudent doesn't generate
      studentId: data.studentId,
      name: data.name,
      email: `${data.studentId.toLowerCase()}@learnersacademy.com`,
      phone: data.phone,
      guardianName: data.guardianName,
      password: data.password,
      enrolledCourses: [data.course],
      classTiming: data.timing,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      progress: 0,
    }

    try {
      await enrollStudent(newStudent)
      toast.success('Registration Protocol Finalized')
      router.push('/admin/students')
    } catch (err) {
      // Error handled by context
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="">
            <Link href="/admin/students">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-medium">Onboarding Registry</h1>
            <p className="text-muted-foreground text-sm   opacity-60">Register New Academic Candidate</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => form.reset()}
          className="  hover:bg-primary/5 font-normal text-xs  "
        >
          Clear Protocol
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Personal Identity */}
          <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="bg-primary/5 border-b  py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3 font-medium">
                <div className="w-8 h-8  bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Personal Identity
              </CardTitle>
              <CardDescription>Official name and portal authentication credentials</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Full Name</FieldLabel>
                  <Input 
                    {...form.register('name')} 
                    placeholder="Candidate Name" 
                    className="h-12 bg-background/50   focus:ring-primary/20"
                  />
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.name.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Student ID</FieldLabel>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      {...form.register('studentId')} 
                      placeholder="e.g. STU-001" 
                      className="h-12 pl-10 bg-background/50   focus:ring-primary/20"
                    />
                  </div>
                  {form.formState.errors.studentId && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.studentId.message}</p>}
                </Field>
              </div>
              <Field>
                <FieldLabel className="text-editorial-label text-xs    opacity-60">Portal Password</FieldLabel>
                <SecureInput 
                  {...form.register('password')} 
                  placeholder="Min. 8 characters required" 
                  className="h-12 bg-background/50   focus:ring-primary/20"
                />
                {form.formState.errors.password && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.password.message}</p>}
              </Field>
            </CardContent>
          </Card>

          {/* Section 2: Guardian Protocols */}
          <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="bg-success/5 border-b  py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3 font-medium">
                <div className="w-8 h-8  bg-success/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-success" />
                </div>
                Guardian Protocols
              </CardTitle>
              <CardDescription>Primary contact for administrative and fee management</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Guardian Name</FieldLabel>
                  <Input 
                    {...form.register('guardianName')} 
                    placeholder="Full Name" 
                    className="h-12 bg-background/50   focus:ring-primary/20"
                  />
                  {form.formState.errors.guardianName && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.guardianName.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Contact Phone</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      {...form.register('phone')} 
                      placeholder="+1 (555) 000-0000" 
                      className="h-12 pl-10 bg-background/50   focus:ring-primary/20"
                    />
                  </div>
                  {form.formState.errors.phone && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.phone.message}</p>}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Academic Pathway */}
          <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="bg-accent/5 border-b  py-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3 font-medium">
                <div className="w-8 h-8  bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-accent" />
                </div>
                Academic Pathway
              </CardTitle>
              <CardDescription>Batch assignment and schedule configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Assigned Batch</FieldLabel>
                  <Select onValueChange={(val) => form.setValue('course', val)}>
                    <SelectTrigger className="h-12 bg-background/50  ">
                      <SelectValue placeholder="Select batch level" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.filter(c => c.status === 'active').map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title} ({course.teacherName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.course && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.course.message}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label text-xs    opacity-60">Class Timing</FieldLabel>
                  <Select onValueChange={(val) => form.setValue('timing', val)}>
                    <SelectTrigger className="h-12 bg-background/50  ">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TIMINGS?.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.timing && <p className="text-xs text-destructive mt-1 ">{form.formState.errors.timing.message}</p>}
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="glass-1 bg-gradient-to-br from-primary/10 to-accent/10 p-1 relative overflow-hidden group hover: hover: transition-all duration-500 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <Sparkles className="w-32 h-32" />
            </div>
            <div className="   p-8 space-y-6 relative z-10 h-full border border-white/20">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2  bg-primary animate-pulse" />
                  <h4 className="text-xs text-primary font-medium">Protocol Preview</h4>
               </div>
               
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12  bg-primary/10 flex items-center justify-center font-serif text-lg text-primary">
                      {form.watch('name')?.[0] || '?'}
                    </div>
                    <div>
                       <p className="text-sm font-serif">{form.watch('name') || 'Pending Identity'}</p>
                       <p className="text-xs text-muted-foreground ">{form.watch('studentId') || 'ID Pending'}</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t  space-y-4">
                    <div className="flex items-center gap-3">
                       <Target className="w-4 h-4 text-muted-foreground opacity-40" />
                       <p className="text-xs font-sans">
                         <span className="text-muted-foreground italic">Course:</span> {courses.find(c => c.id === form.watch('course'))?.title || 'Not Selected'}
                       </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Clock className="w-4 h-4 text-muted-foreground opacity-40" />
                       <p className="text-xs font-sans">
                         <span className="text-muted-foreground italic">Session:</span> {form.watch('timing') || 'Not Selected'}
                       </p>
                    </div>
                 </div>

                 <div className="pt-8 pt-4">
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                      className="w-full  bg-primary  shadow-xl shadow-primary/20 group overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {form.formState.isSubmitting ? 'Processing...' : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Finalize Registry
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4 italic opacity-60">
                      This action will generate permanent institutional credentials.
                    </p>
                 </div>
               </div>
            </div>
          </Card>
          
          <Card className="glass-1 p-6 border-dashed border-2 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
             <div className="flex items-center gap-3 text-muted-foreground">
                <Target className="w-4 h-4" />
                <p className="text-xs   ">Enrollment Quota</p>
             </div>
             <p className="text-xs mt-2 text-muted-foreground leading-relaxed">
               Assigned batches are currently at <span className="text-primary ">84%</span> capacity institutional-wide. Ensure correct timing allocation.
             </p>
          </Card>
        </div>
      </form>
    </div>
  )
}
