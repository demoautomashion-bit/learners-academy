'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { SESSION_TIMINGS } from '@/lib/registry'
import type { Student } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  guardianName: z.string().min(2, 'Guardian name must be at least 2 characters'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  phone: z.string().min(5, 'Enter a valid phone number'),
  course: z.string().min(1, 'Please select a class'),
  timing: z.string().min(1, 'Please select a timing'),
})

type StudentFormValues = z.infer<typeof studentSchema>

export default function StudentsPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [timingFilter, setTimingFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const { students, courses: mockCourses, removeStudent, updateStudentStatus, updateStudent, isInitialized } = useData()

  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema)
  })

  if (!isInitialized) return <DashboardSkeleton />

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
    if (!student) return false
    
    const matchesSearch = 
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const enrolledCourses = Array.isArray(student.enrolledCourses) ? student.enrolledCourses : []
    const matchesClass = classFilter === 'all' || enrolledCourses.includes(classFilter)
    const matchesTiming = timingFilter === 'all' || student.classTiming === timingFilter

    return matchesSearch && matchesStatus && matchesClass && matchesTiming
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

  const columns: Column<Student>[] = [
    {
      label: 'Student ID',
      render: (student) => (
        <span className="font-sans font-normal text-primary">
          {student.studentId || 'ID-TBC'}
        </span>
      ),
      width: '120px'
    },
    {
      label: 'Name',
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-normal">
              {student?.name?.split(' ').map(n => n[0]).join('') || 'S'}
            </AvatarFallback>
          </Avatar>
          <p className="font-normal">{student.name}</p>
        </div>
      ),
      width: '250px'
    },
    {
      label: 'Guardian Name',
      render: (student) => (
        <span className="text-muted-foreground font-normal opacity-60">
          {student.guardianName || 'N/A'}
        </span>
      )
    },
    {
      label: 'Class (Timing)',
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-normal text-sm">
            {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title || 'Registry Level'}
          </span>
          <span className="text-xs text-muted-foreground font-normal opacity-50">
            {student.classTiming || 'Timing TBC'}
          </span>
        </div>
      )
    },
    {
      label: 'Phone Number',
      render: (student) => (
        <span className="font-sans text-xs opacity-70 font-normal">
          {student.phone}
        </span>
      )
    },
    {
      label: '',
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
              <MoreHorizontal className="w-4 h-4 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-xs font-normal opacity-40 px-4 py-2">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem asChild className="cursor-pointer py-2.5">
              <Link href={`/admin/students/${student.id}`} className="flex items-center w-full">
                <Eye className="w-4 h-4 mr-2 opacity-60" />
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
            }} className="cursor-pointer py-2.5">
              <Edit className="w-4 h-4 mr-2 opacity-60" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(student)} className="cursor-pointer py-2.5">
              {student.status === 'active' ? (
                <>
                  <UserX className="w-4 h-4 mr-2 opacity-60" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2 opacity-60" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer py-2.5"
              onClick={() => handleDelete(student)}
            >
              <Trash2 className="w-4 h-4 mr-2 opacity-60" />
              Remove
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
        title="Students"
        description="Manage student enrollments and track their progress."
        actions={
          <Button asChild className="shadow-lg shadow-primary/20 font-normal">
            <Link href="/admin/students/registration">
              <Plus className="w-4 h-4 mr-2" />
              Enroll Student
            </Link>
          </Button>
        }
      />

      <EntityCardGrid 
        data={[
          { label: 'Total Students', value: students.length, sub: 'Academy Roster' },
          { label: 'Active Students', value: students?.filter(s => s.status === 'active').length, sub: 'Currently Enrolled', color: 'text-success' },
        ]}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-normal opacity-60">{stat.label}</CardDescription>
              <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>
                {stat.value}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-normal opacity-40 mt-1">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <EntityDataGrid 
        title="All Students"
        data={filteredStudents}
        columns={columns}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 text-xs font-normal">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[160px] h-10 text-xs font-normal">
                <SelectValue placeholder="Class Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {mockCourses?.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timingFilter} onValueChange={setTimingFilter}>
              <SelectTrigger className="w-[180px] h-10 text-xs font-normal">
                <SelectValue placeholder="Session Timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Timings</SelectItem>
                {SESSION_TIMINGS?.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/10 focus:bg-background transition-all h-10 text-sm font-normal"
              />
            </div>
          </div>
        }
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-primary font-medium">Edit Record</DialogTitle>
            <DialogDescription className="text-xs font-normal opacity-60">Modify essential student protocols and enrollment settings.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <FieldGroup className="py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Student Name</FieldLabel>
                  <Input {...editForm.register('name')} className="bg-background h-10 font-normal" />
                </Field>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Guardian Name</FieldLabel>
                  <Input {...editForm.register('guardianName')} className="bg-background h-10 font-normal" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Student ID</FieldLabel>
                  <Input {...editForm.register('studentId')} className="bg-background h-10 font-normal" />
                </Field>
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Phone</FieldLabel>
                  <Input {...editForm.register('phone')} className="bg-background h-10 font-normal" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <Field>
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Registry Class</FieldLabel>
                  <Select 
                    onValueChange={(val) => editForm.setValue('course', val)}
                    defaultValue={selectedStudent?.enrolledCourses[0]}
                  >
                    <SelectTrigger className="bg-background h-10 font-normal text-sm">
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
                  <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Timing</FieldLabel>
                  <Select 
                    onValueChange={(val) => editForm.setValue('timing', val)}
                    defaultValue={selectedStudent?.classTiming}
                  >
                    <SelectTrigger className="bg-background h-10 font-normal text-sm">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TIMINGS?.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="pt-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-xs font-normal">Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting} className="font-normal shadow-xl shadow-primary/20">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
