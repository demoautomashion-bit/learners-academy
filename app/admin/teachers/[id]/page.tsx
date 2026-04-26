'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Briefcase, 
  DollarSign,
  ChevronLeft,
  Edit,
  History,
  Award
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn, getInitials } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Teacher } from '@/lib/types'

export default function FacultyProfilePage() {
  const hasMounted = useHasMounted()
  const params = useParams()
  const router = useRouter()
  const { teachers, attendance, updateTeacher, isInitialized } = useData()
  const [isEditing, setIsEditing] = useState(false)

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const teacher = teachers.find(t => t.id === params.id)
  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck className="w-12 h-12 text-destructive/20 mb-4" />
        <h2 className="text-xl font-serif">Personnel Record Not Found</h2>
        <p className="text-muted-foreground text-xs mt-2">The requested faculty identity does not exist in the institutional registry.</p>
        <Button variant="ghost" className="mt-8 font-normal" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Return to Roster
        </Button>
      </div>
    )
  }

  const teacherAttendance = attendance.filter(a => a.teacherId === teacher.id)
  const presentDays = teacherAttendance.filter(a => a.status === 'Present').length
  const totalDays = teacherAttendance.length
  const efficiency = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-30 mt-0.5">Personnel Profile / {teacher.employeeId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Identity Card */}
        <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative isolate">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
            </div>
            <CardContent className="px-8 pb-10 -mt-12 relative isolate flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-6">
                    <AvatarImage src={teacher.avatar} />
                    <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                        {getInitials(teacher.name, 'T')}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-serif font-medium tracking-tight">{teacher.name}</h2>
                <p className="text-sm text-primary/70 font-normal mt-1">{teacher.subject}</p>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Badge className={cn(
                        "font-normal uppercase tracking-widest text-[10px] px-3 py-1",
                        teacher.status === 'active' ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"
                    )}>
                        {teacher.status === 'active' ? 'Operational' : 'Hibernated'}
                    </Badge>
                    <Badge variant="outline" className="font-normal uppercase tracking-widest text-[10px] px-3 py-1 border-primary/10">
                        Level 4 Faculty
                    </Badge>
                </div>

                <div className="w-full mt-10 pt-10 border-t border-primary/5 space-y-5 text-left">
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Email Protocol</span>
                            <span className="text-xs font-normal truncate max-w-[180px]">{teacher.email}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Secure Contact</span>
                            <span className="text-xs font-normal">{teacher.phone}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Physical Address</span>
                            <span className="text-xs font-normal leading-relaxed">{teacher.address || 'Not Registered'}</span>
                        </div>
                    </div>
                </div>

                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-10 font-normal h-12 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                >
                    <Edit className="w-4 h-4 mr-2" /> Modify Profile
                </Button>
            </CardContent>
        </Card>

        {/* Details & Logs */}
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-8">
                <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 group hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Employment Specs</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Contractual Salary</span>
                            <span className="font-serif font-medium flex items-center gap-1">
                                <DollarSign className="w-3 h-3 opacity-30" /> {teacher.salary?.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Years of Experience</span>
                            <span className="font-serif font-medium">{teacher.experience || 0} Years</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Join Date</span>
                            <span className="font-serif font-medium">{new Date(teacher.joinDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 group hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-success/5 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                            <Award className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Academic Status</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Active Batches</span>
                            <span className="font-serif font-medium">{String(teacher.coursesCount || 0).padStart(2, '0')} Classes</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Attendance Efficiency</span>
                            <span className={cn("font-serif font-medium", efficiency >= 90 ? "text-success" : efficiency >= 75 ? "text-warning" : "text-destructive")}>
                                {efficiency}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Total Work Days</span>
                            <span className="font-serif font-medium">{totalDays} Recorded</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-serif text-lg font-medium">Academic Trajectory (Bio)</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40">Detailed professional background and focus areas.</CardDescription>
                    </div>
                    <BookOpen className="w-4 h-4 opacity-20" />
                </CardHeader>
                <CardContent className="p-8">
                    <p className="text-sm leading-relaxed font-normal text-foreground/80 whitespace-pre-wrap">
                        {teacher.bio || "No detailed biography registered for this faculty member. Personnel record awaiting professional summary ingestion."}
                    </p>
                </CardContent>
            </Card>

            <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-serif text-lg font-medium">Recent Institutional Logs</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40">System-wide activity related to this identity.</CardDescription>
                    </div>
                    <History className="w-4 h-4 opacity-20" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-primary/5">
                        <div className="flex items-center justify-between p-6 px-8 hover:bg-primary/[0.02] transition-colors">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium">Identity Initialized</span>
                                <span className="text-[10px] text-muted-foreground opacity-40 mt-1">
                                    {new Date(teacher.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })} at {new Date(teacher.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-success/60">
                                <ShieldCheck className="w-3 h-3" /> verified
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {isEditing && (
        <ModifyTeacherDialog 
          teacher={teacher} 
          onClose={() => setIsEditing(false)} 
          onUpdate={updateTeacher}
        />
      )}
    </PageShell>
  )
}

function ModifyTeacherDialog({ teacher, onClose, onUpdate }: { teacher: Teacher | null, onClose: () => void, onUpdate: any }) {
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        email: '',
        phone: '',
        employeePassword: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                employeeId: teacher.employeeId || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                employeePassword: teacher.employeePassword || ''
            })
        }
    }, [teacher])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!teacher) return
        
        setIsSaving(true)
        try {
            await onUpdate(teacher.id, formData)
            toast.success("Profile Updated", { description: "Institutional records have been synchronized." })
            onClose()
        } catch (err) {
            toast.error("Update Failed")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md glass-3 border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <DialogHeader className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                            <Edit className="w-5 h-5" />
                        </div>
                        <DialogTitle className="font-serif text-xl font-medium tracking-tight">Modify Profile</DialogTitle>
                        <DialogDescription className="text-[11px] opacity-60 leading-relaxed font-normal">
                            Update faculty credentials and institutional identifiers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Full Name</Label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="Teacher Name"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Employee ID</Label>
                            <Input 
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="EMP-001"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Official Email</Label>
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="email@academy.com"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Phone Number</Label>
                                <Input 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                    placeholder="+1 234..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Portal Password</Label>
                                <Input 
                                    type="password"
                                    value={formData.employeePassword}
                                    onChange={(e) => setFormData({...formData, employeePassword: e.target.value})}
                                    className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-12 bg-primary hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                        >
                            {isSaving ? "Synchronizing..." : "Update Record"}
                        </Button>
                        <Button 
                            type="button"
                            variant="ghost" 
                            onClick={onClose} 
                            className="h-10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
