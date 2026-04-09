'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Archive,
  Users,
  Clock,
  Calendar,
  BookOpen,
  Layers,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import type { Course } from '@/lib/types'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'

export default function ClassesPage() {
  const router = useRouter()
  const { courses, teachers, addCourse, removeCourse, updateCourseStatus, updateCourse, isInitialized } = useData()
  const hasMounted = useHasMounted()

  if (!isInitialized || !hasMounted) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
    const matchesSearch = 
      (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const teacherId = formData.get('teacherId') as string
    const teacher = teachers.find(t => t.id === teacherId)
    
    const newCourse: Course = {
      title: formData.get('title') as string,
      description: 'Institutional English Class',
      level: 'beginner',
      teacherId: teacherId,
      teacherName: teacher?.name || 'Academic Faculty',
      capacity: 20,
      enrolled: 0,
      status: 'active',
      schedule: formData.get('schedule') as string,
      duration: 'Term-based',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      roomNumber: formData.get('roomNumber') as string,
      feeAmount: parseFloat(formData.get('feeAmount') as string) || 0,
    }

    try {
      await addCourse(newCourse)
      setIsAddDialogOpen(false)
      toast.success('Class created successfully')
    } catch (error) {
      // Error handled by context
    }
  }

  const handleStatusChange = (course: Course, newStatus: Course['status']) => {
    updateCourseStatus(course.id, newStatus)
    toast.success(`Course ${newStatus}`)
  }

  const handleEditCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCourse) return
    const formData = new FormData(e.currentTarget)
    const teacherId = formData.get('teacherId') as string
    const teacher = teachers.find(t => t.id === teacherId)
    
    const updates: Partial<Course> = {
      title: formData.get('title') as string,
      teacherId: teacherId,
      teacherName: teacher?.name || selectedCourse.teacherName,
      schedule: formData.get('schedule') as string,
      roomNumber: formData.get('roomNumber') as string,
      feeAmount: parseFloat(formData.get('feeAmount') as string) || 0,
    }

    try {
      await updateCourse(selectedCourse.id, updates)
      setIsEditDialogOpen(false)
      toast.success('Class updated successfully')
    } catch (error) {
      toast.error('Failed to update class')
    }
  }

  const handleDelete = (course: Course) => {
    removeCourse(course.id)
    toast.success('Course deleted')
  }

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-success/10 text-success border-success/20'
      case 'intermediate':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'advanced':
        return 'bg-primary/10 text-primary '
    }
  }

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success hover:bg-success/90'
      case 'completed':
        return 'bg-primary hover:bg-primary/90'
      case 'draft':
        return 'bg-secondary text-secondary-foreground'
      case 'archived':
        return 'bg-muted text-muted-foreground'
    }
  }

  const columns: Column<Course>[] = [
    {
      label: 'Room Number',
      render: (course) => (
        <span className="font-normal text-lg text-primary">
          {course.roomNumber || 'N/A'}
        </span>
      ),
      width: '150px'
    },
    {
      label: 'Class',
      render: (course) => (
        <div className="flex flex-col">
          <span className="font-serif font-normal text-base leading-none mb-1">{course.title}</span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] h-4 px-1 py-0 font-normal", getLevelColor(course.level))}>
              {course.level}
            </Badge>
            <Badge className={cn("text-[10px] h-3.5 px-1 py-0 font-normal", getStatusColor(course.status))}>
              {course.status}
            </Badge>
          </div>
        </div>
      )
    },
    {
      label: 'Class Timing',
      render: (course) => (
        <span className="font-normal text-xs text-muted-foreground">
          {course.schedule}
        </span>
      )
    },
    {
      label: 'Teacher',
      render: (course) => (
        <span className="font-serif font-normal text-base text-foreground">
          {course.teacherName}
        </span>
      )
    },
    {
      label: 'Fee (PKR)',
      render: (course) => (
        <span className="font-serif font-normal text-base text-primary">
          Rs. {(course.feeAmount || 0).toLocaleString()}
        </span>
      )
    },
    {
      label: '',
      render: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
              <MoreHorizontal className="w-4 h-4 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-xs font-normal opacity-40 px-4 py-2">Registry Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem onClick={() => {
              setSelectedCourse(course)
              setIsViewDialogOpen(true)
            }} className="cursor-pointer py-2.5">
              <Eye className="w-4 h-4 mr-2 opacity-60" />
              Session Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedCourse(course)
              setIsEditDialogOpen(true)
            }} className="cursor-pointer py-2.5">
              <Edit className="w-4 h-4 mr-2 opacity-60" />
              Edit Parameters
            </DropdownMenuItem>
            {course.status === 'active' && (
              <DropdownMenuItem onClick={() => handleStatusChange(course, 'completed')} className="cursor-pointer py-2.5">
                <Archive className="w-4 h-4 mr-2 opacity-60" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer py-2.5"
              onClick={() => handleDelete(course)}
            >
              <Trash2 className="w-4 h-4 mr-2 opacity-60" />
              Delete Registry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '70px'
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Academic Batches"
        description="Manage explicit class batches, active sessions, and room schedules."
        actions={
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/classes/schedule')}
              className="h-12 px-6 hover:bg-primary/5 transition-premium group font-normal"
            >
               <Layers className="w-4 h-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
               <span className="text-xs">Schedule Audit</span>
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-normal shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-3xl font-medium">Class Registry</DialogTitle>
                  <DialogDescription className="text-xs font-normal opacity-60">
                    Fill in the details to schedule a new academic session.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCourse}>
                  <FieldGroup className="py-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 items-stretch">
                      <Field>
                        <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Academic Level</FieldLabel>
                        <Select name="title" required>
                          <SelectTrigger className="bg-background h-10 font-normal">
                            <SelectValue placeholder="Select class level" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACADEMY_LEVELS?.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Teacher Assignment</FieldLabel>
                        <Select name="teacherId" required>
                          <SelectTrigger className="bg-background h-10 font-normal">
                            <SelectValue placeholder="Assign teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers?.map(teacher => (
                              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 items-stretch">
                      <Field>
                        <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Session Timing</FieldLabel>
                        <Select name="schedule" required>
                          <SelectTrigger className="bg-background h-10 font-normal">
                            <SelectValue placeholder="Starting time" />
                          </SelectTrigger>
                          <SelectContent>
                            {SESSION_TIMINGS?.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Room Allocation</FieldLabel>
                        <Input name="roomNumber" placeholder="e.g. Room 302" required className="bg-background h-10 font-normal" />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-stretch">
                      <Field>
                        <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Tuition Fee (PKR)</FieldLabel>
                        <Input name="feeAmount" type="number" placeholder="e.g. 5000" required className="bg-background h-10 font-normal" />
                      </Field>
                    </div>
                  </FieldGroup>
                  <DialogFooter className="border-t pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-xs font-normal">
                      Cancel
                    </Button>
                    <Button type="submit" className="font-normal shadow-xl shadow-primary/20">Publish Class</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <EntityCardGrid 
        data={[
          { label: 'Total Batches', value: courses.length, sub: 'Academy Registry' },
          { label: 'Active Batches', value: courses?.filter(c => c.status === 'active').length, sub: 'Currently Operational', color: 'text-success' },
        ]}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-normal opacity-60">{stat.label}</CardDescription>
              <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <EntityDataGrid 
        title="All Batches"
        data={filteredCourses}
        columns={columns}
        actions={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-muted/10 h-10 w-[160px] text-xs font-normal">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/10 focus:bg-background transition-all h-10 text-sm font-normal"
              />
            </div>
          </div>
        }
        emptyState={
          <div className="text-center py-12 text-muted-foreground opacity-30">
            <BookOpen className="w-12 h-12 mb-4 opacity-20 mx-auto" />
            <p className="font-serif text-xl font-normal">No classes found</p>
          </div>
        }
      />

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">Class Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6 py-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn("font-normal text-[10px]", getLevelColor(selectedCourse.level))}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge className={cn("font-normal text-[10px]", getStatusColor(selectedCourse.status))}>
                    {selectedCourse.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-serif font-medium">{selectedCourse.title}</h3>
                <p className="text-xs font-normal text-muted-foreground mt-2">{selectedCourse.description}</p>
              </div>

              <div className="grid gap-4 grid-cols-2 items-stretch">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground opacity-40" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-normal">Instructor</p>
                    <p className="text-sm font-normal">{selectedCourse.teacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground opacity-40" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-normal">Duration</p>
                    <p className="text-sm font-normal">{selectedCourse.duration}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground font-normal mb-1">Schedule</p>
                <p className="text-sm font-normal">{selectedCourse.schedule}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-normal opacity-60">Enrollment Capacity</span>
                  <span className="font-normal">{selectedCourse.enrolled} / {selectedCourse.capacity}</span>
                </div>
                <Progress value={(selectedCourse.enrolled / selectedCourse.capacity) * 100} className="h-1.5" />
              </div>
              
              <div>
                <p className="text-[10px] text-muted-foreground font-normal mb-1">Tuition Fee</p>
                <p className="font-serif font-normal text-xl text-primary">Rs. {(selectedCourse.feeAmount || 0).toLocaleString()}</p>
              </div>

              <div className="grid gap-4 grid-cols-2 pt-4 border-t items-stretch">
                <div>
                  <p className="text-[10px] text-muted-foreground font-normal">Start Date</p>
                  <p className="text-sm font-normal flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-40" />
                    <ClientDate date={selectedCourse.startDate} formatString="MMM d, yyyy" fallback="---" />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-normal">End Date</p>
                  <p className="text-sm font-normal flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-40" />
                    <ClientDate date={selectedCourse.endDate} formatString="MMM d, yyyy" fallback="---" />
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-medium">Edit Registry Parameters</DialogTitle>
            <DialogDescription className="text-xs font-normal opacity-60">
              Update details for this academic session.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <form onSubmit={handleEditCourse}>
              <FieldGroup className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 items-stretch">
                  <Field>
                    <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Academic Level</FieldLabel>
                    <Select name="title" defaultValue={selectedCourse.title} required>
                      <SelectTrigger className="bg-background h-10 font-normal">
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMY_LEVELS?.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Teacher Assignment</FieldLabel>
                    <Select name="teacherId" defaultValue={selectedCourse.teacherId} required>
                      <SelectTrigger className="bg-background h-10 font-normal">
                        <SelectValue placeholder="Assign teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers?.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                
                <div className="grid grid-cols-2 gap-4 items-stretch">
                  <Field>
                    <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Session Timing</FieldLabel>
                    <Select name="schedule" defaultValue={selectedCourse.schedule} required>
                      <SelectTrigger className="bg-background h-10 font-normal">
                        <SelectValue placeholder="Starting time" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TIMINGS?.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Room Allocation</FieldLabel>
                    <Input name="roomNumber" defaultValue={selectedCourse.roomNumber || ''} placeholder="e.g. Room 302" required className="bg-background h-10 font-normal" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 items-stretch">
                  <Field>
                    <FieldLabel className="text-xs font-normal opacity-60 mb-1.5">Tuition Fee (PKR)</FieldLabel>
                    <Input name="feeAmount" type="number" defaultValue={selectedCourse.feeAmount || 0} placeholder="e.g. 5000" required className="bg-background h-10 font-normal" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-xs font-normal">
                  Cancel
                </Button>
                <Button type="submit" className="font-normal shadow-xl shadow-primary/20">Save Alterations</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
