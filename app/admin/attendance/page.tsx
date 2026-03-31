'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileEdit,
  History,
  MoreHorizontal,
  Trash2,
  Download,
  Search
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { markAttendance, getTeacherAttendance, addAttendanceEvent } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'

/*
  Design Rules:
  - No Bold
  - No Italics
  - Subtle Animations
  - Institutional Professionalism
*/

export default function AttendancePage() {
  const { teachers } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [auditTarget, setAuditTarget] = useState<{ teacherId: string, date: string, record: any } | null>(null)

  // --- Dynamic Filtering Logic ---
  const currentRange = useMemo(() => {
    if (viewMode === 'month') {
      return { 
        start: startOfMonth(currentDate), 
        end: endOfMonth(currentDate),
        label: format(currentDate, 'MMMM yyyy')
      }
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return { 
      start, 
      end,
      label: `Week of ${format(start, 'MMM d')}`
    }
  }, [currentDate, viewMode])

  useEffect(() => {
    async function fetchAttendance() {
      setIsLoading(true)
      try {
        const data = await getTeacherAttendance(currentRange.start, currentRange.end)
        // Sanitize incoming data: ensure date is valid and teacherId exists
        const sanitized = data.filter(a => a.date && !isNaN(new Date(a.date).getTime()) && a.teacherId)
        setAttendanceData(sanitized)
      } catch (error) {
        console.error('Failed to fetch attendance:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttendance()
  }, [currentRange])

  const daysInRange = useMemo(() => {
    return eachDayOfInterval({ start: currentRange.start, end: currentRange.end })
  }, [currentRange])

  const selectedTeacher = useMemo(() => 
    teachers.find(t => t.id === selectedTeacherId), 
  [teachers, selectedTeacherId])

  // --- Actions ---
  const handleMarkAttendance = async (teacherId: string, date: string, status: string, substituteCount?: number) => {
    try {
      await markAttendance(teacherId, date, status, substituteCount)
      toast.success('Record Standardized')
      const data = await getTeacherAttendance(currentRange.start, currentRange.end)
      setAttendanceData(data)
    } catch (error) {
      toast.error('Registry Error')
    }
  }

  const handleAddEvent = async (teacherId: string, date: string, type: string, label: string, info?: string) => {
    try {
      await addAttendanceEvent(teacherId, date, { type, label, info })
      toast.success(`${type} Logged`)
      const data = await getTeacherAttendance(currentRange.start, currentRange.end)
      setAttendanceData(data)
    } catch (error) {
      toast.error('Logging Error')
    }
  }

  const handleRemoveEvent = async (teacherId: string, date: string, index: number) => {
    try {
      const record = attendanceData.find(a => a.teacherId === teacherId && isSameDay(new Date(a.date), new Date(date)))
      if (!record || !Array.isArray(record.details)) return
      
      const newDetails = [...record.details]
      const removedEvent = newDetails.splice(index, 1)[0]
      
      let newCount = record.substituteCount || 0
      if (removedEvent.type === 'Substitution') {
        newCount = Math.max(0, newCount - 1)
      }

      await markAttendance(teacherId, date, record.status, newCount, newDetails)
      toast.success('Event Removed')
      const data = await getTeacherAttendance(currentRange.start, currentRange.end)
      setAttendanceData(data)
    } catch (error) {
      toast.error('Removal Error')
    }
  }

  const handleDownloadCsv = () => {
    if (!selectedTeacherId) {
      toast.error('Select a teacher to export their profile')
      return
    }
    const dataRows = daysInRange.map(day => {
      const record = getAttendanceForDay(selectedTeacherId!, day)
      return {
        Date: format(day, 'yyyy-MM-dd'),
        Name: selectedTeacher?.name,
        Status: record?.status || 'Unmarked',
        Substitutions: record?.substituteCount || 0
      }
    })

    const csvContent = [
      ['Date', 'Teacher', 'Registry Status', 'Extra Class/Substitutions'],
      ...dataRows.map(r => [r.Date, r.Name, r.Status, r.Substitutions])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const safeName = (selectedTeacher?.name || 'teacher').replace(/ /g, '_')
    link.setAttribute("download", `attendance_registry_${safeName}_${format(currentDate, 'MMM_yyyy')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Registry export generated')
  }

  const handlePrintPdf = () => {
    window.print()
  }

  const getAttendanceForDay = (teacherId: string, day: Date) => {
    if (!teacherId || !day) return null
    return attendanceData.find(a => 
      a.teacherId === teacherId && 
      a.date && isSameDay(new Date(a.date), day)
    )
  }

  const getTeacherStats = (teacherId: string) => {
    if (!teacherId) return { present: 0, absent: 0, late: 0, leave: 0, substitutions: 0 }
    const teacherRecords = attendanceData.filter(a => a.teacherId === teacherId)
    return {
      present: teacherRecords.filter(r => r.status === 'Present').length,
      absent: teacherRecords.filter(r => r.status === 'Absent').length,
      late: teacherRecords.filter(r => r.status === 'Late').length,
      leave: teacherRecords.filter(r => r.status === 'Leave').length,
      substitutions: teacherRecords.reduce((sum, r) => sum + (r.substituteCount || 0), 0)
    }
  }

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
    } else {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1))
    }
  }

  return (
    <motion.div 
      className="space-y-6 print:space-y-0"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Header section - Main Dashboard View */}
      <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between print:hidden">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl tracking-normal text-foreground font-normal">
            Attendance Registry
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-normal opacity-80 leading-relaxed">
            Institutional tracking system for academic engagement, extra-load (substitutions), and professional faculty attendance auditing.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 items-end">
          <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-2xl border border-primary/5">
            <button 
              onClick={() => setViewMode('month')}
              className={cn(
                "px-6 py-2 text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all font-normal",
                viewMode === 'month' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              Monthly Perspective
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={cn(
                "px-6 py-2 text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all font-normal",
                viewMode === 'week' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              Weekly Zoom
            </button>
          </div>

          <div className="flex items-center gap-4 bg-card border px-5 py-2.5 rounded-2xl border-primary/5 shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} className="h-9 w-9 hover:bg-primary/5 rounded-full">
              <ChevronLeft className="w-4 h-4 opacity-50" />
            </Button>
            <div className="flex items-center gap-3 min-w-[180px] justify-center">
              <Calendar className="w-4 h-4 text-primary opacity-40" />
              <span className="text-[10px] tracking-[0.25em] uppercase opacity-70 font-normal">{currentRange.label}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} className="h-9 w-9 hover:bg-primary/5 rounded-full">
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Registry */}
      <div className="grid gap-8 lg:grid-cols-4 print:grid-cols-1">
        {/* Faculty Directory - Hidden in print */}
        <motion.div variants={STAGGER_ITEM} className="lg:col-span-1 space-y-6 print:hidden">
          <Card className="border-primary/5 shadow-premium overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/5 border-b border-primary/5 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal opacity-60">Faculty Roster</span>
                <Users className="w-4 h-4 text-muted-foreground opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-1.5 max-h-[700px] overflow-y-auto scrollbar-thin">
              {teachers.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-premium text-left hover:bg-muted/30 group",
                    selectedTeacherId === teacher.id ? "bg-primary/5 border border-primary/10 shadow-sm" : "border border-transparent"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-primary/5 group-hover:scale-105 transition-transform">
                    <AvatarImage src={teacher.avatar} />
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-normal">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className={cn("text-sm font-serif truncate font-normal leading-tight", selectedTeacherId === teacher.id ? "text-primary" : "text-foreground")}>
                      {teacher.name}
                    </p>
                    <p className="text-[9px] uppercase tracking-tighter opacity-40 font-normal">{teacher.employeeId}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Registry Table */}
        <motion.div variants={STAGGER_ITEM} className="lg:col-span-3 space-y-6">
          {selectedTeacher ? (
            <Card className="border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden bg-card/60 backdrop-blur-xl">
              <CardHeader className="border-b border-primary/5 bg-muted/5 p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-xl">
                      <AvatarImage src={selectedTeacher.avatar} />
                      <AvatarFallback className="font-serif bg-primary/5 text-primary text-2xl font-normal">
                        {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-2xl font-normal leading-none">{selectedTeacher.name}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-normal border-primary/10 opacity-60">Faculty Member</Badge>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.2em] font-normal opacity-50">
                        Institutional ID: {selectedTeacher.employeeId} — Academic Record for {currentRange.label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 print:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl px-6 h-11 gap-3 font-normal text-[10px] uppercase tracking-widest border-primary/10">
                          <Download className="w-4 h-4 mr-2" /> Export Audit
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-premium border-primary/5 p-2">
                        <DropdownMenuItem onClick={handleDownloadCsv} className="gap-3 cursor-pointer py-3 rounded-xl font-normal">
                          <span className="text-xs">Download spreadsheet (CSV)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePrintPdf} className="gap-3 cursor-pointer py-3 rounded-xl font-normal">
                          <span className="text-xs">Download document (PDF)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex gap-10 mt-6 pt-6 border-t border-primary/5">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-normal tracking-widest">Attendance Share</span>
                    <span className="text-2xl font-serif text-success font-normal">
                      {daysInRange.length > 0 
                        ? Math.round((getTeacherStats(selectedTeacher.id).present / daysInRange.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-normal tracking-widest">Extra Load (Subs)</span>
                    <span className="text-2xl font-serif text-primary font-normal">{getTeacherStats(selectedTeacher.id).substitutions}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-normal tracking-widest">Late Entries</span>
                    <span className="text-2xl font-serif text-warning font-normal">{getTeacherStats(selectedTeacher.id).late}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10 border-b border-primary/5 h-16">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="w-[200px] text-[11px] uppercase tracking-[0.2em] pl-10 font-normal text-muted-foreground opacity-60">Calendar Cycle</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-[0.2em] font-normal text-muted-foreground opacity-60">Registry Status</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-[0.2em] font-normal text-muted-foreground opacity-60">Extra Classes (Substitution)</TableHead>
                        <TableHead className="text-right pr-10 text-[11px] uppercase tracking-[0.2em] font-normal text-muted-foreground opacity-60 print:hidden">Audit Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daysInRange.map((day) => {
                        const record = getAttendanceForDay(selectedTeacher.id, day)
                        const isWeekendDay = isWeekend(day)
                        const isoDate = format(day, 'yyyy-MM-dd')
                        const isExpanded = expandedDay === isoDate
                        const details = Array.isArray(record?.details) ? record.details : []
                        
                        return (
                          <React.Fragment key={isoDate}>
                            <TableRow className={cn(
                              "group transition-premium border-b border-primary/5 hover:bg-primary/[0.01] h-20 cursor-pointer",
                              isToday(day) && "bg-primary/[0.03]",
                              isExpanded && "bg-primary/[0.02]"
                            )} onClick={() => setExpandedDay(isExpanded ? null : isoDate)}>
                              <TableCell className="pl-10">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-1 h-10 rounded-full transition-all",
                                    isExpanded ? "bg-primary scale-x-150" : "bg-transparent"
                                  )} />
                                  <div className="flex flex-col">
                                    <span className={cn("text-sm font-serif", isWeekendDay ? "opacity-30" : "text-foreground")}>
                                      {format(day, 'EEEE, MMM d')}
                                    </span>
                                    {isToday(day) && <span className="text-[8px] uppercase tracking-[0.3em] text-primary mt-1 font-normal animate-pulse">Current Cycle</span>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {record ? (
                                  <div className={cn(
                                    "inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest border border-transparent font-normal transition-all",
                                    record.status === 'Present' && "bg-success/5 text-success border-success/10",
                                    record.status === 'Absent' && "bg-destructive/5 text-destructive border-destructive/10",
                                    record.status === 'Late' && "bg-warning/5 text-warning border-warning/10",
                                    record.status === 'Leave' && "bg-indigo-50 text-indigo-400 border-indigo-100"
                                  )}>
                                    {record.status}
                                  </div>
                                ) : (
                                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-10 group-hover:opacity-40 transition-opacity font-normal">
                                    Awaiting Log
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-5">
                                  <div className={cn(
                                    "px-4 py-1.5 rounded-xl font-serif text-lg transition-all",
                                    (record?.substituteCount || 0) > 0 ? "text-primary bg-primary/5 border border-primary/10" : "text-muted-foreground opacity-20 bg-muted/20"
                                  )}>
                                    {record?.substituteCount || 0}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={cn("text-[9px] uppercase tracking-widest font-normal opacity-40", (record?.substituteCount || 0) > 0 && "opacity-80 text-primary")}>
                                      Extra Academic Loads
                                    </span>
                                    {details.filter((d: any) => d.type === 'Substitution').length > 0 && (
                                      <span className="text-[7px] uppercase tracking-tighter opacity-30">Granular Logs Verified</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-10 print:hidden">
                                <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 px-4 rounded-xl text-[9px] uppercase tracking-widest font-normal border-primary/5 hover:bg-primary/5 gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAuditTarget({ teacherId: selectedTeacher.id, date: isoDate, record })
                                      setIsAuditModalOpen(true)
                                    }}
                                  >
                                    <FileEdit className="w-3.5 h-3.5 opacity-60" /> Audit Registry
                                  </Button>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm" className="h-9 w-9 hover:bg-primary/5 rounded-full text-muted-foreground transition-all">
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-premium border-primary/5 p-1.5 overflow-hidden">
                                      <DropdownMenuLabel className="text-[8px] uppercase tracking-[0.3em] opacity-40 px-4 py-3 font-normal">Institutional Protocols</DropdownMenuLabel>
                                      <DropdownMenuSeparator className="opacity-5" />
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Present')} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-success/5 font-normal">
                                        <CheckCircle2 className="w-4 h-4 text-success opacity-70" /> <span className="text-xs">Professional Presence</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Late')} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-warning/5 font-normal">
                                        <Clock className="w-4 h-4 text-warning opacity-70" /> <span className="text-xs">Late Admission Record</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Leave')} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-indigo-50 font-normal">
                                        <Calendar className="w-4 h-4 text-indigo-400 opacity-70" /> <span className="text-xs">Authorized Academic Leave</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Absent')} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-destructive/5 font-normal">
                                        <XCircle className="w-4 h-4 text-destructive opacity-70" /> <span className="text-xs">Unannounced Absence Log</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {isExpanded && (
                              <TableRow className="bg-muted/5 border-b border-primary/5">
                                <TableCell colSpan={4} className="p-0">
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="px-10 py-6 overflow-hidden"
                                  >
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground opacity-50 font-normal">Daily Granular Timeline</span>
                                        <div className="h-px flex-1 bg-primary/5 mx-6" />
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-[8px] uppercase tracking-widest text-primary font-normal h-7 px-3 rounded-lg hover:bg-primary/5"
                                          onClick={() => {
                                            setAuditTarget({ teacherId: selectedTeacher.id, date: isoDate, record })
                                            setIsAuditModalOpen(true)
                                          }}
                                        >
                                          + Add Log Entry
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {details.length === 0 ? (
                                          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-primary/10 rounded-2xl opacity-40">
                                            <History className="w-8 h-8 mb-3 opacity-20" />
                                            <p className="text-[10px] uppercase tracking-widest font-normal">No Granular Logs for this Cycle</p>
                                          </div>
                                        ) : (
                                          details.map((event: any, idx: number) => (
                                            <div key={idx} className="bg-card border border-primary/5 p-4 rounded-2xl shadow-sm group/event relative">
                                              <div className="flex items-start justify-between">
                                                <div className="flex gap-3">
                                                  <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    event.type === 'Substitution' ? "bg-primary/5 text-primary" : "bg-muted text-muted-foreground"
                                                  )}>
                                                    {event.type === 'Substitution' ? <Users className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                  </div>
                                                  <div className="space-y-0.5">
                                                    <p className="text-xs font-serif font-normal">{event.label}</p>
                                                    <p className="text-[9px] uppercase tracking-widest opacity-40 font-normal">{event.time} — {event.type}</p>
                                                    {event.info && <p className="text-[10px] opacity-60 mt-1 italic font-normal leading-relaxed">{event.info}</p>}
                                                  </div>
                                                </div>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-8 w-8 text-destructive opacity-0 group-hover/event:opacity-40 hover:opacity-100 transition-all rounded-lg"
                                                  onClick={() => handleRemoveEvent(selectedTeacher.id, isoDate, idx)}
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center p-32 border border-primary/5 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-inner-premium transition-premium group print:hidden">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-primary opacity-20" />
              </div>
              <p className="font-serif text-3xl text-foreground opacity-60 font-normal">Select Academic Personnel Profile</p>
              <p className="text-[11px] uppercase tracking-[0.4em] mt-4 opacity-40 font-normal">Secured Registry Access Control Required</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Institutional Stylized Print Overlay */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .lg\\:col-span-3, .lg\\:col-span-3 * {
            visibility: visible;
          }
          .lg\\:col-span-3 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .rounded-\\[2\\.5rem\\] {
            border-radius: 0 !important;
          }
          .shadow-premium {
            box-shadow: none !important;
          }
          .border-primary\\/5 {
            border-color: #eee !important;
          }
          h3.font-serif {
            font-family: 'Times New Roman', serif !important;
            font-size: 32pt !important;
          }
        }
      `}</style>

      {/* Audit Registry Modal - Granular Entry */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-primary/5 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-muted/5 border-b border-primary/5">
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-10 w-10 border border-primary/10">
                <AvatarImage src={selectedTeacher?.avatar} />
                <AvatarFallback>{selectedTeacher?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="font-serif text-xl font-normal">Audit Day Registry</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">
                  {auditTarget ? format(new Date(auditTarget.date), 'EEEE, MMMM do, yyyy') : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="status" className="p-0">
            <div className="px-8 pt-6">
              <TabsList className="bg-muted/10 p-1 rounded-xl h-12 w-full border border-primary/5">
                <TabsTrigger value="status" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-normal data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Registry Status
                </TabsTrigger>
                <TabsTrigger value="event" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-normal data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Add Granular Log
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="status" className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Present', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', label: 'Presence' },
                  { id: 'Late', icon: Clock, color: 'text-warning', bg: 'bg-warning/5', label: 'Late Entry' },
                  { id: 'Leave', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-50', label: 'Authorized Leave' },
                  { id: 'Absent', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5', label: 'Unannounced Absence' },
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      if (auditTarget) handleMarkAttendance(auditTarget.teacherId, auditTarget.date, status.id)
                      setIsAuditModalOpen(false)
                    }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-premium group hover:shadow-md",
                      auditTarget?.record?.status === status.id 
                        ? "border-primary/20 bg-primary/[0.02]" 
                        : "border-primary/5 bg-muted/5 hover:bg-card"
                    )}
                  >
                    <status.icon className={cn("w-6 h-6", status.color, "opacity-70 group-hover:opacity-100 transition-all")} />
                    <span className="text-[10px] uppercase tracking-widest font-normal opacity-60">{status.label}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="event" className="p-8 space-y-6">
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const type = formData.get('type') as string
                const label = formData.get('label') as string
                const info = formData.get('info') as string
                if (auditTarget) {
                  await handleAddEvent(auditTarget.teacherId, auditTarget.date, type, label, info)
                  setIsAuditModalOpen(false)
                }
              }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Event Type</Label>
                    <select 
                      name="type" 
                      className="w-full bg-muted/5 border border-primary/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="Substitution">Institutional Substitution</option>
                      <option value="Late Entry">Verified Late Admission</option>
                      <option value="Note">Institutional Academic Note</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Event Title / Class</Label>
                    <Input name="label" placeholder="e.g. Class 10A (Chemistry)" required className="rounded-xl h-12 border-primary/5 bg-muted/5 focus:bg-card transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Additional Context</Label>
                    <Textarea name="info" placeholder="Context for this action..." className="rounded-xl min-h-[100px] border-primary/5 bg-muted/5 focus:bg-card transition-all" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-[10px] uppercase tracking-[0.2em] font-normal shadow-lg transition-transform active:scale-95">
                  Secure Log Entry
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
