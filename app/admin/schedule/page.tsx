'use client'

import React, { useState } from 'react'
import { Plus, Clock, Users, MapPin, Trash2, Calendar, LayoutGrid, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
              <Card key={slot.id} className="glass-1 border border-primary/5 shadow-premium overflow-hidden rounded-[1.5rem] flex flex-col">
                <CardHeader className="bg-primary/5 p-5 pb-4 flex flex-row items-start justify-between">
                  <div>
                    {slot.label && <span className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1">{slot.label}</span>}
                    <CardTitle className="text-lg font-serif tracking-tight flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-50" />
                      {slot.startTime} - {slot.endTime}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(slot.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                  <div className="space-y-3 flex-1">
                    {slotCourses.length === 0 ? (
                      <p className="text-xs italic opacity-40 text-center py-6">No classes assigned.</p>
                    ) : (
                      slotCourses.map(course => (
                        <div key={course.id} className="group flex items-center justify-between p-3 bg-background rounded-xl border border-primary/5 shadow-sm hover:border-primary/20 transition-all">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{course.title}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> Room {course.roomNumber || 'TBD'}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeCourseFromSlot(course.id)} className="opacity-0 group-hover:opacity-100 h-6 w-6 text-destructive transition-all">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <Dialog open={isAssignDialogOpen === slot.id} onOpenChange={(open) => setIsAssignDialogOpen(open ? slot.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-dashed border-primary/20 bg-transparent hover:bg-primary/5 hover:border-primary/40 font-normal">
                        <Users className="w-4 h-4 mr-2 opacity-50" /> Map Course to Slot
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
