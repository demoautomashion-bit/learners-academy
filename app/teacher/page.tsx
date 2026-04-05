'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  ClipboardList,
  Clock,
  Plus,
  Library,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { 
    courses, 
    assessments, 
    submissions,
    questions,
    students,
    isInitialized
  } = useData()
  
  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = courses?.filter(c => c.teacherId === user?.id) || []
  const myCourseTitles = myCourses.map(c => c.title)
 
  const activeTests = assessments?.filter(a => 
    a.status === 'active' && 
    (a.submittedByTeacherId === user?.id || (a.classLevels || []).some(level => myCourseTitles.includes(level)))
  ) || []

  const pendingSubmissions = submissions?.filter(s => {
    if (s.status !== 'pending') return false
    const match = assessments.find(a => a.id === s.assignmentId)
    return match && (match.submittedByTeacherId === user?.id || (match.classLevels || []).some(level => myCourseTitles.includes(level)))
  }) || []
 
  const stats = [
    {
      title: 'My Classes',
      value: myCourses.length,
      icon: BookOpen,
      href: '/teacher/classes',
      color: 'text-primary',
    },
    {
      title: 'Library Blocks',
      value: questions.length,
      icon: Library,
      href: '/teacher/library',
      color: 'text-accent',
    },
    {
      title: 'Active Tests',
      value: activeTests.length,
      icon: ClipboardList,
      href: '/teacher/assessments',
      color: 'text-warning',
    },
    {
      title: 'Pending Scores',
      value: pendingSubmissions.length,
      icon: Clock,
      href: '/teacher/results',
      color: 'text-destructive',
    },
  ]

  return (
    <PageShell>
      <PageHeader 
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Teacher'}`}
        description="Orchestrating academic excellence through precision insights."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="hover-lift font-normal">
              <Link href="/teacher/library" className="flex items-center text-xs">
                <Plus className="w-4 h-4 mr-2" />
                Build Block
              </Link>
            </Button>
            <Button asChild className="hover-lift font-normal shadow-lg shadow-primary/20">
              <Link href="/teacher/assessments" className="text-xs">
                Initiate Test
              </Link>
            </Button>
          </div>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="hover-lift cursor-pointer transition-premium h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
                <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1">
                <div className="text-3xl font-sans font-normal">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-2 opacity-40">
                  <div className="h-1 w-1 bg-primary/40" />
                  <span className="text-[10px] text-muted-foreground font-normal">Institutional Data</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        columns={4}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-stretch mt-6">
        <Card className="hover-lift transition-premium h-full flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <div>
              <CardTitle className="text-xl font-serif font-medium">Active Assessments</CardTitle>
              <CardDescription className="text-xs font-normal opacity-60">Track ongoing test participation</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-premium group">
              <Link href="/teacher/assessments" className="flex items-center text-xs font-normal">
                View Registry
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            {activeTests.length === 0 ? (
              <div className="py-8 text-center bg-muted/5 border border-dashed rounded-xl">
                <p className="text-xs font-normal text-muted-foreground opacity-60">No Live Encounters</p>
              </div>
            ) : (
              activeTests.slice(0, 3).map((assessment) => {
                const subCount = submissions?.filter(s => s.assignmentId === assessment.id).length || 0
                const enrolledCount = students?.filter(s =>
                  (s.enrolledCourses || []).some(cId =>
                    myCourses.some(mc => mc.id === cId && (assessment.classLevels || []).includes(mc.title))
                  )
                ).length || 0
                const safeTotal = enrolledCount > 0 ? enrolledCount : 1

                return (
                  <div key={assessment.id} className="p-4 bg-muted/5 border hover:bg-muted/10 transition-premium group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-sans text-base font-normal group-hover:text-primary transition-colors">{assessment.title}</p>
                        <p className="text-xs mt-0.5 opacity-60 font-normal">
                          {(assessment.classLevels || []).join(', ') || assessment.nature}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal text-primary bg-primary/5">
                        Registry Active
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-normal opacity-60">
                        <span>Capture Census</span>
                        <span>{subCount}/{enrolledCount}</span>
                      </div>
                      <Progress value={Math.min(100, (subCount / safeTotal) * 100)} className="h-1 bg-primary/10" />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift transition-premium h-full flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <div>
              <CardTitle className="text-xl font-serif font-medium">Class Performance</CardTitle>
              <CardDescription className="text-xs font-normal opacity-60">Success metrics & average tracking</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-primary opacity-40" />
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            {myCourses.length === 0 ? (
              <div className="py-8 text-center bg-muted/5 border border-dashed rounded-xl">
                <p className="text-xs font-normal text-muted-foreground opacity-60">No Academic Records</p>
              </div>
            ) : (
              myCourses.map((course) => {
                const courseStudents = students?.filter(s => (s.enrolledCourses || []).includes(course.id)) || []
                const courseStudentIds = courseStudents.map(s => s.id)
                
                const courseResults = submissions?.filter(s => 
                  s.grade !== undefined && s.grade !== null &&
                  courseStudentIds.includes(s.studentId)
                ) || []

                let avgProgress = 0
                if (courseResults.length > 0) {
                  let totalPercentage = 0
                  courseResults.forEach((r) => {
                    const template = assessments.find(a => a.id === r.assignmentId)
                    if (template && (template.totalMarks || 0) > 0) {
                      totalPercentage += (r.grade! / template.totalMarks) * 100
                    } else {
                      totalPercentage += r.grade!
                    }
                  })
                  avgProgress = Math.round(totalPercentage / courseResults.length)
                }

                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-normal">{course.title}</span>
                      <span className="text-xs font-normal text-primary">Avg. {avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-1 bg-primary/10" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-stretch mt-6">
        <Card className="hover-lift border-l-4 border-l-primary/40 overflow-hidden transition-premium h-full flex flex-col">
          <CardHeader className="p-6">
            <CardTitle className="text-primary mb-2 text-xl font-serif font-medium">First Test Phase</CardTitle>
            <CardContent className="p-0 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed opacity-70 font-normal">
                Targeted registry block consisting of 12 queries filtered from core disciplines for mid-term academic vetting.
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="hover-lift border-l-4 border-l-accent/40 overflow-hidden transition-premium h-full flex flex-col">
          <CardHeader className="p-6">
            <CardTitle className="text-accent mb-2 text-xl font-serif font-medium">Last Test Phase</CardTitle>
            <CardContent className="p-0 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed opacity-70 font-normal">
                Summative evaluation registry encompassing comprehensive curriculum goals and advanced performance benchmarks.
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </PageShell>
  )
}
