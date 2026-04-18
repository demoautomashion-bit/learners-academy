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
  UserPlus,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function FacultyRegistrationPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { addTeacher, isInitialized } = useData()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    salary: '',
    education: '',
    experience: '',
    address: '',
    bio: ''
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
      await addTeacher({
        ...formData,
        salary: Number(formData.salary),
        status: 'active',
        joinDate: new Date().toISOString(),
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`
      })
      toast.success("Faculty personnel record established successfully")
      router.push('/admin/teachers')
    } catch (error) {
      toast.error("Critical Registry Error: Initialization failed")
    }
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  return (
    <PageShell>
      <PageHeader 
        title="Administer New Faculty"
        description="Initialize a new institutional identity within the secure personnel registry."
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
                        {s === 1 ? 'Identity' : s === 2 ? 'Credentials' : 'Authorization'}
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
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Full Legal Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="name" value={formData.name} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Email Protocol</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Secure Contact</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="phone" value={formData.phone} onChange={handleInputChange} required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Residential Geometry</Label>
                                    <Input name="address" value={formData.address} onChange={handleInputChange} className="h-12 bg-muted/5 border-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Academic Focus</Label>
                                    <Select onValueChange={(v) => handleSelectChange('subject', v)} required>
                                        <SelectTrigger className="h-12 bg-muted/5 border-none">
                                            <SelectValue placeholder="Select Specialization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="English Grammar">English Grammar</SelectItem>
                                            <SelectItem value="Linguistics">Linguistics</SelectItem>
                                            <SelectItem value="Advanced Phonetics">Advanced Phonetics</SelectItem>
                                            <SelectItem value="Creative Writing">Creative Writing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Highest Credential</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                                        <Input name="education" value={formData.education} onChange={handleInputChange} placeholder="e.g. Masters in TESOL" required className="h-12 pl-12 bg-muted/5 border-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Professional Trajectory</Label>
                                <Textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} placeholder="Summarize institutional experience..." className="bg-muted/5 border-none" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Agreed Stipend (PKR/Month)</Label>
                                    <Input name="salary" type="number" value={formData.salary} onChange={handleInputChange} required className="h-12 bg-muted/5 border-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Experience (Years)</Label>
                                    <Input name="experience" type="number" value={formData.experience} onChange={handleInputChange} required className="h-12 bg-muted/5 border-none" />
                                </div>
                            </div>
                            <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Institutional Authorization</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        By processing this registration, you authorize the creation of a secure personnel record and the allocation of an institutional Employee ID. This action is tracked in the system audit logs.
                                    </p>
                                </div>
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
                            <ChevronLeft className="w-4 h-4 mr-2" /> {step === 1 ? 'Abstain' : 'Back'}
                        </Button>
                        <Button 
                            type={step === 3 ? 'submit' : 'button'}
                            onClick={step === 3 ? undefined : nextStep}
                            className="font-normal px-8 h-12 shadow-xl shadow-primary/20"
                        >
                            {step === 3 ? 'Process Faculty Entry' : 'Proceed'} <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
             </form>
        </Card>
      </div>
    </PageShell>
  )
}
