'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import type { Course } from '@/lib/types'

const CLASS_LEVELS = ACADEMY_LEVELS
const CLASS_TIMES = SESSION_TIMINGS

export default function ClassesPage() {
  const router = useRouter()
  const { courses, teachers, addCourse, removeCourse, updateCourseStatus, updateCourse, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
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
        return 'bg-primary/10 text-primary border-primary/20'
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

  if (!isInitialized) return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-12 w-1/3 bg-primary/5 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
         {[1,2].map(i => <div key={i} className="h-32 bg-card rounded-[2rem] border border-primary/5" />)}
      </div>
      <div className="h-[400px] w-full bg-card rounded-[2.5rem] border border-primary/5" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Academic Batches
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage explicit class batches, active sessions, and room schedules.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/classes/schedule')}
            className="h-14 px-8 rounded-2xl border-primary/5 bg-card/60 backdrop-blur-md shadow-premium hover:bg-primary/5 transition-premium group"
          >
             <Layers className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
             <span className="text-[10px] uppercase tracking-widest font-bold">Global Schedule Audit</span>
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-white shadow-premium hover:shadow-massive hover-lift transition-premium">
                <Plus className="w-5 h-5 mr-3" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Create New Batch</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl tracking-tight font-normal">Class Registry</DialogTitle>
              <DialogDescription className="text-editorial-meta">
                Fill in the details to schedule a new academic session.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse}>
              <FieldGroup className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Academic Level</FieldLabel>
                    <Select name="title" required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_LEVELS?.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Teacher Assignment</FieldLabel>
                    <Select name="teacherId" required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Session Timing</FieldLabel>
                    <Select name="schedule" required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
                        <SelectValue placeholder="Starting time" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_TIMES?.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-editorial-label">Room Allocation</FieldLabel>
                    <Input name="roomNumber" placeholder="e.g. Room 302" required className="bg-background/50 h-10" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Tuition Fee (PKR)</FieldLabel>
                    <Input name="feeAmount" type="number" placeholder="e.g. 5000" required className="bg-background/50 h-10 font-normal font-serif text-editorial-meta" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-normal uppercase tracking-wide">Publish Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Total Batches</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Active Batches</CardDescription>
            <CardTitle className="text-3xl text-success">
              {courses?.filter(c => c.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background/50 h-10">
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
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0 overflow-hidden">
          <div className="hidden md:block">
            <Table>
            <TableHeader className="bg-muted/5 h-16 border-b border-primary/5">
              <TableRow>
                <TableHead className="w-[150px] font-normal text-foreground uppercase tracking-widest text-[10px]">Room Number</TableHead>
                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[10px]">Class</TableHead>
                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[10px]">Class Timing</TableHead>
                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[10px]">Teacher</TableHead>
                <TableHead className="font-normal text-foreground uppercase tracking-widest text-[10px]">Fee (PKR)</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                    No classes found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses?.map((course) => (
                  <TableRow key={course.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="font-normal tracking-tighter text-lg text-primary">
                      {course.roomNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-serif font-normal text-base leading-none mb-1">{course.title}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={cn("text-[9px] h-4 px-1 py-0 uppercase tracking-tighter font-normal", getLevelColor(course.level))}>
                            {course.level}
                          </Badge>
                          <Badge className={cn("text-[8px] h-3.5 px-1 py-0 uppercase tracking-tighter font-normal", getStatusColor(course.status))}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-normal text-[11px] text-muted-foreground uppercase tracking-widest">
                      {course.schedule}
                    </TableCell>
                    <TableCell className="font-serif font-normal text-base text-primary">
                      Rs. {(course.feeAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-premium">
                          <DropdownMenuLabel>Registry Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedCourse(course)
                            setIsViewDialogOpen(true)
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Session Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedCourse(course)
                            setIsEditDialogOpen(true)
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Parameters
                          </DropdownMenuItem>
                          {course.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(course, 'completed')}>
                              <Archive className="w-4 h-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(course)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Registry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Grid View */}
          <div className="md:hidden p-4 space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                No active classes found in the registry.
              </div>
            ) : (
              filteredCourses?.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-premium active:scale-[0.98]"
                  onClick={() => {
                    setSelectedCourse(course)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                    <span className="font-normal text-lg text-primary tracking-tighter">
                      {course.roomNumber || 'Room TBC'}
                    </span>
                    <Badge className={cn("text-[9px] uppercase tracking-tighter", getStatusColor(course.status))}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-serif font-normal text-lg leading-tight mb-1">{course.title}</h4>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className={cn("text-[8px] h-4 px-1 py-0 uppercase tracking-tighter", getLevelColor(course.level))}>
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="flex flex-col gap-1">
                          <p className="text-[9px] uppercase font-normal text-muted-foreground tracking-widest">Timing</p>
                          <p className="text-xs font-normal">{course.schedule}</p>
                       </div>
                       <div className="flex flex-col gap-1">
                          <p className="text-[9px] uppercase font-normal text-muted-foreground tracking-widest">Teacher</p>
                          <p className="text-xs font-normal font-serif">{course.teacherName}</p>
                       </div>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/5 flex justify-end px-4 border-t">
                    <Button variant="ghost" size="sm" className="h-9 w-full rounded-xl text-primary font-normal" onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setIsEditDialogOpen(true); }}>
                       <Edit className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal">Class Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6 py-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge className={getStatusColor(selectedCourse.status)}>
                    {selectedCourse.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-normal">{selectedCourse.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedCourse.description}</p>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-normal">{selectedCourse.teacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-normal">{selectedCourse.duration}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                <p className="font-normal">{selectedCourse.schedule}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Enrollment Capacity</span>
                  <span className="font-normal">{selectedCourse.enrolled} / {selectedCourse.capacity}</span>
                </div>
                <Progress value={(selectedCourse.enrolled / selectedCourse.capacity) * 100} className="h-3" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fee Configured by Admin</p>
                <p className="font-serif font-normal text-lg text-primary">Rs. {(selectedCourse.feeAmount || 0).toLocaleString()}</p>
              </div>

              <div className="grid gap-4 grid-cols-2 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-normal flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedCourse.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-normal flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedCourse.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl tracking-tight font-normal">Edit Registry Parameters</DialogTitle>
            <DialogDescription className="text-editorial-meta">
              Update details for this academic session.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <form onSubmit={handleEditCourse}>
              <FieldGroup className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Academic Level</FieldLabel>
                    <Select name="title" defaultValue={selectedCourse.title} required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_LEVELS?.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Teacher Assignment</FieldLabel>
                    <Select name="teacherId" defaultValue={selectedCourse.teacherId} required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Session Timing</FieldLabel>
                    <Select name="schedule" defaultValue={selectedCourse.schedule} required>
                      <SelectTrigger className="bg-background/50 h-10 text-editorial-meta">
                        <SelectValue placeholder="Starting time" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_TIMES?.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel className="text-editorial-label">Room Allocation</FieldLabel>
                    <Input name="roomNumber" defaultValue={selectedCourse.roomNumber || ''} placeholder="e.g. Room 302" required className="bg-background/50 h-10" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Tuition Fee (PKR)</FieldLabel>
                    <Input name="feeAmount" type="number" defaultValue={selectedCourse.feeAmount || 0} placeholder="e.g. 5000" required className="bg-background/50 h-10 font-normal font-serif text-editorial-meta" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-normal uppercase tracking-wide">Save Alterations</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
