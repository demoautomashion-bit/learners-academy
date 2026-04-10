'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
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
  IdCard,
  Sparkles
} from 'lucide-react'
import type { Student } from '@/lib/types'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  guardianName: z.string().min(2, 'Guardian name must be at least 2 characters'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  phone: z.string().regex(/^\+92\s?3\d{2}\s?\d{7}$/, 'Valid Pakistan contact number (+92 3XX XXXXXXX) is required'),
  course: z.string().min(1, 'Please select an academic batch'),
  timing: z.string().min(1, 'Please select a session timing'),
})


type RegistrationFormValues = z.infer<typeof registrationSchema>

export default function StudentRegistrationPage() {
  const router = useRouter()
  const { students, courses, enrollStudent, isInitialized } = useData()
  const hasMounted = useHasMounted()
  const [showSuccess, setShowSuccess] = useState(false)
  const [registeredStudent, setRegisteredStudent] = useState<any>(null)
  const [selectedCourseObj, setSelectedCourseObj] = useState<any>(null)

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      guardianName: '',
      studentId: '',
      phone: '+92 ',
      course: '',
      timing: '',
    }
  })

  if (!isInitialized || !hasMounted) return <DashboardSkeleton />

  const onSubmit = async (data: RegistrationFormValues) => {
    // Check for duplicate Student ID
    if (students.some(s => s.studentId?.toLowerCase() === data.studentId.toLowerCase())) {
        form.setError('studentId', { message: 'ID already exists in institutional database' })
        return
    }

    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: data.studentId,
      name: data.name,
      email: `${data.studentId.toLowerCase()}@learnersacademy.com`,
      phone: data.phone,
      guardianName: data.guardianName,
      password: data.studentId, // DEFAULT PORTAL ACCESS
      enrolledCourses: [data.course],
      classTiming: data.timing,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      progress: 0,
    }


    try {
      await enrollStudent(newStudent)
      setRegisteredStudent(newStudent)
      setSelectedCourseObj(courses?.find(c => c.id === data.course) || { title: data.course })
      setShowSuccess(true)
      toast.success('Registration Protocol Finalized')
    } catch (err) {
      // Error handled by context
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <GraduationCap className="w-7 h-7 text-primary opacity-80" />
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          Enrollment Registry
        </h1>
        <p className="text-muted-foreground text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold">
          Institutional Candidate Induction
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-1 border-white/10 shadow-premium overflow-hidden rounded-[2.5rem] hover:translate-y-[-2px] transition-all duration-500">
          <CardHeader className="text-center pt-10 pb-2 border-b border-white/5 bg-white/5">
             <CardTitle className="font-serif text-2xl font-light tracking-wide">Candidate Dossier</CardTitle>
             <CardDescription className="text-[9px] uppercase tracking-[0.2em] opacity-30 mt-1">Official Academic Record Entry</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            
            {/* Row 1: Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Candidate Full Name</FieldLabel>
                <Input 
                  {...form.register('name')} 
                  placeholder="Master/Miss Candidate" 
                  className="h-14 bg-background/20 border-white/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-base placeholder:opacity-10"
                />
                {form.formState.errors.name && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.name.message}</p>}
              </Field>

              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Institutional ID</FieldLabel>
                <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                    <Input 
                    {...form.register('studentId')} 
                    placeholder="STU-000" 
                    className="h-14 pl-12 bg-background/20 border-white/5 focus:border-primary/30 transition-all font-mono text-sm uppercase tracking-widest placeholder:opacity-10"
                    />
                </div>
                {form.formState.errors.studentId && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.studentId.message}</p>}
              </Field>
            </div>

            {/* Row 2: Guardianship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Guardian Identity</FieldLabel>
                <Input 
                  {...form.register('guardianName')} 
                  placeholder="Guardian Name" 
                  className="h-14 bg-background/20 border-white/5 focus:border-primary/30 transition-all text-sm placeholder:opacity-10"
                />
                {form.formState.errors.guardianName && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.guardianName.message}</p>}
              </Field>

              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Primary Contact (+92)</FieldLabel>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20" />
                    <Input 
                    {...form.register('phone')} 
                    placeholder="+92 3XX XXXXXXX" 
                    className="h-14 pl-12 bg-background/20 border-white/5 focus:border-primary/30 transition-all text-sm placeholder:opacity-10"
                    />
                </div>
                {form.formState.errors.phone && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.phone.message}</p>}
              </Field>
            </div>

            {/* Row 3: Class & Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Academic Batch</FieldLabel>
                <Select onValueChange={(val) => form.setValue('course', val)}>
                  <SelectTrigger className="h-14 bg-background/20 border-white/5 focus:border-primary/30 transition-all text-sm">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ACADEMY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.course && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.course.message}</p>}
              </Field>

              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Institutional Slot</FieldLabel>
                <Select onValueChange={(val) => form.setValue('timing', val)}>
                  <SelectTrigger className="h-14 bg-background/20 border-white/5 focus:border-primary/30 transition-all text-sm">
                    <SelectValue placeholder="Select Timing" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {SESSION_TIMINGS.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.timing && <p className="text-[9px] text-destructive mt-2 font-bold uppercase tracking-wider ml-1">{form.formState.errors.timing.message}</p>}
              </Field>
            </div>

            <div className="pt-8">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full h-16 rounded-[1.25rem] bg-primary text-primary-foreground font-serif text-xl tracking-wide hover-lift shadow-2xl shadow-primary/30 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {form.formState.isSubmitting ? 'Securing Registry...' : 'Finalize Institutional Enrollment'}
                  <Sparkles className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-8 opacity-20">
                 <ShieldCheck className="w-3 h-3 text-primary" />
                 <span className="text-[8px] uppercase tracking-[0.5em] font-black italic">Institutional Security Layer Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
            <Button variant="link" asChild className="text-muted-foreground/30 hover:text-primary transition-colors text-[10px] uppercase tracking-widest font-bold group">
                <Link href="/admin/students" className="flex items-center gap-3">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Student Body Dashboard
                </Link>
            </Button>
        </div>
      </form>

      {registeredStudent && (
        <Dialog 
          open={showSuccess} 
          onOpenChange={(open) => {
            setShowSuccess(open)
            if (!open) router.push('/admin/students')
          }}
        >
          <DialogContent className="sm:max-w-md text-center p-8">
            <div className="mx-auto w-16 h-16 bg-success/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-success/20 animate-in zoom-in duration-500">
               <ShieldCheck className="w-8 h-8 text-success" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Enrollment Finalized</DialogTitle>
              <DialogDescription className="text-xs font-normal opacity-60 mt-2">
                Candidate record secured. You can now generate the official institutional receipt.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-8">
              <Button 
                onClick={() => {
                  const courseObj = selectedCourseObj
                  const params = new URLSearchParams({
                    studentId:    registeredStudent.id,
                    courseId:     courseObj?.id || '',
                    tuitionFee:   String(0),
                    admissionFee: String(0),
                    discount:     String(0),
                    totalFee:     String(0),
                    paid:         String(0),
                    dues:         String(0),
                    term:         'Spring-2026',
                    teacherName:  courseObj?.teacherName || '',
                  })
                  window.open(`/admin/print/receipt?${params.toString()}`, '_blank')
                }}
                className="h-12 rounded-xl bg-primary shadow-lg shadow-primary/20 font-normal"
              >
                Launch Receipt Tab
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/students')}
                className="text-xs font-normal opacity-60"
              >
                Close & Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
