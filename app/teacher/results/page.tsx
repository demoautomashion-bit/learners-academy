'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { 
  Search, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Eye, 
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { submissions, assessments, courses, isInitialized } = useData()

  // All hooks MUST be declared before any early returns (Rules of Hooks)
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')

  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = courses.filter(c => c.teacherId === user?.id)

  // Grouping logic: We want to see a list of Assessments that have submissions
  const teacherAssessments = assessments.filter(a => {
    const isOwner = a.submittedByTeacherId === user?.id
    const isAssignedLevel = a.classLevels.some(level => myCourses.some(c => c.title === level))
    return isOwner || isAssignedLevel
  })

  const filteredAssessments = teacherAssessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPhase = phaseFilter === 'all' || assessment.phase === phaseFilter
    
    const selectedCourse = myCourses.find(c => c.id === classFilter)
    const matchesClass = classFilter === 'all' || assessment.classLevels.includes(selectedCourse?.title || '')
    
    return matchesSearch && matchesPhase && matchesClass
  })

  // Global Stats logic remains similar but calculated across all teacher-related submissions
  const allSubmissions = submissions.filter(s => {
    const a = assessments.find(as => as.id === s.assignmentId)
    return teacherAssessments.some(ta => ta.id === a?.id)
  })

  const pendingCount = allSubmissions.filter(r => r.status === 'pending').length
  const gradedResults = allSubmissions.filter(r => r.grade !== undefined && r.grade !== null) as (typeof allSubmissions[0] & { grade: number })[]
  
  const getPercentage = (r: typeof gradedResults[0]) => {
    const a = assessments.find(a => a.id === r.assignmentId)
    return a?.totalMarks ? Math.round((r.grade / a.totalMarks) * 100) : r.grade
  }

  const totalAvg = gradedResults.length > 0 ? Math.round(gradedResults.reduce((acc, r) => acc + getPercentage(r), 0) / gradedResults.length) : 0
  const firstTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'First Test')
  const firstTestAvg = firstTestResults.length > 0 ? Math.round(firstTestResults.reduce((acc, r) => acc + getPercentage(r), 0) / firstTestResults.length) : 0
  const lastTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'Last Test')
  const lastTestAvg = lastTestResults.length > 0 ? Math.round(lastTestResults.reduce((acc, r) => acc + getPercentage(r), 0) / lastTestResults.length) : 0

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <h1 className="text-3xl font-normal text-foreground">
            Academic Results
          </h1>
          <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
            Audit and publish grades for individual examination batches
          </p>
        </motion.div>
        <motion.div variants={STAGGER_ITEM} className="flex items-center gap-2">
          <Button variant="outline" className="hover-lift border-primary/20 bg-card/40 backdrop-blur-md rounded-xl h-11 px-6">
            <Award className="w-4 h-4 mr-2" />
            <span className="text-[10px] uppercase tracking-widest font-normal">Export Registry</span>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-4"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">
                <TrendingUp className="w-3 h-3" /> Academy Average
              </CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{totalAvg > 0 ? `${totalAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Pending Audits</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal text-warning">{pendingCount > 0 ? pendingCount : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Mid-Term Avg</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{firstTestAvg > 0 ? `${firstTestAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Final-Term Avg</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{lastTestAvg > 0 ? `${lastTestAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
          <Input
            placeholder="Search examination title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-sm transition-premium focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[200px] h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-[10px] uppercase tracking-widest font-normal">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {myCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-[180px] h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-[10px] uppercase tracking-widest font-normal">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              <SelectItem value="First Test">Mid-Term</SelectItem>
              <SelectItem value="Last Test">Final-Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 border-b border-primary/5 h-16">
                  <tr className="border-none">
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Examination Block</th>
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Class Assignment</th>
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Completion status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredAssessments.map((assessment) => {
                    const assessmentSubmissions = submissions.filter(s => s.assignmentId === assessment.id)
                    const pending = assessmentSubmissions.filter(s => s.status === 'pending').length
                    const total = assessmentSubmissions.length
                    
                    if (total === 0) return null // Only show assessments that have submissions

                    return (
                      <tr key={assessment.id} className="hover:bg-primary/[0.02] transition-premium group h-24">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-serif font-normal text-lg text-foreground/80 group-hover:text-primary transition-colors">
                              {assessment.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-normal uppercase tracking-widest mt-0.5">
                              {assessment.phase} • {assessment.nature}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1">
                            {assessment.classLevels.map(level => (
                                <Badge key={level} variant="outline" className="text-[9px] uppercase tracking-widest font-normal border-primary/10 text-muted-foreground/60">
                                    {level}
                                </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="space-y-1.5">
                                <div className="flex items-center justify-between min-w-[120px]">
                                    <span className="text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-50">Audited</span>
                                    <span className="text-[10px] font-bold text-foreground">{total - pending} / {total}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                     <div 
                                        className={cn("h-full transition-all duration-500", pending === 0 ? "bg-success" : "bg-primary")} 
                                        style={{ width: `${((total - pending) / total) * 100}%` }} 
                                     />
                                </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button 
                            onClick={() => router.push(`/teacher/results/${assessment.id}`)}
                            className="rounded-xl h-10 px-6 bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all shadow-sm group/btn"
                          >
                            <span className="text-[10px] uppercase tracking-widest font-normal">Review Results</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredAssessments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-serif text-lg opacity-40">
                        No active examination blocks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

