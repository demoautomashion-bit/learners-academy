'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-success/10 text-success border-success/20'
      case 'intermediate':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'advanced':
        return 'bg-primary/10 text-primary '
    }
  }

  const columns: Column<Course>[] = [
    {
      label: 'Academic Registry',
      render: (course) => (
        <div className="flex flex-col">
          <span className="font-serif font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">
            {course.title}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-normal mt-0.5 max-w-[250px] truncate">
            {course.description}
          </span>
        </div>
      ),
    },
    {
      label: 'Level',
      render: (course) => (
        <Badge variant="outline" className={cn("text-[10px] font-normal", getLevelColor(course.level))}>
          {course.level}
        </Badge>
      ),
    },
    {
      label: 'Enrollment',
      render: (course) => {
        const count = mockStudents?.filter(s => (s.enrolledCourses || []).includes(course.id)).length || 0
        return (
          <span className="font-sans font-medium text-sm text-foreground/80">
            {count} / {course.capacity}
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
    (s.enrolledCourses || []).some(courseId => myCourses.some(mc => mc.id === courseId))
  ).length || 0

  return (
    <PageShell>
      <PageHeader 
        title="My Classes"
        description="Select a class to enter its dedicated academic workspace and assessment views."
      />

      <EntityCardGrid 
        data={[
          { label: 'Assigned Classes', value: myCourses.length, sub: 'Faculty Allocation' },
          { label: 'Total Students', value: totalStudents, sub: 'Active Roster' },
        ]}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium">
            <CardHeader className="p-6 pb-2">
              <CardDescription className="text-[10px] font-normal opacity-60 uppercase">{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-serif font-medium">{stat.value}</CardTitle>
            </CardHeader>
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
