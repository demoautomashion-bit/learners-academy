'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Teacher } from '@/lib/types'

export default function TeachersPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, removeTeacher, updateTeacherStatus, updateTeacherReviewFlag, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher =>
    (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.subjects?.join(' ') || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusToggle = async (teacher: Teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active'
    try {
      await updateTeacherStatus(teacher.id, newStatus as any)
      toast.success(`Staff status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await removeTeacher(id)
        toast.success("Staff member deleted")
      } catch (error) {
        toast.error("Error deleting record")
      }
    }
  }

  const columns: Column<Teacher>[] = [
    {
      label: 'ID',
      render: (teacher) => (
        <span className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded">
          {teacher.employeeId}
        </span>
      ),
      width: '120px'
    },
    {
      label: 'Name',
      render: (teacher) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9 border shadow-sm transition-transform duration-500">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(teacher.name, 'T')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium leading-none">{teacher.name}</span>
        </div>
      ),
      width: '240px'
    },
    {
      label: 'Email',
      render: (teacher) => (
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <Mail className="w-3.5 h-3.5 opacity-40" />
          <span className="text-xs font-normal underline decoration-primary/10 underline-offset-4">{teacher.email}</span>
        </div>
      )
    },
    {
      label: 'Phone Number',
      render: (teacher) => (
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <Phone className="w-3.5 h-3.5 opacity-40" />
          <span className="text-xs font-normal tracking-tight">{teacher.phone}</span>
        </div>
      )
    },
    {
      label: 'Review Protocol',
      render: (teacher) => (
        <div className="flex items-center gap-3">
          <Switch 
            checked={!!teacher.requiresReview}
            onCheckedChange={async (checked) => {
              try {
                await updateTeacherReviewFlag(teacher.id, checked)
                toast.success(checked ? "Institutional Oversight Active" : "Direct Publishing Enabled", {
                    description: checked ? "Tests now require admin audit." : "Tests will go live automatically."
                })
              } catch (err) {
                toast.error("Protocol Sync Failed")
              }
            }}
            className="scale-90 data-[state=checked]:bg-primary"
          />
          <div className="flex flex-col">
            <span className={cn("text-[9px] font-bold uppercase tracking-widest", teacher.requiresReview ? "text-primary" : "text-muted-foreground opacity-40")}>
                {teacher.requiresReview ? "Mandatory Review" : "Pass-through"}
            </span>
          </div>
        </div>
      ),
      width: '180px'
    },
    {
      label: 'Actions',
      render: (teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <ExternalLink className="w-4 h-4 opacity-60" /> <span className="text-xs">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => handleStatusToggle(teacher)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              {teacher.status === 'active' ? (
                <><XCircle className="w-4 h-4 text-destructive opacity-80" /> <span className="text-xs">Deactivate</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4 text-success opacity-80" /> <span className="text-xs">Activate</span></>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(teacher.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Delete Record</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Staff Active', value: teachers.filter(t => t.status === 'active').length, sub: 'Currently Working', icon: ShieldCheck, color: 'text-success' },
    { label: 'Total Staff', value: teachers.length, sub: 'Portal Registry', icon: Users, color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Staff List"
        description="View and manage all teachers and administrative staff members."
        actions={
          <Button 
            className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => router.push('/admin/teachers/registration')}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{stat.label}</CardDescription>
                <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 mt-2 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="mt-12">
        <EntityDataGrid 
          title="Staff Registry"
          description="Manage staff status and details for all active members."
          data={filteredTeachers}
          columns={columns}
          actions={
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">No staff members found</p>
              <p className="text-xs mt-2 font-normal">Add a staff member to see them here.</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
