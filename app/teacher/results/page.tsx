'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { 
  Search, 
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ResultsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { submissions, assessments, courses, isInitialized } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')

  if (!user?.id) return null
  if (!isInitialized) return <DashboardSkeleton />

  const myCourses = courses?.filter(c => c.teacherId === user?.id) || []

  const teacherAssessments = assessments?.filter(a => {
    const isOwner = a.submittedByTeacherId === user?.id
    const isAssignedCourse = (a.courseIds || []).some(cid => myCourses.some(c => c.id === cid))
    const isAssignedLevel = (a.classLevels || []).some(level => myCourses.some(c => c.title === level))
    return isOwner || isAssignedCourse || isAssignedLevel
  }) || []

  const filteredAssessments = teacherAssessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPhase = phaseFilter === 'all' || assessment.phase === phaseFilter
    
    const selectedCourse = myCourses.find(c => c.id === classFilter)
    const matchesClass = classFilter === 'all' || 
      (assessment.courseIds || []).includes(classFilter) || 
      (selectedCourse && (assessment.classLevels || []).includes(selectedCourse.title))
    
    return matchesSearch && matchesPhase && matchesClass
  })

  const allSubmissions = submissions?.filter(s => {
    const a = assessments.find(as => as.id === s.assignmentId)
    return teacherAssessments.some(ta => ta.id === a?.id)
  }) || []

  const pendingCount = allSubmissions.filter(r => r.status === 'pending').length
  const gradedResults = allSubmissions.filter(r => r.grade !== undefined && r.grade !== null)
  
  const getPercentage = (r: any) => {
    const a = assessments.find(a => a.id === r.assignmentId)
    return a?.totalMarks ? Math.round((r.grade / a.totalMarks) * 100) : r.grade
  }

  const totalAvg = gradedResults.length > 0 ? Math.round(gradedResults.reduce((acc, r) => acc + getPercentage(r), 0) / gradedResults.length) : 0
  const firstTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'First Test')
  const firstTestAvg = firstTestResults.length > 0 ? Math.round(firstTestResults.reduce((acc, r) => acc + getPercentage(r), 0) / firstTestResults.length) : 0
  const lastTestResults = gradedResults.filter(r => assessments.find(a => a.id === r.assignmentId)?.phase === 'Last Test')
  const lastTestAvg = lastTestResults.length > 0 ? Math.round(lastTestResults.reduce((acc, r) => acc + getPercentage(r), 0) / lastTestResults.length) : 0

  const stats = [
    { label: 'Academy Average', value: totalAvg > 0 ? `${totalAvg}%` : '--', icon: TrendingUp },
    { label: 'Pending Audits', value: pendingCount > 0 ? pendingCount : '--', color: 'text-warning' },
    { label: 'Mid-Term Avg', value: firstTestAvg > 0 ? `${firstTestAvg}%` : '--' },
    { label: 'Final-Term Avg', value: lastTestAvg > 0 ? `${lastTestAvg}%` : '--' },
  ]

  const columns: Column<any>[] = [
    {
      label: 'Exam Title',
      render: (assessment) => (
        <div className="flex flex-col">
          <span className="font-serif font-normal text-base text-foreground/80 group-hover:text-primary transition-colors">
            {assessment.title}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-normal mt-0.5">
            {assessment.phase} • {assessment.nature}
          </span>
        </div>
      ),
      width: '250px'
    },
    {
      label: 'Class Assignment',
      render: (assessment) => (
        <div className="flex flex-wrap gap-1">
          {assessment.classLevels?.map((level: string) => (
            <Badge key={level} variant="outline" className="text-[10px] font-normal text-muted-foreground/60">
              {level}
            </Badge>
          ))}
        </div>
      )
    },
    {
      label: 'Completion status',
      render: (assessment) => {
        const assessmentSubmissions = submissions?.filter(s => s.assignmentId === assessment.id) || []
        const pending = assessmentSubmissions.filter(s => s.status === 'pending').length
        const total = assessmentSubmissions.length
        return (
          <div className="space-y-1.5 w-full max-w-[150px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-normal text-muted-foreground opacity-50 uppercase">Audited</span>
              <span className="text-[10px] font-normal text-foreground">{total - pending} / {total}</span>
            </div>
            <div className="h-1 w-full bg-muted/20 overflow-hidden rounded-full">
              <div 
                className={cn("h-full transition-all duration-500", pending === 0 ? "bg-success" : "bg-primary")} 
                style={{ width: `${((total - pending) / total) * 100}%` }} 
              />
            </div>
          </div>
        )
      }
    },
    {
      label: '',
      render: (assessment) => (
        <div className="text-right">
          <Button 
            onClick={() => router.push(`/teacher/results/${assessment.id}`)}
            className="h-9 px-6 bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all shadow-sm group font-normal text-xs"
          >
            Review
            <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ),
      width: '120px'
    }
  ]

  const exportResultsPDF = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // 1. Institutional Branding
      doc.setFillColor(31, 41, 55)
      doc.rect(0, 0, pageWidth, 40, 'F')
      
      doc.setFillColor(255, 255, 255)
      doc.circle(23, 20, 11, 'F')
      
      try {
        doc.addImage('/images/logo.png', 'PNG', 15, 12, 16, 16)
      } catch (e) {}

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text("THE LEARNERS ACADEMY", 42, 18)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text("Institutional Results Registry & Examination Audit", 42, 24)
      doc.text("Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.", 42, 28)
      doc.text("Contact: +92-3003583286 / +92-3115455533", 42, 31)

      // 2. Report metadata
      const activeClass = classFilter === 'all' 
        ? 'All Classes' 
        : myCourses.find(c => c.id === classFilter)?.title || 'Selected Class'
      const activePhase = phaseFilter === 'all'
        ? 'All Phases'
        : phaseFilter === 'First Test' ? 'Mid-Term' : 'Final-Term'

      doc.setTextColor(40)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text("EXAMINATION AND RESULTS AUDIT", 15, 55)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Class Scope: ${activeClass}  |  Phase Scope: ${activePhase}`, 15, 61)
      doc.text(`Generated By: ${user.name || 'Teacher'}  |  Date: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 15, 65)

      // 3. Table Data
      const tableData = filteredAssessments.map(assessment => {
        const assessmentSubmissions = submissions?.filter(s => s.assignmentId === assessment.id) || []
        const pending = assessmentSubmissions.filter(s => s.status === 'pending').length
        const total = assessmentSubmissions.length
        const auditedStr = `${total - pending} / ${total}`

        // Average score
        const graded = assessmentSubmissions.filter(s => s.grade !== undefined && s.grade !== null)
        const avg = graded.length > 0 
          ? `${Math.round(graded.reduce((acc, r) => acc + (assessment.totalMarks && r.grade !== undefined ? (r.grade / assessment.totalMarks) * 100 : (r.grade || 0)), 0) / graded.length)}%`
          : '--'

        return [
          assessment.title,
          assessment.phase,
          assessment.classLevels.join(', '),
          auditedStr,
          avg
        ]
      })

      // 4. Render Table
      autoTable(doc, {
        startY: 73,
        head: [['Exam Title', 'Phase', 'Classes', 'Audited / Total', 'Average Grade']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 5, valign: 'middle' },
        columnStyles: { 
          3: { halign: 'center' },
          4: { halign: 'center' }
        },
        margin: { left: 15, right: 15 }
      })

      // 5. Footer
      const finalY = (doc as any).lastAutoTable?.finalY || 150
      const footerY = Math.max(finalY + 30, 260)

      doc.setDrawColor(200)
      doc.line(15, footerY, 70, footerY)
      doc.line(pageWidth - 70, footerY, pageWidth - 15, footerY)
      
      doc.setTextColor(150)
      doc.setFontSize(8)
      doc.text("Instructor Signature", 15, footerY + 6)
      doc.text("Administrative Seal", pageWidth - 15, footerY + 6, { align: 'right' })
      
      doc.setFontSize(6.5)
      doc.text("© THE LEARNERS ACADEMY - Student Results Registry", 15, footerY + 18)
      doc.text(`EX-${format(new Date(), 'yyyyMMdd')}-${new Date().getTime().toString().slice(-4)}`, pageWidth - 15, footerY + 18, { align: 'right' })

      doc.save(`Results_Audit_${format(new Date(), 'yyyy_MM_dd')}.pdf`)
      toast.success("Results Registry Exported Successfully")
    } catch (error) {
      console.error(error)
      toast.error("Export Protocol Interrupted")
    }
  }

  return (
    <PageShell>
      <PageHeader 
        title="Student Results"
        description="View and manage grades for class exams."
        actions={
          <Button onClick={exportResultsPDF} variant="outline" className="hover-lift font-normal h-10 px-6">
            <Award className="w-4 h-4 mr-2" />
            <span className="text-xs">Export Records</span>
          </Button>
        }
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
                {stat.icon ? <stat.icon className={cn("h-4 w-4", stat.color || 'text-primary')} /> : <Award className="h-4 w-4 text-primary" />}
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
        columns={4}
      />

      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
            <Input
              placeholder="Search examination title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 text-sm bg-muted/5 font-normal"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px] h-11 text-xs font-normal bg-muted/5">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {myCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-[160px] h-11 text-xs font-normal bg-muted/5">
                <SelectValue placeholder="All Phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="First Test">Mid-Term</SelectItem>
                <SelectItem value="Last Test">Final-Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <EntityDataGrid 
          title="Exam Lists"
          data={filteredAssessments}
          columns={columns}
          emptyState={
            <div className="text-center py-24 text-muted-foreground opacity-40">
              <p className="font-serif text-2xl font-normal">No active examination blocks found.</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
