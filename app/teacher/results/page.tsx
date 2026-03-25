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
import { toast } from 'sonner'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'

export default function ResultsPage() {
  const { user } = useAuth()
  const { submissions: mockSubmissions, students: mockStudents, assessments: mockAssessments, courses: mockCourses, gradeSubmission } = useData()
  const myCourses = mockCourses.filter(c => c.teacherId === user?.id)
  const myCourseIds = myCourses.map(c => c.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [isGradeOpen, setIsGradeOpen] = useState(false)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')

  const filteredResults = mockSubmissions.filter(result => {
    const student = mockStudents.find(s => s.id === result.studentId)
    const assessment = mockAssessments.find(a => a.id === result.assignmentId)
    
    // Check if student is in the filtered class
    const isMyStudent = student?.enrolledCourses.some(id => 
      myCourses.some(c => c.id === id)
    )
    if (!isMyStudent) return false

    const matchesSearch = student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment?.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPhase = phaseFilter === 'all' || assessment?.phase === phaseFilter
    const matchesClass = classFilter === 'all' || student?.enrolledCourses.includes(classFilter)
    
    return matchesSearch && matchesPhase && matchesClass
  })

  // Dynamic Statistics
  const allTeacherResults = mockSubmissions.filter(result => {
    const student = mockStudents.find(s => s.id === result.studentId)
    return student?.enrolledCourses.some(id => myCourseIds.includes(id))
  })

  // Pending Grading
  const pendingCount = allTeacherResults.filter(r => r.status === 'pending').length
  
  // Averages
  const gradedResults = allTeacherResults.filter(r => r.grade !== undefined && r.grade !== null) as (typeof allTeacherResults[0] & { grade: number })[]
  const totalAvg = gradedResults.length > 0 ? Math.round(gradedResults.reduce((acc, r) => acc + r.grade, 0) / gradedResults.length) : 0

  const firstTestResults = gradedResults.filter(r => mockAssessments.find(a => a.id === r.assignmentId)?.phase === 'First Test')
  const firstTestAvg = firstTestResults.length > 0 ? Math.round(firstTestResults.reduce((acc, r) => acc + r.grade, 0) / firstTestResults.length) : 0

  const lastTestResults = gradedResults.filter(r => mockAssessments.find(a => a.id === r.assignmentId)?.phase === 'Last Test')
  const lastTestAvg = lastTestResults.length > 0 ? Math.round(lastTestResults.reduce((acc, r) => acc + r.grade, 0) / lastTestResults.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif">
            Test Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Track student performance across all test phases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Award className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Average Score
            </CardDescription>
            <CardTitle className="text-2xl">{totalAvg > 0 ? `${totalAvg}%` : '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Grading</CardDescription>
            <CardTitle className="text-2xl text-warning">{pendingCount > 0 ? pendingCount : '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>First Test Avg</CardDescription>
            <CardTitle className="text-2xl">{firstTestAvg > 0 ? `${firstTestAvg}%` : '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Test Avg</CardDescription>
            <CardTitle className="text-2xl">{lastTestAvg > 0 ? `${lastTestAvg}%` : '--'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-primary/10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[200px] bg-background/50 border-primary/10">
              <SelectValue placeholder="All My Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All My Classes</SelectItem>
              {myCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-[180px] bg-background/50 border-primary/10">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              <SelectItem value="First Test">First Test (Mid)</SelectItem>
              <SelectItem value="Last Test">Last Test (Final)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="border-b border-primary/5">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Student</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Class</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Test and Phase</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredResults.map((result) => {
                    const student = mockStudents.find(s => s.id === result.studentId)
                    const assessment = mockAssessments.find(a => a.id === result.assignmentId)
                    const studentCourse = myCourses.find(c => student?.enrolledCourses.includes(c.id))
                    
                    const absoluteScore = result.grade && assessment ? Math.round((result.grade / 100) * assessment.totalMarks) : null

                    return (
                      <tr key={result.id} className="hover:bg-primary/[0.02] transition-colors group cursor-pointer" onClick={() => {
                        setSelectedResult(result)
                        setIsGradeOpen(true)
                      }}>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-base text-foreground/80 group-hover:text-primary transition-colors">
                              {result.studentName || 'Student Registry'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                              {result.studentId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground/70">{studentCourse?.title || 'Registry Level'}</span>
                            <span className="text-[10px] text-muted-foreground/50 tracking-wide font-medium">
                              {student?.classTiming || 'Timing TBC'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 space-y-1">
                          <p className="font-bold text-sm text-foreground/80">{assessment?.title}</p>
                          <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 uppercase tracking-widest font-bold text-primary/70 border-primary/10 bg-primary/5">
                            {assessment?.phase}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          {absoluteScore !== null ? (
                            <div className="flex flex-col">
                              <span className="text-base font-bold text-foreground">
                                {absoluteScore} <span className="text-muted-foreground/40 font-normal">/ {assessment?.totalMarks}</span>
                              </span>
                              <span className="text-[10px] font-bold text-success/70 uppercase tracking-tight">
                                {result.grade}% Overall
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight bg-warning/10 text-warning border-warning/20">
                              Evaluation Pending
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Evaluate Test</DialogTitle>
            <DialogDescription>
              Review the student's randomized answers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4 max-h-[300px] overflow-y-auto">
              {selectedResult?.randomizedQuestions?.map((q: any, i: number) => (
                <div key={q.id} className="space-y-1.5 pb-3 border-b border-border/50 last:border-0">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Q{i+1}: {q.category}</p>
                  <p className="text-xs font-medium text-foreground">{q.content}</p>
                  <div className="p-2 rounded bg-background border text-xs">
                    <span className="text-muted-foreground mr-2 font-bold uppercase text-[9px]">Answer:</span>
                    {selectedResult?.answers?.[q.id] || 'No response provided.'}
                  </div>
                </div>
              ))}
              
              <div className="bg-primary/5 p-3 rounded border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> AI Audit Justification
                </p>
                <p className="text-xs italic text-muted-foreground">
                  "{selectedResult?.aiJustification || 'No audit data available for this legacy record.'}"
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Override Score (%)</label>
              <Input 
                type="number" 
                placeholder={selectedResult?.grade?.toString()} 
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                max="100" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correction / Feedback</label>
              <Textarea 
                placeholder="Adjust feedback for the student..." 
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedResult) {
                gradeSubmission(
                  selectedResult.id, 
                  parseInt(gradeInput) || selectedResult.grade || 0, 
                  feedbackInput || selectedResult.feedback || ""
                )
                setIsGradeOpen(false)
                setGradeInput('')
                setFeedbackInput('')
              }
            }}>Publish Final Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
