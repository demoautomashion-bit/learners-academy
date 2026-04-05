'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SecureInput } from '@/components/ui/secure-input'
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
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import type { Student } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  guardianName: z.string().min(2, 'Guardian name must be at least 2 characters'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(5, 'Enter a valid phone number'),
  course: z.string().min(1, 'Please select a class'),
  timing: z.string().min(1, 'Please select a timing'),
})

type StudentFormValues = z.infer<typeof studentSchema>

const ACADEMY_CLASSES = ACADEMY_LEVELS
const CLASS_TIMINGS = SESSION_TIMINGS

export default function StudentsPage() {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const { students, courses: mockCourses, enrollStudent, removeStudent, updateStudentStatus, updateStudent, updateStudentSuccessMetrics, feePayments, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />

  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema)
  })

  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const onEditSubmit = async (data: StudentFormValues) => {
    if (!selectedStudent) return
    try {
      await updateStudent(selectedStudent.id, {
        ...data,
        enrolledCourses: [data.course],
        classTiming: data.timing,
      })
      setIsEditDialogOpen(false)
      toast.success('Student record updated')
    } catch (err) {
      toast.error('Update failed')
    }
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student enrollments and track their progress
          </p>
        </div>
        <Button asChild className="h-12 px-8 shadow-lg shadow-primary/20 uppercase tracking-[0.15em] font-normal text-xs rounded-xl">
          <Link href="/admin/students/registration">
            <Plus className="w-4 h-4 mr-2" />
            Enroll Student
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Active Students</CardDescription>
            <CardTitle className="text-3xl text-success">
              {students?.filter(s => s.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden">
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
              <TableHeader className="bg-muted/5 h-16 border-b border-primary/5">
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
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-sans font-normal text-primary tracking-tighter">
                        {student.studentId || 'ID-TBC'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-normal">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-serif text-base font-normal">{student.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-normal">
                        {student.guardianName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-normal text-sm">
                            {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title || 'Registry Level'}
                          </span>
                          <span className="text-[10px] text-muted-foreground tracking-wide font-normal">
                            {student.classTiming || 'Timing TBC'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-sans text-xs opacity-70">
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
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${student.id}`} className="flex items-center w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedStudent(student)
                              editForm.reset({
                                name: student.name,
                                guardianName: student.guardianName || '',
                                studentId: student.studentId || '',
                                phone: student.phone,
                                course: student.enrolledCourses[0] || '',
                                timing: student.classTiming || '',
                              })
                              setIsEditDialogOpen(true)
                            }}>
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
              filteredStudents?.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-premium cursor-pointer"
                  onClick={() => router.push(`/admin/students/${student.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary font-normal">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-serif font-normal text-base leading-none mb-1">{student.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-60">
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

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-sans">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-normal uppercase tracking-tighter text-[9px]">Guardian</p>
                      <p className="font-normal line-clamp-1">{student.guardianName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-normal uppercase tracking-tighter text-[9px]">Class & Timing</p>
                      <p className="font-normal text-primary truncate">
                        {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title} ({student.classTiming})
                      </p>
                    </div>
                  </div>



                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="flex-1 h-9 rounded-xl text-xs font-normal"
                    >
                      <Link href={`/admin/students/${student.id}`}>
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Profile
                      </Link>
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

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl tracking-tight text-primary font-normal">Edit Record</DialogTitle>
            <DialogDescription className="text-editorial-meta">Modify essential student protocols and enrollment settings.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <FieldGroup className="py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-editorial-label">Student Name</FieldLabel>
                  <Input {...editForm.register('name')} className="bg-background/50 h-10" />
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label">Guardian Name</FieldLabel>
                  <Input {...editForm.register('guardianName')} className="bg-background/50 h-10" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-editorial-label">Student ID</FieldLabel>
                  <Input {...editForm.register('studentId')} className="bg-background/50 h-10" />
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label">Phone</FieldLabel>
                  <Input {...editForm.register('phone')} className="bg-background/50 h-10" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-editorial-label">Registry Class</FieldLabel>
                  <Select 
                    onValueChange={(val) => editForm.setValue('course', val)}
                    defaultValue={selectedStudent?.enrolledCourses[0]}
                  >
                    <SelectTrigger className="bg-background/50 h-10">
                      <SelectValue placeholder="Select class level" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourses?.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel className="text-editorial-label">Timing</FieldLabel>
                  <Select 
                    onValueChange={(val) => editForm.setValue('timing', val)}
                    defaultValue={selectedStudent?.classTiming}
                  >
                    <SelectTrigger className="bg-background/50 h-10">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_TIMINGS?.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting} className="font-normal">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
