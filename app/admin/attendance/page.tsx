'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  User, 
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Tally4,
  Check
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { getTeacherAttendance, markAttendance } from '@/lib/actions/attendance'
import { toast } from 'sonner'

// Days mapping for headers
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'

export default function AttendancePage() {
  const { teachers } = useData()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculate days in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const calendarDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

  const fetchAttendance = async () => {
    setIsLoading(true)
    try {
      const data = await getTeacherAttendance(selectedMonth, selectedYear)
      setAttendanceRecords(data)
    } catch (error) {
      toast.error('Failed to load attendance records')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [selectedMonth, selectedYear])

  // Mapping attendance data for the grid: teacherId -> dateString -> record
  const attendanceMap = useMemo(() => {
    const map: Record<string, Record<string, any>> = {}
    attendanceRecords.forEach(rec => {
      const tId = rec.teacherId
      const dateStr = new Date(rec.date).getDate().toString()
      if (!map[tId]) map[tId] = {}
      map[tId][dateStr] = rec
    })
    return map
  }, [attendanceRecords])

  // Summary counts per teacher
  const statsMap = useMemo(() => {
    const stats: Record<string, { present: number, absent: number, late: number, leave: number, substitutes: number }> = {}
    
    teachers.forEach(teacher => {
      stats[teacher.id] = { present: 0, absent: 0, late: 0, leave: 0, substitutes: 0 }
      const teacherAttendance = attendanceMap[teacher.id] || {}
      
      Object.values(teacherAttendance).forEach((rec: any) => {
        if (rec.status === 'Present') stats[teacher.id].present++
        if (rec.status === 'Absent') stats[teacher.id].absent++
        if (rec.status === 'Late') stats[teacher.id].late++
        if (rec.status === 'Leave') stats[teacher.id].leave++
        if (rec.isSubstitute) stats[teacher.id].substitutes++
      })
    })
    return stats
  }, [teachers, attendanceMap])

  const handleUpdateStatus = async (teacherId: string, day: number, status: AttendanceStatus, isSubstitute: boolean) => {
    const date = new Date(selectedYear, selectedMonth, day).toISOString()
    try {
      // Optimistic update
      const newRecord = { teacherId, date, status, isSubstitute }
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => !(r.teacherId === teacherId && new Date(r.date).getDate() === day))
        return [...filtered, newRecord]
      })
      
      await markAttendance(teacherId, date, status, isSubstitute)
    } catch (error) {
      toast.error('Sync failed')
      fetchAttendance() // Revert
    }
  }

  const handleMarkAllPresent = async () => {
    const today = new Date().getDate()
    const activeTeachers = teachers.filter(t => t.status === 'active')
    
    toast.promise(
      Promise.all(activeTeachers.map(t => 
        markAttendance(t.id, new Date().toISOString(), 'Present', false)
      )),
      {
        loading: 'Syncing registry...',
        success: () => {
          fetchAttendance()
          return 'All active staff marked as present for today'
        },
        error: 'Registration failure'
      }
    )
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Editorial Header */}
      {/* Responsive Editorial Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-1">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Staff Registry
          </h1>
          <p className="text-muted-foreground font-sans text-xs sm:text-sm tracking-wide opacity-80">
            Professional Attendance & Substitution Tracker — {MONTHS[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex bg-card/60 backdrop-blur-md border border-primary/10 p-1.5 rounded-xl shadow-sm">
             <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-full sm:w-32 border-none bg-transparent h-9 text-xs font-semibold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={i.toString()} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
             <div className="w-px h-4 bg-primary/10 self-center mx-1 hidden sm:block" />
             <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-full sm:w-24 border-none bg-transparent h-9 text-xs font-semibold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => (
                    <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
          
          <Button 
            onClick={handleMarkAllPresent}
            variant="outline" 
            className="h-12 sm:h-11 px-6 rounded-xl border-primary/20 bg-background hover:bg-primary/5 hover:text-primary transition-premium font-bold text-[10px] uppercase tracking-widest gap-2 w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Check-in All Active
          </Button>
        </div>
      </div>

      {/* Unified Analytics Strip (Adaptive Layout) */}
      <Card className="border-primary/10 shadow-lg bg-card/40 backdrop-blur-xl overflow-hidden rounded-3xl mx-0 sm:mx-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-primary/5">
          {[
            { label: 'Avg Presence', value: '94%', icon: CheckCircle2, color: 'text-success' },
            { label: 'Unchecked', value: teachers.length - attendanceRecords.filter(r => new Date(r.date).getDate() === new Date().getDate()).length, icon: User, color: 'text-muted-foreground' },
            { label: 'Late Frequency', value: '4.2%', icon: Clock, color: 'text-warning' },
            { label: 'Substitutions', value: attendanceRecords.filter(r => r.isSubstitute).length, icon: Star, color: 'text-primary' },
          ].map((s, i) => (
            <div key={i} className="p-5 sm:p-6 flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">{s.value}</p>
              </div>
              <div className={cn("p-2.5 rounded-2xl bg-background/50 border border-primary/5 shadow-inner transition-transform group-hover:scale-110", s.color)}>
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* The Master Grid */}
      <div className="relative border border-primary/10 rounded-3xl bg-card shadow-2xl overflow-hidden mx-0 sm:mx-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left table-fixed">
            <thead>
              <tr className="bg-muted/10 border-b border-primary/5">
                {/* Sticky Side Headers (Spanning multiple rows) */}
                <th rowSpan={2} className="sticky left-0 z-40 bg-card/95 backdrop-blur-md px-6 py-6 w-[180px] sm:w-[220px] border-r border-primary/10 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-black text-muted-foreground/40 leading-none">Registry</span>
                    <span className="font-serif text-lg font-bold leading-tight">Academic Staff</span>
                  </div>
                </th>
                <th rowSpan={2} className="sticky left-[180px] sm:left-[220px] z-40 bg-card/95 backdrop-blur-md px-4 py-8 w-[160px] sm:w-[180px] border-r border-primary/10 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.1)] shrink-0">
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {['P','A','L','S'].map(l => (
                      <span key={l} className="text-[8px] font-black opacity-20 tracking-tighter" title={l}>{l}</span>
                    ))}
                  </div>
                  <div className="text-[9px] text-center uppercase tracking-[0.15em] font-black text-muted-foreground pt-1 opacity-30 leading-none">Summary</div>
                </th>
                
                {/* Row 1: Day Labels (MON, TUE...) */}
                {calendarDays.map(day => {
                   const date = new Date(selectedYear, selectedMonth, day)
                   const isWeekend = date.getDay() === 0 || date.getDay() === 6
                   return (
                     <th key={`day-${day}`} className={cn(
                       "px-1 py-4 min-w-[50px] text-center border-r border-primary/5/30 transition-colors",
                       isWeekend ? "bg-muted/40" : ""
                     )}>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">{DAYS[date.getDay()]}</span>
                     </th>
                   )
                })}
              </tr>
              <tr className="bg-muted/5 border-b border-primary/10">
                {/* Row 2: Date Anchors (01, 02...) */}
                {calendarDays.map(day => {
                   const date = new Date(selectedYear, selectedMonth, day)
                   const isWeekend = date.getDay() === 0 || date.getDay() === 6
                   return (
                     <th key={`date-${day}`} className={cn(
                       "px-1 py-4 min-w-[50px] text-center border-r border-primary/5/30 transition-colors",
                       isWeekend ? "bg-muted/40" : ""
                     )}>
                        <span className="font-mono text-base font-bold text-primary/70">{day < 10 ? `0${day}` : day}</span>
                     </th>
                   )
                })}
              </tr>
            </thead>
            <TableBodyWrapper 
              teachers={teachers} 
              daysInMonth={daysInMonth} 
              calendarDays={calendarDays}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              attendanceMap={attendanceMap}
              statsMap={statsMap}
              onUpdate={handleUpdateStatus}
            />
          </table>
        </div>
      </div>
      
      {/* Legend Footer */}
      <div className="bg-card/30 border border-primary/5 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-8 shadow-inner animate-in slide-in-from-bottom-2 duration-500">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-success ring-4 ring-success/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Present</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-destructive/60 ring-4 ring-destructive/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Absent</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-warning ring-4 ring-warning/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Late</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-muted ring-4 ring-muted/10 border" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">On Leave</span>
         </div>
         <div className="flex items-center gap-3 ml-4 pl-8 border-l border-primary/10">
            <Star className="w-3 h-3 text-primary fill-primary/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 text-primary">Class Substitution</span>
         </div>
      </div>
    </div>
  )
}

