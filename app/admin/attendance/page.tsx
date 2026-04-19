'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
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
  Download,
  BarChart3,
  TrendingUp,
  ListChecks
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
    isWeekend
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Substitution'

const STATUS_CONFIG: Record<AttendanceStatus, { icon: any; color: string; bg: string; label: string; code: string }> = {
    Present: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', label: 'Present', code: 'PRS' },
    Absent: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5', label: 'Absent', code: 'ABS' },
    Late: { icon: Clock, color: 'text-warning', bg: 'bg-warning/5', label: 'Late', code: 'LAT' },
    Leave: { icon: Undo2, color: 'text-indigo-400', bg: 'bg-indigo-400/5', label: 'Leave', code: 'LVE' },
    Substitution: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/5', label: 'Substitute', code: 'SUB' }
}

export default function AttendanceRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, attendance, markAttendance, addAttendanceEvent, logActivity, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
  
  // Derive attendance status from global attendance data for the selected date
  const attendanceRecords = useMemo(() => {
    const records: Record<string, { status: AttendanceStatus; subCount: number }> = {}
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    attendance.forEach(record => {
        const recordDate = format(new Date(record.date), 'yyyy-MM-dd')
        if (recordDate === dateStr) {
            records[record.teacherId] = {
                status: (record.status as AttendanceStatus) || 'Present',
                subCount: record.substituteCount || 0
            }
        }
    })
    return records
  }, [attendance, selectedDate])
  
  // Monthly Data derived from real participation records
  const monthlyStats = useMemo(() => {
    const stats: Record<string, { present: number; absent: number; late: number; leave: number; substitutions: number }> = {}
    
    teachers.forEach(teacher => {
        const teacherRecs = attendance.filter(a => a.teacherId === teacher.id)
        stats[teacher.id] = {
            present: teacherRecs.filter(a => a.status === 'Present').length,
            absent: teacherRecs.filter(a => a.status === 'Absent').length,
            late: teacherRecs.filter(a => a.status === 'Late').length,
            leave: teacherRecs.filter(a => a.status === 'Leave').length,
            substitutions: teacherRecs.reduce((acc, curr) => acc + (curr.substituteCount || 0), 0)
        }
    })
    return stats
  }, [teachers, attendance])

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

  const handleActionClick = async (teacherId: string, status: AttendanceStatus) => {
    const current = attendanceRecords[teacherId] || { status: 'Present', subCount: 0 }
    const dateStr = selectedDate.toISOString()

    try {
        if (status === 'Substitution') {
            await addAttendanceEvent(teacherId, dateStr, { 
                type: 'Substitution', 
                label: 'Extra Load', 
                info: 'Manual Entry' 
            })
            toast("Substitution Logged", { description: "Extra class load recorded." })
        } else {
            await markAttendance(teacherId, dateStr, status)
            toast(`Protocol Updated: ${status}`, { description: "Personnel status synchronized." })
        }
    } catch (err) {
        toast.error("Registry Sync Failed")
    }
  }

  const handleMarkAllPresent = async () => {
    const dateStr = selectedDate.toISOString()
    const teachersToMark = filteredTeachers.filter(t => !attendanceRecords[t.id])
    
    try {
        await Promise.all(teachersToMark.map(t => markAttendance(t.id, dateStr, 'Present')))
        logActivity(`Bulk Attendance Finalized for ${format(selectedDate, 'MMM d')}`, 'Attendance')
        toast.success("Bulk Protocol Applied")
    } catch (err) {
        toast.error("Bulk Registry Sync Failed")
    }
  }

  const exportMonthlyPDF = () => {
    const doc = new jsPDF()
    const monthYear = format(selectedDate, 'MMMM yyyy')
    
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

      {/* Mode Toggle & Temporal Navigator */}
      <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 relative z-10">
        <div className="flex bg-muted/5 border border-primary/5 p-1 rounded-2xl glass-1 w-fit">
            <button 
                onClick={() => setViewMode('daily')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all",
                    viewMode === 'daily' ? "bg-background shadow-lg text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                )}
            >
                Mark Attendance
            </button>
            <button 
                onClick={() => setViewMode('monthly')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all",
                    viewMode === 'monthly' ? "bg-background shadow-lg text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                )}
            >
                Staff Summary
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
            {/* Visual Absolute & Weekly Horizon */}
            <div className="mt-8">
                <div className="px-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Action Registry Protocol Active</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                            Marking Registry for: <br className="md:hidden" /><span className="text-primary">{format(selectedDate, 'EEEE, MMMM do')}</span>
                        </h2>
                    </div>

                    <Button 
                        onClick={handleMarkAllPresent}
                        className="bg-success text-white shadow-lg shadow-success/20 h-14 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 font-medium cursor-pointer"
                    >
                        <ListChecks className="w-5 h-5" />
                        Mark All Present
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-3 px-4">
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
                                    "relative h-16 md:h-20 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center isolate group overflow-hidden cursor-pointer",
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
            </div>

            {/* Daily Registry Table - Unified Hub */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20 group-focus-within:opacity-100 transition-opacity" />
                        <Input
                            placeholder="Identify Staff member..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-14 bg-muted/5 border-primary/5 focus:bg-background shadow-none rounded-[1.5rem] transition-all"
                        />
                    </div>
                </div>

                <Card className="glass-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-primary/5 bg-primary/[0.01]">
                                    <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30">Personnel Focus</th>
                                    <th className="px-10 py-7 text-[10px] uppercase tracking-widest font-black opacity-30 text-right">Unified Action Hub</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredTeachers.map((teacher) => {
                                    const record = attendanceRecords[teacher.id] || { status: 'Present', subCount: 0 }
                                    const stats = monthlyStats[teacher.id] || { present: 0, absent: 0, substitutions: 0 }

                                    return (
                                        <tr key={teacher.id} className="group hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <Avatar className="h-12 w-12 border border-primary/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        <AvatarImage src={teacher.avatar} />
                                                        <AvatarFallback className="text-sm bg-primary/5 text-primary font-bold">{getInitials(teacher.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-1.5">
                                                        <span 
                                                            className="text-base font-medium leading-none cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors"
                                                            onClick={() => setSelectedTeacher(teacher)}
                                                        >
                                                            {teacher.name}
                                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-[0.2em] font-bold font-mono">{teacher.employeeId}</span>
                                                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-muted/30 border border-primary/5">
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-success">{stats.present}P</span>
                                                                <div className="w-px h-2 bg-primary/10" />
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-destructive/80">{stats.absent}A</span>
                                                                <div className="w-px h-2 bg-primary/10" />
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400">{stats.substitutions}S</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="flex items-center p-1.5 bg-muted/10 border border-primary/5 rounded-[1.5rem] w-fit">
                                                        {/* Base Statuses */}
                                                        {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((status) => {
                                                            const active = record.status === status
                                                            const config = STATUS_CONFIG[status]
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleActionClick(teacher.id, status)}
                                                                    className={cn(
                                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative font-medium",
                                                                        active 
                                                                            ? "bg-background shadow-xl border border-primary/10 " + config.color 
                                                                            : "hover:bg-background/40 opacity-40 hover:opacity-100 text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <span className="text-xs uppercase tracking-widest font-bold z-10">{config.code}</span>
                                                                    {active && (
                                                                        <motion.div layoutId={`status-marker-${teacher.id}`} className="absolute inset-0 rounded-xl bg-primary/5 -z-10" />
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                        
                                                        <div className="w-px h-8 bg-primary/10 mx-2" />
                                                        
                                                        {/* Substitution Incrementer */}
                                                        <button
                                                            onClick={() => handleActionClick(teacher.id, 'Substitution')}
                                                            className={cn(
                                                                "h-12 px-5 rounded-xl flex items-center gap-3 transition-all relative font-medium overflow-hidden group/subbed",
                                                                record.subCount > 0
                                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                                    : "hover:bg-primary/5 text-muted-foreground"
                                                            )}
                                                        >
                                                            <span className="text-xs uppercase tracking-widest font-bold z-10">{STATUS_CONFIG['Substitution'].code}</span>
                                                            {record.subCount > 0 && (
                                                                <Badge variant="secondary" className="bg-background text-foreground shrink-0 w-6 h-6 flex items-center justify-center p-0 rounded-full font-mono shadow-sm">
                                                                    {record.subCount}
                                                                </Badge>
                                                            )}
                                                            {record.subCount > 0 && (
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/subbed:animate-shimmer pointer-events-none" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-0">
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
                <div className="flex items-center justify-between px-4 md:px-0">
                    <h3 className="font-serif text-3xl font-medium tracking-tight">Institutional Summary Grid</h3>
                    <div className="flex items-center gap-3">
                         <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/5 border border-primary/5 rounded-xl">
                            <CalendarIcon className="w-4 h-4 opacity-40" />
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{format(selectedDate, 'MMM yyyy')}</span>
                         </div>
                    </div>
                </div>

                <Card className="glass-2 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
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
                                                <span className="text-sm font-serif font-medium text-success">{stats.present}</span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-sm font-serif font-medium text-destructive/60">{stats.absent}</span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-sm font-serif font-medium text-warning">{stats.late}</span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-sm font-serif font-medium text-indigo-400">{stats.leave}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="text-sm font-serif font-bold text-primary">{stats.substitutions} Sessions</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Dossier Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-[400px] md:w-[650px] sm:max-w-2xl glass-2 border-l border-white/5 p-0 overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-full h-[40%] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            
            <div className="p-10 md:p-14 pb-8 shrink-0 relative z-10 z-[60]">
                <div className="flex items-center justify-between mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
                        Personnel Intelligence Trace
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <Avatar className="h-32 w-32 border border-primary/10 shadow-2xl relative">
                        <AvatarImage src={selectedTeacher?.avatar} />
                        <AvatarFallback className="text-4xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <SheetTitle className="text-4xl font-serif font-medium tracking-tight mb-3">{selectedTeacher?.name}</SheetTitle>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground opacity-50">
                           <div className="flex items-center gap-2 px-3 py-1 bg-muted/20 border border-primary/5 rounded-lg">
                                <Hash className="w-3.5 h-3.5" /> {selectedTeacher?.employeeId}
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-success/5 border border-success/10 rounded-lg text-success/80 border-dashed">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Active Protocol
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 md:px-14 pb-14 space-y-10 custom-scrollbar z-[60]">
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
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] uppercase tracking-widest font-black opacity-30">Temporal Audit Matrix</h4>
                        <span className="text-[10px] opacity-40 font-mono">Past 72 Hrs</span>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-muted/5 border border-primary/5 border-dashed hover:bg-muted/10 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-base font-medium">{format(subDays(selectedDate, i), 'PPP')}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40 italic">Registry Entry #AUD-00{i}</p>
                                </div>
                                <Badge className="bg-success/5 text-success border-success/10 py-2 px-5 font-bold tracking-widest text-[10px] rounded-xl uppercase">PRESENT</Badge>
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
