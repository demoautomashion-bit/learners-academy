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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ACADEMY_LEVELS } from '@/lib/registry'


export default function TeachersPage() {
  const router = useRouter()
  const { teachers, addTeacher, removeTeacher, updateTeacherStatus, updateTeacher, courses, students, feePayments, updateTeacherReviewFlag, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const filteredTeachers = teachers?.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.assignedClass && teacher.assignedClass.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
    await removeTeacher(teacher.id)
    toast.success('Teacher removed from registry')
  }

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
        <Button asChild className="h-12 px-8 shadow-lg shadow-primary/20 uppercase tracking-[0.15em] font-normal text-xs rounded-xl">
          <Link href="/admin/teachers/registration">
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Link>
        </Button>
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
              {teachers?.filter(t => t.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md hover-lift transition-premium border-primary/5 shadow-premium">
          <CardHeader className="pb-2">
            <CardDescription>Inactive Teachers</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {teachers?.filter(t => t.status === 'inactive').length}
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
                  filteredTeachers?.map((teacher) => (
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
                            <DropdownMenuItem asChild>
                               <Link href={`/admin/teachers/payroll?id=${teacher.id}`} className="flex items-center w-full">
                                 <Wallet className="w-4 h-4 mr-2" />
                                 Payroll & Roster
                               </Link>
                             </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                               <Link href={`/admin/teachers/${teacher.id}`} className="flex items-center w-full">
                                 <Eye className="w-4 h-4 mr-2" />
                                 View Details
                               </Link>
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
              filteredTeachers?.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-premium active:scale-[0.98] cursor-pointer"
                  onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/teachers/payroll?id=${teacher.id}`} className="flex items-center w-full">
                            <Wallet className="w-4 h-4 mr-2" /> Payroll & Roster
                          </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={(e) => {
                           e.preventDefault()
                           setSelectedTeacher(teacher)
                           setIsEditDialogOpen(true)
                         }}>
                           <Edit className="w-4 h-4 mr-2" /> Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           <Link href={`/admin/teachers/${teacher.id}`} className="flex items-center w-full">
                              <Eye className="w-4 h-4 mr-2" /> View Details
                           </Link>
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

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                        {ACADEMY_LEVELS?.map(level => (
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
