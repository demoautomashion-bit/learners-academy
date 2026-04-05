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
  Eye,
  ClipboardList,
  Search,
} from 'lucide-react'
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
import type { Course, Student } from '@/lib/types'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { cn } from '@/lib/utils'

export default function TeacherClassesPage() {
  const { user } = useAuth()
  const { courses: mockCourses, students: mockStudents, assessments: mockAssessments, submissions: mockSubmissions, enrollments: mockEnrollments, isInitialized } = useData()

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  const [evalStudent, setEvalStudent] = useState<any | null>(null)
  const [evalScores, setEvalScores] = useState({ attendance: 60, participation: 20, discipline: 10, extra: 10 })

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = mockCourses?.filter(c => c.teacherId === user?.id) || []

  const validDossierClasses = [
    'Pre-Foundation', 'Foundation One', 'Foundation Two', 'Foundation Three', 
    'Beginners', 'Level One', 'Level Two', 'Level Three', 'Level Four', 'Level Five'
  ]

  const filteredStudents = mockStudents?.filter(student => {
    const isMyStudent = student.enrolledCourses.some(studentCourseId => 
      myCourses.some(myCourse => myCourse.id === studentCourseId)
    )
    if (!isMyStudent) return false

    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = classFilter === 'all' || student.enrolledCourses.includes(classFilter)

    return matchesSearch && matchesClass
  }) || []

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

  const columns: Column<Student>[] = [
    {
      label: 'Student ID',
      render: (student) => (
        <span className="font-normal text-primary">
          {student.studentId || 'N/A'}
        </span>
      ),
      width: '150px'
    },
    {
      label: 'Student Name',
      render: (student) => (
        <p className="font-sans font-medium text-sm text-foreground/80 group-hover:text-primary transition-colors">
          {student.name}
        </p>
      ),
      width: '250px'
    },
    {
      label: 'Guardian Name',
      render: (student) => (
        <span className="text-muted-foreground font-normal text-sm opacity-60">
          {student.guardianName || 'Registry Record TBC'}
        </span>
      )
    },
    {
      label: 'Assigned Class',
      render: (student) => {
        const studentCourse = myCourses.find(c => student.enrolledCourses.includes(c.id))
        return (
          <div className="flex flex-col items-end">
            <span className="font-normal text-sm text-foreground/70">{studentCourse?.title || 'Course Registry'}</span>
            <span className="text-[10px] text-muted-foreground/60 font-normal opacity-50">
              {student.classTiming || 'Session TBC'}
            </span>
          </div>
        )
      },
      width: '200px'
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="My Classes"
        description="Manage your assigned classes and view enrolled students."
      />

      <EntityCardGrid 
        data={[
          { label: 'Total Assigned Classes', value: myCourses.length, sub: 'Faculty Allocation' },
          { 
            label: 'Total Enrolled Students', 
            value: mockStudents?.filter(s => (s.enrolledCourses || []).some(courseId => myCourses.some(mc => mc.id === courseId))).length,
            sub: 'Active Roster'
          },
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
          title="Student Registry"
          description="Active roster management for your assigned academic sessions."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-muted/5 text-xs font-normal">
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
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
                <Input
                  placeholder="Search by ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 bg-muted/5 font-normal text-sm"
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Course Detail Dialog (kept for high-value feature if needed) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="bg-muted/5 border-b p-6">
            <DialogTitle className="text-xl font-serif font-medium">Class Registry Intelligence</DialogTitle>
            <DialogDescription className="text-xs font-normal opacity-60">
              Granular view of academic enrollment and term performance.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-0">
              <TabsList className="w-full h-12 bg-muted/5 border-b p-1 rounded-none">
                <TabsTrigger value="overview" className="flex-1 rounded-none text-xs font-normal">Overview</TabsTrigger>
                <TabsTrigger value="students" className="flex-1 rounded-none text-xs font-normal">Students</TabsTrigger>
                <TabsTrigger value="assessments" className="flex-1 rounded-none text-xs font-normal">Assessments</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={cn("text-[10px] font-normal", getLevelColor(selectedCourse.level))}>
                        {selectedCourse.level}
                      </Badge>
                      <Badge className={cn("text-[10px] font-normal", selectedCourse.status === 'active' ? 'bg-success hover:bg-success/90' : '')}>
                        {selectedCourse.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-serif font-medium">{selectedCourse.title}</h3>
                    <p className="text-xs font-normal opacity-70 mt-2">{selectedCourse.description}</p>
                  </div>

                  <div className="grid gap-4 grid-cols-2 items-stretch">
                    <div className="p-6 border rounded-xl bg-card">
                      <div className="flex items-center gap-2 mb-2 opacity-60">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-normal uppercase">Enrollment</span>
                      </div>
                      <p className="text-3xl font-sans font-normal">
                        {mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length}/{selectedCourse.capacity}
                      </p>
                      <Progress value={(mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length / (selectedCourse.capacity || 1)) * 100} className="h-1 mt-3" />
                    </div>
                    <div className="p-6 border rounded-xl bg-card">
                      <div className="flex items-center gap-2 mb-2 opacity-60">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-normal uppercase">Duration</span>
                      </div>
                      <p className="text-3xl font-sans font-normal">{selectedCourse.duration}</p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl bg-card">
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-normal uppercase">Schedule</span>
                    </div>
                    <p className="font-sans font-normal text-base">{selectedCourse.schedule}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-normal opacity-50">
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
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/5 transition-premium group">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border ">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-normal">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-sans font-medium text-sm text-foreground/80 group-hover:text-primary transition-colors">{student.name}</p>
                              <p className="text-[10px] text-muted-foreground font-normal opacity-60">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className="text-[10px] opacity-50 font-normal uppercase">Progress</span>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="w-20 h-0.5 shadow-sm" />
                                <span className="text-[10px] font-normal">{progress}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-[10px] font-normal h-5 border-none ">
                                {student.grade || '-'}
                              </Badge>
                              {selectedCourse && validDossierClasses.includes(selectedCourse.title) && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 text-[10px] bg-primary/5 hover:bg-primary/10 transition-premium font-normal"
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
                      const totalSubmissions = mockSubmissions?.filter(s => s.assignmentId === assessment.id).length || 0;
                      const rosterCount = mockStudents?.filter(s => (s.enrolledCourses || []).includes(selectedCourse.id)).length || 0;
                      const safeTotal = rosterCount > 0 ? rosterCount : 1;

                      return (
                        <div key={assessment.id} className="p-5 border rounded-xl hover:bg-muted/5 transition-premium group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/5 text-primary opacity-60">
                                <ClipboardList className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-sans font-normal text-lg group-hover:text-primary transition-colors">{assessment.title}</p>
                                <p className="text-[10px] text-muted-foreground font-normal opacity-50">Phase: {assessment.phase}</p>
                              </div>
                            </div>
                            <Badge 
                              className={cn("text-[10px] font-normal h-5", assessment.status === 'active' ? 'bg-success hover:bg-success/90' : '')}
                            >
                              {assessment.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-normal opacity-70 mb-5">{assessment.nature} Assessment</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-normal opacity-50 uppercase">
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
    </PageShell>
  )
}
