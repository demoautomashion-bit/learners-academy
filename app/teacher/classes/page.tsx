'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import type { Course } from '@/lib/types'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { cn } from '@/lib/utils'
import { isStudentInCourse } from '@/lib/utils/student-matching'

export default function TeacherClassesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { courses: mockCourses, students: mockStudents, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = mockCourses?.filter(c => c.teacherId === user?.id) || []

  const filteredCourses = myCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Removed legacy getLevelColor

  const columns: Column<Course>[] = [
    {
      label: 'Class',
      render: (course) => (
        <div className="flex flex-col">
          <span className="font-serif font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">
            {course.title || course.name}
          </span>
          <span className="text-[10px] text-muted-foreground opacity-60 font-medium uppercase tracking-widest mt-1">
            {course.level}
          </span>
        </div>
      ),
    },
    {
      label: 'Timing',
      render: (course) => (
        <div className="flex items-center gap-2 text-[10px] font-medium opacity-80 uppercase tracking-widest text-muted-foreground">
          <span className="p-1 rounded-sm bg-primary/10 text-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
          <span>{course.timing || 'Hours TBD'}</span>
        </div>
      ),
    },
    {
      label: 'Enrollment',
      render: (course) => {
        const count = mockStudents?.filter(s => isStudentInCourse(s, course)).length || 0
        return (
          <span className="font-sans font-medium text-sm text-foreground/80 flex items-center gap-1.5">
            {count} <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">Students</span>
          </span>
        )
      },
    },
    {
      label: 'Actions',
      render: (course) => (
        <Button 
          variant="ghost"
          className="hover:bg-primary/5 hover:text-primary gap-2"
          onClick={() => router.push(`/teacher/classes/${course.id}`)}
        >
          Open Workspace <ArrowRight className="w-4 h-4" />
        </Button>
      ),
      align: 'right'
    }
  ]

  const totalStudents = mockStudents?.filter(s => 
    myCourses.some(course => isStudentInCourse(s, course))
  ).length || 0

  return (
    <PageShell>
      <PageHeader 
        title="My Classes"
        description="Select a class to enter its dedicated academic workspace and assessment views."
      />

      <EntityCardGrid 
        data={[
          { label: 'Assigned Classes', value: myCourses.length, sub: 'Faculty Allocation', icon: Search, color: 'text-primary' },
          { label: 'Total Students', value: totalStudents, sub: 'Active Roster', icon: ArrowRight, color: 'text-success' },
        ]}
        renderItem={(stat, i) => (
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
                <span className="text-[10px] text-muted-foreground font-normal">Live Data</span>
              </div>
            </CardContent>
          </Card>
        )}
        columns={2}
      />

      <div className="mt-6">
        <EntityDataGrid 
          title="Class Hubs"
          description="Your active teaching registries."
          data={filteredCourses}
          columns={columns}
          actions={
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 bg-muted/5 font-normal text-sm"
              />
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
