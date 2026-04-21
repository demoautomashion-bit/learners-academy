'use client'

import React, { useState } from 'react'
import { Plus, Clock, Users, MapPin, Trash2, Calendar, LayoutGrid, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

export default function SchedulePage() {
  const hasMounted = useHasMounted()
  const { courses, timeSlots, addTimeSlot, removeTimeSlot, addCourseToSlot, removeCourseFromSlot, isInitialized } = useData()

  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false)
  const [slotData, setSlotData] = useState({ label: '', startTime: '', endTime: '' })

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState<string | null>(null) // slotId
  const [assignCourseId, setAssignCourseId] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleCreateSlot = async () => {
    if (!slotData.startTime || !slotData.endTime) {
      toast.error('Start and End times are required.')
      return
    }
    await addTimeSlot(slotData)
    setIsSlotDialogOpen(false)
    setSlotData({ label: '', startTime: '', endTime: '' })
  }

  const handleAssignClass = async (slotId: string) => {
    if (!assignCourseId) {
      toast.error('Please select a class.')
      return
    }
    await addCourseToSlot(assignCourseId, slotId)
    setIsAssignDialogOpen(null)
    setAssignCourseId('')
  }

  return (
    <PageShell>
      <PageHeader 
        title="Schedule Matrix" 
        description="Organize your dynamic time slots and map active classes to them."
        actions={
          <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-8 rounded-xl bg-primary text-white shadow-lg font-medium tracking-wide">
                <Plus className="w-4 h-4 mr-2" /> Add Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
              <div className="p-6 space-y-6">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl font-medium tracking-tight">Create Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Slot Label (Optional)</Label>
                    <Input 
                      placeholder="e.g. Morning Session A" 
                      value={slotData.label} 
                      onChange={e => setSlotData({ ...slotData, label: e.target.value })}
                      className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Start Time</Label>
                      <Input 
                        placeholder="08:00 AM" 
                        value={slotData.startTime} 
                        onChange={e => setSlotData({ ...slotData, startTime: e.target.value })}
                        className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">End Time</Label>
                      <Input 
                        placeholder="09:00 AM" 
                        value={slotData.endTime} 
                        onChange={e => setSlotData({ ...slotData, endTime: e.target.value })}
                        className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateSlot} className="w-full h-14 mt-4 bg-primary rounded-2xl shadow-xl transition-all font-medium flex items-center justify-center gap-2">
                    Save Slot <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {timeSlots.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/5 border border-dashed rounded-3xl">
             <LayoutGrid className="w-12 h-12 text-primary opacity-20 mb-4" />
             <p className="font-serif text-xl">No time slots configured.</p>
             <p className="text-sm opacity-50 mt-1">Create your first slot to start mapping classes.</p>
           </div>
        ) : (
          timeSlots.map(slot => {
            const slotCourses = courses.filter(c => c.timeSlotId === slot.id)
            
            return (
              <Card key={slot.id} className="relative overflow-hidden group shadow-xl border-0 rounded-[2rem] flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
                
                <CardHeader className="relative p-6 pb-4 border-b border-primary/10 bg-background/50 backdrop-blur-sm flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    {slot.label && <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest text-primary border-primary/20 bg-primary/5 mb-2">{slot.label}</Badge>}
                    <CardTitle className="text-xl font-serif tracking-tight flex items-center gap-2.5 text-foreground">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Clock className="w-4 h-4" />
                      </div>
                      {slot.startTime} - {slot.endTime}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(slot.id)} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-colors focus:ring-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="relative p-6 flex-1 flex flex-col gap-5 bg-background/30 backdrop-blur-sm">
                  <div className="space-y-3 flex-1">
                    {slotCourses.length === 0 ? (
                      <p className="text-xs italic opacity-40 text-center py-6">No classes assigned.</p>
                    ) : (
                      slotCourses.map(course => (
                        <div key={course.id} className="group/course flex items-center justify-between p-3.5 bg-background/80 backdrop-blur-md rounded-2xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-foreground/90 group-hover/course:text-primary transition-colors">{course.title}</span>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60 flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3 h-3" /> ROOM {course.roomNumber || 'TBD'}
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                  <Users className="w-2 h-2 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                {course.teacherName || 'TBD'}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeCourseFromSlot(course.id)} className="opacity-0 group-hover/course:opacity-100 h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 transition-all focus:ring-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <Dialog open={isAssignDialogOpen === slot.id} onOpenChange={(open) => setIsAssignDialogOpen(open ? slot.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-11 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 font-medium text-primary transition-colors rounded-xl">
                        <Plus className="w-4 h-4 mr-2 opacity-70" /> Map Course Here
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[420px] glass-2 border-white/5 p-6 rounded-[2rem]">
                       <DialogHeader>
                         <DialogTitle className="font-serif text-xl">Map Course to {slot.startTime}</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-4 pt-4">
                         <div className="space-y-2">
                           <Label className="text-xs uppercase tracking-wider opacity-50">Select Existing Course</Label>
                           <Select onValueChange={setAssignCourseId}>
                             <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl">
                               <SelectValue placeholder="Choose a course..." />
                             </SelectTrigger>
                             <SelectContent>
                               {courses.map(c => (
                                 <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         <Button onClick={() => handleAssignClass(slot.id)} className="w-full h-11 bg-primary rounded-xl">Confirm Assignment</Button>
                       </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </PageShell>
  )
}
