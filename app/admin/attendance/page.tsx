'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  ClipboardList,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  Info
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

export default function AttendanceRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, attendanceLogs, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const activeTeachers = teachers.filter(t => t.status === 'active')
  const filteredTeachers = activeTeachers.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: Column<Teacher>[] = [
    {
      label: 'Instructor Profile',
      render: (teacher) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border shadow-sm">
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
      label: 'Presence Today',
      render: (teacher) => (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold bg-success/5 text-success border-success/20 uppercase tracking-widest py-1 px-3">
                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Present
            </Badge>
            <span className="text-[10px] text-muted-foreground opacity-40 font-normal">ENTRY: 08:45 AM</span>
        </div>
      )
    },
    {
        label: 'Substitution Load',
        render: (teacher) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                    <span className="text-xs font-serif font-bold">0</span>
                </div>
                <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">Extra Sessions</span>
            </div>
        )
    },
    {
      label: 'Operational History',
      render: (teacher) => (
        <div className="flex items-center gap-1">
            {[1,1,1,0,1,1,1].map((day, i) => (
                <div key={i} className={cn(
                    "w-1.5 h-4 rounded-full transition-all",
                    day === 1 ? "bg-success/40" : "bg-destructive/40"
                )} />
            ))}
            <span className="text-[10px] text-muted-foreground opacity-30 ml-2 uppercase tracking-tighter">7D Trace</span>
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
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Security Protocols</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <History className="w-4 h-4 opacity-60" /> <span className="text-xs">Full Timeline</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-warning/5 text-warning font-normal">
              <AlertCircle className="w-4 h-4 opacity-60" /> <span className="text-xs">Log Substitution</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal">
              <XCircle className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Mark Absent</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Overall Presence', value: '94%', sub: 'Active Instructors', icon: UserCheck, color: 'text-success' },
    { label: 'Latency Rate', value: '2.1%', sub: 'Institutional Average', icon: Clock, color: 'text-warning' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Attendance Registry"
        description="Daily operational audit of faculty presence, session latency, and substitution allocations."
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="font-normal border-primary/5 hover:bg-primary/5 h-11">
                <FileText className="w-4 h-4 mr-2 opacity-50" /> Export Audit
             </Button>
             <Button className="font-normal bg-primary shadow-lg shadow-primary/20 h-11">
                Establish Daily Lock
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
          title="Daily Personnel Audit"
          description="A real-time trace of institutional staff presence and active session loads."
          data={filteredTeachers}
          columns={columns}
          actions={
            <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-primary/5 border rounded-xl flex items-center gap-3">
                    <Info className="w-3.5 h-3.5 text-primary opacity-60" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">System Auto-Lock: 09:30 AM</span>
                </div>
                <div className="relative w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Identify personnel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
                    />
                </div>
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">Registry Data Unavailable</p>
              <p className="text-xs mt-2 font-normal">System awaiting personnel synchronization</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
