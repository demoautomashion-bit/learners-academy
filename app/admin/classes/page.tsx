'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import type { Course } from '@/lib/types'

const CLASS_LEVELS = [
  'Pre-Foundation',
  'Foundation One',
  'Foundation Two',
  'Foundation Three',
  'Beginners',
  'Level One',
  'Level Two',
  'Level Three',
  'Level Four',
  'Level Five',
  'Level Six',
  'Level Advanced',
  'Professional Advanced',
  'Speaking Class',
  'Grammar Speaking Class',
  'IELTS Preparation Course'
]

const CLASS_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
]

export default function ClassesPage() {
  const { courses, teachers, addCourse, removeCourse, updateCourseStatus } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const teacherId = formData.get('teacherId') as string
    const teacher = teachers.find(t => t.id === teacherId)
    
    const newCourse: Course = {
      id: `class-${Date.now()}`,
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
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roomNumber: formData.get('roomNumber') as string,
    }
    addCourse(newCourse)
    setIsAddDialogOpen(false)
    toast.success('Class created successfully')
  }

  const handleStatusChange = (course: Course, newStatus: Course['status']) => {
    updateCourseStatus(course.id, newStatus)
    toast.success(`Course ${newStatus}`)
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage academic sessions and educational registry
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card/90 backdrop-blur-xl border-primary/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-bold tracking-tight">Class Registry</DialogTitle>
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
                        {CLASS_LEVELS.map(level => (
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
                        {teachers.map(teacher => (
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
                        {CLASS_TIMES.map(time => (
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
              </FieldGroup>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-semibold uppercase tracking-wide">Publish Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Classes</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Classes</CardDescription>
            <CardTitle className="text-3xl text-success">
              {courses.filter(c => c.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[150px] font-bold text-foreground">Room Number</TableHead>
                <TableHead className="font-bold text-foreground">Class</TableHead>
                <TableHead className="font-bold text-foreground">Class Timing</TableHead>
                <TableHead className="font-bold text-foreground">Teacher</TableHead>
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
                filteredCourses.map((course) => (
                  <TableRow key={course.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold tracking-tighter text-lg text-primary">
                      {course.roomNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-base leading-none mb-1">{course.title}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={cn("text-[9px] h-4 px-1 py-0 uppercase tracking-tighter", getLevelColor(course.level))}>
                            {course.level}
                          </Badge>
                          <Badge className={cn("text-[8px] h-3.5 px-1 py-0 uppercase tracking-tighter", getStatusColor(course.status))}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-editorial-meta">
                      {course.schedule}
                    </TableCell>
                    <TableCell className="font-serif font-bold text-base">
                      {course.teacherName}
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
                          <DropdownMenuItem>
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
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold">Class Details</DialogTitle>
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
                <h3 className="text-xl font-semibold">{selectedCourse.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedCourse.description}</p>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium">{selectedCourse.teacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedCourse.duration}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                <p className="font-medium">{selectedCourse.schedule}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Enrollment Capacity</span>
                  <span className="font-medium">{selectedCourse.enrolled} / {selectedCourse.capacity}</span>
                </div>
                <Progress value={(selectedCourse.enrolled / selectedCourse.capacity) * 100} className="h-3" />
              </div>

              <div className="grid gap-4 grid-cols-2 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedCourse.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedCourse.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
