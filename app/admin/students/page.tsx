'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  GraduationCap,
  History,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Filter,
  Users,
  UserCheck,
  Hash,
  Clock,
  ArrowUpRight,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Pencil
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Student } from '@/lib/types'
import { ACADEMY_LEVELS, SESSION_TIMINGS } from '@/lib/registry'
import { motion } from 'framer-motion'
import { isToday, parseISO } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function StudentsPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, removeStudent, updateStudent, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const initialLevel = searchParams.get('level') || 'all'
  const [levelFilter, setLevelFilter] = useState<string>(initialLevel)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const TIER_FILTERS = ['all', 'Pre-Foundation', 'Foundation', 'Level', 'Advanced', 'Professional']

  const filteredStudents = useMemo(() => {
    return (Array.isArray(students) ? students : []).filter(student => {
      const matchesSearch = 
        (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.guardianName || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesLevel = levelFilter === 'all' || 
                           (student.grade || '').toLowerCase().includes(levelFilter.toLowerCase())
      return matchesSearch && matchesLevel
    })
  }, [students, searchQuery, levelFilter])

  const dailyAdmissions = useMemo(() => {
    return (Array.isArray(students) ? students : []).filter(s => {
        const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
        return d && isToday(d)
    }).length
  }, [students])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student from the academy registry? This action cannot be undone.")) {
      try {
        await removeStudent(id)
        toast.active("Student Registry Updated", {
            description: "The learner's identity has been removed from the active registry."
        })
      } catch (error) {
        toast.error("Error deleting student record")
      }
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStudent = async (data: Partial<Student>) => {
    if (!editingStudent) return
    try {
        await updateStudent(editingStudent.id, data)
        setIsEditDialogOpen(false)
        setEditingStudent(null)
    } catch (error) {
        // useData already shows a toast
    }
  }

  const columns: Column<Student>[] = [
    {
      label: 'Student ID',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/5 flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-primary opacity-40" />
          </div>
          <span className="text-xs font-mono font-medium tracking-tight text-foreground/80">{student.studentId}</span>
        </div>
      ),
      width: '130px'
    },
    {
      label: 'Student Name',
      render: (student) => (
        <div className="flex items-center gap-4 group/name">
          <Avatar className="h-9 w-9 border border-primary/10 shadow-sm group-hover/name:scale-105 transition-transform duration-500">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(student.name, 'S')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{student.name}</span>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-muted-foreground opacity-40 uppercase tracking-widest font-bold">Enrolled</span>
            </div>
          </div>
        </div>
      ),
      width: '240px'
    },
    {
      label: 'Guardian Name',
      render: (student) => (
        <div className="flex items-center gap-3">
            <UserCheck className="w-3.5 h-3.5 text-primary opacity-30" />
            <span className="text-[11px] text-foreground/70 font-normal leading-tight">{student.guardianName || 'Not Specified'}</span>
        </div>
      ),
      width: '180px'
    },
    {
      label: 'Level & Timing',
      render: (student) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-tight text-primary/80">{student.grade || 'Unassigned'}</span>
           </div>
           <div className="flex items-center gap-2 opacity-40">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-medium uppercase tracking-tighter">{student.classTiming || 'Schedule Pending'}</span>
           </div>
        </div>
      ),
      width: '160px'
    },
    {
        label: 'Contact Info',
        render: (student) => (
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2.5 group/email cursor-pointer">
                <Mail className="w-3.5 h-3.5 text-primary opacity-30 group-hover/email:opacity-100 transition-opacity" />
                <span className="text-[10px] text-muted-foreground opacity-60 group-hover/email:opacity-100 transition-opacity whitespace-nowrap">{student.email || 'No Email'}</span>
             </div>
             <div className="flex items-center gap-2.5 group/phone cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-primary opacity-30 group-hover/phone:opacity-100 transition-opacity" />
                <span className="text-[10px] text-muted-foreground font-mono opacity-60 group-hover/phone:opacity-100 transition-opacity">{student.phone}</span>
             </div>
          </div>
        )
    },
    {
      label: 'Actions',
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-primary/5 transition-all">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 glass-2 border-white/5 shadow-2xl overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => router.push(`/admin/students/${student.id}`)}
               className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal rounded-lg"
            >
              <ExternalLink className="w-4 h-4 opacity-60" /> <span className="text-xs">View Performance</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
               onClick={() => handleEdit(student)}
               className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal rounded-lg"
            >
              <Pencil className="w-4 h-4 opacity-60" /> <span className="text-xs">Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(student.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal rounded-lg"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Delete Student</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/fee-registry`)}
                className="gap-4 cursor-pointer p-4 mt-2 focus:bg-success/5 text-success rounded-xl group"
            >
              <div className="w-10 h-10 rounded-xl bg-success/5 flex items-center justify-center border border-success/10 group-hover:bg-success group-hover:text-white transition-all">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-tight">Log Fee Payment</span>
                <span className="text-[9px] opacity-40 font-normal">Process Transaction</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px'
    }
  ]

  const stats = [
    { label: 'Students Active', value: (students || []).filter(s => s.status === 'active').length, sub: 'Currently Enrolled', icon: ShieldCheck, color: 'text-success' },
    { label: 'Total Students', value: (students || []).length, sub: 'Portal Registry', icon: Users, color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Student List"
        description="View and manage all students and their enrollment details."
        actions={
          <Button 
            className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all h-11 px-8 rounded-xl"
            onClick={() => router.push('/admin/students/registration')}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift transition-premium h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
              <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                {stat.label}
              </CardTitle>
              <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex-1">
              <div className="text-3xl font-sans font-normal">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2 opacity-40">
                <div className={cn("h-1 w-1 bg-primary/40", stat.color.replace('text-', 'bg-'))} />
                <span className="text-[10px] text-muted-foreground font-normal">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <EntityDataGrid 
          title="Student Registry"
          description="View and manage student details and enrollment status."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none w-full"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-32 space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/5">
                    <GraduationCap className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="font-serif text-2xl font-medium tracking-tight">No Identities Detected</p>
                    <p className="text-xs text-muted-foreground opacity-40 italic">Institutional registry awaiting personnel data intake.</p>
                </div>
            </div>
          }
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
        <DialogContent className="sm:max-w-[500px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl max-h-[90dvh]">
            {editingStudent && (
                <div className="flex flex-col max-h-[90dvh]">
                    <div className="p-8 pb-4">
                        <DialogHeader className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-2">
                                <Pencil className="w-6 h-6" />
                            </div>
                            <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Edit Student Profile</DialogTitle>
                            <p className="text-xs text-muted-foreground opacity-60">Modify enrollment details and academic identity.</p>
                        </DialogHeader>
                    </div>

                    <ScrollArea className="flex-1 px-8 min-h-0">
                        <form id="edit-student-form" onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            handleUpdateStudent({
                                studentId: formData.get('studentId') as string,
                                name: formData.get('name') as string,
                                guardianName: formData.get('guardianName') as string,
                                email: formData.get('email') as string,
                                phone: formData.get('phone') as string,
                                grade: formData.get('grade') as string,
                                classTiming: formData.get('classTiming') as string,
                            })
                        }} className="space-y-6 py-2">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Student ID</Label>
                                    <Input name="studentId" defaultValue={editingStudent.studentId} required className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Student Name</Label>
                                    <Input name="name" defaultValue={editingStudent.name} required className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Guardian Name</Label>
                                    <Input name="guardianName" defaultValue={editingStudent.guardianName} required className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Email (Optional)</Label>
                                        <Input name="email" defaultValue={editingStudent.email} className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Phone</Label>
                                        <Input name="phone" defaultValue={editingStudent.phone} required className="h-11 bg-muted/5 border-primary/5 rounded-xl text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pb-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Academic Tier</Label>
                                        <Select name="grade" defaultValue={editingStudent.grade}>
                                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm focus:ring-primary/20">
                                                <SelectValue placeholder="Select level..." />
                                            </SelectTrigger>
                                            <SelectContent className="glass-2 border-white/5">
                                                {ACADEMY_LEVELS.map((level) => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">Session Slot</Label>
                                        <Select name="classTiming" defaultValue={editingStudent.classTiming}>
                                            <SelectTrigger className="h-11 bg-muted/5 border-primary/5 rounded-xl px-4 text-sm focus:ring-primary/20">
                                                <SelectValue placeholder="Select timing..." />
                                            </SelectTrigger>
                                            <SelectContent className="glass-2 border-white/5">
                                                {SESSION_TIMINGS.map((slot) => (
                                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <div className="p-8 pt-4 flex flex-col gap-3">
                        <Button type="submit" form="edit-student-form" className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all font-medium">
                            Save Profile Changes
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
