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
          <Card key={i} className="hover-lift transition-premium h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
              <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                {stat.label}
              </CardTitle>
              <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                <stat.icon className={cn("h-4 w-4", stat.color || 'text-primary')} />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex-1">
              <div className="text-3xl font-sans font-normal">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2 opacity-40">
                <div className={cn("h-1 w-1 bg-primary/40", (stat.color || 'text-primary').replace('text-', 'bg-'))} />
                <span className="text-[10px] text-muted-foreground font-normal">Live Data</span>
              </div>
            </CardContent>
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

        <Card className="overflow-hidden hover-lift transition-premium rounded-[2.5rem] border-primary/5">
          <CardHeader className="p-8 sm:p-10 border-b flex flex-row items-center justify-between bg-muted/5">
             <div className="space-y-1">
                <CardTitle className="font-serif text-2xl font-bold">Student Registry</CardTitle>
                <CardDescription className="text-xs font-normal opacity-60 uppercase tracking-widest">Institutional Academic Dossier</CardDescription>
             </div>
             <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                  <Users className="w-5 h-5 text-primary" />
             </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="py-32 text-center">
                <div className="bg-primary/5 p-8 w-fit mx-auto mb-6 border rounded-[2rem]">
                  <Users className="w-12 h-12 text-primary/30" />
                </div>
                <p className="font-serif text-2xl opacity-40 font-normal">No student profiles found.</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {filteredStudents.map((student) => {
                  const enrollment = mockEnrollments.find(e => e.studentId === student.id)
                  const progress = enrollment?.progress || 0
                  
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group cursor-pointer hover:bg-primary/[0.02] transition-all p-4 sm:p-6 lg:px-10 flex flex-col sm:flex-row sm:items-center gap-6"
                      onClick={() => router.push(`/teacher/students/${student.id}`)}
                    >
                      {/* Left: Avatar & Identity */}
                      <div className="flex items-center gap-5 min-w-[280px]">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/5 transition-all group-hover:ring-primary/20 shadow-sm">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-primary/5 text-primary font-serif font-bold">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-serif text-lg font-bold group-hover:text-primary transition-colors truncate">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-tighter">{student.studentId || 'No ID'}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] text-muted-foreground opacity-40 truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="flex-1 flex flex-col gap-2 px-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Academic Growth</span>
                          <span className="text-xs font-bold font-sans text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-primary/5" />
                      </div>

                      {/* Right: Badge & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:min-w-[240px]">
                        <div className="flex flex-col items-end gap-1">
                          {getPerformanceBadge(progress)}
                          <span className="text-[9px] text-muted-foreground opacity-30 font-bold uppercase tracking-widest">Performance</span>
                        </div>
                        
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
