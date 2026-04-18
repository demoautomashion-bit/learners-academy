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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Hash,
  HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Teacher, TeacherAttendance } from '@/lib/types'
import { 
    format, 
    addDays, 
    startOfWeek, 
    isSameDay, 
    isWeekend, 
    subDays, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    setMonth, 
    setYear,
    getYear,
    getMonth
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Substitution'

const STATUS_CONFIG: Record<AttendanceStatus, { icon: any; color: string; bg: string; label: string; description: string }> = {
    Present: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', label: 'Present', description: 'Institutional Presence Confirmed' },
    Absent: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5', label: 'Absent', description: 'Personnel Absence Logged' },
    Late: { icon: Clock, color: 'text-warning', bg: 'bg-warning/5', label: 'Late', description: 'Session Latency Detected' },
    Leave: { icon: Undo2, color: 'text-indigo-400', bg: 'bg-indigo-400/5', label: 'Leave', description: 'Authorized Institutional Absence' },
    Substitution: { icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Substitution', description: 'External Load Allocation' }
}

export default function AttendanceRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({})

  // Years for the dropdown
  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i)
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ]

  // Mock historical data
  const teacherStats = useMemo(() => {
    return teachers.reduce((acc, t) => {
      acc[t.id] = {
        streak: [1, 1, 1, 0, 1, 1, 1],
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
    toast(`Record Entry: ${status.toUpperCase()}`, {
        description: `Operational log finalized for ${format(selectedDate, 'MMM d')}`,
        icon: <HelpCircle className="w-4 h-4 text-primary" />,
    })
  }

  // Calendar Grid Logic (Week per Row)
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfMonth(monthEnd) })
  
  // Group days into weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const handleMonthChange = (monthIdx: string) => {
    setSelectedDate(setMonth(selectedDate, parseInt(monthIdx)))
  }

  const handleYearChange = (year: string) => {
    setSelectedDate(setYear(selectedDate, parseInt(year)))
  }

  return (
    <PageShell className="relative pb-32">
      <PageHeader 
        title="Attendance"
        description="Mark and track staff attendance and work hours."
        actions={
          <div className="flex items-center gap-3">
             <Button variant="outline" className="font-normal border-primary/10 hover:bg-primary/5 h-12 px-6 rounded-2xl glass-1">
                <FileText className="w-4 h-4 mr-2 opacity-50" /> Personnel Audit
             </Button>
             <Button className="font-normal bg-primary shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl">
                Save Changes
             </Button>
          </div>
        }
      />

      {/* Advanced Week-Row Calendar Section */}
      <div className="mt-12 group/calendar">
        <div className="bg-muted/5 border border-primary/5 rounded-[2.5rem] p-8 lg:p-12 glass-1 relative isolate overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/[0.03] blur-[120px] -z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-medium tracking-tight">Attendance Log</h3>
                    <p className="text-xs text-muted-foreground opacity-40 italic">Daily staff logs and attendance history.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={getMonth(selectedDate).toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[160px] h-12 bg-background/50 border-primary/10 rounded-xl glass-2 focus:ring-primary/20">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="glass-2 border-white/5">
                            {months.map((m, i) => (
                                <SelectItem key={i} value={i.toString()} className="text-xs">{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={getYear(selectedDate).toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[120px] h-12 bg-background/50 border-primary/10 rounded-xl glass-2 focus:ring-primary/20">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="glass-2 border-white/5">
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-4 px-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                        <div key={d} className="text-center text-[10px] uppercase tracking-widest font-bold opacity-30">{d}</div>
                    ))}
                </div>

                {/* Week Rows */}
                <div className="space-y-4">
                    {weeks.map((week, wIdx) => (
                        <motion.div 
                            key={wIdx} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: wIdx * 0.05 }}
                            className="grid grid-cols-7 gap-4"
                        >
                            {week.map((day, dIdx) => {
                                const isCurrentMonth = getMonth(day) === getMonth(selectedDate)
                                const isSelected = isSameDay(day, selectedDate)
                                const isToday = isSameDay(day, new Date())
                                const weekend = isWeekend(day)
                                
                                return (
                                    <button 
                                        key={dIdx}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "relative h-20 rounded-[1.25rem] border transition-all flex flex-col items-center justify-center isolate group",
                                            isSelected 
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 z-10 scale-[1.02]" 
                                                : "bg-background/40 text-muted-foreground border-primary/5 hover:border-primary/20",
                                            !isCurrentMonth && "opacity-[0.15] scale-95 pointer-events-none",
                                            weekend && !isSelected && "bg-amber-500/[0.02] border-amber-500/10"
                                        )}
                                    >
                                        {weekend && !isSelected && isCurrentMonth && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent -z-10" />
                                        )}
                                        <span className="text-lg font-serif">{format(day, 'd')}</span>
                                        {isToday && !isSelected && (
                                            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                        {isSelected && (
                                            <motion.div layoutId="cal-glow" className="absolute inset-0 bg-white/10 blur-xl rounded-full -z-10" />
                                        )}
                                    </button>
                                )
                            })}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Search Personnel Identity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-premium rounded-[1.25rem] placeholder:opacity-30"
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="h-10 w-px bg-primary/5 hidden md:block" />
                    <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
                        <CalendarIcon className="w-4 h-4 text-primary opacity-60" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80">Audit Frame: {format(selectedDate, 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </div>

            <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5 bg-primary/[0.01]">
                                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-bold opacity-30">Teacher Identity</th>
                                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-bold opacity-30">Status Protocols</th>
                                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-bold opacity-30">Recent Velocity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-primary/5 last:border-0 cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <Avatar className="h-12 w-12 border shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                <AvatarImage src={teacher.avatar} />
                                                <AvatarFallback className="text-sm bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium leading-none mb-2">{teacher.name}</span>
                                                <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-[0.2em] font-bold">{teacher.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 p-1.5 bg-muted/20 border border-primary/5 rounded-2xl w-fit">
                                            {(['Present', 'Absent', 'Late', 'Leave', 'Substitution'] as AttendanceStatus[]).map((status) => {
                                                const current = attendanceData[teacher.id] || 'Present'
                                                const active = current === status
                                                const config = STATUS_CONFIG[status]
                                                const Icon = config.icon
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(teacher.id, status)}
                                                        className={cn(
                                                            "w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all relative group/btn",
                                                            active 
                                                                ? "bg-background shadow-xl border border-primary/10 " + config.color 
                                                                : "hover:bg-background/40 opacity-30 hover:opacity-100",
                                                            status === 'Substitution' && active && "animate-shimmer bg-gradient-to-r from-background via-indigo-50/10 to-background border-indigo-500/20"
                                                        )}
                                                        title={config.label}
                                                    >
                                                        <Icon className={cn("w-4 h-4 md:w-5 md:h-5", active ? "" : "text-muted-foreground")} />
                                                        
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background rounded-lg text-[9px] uppercase font-bold tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                            Mark {status}
                                                        </div>

                                                        {active && (
                                                            <motion.div layoutId={`active-marker-${teacher.id}`} className="absolute inset-0 rounded-xl bg-primary/5 -z-10" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            {teacherStats[teacher.id].streak.map((day: number, i: number) => (
                                                <div key={i} className={cn(
                                                    "w-1.5 h-6 rounded-full",
                                                    day === 1 ? "bg-success/30" : "bg-destructive/30"
                                                )} />
                                            ))}
                                            <div className="ml-6 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                                                    <span className="text-xs font-bold font-mono">{teacherStats[teacher.id].totalSubstitutions}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground opacity-30 uppercase font-bold tracking-widest">Extra Load</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Status Codex - Bottom Legend */}
                <div className="p-8 border-t border-primary/5 bg-primary/[0.01] flex flex-wrap items-center justify-center gap-10">
                    {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                        const config = STATUS_CONFIG[status]
                        const Icon = config.icon
                        return (
                            <div key={status} className="flex items-center gap-3 group/codex">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border border-primary/5 shadow-sm group-hover/codex:scale-110 transition-transform", config.bg)}>
                                    <Icon className={cn("w-4 h-4", config.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-[10px] uppercase tracking-widest font-bold", config.color)}>{config.label}</span>
                                    <span className="text-[8px] text-muted-foreground opacity-40 uppercase tracking-tighter">Protocol {status.substring(0,2)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>

        {/* Global Registry Rules & Guidance */}
        <div className="w-full lg:w-80 space-y-8 h-fit lg:sticky lg:top-8">
            <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 shadow-xl overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-8">
                    <Info className="w-5 h-5 text-primary opacity-60" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Operational Guide</span>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground opacity-80">Weekend Policy</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-normal opacity-60 italic">
                            Marks recorded on Sat/Sun are isolated from base operational hours and tracked as laboratory sessions.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground opacity-80">Substitution Weight</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-normal opacity-60">
                            Extra sessions increment the "Institutional Overtime" count for the selected personnel.
                        </p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full mt-10 rounded-xl border border-primary/10 text-[9px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 hover:bg-primary/5 transition-all">
                    View Registry Policies
                </Button>
            </Card>
        </div>
      </div>

      {/* Staff Dossier Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-[400px] md:w-[650px] sm:max-w-2xl glass-2 border-l border-white/5 p-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            
            <SheetHeader className="p-10 md:p-14 relative block">
                <div className="flex items-center justify-between mb-10">
                    <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
                        Registry Dossier Inspection
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTeacher(null)} className="rounded-full opacity-40 hover:bg-destructive/5 hover:text-destructive hover:opacity-100 transition-all">
                        <XCircle className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-10 mb-14">
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border border-primary/10 shadow-2xl relative z-10">
                            <AvatarImage src={selectedTeacher?.avatar} />
                            <AvatarFallback className="text-4xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -inset-2 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <SheetTitle className="text-4xl font-serif font-medium tracking-tight mb-3">{selectedTeacher?.name}</SheetTitle>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground opacity-50">
                           <div className="flex items-center gap-2 px-3 py-1 bg-muted/20 border border-primary/5 rounded-lg">
                                <Hash className="w-3.5 h-3.5" /> {selectedTeacher?.employeeId}
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-success/5 border border-success/10 rounded-lg text-success/80">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                           </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-[1.5rem] bg-muted/20 border border-primary/5 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-3">Institutional Rate</p>
                        <p className="text-3xl font-serif text-success">{teacherStats[selectedTeacher?.id || '']?.monthlyRate}%</p>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 opacity-40 mb-3">Substitution Load</p>
                        <p className="text-3xl font-serif text-indigo-400">{teacherStats[selectedTeacher?.id || '']?.totalSubstitutions}</p>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-muted/20 border border-primary/5 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-3">Identity Streak</p>
                        <div className="flex items-center gap-1.5 mt-3">
                             {[1,1,1,1,1,1].map((_, i) => <div key={i} className="w-1.5 h-6 bg-success/60 rounded-full" />)}
                        </div>
                    </div>
                </div>
            </SheetHeader>

            <div className="px-10 md:px-14 pb-14 space-y-12 overflow-y-auto max-h-[calc(100vh-480px)] custom-scrollbar">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xl font-medium tracking-tight">Timeline Authentication Trace</h4>
                        <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 h-10 px-4 rounded-xl border border-primary/5">Personnel Archive <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>
                    <div className="space-y-4">
                        {[format(subDays(new Date(), 1), 'MMMM d, yyyy'), format(subDays(new Date(), 2), 'MMMM d, yyyy'), format(subDays(new Date(), 3), 'MMMM d, yyyy')].map((date, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted/5 border border-primary/5 group hover:bg-muted/10 transition-all border-dashed">
                                <div className="space-y-1">
                                    <p className="text-base font-medium">{date}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-40 italic">Operational Registry Entry #TRX-9{i}2</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-px bg-primary/5" />
                                    <Badge className="bg-success/5 text-success border-success/10 py-1.5 px-4 font-bold tracking-widest text-[10px] rounded-lg">PRESENT</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-6 relative isolate overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Institutional Merit Insight</p>
                        <p className="text-xs text-muted-foreground leading-relaxed font-normal opacity-70">
                            Personnel shows exceptional availability for substitution sessions. Currently trending in the 98th percentile for institutional flexibility.
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
