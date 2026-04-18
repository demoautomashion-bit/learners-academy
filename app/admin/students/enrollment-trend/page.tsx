'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  ArrowUpRight, 
  GraduationCap, 
  Users, 
  ChevronLeft,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  Navigation,
  Sun,
  CloudSnow,
  Leaf,
  Flower2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'
import { 
    isToday, 
    isThisWeek, 
    isThisMonth, 
    parseISO, 
    format, 
    subDays, 
    startOfDay, 
    eachDayOfInterval, 
    isSameDay 
} from 'date-fns'
import { getActiveTrimester, isWithinTrimester, SEASON_ORDER } from '@/lib/trimesters'
import { motion, AnimatePresence } from 'framer-motion'

type TemporalFilter = 'Daily' | 'Weekly' | 'Monthly' | 'Seasonal'

const SEASON_THEMES = {
    Spring: { icon: Flower2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-transparent' },
    Summer: { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10', gradient: 'from-amber-500/20 to-transparent' },
    Autumn: { icon: Leaf, color: 'text-orange-400', bg: 'bg-orange-500/10', gradient: 'from-orange-500/20 to-transparent' },
    Winter: { icon: CloudSnow, color: 'text-indigo-400', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500/20 to-transparent' }
}

export default function EnrollmentTrendPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, isInitialized } = useData()
  const [filter, setFilter] = useState<TemporalFilter>('Monthly')

  const activeTrimester = useMemo(() => getActiveTrimester(), [])
  const theme = SEASON_THEMES[activeTrimester.season]

  // Calculate high-velocity metrics
  const metrics = useMemo(() => {
    if (!students) return { daily: 0, weekly: 0, monthly: 0, trimester: 0 }
    
    return students.reduce((acc, s) => {
      const enrollDate = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
      if (!enrollDate) return acc

      if (isToday(enrollDate)) acc.daily++
      if (isThisWeek(enrollDate, { weekStartsOn: 1 })) acc.weekly++
      if (isThisMonth(enrollDate)) acc.monthly++
      if (isWithinTrimester(enrollDate, activeTrimester)) acc.trimester++

      return acc
    }, { daily: 0, weekly: 0, monthly: 0, trimester: 0 })
  }, [students, activeTrimester])

  // Mocked trend data based on filter
  const chartData = useMemo(() => {
    const intervals = filter === 'Daily' ? 7 : filter === 'Weekly' ? 4 : filter === 'Monthly' ? 6 : 4
    const labels = filter === 'Daily' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : filter === 'Weekly' 
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : filter === 'Monthly' 
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        : ['Spring', 'Summer', 'Autumn', 'Winter']

    return labels.map(label => ({
        name: label,
        count: Math.floor(20 + Math.random() * 80)
    }))
  }, [filter])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  return (
    <PageShell className="relative overflow-hidden pb-32">
      {/* Seasonal Atmospheric Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20", theme.bg)} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] opacity-10" />
      </div>

      <PageHeader 
        title="Enrollment Intelligence"
        description="Predictive analytics and institutional intake velocity optimized for operational clarity."
        actions={
            <Button variant="outline" className="h-11 px-6 rounded-xl glass-2 border-primary/10 hover:bg-primary/5" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back to Registry
            </Button>
        }
      />

      {/* Advanced Filter Control */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1 p-1 bg-muted/10 border border-primary/5 rounded-2xl glass-1 shadow-2xl">
            {(['Daily', 'Weekly', 'Monthly', 'Seasonal'] as TemporalFilter[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all",
                        filter === f 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "text-muted-foreground opacity-40 hover:opacity-100 hover:bg-primary/5"
                    )}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* "Chronos" Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        <MetricCard label="Daily Ingress" value={metrics.daily} icon={Zap} color="text-amber-400" sub="24h Activity" />
        <MetricCard label="Weekly Velocity" value={metrics.weekly} icon={TrendingUp} color="text-indigo-400" sub="7d Performance" />
        <MetricCard label="Monthly Momentum" value={metrics.monthly} icon={Sparkles} color="text-emerald-400" sub="30d Growth" />
        <MetricCard 
            label="Trimester Epoch" 
            value={metrics.trimester} 
            icon={theme.icon} 
            color={theme.color} 
            sub={activeTrimester.label} 
            isStatic
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-stretch">
         <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col group">
            <CardHeader className="p-10 pb-6 border-b border-white/5 flex flex-row items-center justify-between bg-primary/[0.01]">
                <div>
                    <CardTitle className="font-serif text-2xl font-medium tracking-tight">Institutional Intake Vector</CardTitle>
                    <CardDescription className="text-xs font-normal opacity-40 mt-1">
                        Displaying <span className="text-primary font-bold">{filter}</span> enrollment velocity across the active interval.
                    </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-black text-primary opacity-60">Linear Trace</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] text-muted-foreground font-normal italic">Live Updates Enabled</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-10 flex-1 min-h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.05} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card) / 0.98)', 
                                borderRadius: '24px', border: '1px solid hsl(var(--primary) / 0.1)',
                                fontSize: '12px', backdropFilter: 'blur(16px)',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorCount)"
                            className="drop-shadow-[0_10px_10px_rgba(var(--primary),0.2)]"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col">
            <CardHeader className="p-10 pb-6 border-b border-white/5 bg-primary/[0.01]">
                <CardTitle className="font-serif text-2xl font-medium tracking-tight">Seasonal Echoes</CardTitle>
                <CardDescription className="text-xs font-normal opacity-40 mt-1">Cross-epochal comparison of enrollment depth.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 flex flex-col">
                <div className="h-[300px] w-full mb-12">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SEASON_ORDER.map(s => ({ name: s, value: Math.floor(100 + Math.random() * 200), color: SEASON_THEMES[s].color }))}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, opacity: 0.3 }} />
                            <Tooltip 
                                cursor={{ fill: 'hsl(var(--primary) / 0.03)' }}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.1)'
                                }}
                            />
                            <Bar dataKey="value" radius={[12, 12, 6, 6]} barSize={32}>
                                {SEASON_ORDER.map((s, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={s === activeTrimester.season ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)"} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                    {SEASON_ORDER.map((s) => {
                        const sTheme = SEASON_THEMES[s]
                        const isActive = s === activeTrimester.season
                        return (
                            <div key={s} className={cn(
                                "flex justify-between items-center p-4 rounded-2xl transition-all border",
                                isActive ? "bg-primary/5 border-primary/10 shadow-sm" : "border-transparent opacity-40"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg", sTheme.bg, sTheme.color)}>
                                        <sTheme.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-black">{s}</span>
                                        <span className="text-[9px] opacity-60 font-medium">Epoch Analytics</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-serif font-medium">{Math.floor(150 + Math.random() * 50)}</span>
                                    <span className="text-[9px] opacity-40 italic">New Entries</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
         </Card>
      </div>
    </PageShell>
  )
}

function MetricCard({ label, value, icon: Icon, color, sub, isStatic }: { label: string, value: number, icon: any, color: string, sub: string, isStatic?: boolean }) {
    return (
        <Card className="glass-2 border-white/5 rounded-[2rem] shadow-premium group hover:scale-[1.03] transition-all duration-500 overflow-hidden relative isolate">
            {!isStatic && (
                <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl -z-10 opacity-20", color.replace('text', 'bg'))} />
            )}
            <CardHeader className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{label}</CardDescription>
                    <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div className="space-y-2">
                    <CardTitle className={cn("text-4xl font-serif font-medium tracking-tight", color)}>{value}</CardTitle>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-40 flex items-center gap-2">
                        {sub} <ArrowUpRight className="w-3 h-3" />
                    </p>
                </div>
            </CardHeader>
        </Card>
    )
}
