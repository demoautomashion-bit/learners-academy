'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export default function StudentRegistrationPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { addStudent, isInitialized } = useData()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    previousSchool: '',
    notes: ''
  })

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        admissionDate: new Date().toISOString(),
        studentId: `STU-${Math.floor(10000 + Math.random() * 90000)}`
      })
      toast.success("Candidate admission processed successfully")
      router.push('/admin/students')
    } catch (error) {
      toast.error("Critical Registry Error: Admission protocol failed")
    }
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  return (
    <PageShell>
      <PageHeader 
        title="Candidate Admission Registry"
        description="Formalize the enrollment of a new learner into the institutional academic branch."
      />

      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-12 relative">
             <div className="absolute top-1/2 left-0 w-full h-px bg-primary/5 -translate-y-1/2 -z-10" />
             {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center gap-3 bg-background px-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                        step === s ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : 
                        step > s ? "bg-success/10 text-success border-success/30" : "bg-muted/50 text-muted-foreground border-transparent"
                    )}>
                        {step > s ? <BadgeCheck className="w-5 h-5" /> : s}
                    </div>
                    <span className={cn(
                        "text-[10px] uppercase tracking-widest font-bold",
                        step === s ? "text-primary" : "text-muted-foreground opacity-40"
                    )}>
                        {s === 1 ? 'Candidate' : s === 2 ? 'Guardian' : 'Academic'}
                    </span>
                </div>
             ))}
        </div>

        <Card className="glass-1 border-primary/5 shadow-2xl rounded-[2rem] overflow-hidden">
             <form onSubmit={handleSubmit}>
                <CardContent className="p-12">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Full Candidate Name</Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="name" value={formData.name} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Digital Protocol (Email)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Candidate Contact</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="phone" value={formData.phone} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Primary Geometry (Address)</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="address" value={formData.address} onChange={handleInputChange} className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Guardian/Sponsor Name</Label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="guardianName" value={formData.guardianName} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Guardian Contact</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Tier Placement</Label>
                                    <Select onValueChange={(v) => handleSelectChange('level', v)} required>
                                        <SelectTrigger className="h-12 bg-muted/5 border-none">
                                            <SelectValue placeholder="Primary Level Allocation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Foundation">Foundation Tier</SelectItem>
                                            <SelectItem value="Core">Core Tier</SelectItem>
                                            <SelectItem value="Advanced">Advanced Tier</SelectItem>
                                            <SelectItem value="Specialized">Specialized Track</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Previous Institution</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Clinical or Academic Notes</Label>
                                <Textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={4} placeholder="Summarize candidate profile..." className="bg-muted/5 border-none" />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-primary/5">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={step === 1 ? () => router.back() : prevStep}
                            className="font-normal opacity-60 hover:opacity-100"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> {step === 1 ? 'Retract' : 'Back'}
                        </Button>
                        <Button 
                            type={step === 3 ? 'submit' : 'button'}
                            onClick={step === 3 ? undefined : nextStep}
                            className="font-normal px-8 h-12 shadow-xl shadow-primary/20"
                        >
                            {step === 3 ? 'Admit Candidate' : 'Next Cycle'} <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
             </form>
        </Card>
      </div>
    </PageShell>
  )
}
