'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  Edit,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { ACADEMY_LEVELS, SCHEDULE_SLOTS } from '@/lib/registry'
import type { Schedule } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'


const CLASS_LEVELS = ACADEMY_LEVELS
const ACADEMY_SLOTS = SCHEDULE_SLOTS

export default function SchedulePage() {
  const { schedules, teachers, addSchedule, removeSchedule, updateSchedule, isInitialized } = useData()
  

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  const hasMounted = useHasMounted()
  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />


  const filteredSchedules = (schedules || []).filter(s =>
    (s.classTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const slotId = formData.get('slotId') as string
    const slot = ACADEMY_SLOTS.find(s => s.id === slotId)
    
    const newSchedule: Schedule = {
      classTitle: formData.get('className') as string,
      teacherName: formData.get('teacherName') as string,
      timing: slot?.time || 'Timing TBC',
      slotId: slotId,
      roomNumber: formData.get('roomNumber') as string,
      days: ['Mon', 'Wed', 'Fri'], // Default days
    }

    try {
      await addSchedule(newSchedule)
      setIsAddOpen(false)
      toast.success('Schedule created successfully')
    } catch (error) {
      toast.error('Failed to create schedule')
    }
  }

  const handleEditSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSchedule) return
    const formData = new FormData(e.currentTarget)
    const slotId = formData.get('slotId') as string
    const slot = ACADEMY_SLOTS.find(s => s.id === slotId)
    
    const updates: Partial<Schedule> = {
      classTitle: formData.get('className') as string,
      teacherName: formData.get('teacherName') as string,
      timing: slot?.time || selectedSchedule.timing,
      slotId: slotId,
      roomNumber: formData.get('roomNumber') as string,
    }

    try {
      await updateSchedule(selectedSchedule.id, updates)
      setIsEditOpen(false)
      toast.success('Schedule updated successfully')
    } catch (error) {
      toast.error('Failed to update schedule')
    }
  }

  return (
    <PageShell>
      <PageHeader 
        title="Academic Schedule"
        description="Manage class timings, room assignments, and teacher rotations."
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 shadow-lg shadow-primary/20 font-normal ">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2rem] border-white/10 glass-3">
              <DialogHeader className="p-10 pb-0 text-center">
                <div className="mx-auto w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                  <Calendar className="w-7 h-7 text-primary opacity-80" />
                </div>
                <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Schedule Registry</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-2">
                  Operational Session Allocation Protocol
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSchedule} className="p-10 pt-6 space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Class Level</FieldLabel>
                      <Select name="className" required>
                        <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {(CLASS_LEVELS || []).map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Faculty Assignment</FieldLabel>
                      <Select name="teacherName" required>
                        <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {(teachers || []).map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Timing Slot</FieldLabel>
                      <Select name="slotId" required>
                        <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                          <SelectValue placeholder="Choose timing" />
                        </SelectTrigger>
                        <SelectContent>
                          {(ACADEMY_SLOTS || []).map(slot => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.id} ({slot.time})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Room Allocation</FieldLabel>
                      <Input name="roomNumber" placeholder="e.g. Lab A" required className="h-12 bg-background/30 border-white/10 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl" />
                    </Field>
                  </div>
                </div>
                <DialogFooter className="pt-4 gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl text-muted-foreground hover:text-foreground">
                    Dismiss
                  </Button>
                  <Button type="submit" className="px-8 rounded-xl bg-primary text-primary-foreground font-serif text-lg tracking-wide hover-lift shadow-xl shadow-primary/20">
                    Publish Schedule
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-all" />
          <Input 
            placeholder="Search classes, teachers or rooms..." 
            className="pl-11 h-12 bg-background/50 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {ACADEMY_SLOTS.map((slot) => {
          // Filter classes that belong to THIS specific slot AND match search query
          const slotClasses = (filteredSchedules || []).filter(s => s.slotId === slot.id) || []
          
          // Conflict Detection Logic
          const roomMap = new Map()
          const teacherMap = new Map()
          
          slotClasses.forEach(c => {
             roomMap.set(c.roomNumber, (roomMap.get(c.roomNumber) || 0) + 1)
             teacherMap.set(c.teacherName, (teacherMap.get(c.teacherName) || 0) + 1)
          })

          return (
            <Card key={slot.id} className="group glass-1 border-white/10 shadow-premium overflow-hidden rounded-[2rem] hover:translate-y-[-4px] transition-all duration-500 flex flex-col h-full ring-1 ring-white/5">
              <CardHeader className="bg-primary/5 py-6 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg tracking-tight font-medium text-foreground/90">Session {slot.id.split('-')[1]}</h4>
                  <div className="flex items-center gap-2 mt-1 opacity-40">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-mono tracking-tighter uppercase">{slot.time}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-background/50 ring-1 ring-white/10 group-hover:bg-primary/10 transition-colors duration-500">
                  <Calendar className="w-4 h-4 text-primary/60" />
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex-1 flex flex-col space-y-3">
                {slotClasses.length > 0 ? (
                  slotClasses.map((item) => {
                    const roomConflict = roomMap.get(item.roomNumber) > 1
                    const teacherConflict = teacherMap.get(item.teacherName) > 1

                    return (
                      <div key={item.id} className="relative group/item p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-0.5">
                            <h5 className="font-serif text-base leading-tight font-medium group-hover/item:text-primary transition-colors">{item.classTitle}</h5>
                            <p className={cn(
                                "text-[11px] font-medium tracking-tight",
                                teacherConflict ? "text-destructive" : "text-muted-foreground/60"
                            )}>
                              {teacherConflict && "⚠️ "}Prof. {item.teacherName}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-primary/10" onClick={() => { setSelectedSchedule(item); setIsEditOpen(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-destructive/10" onClick={() => removeSchedule(item.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className={cn(
                               "text-[10px] px-2 py-0 h-5 font-bold uppercase transition-colors",
                               roomConflict ? "bg-destructive/20 text-destructive border-destructive/20 animate-pulse" : "bg-primary/5 text-primary/70 border-primary/10"
                           )}>
                             {roomConflict && "Conflict: "}Rm {item.roomNumber}
                           </Badge>
                           <div className="flex gap-0.5 opacity-20">
                             {item.days?.slice(0, 3).map(d => (
                               <span key={d} className="text-[9px] uppercase tracking-tighter">{d}</span>
                             ))}
                           </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
                     <Clock className="w-6 h-6 mb-2" />
                     <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Open Session</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>


      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2rem] border-white/10 glass-3">
          <DialogHeader className="p-10 pb-0 text-center">
            <div className="mx-auto w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
              <Edit className="w-7 h-7 text-primary opacity-80" />
            </div>
            <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Modify Schedule</DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-2">
              Update Institutional Session Parameters
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <form onSubmit={handleEditSchedule} className="p-10 pt-6 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Class Module</FieldLabel>
                    <Input name="className" defaultValue={selectedSchedule.classTitle} placeholder="e.g. EC Beginner 1" required className="h-12 bg-background/30 border-white/10 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Faculty Member</FieldLabel>
                    <Input name="teacherName" defaultValue={selectedSchedule.teacherName} placeholder="e.g. Tr. Sarah" required className="h-12 bg-background/30 border-white/10 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl" />
                  </Field>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Institutional Slot</FieldLabel>
                    <Select name="slotId" defaultValue={selectedSchedule.slotId} required>
                      <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl">
                        <SelectValue placeholder="Designated Slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {(ACADEMY_SLOTS || []).map(slot => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.id}: {slot.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Allocated Room</FieldLabel>
                    <Input name="roomNumber" defaultValue={selectedSchedule.roomNumber} placeholder="e.g. Lab 2" required className="h-12 bg-background/30 border-white/10 focus:ring-1 focus:ring-primary/20 transition-all text-sm rounded-xl" />
                  </Field>
                </div>
              </div>
              <DialogFooter className="pt-4 gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 rounded-xl bg-primary text-primary-foreground font-serif text-lg tracking-wide hover-lift shadow-xl shadow-primary/20">
                  Commit Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
