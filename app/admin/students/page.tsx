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
import { mockStudents, mockCourses } from '@/lib/mock-data'
import type { Student } from '@/lib/types'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
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
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      guardianName: formData.get('guardianName') as string,
      enrolledCourses: [],
      status: 'active',
      enrolledAt: new Date().toISOString().split('T')[0],
      progress: 0,
    }
    setStudents([...students, newStudent])
    setIsAddDialogOpen(false)
    toast.success('Student enrolled successfully')
  }

  const handleToggleStatus = (student: Student) => {
    setStudents(students.map(s => 
      s.id === student.id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ))
    toast.success(`Student ${student.status === 'active' ? 'deactivated' : 'activated'}`)
  }

  const handleDelete = (student: Student) => {
    setStudents(students.filter(s => s.id !== student.id))
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

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-muted-foreground'
    if (grade.startsWith('A')) return 'text-success'
    if (grade.startsWith('B')) return 'text-primary'
    if (grade.startsWith('C')) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll New Student</DialogTitle>
              <DialogDescription>
                Fill in the details to enroll a new student.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Student ID</FieldLabel>
                  <Input name="studentId" placeholder="e.g. STU-001" required />
                </Field>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input name="name" placeholder="Enter student's name" required />
                </Field>
                <Field>
                  <FieldLabel>Guardian&apos;s Name</FieldLabel>
                  <Input name="guardianName" placeholder="Enter guardian's name" required />
                </Field>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input name="email" type="email" placeholder="student@example.com" required />
                </Field>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input name="phone" placeholder="+1 (555) 000-0000" />
                </Field>
                <Field>
                  <FieldLabel>Enroll in Class</FieldLabel>
                  <Select name="course">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourses.filter(c => c.status === 'active').map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Enroll Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Graduated</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {students.filter(s => s.status === 'graduated').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Progress</CardDescription>
            <CardTitle className="text-3xl">
              {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
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
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrolled Classes</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {student.enrolledCourses.length} class{student.enrolledCourses.length !== 1 ? 'es' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getGradeColor(student.grade)}`}>
                          {student.grade || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={student.status === 'inactive' ? 'secondary' : 'default'}
                          className={getStatusColor(student.status)}
                        >
                          {student.status}
                        </Badge>
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
