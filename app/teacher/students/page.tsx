"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Search, Users, TrendingUp, Award, Mail, Phone, Calendar } from "lucide-react"

export default function TeacherStudentsPage() {
  const { students: mockStudents, courses: mockCourses, enrollments: mockEnrollments } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Get students enrolled in teacher's courses (simulated - in real app would filter by teacher's courses)
  const teacherCourses = mockCourses.filter(c => c.teacherId === "t1")
  const teacherCourseIds = teacherCourses.map(c => c.id)
  
  const studentsInTeacherCourses = mockStudents.filter(student => {
    const studentEnrollments = mockEnrollments.filter(e => e.studentId === student.id)
    return studentEnrollments.some(e => teacherCourseIds.includes(e.courseId))
  })

  const filteredStudents = studentsInTeacherCourses.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (courseFilter === "all") return matchesSearch
    
    const studentEnrollments = mockEnrollments.filter(e => e.studentId === student.id)
    const matchesCourse = studentEnrollments.some(e => e.courseId === courseFilter)
    
    return matchesSearch && matchesCourse
  })

  const getPerformanceBadge = (progress: number) => {
    if (progress >= 80) {
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Excellent</Badge>
    } else if (progress >= 60) {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Good</Badge>
    } else if (progress >= 40) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Average</Badge>
    } else {
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Needs Attention</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">My Students</h1>
        <p className="mt-2 text-muted-foreground">View and manage students in your courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {teacherCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{studentsInTeacherCourses.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-500/10 p-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {Math.round(studentsInTeacherCourses.reduce((acc, s) => acc + (mockEnrollments.find(e => e.studentId === s.id)?.progress || 0), 0) / studentsInTeacherCourses.length)}%
              </p>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {studentsInTeacherCourses.filter(s => {
                  const enrollment = mockEnrollments.find(e => e.studentId === s.id)
                  return enrollment && enrollment.progress >= 80
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">High Performers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Click on a student to view detailed progress</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => {
                const enrollment = mockEnrollments.find(e => e.studentId === student.id)
                const progress = enrollment?.progress || 0
                
                return (
                  <Card 
                    key={student.id}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                    onClick={() => {
                      setSelectedStudent(student)
                      setDetailsOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{student.name}</p>
                            {getPerformanceBadge(progress)}
                          </div>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View detailed information and progress
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">Grade: {selectedStudent.grade || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStudent.phone || "+1 (555) 123-4567"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Enrolled: {new Date(selectedStudent.enrolledAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Enrolled Courses</h4>
                {mockEnrollments
                  .filter(e => e.studentId === selectedStudent.id)
                  .map(enrollment => {
                    const course = mockCourses.find(c => c.id === enrollment.courseId)
                    return (
                      <div key={enrollment.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{course?.title}</p>
                          <Badge variant="outline">{enrollment.progress}%</Badge>
                        </div>
                        <Progress value={enrollment.progress} className="mt-2 h-2" />
                      </div>
                    )
                  })
                }
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
