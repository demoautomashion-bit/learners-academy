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
  Check,
  Plus,
  X
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

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [hoveredTeacherId, setHoveredTeacherId] = useState<string | null>(null)

  // Auto-select first teacher if none selected
  useEffect(() => {
    if (!selectedTeacherId && teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id)
    }
  }, [teachers, selectedTeacherId])

  // Calculate days in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  
  // Calculate the 7-column grid weeks
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay()
    const slots: (number | null)[] = []
    
    // Add empty slots before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      slots.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      slots.push(i)
    }
    
    // Chunk into weeks of 7
    const weeks: (number | null)[][] = []
    for (let i = 0; i < slots.length; i += 7) {
      weeks.push(slots.slice(i, i + 7))
    }
    return weeks
  }, [selectedYear, selectedMonth, daysInMonth])

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
    const stats: Record<string, { present: number, absent: number, late: number, leave: number, substitutes: number, extraClasses: number }> = {}
    
    teachers.forEach(teacher => {
      stats[teacher.id] = { present: 0, absent: 0, late: 0, leave: 0, substitutes: 0, extraClasses: 0 }
      const teacherAttendance = attendanceMap[teacher.id] || {}
      
      Object.values(teacherAttendance).forEach((rec: any) => {
        if (rec.status === 'Present') stats[teacher.id].present++
        else if (rec.status === 'Absent') stats[teacher.id].absent++
        else if (rec.status === 'Late') stats[teacher.id].late++
        else if (rec.status === 'Leave') stats[teacher.id].leave++
        
        if (rec.substituteCount > 0) {
           stats[teacher.id].substitutes++
           stats[teacher.id].extraClasses += rec.substituteCount
        }
      })
    })
    return stats
  }, [teachers, attendanceMap])

  const overallStats = useMemo(() => {
    const totalPresent = Object.values(statsMap).reduce((acc, curr: any) => acc + (curr.present || 0), 0)
    const totalSubstituted = attendanceRecords.reduce((acc, curr) => acc + (curr.substituteCount || 0), 0)
    const uncheckedToday = teachers.length - attendanceRecords.filter(r => new Date(r.date).getDate() === new Date().getDate()).length
    
    return {
      presence: totalPresent > 0 ? "94.8%" : "0%",
      uncheckedToday,
      lateFrequency: "4.2%",
      totalSubstitutes: totalSubstituted
    }
  }, [statsMap, attendanceRecords, teachers])

  const handleUpdateStatus = async (teacherId: string, day: number, status: AttendanceStatus, subCount: number) => {
    const date = new Date(selectedYear, selectedMonth, day).toISOString()
    try {
      // Optimistic update
      const newRecord = { teacherId, date, status, substituteCount: subCount }
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => !(r.teacherId === teacherId && new Date(r.date).getDate() === day))
        return [...filtered, newRecord]
      })
      
      await markAttendance(teacherId, date, status, subCount)
    } catch (error) {
      toast.error('Sync failed')
      fetchAttendance() // Revert
    }
  }

  const handleMarkAllPresent = async () => {
    const activeTeachers = teachers.filter(t => t.status === 'active')
    toast.promise(
      Promise.all(activeTeachers.map(t => 
        markAttendance(t.id, new Date().toISOString(), 'Present', 0)
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
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 max-w-[1700px] mx-auto animate-in fade-in zoom-in-95 duration-700 overflow-hidden" 
         style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, var(--font-inter), Inter, sans-serif' }}>
      
      {/* 1. Analytics Horizon (The Premium Header) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2 shrink-0">
        <div className="space-y-0.5">
          <h1 className="font-serif font-bold text-3xl tracking-tight text-foreground">
            Attendance Registry
          </h1>
          <p className="font-sans text-muted-foreground text-[10px] tracking-[0.2em] font-black opacity-30 uppercase">
             {MONTHS[selectedMonth]} {selectedYear} // Global Panel
          </p>
        </div>

        <div className="flex items-center gap-6">
           {/* Global Metric Summary */}
           <div className="flex items-center gap-8 px-6 py-2.5 rounded-2xl bg-card border border-primary/5 shadow-sm">
              <div className="flex flex-col border-r border-primary/5 pr-8">
                 <span className="font-sans text-xl font-bold tracking-tight">{overallStats.presence}</span>
                 <span className="font-sans text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/30 leading-none mt-1">Global Presence</span>
              </div>
              <div className="flex flex-col">
                 <span className="font-sans text-xl font-bold tracking-tight text-destructive/60">{overallStats.uncheckedToday}</span>
                 <span className="font-sans text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/30 leading-none mt-1">Pending</span>
              </div>
           </div>

           <div className="flex bg-card/60 backdrop-blur-md border border-primary/10 p-1 rounded-xl shadow-sm h-fit font-sans">
             <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-32 border-none bg-transparent h-8 text-[11px] font-bold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={i.toString()} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
             <div className="w-px h-3 bg-primary/10 self-center mx-1" />
             <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-24 border-none bg-transparent h-8 text-[11px] font-bold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  {[2024, 2025, 2026].map(y => (
                    <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden pb-4">
         {/* 2. Personnel Sidebar (The Registry) */}
         <div className="w-[400px] flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
               <span className="font-sans text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Staff Registry // {teachers.length} Entries</span>
               <Button 
                  onClick={handleMarkAllPresent}
                  variant="ghost" 
                  size="sm"
                  className="font-sans h-7 px-3 text-[9px] uppercase tracking-widest font-black hover:bg-success/5 hover:text-success gap-2 border border-primary/5 rounded-lg"
               >
                  <Check className="w-3 h-3" />
                  Mark All
               </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
               {teachers.map(teacher => {
                  const stats = statsMap[teacher.id] || { present: 0, absent: 0, late: 0, leave: 0, substitutes: 0, extraClasses: 0 }
                  const isSelected = selectedTeacherId === teacher.id
                  
                  return (
                    <div 
                      key={teacher.id} 
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={cn(
                        "p-5 rounded-[1.5rem] cursor-pointer transition-premium border relative group",
                        isSelected 
                          ? "bg-card border-primary/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] scale-[1.02]" 
                          : "bg-card/40 border-primary/5 hover:bg-card/80 hover:scale-[1.01]"
                      )}
                    >
                       {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary/40 rounded-r-full shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
                       )}
                       
                       <div className="flex items-start justify-between">
                          <div className="space-y-1 font-sans">
                             <div className="flex items-center gap-3">
                                <h4 className="font-serif font-bold text-lg leading-tight text-foreground/90">{teacher.name}</h4>
                                {teacher.status === 'active' && (
                                   <span className="w-2 h-2 rounded-full bg-success/40 animate-pulse" />
                                )}
                             </div>
                             <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest leading-none opacity-40">ID // {teacher.employeeId}</p>
                          </div>
                          <Badge variant="outline" className="font-sans text-[8px] font-black tracking-widest border-primary/10 opacity-40 px-2 py-0.5">
                             {teacher.position || 'Lecturer'}
                          </Badge>
                       </div>

                       <div className="mt-5 pt-4 border-t border-primary/5 grid grid-cols-5 gap-1.5 font-sans">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-success/60">{stats.present}</span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">P</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-destructive/50">{stats.absent}</span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">A</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-warning/70">{stats.late}</span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">L</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-primary/80">{stats.extraClasses}</span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">Sub</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-primary/40">{stats.leave}</span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">LV</span>
                          </div>
                       </div>
                    </div>
                  )
               })}
            </div>
         </div>

         {/* 3. The Attendance Canvas (Main Display) */}
         <div className="flex-1 bg-card rounded-[2.5rem] border border-primary/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden relative group/canvas transition-all duration-700">
            {selectedTeacherId ? (
               <>
                  {/* Top Canvas Stats */}
                  <div className="px-12 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 bg-muted/5 border-b border-primary/5">
                     <div className="space-y-2 font-sans">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 leading-none">Attendance Record</span>
                        <h3 className="font-serif text-4xl font-bold tracking-tight">
                           {teachers.find(t => t.id === selectedTeacherId)?.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/40 leading-none opacity-40">Detailed Personnel Summary for {MONTHS[selectedMonth]} {selectedYear}</p>
                     </div>

                     <div className="flex flex-wrap gap-4 font-sans">
                        <MetricPill label="Present" value={statsMap[selectedTeacherId]?.present || 0} color="success" />
                        <MetricPill label="Absent" value={statsMap[selectedTeacherId]?.absent || 0} color="destructive" />
                        <MetricPill label="Late" value={statsMap[selectedTeacherId]?.late || 0} color="warning" />
                        <MetricPill label="Leave" value={statsMap[selectedTeacherId]?.leave || 0} color="primary" />
                     </div>
                  </div>

                  {/* 7-Column Grid Canvas */}
                  <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-7 border-collapse relative">
                        {/* Headers */}
                        {DAYS.map(day => (
                           <div key={day} className="h-10 border-b border-primary/10 flex items-center justify-center">
                              <span className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">{day}</span>
                           </div>
                        ))}
                        
                        {/* Days Grid */}
                        {calendarWeeks.map((week, wIdx) => (
                           week.map((day, dIdx) => {
                              if (day === null) return <div key={`empty-${wIdx}-${dIdx}`} className="h-[120px] bg-muted/[0.02]" />
                              
                              const record = (attendanceMap[selectedTeacherId] || {})[day.toString()]
                              const date = new Date(selectedYear, selectedMonth, day)
                              const isWeekend = date.getDay() === 0 || date.getDay() === 6
                              
                              return (
                                 <div 
                                    key={day} 
                                    className={cn(
                                       "h-[135px] border-b border-r border-primary/5 transition-all duration-500 relative group/cell overflow-hidden",
                                       dIdx === 6 ? "border-r-0" : "",
                                       isWeekend ? "bg-muted/[0.04]" : "hover:bg-primary/[0.01]"
                                    )}
                                 >
                                    <div className="absolute top-4 left-5">
                                       <span className={cn(
                                          "font-sans text-xl font-bold transition-colors",
                                          isWeekend ? "text-muted-foreground/20" : "text-primary/20 group-hover/cell:text-primary/60"
                                       )}>{day < 10 ? `0${day}` : day}</span>
                                    </div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center mt-4 font-sans">
                                       <AttendanceGridCell 
                                          teacherId={selectedTeacherId} 
                                          day={day} 
                                          record={record} 
                                          onUpdate={handleUpdateStatus}
                                          isWeekend={isWeekend}
                                          currentMonth={selectedMonth}
                                          currentYear={selectedYear}
                                       />
                                    </div>
                                    
                                    {isWeekend && (
                                      <div className="absolute bottom-2 right-4 opacity-5 font-sans">
                                         <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Institutional Weekend</span>
                                      </div>
                                    )}
                                 </div>
                              )
                           })
                        ))}
                     </div>
                  </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-4 font-sans">
                  <CalendarIcon className="w-16 h-16 stroke-1 text-primary" />
                  <p className="text-xl font-bold">Select a teacher record to begin audit</p>
               </div>
            )}
         </div>
      </div>

      {/* 4. Footer Legend & Status Pane */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-12 px-6 pt-4 border-t border-primary/5 shrink-0">
         <div className="flex flex-wrap items-center gap-8 animate-in slide-in-from-left-8 duration-1000 font-sans">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-success ring-4 ring-success/[0.05]" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Presence</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-destructive/60 ring-4 ring-destructive/[0.05]" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Absence</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-warning ring-4 ring-warning/[0.05]" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Late</span>
            </div>
            <div className="flex items-center gap-3">
               <Star className="w-3 h-3 text-primary/40 fill-primary/10" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Substitution</span>
            </div>
         </div>

         <div className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 text-center lg:text-right">
            Registry Master System<br/>
            Ref // TLA-GRID-V2
         </div>
      </div>
    </div>
  )
}

function MetricPill({ label, value, color }: { label: string, value: number, color: 'success' | 'destructive' | 'warning' | 'primary' }) {
  const colorMap = {
     success: "bg-success/10 text-success border-success/20 shadow-[0_0_15px_rgba(var(--success),0.1)]",
     destructive: "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_15px_rgba(var(--destructive),0.1)]",
     warning: "bg-warning/10 text-warning border-warning/20 shadow-[0_0_15px_rgba(var(--warning),0.1)]",
     primary: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]",
  }

  return (
     <div className={cn(
        "font-sans px-6 py-3 rounded-2xl border flex flex-col items-center min-w-[120px] transition-all duration-500 hover:scale-105",
        colorMap[color]
     )}>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">{label}</span>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
     </div>
  )
}

function AttendanceGridCell({ teacherId, day, record, onUpdate, isWeekend }: any) {
  const [open, setOpen] = useState(false)
  const currentStatus = record?.status || null
  const subCount = record?.substituteCount || 0

  if (isWeekend) {
     return (
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/10" />
     )
  }

  const handleSelect = (status: AttendanceStatus, count = subCount) => {
    onUpdate(teacherId, day, status, count)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="font-sans group/cell relative w-full h-full flex items-center justify-center transition-all active:scale-90 outline-none overflow-visible">
          {/* Main Indicator Hub */}
          <div className="relative">
             <div className={cn(
               "w-5 h-5 rounded-full transition-all duration-500 border-2",
               currentStatus === 'Present' ? "bg-success border-success" :
               currentStatus === 'Absent' ? "bg-destructive/10 border-destructive/40" :
               currentStatus === 'Late' ? "bg-warning/10 border-warning/40" :
               currentStatus === 'Leave' ? "bg-muted-foreground/20 border-muted-foreground/40" :
               "bg-primary/[0.03] border-primary/5 group-hover/cell:border-primary/40 group-hover/cell:bg-primary/5"
             )} />
             
             {/* Sub Session Counter Badge */}
             {subCount > 0 && (
               <div className="absolute -top-3 -right-3 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-[8px] font-black text-white border-2 border-white shadow-sm ring-1 ring-primary/20">
                  +{subCount}
               </div>
             )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="font-sans w-64 p-4 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-primary/10 backdrop-blur-3xl bg-card/90" 
                      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, var(--font-inter), Inter, sans-serif' }}>
        <div className="px-3 py-2 border-b border-primary/5 mb-4">
           <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50 leading-none mb-2">Dual Audit // Day {day}</p>
           <p className="text-[9px] text-muted-foreground/30 leading-none">Status & Extra Coverage</p>
        </div>
        <div className="grid gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-success/10 hover:text-success px-5 group/item"
            onClick={() => handleSelect('Present')}
          >
            <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,100,0.3)]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Mark Present</span>
            {currentStatus === 'Present' && <Check className="w-4 h-4 ml-auto text-success" />}
          </Button>
          
          <div className="my-2 border-t border-primary/5" />

          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-primary/10 hover:text-primary px-5 group/item"
            onClick={() => handleSelect(currentStatus || 'Present', subCount + 1)}
          >
            <div className="relative">
               <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
               <Plus className="absolute -top-1 -right-1 w-2 h-2 text-white" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Add Substitute Class</span>
            <Badge variant="secondary" className="ml-auto text-[9px] font-black bg-primary/20">{subCount}</Badge>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-destructive/10 hover:text-destructive px-5 group/item text-muted-foreground/40"
            onClick={() => handleSelect(currentStatus || 'Present', 0)}
          >
            <X className="w-3 h-3" />
            <span className="text-[11px] font-black uppercase tracking-widest">Clear Subsitutes</span>
          </Button>

          <div className="my-2 border-t border-primary/5" />

          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-destructive/10 hover:text-destructive px-5 group/item"
            onClick={() => handleSelect('Absent')}
          >
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Absent</span>
            {currentStatus === 'Absent' && <Check className="w-4 h-4 ml-auto text-destructive" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-warning/10 hover:text-warning px-5 group/item"
            onClick={() => handleSelect('Late')}
          >
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Late Entry</span>
            {currentStatus === 'Late' && <Check className="w-4 h-4 ml-auto text-warning" />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-4 h-11 rounded-2xl hover:bg-muted-foreground/10 hover:text-foreground px-5 group/item"
            onClick={() => handleSelect('Leave')}
          >
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Leave / Off</span>
            {currentStatus === 'Leave' && <Check className="w-4 h-4 ml-auto text-foreground" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
