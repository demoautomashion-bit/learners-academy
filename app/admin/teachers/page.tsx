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
  Users
} from 'lucide-react'
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
  const { teachers, removeTeacher, updateTeacher, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher =>
    (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusToggle = async (teacher: Teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active'
    try {
      await updateTeacher(teacher.id, { status: newStatus as any })
      toast.success(`Faculty status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Permanently remove this faculty member from the institutional registry?")) {
      try {
        await removeTeacher(id)
        toast.success("Personnel record purged")
      } catch (error) {
        toast.error("Error during record deletion")
      }
    }
  }

  const columns: Column<Teacher>[] = [
    {
      label: 'Instructor Profile',
      render: (teacher) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(teacher.name, 'T')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{teacher.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">{teacher.employeeId}</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Specialization',
      render: (teacher) => (
        <div className="flex flex-col">
          <span className="text-xs font-normal text-foreground">{teacher.subject}</span>
          <span className="text-[10px] text-primary/70 font-medium opacity-60 mt-1 uppercase tracking-tighter">Academic Faculty</span>
        </div>
      )
    },
    {
      label: 'Status',
      render: (teacher) => (
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all",
          teacher.status === 'active' 
            ? "bg-success/5 text-success border border-success/10" 
            : "bg-muted text-muted-foreground border border-transparent"
        )}>
          {teacher.status === 'active' ? (
            <>
              <div className="w-1 h-1 bg-success rounded-full animate-pulse" />
              Operational
            </>
          ) : (
            'Hibernated'
          )}
        </div>
      )
    },
    {
      label: 'Contact Context',
      render: (teacher) => (
        <div className="flex items-center gap-4 text-muted-foreground opacity-40">
           <Mail className="w-4 h-4" />
           <Phone className="w-4 h-4" />
        </div>
      )
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
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Personnel Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <ExternalLink className="w-4 h-4 opacity-60" /> <span className="text-xs">Inspect Dossier</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => handleStatusToggle(teacher)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              {teacher.status === 'active' ? (
                <><XCircle className="w-4 h-4 text-destructive opacity-80" /> <span className="text-xs">Revoke Authority</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4 text-success opacity-80" /> <span className="text-xs">Restore Authority</span></>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(teacher.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Purge Record</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Active Faculty', value: teachers.filter(t => t.status === 'active').length, sub: 'Currently Operational', icon: ShieldCheck, color: 'text-success' },
    { label: 'Total Personnel', value: teachers.length, sub: 'Institutional Registry', icon: Users, color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Faculty Roster"
        description="Comprehensive audit of institutional staff, specialized instructors, and administrative personnel."
        actions={
          <Button 
            className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => router.push('/admin/teachers/registration')}
          >
            <Plus className="w-4 h-4 mr-2" /> Register Faculty
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
          title="Institutional Staff Registry"
          description="Displaying operational status and specialized focus for all active personnel."
          data={filteredTeachers}
          columns={columns}
          actions={
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search staff registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">No personnel records found</p>
              <p className="text-xs mt-2 font-normal">System awaiting faculty registration data</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
