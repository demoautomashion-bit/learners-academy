'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, Users, FileSpreadsheet, BarChart3, ArrowLeft, RefreshCw, User, ShieldCheck } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { toast } from 'sonner'
import type { Student } from '@/lib/types'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { cn } from '@/lib/utils'
import { isStudentInCourse } from '@/lib/utils/student-matching'

// Tier Configuration Registry
const TIER_CONFIGS = {
  STANDARD: {
    total: 300,
    fields: [
      { key: 'midterm', label: 'Midterm Test', max: 100 },
      { key: 'final', label: 'Final Test', max: 100 },
      { key: 'attendance', label: 'Attendance', max: 60 },
      { key: 'participation', label: 'Participation', max: 20 },
      { key: 'discipline', label: 'Discipline', max: 10 },
      { key: 'extra', label: 'Curricular Activities', max: 10 },
    ]
  },
  ADVANCED: {
    total: 600,
    fields: [
      { key: 'listening', label: 'Listening', max: 100 },
      { key: 'speaking', label: 'Speaking', max: 100 },
      { key: 'reading', label: 'Reading', max: 100 },
      { key: 'writing', label: 'Writing', max: 100 },
      { key: 'grammar', label: 'Grammar', max: 100 },
      { key: 'attendance', label: 'Attendance', max: 60 },
      { key: 'participation', label: 'Participation', max: 30 },
      { key: 'discipline', label: 'Discipline', max: 10 },
    ]
  },
  PROFESSIONAL: {
    total: 1000,
    fields: [
      { key: 'listening', label: 'Listening', max: 100 },
      { key: 'speaking', label: 'Speaking', max: 100 },
      { key: 'reading', label: 'Reading', max: 100 },
      { key: 'writing', label: 'Writing', max: 100 },
      { key: 'grammar', label: 'Grammar', max: 100 },
      { key: 'spelling', label: 'Spelling', max: 100 },
      { key: 'vocabulary', label: 'Vocabulary', max: 100 },
      { key: 'pronunciation', label: 'Pronunciation', max: 100 },
      { key: 'teachingMethodology', label: 'Teaching Methodology', max: 100 },
      { key: 'attendance', label: 'Attendance', max: 20 },
      { key: 'participation', label: 'Participation', max: 20 },
      { key: 'assignment', label: 'Assignment', max: 20 },
      { key: 'discipline', label: 'Discipline', max: 20 },
      { key: 'attitudeAndMotivation', label: 'Attitude & Motivation', max: 20 },
    ]
  }
}

