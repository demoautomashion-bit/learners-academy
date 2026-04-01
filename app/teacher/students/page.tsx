"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
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
import { motion, AnimatePresence } from "framer-motion"
import { STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/premium-motion"
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Search, Users, TrendingUp, Award, Mail, Phone, Calendar, ArrowRight } from "lucide-react"

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const { students: mockStudents, courses: mockCourses, enrollments: mockEnrollments, isInitialized } = useData()
  
  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Get students enrolled in teacher's courses
  const teacherCourses = mockCourses.filter(c => c.teacherId === user?.id)
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
      return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>
    } else if (progress >= 60) {
      return <Badge className="bg-primary/10 text-primary border-primary/20">Good</Badge>
    } else if (progress >= 40) {
      return <Badge className="bg-warning/10 text-warning border-warning/20">Average</Badge>
    } else {
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Attention</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={STAGGER_ITEM} className="font-serif text-3xl font-normal text-foreground">My Student Registry</motion.h1>
        <motion.p variants={STAGGER_ITEM} className="mt-1 text-muted-foreground text-editorial-meta opacity-70">
          Monitor academic progress and institutional engagement of your enrolled pupils.
        </motion.p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-40" />
          <Input
            placeholder="Search student identity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-sm transition-premium focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px] h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-[10px] uppercase tracking-widest font-normal">
            <SelectValue placeholder="All Academic Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Academic Levels</SelectItem>
            {teacherCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <motion.div 
        className="grid gap-4 sm:grid-cols-3"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-serif font-normal text-foreground">{studentsInTeacherCourses.length}</p>
                <p className="text-[10px] uppercase tracking-widest font-normal opacity-50">Total Registry</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-2xl bg-success/5 p-4 border border-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-3xl font-serif font-normal text-foreground">
                  {Math.round(studentsInTeacherCourses.reduce((acc, s) => acc + (mockEnrollments.find(e => e.studentId === s.id)?.progress || 0), 0) / (studentsInTeacherCourses.length || 1))}%
                </p>
                <p className="text-[10px] uppercase tracking-widest font-normal opacity-50">Average Mastery</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift transition-premium border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[1.5rem]">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-2xl bg-warning/5 p-4 border border-warning/10">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-serif font-normal text-foreground">
                  {studentsInTeacherCourses.filter(s => {
                    const enrollment = mockEnrollments.find(e => e.studentId === s.id)
                    return enrollment && enrollment.progress >= 80
                  }).length}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-normal opacity-50">High Performers</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Students Grid */}
      <Card className="border-primary/5 bg-card/60 backdrop-blur-xl shadow-premium rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-primary/5">
          <CardTitle className="font-serif text-2xl font-normal">Pupil Intelligence Report</CardTitle>
          <CardDescription className="text-editorial-meta opacity-60">Monitor detailed mastery and engagement across the registry.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {filteredStudents.length === 0 ? (
            <div className="py-20 text-center">
              <div className="bg-primary/5 p-6 rounded-full w-fit mx-auto mb-6">
                <Users className="w-10 h-10 text-primary/30" />
              </div>
              <p className="font-serif text-lg opacity-60">No students found in the current selection.</p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
            >
              {filteredStudents.map((student) => {
                const enrollment = mockEnrollments.find(e => e.studentId === student.id)
                const progress = enrollment?.progress || 0
                
                return (
                  <motion.div key={student.id} variants={STAGGER_ITEM}>
                    <Card 
                      className="cursor-pointer transition-premium border-primary/5 bg-muted/10 hover:bg-card hover:shadow-22xl hover-lift rounded-[2rem] overflow-hidden group"
                      onClick={() => {
                        setSelectedStudent(student)
                        setDetailsOpen(true)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                            <Avatar className="h-14 w-14 ring-4 ring-primary/5 shadow-premium">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xl font-serif">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-end">
                              {getPerformanceBadge(progress)}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="font-serif text-lg font-normal text-foreground/80 group-hover:text-primary transition-colors">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-normal uppercase tracking-widest truncate">{student.email}</p>
                          </div>
                          
                          <div className="pt-4 border-t border-primary/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-widest font-normal opacity-40">Academic Mastery</span>
                              <span className="text-sm font-normal text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-primary/5" />
                          </div>
                          
                          <Button variant="ghost" className="w-full justify-between h-10 px-4 rounded-xl group/btn hover:bg-primary/5 hover:text-primary transition-premium text-[10px] uppercase tracking-widest font-normal">
                            View Profile Intelligence
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl border-primary/5 shadow-22xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-muted/5 border-b border-primary/5">
            <DialogTitle className="font-serif text-2xl font-normal">Student Intelligence Profile</DialogTitle>
            <DialogDescription className="text-editorial-meta text-xs">
              Institutional record of academic performance and contact registry.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-primary/5 shadow-premium">
                  <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                  <AvatarFallback className="bg-primary/5 text-3xl font-serif text-primary">
                    {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-3xl font-serif font-normal text-foreground group-hover:text-primary transition-colors">{selectedStudent.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-normal text-muted-foreground opacity-60 mt-1">Registry Grade: {selectedStudent.grade || 'Pending Evaluation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest font-normal opacity-40">Email Registry</span>
                    <span className="text-xs font-normal truncate max-w-[120px]">{selectedStudent.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/5">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest font-normal opacity-40">Contact Number</span>
                    <span className="text-xs font-normal">{selectedStudent.phone || "+1 (555) 123-4567"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/5">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest font-normal opacity-40">Admitted At</span>
                    <span className="text-xs font-normal">{new Date(selectedStudent.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-primary/5">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-40">Academic Batch Enrollments</h4>
                <div className="grid gap-4">
                  {mockEnrollments
                    .filter(e => e.studentId === selectedStudent.id)
                    .map(enrollment => {
                      const course = mockCourses.find(c => c.id === enrollment.courseId)
                      return (
                        <div key={enrollment.id} className="rounded-[1.5rem] border border-primary/5 bg-muted/10 p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="font-serif text-base font-normal">{course?.title}</p>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-normal border-primary/10 bg-card px-2 h-5">{enrollment.progress}% Mastery</Badge>
                          </div>
                          <Progress value={enrollment.progress} className="h-1.5 bg-primary/5" />
                        </div>
                      )
                    })
                  }
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-primary/5">
                <Button variant="outline" onClick={() => setDetailsOpen(false)} className="rounded-xl px-6 h-11 border-primary/10">
                  <span className="text-[10px] uppercase tracking-widest font-normal">Close Registry</span>
                </Button>
                <Button className="rounded-xl px-6 h-11 shadow-premium bg-primary hover:bg-primary/90">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest font-normal text-white">Direct Message</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
