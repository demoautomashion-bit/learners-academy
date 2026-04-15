'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  History, 
  Filter, 
  Download,
  Plus,
  ShieldCheck,
  Search,
  Activity
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function EconomicsAuditorPage() {
  const hasMounted = useHasMounted()
  const { economics, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const stats = [
    { label: 'Cumulative Inflow', value: 'PKR 8.4M', sub: 'Gross Institutional Revenue', icon: ArrowUpRight, color: 'text-success' },
    { label: 'Operational Outflow', value: 'PKR 2.1M', sub: 'Expenditures & Salaries', icon: ArrowDownRight, color: 'text-destructive' },
    { label: 'Net Institutional Margin', value: 'PKR 6.3M', sub: 'Audit-Ready Profit', icon: ShieldCheck, color: 'text-primary' },
    { label: 'Fiscal Volume', value: 'PKR 10.5M', sub: 'Total Transactional Density', icon: Activity, color: 'text-indigo-500' },
  ]

  const columns: Column<any>[] = [
    {
        label: 'Transaction Metadata',
        render: (log) => (
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    log.type === 'credit' ? "bg-success/5 text-success border-success/10" : "bg-destructive/5 text-destructive border-destructive/10"
                )}>
                    {log.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{log.description}</span>
                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">{log.entity}</span>
                </div>
            </div>
        ),
        width: '350px'
    },
    {
        label: 'Category Context',
        render: (log) => (
            <Badge variant="outline" className="text-[10px] px-3 py-1 font-normal opacity-60 uppercase tracking-widest border-primary/5">
                {log.category}
            </Badge>
        )
    },
    {
        label: 'Audit Chronology',
        render: (log) => (
            <div className="flex flex-col">
                <span className="text-[11px] font-medium">{new Date(log.date).toLocaleDateString()}</span>
                <span className="text-[9px] text-muted-foreground opacity-40 uppercase tracking-tighter">Verified Protocol</span>
            </div>
        )
    },
    {
        label: 'Fiscal Magnitude',
        render: (log) => (
            <span className={cn(
                "text-sm font-serif",
                log.type === 'credit' ? "text-success" : "text-destructive"
            )}>
                {log.type === 'credit' ? '+' : '-'} PKR {log.amount.toLocaleString()}
            </span>
        )
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Economics Ledger"
        description="Master double-entry audit of all institutional credits, debits, and capital deployment strategies."
        actions={
            <div className="flex items-center gap-2">
                 <Button variant="outline" className="font-normal border-primary/5 hover:bg-primary/5 h-11">
                    <Download className="w-4 h-4 mr-2" /> Ledger Export
                 </Button>
                 <Button className="font-normal bg-primary shadow-lg shadow-primary/20 h-11">
                    <Plus className="w-4 h-4 mr-2" /> Log Manual Entry
                 </Button>
            </div>
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
        columns={4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-stretch">
         <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
            <CardHeader className="p-10 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-serif text-xl font-medium tracking-tight">Institutional Outflow Trace</CardTitle>
                    <CardDescription className="text-xs font-normal opacity-40 mt-1">A historical velocity of capital deployment across 6 months.</CardDescription>
                </div>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase tracking-widest text-[9px] h-9 px-4">Expense Audit</Badge>
            </CardHeader>
            <CardContent className="p-10 flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={economics?.historicalData || []}>
                        <defs>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card) / 0.95)', 
                                borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.08)',
                                fontSize: '11px', backdropFilter: 'blur(8px)'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorOut)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="glass-1 border-primary/5 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-8 animate-pulse">
                <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium tracking-tight">Institutional Margin</h3>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed font-normal px-8 italic opacity-60">
                The institution is currently operating at a <span className="text-success font-bold font-serif not-italic">75%</span> efficiency rate relative to gross fiscal volume.
            </p>
            <div className="w-full mt-10 space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                    <span>Inflow Ratio</span>
                    <span>Outflow Ratio</span>
                </div>
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/20">
                    <div className="bg-success h-full" style={{ width: '75%' }} />
                    <div className="bg-destructive h-full" style={{ width: '25%' }} />
                </div>
            </div>
         </Card>
      </div>

      <div className="mt-12">
        <EntityDataGrid 
          title="Master Transaction Audit"
          description="Chronological record of every institutional financial log verified by system protocols."
          data={economics?.logs || []}
          columns={columns}
          actions={
            <div className="relative w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Identify transaction item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
                />
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-serif text-xl font-normal">Audit Trail Empty</p>
                <p className="text-xs mt-2 font-normal">System awaiting transactional ingestion</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
