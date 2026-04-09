'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Users, FileSpreadsheet, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { toast } from 'sonner'
import type { Student } from '@/lib/types'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { cn } from '@/lib/utils'

export default function ClassWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { user } = useAuth()
  const { courses, students, isInitialized } = useData()

  // Local State for Interactive Spreadsheet
  const [grades, setGrades] = useState<Record<string, { 
    midterm: string, final: string, attendance: string, 
    participation: string, discipline: string, extra: string 
  }>>({})
  const [isSaving, setIsSaving] = useState(false)

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const course = courses?.find(c => c.id === courseId)
  
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <h2 className="text-2xl font-serif">Class Workspace Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/teacher/classes')}>
          Return to Hub
        </Button>
      </div>
    )
  }

  const classStudents = students?.filter(s => (s.enrolledCourses || []).includes(course.id)) || []

  // Initialize empty grades if unset
  const getStudentMarks = (id: string) => {
    return grades[id] || { midterm: '', final: '', attendance: '', participation: '', discipline: '', extra: '' }
  }

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { midterm: '', final: '', attendance: '', participation: '', discipline: '', extra: '' }),
        [field]: value
      }
    }))
  }

  const computeMetrics = (id: string) => {
    const marks = getStudentMarks(id)
    const m = Number(marks.midterm) || 0
    const f = Number(marks.final) || 0
    const a = Number(marks.attendance) || 0
    const p = Number(marks.participation) || 0
    const d = Number(marks.discipline) || 0
    const e = Number(marks.extra) || 0

    const total = m + f + a + p + d + e
    const percentage = Math.round((total / 300) * 100)
    
    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 60) grade = 'C'
    else if (percentage >= 50) grade = 'D'

    let eligibility = 'P' // Pass
    if (percentage < 50) eligibility = 'X' // Fail
    if (a < 30) eligibility = 'V' // Void due to attendance

    // Don't show grades if literally nothing is filled yet
    const isBlank = !marks.midterm && !marks.final && !marks.attendance && !marks.participation && !marks.discipline && !marks.extra

    return { 
      total: isBlank ? '--' : total, 
      percentage: isBlank ? '--' : percentage, 
      grade: isBlank ? '-' : grade, 
      eligibility: isBlank ? '-' : eligibility 
    }
  }

  const handleSaveGrades = async () => {
    setIsSaving(true)
    // Simulated network delay since this is a frontend-only plan
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    toast.success("Assessment Sheet Saved", {
      description: "Scores and calculations synced to the institutional cloud."
    })
  }

  // Basic Roster Columns
  const rosterColumns: Column<Student>[] = [
    {
      label: 'S.No',
      render: (_, i) => <span className="font-mono text-muted-foreground">{String(i).padStart(2, '0')}</span>,
      width: '80px'
    },
    {
      label: 'Student Name',
      render: (s) => <span className="font-serif font-medium">{s.name}</span>
    },
    {
      label: 'Guardian Name',
      render: (s) => <span className="text-muted-foreground opacity-80">{s.guardianName || 'Unknown'}</span>
    },
    {
      label: 'Session',
      render: (s) => <Badge variant="secondary">{s.classTiming || 'TBC'}</Badge>
    }
  ]

  return (
    <div className="flex flex-col h-full bg-background relative z-0">
      {/* Workspace Header */}
      <div className="sticky top-0 z-[40] bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/teacher/classes')} className="shrink-0 hover:bg-primary/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-normal tracking-widest uppercase bg-primary/5 border-primary/20">{course.level}</Badge>
                <span className="text-xs text-muted-foreground uppercase opacity-50 tracking-widest font-bold">Academic Workspace</span>
              </div>
              <h1 className="text-3xl font-serif text-foreground font-black tracking-tight drop-shadow-sm">{course.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="assessment" className="flex flex-col flex-1">
        <div className="border-b px-6 lg:px-8 bg-muted/5">
          <TabsList className="bg-transparent h-14 p-0">
            <TabsTrigger value="roster" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-6 h-14 font-medium gap-2 text-muted-foreground data-[state=active]:text-foreground transition-all">
              <Users className="w-4 h-4" /> Class Roster
            </TabsTrigger>
            <TabsTrigger value="assessment" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-6 h-14 font-medium gap-2 text-muted-foreground data-[state=active]:text-foreground transition-all">
              <FileSpreadsheet className="w-4 h-4" /> Assessment Sheet
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-6 h-14 font-medium gap-2 text-muted-foreground data-[state=active]:text-foreground transition-all">
              <BarChart3 className="w-4 h-4" /> Intelligence
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6 lg:px-8 pb-32">
          
          <TabsContent value="roster" className="m-0 mt-2 fade-in zoom-in duration-300">
            <EntityDataGrid 
              title={`${course.title} Roster`}
              description="Official registry of enrolled students."
              data={classStudents}
              columns={rosterColumns}
            />
          </TabsContent>

          <TabsContent value="assessment" className="m-0 mt-2 fade-in zoom-in duration-500">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <h2 className="text-2xl font-serif font-medium">Evaluation Matrix</h2>
                   <p className="text-sm text-muted-foreground mt-1">Manual score entries will instantly compute totals, percentages, and eligibility status.</p>
                </div>
                <Button onClick={handleSaveGrades} disabled={isSaving} className="gap-2 font-bold shadow-md shadow-primary/20 hover-lift">
                   {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Protect Data
                </Button>
             </div>

             <div className="rounded-2xl border bg-card shadow-sm overflow-hidden overflow-x-auto print:shadow-none print:border-none relative z-0">
               <table className="w-full text-sm text-left border-collapse isolate min-w-[1200px]">
                  <thead>
                    {/* Header Row 1: Academy branding imitating the sheet */}
                    <tr className="bg-muted/30">
                       <th colSpan={13} className="p-4 border-b text-center font-normal">
                          <p className="font-serif font-black text-xl tracking-tight uppercase">The Learners Academy</p>
                          <p className="text-xs tracking-widest opacity-60 uppercase mb-2">{course.title}</p>
                          <p className="font-sans font-bold text-sm tracking-widest bg-background w-fit px-6 py-1 rounded-full border shadow-sm mx-auto">ASSESSMENT SHEET</p>
                       </th>
                    </tr>
                    {/* Header Row 2: Sub-meta columns */}
                    <tr className="bg-background">
                       <th colSpan={3} className="p-3 border-b border-r text-xs uppercase tracking-wider font-normal">Class: <span className="font-bold underline underline-offset-4 decoration-primary/30 ml-2">{course.title}</span></th>
                       <th colSpan={10} className="p-3 border-b text-xs uppercase tracking-wider text-right font-normal">Evaluating Teacher: <span className="font-bold ml-2 underline underline-offset-4 decoration-primary/30">{user.name}</span></th>
                    </tr>
                    {/* Header Row 3: Actual Column Headers */}
                    <tr className="bg-muted/10 divide-x text-[10px] sm:text-xs">
                       <th className="p-3 font-semibold w-12 text-center align-bottom border-b">S.No.</th>
                       <th className="p-3 font-semibold min-w-[180px] align-bottom border-b">Student's Name</th>
                       <th className="p-3 font-semibold min-w-[150px] align-bottom border-b bg-muted/5">Father's Name</th>
                       <th className="p-2 font-semibold w-[75px] text-center align-bottom border-b"><p>Midterm Test</p><p className="opacity-50 text-[10px] mt-1 font-bold">100</p></th>
                       <th className="p-2 font-semibold w-[75px] text-center align-bottom border-b"><p>Final Test</p><p className="opacity-50 text-[10px] mt-1 font-bold">100</p></th>
                       <th className="p-2 font-semibold w-[85px] text-center align-bottom border-b bg-muted/5"><p>Attendance</p><p className="opacity-50 text-[10px] mt-1 font-bold">60</p></th>
                       <th className="p-2 font-semibold w-[95px] text-center align-bottom border-b bg-muted/5"><p>Participation</p><p className="opacity-50 text-[10px] mt-1 font-bold">20</p></th>
                       <th className="p-2 font-semibold w-[85px] text-center align-bottom border-b bg-muted/5"><p>Discipline</p><p className="opacity-50 text-[10px] mt-1 font-bold">10</p></th>
                       <th className="p-2 font-semibold w-[95px] text-center align-bottom border-b bg-muted/5"><p>Curricular Activities</p><p className="opacity-50 text-[10px] mt-1 font-bold">10</p></th>
                       
                       <th className="p-2 font-black w-[85px] text-center align-bottom border-b bg-primary/5 text-primary"><p>Grand Total</p><p className="opacity-50 text-[10px] mt-1 font-bold">300</p></th>
                       <th className="p-2 font-bold w-[85px] text-center align-bottom border-b"><p>Percentage</p><p className="opacity-50 text-[10px] mt-1 font-black">%</p></th>
                       <th className="p-2 font-bold w-[75px] text-center align-bottom border-b"><p>Grade</p><p className="opacity-50 text-[10px] mt-1 font-black">A-F</p></th>
                       <th className="p-2 font-bold w-[85px] text-center align-bottom border-b"><p>Eligibility</p><p className="opacity-50 text-[10px] mt-1 font-black tracking-widest">P V X</p></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                     {classStudents.map((student, index) => {
                        const marks = getStudentMarks(student.id)
                        const metrics = computeMetrics(student.id)
                        return (
                           <tr key={student.id} className="hover:bg-muted/10 transition-colors divide-x group">
                              <td className="p-2 text-center font-mono text-muted-foreground/50">{String(index + 1).padStart(2, '0')}</td>
                              <td className="p-2 font-medium">{student.name}</td>
                              <td className="p-2 text-muted-foreground opacity-80 bg-muted/5">{student.guardianName || ''}</td>
                              
                              {/* Editable Cells */}
                              <td className="p-0.5"><Input type="number" min="0" max="100" value={marks.midterm} onChange={e => handleScoreChange(student.id, 'midterm', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              <td className="p-0.5"><Input type="number" min="0" max="100" value={marks.final} onChange={e => handleScoreChange(student.id, 'final', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              <td className="p-0.5 bg-muted/5"><Input type="number" min="0" max="60" value={marks.attendance} onChange={e => handleScoreChange(student.id, 'attendance', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              <td className="p-0.5 bg-muted/5"><Input type="number" min="0" max="20" value={marks.participation} onChange={e => handleScoreChange(student.id, 'participation', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              <td className="p-0.5 bg-muted/5"><Input type="number" min="0" max="10" value={marks.discipline} onChange={e => handleScoreChange(student.id, 'discipline', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              <td className="p-0.5 bg-muted/5"><Input type="number" min="0" max="10" value={marks.extra} onChange={e => handleScoreChange(student.id, 'extra', e.target.value)} className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" /></td>
                              
                              {/* Computed Cells */}
                              <td className="p-2 text-center font-bold font-sans bg-primary/5 text-primary">{metrics.total}</td>
                              <td className="p-2 text-center font-bold font-sans">{metrics.percentage !== '--' ? `${metrics.percentage}%` : '--'}</td>
                              <td className="p-2 text-center font-black">
                                <span className={cn(
                                  metrics.grade.includes('A') ? 'text-success' : 
                                  metrics.grade.includes('F') ? 'text-destructive' : 
                                  metrics.grade !== '-' ? 'text-warning' : ''
                                )}>
                                  {metrics.grade}
                                </span>
                              </td>
                              <td className="p-2 text-center font-black">
                                <span className={cn(
                                  metrics.eligibility === 'P' ? 'text-success' : 
                                  metrics.eligibility === 'X' || metrics.eligibility === 'V' ? 'text-destructive' : ''
                                )}>
                                  {metrics.eligibility}
                                </span>
                              </td>
                           </tr>
                        )
                     })}
                     {classStudents.length === 0 && (
                        <tr>
                           <td colSpan={13} className="p-12 text-center text-muted-foreground font-medium">No students officially enrolled under this academic block.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </TabsContent>

          <TabsContent value="analytics" className="m-0 mt-2 fade-in zoom-in duration-300">
             <Card className="border-dashed bg-muted/5 py-24 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-primary/30 mb-4" />
                <h3 className="text-xl font-serif">Intelligence Modules Pending</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">Class performance dashboards will auto-generate here once sufficient evaluations are logged in the Assessment Sheet.</p>
             </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}
