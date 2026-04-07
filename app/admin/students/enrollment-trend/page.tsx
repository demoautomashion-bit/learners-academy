'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useMemo, useState } from 'react'
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, TrendingUp, Calendar, Filter } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import type { Student } from '@/lib/types'

type TimePeriod = 'all' | 'today' | 'week' | 'month' | 'semester'

export default function EnrollmentTrendPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')
  const [classFilter, setClassFilter] = useState('all')

  const { students, courses: mockCourses, isInitialized } = useData()

  const stats = useMemo(() => {
    if (!students) return { today: 0, week: 0, month: 0, semester: 0 }
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const week = now.getTime() - 7 * 24 * 60 * 60 * 1000
    const month = now.getTime() - 30 * 24 * 60 * 60 * 1000
    const semester = now.getTime() - 90 * 24 * 60 * 60 * 1000

    return {
      today: students.filter(s => new Date(s.enrolledAt).getTime() >= today).length,
      week: students.filter(s => new Date(s.enrolledAt).getTime() >= week).length,
      month: students.filter(s => new Date(s.enrolledAt).getTime() >= month).length,
      semester: students.filter(s => new Date(s.enrolledAt).getTime() >= semester).length,
    }
  }, [students])

  const filteredStudents = useMemo(() => {
    return students?.filter(student => {
      const enrollmentDate = new Date(student.enrolledAt).getTime()
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      
      // Time Filter
      let matchesPeriod = true
      if (periodFilter === 'today') matchesPeriod = enrollmentDate >= today
      else if (periodFilter === 'week') matchesPeriod = enrollmentDate >= (now.getTime() - 7 * 24 * 60 * 60 * 1000)
      else if (periodFilter === 'month') matchesPeriod = enrollmentDate >= (now.getTime() - 30 * 24 * 60 * 60 * 1000)
      else if (periodFilter === 'semester') matchesPeriod = enrollmentDate >= (now.getTime() - 90 * 24 * 60 * 60 * 1000)

      // Class Filter
      const matchesClass = classFilter === 'all' || student.enrolledCourses.includes(classFilter)

      // Search Filter
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesPeriod && matchesClass && matchesSearch
    })
  }, [students, periodFilter, classFilter, searchQuery])

  if (!isInitialized) return <DashboardSkeleton />

  const columns: Column<Student>[] = [
    {
      label: 'Student ID',
      render: (student) => (
        <span className="font-sans font-normal text-primary">
          {student.studentId || 'ID-TBC'}
        </span>
      ),
      width: '120px'
    },
    {
      label: 'Student Name',
      render: (student) => (
        <p className="font-normal">{student.name}</p>
      ),
      width: '200px'
    },
    {
      label: 'Guardian Name',
      render: (student) => (
        <span className="text-muted-foreground font-normal opacity-60">
          {student.guardianName || 'N/A'}
        </span>
      )
    },
    {
      label: 'Class & Timing',
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-normal text-sm">
            {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title || 'Registry Level'}
          </span>
          <span className="text-xs text-muted-foreground font-normal opacity-50">
            {student.classTiming || 'Timing TBC'}
          </span>
        </div>
      )
    },
    {
      label: 'Admission Date',
      render: (student) => (
        <span className="font-sans text-xs opacity-70 font-normal">
          {new Date(student.enrolledAt).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      )
    }
  ]

  const periodStatData = [
    { label: 'Today Admissions', value: stats.today, sub: 'Daily Pulse', color: 'text-primary' },
    { label: 'Weekly Admissions', value: stats.week, sub: 'Last 7 Days', color: 'text-primary' },
    { label: 'Monthly Admissions', value: stats.month, sub: 'Last 30 Days', color: 'text-primary' },
    { label: 'Semester Admissions', value: stats.semester, sub: 'Last 90 Days', color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Enrollment Trend"
        description="Monitor institutional growth and seasonal admission protocols."
      />

      <EntityCardGrid 
        data={periodStatData}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium border-primary/5 bg-gradient-to-br from-background to-primary/[0.02]">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-normal opacity-60 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary opacity-40" />
                {stat.label}
              </CardDescription>
              <CardTitle className={cn("text-3xl font-serif font-medium", stat.color)}>
                {stat.value}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-normal opacity-40 mt-1 uppercase tracking-widest">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={4}
      />

      <EntityDataGrid 
        title="Admission Registry"
        data={filteredStudents}
        columns={columns}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Select value={periodFilter} onValueChange={(v: TimePeriod) => setPeriodFilter(v)}>
                <SelectTrigger className="w-[150px] h-10 text-xs font-normal bg-muted/5 border-primary/10">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admissions</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px] h-10 text-xs font-normal bg-muted/5 border-primary/10">
                  <SelectValue placeholder="Class Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {mockCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/10 focus:bg-background transition-all h-10 text-sm font-normal border-primary/10"
              />
            </div>
          </div>
        }
      />
    </PageShell>
  )
}
