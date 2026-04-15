'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  DollarSign, 
  LayoutGrid, 
  ArrowUpRight,
  History,
  Info,
  ChevronRight,
  Download
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function BatchFinancialsPage() {
  const hasMounted = useHasMounted()
  const { courses, students, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const stats = [
    { label: 'Overall Recovery', value: '88.4%', sub: 'Institutional Average', icon: TrendingUp, color: 'text-success' },
    { label: 'Projected Target', value: 'PKR 6.5M', sub: 'Active Trimester', icon: Target, color: 'text-primary' },
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
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{stat.label}</CardDescription>
                <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 mt-2 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {courses.map((batch) => (
            <Card key={batch.id} className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden group hover:translate-y-[-2px] transition-all">
                <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{batch.name}</span>
                            <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">{batch.instructorName}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-normal border-success/20 text-success bg-success/5 uppercase tracking-widest">Stable Health</Badge>
                </div>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Revenue Target</span>
                            <p className="text-lg font-serif">PKR 450,000</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Realized Recovery</span>
                            <p className="text-lg font-serif text-success">PKR 412,500</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                            <span>Collection Velocity</span>
                            <span>91.6%</span>
                        </div>
                        <Progress value={91.6} className="h-1.5 bg-primary/5" />
                    </div>

                    <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">
                            <History className="w-3.5 h-3.5" />
                            <span>Last Collection: Today</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-widest font-bold hover:bg-primary/5 text-primary">
                            Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </PageShell>
  )
}
