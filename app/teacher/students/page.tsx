'use client'

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
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Search, Users, TrendingUp, Award, ArrowRight, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/shared/page-shell"
import { PageHeader } from "@/components/shared/page-header"
import { EntityCardGrid } from "@/components/shared/entity-card-grid"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { isStudentInCourse } from "@/lib/utils/student-matching"

export default function TeacherStudentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { students: mockStudents, courses: mockCourses, enrollments: mockEnrollments, isInitialized } = useData()

  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const teacherCourses = mockCourses?.filter(c => c.teacherId === user?.id) || []
  const teacherCourseIds = teacherCourses.map(c => c.id)
  
  const studentsInTeacherCourses = mockStudents?.filter(student => {
    return teacherCourses.some(course => isStudentInCourse(student, course))
  }) || []

  const filteredStudents = studentsInTeacherCourses.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (courseFilter === "all") return matchesSearch
    
    // Check if student belongs to the specific filtered course
    const selectedCourse = teacherCourses.find(c => c.id === courseFilter)
    const matchesCourse = selectedCourse ? isStudentInCourse(student, selectedCourse) : false
    
    return matchesSearch && matchesCourse
  })

  const getPerformanceBadge = (progress: number) => {
    if (progress >= 80) {
      return <Badge className="bg-success text-white border-none text-[10px] uppercase font-normal h-5 px-3">Elite</Badge>
    } else if (progress >= 60) {
      return <Badge className="bg-primary text-white border-none text-[10px] uppercase font-normal h-5 px-3">Strong</Badge>
    } else {
      return <Badge className="bg-warning text-white border-none text-[10px] uppercase font-normal h-5 px-3">Pending</Badge>
    }
  }

  const passRate = studentsInTeacherCourses.length > 0 
    ? Math.round(studentsInTeacherCourses.reduce((acc, s) => acc + (mockEnrollments.find(e => e.studentId === s.id)?.progress || 0), 0) / studentsInTeacherCourses.length) 
    : 0

  const distinctions = studentsInTeacherCourses.filter(s => {
    const enrollment = mockEnrollments.find(e => e.studentId === s.id)
    return enrollment && enrollment.progress >= 80
  }).length

  const stats = [
    { label: 'Total Students', value: studentsInTeacherCourses.length, icon: Users },
    { label: 'Class Pass Rate', value: `${passRate}%`, icon: TrendingUp, color: 'text-success' },
    { label: 'Top Performers', value: distinctions, icon: Award, color: 'text-warning' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Students"
        description="Manage student profiles and track performance reports."
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift p-8 overflow-hidden group transition-premium h-full flex flex-col relative">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <p className={cn("text-4xl font-sans font-normal transition-colors", stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-normal opacity-50 uppercase">{stat.label}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {stat.icon && <stat.icon className="w-12 h-12" />}
            </div>
          </Card>
        )}
        columns={3}
      />

      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-30" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-sm bg-muted/5 font-normal"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[180px] h-12 text-xs font-normal bg-muted/5">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {teacherCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="opacity-40 hover:opacity-100 transition-all h-12 px-6 font-normal">
               <Filter className="w-4 h-4 mr-2" />
               <span className="text-xs">Filters</span>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden hover-lift transition-premium">
          <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
             <div className="space-y-1">
                <CardTitle className="font-serif text-xl font-medium">Student List</CardTitle>
                <CardDescription className="text-xs font-normal opacity-60">View and track student performance.</CardDescription>
             </div>
             <div className="p-2 rounded-lg bg-primary/5 opacity-40">
                  <Users className="w-4 h-4 text-primary" />
             </div>
          </CardHeader>
          <CardContent className="p-10">
            {filteredStudents.length === 0 ? (
              <div className="py-24 text-center">
                <div className="bg-primary/5 p-8 w-fit mx-auto mb-6 border rounded-2xl">
                  <Users className="w-12 h-12 text-primary/30" />
                </div>
                <p className="font-serif text-2xl opacity-40 font-normal">No students found matching your search.</p>
              </div>
            ) : (
              <EntityCardGrid 
                data={filteredStudents}
                renderItem={(student) => {
                  const enrollment = mockEnrollments.find(e => e.studentId === student.id)
                  const progress = enrollment?.progress || 0
                  
                  return (
                    <Card 
                      key={student.id}
                      className="cursor-pointer transition-premium hover-lift overflow-hidden group h-full flex flex-col"
                      onClick={() => router.push(`/teacher/students/${student.id}`)}
                    >
                      <CardContent className="p-6 flex-1">
                        <div className="flex flex-col gap-8">
                          <div className="flex items-center justify-between">
                            <Avatar className="h-16 w-16 ring-4 ring-primary/5 transition-all group-hover:ring-primary/10">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xl font-serif">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                             <div className="flex flex-col items-end gap-2">
                                {getPerformanceBadge(progress)}
                                <span className="text-[10px] font-normal text-muted-foreground opacity-40 uppercase">{student.studentId || student.id}</span>
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg leading-tight font-medium group-hover:text-primary transition-colors">{student.name}</h3>
                            <p className="text-[10px] text-muted-foreground opacity-60 font-normal truncate">{student.email}</p>
                          </div>
                          
                          <div className="pt-6 border-t space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-normal opacity-40 uppercase">Course Progress</span>
                               <span className="text-base font-serif font-normal text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1 bg-primary/10" />
                          </div>
                          
                          <Button variant="ghost" className="w-full justify-between h-10 bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all font-normal text-[10px]">
                            View Full Profile
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }}
                columns={3}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
