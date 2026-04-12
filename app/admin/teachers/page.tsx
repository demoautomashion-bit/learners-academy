'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SecureInput } from '@/components/ui/secure-input'
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
  User,
  Wallet,
  ShieldCheck,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import type { Teacher } from '@/lib/types'
import Link from 'next/link'
import { ACADEMY_LEVELS } from '@/lib/registry'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'

export default function TeachersPage() {
  const { teachers, updateTeacherStatus, removeTeacher, updateTeacher, updateTeacherReviewFlag, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  


  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher => {
    if (!teacher) return false
    return (
      (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.assignedClass && teacher.assignedClass.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

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

  const columns: Column<Teacher>[] = [
    {
      label: 'Teacher',
      render: (teacher) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary font-normal">
              {teacher?.name?.split(' ').map(n => n[0]).join('') || 'T'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-normal">{teacher.name}</p>
              {teacher.requiresReview && (
                <ShieldCheck className="w-3.5 h-3.5 text-warning" />
              )}
            </div>
            <p className="text-sm text-muted-foreground font-normal opacity-60">{teacher.email}</p>
          </div>
        </div>
      ),
      width: '300px'
    },
    {
      label: 'ID & Class',
      render: (teacher) => (
        <div className="flex flex-col">
          <span className="font-normal">{teacher.employeeId}</span>
          <span className="text-xs text-muted-foreground font-normal">{teacher.assignedClass || 'Not assigned'}</span>
        </div>
      )
    },
    { label: 'Classes', render: (teacher) => <span className="font-normal">{teacher.coursesCount}</span> },
    { label: 'Students', render: (teacher) => <span className="font-normal">{teacher.studentsCount}</span> },
    {
      label: 'Status',
      render: (teacher) => (
        <Badge 
          variant={teacher.status === 'active' ? 'default' : 'secondary'}
          className={cn("font-normal", teacher.status === 'active' ? 'bg-success hover:bg-success/90' : '')}
        >
          {teacher.status}
        </Badge>
      )
    },
    {
      label: '',
      render: (teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
              <MoreHorizontal className="w-4 h-4 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="text-xs font-normal opacity-40 px-4 py-2">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem asChild className="cursor-pointer py-2.5">
               <Link href={`/admin/teachers/payroll?id=${teacher.id}`} className="flex items-center w-full">
                 <Wallet className="w-4 h-4 mr-2 opacity-60" />
                 Payroll & Roster
               </Link>
             </DropdownMenuItem>
             <DropdownMenuItem asChild className="cursor-pointer py-2.5">
               <Link href={`/admin/teachers/${teacher.id}`} className="flex items-center w-full">
                 <Eye className="w-4 h-4 mr-2 opacity-60" />
                 View Details
               </Link>
             </DropdownMenuItem>
             <DropdownMenuItem onSelect={(e) => {
               e.preventDefault()
               setSelectedTeacher(teacher)
               setIsEditDialogOpen(true)
             }} className="cursor-pointer py-2.5">
               <Edit className="w-4 h-4 mr-2 opacity-60" />
               Edit
             </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleToggleStatus(teacher)} className="cursor-pointer py-2.5">
               {teacher.status === 'active' ? (
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
               className="flex items-center justify-between cursor-default focus:bg-warning/5 py-2.5"
               onSelect={(e) => {
                 e.preventDefault()
                 updateTeacherReviewFlag(teacher.id, !teacher.requiresReview)
                 toast.success(!teacher.requiresReview
                 ? `${teacher?.name?.split(' ')[0] || 'Teacher'}'s papers will require review`
                 : `${teacher?.name?.split(' ')[0] || 'Teacher'} can now publish directly`
                 )
               }}
             >
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-warning opacity-60" />
                 <span className="text-warning text-xs">Paper Review Mode</span>
               </div>
               <Switch
                 checked={!!teacher.requiresReview}
                 className="scale-75 data-[state=checked]:bg-warning pointer-events-none"
               />
             </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer py-2.5"
              onSelect={() => handleDelete(teacher)}
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

  if (!isInitialized) {
    return <DashboardSkeleton />
  }

  return (
    <PageShell>
      <PageHeader 
        title="Academic Faculty"
        description="Manage your teaching staff and assignments."
        actions={
          <Button asChild className="shadow-lg shadow-primary/20 font-normal">
            <Link href="/admin/teachers/registration">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Link>
          </Button>
        }
      />

      <EntityCardGrid 
        data={[
          { label: 'Total Teachers', value: teachers.length, sub: 'Faculty Roster' },
          { label: 'Active Teachers', value: teachers?.filter(t => t.status === 'active').length, sub: 'Currently Engaged', color: 'text-success' },
          { label: 'Inactive Teachers', value: teachers?.filter(t => t.status === 'inactive').length, sub: 'Off-Registry', color: 'text-muted-foreground' },
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
        columns={3}
      />

      <EntityDataGrid 
        title="All Teachers"
        data={filteredTeachers}
        columns={columns}
        actions={
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/10 focus:bg-background transition-all h-10 text-sm font-normal"
            />
          </div>
        }
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">Modify Teacher Record</DialogTitle>
            <DialogDescription className="text-xs font-normal opacity-60">
              Update institutional credentials and assignments for the academic faculty.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTeacher}>
            <div className="max-h-[60vh] overflow-y-auto px-1">
              <div className="flex gap-6 items-start py-4">
                <div className="pt-2">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10 transition-premium shadow-lg">
                    <AvatarFallback className="bg-primary/5 text-primary font-serif font-normal">
                    {selectedTeacher?.name?.split(' ').map(n => n[0]).join('') || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <FieldGroup className="flex-1 space-y-3">
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground mb-1.5 h-auto font-normal">Legal Identity</FieldLabel>
                    <Input name="name" defaultValue={selectedTeacher?.name} required className="bg-background h-10 font-normal" placeholder="Full name as per registry" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4 items-stretch">
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground mb-1 h-auto font-normal">Employee ID</FieldLabel>
                      <Input name="employeeId" defaultValue={selectedTeacher?.employeeId} required className="bg-background h-10 font-mono font-normal" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground mb-1 h-auto font-normal">Portal Access</FieldLabel>
                      <SecureInput name="password" placeholder="••••••••" className="bg-background h-10 font-normal" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-stretch">
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground mb-1 h-auto font-normal">Registry Contact</FieldLabel>
                      <Input name="phone" defaultValue={selectedTeacher?.phone} required className="bg-background h-10 font-normal" />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground mb-1 h-auto font-normal">Institutional Mail</FieldLabel>
                      <Input name="email" type="email" defaultValue={selectedTeacher?.email} required className="bg-background h-10 text-xs font-normal" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground mb-1 h-auto font-normal">Current Batch Level</FieldLabel>
                    <Select name="assignedClass" defaultValue={selectedTeacher?.assignedClass || ''}>
                      <SelectTrigger className="h-10 bg-background font-normal">
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
            <DialogFooter className="pt-2 mt-4 border-t border-border/50 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-muted-foreground hover:text-foreground h-11 px-8 text-xs font-normal">
                Cancel
              </Button>
              <Button type="submit" className="font-normal shadow-xl shadow-primary/20">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
