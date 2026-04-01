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
import type { Course } from '@/lib/types'

export default function TeacherClassesPage() {
  const { user } = useAuth()
  const { courses: mockCourses, students: mockStudents, assignments: mockAssignments, enrollments: mockEnrollments } = useData()
  const myCourses = mockCourses.filter(c => c.teacherId === user?.id)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  const filteredStudents = mockStudents.filter(student => {
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
        <h1 className="text-3xl font-normal text-foreground">
          My Classes
        </h1>
        <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
          Manage your assigned classes and view enrolled students
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Total Assigned Classes</CardDescription>
            <CardTitle className="text-3xl font-sans font-normal">{myCourses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-normal opacity-60">Total Enrolled Students</CardDescription>
            <CardTitle className="text-3xl font-sans font-normal">
              {myCourses.reduce((acc, c) => acc + c.enrolled, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Student Registry Table */}
      <Card className="border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardHeader className="border-b border-primary/5 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-normal">Student Registry</CardTitle>
              <CardDescription className="text-editorial-meta opacity-70">
                Active roster management for your assigned academic sessions.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[200px] bg-background/50">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search by ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-primary/10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/10 border-b border-primary/5 h-16">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-8">Student ID</TableHead>
                  <TableHead className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-8">Student Name</TableHead>
                  <TableHead className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-8">Guardian Name</TableHead>
                  <TableHead className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-60 py-4 px-8">Assigned Class</TableHead>
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
                  filteredStudents.map((student) => {
                    const studentCourse = myCourses.find(c => student.enrolledCourses.includes(c.id))
                    return (
                      <TableRow key={student.id} className="hover:bg-primary/[0.02] border-primary/5 transition-premium group h-20">
                        <TableCell className="font-normal text-primary tracking-tighter py-4 px-8">
                          {student.studentId || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-8">
                          <p className="font-sans font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">
                            {student.name}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-normal py-4 px-8">
                          {student.guardianName || 'Registry Record TBC'}
                        </TableCell>
                        <TableCell className="py-4 px-8">
                          <div className="flex flex-col">
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
        <DialogContent className="max-w-3xl border-primary/5 shadow-22xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-muted/5 border-b border-primary/5">
            <DialogTitle className="text-2xl font-normal">Class Registry Intelligence</DialogTitle>
            <DialogDescription className="text-editorial-meta text-xs">
              Granular view of academic enrollment and term performance.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-0">
              <TabsList className="w-full h-14 bg-muted/5 border-b border-primary/5 rounded-none p-1">
                <TabsTrigger value="overview" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-[10px] uppercase tracking-widest font-normal">Overview</TabsTrigger>
                <TabsTrigger value="students" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-[10px] uppercase tracking-widest font-normal">Students</TabsTrigger>
                <TabsTrigger value="assessments" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm text-[10px] uppercase tracking-widest font-normal">Assessments</TabsTrigger>
              </TabsList>

              <div className="p-8">
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
                        <span className="text-[10px] uppercase tracking-widest font-normal opacity-60">Enrollment</span>
                      </div>
                      <p className="text-2xl font-sans font-normal">{selectedCourse.enrolled}/{selectedCourse.capacity}</p>
                      <Progress value={(selectedCourse.enrolled / selectedCourse.capacity) * 100} className="h-1 mt-3" />
                    </div>
                    <div className="p-6 rounded-2xl border border-primary/5 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-widest font-normal opacity-60">Duration</span>
                      </div>
                      <p className="text-2xl font-sans font-normal">{selectedCourse.duration}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-primary/5 bg-card/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-widest font-normal opacity-60">Schedule</span>
                    </div>
                    <p className="font-sans font-normal text-lg">{selectedCourse.schedule}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-normal opacity-50">
                      Term: {new Date(selectedCourse.startDate).toLocaleDateString()} — {new Date(selectedCourse.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="mt-0">
                  <div className="space-y-3">
                    {mockStudents.filter(s => s.enrolledCourses.includes(selectedCourse.id)).map((student) => {
                      const enrollment = mockEnrollments.find(e => e.studentId === student.id && e.courseId === selectedCourse.id)
                      const progress = enrollment?.progress || 0
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 bg-card/40 hover:bg-muted/30 transition-premium group">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-primary/10">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-normal">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-sans font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">{student.name}</p>
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
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-[9px] uppercase tracking-widest font-normal h-5 border-none shadow-premium">
                              {student.grade || '-'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="assessments" className="mt-0">
                  <div className="space-y-3">
                    {mockAssignments.filter(a => a.courseId === selectedCourse.id).map((assignment) => (
                      <div key={assignment.id} className="p-5 rounded-2xl border border-primary/5 bg-card/40 hover:bg-muted/30 transition-premium group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-sans font-normal text-lg group-hover:text-primary transition-colors">{assignment.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal opacity-50">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={assignment.status === 'active' ? 'default' : 'secondary'}
                            className={`text-[9px] uppercase tracking-widest font-normal h-5 ${assignment.status === 'active' ? 'bg-success hover:bg-success/90' : ''}`}
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-editorial-meta text-sm opacity-70 mb-5">{assignment.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-normal opacity-50">
                            <span>Capture Status</span>
                            <span>{assignment.submissionsCount}/{assignment.totalStudents} Registry Entries</span>
                          </div>
                          <Progress 
                            value={(assignment.submissionsCount / assignment.totalStudents) * 100} 
                            className="h-1 shadow-sm" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
