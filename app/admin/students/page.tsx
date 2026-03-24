'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { motion, AnimatePresence } from 'framer-motion'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  Award,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import type { Student } from '@/lib/types'

const ACADEMY_CLASSES = [
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

const CLASS_TIMINGS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM'
]

export default function StudentsPage() {
  const { students, courses: mockCourses, enrollStudent, removeStudent, updateStudentStatus } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      studentId: formData.get('studentId') as string,
      name: formData.get('name') as string,
      email: '', // Removed from dialog as requested
      phone: formData.get('phone') as string,
      guardianName: formData.get('guardianName') as string,
      enrolledCourses: [formData.get('course') as string],
      classTiming: formData.get('timing') as string,
      status: 'active',
      enrolledAt: new Date().toISOString().split('T')[0],
      progress: 0,
    }
    enrollStudent(newStudent)
    setIsAddDialogOpen(false)
    toast.success('Registration successful')
  }

  const handleToggleStatus = (student: Student) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active'
    updateStudentStatus(student.id, nextStatus)
    toast.success(`Student ${nextStatus}`)
  }

  const handleDelete = (student: Student) => {
    removeStudent(student.id)
    toast.success('Student removed successfully')
  }

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success hover:bg-success/90'
      case 'graduated':
        return 'bg-primary hover:bg-primary/90'
      default:
        return ''
    }
  }

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'text-muted-foreground'
    if (grade >= 80) return 'text-success'
    if (grade >= 60) return 'text-primary'
    if (grade >= 40) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student enrollments and track their progress
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card/90 backdrop-blur-xl border-primary/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-bold tracking-tight">Registration Registry</DialogTitle>
              <DialogDescription className="text-editorial-meta">
                Onboard a new academic professional into the student database.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <FieldGroup className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Student Name</FieldLabel>
                    <Input name="name" placeholder="Full name" required className="bg-background/50 h-10" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Guardian&apos;s Name</FieldLabel>
                    <Input name="guardianName" placeholder="Full name" required className="bg-background/50 h-10" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Student ID</FieldLabel>
                    <Input name="studentId" placeholder="e.g. STU-001" required className="bg-background/50 h-10" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Phone Number</FieldLabel>
                    <Input name="phone" placeholder="+1 (555) 000-0000" className="bg-background/50 h-10" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Registry Class</FieldLabel>
                    <Select name="course" required>
                      <SelectTrigger className="bg-background/50 h-10">
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Class Timing</FieldLabel>
                    <Select name="timing" required>
                      <SelectTrigger className="bg-background/50 h-10">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_TIMINGS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-semibold uppercase tracking-wide">Register Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Students</CardDescription>
            <CardTitle className="text-3xl text-success">
              {students.filter(s => s.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Guardian Name</TableHead>
                  <TableHead>Class (Timing)</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-bold text-primary tracking-tighter">
                        {student.studentId || 'ID-TBC'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-serif font-bold text-base">{student.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {student.guardianName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title || 'Registry Level'}
                          </span>
                          <span className="text-[10px] text-muted-foreground tracking-wide font-medium">
                            {student.classTiming || 'Timing TBC'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs opacity-70">
                        {student.phone}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedStudent(student)
                              setIsViewDialogOpen(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                              {student.status === 'active' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(student)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
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

          {/* Mobile Card List View */}
          <div className="grid gap-4 md:hidden">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                No students found matching your criteria.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-premium"
                  onClick={() => {
                    setSelectedStudent(student)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-serif font-bold text-base leading-none mb-1">{student.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                          {student.studentId || 'ID-TBC'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={student.status === 'inactive' ? 'secondary' : 'default'}
                      className={cn("text-[8px] px-1.5 py-0 uppercase tracking-tighter", getStatusColor(student.status))}
                    >
                      {student.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Guardian</p>
                      <p className="font-semibold line-clamp-1">{student.guardianName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Class & Timing</p>
                      <p className="font-bold text-primary truncate">
                        {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title} ({student.classTiming})
                      </p>
                    </div>
                  </div>



                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 h-9 rounded-xl text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedStudent(student)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1 shadow-premium">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(student)
                        }} className="rounded-xl">
                          {student.status === 'active' ? (
                            <><UserX className="w-4 h-4 mr-2" /> Deactivate</>
                          ) : (
                            <><UserCheck className="w-4 h-4 mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(student)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <Badge 
                    variant={selectedStudent.status === 'inactive' ? 'secondary' : 'default'}
                    className={getStatusColor(selectedStudent.status)}
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center justify-center w-4 h-4 rounded bg-primary/10 text-[10px] font-bold text-primary">ID</div>
                  <span className="font-medium">{selectedStudent.studentId || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-semibold">Guardian:</span>
                  <span>{selectedStudent.guardianName || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Overall Progress</h4>
                <div className="flex items-center gap-4">
                  <Progress value={selectedStudent.progress} className="flex-1 h-3" />
                  <span className="text-lg font-semibold">{selectedStudent.progress}%</span>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3 pt-4 border-t">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{selectedStudent.enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5 text-success" />
                  </div>
                  <p className={`text-2xl font-bold ${getGradeColor(selectedStudent.grade)}`}>
                    {selectedStudent.grade || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Grade</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-2xl font-bold">
                    {new Date(selectedStudent.enrolledAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
