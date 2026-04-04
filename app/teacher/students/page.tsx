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
import { Search, Users, TrendingUp, Award, Mail, Phone, Calendar, ArrowRight, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TeacherStudentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { students: mockStudents, courses: mockCourses, enrollments: mockEnrollments, isInitialized } = useData()

  // All hooks MUST be declared before any early returns (Rules of Hooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

  if (!isInitialized) return <DashboardSkeleton />

  // Get students enrolled in teacher's courses
  const teacherCourses = mockCourses.filter(c => c.teacherId === user?.id)
  const teacherCourseIds = teacherCourses.map(c => c.id)
  
  const studentsInTeacherCourses = mockStudents.filter(student => {
    const studentEnrollments = mockEnrollments.filter(e => e.studentId === student.id)
    return studentEnrollments.some(e => teacherCourseIds.includes(e.courseId))
  })

  const filteredStudents = studentsInTeacherCourses.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (courseFilter === "all") return matchesSearch
    
    const studentEnrollments = mockEnrollments.filter(e => e.studentId === student.id)
    const matchesCourse = studentEnrollments.some(e => e.courseId === courseFilter)
    
    return matchesSearch && matchesCourse
  })

  const getPerformanceBadge = (progress: number) => {
    if (progress >= 80) {
      return <Badge className="bg-success text-white border-none text-[8px] uppercase tracking-widest font-black h-5 px-3 rounded-full">Elite</Badge>
    } else if (progress >= 60) {
      return <Badge className="bg-primary text-white border-none text-[8px] uppercase tracking-widest font-black h-5 px-3 rounded-full">Strong</Badge>
    } else if (progress >= 0) {
      return <Badge className="bg-warning text-white border-none text-[8px] uppercase tracking-widest font-black h-5 px-3 rounded-full">Pending</Badge>
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
        <motion.h1 variants={STAGGER_ITEM} className="text-4xl font-serif font-normal text-foreground leading-none">Student Registry</motion.h1>
        <motion.p variants={STAGGER_ITEM} className="mt-2 text-muted-foreground text-editorial-meta opacity-70">
            Institutional management for academic dossiers and pupil intelligence reports.
        </motion.p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-30" />
          <Input
            placeholder="Search student ID or identity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-14 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-sm transition-premium focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[220px] h-14 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-[10px] uppercase tracking-widest font-normal">
              <SelectValue placeholder="All Academic Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Academic Levels</SelectItem>
              {teacherCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-14 rounded-2xl border-primary/5 bg-card/40 px-6 opacity-40 hover:opacity-100 transition-all">
             <Filter className="w-4 h-4 mr-2" />
             <span className="text-[10px] uppercase tracking-widest font-normal">Filters</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <motion.div 
        className="grid gap-6 sm:grid-cols-3"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift border-primary/5 bg-card/30 backdrop-blur-md shadow-premium rounded-[2rem] p-8 overflow-hidden group">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-4xl font-sans font-normal text-foreground/80 group-hover:text-primary transition-colors">{studentsInTeacherCourses.length}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-50">Enrolled Candidates</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-12 h-12" />
            </div>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift border-primary/5 bg-card/30 backdrop-blur-md shadow-premium rounded-[2rem] p-8 overflow-hidden group">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-4xl font-sans font-normal text-foreground/80 group-hover:text-success transition-colors">
                  {studentsInTeacherCourses.length > 0 ? Math.round(studentsInTeacherCourses.reduce((acc, s) => acc + (mockEnrollments.find(e => e.studentId === s.id)?.progress || 0), 0) / studentsInTeacherCourses.length) : 0}%
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-50">Institutional Pass Rate</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-12 h-12 text-success" />
            </div>
          </Card>
        </motion.div>
        <motion.div variants={STAGGER_ITEM}>
          <Card className="hover-lift border-primary/5 bg-card/30 backdrop-blur-md shadow-premium rounded-[2rem] p-8 overflow-hidden group">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-4xl font-sans font-normal text-foreground/80 group-hover:text-warning transition-colors">
                  {studentsInTeacherCourses.filter(s => {
                    const enrollment = mockEnrollments.find(e => e.studentId === s.id)
                    return enrollment && enrollment.progress >= 80
                  }).length}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-50">Dossier Distinctions</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award className="w-12 h-12 text-warning" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Student Hub */}
      <Card className="border-primary/5 bg-card/60 backdrop-blur-xl shadow-premium rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-primary/5 flex flex-row items-center justify-between">
           <div className="space-y-1">
              <CardTitle className="text-3xl font-serif font-normal">Candidate Profiles</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-normal">Review academic dossiers and evaluate pupil performance.</CardDescription>
           </div>
           <Button variant="ghost" className="h-12 w-12 rounded-xl group hover:bg-primary/5 transition-all">
                <Users className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100" />
           </Button>
        </CardHeader>
        <CardContent className="p-10">
          {filteredStudents.length === 0 ? (
            <div className="py-24 text-center">
              <div className="bg-primary/5 p-8 rounded-full w-fit mx-auto mb-6 border border-primary/5">
                <Users className="w-12 h-12 text-primary/30" />
              </div>
              <p className="font-serif text-2xl opacity-40">No academic candidates found in selected registry.</p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
                      className="cursor-pointer transition-premium border-primary/5 bg-muted/10 hover:bg-card hover:shadow-massive hover-lift rounded-[2.5rem] overflow-hidden group border border-transparent hover:border-primary/5"
                      onClick={() => router.push(`/teacher/students/${student.id}`)}
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col gap-8">
                          <div className="flex items-center justify-between">
                            <Avatar className="h-20 w-20 ring-4 ring-primary/5 transition-all group-hover:ring-primary/20 shadow-massive">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback className="bg-primary/5 text-primary text-2xl font-serif">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-end gap-2">
                               {getPerformanceBadge(progress)}
                               <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-normal text-muted-foreground/40 border-none px-0">{student.id}</Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-serif text-2xl font-normal text-foreground group-hover:text-primary transition-colors leading-tight">{student.name}</h3>
                            <p className="text-[10px] text-muted-foreground/60 font-normal uppercase tracking-widest truncate">{student.email}</p>
                          </div>
                          
                          <div className="pt-6 border-t border-primary/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-widest font-semibold opacity-40 font-sans">Institutional Mastery</span>
                              <span className="text-base font-normal text-primary font-serif">{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-primary" 
                                />
                            </div>
                          </div>
                          
                          <Button variant="ghost" className="w-full justify-between h-14 px-6 rounded-2xl group/btn hover:bg-primary hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold shadow-sm border border-primary/10">
                            Deep Audit Intelligence
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-all" />
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
    </div>
  )
}


