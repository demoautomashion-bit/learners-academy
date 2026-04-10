'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useState, useMemo, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileEdit,
  History,
  Trash2,
  Download,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import { markAttendance, getTeacherAttendance, addAttendanceEvent } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { motion } from 'framer-motion'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'

export default function AttendancePage() {
  const { teachers, isInitialized } = useData()
  const hasMounted = useHasMounted()

  if (!isInitialized || !hasMounted) return <DashboardSkeleton />
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [auditTarget, setAuditTarget] = useState<{ teacherId: string, date: string, record: any } | null>(null)

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
        const sanitized = data?.filter(a => a.date && !isNaN(new Date(a.date).getTime()) && a.teacherId)
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
    const dataRows = daysInRange?.map(day => {
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
      ...dataRows?.map(r => [r.Date, r.Name, r.Status, r.Substitutions])
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
    if (!teacherId || !Array.isArray(attendanceData)) {
      return { present: 0, absent: 0, late: 0, leave: 0, substitutions: 0 }
    }
    const teacherRecords = attendanceData.filter(a => a.teacherId === teacherId)
    return {
      present: teacherRecords.filter(r => r.status === 'Present').length || 0,
      absent: teacherRecords.filter(r => r.status === 'Absent').length || 0,
      late: teacherRecords.filter(r => r.status === 'Late').length || 0,
      leave: teacherRecords.filter(r => r.status === 'Leave').length || 0,
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
    <PageShell>
      <PageHeader 
        title="Attendance Registry"
        description="Institutional tracking system for academic engagement, extra-load (substitutions), and professional faculty attendance auditing."
        actions={
          <div className="flex flex-col gap-4 items-end print:hidden">
            <div className="flex items-center gap-1 bg-muted/20 p-1 border ">
              <button 
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-6 py-2 text-xs transition-all font-normal",
                  viewMode === 'month' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                Monthly Perspective
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-6 py-2 text-xs transition-all font-normal",
                  viewMode === 'week' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                Weekly Zoom
              </button>
            </div>

            <div className="flex items-center gap-4 bg-card border px-5 py-2.5 shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} className="h-9 w-9 hover:bg-primary/5 ">
                <ChevronLeft className="w-4 h-4 opacity-50" />
              </Button>
              <div className="flex items-center gap-3 min-w-[180px] justify-center">
                <Calendar className="w-4 h-4 text-primary opacity-60" />
                <span className="text-xs opacity-80 font-normal">{currentRange.label}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} className="h-9 w-9 hover:bg-primary/5 ">
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Button>
            </div>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-4 print:grid-cols-1 items-stretch">
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <Card className="hover-lift transition-premium h-full flex flex-col">
            <CardHeader className="bg-muted/5 border-b px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-normal opacity-60">Faculty Roster</span>
                <Users className="w-4 h-4 text-muted-foreground opacity-30" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-1.5 max-h-[700px] overflow-y-auto scrollbar-thin flex-1">
              {teachers?.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-3.5 transition-premium text-left hover:bg-muted/30 group",
                    selectedTeacherId === teacher.id ? "bg-primary/5 border shadow-sm" : "border border-transparent"
                  )}
                >
                  <Avatar className="h-10 w-10 border group-hover:scale-105 transition-transform">
                    <AvatarImage src={teacher.avatar} />
                    <AvatarFallback className="text-xs bg-primary/5 text-primary font-normal">
                      {teacher?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className={cn("text-sm font-normal truncate leading-tight", selectedTeacherId === teacher.id ? "text-primary" : "text-foreground")}>
                      {teacher.name}
                    </p>
                    <p className="text-xs opacity-70 font-normal">{teacher.employeeId}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedTeacher ? (
            <Card className="overflow-hidden hover-lift transition-premium h-full flex flex-col">
              <CardHeader className="border-b bg-muted/5 p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-xl">
                      <AvatarImage src={selectedTeacher.avatar} />
                      <AvatarFallback className="bg-primary/5 text-primary text-2xl font-normal">
                        {selectedTeacher?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif leading-none text-xl font-medium">{selectedTeacher.name}</h3>
                        <Badge variant="outline" className="text-xs font-normal opacity-60">Faculty Member</Badge>
                      </div>
                      <p className="text-xs font-normal opacity-70">
                        Institutional ID: {selectedTeacher.employeeId} — Academic Record for {currentRange.label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 print:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-3 font-normal bg-card hover:bg-muted/10">
                          <Download className="w-4 h-4 mr-2" /> Export Audit
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2">
                        <DropdownMenuItem onClick={handleDownloadCsv} className="gap-3 cursor-pointer py-3 font-normal">
                          <span className="text-xs">Download spreadsheet (CSV)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePrintPdf} className="gap-3 cursor-pointer py-3 font-normal">
                          <span className="text-xs">Download document (PDF)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex gap-12 mt-6 pt-6 border-t ">
                  {[
                    { label: 'Present', value: getTeacherStats(selectedTeacher.id).present, color: 'text-success' },
                    { label: 'Absent', value: getTeacherStats(selectedTeacher.id).absent, color: 'text-destructive' },
                    { label: 'Late', value: getTeacherStats(selectedTeacher.id).late, color: 'text-warning' },
                    { label: 'Leave', value: getTeacherStats(selectedTeacher.id).leave, color: 'text-indigo-500' },
                    { label: 'Subs (Load)', value: getTeacherStats(selectedTeacher.id).substitutions, color: 'text-primary' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-start gap-1">
                      <span className="text-xs text-muted-foreground font-normal opacity-80">{stat.label}</span>
                      <span className={cn("text-2xl font-serif font-normal", stat.color)}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10 border-b h-16">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="w-[200px] text-xs pl-10 font-normal text-muted-foreground opacity-80">Calendar</TableHead>
                        <TableHead className="text-xs font-normal text-muted-foreground opacity-80">Status</TableHead>
                        <TableHead className="text-xs font-normal text-muted-foreground opacity-80">Substitutions</TableHead>
                        <TableHead className="text-right pr-10 text-xs font-normal text-muted-foreground opacity-80 print:hidden">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daysInRange?.map((day) => {
                        const record = getAttendanceForDay(selectedTeacher.id, day)
                        const isWeekendDay = isWeekend(day)
                        const isoDate = format(day, 'yyyy-MM-dd')
                        const isExpanded = expandedDay === isoDate
                        const details = Array.isArray(record?.details) ? record.details : []
                        
                        return (
                          <React.Fragment key={isoDate}>
                            <TableRow className={cn(
                              "group transition-premium border-b hover:bg-primary/[0.01] h-20 cursor-pointer",
                              isToday(day) && "bg-primary/[0.03]",
                              isExpanded && "bg-primary/[0.02]"
                            )} onClick={() => setExpandedDay(isExpanded ? null : isoDate)}>
                              <TableCell className="pl-10">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-1 h-10 transition-all",
                                    isExpanded ? "bg-primary scale-x-150" : "bg-transparent"
                                  )} />
                                  <div className="flex flex-col">
                                    <span className={cn("text-sm font-normal", isWeekendDay ? "opacity-30" : "text-foreground")}>
                                      {format(day, 'EEEE, MMM d')}
                                    </span>
                                    {isToday(day) && <span className="text-xs text-primary mt-1 font-normal animate-pulse">Current Cycle</span>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {record ? (
                                  <div className={cn(
                                    "inline-flex items-center gap-2.5 px-3.5 py-1.5 text-xs border border-transparent font-normal transition-all",
                                    record.status === 'Present' && "bg-success/5 text-success border-success/10",
                                    record.status === 'Absent' && "bg-destructive/5 text-destructive border-destructive/10",
                                    record.status === 'Late' && "bg-warning/5 text-warning border-warning/10",
                                    record.status === 'Leave' && "bg-indigo-50 text-indigo-400 border-indigo-100"
                                  )}>
                                    {record.status}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground opacity-10 group-hover:opacity-40 transition-opacity font-normal">
                                    Awaiting Log
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-5">
                                  <div className={cn(
                                    "px-4 py-1.5 font-sans text-lg transition-all",
                                    (record?.substituteCount || 0) > 0 ? "text-primary bg-primary/5 border " : "text-muted-foreground opacity-20 bg-muted/20"
                                  )}>
                                    {record?.substituteCount || 0}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={cn("text-xs font-normal opacity-70", (record?.substituteCount || 0) > 0 && "opacity-90 text-primary")}>
                                      Institutional Substitutions
                                    </span>
                                    {details?.filter((d: any) => d.type === 'Substitution').length > 0 && (
                                      <span className="text-xs opacity-30 font-normal">Granular Logs Verified</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-10 print:hidden">
                                <div className="flex items-center justify-end gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="outline" size="sm" className="w-10 hover:bg-primary/5 shadow-sm transition-all">
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
                                      <DropdownMenuLabel className="text-xs opacity-60 px-4 py-3 font-normal">Registry Protocols</DropdownMenuLabel>
                                      <DropdownMenuSeparator className="opacity-10" />
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Present')} className="gap-3 cursor-pointer py-3 focus:bg-success/5 font-normal">
                                        <CheckCircle2 className="w-4 h-4 text-success opacity-80" /> <span className="text-xs">Professional Presence</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Late')} className="gap-3 cursor-pointer py-3 focus:bg-warning/5 font-normal">
                                        <Clock className="w-4 h-4 text-warning opacity-80" /> <span className="text-xs">Late Admission Record</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleAddEvent(selectedTeacher.id, isoDate, 'Substitution', 'Standard Institutional Substitution', 'System-Logged Action')
                                        }} 
                                        className="gap-3 cursor-pointer py-3 focus:bg-primary/5 font-normal text-primary"
                                      >
                                        <Users className="w-4 h-4 opacity-80" /> <span className="text-xs">Institutional Substitution</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Leave')} className="gap-3 cursor-pointer py-3 focus:bg-indigo-50 font-normal">
                                        <Calendar className="w-4 h-4 text-indigo-400 opacity-80" /> <span className="text-xs">Authorized Academic Leave</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleMarkAttendance(selectedTeacher.id, isoDate, 'Absent')} className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 font-normal">
                                        <XCircle className="w-4 h-4 text-destructive opacity-80" /> <span className="text-xs">Unannounced Absence Log</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="opacity-10" />
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setAuditTarget({ teacherId: selectedTeacher.id, date: isoDate, record })
                                          setIsAuditModalOpen(true)
                                        }} 
                                        className="gap-3 cursor-pointer py-3 focus:bg-muted font-normal"
                                      >
                                        <FileEdit className="w-4 h-4 opacity-80" /> <span className="text-xs">Detailed Academic Audit</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {isExpanded && (
                              <TableRow className="bg-muted/5 border-b ">
                                <TableCell colSpan={4} className="p-0">
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="px-10 py-6 overflow-hidden"
                                  >
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground opacity-50 font-normal">Daily Granular Timeline</span>
                                        <div className="h-px flex-1 bg-primary/5 mx-6" />
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="font-normal hover:bg-primary/5"
                                          onClick={() => {
                                            setAuditTarget({ teacherId: selectedTeacher.id, date: isoDate, record })
                                            setIsAuditModalOpen(true)
                                          }}
                                        >
                                          + Add Log Entry
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                                        {details.length === 0 ? (
                                          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed opacity-40">
                                            <History className="w-8 h-8 mb-3 opacity-20" />
                                            <p className="text-xs font-normal">No Granular Logs for this Cycle</p>
                                          </div>
                                        ) : (
                                          details?.map((event: any, idx: number) => (
                                            <div key={idx} className="bg-card border p-4 shadow-sm group/event relative">
                                              <div className="flex items-start justify-between">
                                                <div className="flex gap-3">
                                                  <div className={cn(
                                                    "w-8 h-8 flex items-center justify-center shrink-0",
                                                    event.type === 'Substitution' ? "bg-primary/5 text-primary" : "bg-muted text-muted-foreground"
                                                  )}>
                                                    {event.type === 'Substitution' ? <Users className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                  </div>
                                                  <div className="space-y-0.5">
                                                    <p className="text-xs font-normal">{event.label}</p>
                                                    <p className="text-xs opacity-40 font-normal">{event.time} — {event.type}</p>
                                                    {event.info && <p className="text-xs opacity-60 mt-1 italic font-normal leading-relaxed">{event.info}</p>}
                                                  </div>
                                                </div>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="w-8 opacity-0 group-hover/event:opacity-40 hover:opacity-100 transition-all "
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
            <div className="flex flex-col items-center justify-center p-32 border shadow-inner-premium transition-premium group print:hidden">
              <div className="w-24 h-24 bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-primary opacity-20" />
              </div>
              <p className="font-serif text-3xl text-foreground opacity-60 font-normal">Select Academic Personnel Profile</p>
              <p className="text-xs mt-4 opacity-40 font-normal">Secured Registry Access Control Required</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="sm:max-w-[500px] shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-muted/5 border-b ">
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-10 w-10 border ">
                <AvatarImage src={selectedTeacher?.avatar} />
                <AvatarFallback>{selectedTeacher?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="font-serif text-xl font-normal">Granular Academic Audit</DialogTitle>
                <DialogDescription className="text-xs opacity-80">
                  {auditTarget ? format(new Date(auditTarget.date), 'EEEE, MMMM do, yyyy') : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const academyClass = formData.get('academyClass') as string
              const timing = formData.get('timing') as string
              const info = formData.get('info') as string
              if (auditTarget) {
                await handleAddEvent(auditTarget.teacherId, auditTarget.date, 'Substitution', `${academyClass} (${timing})`, info)
                setIsAuditModalOpen(false)
              }
            }} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs opacity-70 ml-1">Academy Classes</Label>
                  <select 
                    name="academyClass" 
                    required
                    className="w-full bg-muted/5 border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="" disabled selected>Select Level/Class</option>
                    {ACADEMY_LEVELS?.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs opacity-70 ml-1">Class Timing (1-Hour Slot)</Label>
                  <select 
                    name="timing" 
                    required
                    className="w-full bg-muted/5 border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="" disabled selected>Select Attendance Slot</option>
                    {SESSION_TIMINGS?.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs opacity-70 ml-1">Additional Context</Label>
                  <Textarea name="info" placeholder="Context for this action..." className="min-h-[100px] bg-muted/5 focus:bg-card transition-all font-normal" />
                </div>
              </div>
              <Button type="submit" className="w-full font-normal shadow-lg transition-transform active:scale-95">
                Secure Log Entry
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
