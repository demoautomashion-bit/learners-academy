'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
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
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Undo2,
  Hash,
  HelpCircle,
  Plus,
  Minus,
  Filter,
  History
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Teacher } from '@/lib/types'
import { 
    format, 
    addDays, 
    startOfWeek, 
    isSameDay, 
    subDays,
    eachDayOfInterval,
    endOfWeek
} from 'date-fns'
import { motion } from 'framer-motion'

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'

const STATUS_CONFIG: Record<AttendanceStatus, { icon: any; color: string; bg: string; label: string }> = {
    Present: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', label: 'Present' },
    Absent: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5', label: 'Absent' },
    Late: { icon: Clock, color: 'text-warning', bg: 'bg-warning/5', label: 'Late' },
    Leave: { icon: Undo2, color: 'text-indigo-400', bg: 'bg-indigo-400/5', label: 'Leave' }
}

export default function AttendanceRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  
  // State for attendance and substitutions
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: AttendanceStatus; substitutions: number }>>({})

  // Weekly Horizon logic
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const horizonDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const activeTeachers = teachers.filter(t => t.status === 'active')
  const filteredTeachers = activeTeachers.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const updateRecord = (teacherId: string, updates: Partial<{ status: AttendanceStatus; substitutions: number }>) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...(prev[teacherId] || { status: 'Present', substitutions: 0 }),
        ...updates
      }
    }))
  }

  const handleSubstitutionChange = (teacherId: string, delta: number) => {
    const current = attendanceRecords[teacherId]?.substitutions || 0
    const next = Math.max(0, current + delta)
    updateRecord(teacherId, { substitutions: next })
    
    if (delta > 0) {
        toast.active("Extra Session Logged", {
            description: `Session count updated to ${next} for ${format(selectedDate, 'MMM d')}`,
            icon: <Sparkles className="w-4 h-4 text-indigo-400" />
        })
    }
  }

  return (
    <PageShell className="relative pb-32 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 -z-10 bg-background/50 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-full h-[50%] bg-primary/[0.02] blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-full h-[50%] bg-indigo-500/[0.01] blur-[150px] animate-pulse delay-1000" />
      </div>

      <PageHeader 
        title="Attendance Hub"
        description="Monitor staff presence and session load with high-precision registry tools."
        actions={
          <div className="flex items-center gap-3">
             <Button variant="outline" className="font-bold text-[10px] tracking-widest uppercase border-primary/10 hover:bg-primary/5 h-12 px-6 rounded-2xl glass-1 opacity-60 hover:opacity-100 transition-all">
                <FileText className="w-4 h-4 mr-2" /> Export Report
             </Button>
             <Button className="font-bold text-[10px] tracking-widest uppercase bg-primary shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Finalize Logs
             </Button>
          </div>
        }
      />

      {/* Weekly Horizon Calendar - High Density */}
      <div className="mt-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4 bg-muted/5 border border-primary/5 p-2 rounded-2xl glass-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedDate(subDays(selectedDate, 7))}
                    className="h-10 w-10 rounded-xl hover:bg-primary/5"
                >
                    <ChevronLeft className="w-4 h-4 opacity-40" />
                </Button>
                <div className="px-4 py-1 flex items-center gap-3 border-x border-primary/5">
                    <CalendarIcon className="w-4 h-4 text-primary opacity-40" />
                    <span className="text-sm font-medium tracking-tight">
                        {format(weekStart, 'MMM d')} — {format(weekEnd, 'MMM d, yyyy')}
                    </span>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    className="h-10 w-10 rounded-xl hover:bg-primary/5"
                >
                    <ChevronRight className="w-4 h-4 opacity-40" />
                </Button>
            </div>

            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black opacity-30">
                <HelpCircle className="w-3.5 h-3.5" />
                Mark Daily Participation
            </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
            {horizonDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                return (
                    <motion.button
                        key={i}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                            "relative h-16 md:h-20 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center isolate group overflow-hidden",
                            isSelected 
                                ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 z-10" 
                                : "bg-muted/5 text-muted-foreground border-primary/5 hover:border-primary/20",
                            isToday && !isSelected && "ring-2 ring-primary/20"
                        )}
                    >
                        {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">{format(day, 'EEE')}</span>
                        <span className="text-xl font-serif font-medium leading-none">{format(day, 'd')}</span>
                        
                        {isToday && !isSelected && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                    </motion.button>
                )
            })}
        </div>
      </div>

      <div className="mt-16 space-y-8">
        {/* Search & Bulk Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="relative w-full md:w-[450px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Identify Staff member by Name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 h-14 bg-muted/5 focus:bg-background border-none shadow-2xl rounded-[1.5rem] transition-all placeholder:opacity-30"
                />
            </div>
            
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="h-12 px-6 rounded-2xl font-bold text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
                <div className="h-6 w-px bg-primary/10" />
                <div className="px-5 py-2.5 bg-success/5 border border-success/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-success/80">Active Session</span>
                </div>
            </div>
        </div>

        {/* High Density Table */}
        <Card className="glass-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative isolate">
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary/[0.01] blur-3xl -z-10" />
            
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-primary/5 bg-primary/[0.01]">
                            <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30">Personnel Identity</th>
                            <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Base Attendance Protocol</th>
                            <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-right">Extra Load (Substitutions)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {filteredTeachers.map((teacher) => {
                            const record = attendanceRecords[teacher.id] || { status: 'Present', substitutions: 0 }
                            
                            return (
                                <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors overflow-visible">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border border-primary/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                    <AvatarImage src={teacher.avatar} />
                                                    <AvatarFallback className="text-sm bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background border-2 border-background rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-success rounded-full" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium leading-none mb-1.5 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>{teacher.name}</span>
                                                <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-[0.2em] font-bold font-mono">{teacher.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-10 py-6">
                                        <div className="flex items-center justify-center gap-2 p-1.5 bg-muted/20 border border-primary/5 rounded-[1.5rem] w-fit mx-auto relative overflow-visible">
                                            {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((status) => {
                                                const active = record.status === status
                                                const config = STATUS_CONFIG[status]
                                                const Icon = config.icon
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateRecord(teacher.id, { status })}
                                                        className={cn(
                                                            "w-11 h-11 rounded-xl flex items-center justify-center transition-all relative group/btn",
                                                            active 
                                                                ? "bg-background shadow-xl border border-primary/10 " + config.color 
                                                                : "hover:bg-background/40 opacity-30 hover:opacity-100"
                                                        )}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background rounded-lg text-[8px] uppercase font-bold tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                            {status}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>

                                    <td className="px-10 py-6">
                                        <div className="flex items-center justify-end gap-4">
                                            <div className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/10 p-1.5 rounded-2xl">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleSubstitutionChange(teacher.id, -1)}
                                                    className="w-9 h-9 rounded-xl hover:bg-white/10 text-indigo-400"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center shadow-inner">
                                                    <span className={cn(
                                                        "text-sm font-bold font-mono",
                                                        record.substitutions > 0 ? "text-indigo-500" : "text-muted-foreground opacity-30"
                                                    )}>
                                                        {record.substitutions}
                                                    </span>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleSubstitutionChange(teacher.id, 1)}
                                                    className="w-9 h-9 rounded-xl hover:bg-white/10 text-indigo-400"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="hidden lg:flex flex-col text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Extra Sessions</span>
                                                <span className="text-[9px] text-indigo-400/60 font-medium">Logged Load</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend / Info Footer */}
            <div className="px-10 py-8 border-t border-primary/5 bg-primary/[0.01] flex items-center justify-center gap-10">
                {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                    const config = STATUS_CONFIG[status]
                    return (
                        <div key={status} className="flex items-center gap-2.5">
                            <div className={cn("w-3 h-3 rounded-full shadow-sm", config.bg, "border border-primary/5")} />
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">{config.label} Protocol</span>
                        </div>
                    )
                })}
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500/20 shadow-sm" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400/60">Substitution Weight</span>
                </div>
            </div>
        </Card>
      </div>

      {/* Detail Inspector Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-[400px] md:w-[600px] glass-2 border-l border-white/5 p-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            <div className="p-10 space-y-12">
                <div className="flex items-center justify-between">
                    <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-widest font-black text-primary">
                        Personnel Record Audit
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <Avatar className="h-24 w-24 border-2 border-primary/10 shadow-2xl">
                        <AvatarImage src={selectedTeacher?.avatar} />
                        <AvatarFallback className="text-3xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <SheetTitle className="text-4xl font-serif font-medium tracking-tight mb-2">{selectedTeacher?.name}</SheetTitle>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="rounded-lg font-mono text-xs opacity-40">{selectedTeacher?.employeeId}</Badge>
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Active Faculty</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/5 border-primary/5 p-6 rounded-[2rem] shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-20 mb-3">Institutional Rate</p>
                        <p className="text-3xl font-serif text-success">98.4%</p>
                    </Card>
                    <Card className="bg-indigo-500/[0.03] border-indigo-500/5 p-6 rounded-[2rem] shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400/30 mb-3">Historical Load</p>
                        <p className="text-3xl font-serif text-indigo-400">14 Sessions</p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] uppercase tracking-widest font-black opacity-30">Action Protocols</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-14 rounded-2xl border-primary/5 hover:bg-primary/5 justify-start px-6 gap-3 group">
                            <FileText className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium">Verify Identity</span>
                        </Button>
                        <Button variant="outline" className="h-14 rounded-2xl border-primary/5 hover:bg-primary/5 justify-start px-6 gap-3 group">
                            <History className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium">Trace Logs</span>
                        </Button>
                    </div>
                </div>
            </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
