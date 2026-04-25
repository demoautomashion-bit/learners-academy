'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  LayoutGrid, 
  History,
  ChevronRight,
  Download,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getActiveTrimester } from '@/lib/trimesters'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'

const HEALTH_THRESHOLDS = {
  STABLE: 80,
  ATTENTION: 50
}

const FALLBACK_FEE = 5000

export default function BatchFinancialsPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, students, feePayments, isInitialized } = useData()
  const currentTrimester = getActiveTrimester()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  let globalExpected = 0
  let globalRealized = 0

  const batchData = (courses || []).map((course) => {
      const batchStudents = (students || []).filter(s => 
          s.level === course.level || s.courseId === course.id
      )
      
      const expectedRevenue = batchStudents.length * (course.feeAmount || FALLBACK_FEE)
      
      let realizedRecovery = 0
      batchStudents.forEach(student => {
          const payments = (feePayments || []).filter(fp => fp.studentId === student.id || fp.studentId === student.studentId)
          realizedRecovery += payments.reduce((acc, p) => acc + (Number(p.amount) || Number(p.amountPaid) || 0), 0)
      })

      if (realizedRecovery === 0) {
          realizedRecovery = batchStudents.reduce((acc, s) => acc + (Number(s.amountPaid) || Number(s.paid) || 0), 0)
      }

      globalExpected += expectedRevenue
      globalRealized += realizedRecovery

      const velocityPercent = expectedRevenue > 0 ? (realizedRecovery / expectedRevenue) * 100 : 0
      
      return {
          ...course,
          expectedRevenue,
          realizedRecovery,
          velocityPercent,
          studentCount: batchStudents.length
      }
  })

  // Sort batches by velocity for easier insights
  const sortedBatches = batchData.sort((a, b) => b.velocityPercent - a.velocityPercent)

  const globalVelocity = globalExpected > 0 ? (globalRealized / globalExpected) * 100 : 0

  const stats = [
    { label: 'Overall Recovery', value: `${globalVelocity.toFixed(1)}%`, sub: 'Institutional Average', icon: TrendingUp, color: 'text-success' },
    { label: 'Projected Target', value: `PKR ${globalExpected.toLocaleString()}`, sub: currentTrimester.label, icon: Target, color: 'text-primary' },
  ]

  const exportBatchFinancialsPDF = () => {
    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        
        // 1. Institutional Branding (Premium Vector Background)
        doc.setFillColor(31, 41, 55)
        doc.rect(0, 0, pageWidth, 40, 'F')
        
        // Logo Accent (White disk for logo placement)
        doc.setFillColor(255, 255, 255)
        doc.circle(23, 20, 11, 'F')
        
        try {
            // Institutional Logo
            doc.addImage('/images/logo.png', 'PNG', 15, 12, 16, 16)
        } catch (e) {
            console.warn("Institutional logo asset not resolved for PDF render.")
        }
        
        // Institutional Info
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text("THE LEARNERS ACADEMY", 42, 18)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text("Global Fiscal Ledger & Batch Performance Audit", 42, 24)
        doc.text("Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.", 42, 28)
        doc.text("Contact: +92-3003583286 / +92-3115455533", 42, 31)

        // 2. Report Header
        doc.setTextColor(40)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`FISCAL PERFORMANCE REPORT - ${currentTrimester.label.toUpperCase()}`, 15, 55)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 61)

        // 3. Global Summary Matrix
        const summaryY = 70
        const stats = [
            { label: 'Overall Recovery', value: `${globalVelocity.toFixed(1)}%`, color: globalVelocity > 80 ? [34, 197, 94] : [239, 68, 68] },
            { label: 'Total Target', value: `PKR ${globalExpected.toLocaleString()}`, color: [31, 41, 55] },
            { label: 'Total Realized', value: `PKR ${globalRealized.toLocaleString()}`, color: [34, 197, 94] }
        ]

        stats.forEach((s, i) => {
            const x = 15 + (i * 60)
            doc.setDrawColor(230)
            doc.setFillColor(252, 252, 252)
            doc.rect(x, summaryY, 55, 20, 'FD')
            
            doc.setTextColor(120)
            doc.setFontSize(6.5)
            doc.text(s.label, x + 5, summaryY + 7)
            
            doc.setTextColor(s.color[0], s.color[1], s.color[2])
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(s.value, x + 5, summaryY + 14)
        })

        // 4. Batch Performance Table
        const tableData = sortedBatches.map((batch) => [
            `${batch.title || batch.name}\n(Instructor: ${batch.instructorName || batch.teacherName || 'TBD'})`,
            `PKR ${batch.expectedRevenue.toLocaleString()}`,
            { 
                content: `PKR ${batch.realizedRecovery.toLocaleString()}`,
                styles: { textColor: [34, 197, 94], fontStyle: 'bold' }
            },
            { 
                content: `${batch.velocityPercent.toFixed(1)}%`,
                styles: { 
                    textColor: batch.velocityPercent < 50 ? [239, 68, 68] : (batch.velocityPercent > 80 ? [34, 197, 94] : [217, 119, 6]),
                    fontStyle: 'bold'
                }
            }
        ])

        autoTable(doc, {
            startY: 100,
            head: [['Batch Identification', 'Revenue Target', 'Realized Recovery', 'Velocity']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8.5 },
            styles: { fontSize: 8, cellPadding: 5, valign: 'middle' },
            columnStyles: { 
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'center' }
            },
            margin: { left: 15, right: 15 }
        })

        // 5. Institutional Footer
        const finalY = (doc as any).lastAutoTable?.finalY || 150
        const footerY = Math.max(finalY + 30, 250)

        doc.setDrawColor(200)
        doc.line(15, footerY, 70, footerY)
        doc.line(pageWidth - 70, footerY, pageWidth - 15, footerY)
        
        doc.setTextColor(150)
        doc.setFontSize(8)
        doc.text("Accounts Officer", 15, footerY + 6)
        doc.text("Administrative Seal", pageWidth - 15, footerY + 6, { align: 'right' })
        
        doc.setFontSize(6.5)
        doc.text("© THE LEARNERS ACADEMY - Institutional Financial Intelligence Extract", 15, footerY + 18)
        doc.text(`Doc ID: TLA-BATCH-${new Date().getTime().toString().slice(-6)}`, pageWidth - 15, footerY + 18, { align: 'right' })

        // Save
        const dateStamp = new Date().toISOString().split('T')[0]
        doc.save(`TLA_Fiscal_Audit_${dateStamp}.pdf`)
        toast.success("Fiscal Audit Exported")
        
    } catch (error) {
        console.error("BATCH_PDF_ERROR:", error)
        toast.error("Export Protocol Interrupted")
    }
  }

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Batch Ledger"
        description="Granular performance audit of revenue targets, collection rates, and fiscal health categorized by instructional units."
        actions={
            <Button 
                variant="outline" 
                onClick={exportBatchFinancialsPDF}
                className="font-normal border-primary/10 hover:bg-primary/5 h-11 rounded-xl glass-2"
            >
                <Download className="w-4 h-4 mr-2" /> Global Fiscal Audit
            </Button>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-md overflow-hidden rounded-[2rem] transition-premium group">
            <CardHeader className="p-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-sans font-normal mt-1", stat.color)}>{stat.value}</CardTitle>
                <p className="text-xs text-muted-foreground mt-2 font-medium opacity-60">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {sortedBatches.map((batch) => {
            let healthConfig = {
                badgeStr: "Critical Alert",
                badgeClass: "border-destructive/20 text-destructive bg-destructive/5"
            }
            if (batch.velocityPercent >= HEALTH_THRESHOLDS.STABLE) {
                healthConfig = { badgeStr: "Stable Health", badgeClass: "border-success/20 text-success bg-success/5" }
            } else if (batch.velocityPercent >= HEALTH_THRESHOLDS.ATTENTION) {
                healthConfig = { badgeStr: "Attention Required", badgeClass: "border-warning/20 text-warning bg-warning/5" }
            }

            return (
            <Card key={batch.id} className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden group hover:translate-y-[-2px] transition-all shadow-md">
                <div className="p-6 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{batch.title || batch.name}</span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5 opacity-60">{batch.instructorName || batch.teacherName || 'Unassigned'}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 ${healthConfig.badgeClass}`}>
                        {healthConfig.badgeStr}
                    </Badge>
                </div>
                <CardContent className="p-6 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Revenue Target</span>
                            <p className="text-xl font-sans font-medium">PKR {batch.expectedRevenue.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Realized Recovery</span>
                            <p className="text-xl font-sans font-medium text-success">PKR {batch.realizedRecovery.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">
                            <span>Collection Velocity</span>
                            <span>{batch.velocityPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={batch.velocityPercent} className="h-1.5 bg-primary/5" />
                    </div>

                    <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                            <Users className="w-4 h-4" />
                            <span>Census: {batch.studentCount}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/admin/fee-registry?classId=${batch.id}`)}
                            className="h-9 px-4 text-xs font-medium hover:bg-primary/5 hover:text-primary transition-colors rounded-xl"
                        >
                            Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )})}
      </div>
    </PageShell>
  )
}
