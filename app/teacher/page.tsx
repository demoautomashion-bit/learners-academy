'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  Calendar,
  ArrowRight,
  Plus,
  Library,
  TrendingUp
} from 'lucide-react'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function TeacherDashboard() {
  const { user } = useAuth()
  if (!user?.id) return null
  const { 
    courses, 
    assessments, 
    submissions,
    questions,
    students,
    isInitialized
  } = useData()
  
  const myCourses = courses?.filter(c => c.teacherId === user?.id)
  const myCourseTitles = myCourses?.map(c => c.title)
 
  const activeTests = assessments?.filter(a => 
    a.status === 'active' && 
    (a.submittedByTeacherId === user?.id || (a.classLevels || []).some(level => myCourseTitles.includes(level)))
  )

  const pendingSubmissions = submissions?.filter(s => {
    if (s.status !== 'pending') return false
    const match = assessments.find(a => a.id === s.assignmentId)
    return match && (match.submittedByTeacherId === user?.id || (match.classLevels || []).some(level => myCourseTitles.includes(level)))
  })
 
  const stats = [
    {
      title: 'My Classes',
      value: myCourses.length,
      icon: BookOpen,
      href: '/teacher/classes',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Library Blocks',
      value: questions.length,
      icon: Library,
      href: '/teacher/library',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Active Tests',
      value: activeTests.length,
      icon: ClipboardList,
      href: '/teacher/assessments',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pending Scores',
      value: pendingSubmissions.length,
      icon: Clock,
      href: '/teacher/results',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  if (!isInitialized) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <h1 className="text-3xl font-serif tracking-tight text-foreground font-normal">
            Welcome, {user?.name?.split(' ')[0] || 'Teacher'}
          </h1>
          <p className="text-editorial-meta text-base mt-1 opacity-70">
            Orchestrating academic excellence through precision insights.
          </p>
        </motion.div>
        <motion.div variants={STAGGER_ITEM} className="flex gap-2">
          <Button variant="outline" asChild className="hover-lift border-primary/20 bg-card/40 backdrop-blur-md rounded-xl h-10 px-6">
            <Link href="/teacher/library" className="flex items-center text-xs uppercase tracking-widest font-normal">
              <Plus className="w-4 h-4 mr-2" />
              Build Block
            </Link>
          </Button>
          <Button asChild className="hover-lift shadow-premium rounded-xl h-10 px-6">
            <Link href="/teacher/assessments" className="text-xs uppercase tracking-widest font-normal">
              Initiate Test
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={STAGGER_CONTAINER}
      >
        {stats?.map((stat) => (
          <motion.div
            key={stat.title}
            variants={STAGGER_ITEM}
          >
            <Link href={stat.href}>
              <Card className="hover-lift cursor-pointer transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
                  <CardTitle className="text-xs uppercase tracking-widest font-normal text-muted-foreground opacity-60">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bgColor} opacity-60`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-sans tracking-tight font-normal">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-normal opacity-40">Institutional Data</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Assessments */}
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <div>
                <CardTitle className="text-xl font-serif font-normal">Active Assessments</CardTitle>
                <CardDescription className="text-editorial-meta text-xs opacity-60">Track ongoing test participation</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10 rounded-xl transition-premium group">
                <Link href="/teacher/assessments" className="flex items-center text-xs uppercase tracking-widest font-normal">
                  View Registry
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-1">
              {activeTests.length === 0 ? (
                <div className="py-8 text-center bg-muted/5 rounded-2xl border border-dashed border-primary/10">
                  <p className="text-xs uppercase tracking-widest font-normal text-muted-foreground opacity-60">No Live Encounters</p>
                </div>
              ) : (
                activeTests.slice(0, 3).map((assessment) => {
                  const subCount = submissions?.filter(s => s.assignmentId === assessment.id).length
                  const enrolledCount = students?.filter(s =>
                    (s.enrolledCourses || []).some(cId =>
                      myCourses.some(mc => mc.id === cId && (assessment.classLevels || []).includes(mc.title))
                    )
                  ).length
                  const safeTotal = enrolledCount > 0 ? enrolledCount : 1

                  return (
                    <div key={assessment.id} className="p-4 rounded-xl bg-muted/10 border border-primary/5 hover:bg-muted/20 transition-premium group cursor-pointer hover:shadow-premium">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-sans text-base font-medium group-hover:text-primary transition-colors">{assessment.title}</p>
                          <p className="text-editorial-meta text-xs mt-0.5 opacity-60 uppercase tracking-widest">
                            {(assessment.classLevels || []).join(', ') || assessment.nature}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-normal text-primary border-primary/20 bg-primary/5">
                          Registry Active
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-normal opacity-60">
                          <span>Capture Census</span>
                          <span>{subCount}/{enrolledCount}</span>
                        </div>
                        <Progress value={Math.min(100, (subCount / safeTotal) * 100)} className="h-1 bg-primary/10 data-[state=checked]:bg-primary" />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Class Performance */}
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <div>
                <CardTitle className="text-xl font-serif font-normal">Class Performance</CardTitle>
                <CardDescription className="text-editorial-meta text-xs opacity-60">Success metrics & average tracking</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-primary opacity-40" />
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1">
            {myCourses.length === 0 ? (
                <div className="py-8 text-center bg-muted/5 rounded-2xl border border-dashed border-primary/10">
                  <p className="text-xs uppercase tracking-widest font-normal text-muted-foreground opacity-60">No Academic Records</p>
                </div>
              ) : (
                myCourses?.map((course) => {
                  const courseStudents = students?.filter(s => (s.enrolledCourses || []).includes(course.id))
                  const courseStudentIds = courseStudents?.map(s => s.id)
                  
                  const courseResults = submissions?.filter(s => 
                    s.grade !== undefined && s.grade !== null &&
                    courseStudentIds.includes(s.studentId)
                  )

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
                        <span className="text-xs uppercase tracking-widest font-normal text-primary">Avg. {avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-1 bg-primary/10" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Assessment Phases */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift border-l-4 border-l-primary/40 bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-xs font-normal uppercase tracking-widest text-primary mb-2">First Test Phase</CardTitle>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground leading-relaxed opacity-70">
                  Targeted registry block consisting of 12 queries filtered from core disciplines for mid-term academic vetting.
                </p>
              </CardContent>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift border-l-4 border-l-accent/40 bg-card/40 backdrop-blur-md border-primary/5 shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-xs font-normal uppercase tracking-widest text-accent mb-2">Last Test Phase</CardTitle>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground leading-relaxed opacity-70">
                  Summative evaluation registry encompassing comprehensive curriculum goals and advanced performance benchmarks.
                </p>
              </CardContent>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
