'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Clock,
  MapPin,
  Users,
  LayoutGrid,
  Plus,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
  BarChart,
  Command,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'
import { SCHEDULE_SLOTS } from '@/lib/registry'

export default function GlobalScheduleHubPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, teachers, schedules, addSchedule, removeSchedule, isInitialized } = useData()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [assignmentData, setAssignmentData] = useState({
    slotId: '',
    courseId: '',
    teacherId: '',
    roomId: ''
  })

  // Static Room Registry
  const rooms = [
    { id: '301', name: 'Room 301', capacity: 25, type: 'Lecturing' },
    { id: '302', name: 'Room 302', capacity: 20, type: 'Phonetics Lab' },
    { id: '303', name: 'Room 303', capacity: 15, type: 'Focus Group' },
    { id: '304', name: 'Room 304', capacity: 30, type: 'Main Hall' },
  ]

  const stats = useMemo(() => [
      { label: 'Total Assignments', value: schedules.length, sub: 'Active Schedules', icon: LayoutGrid, color: 'text-primary' },
      { label: 'Active Sessions', value: schedules.length, sub: 'Current Protocol', icon: Clock, color: 'text-success' },
      { label: 'System Capacity', value: (rooms.length * SCHEDULE_SLOTS.length) - schedules.length, sub: 'Available Slots', icon: CheckCircle2, color: 'text-indigo-400' },
      { label: 'Room Utilization', value: Math.round((schedules.length / (rooms.length * SCHEDULE_SLOTS.length)) * 100) + '%', sub: 'Institutional Load', icon: BarChart, color: 'text-amber-500' },
  ], [schedules, rooms.length])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleCreateAssignment = () => {
    setAssignmentData({ slotId: '', courseId: '', teacherId: '', roomId: '' })
    setIsDialogOpen(true)
  }

  const handleAssign = async () => {
    if (!assignmentData.courseId || !assignmentData.teacherId || !assignmentData.slotId || !assignmentData.roomId) {
        toast.error("Incomplete Protocol", { description: "Please completely populate all slot assignment fields." })
        return
    }

    const course = courses.find(c => c.id === assignmentData.courseId)
    const teacher = teachers.find(t => t.id === assignmentData.teacherId)
    const slot = SCHEDULE_SLOTS.find(s => s.id === assignmentData.slotId)
    const room = rooms.find(r => r.id === assignmentData.roomId)

    try {
        await addSchedule({
            id: crypto.randomUUID(),
            classTitle: course?.title || course?.name || 'Untitled Batch',
            teacherName: teacher?.name || 'Unassigned',
            timing: slot?.time || 'Timing TBD',
            roomNumber: room?.id || 'TBD',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slotId: assignmentData.slotId
        })
        
        setIsDialogOpen(false)
        toast.active("Temporal Slot Allocated", {
            description: `Batch ${course?.title || course?.name} assigned to Slot ${slot?.id}`,
            icon: <Sparkles className="w-4 h-4 text-primary" />
        })
    } catch (error) {
        toast.error("Schedule Synchronization Failed")
    }
  }

  const handleRetract = async (scheduleId: string) => {
     if (confirm("Retract this instructional assignment from the slot?")) {
        try {
            await removeSchedule(scheduleId)
            toast.success("Assignment Retracted")
        } catch (error) {
            toast.error("Recalibration Failed")
        }
     }
  }

  return (
    <PageShell>
      <PageHeader 
        title="Schedule Hub"
        description="Master orchestration of physical rooms, instructional timing, and faculty deployment."
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[1.5rem] transition-premium group relative isolate">
            <div className="absolute right-[-10%] top-[-10%] w-20 h-20 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                     <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</CardDescription>
                     <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                </div>
                <CardTitle className={cn("text-3xl font-serif font-medium tracking-tight", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-30 mt-2 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={4}
      />

      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
                <h3 className="font-serif text-2xl font-medium tracking-tight">Active Temporal Slots</h3>
                <p className="text-xs text-muted-foreground opacity-40 italic">Modular temporal buckets packed with daily active operations.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-6 py-2.5 bg-primary/5 border border-primary/10 rounded-xl hidden md:flex">
                    <Command className="w-4 h-4 text-primary opacity-60" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40">Modular Layout Active</span>
                </div>
                
                <Button onClick={handleCreateAssignment} className="font-medium bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all h-11 px-8 rounded-xl font-normal">
                    <Plus className="w-4 h-4 mr-2" /> Assign Class to Slot
                </Button>
            </div>
        </div>

        {/* Dynamic Slot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SCHEDULE_SLOTS.map((slot) => {
                const assignedClasses = schedules.filter(s => s.slotId === slot.id)
                
                return (
                    <Card key={slot.id} className="glass-1 hover-lift border-primary/10 shadow-premium overflow-hidden rounded-[2rem] flex flex-col relative h-full">
                        {/* Slot Header */}
                        <div className="p-6 pb-4 border-b border-primary/5 bg-primary/[0.01]">
                            <div className="flex items-start justify-between mb-2">
                                <div className="space-y-1">
                                    <h4 className="font-serif font-bold text-xl text-primary">Slot {slot.id}</h4>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-mono tracking-widest uppercase font-bold">{slot.time}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] uppercase font-black opacity-50 px-2 py-0.5">
                                    {assignedClasses.length} Active
                                </Badge>
                            </div>
                        </div>
                        
                        {/* Slot Body: Packed Classes */}
                        <div className="p-6 flex-1 bg-background/30 flex flex-col gap-3">
                            {assignedClasses.length > 0 ? (
                                assignedClasses.map(assignment => (
                                    <div key={assignment.id} className="relative group p-4 rounded-2xl border border-primary/5 bg-background shadow-sm hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-serif font-medium leading-tight text-sm pr-6">{assignment.classTitle}</span>
                                            <button 
                                                onClick={() => handleRetract(assignment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3 h-3 text-indigo-400 opacity-80" />
                                                <span className="text-[10px] opacity-70 uppercase tracking-widest font-black truncate max-w-[100px]">{assignment.teacherName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-amber-500 opacity-80" />
                                                <span className="text-[10px] opacity-70 uppercase tracking-widest font-black text-amber-600 dark:text-amber-500">Room {assignment.roomNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center opacity-30 h-full min-h-[120px] rounded-2xl border border-dashed border-primary/10">
                                    <LayoutGrid className="w-6 h-6 mb-2 text-primary" />
                                    <p className="text-[10px] uppercase font-black tracking-widest">Temporal Void</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )
            })}
        </div>
      </div>

      {/* Modern Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="p-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl font-medium tracking-tight">Assign to Slot</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Select Temporal Slot */}
                    <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Target Slot</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, slotId: v }))}>
                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Select Temporal Slot..." />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5">
                                {SCHEDULE_SLOTS.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>Slot {slot.id} / {slot.time}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Select Class */}
                    <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Class</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, courseId: v }))}>
                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Select class..." />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5">
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>{course.title || course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Select Teacher */}
                    <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Teacher</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, teacherId: v }))}>
                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Select teacher..." />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5">
                                {teachers.filter(t => t.status === 'active').map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Select Room */}
                    <div className="space-y-2 group">
                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1 group-focus-within:text-primary transition-colors">Room Assignment</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, roomId: v }))}>
                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Select room..." />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5">
                                {rooms.map((room) => (
                                    <SelectItem key={room.id} value={room.id}>{room.name} ({room.type})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button 
                        onClick={handleAssign}
                        className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-2 relative overflow-hidden group/submit"
                    >
                        <span className="relative z-10 flex items-center gap-2">Initialize Slot Assignment <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/submit:animate-shimmer" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsDialogOpen(false)} 
                        className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 hover:opacity-100 h-10"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
