'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Plus,
  Search,
  MoreVertical,
  LayoutGrid,
  Users,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Course } from '@/lib/types'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'

export default function ClassesPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, teachers, removeCourse, addCourse, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Local form state for batch initialization
  const [formData, setFormData] = useState({
    teacherId: '',
    level: '',
    timing: '',
    roomNumber: ''
  })

  const activeTeachers = (teachers || []).filter(t => t.status === 'active')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course =>
    (course.title || course.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.teacherName || course.instructorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.level || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInitialize = async () => {
    if (!formData.teacherId || !formData.level || !formData.timing || !formData.roomNumber) {
        toast.error("Incomplete Batch Protocol", { description: "Please populate all logistical fields." })
        return
    }

    const selectedTeacher = activeTeachers.find(t => t.id === formData.teacherId)
    
    try {
        await addCourse({
            id: crypto.randomUUID(),
            title: `${formData.level} - ${formData.timing}`,
            description: `Instructional cycle for ${formData.level} tier.`,
            level: formData.level as any,
            teacherId: formData.teacherId,
            teacherName: selectedTeacher?.name || 'Unassigned',
            capacity: 25,
            status: 'active',
            schedule: 'Mon, Tue, Wed, Thu, Fri',
            duration: '90 Days',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            roomNumber: formData.roomNumber,
            feeAmount: 5000
        } as any)
        
        setIsDialogOpen(false)
        setFormData({ teacherId: '', level: '', timing: '', roomNumber: '' })
        toast.active("Instructional Cycle Initialized", {
            description: "New academic batch has been formalized in the registry.",
            icon: <Sparkles className="w-4 h-4 text-primary" />
        })
    } catch (error) {
        toast.error("Initialization Failed")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      try {
        await removeCourse(id)
        toast.success("Class deleted")
      } catch (error) {
        toast.error("Error deleting class")
      }
    }
  }

  const columns: Column<Course>[] = [
    {
      label: 'Batch Identity',
      render: (course) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{course.title || course.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">{course.level} Tier</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Teacher',
      render: (course) => (
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40" />
            <span className="text-xs font-normal">{course.teacherName || course.instructorName || 'Unassigned'}</span>
        </div>
      )
    },
    {
      label: 'Schedule Context',
      render: (course) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                <Clock className="w-3 h-3" />
                <span>{course.schedule || 'Operational Hours TBD'}</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                <MapPin className="w-3 h-3" />
                <span>Room {course.roomNumber || 'TBD'}</span>
           </div>
        </div>
      )
    },
    {
        label: 'Financial Parameter',
        render: (course) => (
          <span className="text-xs font-serif">PKR {(course as any).feeAmount?.toLocaleString() || (course as any).fee?.toLocaleString()} <span className="text-[9px] opacity-40 uppercase">/ Month</span></span>
        )
    },
    {
      label: 'Actions',
      render: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 glass-2 border-white/5 shadow-2xl overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => router.push(`/admin/classes/schedule?id=${course.id}`)}
               className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal rounded-lg"
            >
              <Calendar className="w-4 h-4 opacity-60" /> <span className="text-xs">Schedule</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal rounded-lg">
              <Users className="w-4 h-4 opacity-60" /> <span className="text-xs">Students</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(course.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal rounded-lg"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Delete Class</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Total Classes', value: (courses || []).length, sub: 'Active batches', icon: LayoutGrid, color: 'text-primary' },
    { label: 'Active Teachers', value: activeTeachers.length, sub: 'Faculty working', icon: Users, color: 'text-success' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Classes"
        description="Manage classes, rooms, and teacher assignments."
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all h-11 px-8 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> Add Class
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="p-8 md:p-12 space-y-10">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Add Class</DialogTitle>
                        <DialogDescription className="text-xs opacity-40 font-normal leading-relaxed">
                            Create a new class for a teacher and a room.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        {/* Faculty & Academic Identification */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-primary rounded-full" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Educational Setup</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-30 ml-1">Assigned Teacher</Label>
                                    <Select onValueChange={(v) => setFormData(prev => ({ ...prev, teacherId: v }))}>
                                        <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl px-5 text-sm">
                                            <SelectValue placeholder="Select Faculty Lead" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-2 border-white/5">
                                            {activeTeachers.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-30 ml-1">Academic Level</Label>
                                    <Select onValueChange={(v) => setFormData(prev => ({ ...prev, level: v }))}>
                                        <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl px-5 text-sm">
                                            <SelectValue placeholder="Institutional Tier" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-2 border-white/5">
                                            {ACADEMY_LEVELS.map((level) => (
                                                <SelectItem key={level} value={level}>{level}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Logistics & Scheduling */}
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Logistical Setup</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-30 ml-1">Daily Timing</Label>
                                    <Select onValueChange={(v) => setFormData(prev => ({ ...prev, timing: v }))}>
                                        <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-xl px-5 text-sm">
                                            <SelectValue placeholder="Session Slot" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-2 border-white/5">
                                            {SESSION_TIMINGS.map((time) => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-30 ml-1">Room Number</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-20" />
                                        <Input 
                                            placeholder="e.g. 301" 
                                            value={formData.roomNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                                            className="h-12 pl-12 bg-muted/5 border-primary/5 rounded-xl text-sm" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button 
                            onClick={handleInitialize}
                            className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3"
                        >
                            Add Class <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100">
                             Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
          </Dialog>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[2rem] transition-premium group relative isolate">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="p-8 pb-10">
                <div className="flex items-center justify-between mb-8">
                     <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</CardDescription>
                     <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                </div>
                <CardTitle className={cn("text-3xl font-serif font-medium tracking-tight", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-30 mt-3 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="mt-16">
        <EntityDataGrid 
          title="Class List"
          description="A view of all active classes and their room/time slots."
          data={filteredCourses}
          columns={columns}
          actions={
            <div className="relative w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-none rounded-2xl placeholder:opacity-20"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-32 space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/5">
                    <LayoutGrid className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="font-serif text-2xl font-medium tracking-tight">No classes found</p>
                    <p className="text-xs text-muted-foreground opacity-40 italic">Add a class to see it here.</p>
                </div>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
