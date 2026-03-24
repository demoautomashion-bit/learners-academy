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
import type { Course } from '@/lib/types'

export default function TeacherClassesPage() {
  const { courses: mockCourses, students: mockStudents, assignments: mockAssignments } = useData()
  const myCourses = mockCourses.filter(c => c.teacherId === 'teacher-1')
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
        <h1 className="font-serif text-3xl font-bold text-foreground">
          My Classes
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your assigned classes and view enrolled students
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-bold">Total Assigned Classes</CardDescription>
            <CardTitle className="text-3xl font-serif">{myCourses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-editorial-label text-[10px] uppercase tracking-widest font-bold">Total Enrolled Students</CardDescription>
            <CardTitle className="text-3xl font-serif">
              {myCourses.reduce((acc, c) => acc + c.enrolled, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Student Registry Table */}
      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardHeader className="border-b border-primary/5 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-serif text-2xl">Student Registry</CardTitle>
              <CardDescription className="text-editorial-meta">
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
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4 px-6">Student ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4 px-6">Student Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4 px-6">Guardian Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4 px-6">Assigned Class</TableHead>
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
                      <TableRow key={student.id} className="hover:bg-primary/[0.02] border-primary/5 transition-colors group">
                        <TableCell className="font-bold text-primary tracking-tighter py-4 px-6">
                          {student.studentId || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <p className="font-serif font-bold text-base text-foreground/80 group-hover:text-primary transition-colors">
                            {student.name}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium py-4 px-6">
                          {student.guardianName || 'Registry Record TBC'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground/70">{studentCourse?.title || 'Course Registry'}</span>
                            <span className="text-[10px] text-muted-foreground/60 tracking-wide font-bold uppercase">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              View enrolled students and assignments
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
                <TabsTrigger value="assessments" className="flex-1">Assessments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
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
                  <h3 className="text-xl font-semibold">{selectedCourse.title}</h3>
                  <p className="text-muted-foreground mt-2">{selectedCourse.description}</p>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Enrollment</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCourse.enrolled}/{selectedCourse.capacity}</p>
                    <Progress value={(selectedCourse.enrolled / selectedCourse.capacity) * 100} className="h-2 mt-2" />
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Duration</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCourse.duration}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Schedule</span>
                  </div>
                  <p className="font-medium">{selectedCourse.schedule}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedCourse.startDate).toLocaleDateString()} - {new Date(selectedCourse.endDate).toLocaleDateString()}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="students" className="mt-4">
                <div className="space-y-3">
                  {mockStudents.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.progress}%</p>
                          <Progress value={student.progress} className="w-16 h-1.5" />
                        </div>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.grade || '-'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assessments" className="mt-4">
                <div className="space-y-3">
                  {mockAssignments.filter(a => a.courseId === selectedCourse.id || a.teacherId === 'teacher-1').slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">{assignment.title}</p>
                        </div>
                        <Badge 
                          variant={assignment.status === 'active' ? 'default' : 'secondary'}
                          className={assignment.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Submissions: {assignment.submissionsCount}/{assignment.totalStudents}
                        </span>
                        <span className="text-muted-foreground">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Progress 
                        value={(assignment.submissionsCount / assignment.totalStudents) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
