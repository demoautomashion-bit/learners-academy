"use client"

import { mockCourses, mockStudents, mockTeachers, mockAssignments } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Users, Play, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function StudentCoursesPage() {
  const { user } = useAuth()

  // Get student's enrolled courses (using mock data - current student is the first one)
  const currentStudent = mockStudents[0] // Michael Chen (student-1)
  const enrolledCourses = mockCourses
    .filter(course => currentStudent.enrolledCourses.includes(course.id))
    .map(course => {
      const teacher = mockTeachers.find(t => t.id === course.teacherId)
      const courseAssignments = mockAssignments.filter(a => a.courseId === course.id)
      const pendingAssignments = courseAssignments.filter(a => new Date(a.dueDate) > new Date())
      
      return {
        ...course,
        teacher,
        pendingAssignments: pendingAssignments.length,
        progress: Math.floor(Math.random() * 80) + 20, // Random progress 20-100%
      }
    })

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Beginner":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Beginner</Badge>
      case "Intermediate":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Intermediate</Badge>
      case "Advanced":
        return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">Advanced</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your learning journey. You have {enrolledCourses.reduce((acc, c) => acc + (c.pendingAssignments || 0), 0)} pending assignments.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{enrolledCourses.length} Active Courses</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>12 Hours This Week</span>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && enrolledCourses[0].progress < 100 && (
        <Card className="overflow-hidden border-primary/20">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 p-6">
              <Badge variant="secondary" className="mb-2">Continue Learning</Badge>
              <h3 className="font-serif text-xl font-semibold">{enrolledCourses[0].title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{enrolledCourses[0].description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{enrolledCourses[0].progress}%</span>
                </div>
                <Progress value={enrolledCourses[0].progress} className="h-2" />
              </div>
              <Button className="mt-4 gap-2">
                <Play className="h-4 w-4" />
                Continue Course
              </Button>
            </div>
            <div className="hidden w-64 bg-gradient-to-br from-primary/20 to-primary/5 sm:block" />
          </div>
        </Card>
      )}

      {/* My Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">My Courses</h2>
          <Button variant="ghost" className="gap-1 text-primary">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </div>
                  {getLevelBadge(course.level || "Beginner")}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" alt={course.teacher?.name} />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {course.teacher?.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{course.teacher?.name}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled}
                    </span>
                  </div>
                  {course.pendingAssignments > 0 && (
                    <Badge variant="outline" className="text-primary">
                      {course.pendingAssignments} Due
                    </Badge>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Explore More Courses</h2>
          <Button variant="ghost" className="gap-1 text-primary">
            Browse All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockCourses
            .filter(c => !currentStudent.enrolledCourses.includes(c.id))
            .slice(0, 4)
            .map((course) => {
              const teacher = mockTeachers.find(t => t.id === course.teacherId)
              return (
                <Card key={course.id} className="transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      {getLevelBadge(course.level)}
                    </div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{teacher?.name}</p>
                    <Button variant="link" className="mt-2 h-auto p-0 text-primary">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}