function TableBodyWrapper({ 
  teachers, 
  calendarDays, 
  selectedMonth, 
  selectedYear, 
  attendanceMap, 
  statsMap,
  onUpdate 
}: any) {
  return (
    <tbody>
      {teachers.map((teacher: any) => {
        const stats = statsMap[teacher.id] || { present: 0, absent: 0, late: 0, leave: 0, substitutes: 0 }
        return (
          <tr key={teacher.id} className="group hover:bg-primary/5 transition-premium border-b border-primary/5/30 h-16">
            {/* Sticky Side 1: Name & ID */}
            <td className="sticky left-0 z-30 bg-card group-hover:bg-transparent backdrop-blur-md px-6 py-4 w-[180px] sm:w-[220px] border-r border-primary/10 transition-colors shrink-0">
              <div className="flex items-center gap-3">
                 <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-sm sm:text-base leading-tight truncate mb-0.5">{teacher.name}</p>
                    <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest opacity-60">ID: {teacher.employeeId}</p>
                 </div>
              </div>
            </td>
            
            {/* Sticky Side 2: Monthly Stats */}
            <td className="sticky left-[180px] sm:left-[220px] z-30 bg-card group-hover:bg-transparent backdrop-blur-md px-4 py-4 w-[160px] sm:w-[180px] border-r border-primary/10 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.1)] transition-colors shrink-0">
              <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
                 <span className="text-xs font-bold text-success/70">{stats.present}</span>
                 <span className="text-xs font-bold text-destructive/50">{stats.absent}</span>
                 <span className="text-xs font-bold text-warning/90">{stats.late}</span>
                 <span className="text-xs font-bold text-primary flex items-center justify-center">
                    {stats.substitutes > 0 ? <><Star className="w-2.5 h-2.5 mr-0.5 fill-current" />{stats.substitutes}</> : '0'}
                 </span>
              </div>
            </td>

            {/* Scrollable Day Cells */}
            {calendarDays.map((day: number) => {
              const record = (attendanceMap[teacher.id] || {})[day.toString()]
              const date = new Date(selectedYear, selectedMonth, day)
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              
              return (
                <td key={day} className={cn(
                  "px-2 py-4 border-r border-primary/5/30 transition-premium",
                  isWeekend ? "bg-muted/10/50" : ""
                )}>
                  <AttendanceCell 
                    teacherId={teacher.id} 
                    day={day} 
                    record={record} 
                    onUpdate={onUpdate}
                  />
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}

function AttendanceCell({ teacherId, day, record, onUpdate }: any) {
  const currentStatus = record?.status || null
  const isSubstitute = record?.isSubstitute || false

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-10 h-10 mx-auto rounded-full group/btn hover:bg-primary/5 flex items-center justify-center transition-all active:scale-90">
          {/* Status Dot */}
          <div className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            currentStatus === 'Present' ? "bg-success scale-110 shadow-[0_0_10px_rgba(0,255,100,0.2)]" :
            currentStatus === 'Absent' ? "bg-destructive/60 scale-100" :
            currentStatus === 'Late' ? "bg-warning scale-100" :
            currentStatus === 'Leave' ? "bg-muted scale-90 border" :
            "bg-muted/20 scale-75 group-hover/btn:scale-95"
          )} />
          
          {/* Substitution Indicator Overlay */}
          {isSubstitute && (
            <div className="absolute top-0 right-0">
               <Star className="w-3 h-3 text-primary fill-primary animate-in zoom-in duration-500" />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 rounded-2xl shadow-xl border-primary/10 backdrop-blur-xl bg-card/90">
        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-50 px-2 py-1 mb-2">Mark Registry Day {day}</p>
        <div className="grid gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 h-9 rounded-lg hover:bg-success/10 hover:text-success"
            onClick={() => onUpdate(teacherId, day, 'Present', isSubstitute)}
          >
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-bold">Present</span>
            {currentStatus === 'Present' && <Check className="w-3 h-3 ml-auto" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 h-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onUpdate(teacherId, day, 'Absent', isSubstitute)}
          >
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs font-bold">Absent</span>
            {currentStatus === 'Absent' && <Check className="w-3 h-3 ml-auto" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 h-9 rounded-lg hover:bg-warning/10 hover:text-warning"
            onClick={() => onUpdate(teacherId, day, 'Late', isSubstitute)}
          >
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs font-bold">Late Arrival</span>
            {currentStatus === 'Late' && <Check className="w-3 h-3 ml-auto" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 h-9 rounded-lg"
            onClick={() => onUpdate(teacherId, day, 'Leave', isSubstitute)}
          >
            <div className="w-2 h-2 rounded-full bg-muted border" />
            <span className="text-xs font-bold">On Leave</span>
            {currentStatus === 'Leave' && <Check className="w-3 h-3 ml-auto" />}
          </Button>
          <div className="my-1 border-t border-primary/5" />
          <Button 
            variant={isSubstitute ? "secondary" : "ghost"} 
            size="sm" 
            className={cn(
              "justify-start gap-2 h-9 rounded-lg transition-premium",
              isSubstitute ? "bg-primary/10 text-primary" : "hover:text-primary"
            )}
            onClick={() => onUpdate(teacherId, day, currentStatus || 'Present', !isSubstitute)}
          >
            <Star className={cn("w-3 h-3", isSubstitute ? "fill-primary" : "")} />
            <span className="text-xs font-bold tracking-tight">Class Substitute</span>
            {isSubstitute && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
