'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
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
  Users,
  UserCheck,
  Hash,
  Clock,
  ArrowUpRight,
  LayoutGrid
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
import { ACADEMY_LEVELS } from '@/lib/registry'
import { motion } from 'framer-motion'
import { isToday, parseISO } from 'date-fns'

export default function StudentsPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, removeStudent, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

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
    if (confirm("Permanently archive this student dossier?")) {
      try {
        await removeStudent(id)
        toast.active("Academic record archived", {
            description: "The learner's identity has been shifted to the deep archive."
        })
      } catch (error) {
        toast.error("Error during record archival")
      }
    }
  }

  const columns: Column<Student>[] = [
    {
      label: 'Dossier ID',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/5 flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-primary opacity-40" />
          </div>
          <span className="text-xs font-mono font-medium tracking-tight text-foreground/80">{student.studentId}</span>
        </div>
      ),
      width: '180px'
    },
    {
      label: 'Candidate Name',
      render: (student) => (
        <div className="flex items-center gap-4 group/name">
          <Avatar className="h-10 w-10 border border-primary/10 shadow-sm group-hover/name:scale-105 transition-transform duration-500">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(student.name, 'S')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{student.name}</span>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-muted-foreground opacity-40 uppercase tracking-widest font-bold">Active Status</span>
            </div>
          </div>
        </div>
      ),
      width: '240px'
    },
    {
      label: 'Guardian Authority',
      render: (student) => (
        <div className="flex items-center gap-3">
            <UserCheck className="w-3.5 h-3.5 text-primary opacity-30" />
            <span className="text-[11px] text-foreground/70 font-normal leading-tight">{student.guardianName || 'N/A Academic Ward'}</span>
        </div>
      )
    },
    {
      label: 'Placement & Slot',
      render: (student) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-tight text-primary/80">{student.grade || 'Unassigned'}</span>
           </div>
           <div className="flex items-center gap-2 opacity-40">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-medium uppercase tracking-tighter">{student.classTiming || 'Timing Not Set'}</span>
           </div>
        </div>
      )
    },
    {
        label: 'Access Protocol',
        render: (student) => (
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2.5 group/email cursor-pointer">
                <Mail className="w-3.5 h-3.5 text-primary opacity-20 group-hover/email:opacity-100 transition-opacity" />
                <span className="text-[10px] text-muted-foreground opacity-50 group-hover/email:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">{student.email}</span>
             </div>
             <div className="flex items-center gap-2.5 group/phone cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-primary opacity-20 group-hover/phone:opacity-100 transition-opacity" />
                <span className="text-[10px] text-muted-foreground font-mono opacity-50 group-hover/phone:opacity-100 transition-opacity">{student.phone}</span>
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
            <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] opacity-40 px-4 py-4 font-black">Archive Identity Protocols</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/students/${student.id}`)}
                className="gap-4 cursor-pointer p-4 focus:bg-primary/5 transition-all rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-primary opacity-60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Inspect Dossier</span>
                <span className="text-[9px] opacity-40 uppercase tracking-widest font-bold">Deep Performance Audit</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-4 cursor-pointer p-4 focus:bg-primary/5 transition-all rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/5 flex items-center justify-center">
                <History className="w-4 h-4 text-indigo-400 opacity-60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Academic History</span>
                <span className="text-[9px] opacity-40 uppercase tracking-widest font-bold">Full Temporal Trace</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(student.id)}
               className="gap-4 cursor-pointer p-4 focus:bg-destructive/5 text-destructive rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/5 flex items-center justify-center">
                <Trash2 className="w-4 h-4 opacity-60" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Archive Dossier</span>
                <span className="text-[9px] opacity-40 uppercase tracking-widest font-bold">Retract Institutional Identity</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px'
    }
  ]

  const stats = [
    { label: 'Active Learners', value: (students || []).length, sub: 'Total Ingress Velocity', icon: GraduationCap, color: 'text-primary' },
    { label: 'Daily Admissions', value: dailyAdmissions, sub: 'Current Pulse', icon: TrendingUp, color: 'text-success' },
    { label: 'Capacity Utilization', value: '88%', sub: 'Institutional Load', icon: Users, color: 'text-indigo-400' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Student Master Registry"
        description="Unified identity vault for institutional learners, academic placements, and sponsor tracking."
        actions={
          <div className="flex items-center gap-4">
             <Button 
              variant="outline"
              className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5"
              onClick={() => router.push('/admin/students/enrollment-trend')}
            >
              <History className="w-4 h-4 mr-2 opacity-60" /> Intelligence
            </Button>
            <Button 
              className="h-11 px-8 font-normal bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl"
              onClick={() => router.push('/admin/students/registration')}
            >
              <Plus className="w-4 h-4 mr-2" /> Admit Candidate
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[2rem] transition-all group relative isolate">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
            <CardHeader className="p-10">
                <div className="flex items-center justify-between mb-8">
                     <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">{stat.label}</CardDescription>
                     <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                </div>
                <CardTitle className={cn("text-4xl font-serif font-medium tracking-tight", stat.color)}>{stat.value}</CardTitle>
                <div className="flex items-center gap-2 mt-4">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 font-bold">{stat.sub}</span>
                    <ArrowUpRight className={cn("w-3 h-3", stat.color)} />
                </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <EntityDataGrid 
          title="Personnel Identities"
          description="A centralized trace of all active learner dossiers and their corresponding academic slots."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-1.5 p-1.5 bg-muted/10 border border-primary/5 rounded-2xl glass-2">
                {TIER_FILTERS.map((level) => (
                    <button
                        key={level}
                        onClick={() => setLevelFilter(level)}
                        className={cn(
                            "px-5 py-2 text-[10px] uppercase tracking-widest transition-all font-bold rounded-xl",
                            levelFilter === level 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "text-muted-foreground opacity-40 hover:opacity-100 hover:bg-primary/5"
                        )}
                    >
                        {level}
                    </button>
                ))}
              </div>
              <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Search Dossier Identity or Sponsor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-none rounded-2xl placeholder:opacity-20"
                />
              </div>
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
    </PageShell>
  )
}
