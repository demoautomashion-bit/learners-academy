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
} from 'lucide-react'
import { mockCourses, mockStudents, mockAssignments } from '@/lib/mock-data'
import type { Course } from '@/lib/types'

// Filter to show only the teacher's data
const myCourses = mockCourses.filter(c => c.teacherId === 'teacher-1')

export default function TeacherClassesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Classes</CardDescription>
            <CardTitle className="text-3xl">{myCourses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">
              {myCourses.reduce((acc, c) => acc + c.enrolled, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Class Size</CardDescription>
            <CardTitle className="text-3xl">
              {Math.round(myCourses.reduce((acc, c) => acc + c.enrolled, 0) / myCourses.length)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myCourses.map((course) => (
          <Card key={course.id} className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <Badge 
                  variant={course.status === 'active' ? 'default' : 'secondary'}
                  className={course.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                >
                  {course.status}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-snug mt-2">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrollment</span>
                  <span className="font-medium">{course.enrolled}/{course.capacity}</span>
                </div>
                <Progress value={(course.enrolled / course.capacity) * 100} className="h-2" />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled}</span>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">{course.schedule}</p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedCourse(course)
                  setIsDetailOpen(true)
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
