'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useParams, useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Award, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function TeacherProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { teachers, 
    courses: allCourses, 
    updateTeacherStatus, 
    updateTeacherReviewFlag,
    removeTeacher, isInitialized } = useData()

  const teacherId = params.id as string
  const teacher = teachers.find(t => t.id === teacherId || t.employeeId === teacherId)
  const teacherCourses = allCourses?.filter(c => c.teacherId === teacher?.id)

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif">Professional Not Found</h2>
        <p className="text-muted-foreground">The requested teacher record does not exist in our registry.</p>
        <Button variant="outline" onClick={() => router.push('/admin/teachers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Faculty Registry
        </Button>
      </div>
    )
  }

  const handleToggleStatus = async () => {
    const nextStatus = teacher.status === 'active' ? 'inactive' : 'active'
    await updateTeacherStatus(teacher.id, nextStatus)
    toast.success(`Institutional status updated to ${nextStatus}`)
  }

  const handleToggleReview = async (checked: boolean) => {
    await updateTeacherReviewFlag(teacher.id, checked)
    toast.success(checked 
      ? 'Paper review protocols activated' 
      : 'Direct publication authorized'
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="">
            <Link href="/admin/teachers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl">Faculty Dossier</h1>
            <p className="text-muted-foreground text-sm   opacity-60">Verified Institutional Record</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={teacher.status === 'active' ? 'default' : 'secondary'}
            className={cn(
              "px-4 py-1.5  text-xs ",
              teacher.status === 'active' ? "bg-success hover:bg-success/90" : ""
            )}
          >
            {teacher.status}
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="glass-1 border-none bg-gradient-to-br from-primary/10 via-card to-accent/5 overflow-hidden">
        <CardContent className="p-6 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 -mr-20 -mt-20 rotate-12" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-8 ring-background shadow-2xl">
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-serif">
                {teacher.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h2 className="md: font-serif text-2xl font-serif">{teacher.name}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5  bg-primary" /> {teacher.employeeId}</span>
                  <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {teacher.email}</span>
                  <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {teacher.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {teacher.subjects?.map(subject => (
                  <Badge key={subject} variant="outline" className="bg-background/50 font-normal">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto bg-background/40   p-6 border border-white/10 space-y-4">
               <div className="flex items-center justify-between gap-8">
                  <div className="space-y-1">
                    <p className="text-xs   text-muted-foreground font-bold">Review Mode</p>
                    <p className="text-xs text-muted-foreground/60 italic leading-none">Paper Audit Required</p>
                  </div>
                  <Switch 
                    checked={teacher.requiresReview}
                    onCheckedChange={handleToggleReview}
                    className="data-[state=checked]:bg-warning"
                  />
               </div>
               <Button 
                variant="outline" 
                onClick={handleToggleStatus}
                className="w-full   hover:bg-primary/5 font-normal"
               >
                 {teacher.status === 'active' ? (
                   <><UserX className="w-3.5 h-3.5 mr-2" /> Deactivate</>
                 ) : (
                   <><UserCheck className="w-3.5 h-3.5 mr-2" /> Activate</>
                 )}
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-1">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14  bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-serif">{teacher.coursesCount}</p>
                <p className="text-xs   text-muted-foreground font-bold">Active Batches</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-1 border-success/5">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14  bg-success/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="text-3xl font-serif">{teacher.studentsCount}</p>
                <p className="text-xs   text-muted-foreground font-bold">Total Students</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-1 border-warning/5">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14  bg-warning/10 flex items-center justify-center">
                <Award className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-serif">4.8</p>
                <p className="text-xs   text-muted-foreground font-bold">Avg. Performance</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teaching Load */}
        <div className="lg:col-span-2">
          <Card className="glass-1 h-full">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-3 text-xl font-serif">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Teaching Load & Assigned Batches
              </CardTitle>
              <CardDescription>Active academic sessions assigned to this instructor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teacherCourses.length === 0 ? (
                <div className="p-12 text-center  bg-muted/5 border border-dashed">
                  <p className="text-sm text-muted-foreground font-serif">No active batches currently assigned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherCourses?.map(course => (
                    <div key={course.id} className="p-5  bg-background/40 border  group hover: transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs   opacity-60 font-normal">
                          {course.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{course.duration}</span>
                      </div>
                      <h4 className="font-serif text-lg mb-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground   mb-4">{course.schedule}</p>
                      
                      <div className="flex items-center gap-4 pt-4 border-t ">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6  bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold">
                              U
                            </div>
                          ))}
                          <div className="w-6 h-6  bg-muted border-2 border-background flex items-center justify-center text-xs font-bold">
                            +{course.enrolled}
                          </div>
                        </div>
                        <p className="text-xs   text-muted-foreground font-bold">Enrollment Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="glass-1">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-serif">Employment Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10  bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs   text-muted-foreground font-bold">Registration Date</p>
                  <p className="text-sm font-serif">{new Date(teacher.joinedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10  bg-muted flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs   text-muted-foreground font-bold">Security Clearance</p>
                  <p className="text-sm font-serif">Institutional Access Level 4</p>
                </div>
              </div>

              <div className="pt-6 border-t ">
                <h4 className="text-xs   text-muted-foreground font-bold mb-4 opacity-60">Professional Credentials</h4>
                <div className="space-y-2">
                  {teacher.qualifications?.map(q => (
                    <div key={q} className="p-3  bg-background/40 text-xs font-serif border  flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-primary opacity-40" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-1 border-destructive/5 bg-destructive/5 p-6 space-y-4">
            <h4 className="font-serif text-lg text-destructive">Termination Protocol</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Caution: Purging this professional from the registry will orphan all assigned batches and requires administrative override.
            </p>
            <Button 
               variant="ghost" 
               className="w-full justify-start hover:bg-destructive/10 hover:  font-normal"
               onClick={() => {
                 if (confirm('Permanently purge this professional from the institutional registry?')) {
                   removeTeacher(teacher.id)
                   router.push('/admin/teachers')
                   toast.success('Professional record purged')
                 }
               }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Record
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
