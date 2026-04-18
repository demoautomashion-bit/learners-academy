'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import {
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Undo2,
  Hash
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Teacher, TeacherAttendance } from '@/lib/types'
import { format, addDays, startOfWeek, isSameDay, isWeekend, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Substitution'

export default function AttendanceRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({})

  // Mock historical data for heatmap visualization
  const teacherStats = useMemo(() => {
    return teachers.reduce((acc, t) => {
      acc[t.id] = {
        streak: [1, 1, 1, 0, 1, 1, 1], // 7 day trace
        monthlyRate: 94,
        totalSubstitutions: Math.floor(Math.random() * 5)
      }
      return acc
    }, {} as any)
  }, [teachers])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const activeTeachers = teachers.filter(t => t.status === 'active')
  const filteredTeachers = activeTeachers.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ ...prev, [teacherId]: status }))
    toast.active(`Identity ${status.toUpperCase()} recorded`, {
        description: `Personnel registry updated for ${selectedDate.toDateString()}`,
        duration: 2000
    })
  }

  // Calendar Strip Logic
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const calendarDays = Array.from({ length: 14 }).map((_, i) => addDays(weekStart, i - 3))

  const stats = [
    { label: 'Operational Presence', value: '94.2%', sub: 'Institutional Avg', icon: UserCheck, color: 'text-success' },
    { label: 'Session Velocity', value: '12', sub: 'Substitutions Today', icon: Sparkles, color: 'text-indigo-400' },
  ]

  return (
    <PageShell className="relative pb-24">
      <PageHeader 
        title="Institutional Attendance Hub"
        description="High-fidelity operational audit of faculty presence, session latency, and substitution orchestration."
        actions={
          <div className="flex items-center gap-3">
             <Button variant="outline" className="font-normal border-primary/10 hover:bg-primary/5 h-12 px-6 rounded-2xl glass-1">
                <FileText className="w-4 h-4 mr-2 opacity-50" /> Export Audit
             </Button>
             <Button className="font-normal bg-primary shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl">
                Finalize Daily Lock
             </Button>
          </div>
        }
      />

      {/* Atmospheric Calendar Strip */}
      <div className="mt-12 bg-muted/5 border border-primary/5 rounded-[2.5rem] p-6 lg:p-10 glass-1 overflow-hidden relative isolate">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
                <h3 className="font-serif text-2xl font-medium tracking-tight">Temporal Selection</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Active Operational Window</p>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {calendarDays.map((day, i) => {
                    const isToday = isSameDay(day, new Date())
                    const isSelected = isSameDay(day, selectedDate)
                    const weekend = isWeekend(day)
                    
                    return (
                        <button 
                            key={i}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl transition-all border relative isolate overflow-hidden group",
                                isSelected 
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                                    : "bg-background/40 text-muted-foreground border-primary/5 hover:border-primary/20",
                                weekend && !isSelected && "bg-amber-500/[0.03] border-amber-500/10"
                            )}
                        >
                            {weekend && !isSelected && (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(245,158,11,0.05)_100%)] opacity-50" />
                            )}
                            <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">
                                {format(day, 'EEE')}
                            </span>
                            <span className="text-lg font-serif mt-1">{format(day, 'd')}</span>
                            {isToday && !isSelected && (
                                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedDate(subDays(selectedDate, 7))}>
                    <ChevronLeft className="w-4 h-4 opacity-40" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                </Button>
            </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Identify personnel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-premium rounded-2xl"
                    />
                </div>
                
                <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <History className="w-4 h-4 text-indigo-400 opacity-60" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400">Registry Snapshot: {format(selectedDate, 'MMMM d, yyyy')}</span>
                </div>
            </div>

            <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5 bg-primary/[0.01]">
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold opacity-30">Faculty Dossier</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold opacity-30">Status Protocol</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold opacity-30">Session Trace</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-primary/5 last:border-0 cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform">
                                                <AvatarImage src={teacher.avatar} />
                                                <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none mb-1.5">{teacher.name}</span>
                                                <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">{teacher.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1.5 p-1 bg-muted/20 border border-primary/5 rounded-xl w-fit">
                                            {(['Present', 'Absent', 'Late', 'Leave', 'Substitution'] as AttendanceStatus[]).map((status) => {
                                                const current = attendanceData[teacher.id] || 'Present'
                                                const active = current === status
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(teacher.id, status)}
                                                        className={cn(
                                                            "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all relative group/btn",
                                                            active ? "bg-background shadow-md border border-primary/10" : "hover:bg-background/40 opacity-30 hover:opacity-100"
                                                        )}
                                                        title={status}
                                                    >
                                                        {status === 'Present' && <CheckCircle2 className={cn("w-4 h-4", active ? "text-success" : "")} />}
                                                        {status === 'Absent' && <XCircle className={cn("w-4 h-4", active ? "text-destructive" : "")} />}
                                                        {status === 'Late' && <Clock className={cn("w-4 h-4", active ? "text-warning" : "")} />}
                                                        {status === 'Leave' && <Undo2 className={cn("w-4 h-4", active ? "text-indigo-400" : "")} />}
                                                        {status === 'Substitution' && <Sparkles className={cn("w-4 h-4", active ? "text-indigo-500" : "")} />}
                                                        
                                                        {active && (
                                                            <motion.div layoutId={`active-glow-${teacher.id}`} className="absolute inset-0 rounded-lg bg-primary/5 -z-10" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1.5">
                                            {teacherStats[teacher.id].streak.map((day: number, i: number) => (
                                                <div key={i} className={cn(
                                                    "w-1 h-5 rounded-full",
                                                    day === 1 ? "bg-success/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]" : "bg-destructive/30"
                                                )} />
                                            ))}
                                            <div className="ml-4 flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                    <span className="text-[10px] font-bold">{teacherStats[teacher.id].totalSubstitutions}</span>
                                                </div>
                                                <span className="text-[9px] text-muted-foreground opacity-30 uppercase font-bold tracking-tighter shrink-0">SUB LOAD</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        <div className="space-y-8">
            {stats.map((stat, i) => (
                <Card key={i} className="glass-1 border-primary/5 rounded-[2rem] shadow-xl overflow-hidden group">
                    <CardHeader className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="text-[10px] text-muted-foreground opacity-30 uppercase font-bold tracking-[0.2em]">{stat.label}</div>
                        </div>
                        <div className="space-y-1">
                            <h4 className={cn("text-3xl font-serif font-medium", stat.color)}>{stat.value}</h4>
                            <p className="text-[10px] text-muted-foreground opacity-40 font-normal italic tracking-wide">{stat.sub}</p>
                        </div>
                    </CardHeader>
                </Card>
            ))}

            <Card className="glass-1 border-amber-500/10 rounded-[2rem] shadow-xl overflow-hidden p-8 bg-amber-500/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-amber-500 opacity-60" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Operational Alert</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal opacity-60">
                    Saturday and Sunday marks are isolated from standard payroll calculations unless authorized as "Weekend Lab" sessions.
                </p>
                <Button variant="ghost" className="w-full mt-6 rounded-xl border border-amber-500/10 text-[10px] uppercase font-bold tracking-widest text-amber-600/60 hover:text-amber-600 hover:bg-amber-500/5">
                    Identity Exceptions
                </Button>
            </Card>
        </div>
      </div>

      {/* Staff Dossier Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-[400px] md:w-[600px] sm:max-w-xl glass-2 border-l border-white/5 p-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <SheetHeader className="p-10 md:p-14 relative block">
                <div className="flex items-center justify-between mb-8">
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] uppercase tracking-widest font-bold text-primary">
                        Registry Dossier
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTeacher(null)} className="rounded-full opacity-40">
                        <XCircle className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-8 mb-12">
                    <Avatar className="h-24 w-24 border shadow-2xl">
                        <AvatarImage src={selectedTeacher?.avatar} />
                        <AvatarFallback className="text-2xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <SheetTitle className="text-3xl font-serif font-medium tracking-tight mb-2">{selectedTeacher?.name}</SheetTitle>
                        <SheetDescription className="text-xs font-mono text-muted-foreground opacity-60 flex items-center gap-2">
                           <Hash className="w-3 h-3" /> {selectedTeacher?.employeeId}
                        </SheetDescription>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-muted/20 border border-primary/5">
                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mb-2">Presence Rate</p>
                        <p className="text-2xl font-serif text-success">{teacherStats[selectedTeacher?.id || '']?.monthlyRate}%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/20 border border-primary/5">
                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mb-2">Substitution Load</p>
                        <p className="text-2xl font-serif text-indigo-400">{teacherStats[selectedTeacher?.id || '']?.totalSubstitutions}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/20 border border-primary/5">
                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mb-2">Current Streak</p>
                        <div className="flex items-center gap-1 mt-2">
                             {[1,1,1,1,1].map((_, i) => <div key={i} className="w-1 h-4 bg-success rounded-full" />)}
                        </div>
                    </div>
                </div>
            </SheetHeader>

            <div className="px-10 md:px-14 pb-14 space-y-12 overflow-y-auto max-h-[calc(100vh-450px)] custom-scrollbar">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-medium tracking-tight">Recent Historical Trace</h4>
                        <Button variant="ghost" className="text-[9px] uppercase font-bold tracking-widest opacity-40">Full Archive <ArrowUpRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <div className="space-y-4">
                        {[format(subDays(new Date(), 1), 'MMM d, yyyy'), format(subDays(new Date(), 2), 'MMM d, yyyy'), format(subDays(new Date(), 3), 'MMM d, yyyy')].map((date, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/5 border border-primary/5 group hover:bg-muted/10 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{date}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Marked by Admin Gateway</p>
                                </div>
                                <Badge className="bg-success/5 text-success border-success/10 font-bold tracking-widest text-[9px]">PRESENT</Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Faculty Overtime Insight</p>
                        <p className="text-xs text-muted-foreground leading-relaxed font-normal opacity-60">
                            This instructor is currently performing at 15% above the institutional baseline for substitution availability.
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
