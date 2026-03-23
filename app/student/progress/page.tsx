"use client"

import { mockCourses, mockSubmissions, mockAssignments, mockStudents, mockEnrollments } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Clock, 
  Target,
  CheckCircle,
  BarChart3,
  Calendar
} from "lucide-react"

export default function StudentProgressPage() {
  const { user } = useAuth()

  // Simulate student's data (using student s1)
  const studentEnrollments = mockEnrollments.filter(e => e.studentId === "s1")
  const studentSubmissions = mockSubmissions.filter(s => s.studentId === "s1")
  const gradedSubmissions = studentSubmissions.filter(s => s.status === "graded")
  
  // Calculate overall statistics
  const averageProgress = Math.round(
    studentEnrollments.reduce((acc, e) => acc + e.progress, 0) / studentEnrollments.length
  )
  
  const averageGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubmissions.length)
    : 0

  const completedCourses = studentEnrollments.filter(e => e.progress === 100).length
  const totalAssignments = mockAssignments.length
  const completedAssignments = studentSubmissions.length

  // Weekly activity data (simulated)
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 2 },
    { day: "Fri", hours: 1 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 0.5 },
  ]

  const totalWeeklyHours = weeklyData.reduce((acc, d) => acc + d.hours, 0)
  const maxHours = Math.max(...weeklyData.map(d => d.hours))

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return <Badge className="bg-green-500/10 text-green-600">A</Badge>
    if (grade >= 80) return <Badge className="bg-primary/10 text-primary">B</Badge>
    if (grade >= 70) return <Badge className="bg-yellow-500/10 text-yellow-600">C</Badge>
    if (grade >= 60) return <Badge className="bg-orange-500/10 text-orange-600">D</Badge>
    return <Badge variant="destructive">F</Badge>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          My Progress
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold text-primary">{averageProgress}%</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={averageProgress} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{averageGrade}%</p>
                  {averageGrade > 0 && getGradeBadge(averageGrade)}
                </div>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Award className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses Completed</p>
                <p className="text-3xl font-bold">{completedCourses}/{studentEnrollments.length}</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments Done</p>
                <p className="text-3xl font-bold">{completedAssignments}/{totalAssignments}</p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              {totalWeeklyHours} hours of learning this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex flex-1 flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                    style={{ 
                      height: `${(data.hours / maxHours) * 140}px`,
                      minHeight: data.hours > 0 ? 8 : 0
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                  <span className="text-xs font-medium">{data.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
            <CardDescription>
              Your progress in enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentEnrollments.map((enrollment) => {
              const course = mockCourses.find(c => c.id === enrollment.courseId)
              return (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{course?.title}</span>
                    <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recent Grades
          </CardTitle>
          <CardDescription>
            Your latest graded assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gradedSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No graded assignments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gradedSubmissions.slice(0, 5).map((submission) => {
                const assignment = mockAssignments.find(a => a.id === submission.assignmentId)
                const course = mockCourses.find(c => c.id === assignment?.courseId)
                return (
                  <div 
                    key={submission.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{assignment?.title}</p>
                      <p className="text-sm text-muted-foreground">{course?.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{submission.grade}%</p>
                      </div>
                      {submission.grade && getGradeBadge(submission.grade)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            Badges and milestones you have earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg border p-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-3 font-medium">First Course</p>
              <p className="text-sm text-muted-foreground">Enrolled in your first course</p>
              <Badge className="mt-2 bg-primary/10 text-primary">Unlocked</Badge>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border p-4 text-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="mt-3 font-medium">Quick Learner</p>
              <p className="text-sm text-muted-foreground">Completed 5 assignments</p>
              <Badge className="mt-2 bg-green-500/10 text-green-600">Unlocked</Badge>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border border-dashed p-4 text-center opacity-60">
              <div className="rounded-full bg-muted p-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">Top Student</p>
              <p className="text-sm text-muted-foreground">Score 90%+ on 10 assignments</p>
              <Badge variant="outline" className="mt-2">Locked</Badge>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border border-dashed p-4 text-center opacity-60">
              <div className="rounded-full bg-muted p-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">Course Master</p>
              <p className="text-sm text-muted-foreground">Complete 3 courses</p>
              <Badge variant="outline" className="mt-2">Locked</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
