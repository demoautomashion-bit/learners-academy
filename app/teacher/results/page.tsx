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

export default function ResultsPage() {
  const { user } = useAuth()
  const { submissions, students, assessments, courses, gradeSubmission, isInitialized } = useData()
  
  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = courses.filter(c => c.teacherId === user?.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [isGradeOpen, setIsGradeOpen] = useState(false)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')

  const filteredResults = submissions.filter(result => {
    const student = students.find(s => s.id === result.studentId)
    const assessment = assessments.find(a => a.id === result.assignmentId)

    // Check if this submission belongs to one of the teacher's assessments
    // (assessment classLevels stores course titles, so we match against myCourses titles)
    const isMyAssessment = assessment?.classLevels.some(level =>
      myCourses.some(c => c.title === level)
    )
    if (!isMyAssessment) return false

    const matchesSearch = student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment?.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPhase = phaseFilter === 'all' || assessment?.phase === phaseFilter
    const selectedCourse = myCourses.find(c => c.id === classFilter)
    const matchesClass = classFilter === 'all' || assessment?.classLevels.includes(selectedCourse?.title || '')
    
    return matchesSearch && matchesPhase && matchesClass
  })

  // Dynamic Statistics
  const allTeacherResults = submissions.filter(result => {
    const assessment = assessments.find(a => a.id === result.assignmentId)
    return assessment?.classLevels.some(level => myCourses.some(c => c.title === level))
  })

  // Pending Grading
  const pendingCount = allTeacherResults.filter(r => r.status === 'pending').length
  
  // Averages
  const gradedResults = allTeacherResults.filter(r => r.grade !== undefined && r.grade !== null) as (typeof allTeacherResults[0] & { grade: number })[]
  const totalAvg = gradedResults.length > 0 ? Math.round(gradedResults.reduce((acc, r) => acc + r.grade, 0) / gradedResults.length) : 0

  const firstTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'First Test')
  const firstTestAvg = firstTestResults.length > 0 ? Math.round(firstTestResults.reduce((acc, r) => acc + r.grade, 0) / firstTestResults.length) : 0

  const lastTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'Last Test')
  const lastTestAvg = lastTestResults.length > 0 ? Math.round(lastTestResults.reduce((acc, r) => acc + r.grade, 0) / lastTestResults.length) : 0

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
            Test Results
          </h1>
          <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
            Track student performance across all test phases
          </p>
        </motion.div>
        <motion.div variants={STAGGER_ITEM} className="flex items-center gap-2">
          <Button variant="outline" className="hover-lift border-primary/20 bg-card/40 backdrop-blur-md rounded-xl h-11 px-6">
            <Award className="w-4 h-4 mr-2" />
            <span className="text-[10px] uppercase tracking-widest font-normal">Export Grades</span>
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
                <TrendingUp className="w-3 h-3" /> Average Score
              </CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{totalAvg > 0 ? `${totalAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Pending Evaluation</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal text-warning">{pendingCount > 0 ? pendingCount : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">First Test Avg</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{firstTestAvg > 0 ? `${firstTestAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Last Test Avg</CardDescription>
              <CardTitle className="text-3xl font-sans font-normal">{lastTestAvg > 0 ? `${lastTestAvg}%` : '--'}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
          <Input
            placeholder="Search student identity..."
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
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Student Profile</th>
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Academic Class</th>
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Assessment Phase</th>
                    <th className="px-8 py-4 text-left text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60">Institutional Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredResults.map((result) => {
                    const student = students.find(s => s.id === result.studentId)
                    const assessment = assessments.find(a => a.id === result.assignmentId)
                    const studentCourse = myCourses.find(c => student?.enrolledCourses.includes(c.id))
                    
                    const absoluteScore = result.grade && assessment ? Math.round((result.grade / 100) * assessment.totalMarks) : null

                    return (
                      <tr key={result.id} className="hover:bg-primary/[0.02] transition-premium group cursor-pointer h-24" onClick={() => {
                        setSelectedResult(result)
                        setIsGradeOpen(true)
                      }}>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-sans font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">
                              {result.studentName || 'Student Registry'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-normal uppercase tracking-widest">
                              {result.studentId}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-sans font-normal text-sm text-foreground/70">{studentCourse?.title || 'Registry Level'}</span>
                            <span className="text-[10px] text-muted-foreground/50 tracking-widest font-normal uppercase">
                              {student?.classTiming || 'Timing TBC'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 space-y-2">
                          <p className="font-sans font-normal text-sm text-foreground/80">{assessment?.title}</p>
                          <Badge variant="outline" className="text-[9px] h-5 px-2 py-0 uppercase tracking-widest font-normal text-primary/70 border-primary/10 bg-primary/5">
                            {assessment?.phase}
                          </Badge>
                        </td>
                        <td className="px-8 py-5">
                          {absoluteScore !== null ? (
                            <div className="flex flex-col">
                              <span className="text-base font-normal text-foreground font-sans">
                                {absoluteScore} <span className="text-muted-foreground/20 font-sans">/ {assessment?.totalMarks}</span>
                              </span>
                              <span className="text-[10px] font-normal text-success/70 uppercase tracking-widest mt-0.5">
                                {result.grade}% Institutional Rank
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] uppercase font-normal tracking-widest bg-warning/5 text-warning border-warning/20 h-6 px-3">
                              Pending Evaluation
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No results found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent className="max-w-2xl border-primary/5 shadow-22xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-muted/5 border-b border-primary/5">
            <DialogTitle className="font-serif text-2xl font-normal">Institutional Evaluation Audit</DialogTitle>
            <DialogDescription className="text-editorial-meta text-xs">
              Reviewing academic block responses and AI audit justifications.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-normal opacity-40">Examination Record</span>
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-normal h-5 border-primary/10">{selectedResult?.id}</Badge>
              </div>
              <div className="rounded-[2rem] border border-primary/5 bg-card/40 p-1 overflow-hidden">
                <div className="space-y-4 max-h-[40vh] overflow-y-auto p-7 premium-scrollbar">
                  {selectedResult?.randomizedQuestions?.map((q: any, i: number) => (
                    <div key={q.id} className="space-y-3 pb-6 border-b border-primary/5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-normal text-primary uppercase tracking-widest opacity-60">Taxonomy Block {i+1}: {q.category}</span>
                        {q.correctAnswer && (
                          <span className="text-[9px] text-success font-normal uppercase tracking-widest">Key: {q.correctAnswer}</span>
                        )}
                      </div>
                      <p className="text-base font-sans font-normal text-foreground/80 leading-relaxed">{q.content}</p>
                      <div className="p-4 rounded-2xl bg-muted/20 border border-primary/5 text-sm font-normal">
                        <span className="text-muted-foreground/40 mr-3 text-[10px] uppercase tracking-widest">Entry:</span>
                        {selectedResult?.answers?.[q.id] || 'No response captured.'}
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-primary/[0.02] p-6 rounded-[1.5rem] border border-primary/10">
                    <p className="text-[10px] font-normal text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" /> AI Audit Justification
                    </p>
                    <p className="text-sm font-normal italic text-muted-foreground leading-relaxed">
                      "{selectedResult?.aiJustification || 'No specific audit data available for this legacy registry entry.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-normal opacity-50">Manual Score (%)</label>
                <Input 
                  type="number" 
                  placeholder={selectedResult?.grade?.toString()} 
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  max="100" 
                  className="h-12 bg-card border-primary/10 rounded-xl text-lg font-sans"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-normal opacity-50">Correction / Feedback</label>
                <Textarea 
                  placeholder="Record formal feedback for the student registry..." 
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  rows={2} 
                  className="bg-card border-primary/10 rounded-xl resize-none text-sm p-4 h-12 min-h-12"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/5 border-t border-primary/5 mt-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsGradeOpen(false)} className="rounded-xl px-6 h-11 border-primary/10">
              <span className="text-[10px] uppercase tracking-widest font-normal">Cancel</span>
            </Button>
            <Button 
              className="rounded-xl px-6 h-11 shadow-premium bg-primary hover:bg-primary/90"
              onClick={() => {
                if (selectedResult) {
                  gradeSubmission(
                    selectedResult.id, 
                    parseInt(gradeInput) || selectedResult.grade || 0, 
                    feedbackInput || selectedResult.feedback || ""
                  )
                  setIsGradeOpen(false)
                  setGradeInput('')
                  setFeedbackInput('')
                  toast.success("Grade Published Successfully")
                }
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-normal text-white">Publish Final Grade</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
