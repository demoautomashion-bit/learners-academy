'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Clock,
  Calendar,
  BookOpen,
  Eye,
  ClipboardList,
  Search,
  MoreHorizontal,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import type { Course } from '@/lib/types'

export default function TeacherClassesPage() {
  const { user } = useAuth()
  if (!user?.id) return null
  const { courses: mockCourses, students: mockStudents, assessments: mockAssessments, submissions: mockSubmissions, enrollments: mockEnrollments, isInitialized } = useData()
  const myCourses = mockCourses?.filter(c => c.teacherId === user?.id)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  const [evalStudent, setEvalStudent] = useState<any | null>(null)
  const [evalScores, setEvalScores] = useState({ attendance: 60, participation: 20, discipline: 10, extra: 10 })

  if (!isInitialized) return <DashboardSkeleton />

  const validDossierClasses = [
    'Pre-Foundation', 'Foundation One', 'Foundation Two', 'Foundation Three', 
    'Beginners', 'Level One', 'Level Two', 'Level Three', 'Level Four', 'Level Five'
  ]

  const filteredStudents = mockStudents?.filter(student => {
    // Check if student is in any of the teacher's classes
    const isMyStudent = student.enrolledCourses.some(studentCourseId => 
      myCourses.some(myCourse => myCourse.id === studentCourseId)
    )
    if (!isMyStudent) return false

    // Apply filters
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = classFilter === 'all' || student.enrolledCourses.includes(classFilter)

    return matchesSearch && matchesClass
  })

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-success/10 text-success border-success/20'
      case 'intermediate':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'advanced':
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-tight text-foreground font-normal">
          My Classes
        </h1>
        <p className="text-muted-foreground mt-1 text-sm opacity-70">
          Manage your assigned classes and view enrolled students
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl">
          <CardHeader className="p-6 pb-2">
            <CardDescription className="text-xs uppercase tracking-widest font-normal opacity-60">Total Assigned Classes</CardDescription>
            <CardTitle className="text-3xl font-sans font-normal">{myCourses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl">
          <CardHeader className="p-6 pb-2">
            <CardDescription className="text-xs uppercase tracking-widest font-normal opacity-60">Total Enrolled Students</CardDescription>
            <CardTitle className="text-3xl font-sans font-normal">
              {mockStudents?.filter(s => (s.enrolledCourses || []).some(courseId => myCourses.some(mc => mc.id === courseId))).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Student Registry Table */}
      <Card className="border-primary/5 shadow-premium rounded-2xl overflow-hidden bg-card/40 backdrop-blur-xl">
        <CardHeader className="border-b border-primary/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-serif font-normal">Student Registry</CardTitle>
              <CardDescription className="text-xs opacity-70">
                Active roster management for your assigned academic sessions.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[200px] h-10 bg-background/50 rounded-xl text-xs uppercase tracking-widest">
                  <SelectValue placeholder="All My Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All My Classes</SelectItem>
                  {myCourses?.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search by ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 bg-background/50 border-primary/10 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/10 border-b border-primary/5 h-14">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-xs font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-6">Student ID</TableHead>
                  <TableHead className="text-xs font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-6">Student Name</TableHead>
                  <TableHead className="text-xs font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-6">Guardian Name</TableHead>
                  <TableHead className="text-xs font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-6 text-right">Assigned Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No students found in this roster.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents?.map((student) => {
                    const studentCourse = myCourses.find(c => student.enrolledCourses.includes(c.id))
                    return (
                      <TableRow key={student.id} className="hover:bg-primary/[0.02] border-primary/5 transition-premium group h-16">
                        <TableCell className="font-normal text-primary tracking-tighter py-4 px-6">
                          {student.studentId || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <p className="font-sans font-medium text-sm text-foreground/80 group-hover:text-primary transition-colors">
                            {student.name}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-normal text-sm py-4 px-6">
                          {student.guardianName || 'Registry Record TBC'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-normal text-sm text-foreground/70">{studentCourse?.title || 'Course Registry'}</span>
                            <span className="text-[10px] text-muted-foreground/60 tracking-widest font-normal uppercase">
                              {student.classTiming || 'Session TBC'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Course Detail Dialog */}
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border-primary/5 shadow-premium">
          <DialogHeader className="bg-muted/5 border-b border-primary/5 p-6">
            <DialogTitle className="text-xl font-serif font-normal">Class Registry Intelligence</DialogTitle>
            <DialogDescription className="text-xs opacity-60">
              Granular view of academic enrollment and term performance.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-0">
              <TabsList className="w-full h-12 bg-muted/5 border-b border-primary/5 rounded-none p-1">
                <TabsTrigger value="overview" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs uppercase tracking-widest font-normal">Overview</TabsTrigger>
                <TabsTrigger value="students" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs uppercase tracking-widest font-normal">Students</TabsTrigger>
                <TabsTrigger value="assessments" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs uppercase tracking-widest font-normal">Assessments</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getLevelColor(selectedCourse.level)}>
                        {selectedCourse.level}
                      </Badge>
                      <Badge 
                        variant={selectedCourse.status === 'active' ? 'default' : 'secondary'}
                        className={selectedCourse.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                      >
                        {selectedCourse.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-serif font-normal">{selectedCourse.title}</h3>
                    <p className="text-muted-foreground mt-2 text-editorial-meta opacity-70">{selectedCourse.description}</p>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="p-6 rounded-2xl border border-primary/5 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-widest font-normal opacity-60">Enrollment</span>
                      </div>
                      <p className="text-3xl font-sans font-normal">
                        {mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length}/{selectedCourse.capacity}
                      </p>
                      <Progress value={(mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length / (selectedCourse.capacity || 1)) * 100} className="h-1 mt-3" />
                    </div>
                    <div className="p-6 rounded-2xl border border-primary/5 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-widest font-normal opacity-60">Duration</span>
                      </div>
                      <p className="text-3xl font-sans font-normal">{selectedCourse.duration}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-primary/5 bg-card/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs uppercase tracking-widest font-normal opacity-60">Schedule</span>
                    </div>
                    <p className="font-sans font-normal text-base">{selectedCourse.schedule}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-normal opacity-50">
                      Term: {new Date(selectedCourse.startDate).toLocaleDateString()} — {new Date(selectedCourse.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="mt-0">
                  <div className="space-y-3">
                    {mockStudents?.filter(s => s.enrolledCourses.includes(selectedCourse.id)).map((student) => {
                      const enrollment = mockEnrollments.find(e => e.studentId === student.id && e.courseId === selectedCourse.id)
                      const progress = enrollment?.progress || 0
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 rounded-xl border border-primary/5 bg-card/40 hover:bg-muted/30 transition-premium group">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-primary/10">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-normal">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-sans font-medium text-sm text-foreground/80 group-hover:text-primary transition-colors">{student.name}</p>
                              <p className="text-[10px] text-muted-foreground font-normal tracking-widest uppercase opacity-60">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className="text-[9px] uppercase tracking-widest opacity-50 font-normal">Progress</span>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="w-20 h-0.5 shadow-sm" />
                                <span className="text-[10px] font-normal">{progress}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-[9px] uppercase tracking-widest font-normal h-5 border-none shadow-premium">
                                {student.grade || '-'}
                              </Badge>
                              {selectedCourse && validDossierClasses.includes(selectedCourse.title) && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 px-4 text-xs uppercase tracking-widest bg-primary/5 border-primary/10 hover:bg-primary/20 text-primary transition-premium rounded-xl"
                                  onClick={() => {
                                    setEvalStudent(student)
                                    setEvalScores({ attendance: 60, participation: 20, discipline: 10, extra: 10 })
                                  }}
                                >
                                  Draft Dossier
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="assessments" className="mt-0">
                  <div className="space-y-3">
                    {mockAssessments?.filter(a => (a.classLevels || []).includes(selectedCourse.title)).map((assessment) => {
                      const totalSubmissions = mockSubmissions?.filter(s => s.assignmentId === assessment.id).length;
                      const rosterCount = mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length;
                      const safeTotal = rosterCount > 0 ? rosterCount : 1;

                      return (
                        <div key={assessment.id} className="p-5 rounded-2xl border border-primary/5 bg-card/40 hover:bg-muted/30 transition-premium group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <ClipboardList className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-sans font-normal text-lg group-hover:text-primary transition-colors">{assessment.title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-50">Phase: {assessment.phase}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={assessment.status === 'active' ? 'default' : 'secondary'}
                              className={`text-[9px] uppercase tracking-widest font-normal h-5 ${assessment.status === 'active' ? 'bg-success hover:bg-success/90' : ''}`}
                            >
                              {assessment.status}
                            </Badge>
                          </div>
                          <p className="text-editorial-meta text-sm opacity-70 mb-5">{assessment.nature} Assessment</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-normal opacity-50">
                              <span>Capture Status</span>
                              <span>{totalSubmissions}/{rosterCount} Registry Entries</span>
                            </div>
                            <Progress 
                              value={(totalSubmissions / safeTotal) * 100} 
                              className="h-1 shadow-sm" 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Term Dossier Dialog */}
      <Dialog open={!!evalStudent} onOpenChange={(open) => !open && setEvalStudent(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-primary/5 shadow-premium">
          {evalStudent && selectedCourse && (() => {
            const studentMidterms = mockSubmissions?.filter(s => s.studentId === evalStudent.id && mockAssessments.find(a => a.id === s.assignmentId && a.phase === 'First Test' && (a.classLevels || []).includes(selectedCourse.title)))
            const midtermScore = studentMidterms.length > 0 && studentMidterms[0].grade ? studentMidterms[0].grade : 0 
            
            const studentFinals = mockSubmissions?.filter(s => s.studentId === evalStudent.id && mockAssessments.find(a => a.id === s.assignmentId && a.phase === 'Last Test' && (a.classLevels || []).includes(selectedCourse.title)))
            const finalScore = studentFinals.length > 0 && studentFinals[0].grade ? studentFinals[0].grade : 0
            
            const grandTotal = midtermScore + finalScore + evalScores.attendance + evalScores.participation + evalScores.discipline + evalScores.extra
            const percentage = Math.round((grandTotal / 300) * 100)
            
            let grade = 'F'
            let eligibility = 'Not qualified/fail'

            if (percentage >= 85) { grade = 'A+'; eligibility = 'Promoted' }
            else if (percentage >= 75) { grade = 'A'; eligibility = 'Promoted' }
            else if (percentage >= 65) { grade = 'B'; eligibility = 'Promoted' }
            else if (percentage >= 55) { grade = 'C'; eligibility = 'Promoted' }
            else if (percentage >= 45) { grade = 'D'; eligibility = 'Promoted' }
            else if (percentage >= 40) { grade = 'E'; eligibility = 'Eligible for next level' }
            else if (percentage >= 36) { grade = 'E'; eligibility = 'Promoted' }

            return (
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 border-b border-primary/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="font-serif text-3xl font-normal">{evalStudent.name}</DialogTitle>
                      <DialogDescription className="text-xs uppercase tracking-widest opacity-60 mt-2">
                        {evalStudent.guardianName || 'Guardian Record'} • {selectedCourse.title}
                      </DialogDescription>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-widest bg-primary/5 text-primary border-primary/20 h-6 px-3">Term Dossier</Badge>
                  </div>
                </DialogHeader>

                <div className="p-8 grid md:grid-cols-2 gap-8 overflow-y-auto premium-scrollbar max-h-[60vh]">
                  
                  {/* Left Column: Input Panel */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary/50" />
                        <h4 className="text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-80">Institutional Assessments</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-muted/20 border border-primary/5">
                          <p className="text-[9px] uppercase tracking-widest font-normal text-muted-foreground mb-1">Midterm</p>
                          <p className="font-sans text-xl font-normal text-foreground/80">{midtermScore} <span className="text-xs text-muted-foreground opacity-50">/100</span></p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/20 border border-primary/5">
                          <p className="text-[9px] uppercase tracking-widest font-normal text-muted-foreground mb-1">Final Test</p>
                          <p className="font-sans text-xl font-normal text-foreground/80">{finalScore} <span className="text-xs text-muted-foreground opacity-50">/100</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary/50" />
                        <h4 className="text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-80">Subjective Scoring</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-xs uppercase tracking-widest font-normal w-32">Attendance</label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              type="number" max={60} min={0} 
                              value={evalScores.attendance} 
                              onChange={e => setEvalScores(prev => ({ ...prev, attendance: Math.min(60, Math.max(0, Number(e.target.value) || 0)) }))}
                              className="h-9 bg-background/50 border-primary/10 focus-visible:ring-primary text-sm font-medium"
                            />
                            <span className="text-[10px] text-muted-foreground opacity-50 w-8 text-right">/60</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-xs uppercase tracking-widest font-normal w-32">Participation</label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              type="number" max={20} min={0} 
                              value={evalScores.participation} 
                              onChange={e => setEvalScores(prev => ({ ...prev, participation: Math.min(20, Math.max(0, Number(e.target.value) || 0)) }))}
                              className="h-9 bg-background/50 border-primary/10 focus-visible:ring-primary text-sm font-medium"
                            />
                            <span className="text-[10px] text-muted-foreground opacity-50 w-8 text-right">/20</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-xs uppercase tracking-widest font-normal w-32">Discipline</label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              type="number" max={10} min={0} 
                              value={evalScores.discipline} 
                              onChange={e => setEvalScores(prev => ({ ...prev, discipline: Math.min(10, Math.max(0, Number(e.target.value) || 0)) }))}
                              className="h-9 bg-background/50 border-primary/10 focus-visible:ring-primary text-sm font-medium"
                            />
                            <span className="text-[10px] text-muted-foreground opacity-50 w-8 text-right">/10</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-xs uppercase tracking-widest font-normal w-32">Activities</label>
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              type="number" max={10} min={0} 
                              value={evalScores.extra} 
                              onChange={e => setEvalScores(prev => ({ ...prev, extra: Math.min(10, Math.max(0, Number(e.target.value) || 0)) }))}
                              className="h-9 bg-background/50 border-primary/10 focus-visible:ring-primary text-sm font-medium"
                            />
                            <span className="text-[10px] text-muted-foreground opacity-50 w-8 text-right">/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Engine */}
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/10 border border-primary/5 rounded-3xl h-full">
                    <div className="text-center space-y-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Term Grand Total</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="font-sans text-6xl font-normal text-primary">{grandTotal}</span>
                          <span className="text-xl text-muted-foreground opacity-40">/300</span>
                        </div>
                      </div>

                      <Progress value={percentage} className="h-1.5 w-48 mx-auto bg-primary/10" />

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Percentage</p>
                          <p className="font-sans text-xl font-normal">{percentage}%</p>
                        </div>
                        <div className="w-px h-8 bg-border/50" />
                        <div className="text-center">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Grade Mark</p>
                          <p className="font-sans text-xl font-normal text-primary">{grade}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-normal px-4 py-1.5 ${percentage >= 36 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          {eligibility}
                        </Badge>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
