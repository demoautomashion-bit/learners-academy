'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
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
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronRight,
  AlertTriangle,
  LayoutGrid,
  History,
  Plus,
  ArrowRight,
  X,
  Users,
  Sparkles,
  Command
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'
import { SCHEDULE_SLOTS } from '@/lib/registry'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalScheduleHubPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, teachers, schedules, addSchedule, removeSchedule, isInitialized } = useData()
  
  const [selectedSlot, setSelectedSlot] = useState<{ roomId: string, slotId: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [assignmentData, setAssignmentData] = useState({
    courseId: '',
    teacherId: ''
  })

  // Static Room Registry
  const rooms = [
    { id: '301', name: 'Room 301', capacity: 25, type: 'Lecturing' },
    { id: '302', name: 'Room 302', capacity: 20, type: 'Phonetics Lab' },
    { id: '303', name: 'Room 303', capacity: 15, type: 'Focus Group' },
    { id: '304', name: 'Room 304', capacity: 30, type: 'Main Hall' },
  ]

  const stats = useMemo(() => [
      { label: 'Room Utilization', value: '72%', sub: 'Institutional Capacity', icon: LayoutGrid, color: 'text-primary' },
      { label: 'Active Sessions', value: schedules.length, sub: 'Current Hour', icon: Clock, color: 'text-success' },
  ], [schedules])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleSlotClick = (roomId: string, slotId: string) => {
    setSelectedSlot({ roomId, slotId })
    setIsDialogOpen(true)
  }

  const handleAssign = async () => {
    if (!assignmentData.courseId || !assignmentData.teacherId || !selectedSlot) {
        toast.error("Incomplete Protocol", { description: "Please select both a batch and a teacher." })
        return
    }

    const course = courses.find(c => c.id === assignmentData.courseId)
    const teacher = teachers.find(t => t.id === assignmentData.teacherId)
    const slot = SCHEDULE_SLOTS.find(s => s.id === selectedSlot.slotId)

    try {
        await addSchedule({
            id: crypto.randomUUID(),
            classTitle: course?.title || course?.name || 'Untitled Batch',
            teacherName: teacher?.name || 'Unassigned',
            timing: slot?.time || 'Timing TBD',
            roomNumber: selectedSlot.roomId,
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slotId: selectedSlot.slotId
        })
        
        setIsDialogOpen(false)
        setAssignmentData({ courseId: '', teacherId: '' })
        toast.active("Temporal Slot Allocated", {
            description: `Batch ${course?.title || course?.name} assigned to Room ${selectedSlot.roomId}`,
            icon: <Sparkles className="w-4 h-4 text-primary" />
        })
    } catch (error) {
        toast.error("Schedule Synchronization Failed")
    }
  }

  const handleRetract = async (scheduleId: string) => {
     if (confirm("Retract this instructional assignment?")) {
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
        title="Schedules"
        description="Manage room assignments and class timings."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => (
            <Card key={i} className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl relative isolate group">
                <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
                <CardHeader className="p-8">
                    <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">{stat.label}</CardDescription>
                    <div className="flex items-end justify-between mt-6">
                        <CardTitle className={cn("text-3xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                        <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                </CardHeader>
            </Card>
         ))}
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
                <h3 className="font-serif text-2xl font-medium tracking-tight">Schedule Matrix</h3>
                <p className="text-xs text-muted-foreground opacity-40 italic">Active Room Utilization across class timings.</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
                <Command className="w-4 h-4 text-primary opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40">Conflict Detection Enabled</span>
            </div>
        </div>

        {/* The Matrix */}
        <div className="relative overflow-x-auto rounded-[2.5rem] border border-primary/5 glass-1 shadow-2xl">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-primary/[0.02] border-b border-primary/5">
                        <th className="sticky left-0 z-20 bg-background/95 backdrop-blur-md p-10 text-left min-w-[240px] border-r border-primary/5">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Institutional Architecture</span>
                        </th>
                        {SCHEDULE_SLOTS.map((slot) => (
                            <th key={slot.id} className="p-10 text-center min-w-[280px] border-r border-primary/5 last:border-0">
                                <div className="flex flex-col items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary opacity-40 mb-1" />
                                    <span className="text-xs font-bold font-mono tracking-tight">{slot.time}</span>
                                    <Badge variant="outline" className="text-[8px] font-black opacity-40 uppercase tracking-widest border-primary/10">Slot {slot.id}</Badge>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                        <tr key={room.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.01] transition-colors">
                            <td className="sticky left-0 z-10 bg-background/95 backdrop-blur-md p-10 border-r border-primary/5 group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-muted/20 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium">{room.name}</span>
                                        <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">{room.type}</span>
                                    </div>
                                </div>
                            </td>
                            {SCHEDULE_SLOTS.map((slot) => {
                                const assignment = schedules.find(s => s.roomNumber === room.id && s.slotId === slot.id)
                                return (
                                    <td key={slot.id} className="p-4 border-r border-primary/5 last:border-0 group/cell">
                                        {assignment ? (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative h-full min-h-[140px] p-6 rounded-[1.75rem] bg-primary/5 border border-primary/10 shadow-sm flex flex-col justify-between group/assigned overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] uppercase tracking-[0.2em] font-black text-primary opacity-60">Allocated Unit</span>
                                                        <button 
                                                            onClick={() => handleRetract(assignment.id)}
                                                            className="opacity-0 group-hover/assigned:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-bold leading-snug">{assignment.classTitle}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/5">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Users className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[11px] font-medium opacity-70 whitespace-nowrap overflow-hidden text-ellipsis">{assignment.teacherName}</span>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <button 
                                                onClick={() => handleSlotClick(room.id, slot.id)}
                                                className="w-full h-full min-h-[140px] rounded-[1.75rem] border border-dashed border-primary/10 hover:border-primary/40 hover:bg-primary/[0.02] flex flex-col items-center justify-center gap-3 transition-all group/empty opacity-30 hover:opacity-100"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center group-hover/empty:scale-110 transition-transform">
                                                    <Plus className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest font-black opacity-30 group-hover/empty:opacity-80">Assign Class</span>
                                            </button>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="p-10 md:p-14 space-y-12">
                <DialogHeader>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase font-black text-primary mb-4 w-fit">
                        <Sparkles className="w-3.5 h-3.5" /> Assignment
                    </div>
                    <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Assign Class</DialogTitle>
                    <DialogDescription className="text-xs opacity-40 font-normal leading-relaxed">
                        Assign a class and teacher to Room {selectedSlot?.roomId} at {SCHEDULE_SLOTS.find(s => s.id === selectedSlot?.slotId)?.time}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1 group-focus-within:text-primary transition-colors">Target Batch</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, courseId: v }))}>
                            <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-6 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Identify Instructional Unit" />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5 p-2">
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id} className="rounded-xl py-3 focus:bg-primary/5">{course.title || course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 group text-left">
                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1 group-focus-within:text-primary transition-colors text-left">Faculty Lead</Label>
                        <Select onValueChange={(v) => setAssignmentData(prev => ({ ...prev, teacherId: v }))}>
                            <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-6 text-sm font-medium focus:ring-primary/20">
                                <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                            <SelectContent className="glass-2 border-white/5 p-2">
                                {teachers.filter(t => t.status === 'active').map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id} className="rounded-xl py-3 focus:bg-primary/5">{teacher.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-5 pt-4">
                    <Button 
                        onClick={handleAssign}
                        className="w-full h-16 bg-primary hover:bg-primary/95 text-white rounded-[1.75rem] shadow-2xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3 relative overflow-hidden group/submit"
                    >
                        <span className="relative z-10 flex items-center gap-2">Confirm Assignment <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-2 transition-transform" /></span>
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
