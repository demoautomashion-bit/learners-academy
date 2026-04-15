'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  History,
  Activity
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'

export default function AdminDashboard() {
  const hasMounted = useHasMounted()
  const { students, teachers, courses, feePayments, economics, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const kpis = [
    { 
      label: 'Active Students', 
      value: students.length, 
      sub: 'Total Enrollment', 
      icon: GraduationCap, 
      color: 'text-primary' 
    },
    { 
      label: 'Faculty Roster', 
      value: teachers.length, 
      sub: 'Institutional Staff', 
      icon: Users, 
      color: 'text-indigo-500' 
    },
    { 
      label: 'Revenue Target', 
      value: '92%', 
      sub: 'Current Trimester', 
      icon: Target, 
      color: 'text-success' 
    },
    { 
      label: 'Library Strength', 
      value: '1.2k', 
      sub: 'Verified Questions', 
      icon: BookOpen, 
      color: 'text-warning' 
    },
  ]

  const pieData = [
    { name: 'Foundation', value: 35, color: 'var(--color-primary)' },
    { name: 'Core', value: 45, color: 'var(--color-success)' },
    { name: 'Advanced', value: 20, color: 'var(--color-warning)' },
  ]

  return (
    <PageShell>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Institutional Oversight</h1>
        <p className="text-muted-foreground font-normal opacity-60">System-wide monitoring, fiscal auditing, and academic management.</p>
      </div>

      <EntityCardGrid 
        data={kpis}
        renderItem={(item, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-2 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <item.icon className="w-12 h-12" />
                </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{item.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-serif font-medium", item.color)}>{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-1 rounded-full ", item.color.replace('text-', 'bg-'))} />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50">{item.sub}</span>
                </div>
            </CardContent>
          </Card>
        )}
        columns={4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-stretch">
        <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-2xl shadow-premium overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-muted/5 border-b p-8 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-serif text-xl font-medium">Revenue Velocity</CardTitle>
                <CardDescription className="text-xs font-normal opacity-60">Tuition collection performance vs institutional target.</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Actual</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-primary/40" /> Target</div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-12 flex-1">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economics?.historicalData || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.05} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.9)', 
                      borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.08)',
                      fontSize: '11px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-1 border-primary/5 rounded-2xl shadow-premium p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="w-full h-[250px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <h3 className="font-serif text-xl font-medium tracking-tight">Level Distribution</h3>
            <p className="text-xs text-muted-foreground mt-2 font-normal opacity-50 px-8">Categorical intake volume across academic tiers.</p>
            <div className="mt-8 flex flex-col gap-3 w-full">
                {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{item.name}</span>
                        </div>
                        <span className="text-sm font-serif">{item.value}%</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="glass-1 border-primary/5 rounded-2xl shadow-premium overflow-hidden">
             <CardHeader className="bg-muted/5 border-b p-6 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="font-serif text-base font-medium">Recent Staff Activity</CardTitle>
                </div>
                <Activity className="w-4 h-4 text-primary opacity-40" />
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                    {[
                        { user: 'Admin System', action: 'Daily Ledger Synchronized', time: '14 mins ago' },
                        { user: 'Sarah Khan', action: 'New Faculty Registration', time: '1 hour ago' },
                        { user: 'Registrar', action: 'Term 3 Enrollment Opened', time: '3 hours ago' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-primary/[0.02] transition-colors">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium">{log.user}</span>
                                <span className="text-[10px] text-muted-foreground opacity-60">{log.action}</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest opacity-40">{log.time}</span>
                        </div>
                    ))}
                </div>
             </CardContent>
        </Card>

        <Card className="glass-1 border-primary/5 rounded-2xl shadow-premium overflow-hidden">
             <CardHeader className="bg-muted/5 border-b p-6 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="font-serif text-base font-medium">Live Admissions Feed</CardTitle>
                </div>
                <History className="w-4 h-4 text-primary opacity-40" />
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                    {students.slice(0, 3).map((student, i) => (
                        <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-primary/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                                    {student.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">{student.name}</span>
                                    <span className="text-[10px] text-muted-foreground opacity-60">ID: {student.studentId}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-normal border-primary/10">{student.level}</Badge>
                        </div>
                    ))}
                </div>
             </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
