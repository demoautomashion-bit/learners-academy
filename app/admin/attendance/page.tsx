'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useEffect } from 'react'
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
  History,
  Download,
  BarChart3,
  TrendingUp
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
    getMonth,
    getYear,
    setMonth,
    setYear,
    subDays,
    eachDayOfInterval,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isWeekend
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
  
  // State for attendance and substitutions
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: AttendanceStatus; substitutions: number }>>({})
  
  // Monthly Data Mocking (Calculated periodically or on demand)
  const monthlyStats = useMemo(() => {
    return teachers.reduce((acc, teacher) => {
        // Randomly generate some believable stats for the prototype
        const idHash = teacher.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        acc[teacher.id] = {
            present: 20 + (idHash % 5),
            absent: idHash % 3,
            late: idHash % 4,
            leave: idHash % 2,
            substitutions: 5 + (idHash % 10)
        }
        return acc
    }, {} as Record<string, { present: number; absent: number; late: number; leave: number; substitutions: number }>)
  }, [teachers])

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

  const exportMonthlyPDF = () => {
    const doc = new jsPDF()
    const monthYear = format(selectedDate, 'MMMM yyyy')
    
    // Header
    doc.setFontSize(22)
    doc.setTextColor(40)
    doc.text("Institutional Attendance Registry", 14, 22)
    
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Academic Period: ${monthYear}`, 14, 30)
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 37)
    
    const tableData = filteredTeachers.map(teacher => {
        const stats = monthlyStats[teacher.id] || { present: 0, absent: 0, late: 0, leave: 0, substitutions: 0 }
        return [
            teacher.employeeId,
            teacher.name,
            stats.present,
            stats.absent,
            stats.late,
            stats.leave,
            stats.substitutions
        ]
    })

    autoTable(doc, {
        startY: 50,
        head: [['ID', 'Personnel Name', 'Present', 'Absent', 'Late', 'Leave', 'Extra Load']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 }
    })

    doc.save(`Attendance_Registry_${monthYear.replace(' ', '_')}.pdf`)
    toast.success("Registry Exported Successfully", {
        description: `Personnel summary for ${monthYear} is ready for filing.`
    })
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
             <Button 
                variant="outline" 
                onClick={exportMonthlyPDF}
                className="font-bold text-[10px] tracking-widest uppercase border-primary/10 hover:bg-primary/5 h-12 px-6 rounded-2xl glass-1"
             >
                <Download className="w-4 h-4 mr-2" /> Export PDF
             </Button>
             <Button className="font-bold text-[10px] tracking-widest uppercase bg-primary shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Finalize Logs
             </Button>
          </div>
        }
      />

      {/* Monthly Intelligence Toggle & Navigation */}
      <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex bg-muted/5 border border-primary/5 p-1 rounded-2xl glass-1 w-fit">
            <button 
                onClick={() => setViewMode('daily')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all",
                    viewMode === 'daily' ? "bg-background shadow-lg text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                )}
            >
                Daily Precision
            </button>
            <button 
                onClick={() => setViewMode('monthly')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all",
                    viewMode === 'monthly' ? "bg-background shadow-lg text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                )}
            >
                Monthly Intelligence
            </button>
        </div>

        <div className="flex items-center gap-4 bg-muted/5 border border-primary/5 p-2 rounded-2xl glass-1">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDate(subDays(selectedDate, 30))}
                className="h-10 w-10 rounded-xl hover:bg-primary/5"
            >
                <ChevronLeft className="w-4 h-4 opacity-40" />
            </Button>
            <div className="px-4 py-1 flex items-center gap-3 border-x border-primary/5 min-w-[180px] justify-center">
                <CalendarIcon className="w-4 h-4 text-primary opacity-40" />
                <span className="text-sm font-medium tracking-tight">
                    {format(selectedDate, 'MMMM yyyy')}
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDate(addDays(selectedDate, 30))}
                className="h-10 w-10 rounded-xl hover:bg-primary/5"
            >
                <ChevronRight className="w-4 h-4 opacity-40" />
            </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'daily' ? (
          <motion.div 
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Weekly Horizon Grid */}
            <div className="mt-8 grid grid-cols-7 gap-3 px-4">
                {horizonDays.map((day, i) => {
                    const isSelected = isSameDay(day, selectedDate)
                    const isToday = isSameDay(day, new Date())
                    const weekend = isWeekend(day)
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
                                isToday && !isSelected && "ring-2 ring-primary/20",
                                weekend && !isSelected && "bg-muted/[0.02]"
                            )}
                        >
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">{format(day, 'EEE')}</span>
                            <span className="text-xl font-serif font-medium leading-none">{format(day, 'd')}</span>
                            {isToday && !isSelected && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Daily Registry Table */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-opacity" />
                        <Input
                            placeholder="Identify Staff member by Name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-14 bg-muted/5 focus:bg-background border-none shadow-2xl rounded-[1.5rem] transition-all"
                        />
                    </div>
                    <div className="px-5 py-2.5 bg-success/5 border border-success/10 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-success/80">Protocol Active: {format(selectedDate, 'MMM d')}</span>
                    </div>
                </div>

                <Card className="glass-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5 bg-primary/[0.01]">
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30">Personnel Identity</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Status Participation</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-right">Extra Session Load</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredTeachers.map((teacher) => {
                                const record = attendanceRecords[teacher.id] || { status: 'Present', substitutions: 0 }
                                return (
                                    <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <Avatar className="h-12 w-12 border border-primary/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                    <AvatarImage src={teacher.avatar} />
                                                    <AvatarFallback className="text-sm bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-medium group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>{teacher.name}</span>
                                                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-[0.2em] font-bold font-mono">{teacher.employeeId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-center gap-2 p-1.5 bg-muted/20 border border-primary/5 rounded-[1.5rem] w-fit mx-auto">
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleSubstitutionChange(teacher.id, -1)} className="w-9 h-9 rounded-xl hover:bg-white/10 text-indigo-400"><Minus className="w-3 h-3" /></Button>
                                                    <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center shadow-inner">
                                                        <span className={cn("text-sm font-bold font-mono", record.substitutions > 0 ? "text-indigo-500" : "text-muted-foreground opacity-30")}>{record.substitutions}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => handleSubstitutionChange(teacher.id, 1)} className="w-9 h-9 rounded-xl hover:bg-white/10 text-indigo-400"><Plus className="w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-12 space-y-12"
          >
            {/* Monthly Insights Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Institutional Rate', value: '96.2%', sub: 'Global Presence', icon: BarChart3, color: 'text-success' },
                    { label: 'Session Velocity', value: '1,420', sub: 'Calculated Markings', icon: TrendingUp, color: 'text-primary' },
                    { label: 'Extra Load Factor', value: '248', sub: 'Total Substitution Hrs', icon: Sparkles, color: 'text-indigo-400' },
                    { label: 'Latency Rate', value: '1.4%', sub: 'Late Protocols', icon: Clock, color: 'text-warning' },
                ].map((stat, i) => (
                    <Card key={i} className="glass-1 p-8 rounded-[2rem] border-primary/5 shadow-premium group overflow-hidden relative isolate">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/[0.03] blur-3xl -z-10 group-hover:scale-125 transition-transform" />
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</span>
                            <stat.icon className={cn("w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                        </div>
                        <p className={cn("text-3xl font-serif font-medium", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-40 mt-3">{stat.sub}</p>
                    </Card>
                ))}
            </div>

            {/* Monthly Summary Table */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl font-medium tracking-tight">Institutional Summary Grid</h3>
                    <div className="flex items-center gap-3">
                         <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 h-10 px-4 rounded-xl border border-primary/5">Personnel Archetypes <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>
                </div>

                <Card className="glass-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5 bg-primary/[0.01]">
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30">Personnel Identity</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Present Day</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Absent</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Late</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-center">Leave</th>
                                <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-right">Extra Session Load</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredTeachers.map((teacher) => {
                                const stats = monthlyStats[teacher.id] || { present: 0, absent: 0, late: 0, leave: 0, substitutions: 0 }
                                return (
                                    <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <Avatar className="h-10 w-10 border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                                                    <AvatarImage src={teacher.avatar} />
                                                    <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium leading-none mb-1 cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>{teacher.name}</span>
                                                    <span className="text-[9px] text-muted-foreground opacity-40 uppercase tracking-widest font-mono">{teacher.employeeId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-serif text-success">{stats.present}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-serif text-destructive/60">{stats.absent}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-serif text-warning">{stats.late}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-serif text-indigo-400">{stats.leave}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className="text-sm font-serif font-bold text-indigo-500">{stats.substitutions} Sessions</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Dossier Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-[400px] md:w-[650px] sm:max-w-2xl glass-2 border-l border-white/5 p-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            <div className="p-10 md:p-14 relative space-y-12 h-full overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
                        Personnel Intelligence Trace
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <Avatar className="h-32 w-32 border border-primary/10 shadow-2xl relative z-10">
                        <AvatarImage src={selectedTeacher?.avatar} />
                        <AvatarFallback className="text-4xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <SheetTitle className="text-4xl font-serif font-medium tracking-tight mb-3">{selectedTeacher?.name}</SheetTitle>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground opacity-50">
                           <div className="flex items-center gap-2 px-3 py-1 bg-muted/20 border border-primary/5 rounded-lg">
                                <Hash className="w-3.5 h-3.5" /> {selectedTeacher?.employeeId}
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-success/5 border border-success/10 rounded-lg text-success/80">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Operational Status
                           </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card className="p-8 rounded-[2.5rem] bg-muted/20 border border-primary/5 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-20 mb-3">Institutional Rate (M)</p>
                        <p className="text-4xl font-serif text-success">{(monthlyStats[selectedTeacher?.id || '']?.present || 0) * 4}%</p>
                    </Card>
                    <Card className="p-8 rounded-[2.5rem] bg-indigo-500/[0.04] border-indigo-500/10 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400 opacity-40 mb-3">Extra Session Load</p>
                        <p className="text-4xl font-serif text-indigo-400">{(monthlyStats[selectedTeacher?.id || '']?.substitutions || 0)} Hrs</p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] uppercase tracking-widest font-black opacity-30">Temporal Audit Matrix</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted/5 border border-primary/5 border-dashed">
                                <div className="space-y-1">
                                    <p className="text-base font-medium">{format(subDays(selectedDate, i), 'PPP')}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40 italic">Registry Entry #AUD-00{i}</p>
                                </div>
                                <Badge className="bg-success/5 text-success border-success/10 py-1.5 px-4 font-bold tracking-widest text-[10px] rounded-lg uppercase">PRESENT</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
