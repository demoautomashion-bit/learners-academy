'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
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
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  LayoutGrid,
  Users,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Course } from '@/lib/types'

export default function ClassesPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, teachers, removeCourse, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course =>
    (course.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.instructorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.level || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm("Permanently dissolve this academic batch? This will affect attendance records.")) {
      try {
        await removeCourse(id)
        toast.success("Academic batch dissolved")
      } catch (error) {
        toast.error("Error during batch dissolution")
      }
    }
  }

  const columns: Column<Course>[] = [
    {
      label: 'Batch Identity',
      render: (course) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{course.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">{course.level} Tier</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Assigned Faculty',
      render: (course) => (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-40" />
            <span className="text-xs font-normal">{course.instructorName || 'Unassigned'}</span>
        </div>
      )
    },
    {
      label: 'Schedule Context',
      render: (course) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                <Clock className="w-3 h-3" />
                <span>{course.startTime} - {course.endTime}</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                <MapPin className="w-3 h-3" />
                <span>Room {course.roomNumber || 'TBD'}</span>
           </div>
        </div>
      )
    },
    {
        label: 'Financial Parameter',
        render: (course) => (
          <span className="text-xs font-serif">PKR {course.fee?.toLocaleString()} <span className="text-[9px] opacity-40 uppercase">/ Month</span></span>
        )
    },
    {
      label: 'Actions',
      render: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Batch Protocols</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => router.push(`/admin/classes/schedule?id=${course.id}`)}
               className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <Calendar className="w-4 h-4 opacity-60" /> <span className="text-xs">Audit Schedule</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <Users className="w-4 h-4 opacity-60" /> <span className="text-xs">Manage Enrollment</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(course.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Dissolve Batch</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Active Batches', value: courses.length, sub: 'Academic Capacity', icon: LayoutGrid, color: 'text-primary' },
    { label: 'Instructional Load', value: teachers.filter(t => t.status === 'active').length, sub: 'Faculty Utilization', icon: Users, color: 'text-success' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Academic Batches"
        description="Configuration of instructional cycles, room allocation, and faculty assignments."
        actions={
          <Button 
            className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => {/* OPEN CREATE MODAL */}}
          >
            <Plus className="w-4 h-4 mr-2" /> Initialize Batch
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
          title="Active Instructional Registry"
          description="A comprehensive view of all active academic sessions and their logistical parameters."
          data={filteredCourses}
          columns={columns}
          actions={
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">No active batches identified</p>
              <p className="text-xs mt-2 font-normal">System awaiting instructional cycle configuration</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
