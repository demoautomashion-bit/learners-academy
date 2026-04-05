'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Clock,
  Calendar,
  Layers,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Users,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  MoreVertical,
  Filter,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { SESSION_TIMINGS } from '@/lib/registry'
import { cn } from '@/lib/utils'

export default function ScheduleIntelligencePage() {
  const router = useRouter()
  const { courses, teachers, updateCourse, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState('Monday') // Simple day toggle

  // Conflict Detection Logic
  const conflicts = useMemo(() => {
    const results: Array<{ type: 'teacher' | 'room'; target: string; time: string; courseIds: string[] }> = []
    
    // Group by time
    const timeGroups: Record<string, typeof courses> = {}
    courses.forEach(c => {
        if (!timeGroups[c.schedule]) timeGroups[c.schedule] = []
        timeGroups[c.schedule].push(c)
    })

    Object.entries(timeGroups).forEach(([time, batch]) => {
        // Teacher double-booking
        const teachersInSlot: Record<string, string[]> = {}
        batch.forEach(c => {
            if (!teachersInSlot[c.teacherId]) teachersInSlot[c.teacherId] = []
            teachersInSlot[c.teacherId].push(c.id)
        })
        Object.entries(teachersInSlot).forEach(([tId, ids]) => {
            if (ids.length > 1) {
                const tName = teachers.find(t => t.id === tId)?.name || 'Unknown Teacher'
                results.push({ type: 'teacher', target: tName, time, courseIds: ids })
            }
        })

        // Room double-booking
        const roomsInSlot: Record<string, string[]> = {}
        batch.forEach(c => {
            if (!c.roomNumber) return
            if (!roomsInSlot[c.roomNumber]) roomsInSlot[c.roomNumber] = []
            roomsInSlot[c.roomNumber].push(c.id)
        })
        Object.entries(roomsInSlot).forEach(([room, ids]) => {
            if (ids.length > 1) {
                results.push({ type: 'room', target: `Room ${room}`, time, courseIds: ids })
            }
        })
    })

    return results
  }, [courses, teachers])

  const filteredTimings = SESSION_TIMINGS?.filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isInitialized) return <div className="p-8 text-center animate-pulse text-muted-foreground uppercase tracking-widest text-xs">Initializing Master Registry...</div>

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="group -ml-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Return to Batches</span>
          </Button>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Clock className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h1 className="text-4xl font-serif font-normal text-foreground leading-none">Schedule Intelligence</h1>
                <p className="mt-2 text-muted-foreground text-editorial-meta opacity-70">
                    Master timing registry with real-time institutional conflict detection.
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Conflict Indicator */}
           {conflicts.length > 0 ? (
               <div className="flex items-center gap-3 px-6 py-3 bg-destructive/5 border border-destructive/20 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-700">
                  <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-destructive">{conflicts.length} Critical Conflicts</p>
                    <p className="text-[9px] text-muted-foreground">Action required in timing registry.</p>
                  </div>
               </div>
           ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-success/5 border border-success/20 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-success">Schedule Optimized</p>
                        <p className="text-[9px] text-muted-foreground">Zero institutional overlaps detected.</p>
                    </div>
                </div>
           )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Left Column: Metrics & Controls */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground opacity-40">Intelligence Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Timing Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
                            <Input 
                                placeholder="Search slots..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 bg-muted/20 border-primary/10 rounded-xl focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Active Term Cycle</label>
                        <Select defaultValue="spring-2024">
                            <SelectTrigger className="h-11 bg-muted/20 border-primary/10 rounded-xl">
                                <SelectValue placeholder="Select Cycle" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary/5 shadow-premium rounded-xl">
                                <SelectItem value="spring-2024">Spring Term 2024</SelectItem>
                                <SelectItem value="winter-2023">Winter Term 2023</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Conflict List */}
            <AnimatePresence>
                {conflicts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <h4 className="px-4 text-[10px] uppercase tracking-widest font-bold text-destructive">Active Registry Issues</h4>
                        {conflicts?.map((conflict, idx) => (
                            <div 
                                key={idx}
                                className="p-4 bg-destructive/5 border border-destructive/10 rounded-[1.5rem] space-y-2 group hover:bg-destructive/10 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-destructive/10 rounded-lg">
                                        {conflict.type === 'teacher' ? <Users className="w-3 h-3 text-destructive" /> : <MapPin className="w-3 h-3 text-destructive" />}
                                    </div>
                                    <Badge variant="outline" className="text-[8px] uppercase border-destructive/20 text-destructive">{conflict.type} Conflict</Badge>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{conflict.target}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{conflict.time}</p>
                                </div>
                                <div className="pt-2 flex gap-1 items-center">
                                    {conflict.courseIds?.map(cid => (
                                        <div key={cid} className="h-1 flex-1 bg-destructive/20 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Center/Right Column: Master Timing Grid */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="bg-card/40 backdrop-blur-xl border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/5 border-b border-primary/5 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-serif font-normal">Institutional Timing Registry</CardTitle>
                        <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-30 mt-1">Global Session Audit</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-10 rounded-xl px-4 border-primary/10">
                            <Layers className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-[10px] uppercase tracking-widest font-black">Export Schedule</span>
                        </Button>
                        <Button size="sm" className="h-10 rounded-xl px-4 bg-primary hover:shadow-lg transition-premium">
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="text-[10px] uppercase tracking-widest font-black">Force Shift Slot</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/5 h-14 border-b border-primary/5">
                            <TableRow>
                                <TableHead className="w-[20%] pl-8 font-normal text-foreground uppercase tracking-widest text-[9px]">Timing Window</TableHead>
                                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[9px]">Active Batches</TableHead>
                                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[9px]">Institutional Load</TableHead>
                                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[9px] text-right pr-8">Audit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTimings?.map((time) => {
                                const batchesInTime = courses?.filter(c => c.schedule === time)
                                const hasConflicts = conflicts.some(c => c.time === time)
                                
                                return (
                                    <TableRow key={time} className={cn(
                                        "group transition-premium",
                                        hasConflicts ? "bg-destructive/[0.02]" : "hover:bg-muted/10"
                                    )}>
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1 h-8 rounded-full transition-colors",
                                                    hasConflicts ? "bg-destructive" : (batchesInTime.length > 0 ? "bg-primary" : "bg-muted/20")
                                                )} />
                                                <span className="text-sm font-normal tracking-tight font-sans text-foreground/80">{time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {batchesInTime.length > 0 ? (
                                                    batchesInTime.slice(0, 4).map((c, i) => {
                                                        const initials = c.teacherName.split(' ').map(n => n[0]).join('')
                                                        return (
                                                            <div 
                                                                key={c.id} 
                                                                className="h-10 w-10 ring-4 ring-card rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                                                                title={`${c.title} by ${c.teacherName}`}
                                                            >
                                                                {initials}
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-20">No active batches</span>
                                                )}
                                                {batchesInTime.length > 4 && (
                                                    <div className="h-10 w-10 ring-4 ring-card rounded-full bg-muted/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        +{batchesInTime.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-32 py-2">
                                                <div className="flex justify-between text-[8px] uppercase tracking-widest font-black text-muted-foreground mb-1.5 px-0.5">
                                                    <span>Room Occupancy</span>
                                                    <span>{batchesInTime.length}/10</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(batchesInTime.length / 10) * 100}%` }}
                                                        className={cn(
                                                            "h-full transition-colors",
                                                            hasConflicts ? "bg-destructive" : (batchesInTime.length > 5 ? "bg-warning" : "bg-primary")
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                 {hasConflicts && <AlertTriangle className="w-3.5 h-3.5 text-destructive mr-2" />}
                                                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                 </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Room Availability Matrix Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm uppercase tracking-widest font-black opacity-30">Teacher Load Balance</CardTitle>
                        <RefreshCw className="w-4 h-4 text-muted-foreground opacity-20" />
                    </CardHeader>
                    <CardContent className="pt-2">
                         <div className="space-y-4">
                            {teachers.slice(0, 3).map(t => {
                                const tCourses = courses?.filter(c => c.teacherId === t.id)
                                return (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                                                {t.name[0]}
                                            </div>
                                            <span className="text-xs font-semibold">{t.name}</span>
                                        </div>
                                        <Badge variant="ghost" className="text-[10px] opacity-40">{tCourses.length} Batches</Badge>
                                    </div>
                                )
                            })}
                         </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm uppercase tracking-widest font-black opacity-30">Institutional Density</CardTitle>
                        <Filter className="w-4 h-4 text-muted-foreground opacity-20" />
                    </CardHeader>
                    <CardContent className="pt-2">
                         <div className="flex flex-wrap gap-2">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map(shift => (
                                <div key={shift} className="px-4 py-2 rounded-xl bg-muted/5 border border-primary/5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-premium cursor-pointer">
                                    {shift}
                                </div>
                            ))}
                         </div>
                         <div className="mt-8 p-6 rounded-2xl border border-dashed border-primary/10 bg-primary/[0.01] text-center">
                            <Layers className="w-8 h-8 text-primary opacity-10 mx-auto mb-3" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Advanced conflict algorithms are currently monitoring <strong>{courses.length} educational streams</strong> across <strong>{SESSION_TIMINGS.length} time sectors</strong>.
                            </p>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}
