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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  ListChecks,
  MoreVertical,
  CalendarDays,
  FileDown,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
    isWeekend,
    startOfMonth,
    endOfMonth
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getTermFromDate, getTermList, getDatesForTerm } from '@/lib/utils/term-utils'

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
  const { teachers, attendance, courses, markAttendance, addAttendanceEvent, logActivity, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
  const [selectedTerm, setSelectedTerm] = useState(getTermFromDate(new Date()).id)
  const [openSubTeacherId, setOpenSubTeacherId] = useState<string | null>(null)
  
  const terms = useMemo(() => getTermList(), [])
  
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
  
  // Monthly/Term Data derived from real participation records
  const monthlyStats = useMemo(() => {
    const stats: Record<string, { present: number; absent: number; late: number; leave: number; substitutions: number }> = {}
    const { start, end } = getDatesForTerm(selectedTerm)
    
    teachers.forEach(teacher => {
        const teacherRecs = attendance.filter(a => {
            const date = new Date(a.date)
            return a.teacherId === teacher.id && date >= start && date <= end
        })
        stats[teacher.id] = {
            present: teacherRecs.filter(a => a.status === 'Present').length,
            absent: teacherRecs.filter(a => a.status === 'Absent').length,
            late: teacherRecs.filter(a => a.status === 'Late').length,
            leave: teacherRecs.filter(a => a.status === 'Leave').length,
            substitutions: teacherRecs.reduce((acc, curr) => acc + (curr.substituteCount || 0), 0)
        }
    })
    return stats
  }, [teachers, attendance, selectedTerm])

  // Global Insights based on selected term
  const globalInsights = useMemo(() => {
    const activeTeachersCount = teachers.filter(t => t.status === 'active').length || 1
    const totalPresent = Object.values(monthlyStats).reduce((acc, curr) => acc + curr.present, 0)
    const totalAbsent = Object.values(monthlyStats).reduce((acc, curr) => acc + curr.absent, 0)
    const totalLate = Object.values(monthlyStats).reduce((acc, curr) => acc + curr.late, 0)
    const totalSubs = Object.values(monthlyStats).reduce((acc, curr) => acc + curr.substitutions, 0)
    
    const totalPossible = totalPresent + totalAbsent + totalLate
    const institutionalRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0
    const latencyRate = totalPossible > 0 ? (totalLate / totalPossible) * 100 : 0
    
    return {
        institutionalRate: institutionalRate.toFixed(1) + '%',
        sessionVelocity: (totalPresent + totalAbsent + totalLate).toLocaleString(),
        extraLoadFactor: totalSubs.toLocaleString(),
        latencyRate: latencyRate.toFixed(1) + '%'
    }
  }, [monthlyStats, teachers])

  // Calendar logic - showing the full month
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const horizonDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

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

  const handleGranularSubstitution = async (teacherId: string, courseTitle: string) => {
    const dateStr = selectedDate.toISOString()
    try {
      await addAttendanceEvent(teacherId, dateStr, {
        type: 'Substitution',
        label: courseTitle,
        info: 'Granular Entry'
      })
      toast("Substitution Logged", { description: `${courseTitle} load recorded.` })
      setOpenSubTeacherId(null)
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

  const exportAttendancePDF = (mode: 'weekly' | 'monthly' | 'trimester') => {
    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        
        // 1. Institutional Branding (Premium Design)
        doc.setFillColor(31, 41, 55)
        doc.rect(0, 0, pageWidth, 40, 'F')
        
        doc.setFillColor(255, 255, 255)
        doc.circle(23, 20, 11, 'F')
        
        try {
            doc.addImage('/images/logo.png', 'PNG', 15, 12, 16, 16)
        } catch (e) {}

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text("THE LEARNERS ACADEMY", 42, 18)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text("Institutional Personnel Registry & Attendance Audit", 42, 24)
        doc.text("Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.", 42, 28)
        doc.text("Contact: +92-3003583286 / +92-3115455533", 42, 31)

        // 2. Determine Date Range & Header
        let startDate: Date, endDate: Date, label: string
        if (mode === 'weekly') {
            startDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
            endDate = endOfWeek(selectedDate, { weekStartsOn: 1 })
            label = `WEEKLY AUDIT: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
        } else if (mode === 'trimester') {
            const term = getDatesForTerm(selectedTerm)
            startDate = term.start
            endDate = term.end
            label = `TRIMESTER AUDIT: ${selectedTerm.toUpperCase().replace('-', ' ')}`
        } else {
            startDate = startOfMonth(selectedDate)
            endDate = endOfMonth(selectedDate)
            label = `MONTHLY AUDIT: ${format(selectedDate, 'MMMM yyyy').toUpperCase()}`
        }

        doc.setTextColor(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(label, 15, 55)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 61)

        // 3. Data Aggregation
        const tableData = filteredTeachers.map(teacher => {
            const recs = attendance.filter(a => {
                const date = new Date(a.date)
                return a.teacherId === teacher.id && date >= startDate && date <= endDate
            })
            
            return [
                teacher.employeeId,
                teacher.name,
                recs.filter(a => a.status === 'Present').length,
                recs.filter(a => a.status === 'Absent').length,
                recs.filter(a => a.status === 'Leave').length,
                recs.filter(a => a.status === 'Late').length,
                recs.reduce((acc, curr) => acc + (curr.substituteCount || 0), 0)
            ]
        })

        // 4. Render Table
        autoTable(doc, {
            startY: 70,
            head: [['ID', 'Personnel Name', 'Present', 'Absent', 'Leave', 'Late', 'Substitution']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8.5 },
            styles: { fontSize: 8, cellPadding: 5, valign: 'middle' },
            columnStyles: { 
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center' }
            },
            margin: { left: 15, right: 15 }
        })

        // 5. Footer
        const finalY = (doc as any).lastAutoTable?.finalY || 150
        const footerY = Math.max(finalY + 30, 260)

        doc.setDrawColor(200)
        doc.line(15, footerY, 70, footerY)
        doc.line(pageWidth - 70, footerY, pageWidth - 15, footerY)
        
        doc.setTextColor(150)
        doc.setFontSize(8)
        doc.text("HR Department", 15, footerY + 6)
        doc.text("Administrative Seal", pageWidth - 15, footerY + 6, { align: 'right' })
        
        doc.setFontSize(6.5)
        doc.text("© THE LEARNERS ACADEMY - Institutional Resource Management", 15, footerY + 18)
        doc.text(`TR-${mode.toUpperCase()}-${new Date().getTime().toString().slice(-6)}`, pageWidth - 15, footerY + 18, { align: 'right' })

        doc.save(`Attendance_${mode}_${format(selectedDate, 'yyyy_MM')}.pdf`)
        toast.success("Audit Exported Successfully")
    } catch (err) {
        toast.error("Export Protocol Interrupted")
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
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        className="font-bold text-[10px] tracking-widest uppercase border-primary/10 hover:bg-primary/5 h-12 px-6 rounded-2xl glass-1"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-3 border-primary/10 rounded-xl min-w-[200px]">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black opacity-40">Report Scope</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem onClick={() => exportAttendancePDF('weekly')} className="flex items-center gap-3 py-3 cursor-pointer">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Weekly Audit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAttendancePDF('monthly')} className="flex items-center gap-3 py-3 cursor-pointer">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Monthly Audit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAttendancePDF('trimester')} className="flex items-center gap-3 py-3 cursor-pointer">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Trimester Audit</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
             <Button className="font-bold text-[10px] tracking-widest uppercase bg-primary shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Finalize Logs
             </Button>
          </div>
        }
      />

      {/* Mode Toggle & Temporal Navigator */}
      <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 relative z-10">
        <Select value={viewMode} onValueChange={(val: any) => setViewMode(val)}>
            <SelectTrigger className="w-[220px] h-12 rounded-2xl bg-muted/5 border-primary/5 glass-1 font-black text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Select View Mode" />
                </div>
            </SelectTrigger>
            <SelectContent className="glass-3 border-primary/10 rounded-2xl">
                <SelectItem value="daily" className="text-[10px] uppercase font-bold tracking-widest">Mark Attendance</SelectItem>
                <SelectItem value="monthly" className="text-[10px] uppercase font-bold tracking-widest">Staff Summary</SelectItem>
            </SelectContent>
        </Select>

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
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Action Registry Protocol Active</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                                Marking Registry for: <br className="md:hidden" /><span className="text-primary">{format(selectedDate, 'EEEE, MMMM do')}</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Filter by Term:</span>
                                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                                    <SelectTrigger className="w-[180px] h-10 rounded-xl bg-muted/5 border-primary/10 glass-1 text-xs font-bold uppercase tracking-widest">
                                        <SelectValue placeholder="Select Term" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-3 border-primary/10 rounded-xl">
                                        {terms.map(term => (
                                            <SelectItem key={term.id} value={term.id} className="text-xs font-bold uppercase tracking-widest">
                                                {term.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleMarkAllPresent}
                        className="bg-success text-white shadow-lg shadow-success/20 h-14 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 font-medium cursor-pointer"
                    >
                        <ListChecks className="w-5 h-5" />
                        Mark All Present
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 px-4">
                    {horizonDays.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate)
                        const isToday = isSameDay(day, new Date())
                        const weekend = isWeekend(day)
                        const isCurrentMonth = getMonth(day) === getMonth(selectedDate)
                        
                        return (
                            <motion.button
                                key={i}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "relative h-12 md:h-14 rounded-xl border transition-all flex flex-col items-center justify-center isolate group overflow-hidden cursor-pointer",
                                    isSelected 
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 z-10" 
                                        : "bg-muted/5 text-muted-foreground border-primary/5 hover:border-primary/20",
                                    isToday && !isSelected && "ring-1 ring-primary/40",
                                    weekend && !isSelected && "bg-muted/[0.02] opacity-60",
                                    !isCurrentMonth && !isSelected && "opacity-20"
                                )}
                            >
                                <span className="text-[8px] uppercase font-bold tracking-widest opacity-40 mb-0.5">{format(day, 'EEE')}</span>
                                <span className="text-base font-serif font-medium leading-none">{format(day, 'd')}</span>
                                {isToday && !isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-primary rounded-full" />
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
                                    const stats = monthlyStats[teacher.id] || { present: 0, absent: 0, late: 0, leave: 0, substitutions: 0 }

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
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-warning">{stats.late}L</span>
                                                                <div className="w-px h-2 bg-primary/10" />
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400">{stats.leave}V</span>
                                                                <div className="w-px h-2 bg-primary/10" />
                                                                <span className="text-[9px] uppercase font-bold tracking-widest text-primary">{stats.substitutions}S</span>
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
                                                        
                                                        {/* Substitution Incrementer - Granular Dropdown */}
                                                        <Popover open={openSubTeacherId === teacher.id} onOpenChange={(open) => setOpenSubTeacherId(open ? teacher.id : null)}>
                                                            <PopoverTrigger asChild>
                                                                <button
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
                                                            </PopoverTrigger>
                                                            <PopoverContent className="glass-3 border-primary/10 rounded-2xl w-64 p-4 space-y-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Assign Substitution</span>
                                                                    <span className="text-[9px] text-muted-foreground opacity-60">Record extra class load for this personnel.</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {courses.filter(c => c.teacherId === teacher.id).map(course => (
                                                                        <button
                                                                            key={course.id}
                                                                            onClick={() => handleGranularSubstitution(teacher.id, course.title || course.name)}
                                                                            className="flex items-center justify-between p-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/5 transition-all group/item"
                                                                        >
                                                                            <div className="flex flex-col items-start">
                                                                                <span className="text-[10px] font-bold text-left">{course.title || course.name}</span>
                                                                                <span className="text-[8px] opacity-40 font-mono">{course.timing}</span>
                                                                            </div>
                                                                            <Plus className="w-3 h-3 text-primary opacity-40 group-hover/item:opacity-100" />
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => handleActionClick(teacher.id, 'Substitution')}
                                                                        className="flex items-center justify-center gap-2 p-2 rounded-xl bg-muted/20 hover:bg-muted/30 border border-dashed border-primary/10 transition-all"
                                                                    >
                                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Manual Entry</span>
                                                                    </button>
                                                                </div>
                                                            </PopoverContent>
                                                         </Popover>
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
                    { label: 'Institutional Rate', value: globalInsights.institutionalRate, sub: 'Term Presence', icon: BarChart3, color: 'text-success', glow: 'shadow-success/20' },
                    { label: 'Session Velocity', value: globalInsights.sessionVelocity, sub: 'Term Markings', icon: TrendingUp, color: 'text-primary', glow: 'shadow-primary/20' },
                    { label: 'Extra Load Factor', value: globalInsights.extraLoadFactor, sub: 'Total Substitution Hrs', icon: Sparkles, color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
                    { label: 'Latency Rate', value: globalInsights.latencyRate, sub: 'Late Protocols', icon: Clock, color: 'text-warning', glow: 'shadow-warning/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, translateY: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Card className={cn(
                            "glass-1 p-8 rounded-[2rem] border-primary/5 group overflow-hidden relative isolate transition-all duration-500 hover:shadow-2xl",
                            stat.glow
                        )}>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/[0.03] blur-3xl -z-10 group-hover:scale-125 transition-transform" />
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</span>
                                <stat.icon className={cn("w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                            </div>
                            <p className={cn("text-3xl font-serif font-medium", stat.color)}>{stat.value}</p>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-40 mt-3">{stat.sub}</p>
                            
                            {/* Premium Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Monthly Summary Table */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4 md:px-0">
                    <h3 className="font-serif text-3xl font-medium tracking-tight">Institutional Summary Grid</h3>
                    <div className="flex items-center gap-3">
                        <Select 
                            value={format(selectedDate, 'yyyy-MM')} 
                            onValueChange={(val) => {
                                const [y, m] = val.split('-')
                                setSelectedDate(new Date(parseInt(y), parseInt(m) - 1, 1))
                            }}
                        >
                            <SelectTrigger className="w-[160px] h-10 rounded-xl bg-muted/5 border-primary/10 glass-1 text-[10px] font-bold uppercase tracking-widest">
                                <CalendarIcon className="w-3.5 h-3.5 mr-2 opacity-40" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-3 border-primary/10 rounded-xl max-h-[300px]">
                                {Array.from({ length: 60 }).map((_, i) => {
                                    // Generate months for next 5 years starting from a year ago
                                    const d = new Date(new Date().getFullYear() - 1, new Date().getMonth() + i, 1)
                                    if (d.getFullYear() === 2025) return null
                                    return (
                                        <SelectItem key={i} value={format(d, 'yyyy-MM')} className="text-[10px] font-bold uppercase tracking-widest">
                                            {format(d, 'MMMM yyyy')}
                                        </SelectItem>
                                    )
                                }).filter(Boolean)}
                            </SelectContent>
                        </Select>
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
        <SheetContent className="w-full sm:max-w-xl bg-background/98 border-l border-white/5 p-0 overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-[40%] bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />
            
            <div className="p-10 md:p-14 pb-8 shrink-0 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                        Personnel Intelligence Trace
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <Avatar className="h-28 w-28 border-2 border-primary/10 shadow-2xl relative">
                        <AvatarImage src={selectedTeacher?.avatar} />
                        <AvatarFallback className="text-4xl bg-primary/5 text-primary font-serif">{getInitials(selectedTeacher?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <SheetTitle className="text-3xl font-serif font-medium tracking-tight mb-3">{selectedTeacher?.name}</SheetTitle>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground opacity-50">
                           <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 border border-primary/5 rounded-lg">
                                <Hash className="w-3.5 h-3.5" /> {selectedTeacher?.employeeId}
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/10 rounded-lg text-success/80 border-dashed">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Active Protocol
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 md:px-14 pb-14 space-y-10 custom-scrollbar relative z-10">
                <div className="grid grid-cols-2 gap-6">
                    <Card className="p-8 rounded-[2.5rem] bg-muted/20 border border-primary/5 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-20 mb-3">Institutional Rate (M)</p>
                        <p className="text-4xl font-serif text-success">
                            {selectedTeacher ? (() => {
                                const stats = monthlyStats[selectedTeacher.id] || { present: 0, absent: 0 }
                                const total = stats.present + stats.absent
                                return total > 0 ? Math.round((stats.present / total) * 100) : 0
                            })() : 0}%
                        </p>
                    </Card>
                    <Card className="p-8 rounded-[2.5rem] bg-indigo-500/[0.04] border-indigo-500/10 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400 opacity-40 mb-3">Extra Session Load</p>
                        <p className="text-4xl font-serif text-indigo-400">{(monthlyStats[selectedTeacher?.id || '']?.substitutions || 0)} Hrs</p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] uppercase tracking-widest font-black opacity-30">Temporal Audit Matrix</h4>
                        <span className="text-[10px] opacity-40 font-mono italic">Dynamic History</span>
                    </div>
                    <div className="space-y-4">
                        {selectedTeacher && attendance
                            .filter(a => a.teacherId === selectedTeacher.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((record, i) => {
                                const config = STATUS_CONFIG[record.status as AttendanceStatus] || STATUS_CONFIG['Present']
                                return (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-muted/5 border border-primary/5 border-dashed hover:bg-muted/10 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-base font-medium">{format(new Date(record.date), 'PPP')}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40 italic">Registry Entry #AUD-{record.id.slice(0, 4).toUpperCase()}</p>
                                        </div>
                                        <Badge className={cn("py-2 px-5 font-bold tracking-widest text-[10px] rounded-xl uppercase", config.bg, config.color, "border-none")}>
                                            {record.status}
                                        </Badge>
                                    </div>
                                )
                            })
                        }
                        {selectedTeacher && attendance.filter(a => a.teacherId === selectedTeacher.id).length === 0 && (
                            <div className="py-12 text-center opacity-20 border-2 border-dashed border-primary/10 rounded-[2.5rem]">
                                <span className="text-[10px] uppercase font-black tracking-widest">No Temporal Trace Found</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
