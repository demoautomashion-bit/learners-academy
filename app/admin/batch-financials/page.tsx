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
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function BatchFinancialsPage() {
  const hasMounted = useHasMounted()
  const { courses, students, feePayments, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  let globalExpected = 0
  let globalRealized = 0

  const batchData = (courses || []).map((course) => {
      const batchStudents = (students || []).filter(s => 
          s.level === course.level || s.courseId === course.id
      )
      
      const expectedRevenue = batchStudents.length * (course.feeAmount || 5000)
      
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
    { label: 'Projected Target', value: `PKR ${globalExpected.toLocaleString()}`, sub: 'Active Trimester', icon: Target, color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Batch-Level Financials"
        description="Granular performance audit of revenue targets, collection rates, and fiscal health categorized by instructional units."
        actions={
            <Button variant="outline" className="font-normal border-primary/5 hover:bg-primary/5 h-11">
                <Download className="w-4 h-4 mr-2" /> Global Fiscal Audit
            </Button>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-md overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-serif font-medium mt-1", stat.color)}>{stat.value}</CardTitle>
                <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {sortedBatches.map((batch) => {
            let healthConfig = {
                badgeStr: "Critical Alert",
                badgeClass: "border-destructive/20 text-destructive bg-destructive/5"
            }
            if (batch.velocityPercent >= 80) {
                healthConfig = { badgeStr: "Stable Health", badgeClass: "border-success/20 text-success bg-success/5" }
            } else if (batch.velocityPercent >= 50) {
                healthConfig = { badgeStr: "Attention Required", badgeClass: "border-warning/20 text-warning bg-warning/5" }
            }

            return (
            <Card key={batch.id} className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden group hover:translate-y-[-2px] transition-all shadow-md">
                <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{batch.title || batch.name}</span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5">{batch.instructorName || batch.teacherName || 'Unassigned'}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-widest ${healthConfig.badgeClass}`}>
                        {healthConfig.badgeStr}
                    </Badge>
                </div>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Target</span>
                            <p className="text-xl font-serif">PKR {batch.expectedRevenue.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Realized Recovery</span>
                            <p className="text-xl font-serif text-success">PKR {batch.realizedRecovery.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span>Collection Velocity</span>
                            <span>{batch.velocityPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={batch.velocityPercent} className="h-2 bg-primary/5" />
                    </div>

                    <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            <span>Enrolled: {batch.studentCount} Students</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-primary/5 hover:text-primary transition-colors">
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
