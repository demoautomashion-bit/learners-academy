'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  UserCheck, 
  DollarSign,
  ChevronLeft,
  Edit,
  History,
  TrendingUp,
  ShieldCheck,
  FileText
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn, getInitials } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function StudentDossierPage() {
  const hasMounted = useHasMounted()
  const params = useParams()
  const router = useRouter()
  const { students, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const student = students.find(s => s.id === params.id)
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <GraduationCap className="w-12 h-12 text-destructive/20 mb-4" />
        <h2 className="text-xl font-serif">Student Registry Not Found</h2>
        <p className="text-muted-foreground text-xs mt-2">The requested candidate identity does not exist in the academic database.</p>
        <Button variant="ghost" className="mt-8 font-normal" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Return to Roster
        </Button>
      </div>
    )
  }

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-30 mt-0.5">Academic Dossier / {student.studentId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Identity Card */}
        <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative isolate">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
            </div>
            <CardContent className="px-8 pb-10 -mt-12 relative isolate flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-6">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                        {getInitials(student.name, 'S')}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-serif font-medium tracking-tight">{student.name}</h2>
                <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold mt-2">{student.level} Tier Allocation</p>
                
                <div className="w-full mt-10 pt-10 border-t border-primary/5 space-y-5 text-left">
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Registry Email</span>
                            <span className="text-xs font-normal truncate max-w-[180px]">{student.email || 'No Email'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Primary Contact</span>
                            <span className="text-xs font-normal">{student.phone}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Residential Geometry</span>
                            <span className="text-xs font-normal leading-relaxed">{student.address || 'Not Logged'}</span>
                        </div>
                    </div>
                </div>

                <Button className="w-full mt-10 font-normal h-12 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                    <Edit className="w-4 h-4 mr-2" /> Modify Dossier
                </Button>
            </CardContent>
        </Card>

        {/* Details & Logs */}
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-8">
                <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 group hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Guardian Context</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Guardian Name</span>
                            <span className="text-xs font-medium">{student.guardianName || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Emergency Protocol</span>
                            <span className="text-xs font-medium">{student.guardianPhone || 'Not Configured'}</span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 group hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-success/5 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Financial Standing</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Monthly Tuition</span>
                            <span className="font-serif font-medium">PKR 12,000</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Scholarship Status</span>
                            <span className="font-serif font-medium text-success">Institutional Relief</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-40">Account Balance</span>
                            <Badge variant="outline" className="text-[9px] font-normal border-success/20 text-success">Clear</Badge>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-serif text-lg font-medium">Academic Audit & Notes</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40">Internal observations and student performance markers.</CardDescription>
                    </div>
                    <FileText className="w-4 h-4 opacity-20" />
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex items-center gap-6 mb-8 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="opacity-40 uppercase tracking-widest text-[9px] font-bold">Attendance Stability</span>
                            <span className="font-serif">96.4%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="opacity-40 uppercase tracking-widest text-[9px] font-bold">Assessment Mean</span>
                            <span className="font-serif">Grade A</span>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed font-normal text-foreground/80 whitespace-pre-wrap italic">
                        "{student.notes || "No internal academic notes have been logged for this candidate. Registry awaiting term-end performance review."}"
                    </p>
                </CardContent>
            </Card>

            <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-serif text-lg font-medium">Enrollment Chronology</CardTitle>
                        <CardDescription className="text-xs font-normal opacity-40">A timeline of institutional lifecycle events.</CardDescription>
                    </div>
                    <History className="w-4 h-4 opacity-20" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-primary/5">
                        {[
                            { event: 'Admission Protocol Executed', date: new Date(student.admissionDate || Date.now()).toLocaleDateString(), time: '10:00 AM', actor: 'Admin Registry' },
                            { event: 'Initial Level Placement: ' + student.level, date: new Date(student.admissionDate || Date.now()).toLocaleDateString(), time: '02:30 PM', actor: 'Academic Head' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-6 px-8 hover:bg-primary/[0.02] transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">{log.event}</span>
                                    <span className="text-[10px] text-muted-foreground opacity-40 mt-1">{log.date} at {log.time}</span>
                                </div>
                                <div className="text-[9px] uppercase tracking-widest font-bold opacity-30 italic">
                                    By: {log.actor}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </PageShell>
  )
}