export default function ClassWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { user } = useAuth()
  const { courses, students, evaluations, saveEvaluations, isInitialized } = useData()

  // Local State for Interactive Spreadsheet
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({})
  const [isSaving, setIsSaving] = useState(false)

  const course = courses?.find(c => c.id === courseId)

  // Determine Tier Configuration
  const tierConfig = useMemo(() => {
    if (!course) return TIER_CONFIGS.STANDARD
    if (course.level === 'Level Six' || course.level === 'Level Advanced') return TIER_CONFIGS.ADVANCED
    if (course.level === 'Professional Advanced') return TIER_CONFIGS.PROFESSIONAL
    return TIER_CONFIGS.STANDARD
  }, [course])

  // Hydrate local state from global evaluations context
  useMemo(() => {
    if (!evaluations || !courseId) return;
    
    const initialGrades: Record<string, any> = {};
    evaluations.filter((e: any) => e.courseId === courseId).forEach((e: any) => {
      // Merge standard fields with scores JSON fields
      initialGrades[e.studentId] = {
        midterm: String(e.midterm || ''),
        final: String(e.final || ''),
        attendance: String(e.attendance || ''),
        participation: String(e.participation || ''),
        discipline: String(e.discipline || ''),
        extra: String(e.extra || ''),
        ...(typeof e.scores === 'object' ? Object.fromEntries(
          Object.entries(e.scores || {}).map(([k, v]) => [k, String(v || '')])
        ) : {})
      };
    });
    setGrades(initialGrades);
  }, [evaluations, courseId]);

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />
  
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

  const classStudents = students?.filter(s => isStudentInCourse(s, course)) || []

  // Initialize empty grades if unset
  const getStudentMarks = (id: string) => {
    return grades[id] || {}
  }

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value
      }
    }))
  }

  const computeMetrics = (id: string) => {
    const marks = getStudentMarks(id)
    
    let total = 0
    let isBlank = true
    
    tierConfig.fields.forEach(field => {
      const val = marks[field.key]
      if (val) isBlank = false
      total += Number(val) || 0
    })

    const percentage = Math.round((total / tierConfig.total) * 100)
    
    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 60) grade = 'C'
    else if (percentage >= 50) grade = 'D'

    let eligibility = 'P' // Pass
    if (percentage < 50) eligibility = 'X' // Fail
    
    // Tier-specific attendance rules
    const attendanceMark = Number(marks.attendance) || 0
    if (tierConfig === TIER_CONFIGS.STANDARD && attendanceMark < 30) eligibility = 'V'
    if (tierConfig === TIER_CONFIGS.ADVANCED && attendanceMark < 30) eligibility = 'V'
    if (tierConfig === TIER_CONFIGS.PROFESSIONAL && attendanceMark < 10) eligibility = 'V'

    return { 
      total: isBlank ? '--' : total, 
      percentage: isBlank ? '--' : percentage, 
      grade: isBlank ? '-' : grade, 
      eligibility: isBlank ? '-' : eligibility 
    }
  }

  const handleSaveGrades = async () => {
    setIsSaving(true)
    
    try {
      const payload = Object.entries(grades).map(([studentId, marks]) => {
        // Split marks into standard fields vs scores JSON
        const standardFields = ['midterm', 'final', 'attendance', 'participation', 'discipline', 'extra'];
        const scores: Record<string, number> = {};
        const base: Record<string, any> = { studentId, term: "Term 1" };

        Object.entries(marks).forEach(([key, value]) => {
          if (standardFields.includes(key)) {
            base[key] = Number(value) || 0;
          } else {
            scores[key] = Number(value) || 0;
          }
        });

        return { ...base, scores };
      });

      await saveEvaluations(courseId, payload);
    } catch (error) {
      toast.error("Cloud Sync Failed");
    } finally {
      setIsSaving(false);
    }
  }

  // Basic Roster Columns
  const rosterColumns: Column<Student>[] = [
    {
      label: 'S.No',
      render: (_, i) => <span className="font-mono text-muted-foreground text-[10px]">{String(i + 1).padStart(2, '0')}</span>,
      width: '60px'
    },
    {
      label: 'Student Name',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-primary/10">
            <AvatarImage src={s.avatar} alt={s.name} />
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
              {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-serif font-medium text-sm leading-tight">{s.name}</span>
            <span className="text-[9px] text-muted-foreground opacity-50 uppercase tracking-widest mt-0.5">Academic Record</span>
          </div>
        </div>
      )
    },
    {
      label: 'Student ID',
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span className="font-mono text-[11px] font-bold text-primary/70 tracking-tight">{s.studentId || 'N/A'}</span>
        </div>
      ),
      width: '140px'
    },
    {
      label: 'Guardian Name',
      render: (s) => <span className="text-muted-foreground text-xs opacity-80">{s.guardianName || 'Unknown'}</span>
    },
    {
      label: 'Status',
      render: (s) => (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold border-0",
            s.status === 'active' ? "bg-success/10 text-success" : "bg-muted/10 text-muted-foreground"
          )}
        >
          {s.status || 'active'}
        </Badge>
      ),
      width: '100px'
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
              <BarChart3 className="w-4 h-4" /> Performance Insights
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
                    <tr className="bg-muted/30">
                       <th colSpan={tierConfig.fields.length + 7} className="p-4 border-b text-center font-normal">
                          <p className="font-serif font-black text-xl tracking-tight uppercase">The Learners Academy</p>
                          <p className="text-xs tracking-widest opacity-60 uppercase mb-2">{course.title}</p>
                          <p className="font-sans font-bold text-sm tracking-widest bg-background w-fit px-6 py-1 rounded-full border shadow-sm mx-auto">ASSESSMENT SHEET</p>
                       </th>
                    </tr>
                    <tr className="bg-background">
                       <th colSpan={3} className="p-3 border-b border-r text-xs uppercase tracking-wider font-normal">Class: <span className="font-bold underline underline-offset-4 decoration-primary/30 ml-2">{course.title}</span></th>
                       <th colSpan={tierConfig.fields.length + 4} className="p-3 border-b text-xs uppercase tracking-wider text-right font-normal">Evaluating Teacher: <span className="font-bold ml-2 underline underline-offset-4 decoration-primary/30">{user.name}</span></th>
                    </tr>
                    <tr className="bg-muted/10 divide-x text-[10px] sm:text-xs">
                       <th className="p-3 font-semibold w-12 text-center align-bottom border-b">S.No.</th>
                       <th className="p-3 font-semibold min-w-[180px] align-bottom border-b">Student's Name</th>
                       <th className="p-3 font-semibold min-w-[150px] align-bottom border-b bg-muted/5">Father's Name</th>
                       
                       {/* Dynamic Field Headers */}
                       {tierConfig.fields.map(field => (
                         <th key={field.key} className="p-2 font-semibold w-[85px] text-center align-bottom border-b">
                            <p className="line-clamp-2 h-8 flex items-center justify-center">{field.label}</p>
                            <p className="opacity-50 text-[10px] mt-1 font-bold">{field.max}</p>
                         </th>
                       ))}
                       
                       <th className="p-2 font-black w-[85px] text-center align-bottom border-b bg-primary/5 text-primary"><p>Grand Total</p><p className="opacity-50 text-[10px] mt-1 font-bold">{tierConfig.total}</p></th>
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
                              
                              {/* Dynamic Editable Cells */}
                              {tierConfig.fields.map(field => (
                                <td key={field.key} className="p-0.5">
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    max={field.max} 
                                    value={marks[field.key] || ''} 
                                    onChange={e => handleScoreChange(student.id, field.key, e.target.value)} 
                                    className="h-full min-h-[40px] border-0 rounded-none bg-transparent text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10 focus-visible:bg-background" 
                                  />
                                </td>
                              ))}
                              
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
                           <td colSpan={tierConfig.fields.length + 7} className="p-12 text-center text-muted-foreground font-medium">No students officially enrolled under this academic block.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </TabsContent>

          <TabsContent value="analytics" className="m-0 mt-2 fade-in zoom-in duration-300">
             <Card className="border-dashed bg-muted/5 py-24 text-center rounded-[2rem]">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="text-xl font-serif font-bold">Analytics Engine Initializing</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 leading-relaxed">
                  Class performance dashboards and individual growth metrics will auto-generate here once sufficient evaluations are logged in the Assessment Sheet.
                </p>
             </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}
