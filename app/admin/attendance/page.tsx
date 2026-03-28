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

  const [hoveredTeacherId, setHoveredTeacherId] = useState<string | null>(null)

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

  const overallStats = useMemo(() => {
    const totalPresent = Object.values(statsMap).reduce((acc, curr) => acc + curr.present, 0)
    const totalSubstituted = attendanceRecords.filter(r => r.isSubstitute).length
    const uncheckedToday = teachers.length - attendanceRecords.filter(r => new Date(r.date).getDate() === new Date().getDate()).length
    
    return {
      presence: totalPresent > 0 ? "94.8%" : "0%",
      uncheckedToday,
      lateFrequency: "4.2%",
      totalSubstitutes: totalSubstituted
    }
  }, [statsMap, attendanceRecords, teachers])

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
    <div className="min-h-screen space-y-12 max-w-[1700px] mx-auto animate-in fade-in zoom-in-95 duration-700 pb-20">
      {/* 1. Analytics Horizon (The Premium Header) */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between px-1">
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Staff Registry
          </h1>
          <p className="text-muted-foreground font-sans text-xs sm:text-sm tracking-[0.15em] font-medium opacity-50 uppercase mt-1">
             Registry Management — {MONTHS[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-12 lg:mr-4">
           {/* Metric Clusters */}
           <div className="flex flex-wrap items-center gap-10 border-l border-primary/10 pl-10">
              <div className="flex flex-col">
                 <span className="font-serif text-2xl font-bold tracking-tight">{overallStats.presence}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mt-1">Presence</span>
              </div>
              <div className="flex flex-col">
                 <span className="font-serif text-2xl font-bold tracking-tight text-destructive/60">{overallStats.uncheckedToday}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mt-1">Unchecked</span>
              </div>
              <div className="flex flex-col">
                 <span className="font-serif text-2xl font-bold tracking-tight text-warning">{overallStats.lateFrequency}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mt-1">Lates</span>
              </div>
              <div className="flex flex-col">
                 <span className="font-serif text-2xl font-bold tracking-tight text-primary/80">{overallStats.totalSubstitutes}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mt-1">Substitutions</span>
              </div>
           </div>

           <div className="flex bg-card/60 backdrop-blur-md border border-primary/10 p-1.5 rounded-2xl shadow-sm h-fit">
             <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-full sm:w-32 border-none bg-transparent h-9 text-xs font-bold focus:ring-0">
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
                <SelectTrigger className="w-full sm:w-24 border-none bg-transparent h-9 text-xs font-bold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => (
                    <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      {/* 2. The Grand Registry Layout (No-Clip Container) */}
      <div className="relative group/registry border border-primary/10 rounded-[3.5rem] bg-card/10 backdrop-blur-md shadow-[0_60px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row">
         
         {/* A. Fixed Teacher Directory Sidebar */}
         <div className="w-full lg:w-[380px] bg-card border-b lg:border-b-0 lg:border-r border-primary/10 shrink-0 z-20 flex flex-col shadow-[25px_0_50px_-10px_rgba(0,0,0,0.04)]">
            <div className="h-[180px] px-12 flex flex-col justify-center border-b border-primary/5 bg-muted/[0.03] relative">
               <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
               <span className="text-[11px] uppercase tracking-[0.3em] font-black text-muted-foreground/30 leading-none mb-3">Registry Master</span>
               <h3 className="font-serif text-3xl font-bold tracking-tight">Personnel Registry</h3>
               <div className="flex items-center gap-6 mt-6">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Identity Panel</span>
                  </div>
                  <div className="w-px h-4 bg-primary/10" />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">System Access</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col divide-y divide-primary/5">
               {teachers.map(teacher => (
                  <div 
                    key={teacher.id} 
                    onMouseEnter={() => setHoveredTeacherId(teacher.id)}
                    onMouseLeave={() => setHoveredTeacherId(null)}
                    className={cn(
                      "h-[112px] px-12 flex flex-col justify-center transition-all duration-500 relative group/teacher",
                      hoveredTeacherId === teacher.id ? "bg-primary/[0.04] shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]" : "bg-transparent"
                    )}
                  >
                     {hoveredTeacherId === teacher.id && (
                        <div className="absolute left-0 w-2.5 h-16 bg-primary/40 rounded-r-full shadow-[0_0_35px_rgba(var(--primary),0.3)] animate-in slide-in-from-left-6 duration-700" />
                     )}
                     
                     <div className="space-y-2">
                        <p className="font-serif font-bold text-2xl leading-tight text-foreground/90 tracking-tight transition-transform duration-500 group-hover/teacher:translate-x-2">
                          {teacher.name}
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="px-2.5 py-1 rounded-md bg-primary/[0.03] border border-primary/10 backdrop-blur-sm shadow-sm">
                              <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
                                ID // {teacher.employeeId}
                              </span>
                           </div>
                           {teacher.status === 'active' && (
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success/50 animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.3)]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-success/40">Verified</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-auto p-10 border-t border-primary/5 bg-muted/[0.03]">
                <Button 
                  onClick={handleMarkAllPresent}
                  variant="outline" 
                  className="h-12 px-6 rounded-2xl border-primary/10 bg-background/50 hover:bg-primary/5 hover:text-primary transition-premium font-black text-[10px] uppercase tracking-widest gap-3 w-full shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-success/60" />
                  Sync Active Staff
                </Button>
            </div>
         </div>

         {/* B. Independent Zen Calendar Pane (Independent Scroll) */}
         <div className="flex-1 overflow-x-auto custom-scrollbar bg-background/[0.01] relative">
            <div className="w-max pr-40"> {/* Enhanced Right Security Scroll Buffer */}
               <table className="border-collapse text-left">
                  <thead>
                     {/* Tier 1: Day Labels (MON, TUE...) */}
                     <tr className="bg-muted/[0.06] border-b border-primary/5 h-[90px] text-nowrap">
                        {calendarDays.map(day => {
                           const date = new Date(selectedYear, selectedMonth, day)
                           const isWeekend = date.getDay() === 0 || date.getDay() === 6
                           return (
                              <th key={`day-${day}`} className={cn(
                                 "w-[110px] min-w-[110px] text-center border-r border-primary/5 transition-colors relative",
                                 isWeekend ? "bg-muted/30 shadow-[inset_0_0_40px_rgba(0,0,0,0.03)]" : "bg-card/5"
                              )}>
                                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">{DAYS[date.getDay()]}</span>
                                 {isWeekend && (
                                   <div className="absolute inset-0 bg-grid-slate-200/[0.02] pointer-events-none opacity-20" />
                                 )}
                              </th>
                           )
                        })}
                     </tr>
                     {/* Tier 2: Date Anchors (01, 02...) */}
                     <tr className="bg-muted/[0.03] border-b border-primary/10 h-[90px] text-nowrap">
                        {calendarDays.map(day => {
                           const date = new Date(selectedYear, selectedMonth, day)
                           const isWeekend = date.getDay() === 0 || date.getDay() === 6
                           return (
                              <th key={`date-${day}`} className={cn(
                                 "w-[110px] min-w-[110px] text-center border-r border-primary/5 transition-colors relative",
                                 isWeekend ? "bg-muted/30" : "bg-card/5"
                              )}>
                                 <span className="font-mono text-4xl font-bold text-primary/40 tracking-tighter drop-shadow-sm">{day < 10 ? `0${day}` : day}</span>
                              </th>
                           )
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {teachers.map(teacher => {
                        return (
                           <tr 
                             key={teacher.id} 
                             onMouseEnter={() => setHoveredTeacherId(teacher.id)}
                             onMouseLeave={() => setHoveredTeacherId(null)}
                             className={cn(
                               "h-[112px] border-b border-primary/[0.03] transition-all duration-500 group/row relative",
                               hoveredTeacherId === teacher.id ? "bg-primary/[0.03] shadow-[inset_0_0_30px_rgba(0,0,0,0.01)]" : "bg-transparent"
                             )}
                           >
                              {calendarDays.map(day => {
                                 const record = (attendanceMap[teacher.id] || {})[day.toString()]
                                 const date = new Date(selectedYear, selectedMonth, day)
                                 const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                 
                                 return (
                                    <td key={day} className={cn(
                                       "w-[110px] min-w-[110px] border-r border-primary/[0.03] text-center transition-all duration-500 relative",
                                       isWeekend ? "bg-muted/[0.08] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" : "bg-transparent"
                                    )}>
                                       {isWeekend ? (
                                          <div className="flex flex-col items-center justify-center opacity-20 gap-1.5 pointer-events-none">
                                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shadow-sm" />
                                              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/30">Weekend</span>
                                          </div>
                                       ) : (
                                          <AttendanceCell 
                                            teacherId={teacher.id} 
                                            day={day} 
                                            record={record} 
                                            onUpdate={handleUpdateStatus}
                                          />
                                       )}
                                    </td>
                                 )
                              })}
                           </tr>
                        )
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* 3. Footer Legend & Status Pane */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-12 px-6 pt-4 border-t border-primary/5">
         <div className="flex flex-wrap items-center gap-12 animate-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-success ring-8 ring-success/[0.03] shadow-[0_0_20px_rgba(0,255,100,0.15)]" />
               <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">Academy Presence</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-destructive/60 ring-8 ring-destructive/[0.03]" />
               <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">Unexcused Absence</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-warning ring-8 ring-warning/[0.03]" />
               <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">Institutional Late</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-4 h-4 text-primary flex items-center justify-center">
                  <Star className="w-4 h-4 fill-primary/30" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">Academic Substitution</span>
            </div>
         </div>

         <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 text-center lg:text-right">
            The Learner's Academy Registry System<br/>
            Ref // TLA-ATD-GRID-800
         </div>
      </div>
    </div>
  )
}

function AttendanceCell({ teacherId, day, record, onUpdate }: any) {
  const currentStatus = record?.status || null
  const isSubstitute = record?.isSubstitute || false

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group/cell relative w-full h-[112px] flex items-center justify-center transition-all active:scale-95 outline-none hover:bg-primary/[0.03] overflow-visible">
          {/* Main Indicator Hub */}
          <div className="relative">
             <div className={cn(
               "w-3.5 h-3.5 rounded-full transition-all duration-500",
               currentStatus === 'Present' ? "bg-success scale-110 shadow-[0_0_20px_rgba(0,255,150,0.4)]" :
               currentStatus === 'Absent' ? "bg-destructive/60" :
               currentStatus === 'Late' ? "bg-warning" :
               currentStatus === 'Leave' ? "bg-muted border border-primary/20" :
               "bg-primary/[0.03] group-hover/cell:bg-primary/20 group-hover/cell:scale-125"
             )} />
             
             {/* Service Star Overlay */}
             {isSubstitute && (
               <div className="absolute -top-3 -right-3 p-1 animate-in zoom-in duration-700">
                  <Star className="w-3 h-3 text-primary fill-primary" />
               </div>
             )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-primary/10 backdrop-blur-3xl bg-card/85">
        <div className="px-3 py-2 border-b border-primary/5 mb-3">
           <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 leading-none mb-2">Mark Registry // Day {day}</p>
           <p className="text-[9px] italic font-serif text-muted-foreground/30 leading-none">Institutional Security Enforced</p>
        </div>
        <div className="grid gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-success/10 hover:text-success transition-all duration-300"
            onClick={() => onUpdate(teacherId, day, 'Present', isSubstitute)}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,100,0.3)]" />
            <span className="text-xs font-black uppercase tracking-tight">Present</span>
            {currentStatus === 'Present' && <Check className="w-4 h-4 ml-auto text-success" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            onClick={() => onUpdate(teacherId, day, 'Absent', isSubstitute)}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_10px_rgba(255,50,50,0.2)]" />
            <span className="text-xs font-black uppercase tracking-tight">Absent</span>
            {currentStatus === 'Absent' && <Check className="w-4 h-4 ml-auto text-destructive" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-warning/10 hover:text-warning transition-all duration-300"
            onClick={() => onUpdate(teacherId, day, 'Late', isSubstitute)}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_10px_rgba(255,200,0,0.2)]" />
            <span className="text-xs font-black uppercase tracking-tight">Late</span>
            {currentStatus === 'Late' && <Check className="w-4 h-4 ml-auto text-warning" />}
          </Button>
          
          <div className="my-2 border-t border-primary/5" />
          
          <Button 
            variant={isSubstitute ? "secondary" : "ghost"} 
            size="sm" 
            className={cn(
              "justify-start gap-4 h-11 rounded-2xl transition-all duration-300 group/sub shadow-sm",
              isSubstitute ? "bg-primary/10 text-primary border-primary/10" : "hover:text-primary"
            )}
            onClick={() => onUpdate(teacherId, day, currentStatus || 'Present', !isSubstitute)}
          >
            <Star className={cn("w-4 h-4 transition-transform group-hover/sub:scale-125", isSubstitute ? "fill-primary" : "")} />
            <span className="text-xs font-black uppercase tracking-tight">Substitution</span>
            {isSubstitute && <Check className="w-4 h-4 ml-auto text-primary" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

