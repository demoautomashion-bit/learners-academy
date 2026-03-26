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
} from 'lucide-react'
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
  const { teachers, addTeacher, removeTeacher, updateTeacherStatus } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

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
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      employeeId: formData.get('employeeId') as string,
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

  const handleDelete = (teacher: Teacher) => {
    removeTeacher(teacher.id)
    toast.success('Teacher removed successfully')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Teachers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your teaching staff and their assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Button type="submit" className="px-8 font-semibold uppercase tracking-wide">Add Professional</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Teachers</CardDescription>
            <CardTitle className="text-3xl">{teachers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Teachers</CardDescription>
            <CardTitle className="text-3xl text-success">
              {teachers.filter(t => t.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive Teachers</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {teachers.filter(t => t.status === 'inactive').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
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
              <TableHeader>
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
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.employeeId}</span>
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
                            <DropdownMenuItem onClick={() => {
                              setSelectedTeacher(teacher)
                              setIsViewDialogOpen(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(teacher)}>
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
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(teacher)}
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
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-serif font-bold text-base leading-none mb-1">{teacher.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
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
                      <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Registry Email</p>
                      <p className="font-semibold line-clamp-1">{teacher.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Assigned Class</p>
                      <p className="font-bold text-primary truncate">
                        {teacher.assignedClass || 'Level TBC'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t gap-2">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="font-bold text-sm leading-none">{teacher.coursesCount}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-tight">Classes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm leading-none">{teacher.studentsCount}</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-tight">Students</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTeacher(teacher)
                          setIsViewDialogOpen(true)
                        }}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(teacher)
                        }}>
                          <UserX className="w-4 h-4 mr-2" /> 
                          {teacher.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(teacher)
                          }}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTeacher.name}</h3>
                  <Badge 
                    variant={selectedTeacher.status === 'active' ? 'default' : 'secondary'}
                    className={selectedTeacher.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                  >
                    {selectedTeacher.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedTeacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedTeacher.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">ID: {selectedTeacher.employeeId}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Class: {selectedTeacher.assignedClass || 'None'}</Badge>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedTeacher.coursesCount}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedTeacher.studentsCount}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {new Date(selectedTeacher.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">Joined</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
