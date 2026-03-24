'use client'

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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import type { Schedule } from '@/lib/types'

const CLASS_LEVELS = [
  'Pre-Foundation', 'Foundation One', 'Foundation Two', 'Foundation Three',
  'Beginners', 'Level One', 'Level Two', 'Level Three', 'Level Four', 'Level Five', 'Level Six',
  'Level Advanced', 'Professional Advanced',
  'Speaking Class', 'Grammar Speaking Class', 'IELTS Preparation Course'
]

const ACADEMY_SLOTS = [
  { id: 'S-01', time: '03:00 PM - 04:00 PM' },
  { id: 'S-02', time: '04:00 PM - 05:00 PM' },
  { id: 'S-03', time: '05:00 PM - 06:00 PM' },
  { id: 'S-04', time: '06:00 PM - 07:00 PM' },
  { id: 'S-05', time: '07:00 PM - 08:00 PM' },
  { id: 'S-06', time: '08:00 PM - 09:00 PM' },
]

export default function SchedulePage() {
  const { schedules, teachers, addSchedule, removeSchedule } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const filteredSchedules = schedules.filter(s =>
    s.classTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget)
    const slotId = formData.get('slotId') as string
    const slot = ACADEMY_SLOTS.find(s => s.id === slotId)
    
    const newSchedule: Schedule = {
      id: `sch-${Date.now()}`,
      classTitle: formData.get('className') as string,
      teacherName: formData.get('teacherName') as string,
      timing: slot?.time || 'Timing TBC',
      slotId: slotId,
      roomNumber: formData.get('roomNumber') as string,
      days: ['Mon', 'Wed', 'Fri'], // Default days
    }

    addSchedule(newSchedule)
    setIsAddOpen(false)
    toast.success('Schedule created successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Academic Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage class timings, room assignments, and teacher rotations.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card/90 backdrop-blur-xl border-primary/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-bold tracking-tight">Schedule Registry</DialogTitle>
              <DialogDescription className="text-editorial-meta">
                Assign an academic session to a standardized slot and room.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSchedule}>
              <FieldGroup className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Class Level</FieldLabel>
                    <Select name="className" required>
                      <SelectTrigger className="bg-background/50 h-10">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Teacher Assignment</FieldLabel>
                    <Select name="teacherName" required>
                      <SelectTrigger className="bg-background/50 h-10">
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Slot Selection</FieldLabel>
                    <Select name="slotId" required>
                      <SelectTrigger className="bg-background/50 h-10">
                        <SelectValue placeholder="Choose timing slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMY_SLOTS.map(slot => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.id} ({slot.time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Room Allocation</FieldLabel>
                    <Input name="roomNumber" placeholder="e.g. 101, Lab A" required className="bg-background/50 h-10" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-semibold uppercase tracking-wide">Publish Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search classes or teachers..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchedules.map((item) => (
          <Card key={item.id} className="hover-lift border-none shadow-sm ring-1 ring-border group transition-all">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-bold text-primary border-primary/20 bg-primary/5">
                  {item.slotId || 'S-TBC'}
                </Badge>
                <CardTitle className="text-xl font-serif text-foreground leading-tight">{item.classTitle}</CardTitle>
                <CardDescription className="font-medium text-accent">
                  Prof. {item.teacherName}
                </CardDescription>
              </div>
              <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted group/edit">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeSchedule(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded bg-muted/50">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{item.timing}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded bg-muted/50">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span>Room {item.roomNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded bg-muted/50">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    {item.days.map(day => (
                      <Badge key={day} variant="secondary" className="px-1 text-[9px] uppercase font-bold">{day}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
