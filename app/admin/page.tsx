'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { StabilityBoundary } from '@/components/stability/stability-boundary'
import { getInitials } from '@/lib/utils'

export default function AdminDashboard() {
  const hasMounted = useHasMounted()
  const { 
    students, teachers, stats, activities, economics, isInitialized 
  } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const kpis = [
    { 
      label: 'Students', 
      value: stats.totalStudents, 
      sub: 'Total Enrollment', 
      icon: GraduationCap, 
      color: 'text-primary' 
    },
    { 
      label: 'Staff', 
      value: stats.totalTeachers, 
      sub: 'Total Teachers', 
      icon: Users, 
      color: 'text-indigo-500' 
    },
    { 
      label: 'Collected', 
      value: `PKR ${stats.revenue.toLocaleString()}`, 
      sub: 'This Period', 
      icon: DollarSign, 
      color: 'text-success' 
    },
    { 
      label: 'Library', 
      value: stats.libraryCount, 
      sub: 'Verified Units', 
      icon: BookOpen, 
      color: 'text-warning' 
    },
  ]

  // Calculate dynamic pie data from real student distributions
  const pieData = [
    { name: 'Foundation', value: 0, color: 'var(--color-primary)' },
    { name: 'Core', value: 0, color: 'var(--color-success)' },
    { name: 'Advanced', value: 0, color: 'var(--color-warning)' },
  ]

  students.forEach(s => {
    const level = s.level || 'Foundation'
    const segment = pieData.find(p => p.name === level)
    if (segment) segment.value += 1
  })

  // Convert to percentages for display
  const total = students.length || 1
  pieData.forEach(p => p.value = Math.round((p.value / total) * 100))

  return (
    <PageShell>
      <div className="flex flex-col gap-1 mb-8 mt-2">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Overview</h1>
        <p className="text-muted-foreground font-normal opacity-60 text-sm">Monitor Students, Staff, and Institutional Cashflow.</p>
      </div>

      <StabilityBoundary name="Key Performance Indicators">
        <EntityCardGrid 
          data={kpis}
          renderItem={(item, i) => (
            <Card key={i} className="hover-lift transition-premium h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
                <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                  {item.label}
                </CardTitle>
                <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1">
                <div className="text-3xl font-sans font-normal">{item.value}</div>
                <div className="flex items-center gap-1.5 mt-2 opacity-40">
                  <div className={cn("h-1 w-1 bg-primary/40", item.color.replace('text-', 'bg-'))} />
                  <span className="text-[10px] text-muted-foreground font-normal">{item.sub}</span>
                </div>
              </CardContent>
            </Card>
          )}
          columns={4}
        />
      </StabilityBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">
        <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-[2rem] shadow-md overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-muted/5 border-b p-6 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-serif text-xl font-medium">Revenue Trend</CardTitle>
                <CardDescription className="text-xs font-normal opacity-60">Comparative financial timeline analysis.</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-40">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Actual</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-primary/40" /> Target</div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-10 flex-1">
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
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, opacity: 0.6 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, opacity: 0.6 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.98)', 
                      borderRadius: '20px', border: '1px solid hsl(var(--primary) / 0.08)',
                      fontSize: '11px', backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-1 border-primary/5 rounded-[2rem] shadow-md p-6 h-full flex flex-col items-center justify-center text-center">
            <div className="w-full h-[220px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <h3 className="font-serif text-xl font-medium tracking-tight">Student Levels</h3>
            <p className="text-xs text-muted-foreground mt-2 font-normal opacity-50 px-6">Tier distribution across academic units.</p>
            <div className="mt-8 flex flex-col gap-3 w-full">
                {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide opacity-80">{item.name}</span>
                        </div>
                        <span className="text-base font-sans font-medium">{item.value}%</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="glass-1 border-primary/5 rounded-[2rem] shadow-md overflow-hidden">
             <CardHeader className="bg-muted/5 border-b p-6 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="font-serif text-xl font-medium">Internal Intelligence</CardTitle>
                </div>
                <Activity className="w-4 h-4 text-primary opacity-40" />
             </CardHeader>
             <CardContent className="p-0">
                 <div className="divide-y divide-primary/5">
                    {activities.length > 0 ? (
                        activities.slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-5 px-6 hover:bg-primary/[0.02] transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{log.user}</span>
                                    <span className="text-xs text-muted-foreground opacity-60 font-medium mt-0.5">{log.action}</span>
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase opacity-40">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center opacity-20">
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">No Recent Intelligence Recorded</span>
                        </div>
                    )}
                </div>
             </CardContent>
        </Card>

        <StabilityBoundary name="Live Admissions Feed">
          <Card className="glass-1 border-primary/5 rounded-[2rem] shadow-md overflow-hidden">
               <CardHeader className="bg-muted/5 border-b p-6 flex flex-row items-center justify-between">
                  <div>
                     <CardTitle className="font-serif text-xl font-medium">New Admissions</CardTitle>
                  </div>
                  <History className="w-4 h-4 text-primary opacity-40" />
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-primary/5">
                      {students.slice(0, 3).map((student, i) => (
                          <div key={i} className="flex items-center justify-between p-5 px-6 hover:bg-primary/[0.02] transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                                      {getInitials(student.name)}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-medium">{student.name}</span>
                                      <span className="text-xs text-muted-foreground opacity-60 font-medium mt-0.5">ID: {student.studentId}</span>
                                  </div>
                              </div>
                              <Badge variant="outline" className="text-[10px] font-semibold border-primary/10 uppercase tracking-widest px-3 py-1">{student.level}</Badge>
                          </div>
                      ))}
                  </div>
               </CardContent>
          </Card>
        </StabilityBoundary>
      </div>
    </PageShell>
  )
}
