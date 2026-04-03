'use client'

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
  User,
  Wallet,
  Calculator,
  CheckCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import type { Teacher } from '@/lib/types'

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

export default function TeachersPage() {
  const { teachers, addTeacher, removeTeacher, updateTeacherStatus, updateTeacher, courses, students, feePayments, updateTeacherReviewFlag } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFinanceViewOpen, setIsFinanceViewOpen] = useState(false)
  const [compensationModel, setCompensationModel] = useState<'fixed' | 'percentage'>('fixed')
  const [compensationRate, setCompensationRate] = useState<number>(0)

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.assignedClass && teacher.assignedClass.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: formData.get('name') as string,
      email: (formData.get('email') as string).toLowerCase().trim(),
      phone: formData.get('phone') as string,
      employeeId: formData.get('employeeId') as string,
      employeePassword: formData.get('password') as string, // Added this line
      subjects: [], 
      qualifications: [],
      status: 'active',
      joinedAt: new Date().toISOString(),
      coursesCount: 0,
      studentsCount: 0,
    }
    
    try {
      await addTeacher(newTeacher)
      setIsAddDialogOpen(false)
      toast.success('Teacher added successfully')
    } catch (error) {
      // Error handled by context toast
    }
  }

  const handleToggleStatus = (teacher: Teacher) => {
    updateTeacherStatus(teacher.id, teacher.status === 'active' ? 'inactive' : 'active')
    toast.success(`Teacher ${teacher.status === 'active' ? 'deactivated' : 'activated'}`)
  }

  const handleEditTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTeacher) return
    const formData = new FormData(e.currentTarget)
    const updatedData: Partial<Teacher> = {
      name: formData.get('name') as string,
      email: (formData.get('email') as string).toLowerCase().trim(),
      phone: formData.get('phone') as string,
      employeeId: formData.get('employeeId') as string,
      assignedClass: formData.get('assignedClass') as string,
    }
    
    // Only update password if provided
    const password = formData.get('password') as string
    if (password) {
      updatedData.employeePassword = password
    }

    try {
      await updateTeacher(selectedTeacher.id, updatedData)
      setIsEditDialogOpen(false)
      setSelectedTeacher(null)
      toast.success('Teacher record updated')
    } catch (error) {
      // Handled by context
    }
  }

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm('Are you sure you want to permanently remove this professional from the registry?')) return
    await removeTeacher(teacher.id)
    toast.success('Teacher removed from registry')
  }

  const getTeacherFinancials = () => {
    if (!selectedTeacher) return { roster: [], paidCount: 0, unpaidCount: 0, totalPaidRevenue: 0 }
    const tCourses = courses.filter(c => c.teacherId === selectedTeacher.id)
    
    let paidCount = 0
    let unpaidCount = 0
    let totalPaidRevenue = 0
    let roster: any[] = []

    tCourses.forEach(course => {
      // Find students strictly enrolled in this specific batch/course ID
      const courseStudents = students.filter(s => s.enrolledCourses?.includes(course.id))
      courseStudents.forEach(student => {
        const payment = feePayments.find((fp: any) => fp.studentId === student.id && fp.courseId === course.id)
        const isPaid = payment && (payment.status === 'paid' || payment.status === 'partial')
        if (isPaid) {
          paidCount++
          totalPaidRevenue += (payment.amountPaid || 0)
        } else {
          unpaidCount++
        }
        roster.push({
          studentName: student.name,
          courseName: course.title,
          timing: course.schedule,
          status: isPaid ? 'Paid' : 'Due',
          amount: isPaid ? payment.amountPaid : 0
        })
      })
    })

    return { roster, paidCount, unpaidCount, totalPaidRevenue }
  }

  const { roster, paidCount, unpaidCount, totalPaidRevenue } = selectedTeacher && isFinanceViewOpen 
    ? getTeacherFinancials() 
    : { roster: [], paidCount: 0, unpaidCount: 0, totalPaidRevenue: 0 }

  const computedSalary = compensationModel === 'fixed' 
    ? paidCount * compensationRate 
    : totalPaidRevenue * (compensationRate / 100)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Academic Faculty
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your teaching staff and assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 shadow-lg shadow-primary/20 uppercase tracking-[0.15em] font-normal text-xs rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card/80 backdrop-blur-xl border-primary/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Add New Teacher</DialogTitle>
              <DialogDescription className="text-editorial-meta">
                Register a new academic professional to the academy registry.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTeacher}>
              <div className="flex gap-6 items-start py-6 px-1">
                <div className="pt-2">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10 transition-premium">
                    <AvatarFallback className="bg-primary/5 text-primary/40">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <FieldGroup className="flex-1 space-y-4">
                  <Field>
                    <FieldLabel className="text-editorial-label">Teacher Full Name</FieldLabel>
                    <Input name="name" placeholder="Enter teacher's full name" required className="bg-background/50" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="text-editorial-label">Employee ID</FieldLabel>
                      <Input name="employeeId" placeholder="e.g. EMP-101" required className="bg-background/50" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-editorial-label">Portal Password</FieldLabel>
                      <SecureInput name="password" placeholder="••••••••" required className="bg-background/50" />
                      <p className="text-[9px] text-muted-foreground mt-1 opacity-70">Institutional policy: Minimum 8 characters.</p>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="text-editorial-label">Phone Number</FieldLabel>
                      <Input name="phone" placeholder="+92 300 1234567" required className="bg-background/50" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-editorial-label">Academic Email</FieldLabel>
                      <Input name="email" type="email" placeholder="teacher@academy.com" required className="bg-background/50 text-[10px]" />
                    </Field>
                  </div>
                </FieldGroup>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" className="px-8 font-normal uppercase tracking-wide">Add Professional</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Total Teachers</CardDescription>
            <CardTitle className="text-3xl">{teachers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Active Teachers</CardDescription>
            <CardTitle className="text-3xl text-success">
              {teachers.filter(t => t.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Inactive Teachers</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {teachers.filter(t => t.status === 'inactive').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card className="bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Teachers</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/5 h-16 border-b border-primary/5">
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>ID & Class</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No teachers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-normal">{teacher.name}</p>
                              {teacher.requiresReview && (
                                <ShieldCheck className="w-3.5 h-3.5 text-warning" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-normal">{teacher.employeeId}</span>
                          <span className="text-xs text-muted-foreground">{teacher.assignedClass || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.coursesCount}</TableCell>
                      <TableCell>{teacher.studentsCount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={teacher.status === 'active' ? 'default' : 'secondary'}
                          className={teacher.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                        >
                          {teacher.status}
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
                            <DropdownMenuItem onSelect={(e) => {
                               e.preventDefault()
                               setSelectedTeacher(teacher)
                               setIsFinanceViewOpen(true)
                             }}>
                               <Wallet className="w-4 h-4 mr-2" />
                               Payroll & Roster
                             </DropdownMenuItem>
                             <DropdownMenuItem onSelect={(e) => {
                               e.preventDefault()
                               setSelectedTeacher(teacher)
                               setIsViewDialogOpen(true)
                             }}>
                               <Eye className="w-4 h-4 mr-2" />
                               View Details
                             </DropdownMenuItem>
                             <DropdownMenuItem onSelect={(e) => {
                               e.preventDefault()
                               setSelectedTeacher(teacher)
                               setIsEditDialogOpen(true)
                             }}>
                               <Edit className="w-4 h-4 mr-2" />
                               Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleToggleStatus(teacher)}>
                               {teacher.status === 'active' ? (
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
                               className="flex items-center justify-between cursor-default focus:bg-warning/5"
                               onSelect={(e) => {
                                 e.preventDefault()
                                 updateTeacherReviewFlag(teacher.id, !teacher.requiresReview)
                                 toast.success(!teacher.requiresReview
                                   ? `${teacher.name.split(' ')[0]}'s papers will require review`
                                   : `${teacher.name.split(' ')[0]} can now publish directly`
                                 )
                               }}
                             >
                               <div className="flex items-center gap-2">
                                 <ShieldCheck className="w-4 h-4 text-warning" />
                                 <span className="text-warning">Paper Review Mode</span>
                               </div>
                               <Switch
                                 checked={!!teacher.requiresReview}
                                 className="scale-75 data-[state=checked]:bg-warning pointer-events-none"
                               />
                             </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={() => handleDelete(teacher)}
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
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                No teachers found in the registry.
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-premium active:scale-[0.98]"
                  onClick={() => {
                    setSelectedTeacher(teacher)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary font-normal">
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-normal text-base leading-none mb-1">{teacher.name}</h4>
                          {teacher.requiresReview && (
                            <ShieldCheck className="w-3.5 h-3.5 text-warning" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-60">
                          {teacher.employeeId}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={teacher.status === 'active' ? 'default' : 'secondary'}
                      className={cn("text-[8px] px-1.5 py-0 uppercase tracking-tighter", teacher.status === 'active' ? 'bg-success' : '')}
                    >
                      {teacher.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-normal uppercase tracking-tighter text-[9px]">Registry Email</p>
                      <p className="font-normal line-clamp-1">{teacher.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-normal uppercase tracking-tighter text-[9px]">Assigned Class</p>
                      <p className="font-normal text-primary truncate">
                        {teacher.assignedClass || 'Level TBC'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t gap-2">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="font-normal text-sm leading-none">{teacher.coursesCount}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-tight font-normal">Classes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-normal text-sm leading-none">{teacher.studentsCount}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-tight font-normal">Students</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                        <DropdownMenuItem onSelect={(e) => {
                          e.preventDefault()
                          setSelectedTeacher(teacher)
                          setIsFinanceViewOpen(true)
                        }}>
                          <Wallet className="w-4 h-4 mr-2" /> Payroll & Roster
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={(e) => {
                           e.preventDefault()
                           setSelectedTeacher(teacher)
                           setIsEditDialogOpen(true)
                         }}>
                           <Edit className="w-4 h-4 mr-2" /> Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem onSelect={(e) => {
                           e.preventDefault()
                           setSelectedTeacher(teacher)
                           setIsViewDialogOpen(true)
                         }}>
                           <Eye className="w-4 h-4 mr-2" /> View Details
                         </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => handleToggleStatus(teacher)}>
                           <UserX className="w-4 h-4 mr-2" /> 
                           {teacher.status === 'active' ? 'Deactivate' : 'Activate'}
                         </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-default focus:bg-warning/5 rounded-xl"
                          onSelect={(e) => {
                            e.preventDefault()
                            updateTeacherReviewFlag(teacher.id, !teacher.requiresReview)
                            toast.success(!teacher.requiresReview
                              ? `${teacher.name.split(' ')[0]}'s papers will require review`
                              : `${teacher.name.split(' ')[0]} can now publish directly`
                            )
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-warning" />
                            <span className="text-warning text-xs">Review Mode</span>
                          </div>
                          <Switch
                            checked={!!teacher.requiresReview}
                            className="scale-75 data-[state=checked]:bg-warning pointer-events-none"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive rounded-xl"
                          onSelect={() => handleDelete(teacher)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove Professional
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Teacher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-card/85 backdrop-blur-2xl border-primary/10 shadow-22xl p-0 overflow-hidden">
          {selectedTeacher && (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Header Splash */}
              <div className="bg-primary/5 p-8 pb-12 relative overflow-hidden h-40">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <User className="h-40 w-40 -mr-16 -mt-16 text-primary rotate-12" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-serif">
                      {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-normal tracking-tight">{selectedTeacher.name}</h3>
                    <div className="flex gap-2">
                      <Badge 
                        variant={selectedTeacher.status === 'active' ? 'default' : 'secondary'}
                        className={cn("px-3 py-0.5 uppercase tracking-[0.1em] text-[8px]", selectedTeacher.status === 'active' ? 'bg-success' : '')}
                      >
                        {selectedTeacher.status}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-0.5 uppercase tracking-[0.1em] text-[8px] bg-background/50">
                        ID: {selectedTeacher.employeeId}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Grid Area - Scrolling only on content, header is fixed */}
              <div className="flex-1 overflow-y-auto px-8 pb-8 -mt-4 bg-background rounded-t-[2.5rem] relative z-20 space-y-8 pt-4">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Institutional Payload</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm p-3 bg-muted/20 rounded-xl">
                        <Mail className="w-4 h-4 text-primary opacity-60" />
                        <span className="font-normal opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">{selectedTeacher.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm p-3 bg-muted/20 rounded-xl">
                        <Phone className="w-4 h-4 text-primary opacity-60" />
                        <span className="font-normal opacity-80">{selectedTeacher.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Primary Assignment</p>
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-normal opacity-60">Designated Level</p>
                        <p className="font-serif text-lg">{selectedTeacher.assignedClass || 'Unassigned'}</p>
                      </div>
                      <ShieldCheck className="w-8 h-8 text-primary opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal mb-6">Performance Metrics</p>
                  <div className="grid gap-3 grid-cols-3">
                    <div className="bg-muted/10 p-5 rounded-2xl text-center shadow-inner-premium flex flex-col justify-center">
                      <p className="text-3xl font-serif font-normal text-primary leading-none mb-2">{selectedTeacher.coursesCount}</p>
                      <p className="text-[8px] uppercase tracking-[0.2em] opacity-40">Active Batches</p>
                    </div>
                    <div className="bg-muted/10 p-5 rounded-2xl text-center shadow-inner-premium flex flex-col justify-center">
                      <p className="text-3xl font-serif font-normal text-primary leading-none mb-2">{selectedTeacher.studentsCount}</p>
                      <p className="text-[8px] uppercase tracking-[0.2em] opacity-40">Enrolled Pupils</p>
                    </div>
                    <div className="bg-muted/10 p-5 rounded-2xl text-center shadow-inner-premium flex flex-col justify-center items-center">
                      <p className="text-base font-serif font-normal leading-none mb-2 uppercase">
                        {new Date(selectedTeacher.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[8px] uppercase tracking-[0.2em] opacity-40">Registration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Financial Roster Dialog */}
      <Dialog open={isFinanceViewOpen} onOpenChange={setIsFinanceViewOpen}>
        <DialogContent className="max-w-4xl bg-card/90 backdrop-blur-2xl border-primary/10 shadow-22xl overflow-hidden p-0 md:p-6 max-h-[90vh] flex flex-col">
          <DialogHeader className="pt-4 flex-shrink-0">
            <DialogTitle className="font-serif text-3xl font-normal tracking-tight">Unified Roster & Payroll</DialogTitle>
            <DialogDescription className="text-editorial-meta mt-1">
              Financial and enrollment payload strictly bound to {selectedTeacher?.name}'s specific batches.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 overflow-y-auto flex-1 h-full pr-1 px-1">
            <div className="space-y-6 md:col-span-4 flex flex-col">
              <Card className="bg-primary/5 border border-primary/10 shadow-inner-premium rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Salary Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Compensation Model</label>
                    <Select value={compensationModel} onValueChange={(val: any) => setCompensationModel(val)}>
                      <SelectTrigger className="h-10 bg-background/50 text-xs w-full px-4 overflow-hidden">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Rate (Per Head)</SelectItem>
                        <SelectItem value="percentage">Revenue Share (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Rate Input</label>
                    <Input 
                      type="number" 
                      value={compensationRate}
                      onChange={(e) => setCompensationRate(Number(e.target.value) || 0)}
                      className="bg-background/50 h-10 font-serif" 
                      placeholder={compensationModel === 'fixed' ? 'e.g. 1000' : 'e.g. 50'} 
                    />
                  </div>
                  <div className="pt-4 mt-2 border-t border-primary/10">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Generated Payout</p>
                    <p className="text-2xl font-serif text-primary tracking-tight font-normal">Rs. {computedSalary.toLocaleString()}</p>
                    <p className="text-[8px] text-muted-foreground mt-1 leading-normal opacity-70">
                      *Refined from {paidCount} paid students.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-success/5 border border-success/20 rounded-2xl p-4 text-center text-success flex flex-col justify-center">
                  <p className="font-serif text-2xl leading-none mb-1">{paidCount}</p>
                  <p className="text-[8px] uppercase tracking-widest opacity-60">Paid Students</p>
                </div>
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 text-center text-destructive flex flex-col justify-center">
                  <p className="font-serif text-2xl leading-none mb-1">{unpaidCount}</p>
                  <p className="text-[8px] uppercase tracking-widest opacity-60">Unpaid & Due</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 bg-background/50 rounded-[2rem] border border-border/50 overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="p-4 bg-muted/20 border-b border-border/50 flex items-center justify-between sticky top-0">
                <h4 className="font-normal uppercase tracking-widest text-xs">Assigned Batch Ledger</h4>
                <Badge variant="outline" className="text-[10px] font-normal tracking-wider">Total: {roster.length} Students</Badge>
              </div>
              <div className="overflow-y-auto p-0 flex-1">
                {roster.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                    <p>No students enrolled in this instructor's batches yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-normal uppercase tracking-widest text-[9px] h-10">Student</TableHead>
                        <TableHead className="font-normal uppercase tracking-widest text-[9px] h-10">Batch Info</TableHead>
                        <TableHead className="font-normal uppercase tracking-widest text-[9px] h-10 text-right">Fee Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roster.map((r, i) => (
                        <TableRow key={i} className="group hover:bg-muted/10">
                          <TableCell className="font-serif text-sm py-3 font-normal">{r.studentName}</TableCell>
                          <TableCell className="py-3">
                            <p className="font-normal text-xs">{r.courseName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.timing}</p>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[9px] tracking-widest uppercase font-normal",
                                r.status === 'Paid' ? 'bg-success/5 text-success border-success/20' : 'bg-destructive/5 text-destructive border-destructive/20'
                              )}
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card/80 backdrop-blur-xl border-primary/10 shadow-22xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Modify Teacher Record</DialogTitle>
            <DialogDescription className="text-editorial-meta">
              Update institutional credentials and assignments for the academic faculty.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTeacher}>
            <div className="max-h-[60vh] overflow-y-auto px-1">
              <div className="flex gap-6 items-start py-4">
                <div className="pt-2">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10 transition-premium shadow-lg">
                    <AvatarFallback className="bg-primary/5 text-primary/40 font-serif">
                      {selectedTeacher?.name.split(' ').map(n => n[0]).join('') || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <FieldGroup className="flex-1 space-y-3">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 h-auto">Legal Identity</FieldLabel>
                    <Input name="name" defaultValue={selectedTeacher?.name} required className="bg-background/50 h-10" placeholder="Full name as per registry" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 h-auto">Employee ID</FieldLabel>
                      <Input name="employeeId" defaultValue={selectedTeacher?.employeeId} required className="bg-background/50 h-10 font-mono" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 h-auto">Portal Access</FieldLabel>
                      <SecureInput name="password" placeholder="••••••••" className="bg-background/50 h-10" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 h-auto">Registry Contact</FieldLabel>
                      <Input name="phone" defaultValue={selectedTeacher?.phone} required className="bg-background/50 h-10" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 h-auto">Institutional Mail</FieldLabel>
                      <Input name="email" type="email" defaultValue={selectedTeacher?.email} required className="bg-background/50 h-10 text-[11px]" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 h-auto">Current Batch Level</FieldLabel>
                    <Select name="assignedClass" defaultValue={selectedTeacher?.assignedClass || ''}>
                      <SelectTrigger className="h-10 bg-background/50 font-normal">
                        <SelectValue placeholder="No level assigned" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </div>
            </div>
            <DialogFooter className="pt-2 mt-4 border-t border-border/50 pt-4 flex-shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-muted-foreground hover:text-foreground h-11 px-8 text-xs uppercase tracking-widest">
                Cancel
              </Button>
              <Button type="submit" className="h-11 px-10 font-normal uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
