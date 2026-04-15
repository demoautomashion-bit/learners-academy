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
  GraduationCap,
  History,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Filter,
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
import { Student } from '@/lib/types'

export default function StudentsPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, removeStudent, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const ACADEMY_LEVELS = ['Foundation', 'Core', 'Advanced', 'Specialized']

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
    const matchesSearch = 
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || (student.level || '').toLowerCase() === levelFilter.toLowerCase()
    return matchesSearch && matchesLevel
  })

  const handleDelete = async (id: string) => {
    if (confirm("Permanently archive this student dossier?")) {
      try {
        await removeStudent(id)
        toast.success("Academic dossier archived")
      } catch (error) {
        toast.error("Error during record archival")
      }
    }
  }

  const columns: Column<Student>[] = [
    {
      label: 'Candidate Identity',
      render: (student) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(student.name, 'S')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{student.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">{student.studentId}</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Academic Placement',
      render: (student) => (
        <Badge variant="outline" className="text-[10px] px-3 py-1 font-normal opacity-70 uppercase tracking-widest border-primary/10">
          {student.level} Tier
        </Badge>
      )
    },
    {
      label: 'Admission Date',
      render: (student) => (
        <div className="flex flex-col">
          <span className="text-[11px] text-foreground font-medium">{new Date(student.admissionDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[9px] text-muted-foreground opacity-40 uppercase font-normal mt-1 italic tracking-widest">Enrollment Cycle</span>
        </div>
      )
    },
    {
        label: 'Contact Context',
        render: (student) => (
          <div className="flex items-center gap-4 text-muted-foreground opacity-40">
             <Mail className="w-4 h-4" />
             <Phone className="w-4 h-4" />
          </div>
        )
    },
    {
      label: 'Actions',
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Candidate Protocols</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/students/${student.id}`)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <ExternalLink className="w-4 h-4 opacity-60" /> <span className="text-xs">Inspect Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <History className="w-4 h-4 opacity-60" /> <span className="text-xs">Academic History</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(student.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Archive Dossier</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Active Learners', value: students.length, sub: 'Academy Enrollment', icon: GraduationCap, color: 'text-primary' },
    { label: 'Institutional Capacity', value: '84%', sub: 'Resource Optimization', icon: Users, color: 'text-success' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Student Registry"
        description="Encrypted repository of student identities, academic tiers, and historical performance tracking."
        actions={
          <div className="flex items-center gap-4">
             <Button 
              variant="outline"
              className="font-normal border-primary/5 hover:bg-primary/5"
              onClick={() => router.push('/admin/students/enrollment-trend')}
            >
              <History className="w-4 h-4 mr-2 opacity-60" /> Analytics
            </Button>
            <Button 
              className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => router.push('/admin/students/registration')}
            >
              <Plus className="w-4 h-4 mr-2" /> Admit Candidate
            </Button>
          </div>
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
          title="Candidate Master List"
          description="A chronological record of all institutional admissions and academic placements."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-1 bg-muted/20 p-1 border ">
                <button
                    onClick={() => setLevelFilter('all')}
                    className={cn(
                        "px-4 py-1.5 text-xs transition-all font-normal",
                        levelFilter === 'all' ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                >
                    All Tiers
                </button>
                {ACADEMY_LEVELS.map((level) => (
                    <button
                        key={level}
                        onClick={() => setLevelFilter(level)}
                        className={cn(
                            "px-4 py-1.5 text-xs transition-all font-normal",
                            levelFilter === level ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                    >
                        {level}
                    </button>
                ))}
              </div>
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Identify candidate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
                />
              </div>
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">No student identities identified</p>
              <p className="text-xs mt-2 font-normal">System awaiting institutional intake data</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
