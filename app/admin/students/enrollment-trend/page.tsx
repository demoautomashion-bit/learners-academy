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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getActiveTrimester, isWithinTrimester, SEASON_ORDER, buildTrimester, TrimesterSeason } from '@/lib/trimesters'
import { motion, AnimatePresence } from 'framer-motion'

type TemporalFilter = 'Daily' | 'Weekly' | 'Monthly' | 'Seasonal'

const SEASON_THEMES: Record<TrimesterSeason, any> = {
    Spring: { icon: Flower2, color: 'text-emerald-400', hex: '#34d399', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-transparent' },
    Summer: { icon: Sun, color: 'text-amber-400', hex: '#fbbf24', bg: 'bg-amber-500/10', gradient: 'from-amber-500/20 to-transparent' },
    Autumn: { icon: Leaf, color: 'text-orange-400', hex: '#fb923c', bg: 'bg-orange-500/10', gradient: 'from-orange-500/20 to-transparent' },
    Winter: { icon: CloudSnow, color: 'text-indigo-400', hex: '#818cf8', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500/20 to-transparent' }
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
    if (!students || !Array.isArray(students)) return []
    
    const now = new Date()
    
    if (filter === 'Daily') {
      return eachDayOfInterval({
        start: subDays(startOfDay(now), 6),
        end: startOfDay(now)
      }).map(day => ({
        name: format(day, 'EEE'),
        count: students.filter(s => {
          const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
          return d && isSameDay(d, day)
        }).length
      }))
    }
    
    if (filter === 'Weekly') {
      return [3, 2, 1, 0].map(weeksAgo => {
        const start = subDays(now, (weeksAgo + 1) * 7)
        const end = subDays(now, weeksAgo * 7)
        return {
          name: weeksAgo === 0 ? 'This Week' : `${weeksAgo}w Ago`,
          count: students.filter(s => {
            const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
            return d && d >= start && d < end
          }).length
        }
      })
    }
    
    if (filter === 'Monthly') {
      return [5, 4, 3, 2, 1, 0].map(monthsAgo => {
        const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
        return {
          name: format(date, 'MMM'),
          count: students.filter(s => {
            const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
            return d && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
          }).length
        }
      })
    }
    
    if (filter === 'Seasonal') {
      return SEASON_ORDER.map(season => {
        const trimester = buildTrimester(season, now.getFullYear())
        return {
          name: season,
          count: students.filter(s => {
            const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
            return d && isWithinTrimester(d, trimester)
          }).length
        }
      })
    }

    return []
  }, [students, filter])

  const comparisonData = useMemo(() => {
    const now = new Date()
    return SEASON_ORDER.map(season => {
        const trimester = buildTrimester(season, now.getFullYear())
        return {
            name: season,
            value: (students || []).filter(s => {
                const d = s.enrolledAt ? parseISO(s.enrolledAt as string) : null
                return d && isWithinTrimester(d, trimester)
            }).length
        }
    })
  }, [students])

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
        title="Enrollment Trends"
        description="Monitor student registrations and analyze enrollment growth over time."
        actions={
            <div className="flex items-center gap-3">
                <Select value={filter} onValueChange={(v) => setFilter(v as TemporalFilter)}>
                    <SelectTrigger className="h-11 w-40 glass-2 border-primary/10 rounded-xl px-4 text-[10px] uppercase font-bold tracking-widest">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 opacity-40" />
                            <SelectValue placeholder="Select period" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="glass-2 border-white/5">
                        {['Daily', 'Weekly', 'Monthly', 'Seasonal'].map((f) => (
                            <SelectItem key={f} value={f} className="text-[10px] uppercase font-bold tracking-widest">
                                {f}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" className="h-11 px-6 rounded-xl glass-2 border-primary/10 hover:bg-primary/5" onClick={() => router.back()}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Registry
                </Button>
            </div>
        }
      />


      {/* "Chronos" Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        <MetricCard label="Daily Enrollment" value={metrics.daily} icon={Zap} color="text-amber-400" sub="Last 24 Hours" />
        <MetricCard label="Weekly Enrollment" value={metrics.weekly} icon={TrendingUp} color="text-indigo-400" sub="Last 7 Days" />
        <MetricCard label="Monthly Enrollment" value={metrics.monthly} icon={Sparkles} color="text-emerald-400" sub="Last 30 Days" />
        <MetricCard 
            label="Current Term" 
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
                    <CardTitle className="font-serif text-2xl font-medium tracking-tight">Growth Trends</CardTitle>
                    <CardDescription className="text-xs font-normal opacity-40 mt-1">
                        Viewing <span className="text-primary font-bold">{filter}</span> enrollment numbers.
                    </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-black text-primary opacity-60">Growth Line</span>
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
                <CardTitle className="font-serif text-2xl font-medium tracking-tight">Term Comparisons</CardTitle>
                <CardDescription className="text-xs font-normal opacity-40 mt-1">Compare student registrations across different terms.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 flex flex-col">
                <div className="h-[300px] w-full mb-12">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
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
                                {comparisonData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={SEASON_THEMES[entry.name as TrimesterSeason].hex} 
                                        fillOpacity={entry.name === activeTrimester.season ? 1 : 0.4}
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
                                        <span className="text-[9px] opacity-60 font-medium">Term Summary</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-serif font-medium">
                                        {comparisonData.find(d => d.name === s)?.value || 0}
                                    </span>
                                    <span className="text-[9px] opacity-40 italic">Total Learners</span>
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

function MetricCard({ label, value, icon: Icon, color, sub }: { label: string, value: number, icon: any, color: string, sub: string, isStatic?: boolean }) {
    return (
        <Card className="hover-lift transition-premium h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
                <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                    {label}
                </CardTitle>
                <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                    <Icon className={cn("h-4 w-4", color)} />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex-1">
                <div className={cn("text-3xl font-sans font-normal", color)}>{value}</div>
                <div className="flex items-center gap-1.5 mt-2 opacity-40">
                    <div className={cn("h-1 w-1 bg-primary/40", color.replace('text-', 'bg-'))} />
                    <span className="text-[10px] text-muted-foreground font-normal">{sub}</span>
                </div>
            </CardContent>
        </Card>
    )
}
