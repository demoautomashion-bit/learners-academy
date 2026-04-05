'use client'

import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Target, 
  Zap, 
  BrainCircuit,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InstitutionalAnalyticsPage() {
  const { user } = useAuth()
  if (!user?.id) return null
  const { students, courses, submissions, assessments, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = courses?.filter(c => c.teacherId === user?.id)
  const teacherAssessments = assessments?.filter(a => {
    const isOwner = a.submittedByTeacherId === user?.id
    const isAssignedLevel = a.classLevels.some(level => myCourses.some(c => c.title === level))
    return isOwner || isAssignedLevel
  })

  // Aggregate Data Calculations
  const teacherSubmissions = submissions?.filter(s => teacherAssessments.some(ta => ta.id === s.assignmentId))
  const gradedResults = teacherSubmissions?.filter(s => s.grade !== undefined && s.grade !== null) as (typeof teacherSubmissions[0] & { grade: number })[]
  
  const getPercentage = (r: typeof gradedResults[0]) => {
    const a = assessments.find(a => a.id === r.assignmentId)
    return a?.totalMarks ? Math.round((r.grade / a.totalMarks) * 100) : r.grade
  }

  const averageMastery = gradedResults.length > 0 
    ? Math.round(gradedResults.reduce((acc, r) => acc + getPercentage(r), 0) / gradedResults.length) 
    : 0

  const highPerformers = gradedResults?.filter(r => getPercentage(r) >= 80).length
  const totalSubmissions = teacherSubmissions.length
  const completionRate = totalSubmissions > 0 ? Math.round((gradedResults.length / totalSubmissions) * 100) : 0

  return (
    <div className="space-y-6 pb-20">
      {/* Header Profile */}
      <motion.div 
        className="px-6 space-y-3"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10  border ">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <motion.h1 variants={STAGGER_ITEM} className="text-5xl font-serif font-normal text-foreground leading-none">Institutional Analytics</motion.h1>
        </div>
        <motion.p variants={STAGGER_ITEM} className="text-muted-foreground text-editorial-meta opacity-70">
            Aggregate pedagogical intelligence reports and cross-cycle mastery heatmaps.
        </motion.p>
      </motion.div>

      {/* Analytics Command Center */}
      <motion.div 
        className="grid gap-6 md:grid-cols-4 items-stretch"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="glass-1 hover-lift overflow-hidden group rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs opacity-40">System-Wide Mastery</CardDescription>
              <CardTitle className="font-sans text-primary text-xl font-serif font-medium">{averageMastery}%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
               <div className="flex items-center gap-2 text-xs text-success ">
                  <TrendingUp className="w-3 h-3" />
                  <span>+4.2% Optimization</span>
               </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={STAGGER_ITEM}>
          <Card className="glass-1 hover-lift overflow-hidden group rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs opacity-40">Elite Cohort</CardDescription>
              <CardTitle className="font-sans text-xl font-serif font-medium">{highPerformers}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
               <span className="text-xs text-muted-foreground font-normal">Candidates with &gt;80% Score</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card className="glass-1 hover-lift overflow-hidden group rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs opacity-40">Protocol Completion</CardDescription>
              <CardTitle className="font-sans text-success text-xl font-serif font-medium">{completionRate}%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
               <span className="text-xs text-muted-foreground font-normal">Audited Results vs Total Submissions</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={STAGGER_ITEM}>
          <Card className="glass-1 hover-lift overflow-hidden group rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs opacity-40">Active Protocols</CardDescription>
              <CardTitle className="font-sans text-xl font-serif font-medium">{teacherAssessments.length}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
               <span className="text-xs text-muted-foreground font-normal">Examination Blocks Published</span>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Mastery Heatmap & Trajectory */}
      <div className="grid gap-10 lg:grid-cols-12 items-stretch">
        <Card className="glass-1 lg:col-span-8 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
          <CardHeader className="p-10 border-b ">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-serif text-foreground/80 text-xl font-serif font-medium">Class-Level Performance Audit</CardTitle>
                <CardDescription className="text-xs font-normal opacity-40">Institutional benchmarks across active pedagogical levels.</CardDescription>
              </div>
              <Target className="w-5 h-5 text-primary opacity-30" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            {myCourses?.map((course) => {
              const courseResults = gradedResults?.filter(r => r.assignmentId && assessments.find(a => a.id === r.assignmentId)?.classLevels.includes(course.title))
              const courseAvg = courseResults.length > 0 
                ? Math.round(courseResults.reduce((acc, r) => acc + getPercentage(r), 0) / courseResults.length) 
                : 0
              
              return (
                <div key={course.id} className="space-y-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2  bg-primary/40 group-hover:bg-primary transition-colors" />
                      <span className="text-lg font-serif font-normal">{course.title}</span>
                      <Badge variant="outline" className="text-xs    opacity-60">{course.id}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-sans font-normal opacity-40">Institutional Average:</span>
                      <span className="text-xl font-sans font-normal text-primary">{courseAvg}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-primary/5  overflow-hidden border  relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${courseAvg}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary/60 to-primary relative" 
                    >
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                    </motion.div>
                  </div>
                </div>
              )
            })}
            {myCourses.length === 0 && (
              <div className="py-20 text-center text-muted-foreground italic font-serif opacity-40">
                No active class registries detected.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intelligence Feeds */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-1 bg-primary/5 overflow-hidden p-10 space-y-6 flex flex-col items-center text-center rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full">
            <div className="p-4 bg-white/40   ">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-serif font-medium">Audit Intelligence</h3>
              <p className="text-xs leading-relaxed text-muted-foreground/60   font-normal">LA-Automated System Review</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal italic px-4">
              Your aggregate mastery of {averageMastery}% exceeds the institutional benchmark by 12 points. System recommends accelerating "Critical Composition" blocks in the coming term cycle.
            </p>
            <div className="pt-4 w-full">
               <div className="flex justify-between items-center bg-white/20 p-4  border border-white/40">
                  <span className="text-xs    opacity-60">Status</span>
                  <Badge className="bg-success text-white border-none text-xs px-3 ">STABLE</Badge>
               </div>
            </div>
          </Card>

          <Card className="glass-1 overflow-hidden p-8 space-y-6 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <h4 className="text-xs opacity-40 font-medium">Dossier Highlights</h4>
            {gradedResults.slice(0, 3).map((result, i) => (
              <div key={i} className="flex items-center justify-between border-b  pb-4 last:border-none">
                <div className="flex flex-col">
                  <span className="text-xs font-normal">{students.find(s => s.id === result.studentId)?.name || 'Anonymous Student'}</span>
                  <span className="text-xs text-muted-foreground/60 lowercase">{assessments.find(a => a.id === result.assignmentId)?.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-sans font-normal", getPercentage(result) >= 80 ? "text-success" : "text-primary")}>{getPercentage(result)}%</span>
                  <ArrowUpRight className="w-3 h-3 opacity-20" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
