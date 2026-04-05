'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  UserPlus, 
  Activity, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  GraduationCap,
  Waves,
  History,
  Target,
  Sparkle,
  Zap,
  Flame,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  Cell
} from 'recharts'
import { useData } from '@/contexts/data-context'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { format, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, subDays, eachDayOfInterval, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'

/*
  Design Rules:
  - No Bold
  - No Italics
  - Subtle Animations
  - Premium Editorial Style
*/

export default function GrowthPage() {
  const { students, courses, isLoading, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />

  const stats = useMemo(() => {
    const today = new Date()
    const daily = students?.filter(s => s.enrolledAt && isSameDay(new Date(s.enrolledAt), today)).length
    const weekly = students?.filter(s => s.enrolledAt && isSameWeek(new Date(s.enrolledAt), today)).length
    const monthly = students?.filter(s => s.enrolledAt && isSameMonth(new Date(s.enrolledAt), today)).length
    
    const totalStudents = students.length
    const activeRate = (students?.filter(s => s.status === 'active').length / (totalStudents || 1)) * 100
    
    // Last week vs Current week (for sparkline mock)
    const lastWeekly = students?.filter(s => s.enrolledAt && isSameWeek(new Date(s.enrolledAt), subDays(today, 7))).length
    const growthDelta = weekly > lastWeekly ? ((weekly - lastWeekly) / (lastWeekly || 1)) * 100 : (-(lastWeekly - weekly) / (lastWeekly || 1)) * 100

    // Term Progress (3-month cycle)
    const currentMonth = today.getMonth()
    const termSeason = currentMonth < 3 ? 'Spring' : currentMonth < 6 ? 'Summer' : currentMonth < 9 ? 'Autumn' : 'Winter'
    const daysInTerm = 90
    const termStartMonth = currentMonth < 3 ? 0 : currentMonth < 6 ? 3 : currentMonth < 9 ? 6 : 9
    const termStartDate = new Date(today.getFullYear(), termStartMonth, 1)
    const daysPassed = Math.floor((today.getTime() - termStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const termProgress = Math.min((daysPassed / daysInTerm) * 100, 100)

    return { daily, weekly, monthly, totalStudents, activeRate, growthDelta, termSeason, termProgress }
  }, [students])

  const trendData = useMemo(() => {
    // Last 30 days registration trend
    const end = new Date()
    const start = subDays(end, 29)
    const interval = eachDayOfInterval({ start, end })

    return interval?.map(date => {
      const count = students?.filter(s => s.enrolledAt && isSameDay(new Date(s.enrolledAt), date)).length
      return {
        date: format(date, 'MMM d'),
        count
      }
    })
  }, [students])

  const levelBreakdown = useMemo(() => {
    const tiers = [
      { name: 'Foundation', match: ['foundation', 'pre-foundation'] },
      { name: 'Core Tier', match: ['beginner', 'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6'] },
      { name: 'Advanced', match: ['advanced'] },
      { name: 'Specialized', match: ['ielts', 'speaking', 'grammar'] }
    ]

    return tiers?.map(tier => ({
      name: tier.name.toUpperCase(),
      count: students?.filter(s => 
        tier.match.some(m => s.class?.toLowerCase().includes(m))
      ).length
    }))
  }, [students])

  if (isLoading) return null

  return (
    <motion.div 
      className="space-y-6"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Editorial Header */}
      <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl text-foreground font-medium">
            Growth & Analytics
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-normal max-w-2xl opacity-80">
            Institutional trajectory analysis, student retention metrics, and long-term academic growth forecasting.
          </p>
        </div>
        <div className="flex bg-muted/20 p-1.5  border ">
          <div className="px-6 py-2.5 flex items-center gap-3 bg-card border  shadow-sm ">
            <Waves className="w-4 h-4 text-primary opacity-60" />
            <span className="text-xs   font-normal text-muted-foreground">Market Momentum Index</span>
          </div>
        </div>
      </motion.div>

      {/* Primary Conversion Row */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {[
          { label: 'Daily Admissions', value: stats.daily, context: 'Active Registry', icon: UserPlus, color: 'text-primary' },
          { label: 'Weekly Growth', value: stats.weekly, context: 'Market Cycle', icon: TrendingUp, color: 'text-success' },
          { label: 'Momentum Index', value: `${stats.growthDelta.toFixed(0)}%`, context: 'Growth Delta', icon: Zap, color: 'text-primary' },
          { label: 'Effective Reach', value: stats.totalStudents, context: 'Institutional Scale', icon: GraduationCap, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <Card key={i} className="     group relative overflow-hidden flex flex-col justify-between h-56">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5  blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-10 pb-6 relative z-10 flex-1">
              <p className="text-xs   text-muted-foreground mb-4 font-normal opacity-50">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="font-serif text-xl font-serif font-medium">
                  {stat.value}
                </h3>
                {i === 2 && (
                  <div className={cn("flex items-center gap-1 text-xs  font-normal ", stats.growthDelta >= 0 ? "text-success" : "text-destructive")}>
                    {stats.growthDelta >= 0 ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />} 
                    {Math.abs(stats.growthDelta).toFixed(0)}%
                  </div>
                )}
              </div>
            </CardContent>
            <div className="px-10 pb-8 relative z-10 mt-auto">
              <div className="flex items-center gap-3">
                <div className={cn("w-1.5 h-1.5 ", stat.color.replace('text-', 'bg-'))} />
                <span className="text-xs text-muted-foreground opacity-40   font-normal">{stat.context}</span>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Rich Visual Data Row */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* Admission Velocity Chart */}
        <Card className="glass-1 lg:col-span-3 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
          <CardHeader className="bg-muted/10 border-b  p-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-serif font-medium">Recruitment Velocity</h3>
                <p className="text-xs   text-muted-foreground font-normal opacity-60 mt-1">Stochastic entry distribution (Trailing 30-Day Window)</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2  bg-primary shadow-sm shadow-primary/40" />
                  <span className="text-xs   opacity-40">Registered</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-16 flex-1">
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.06} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, opacity: 0.4, letterSpacing: '0.1em' }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, opacity: 0.4 }} 
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.9)', 
                      backdropFilter: 'blur(20px)',
                      borderRadius: '20px', 
                      border: '1px solid hsl(var(--primary) / 0.08)',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      textTransform: '',
                      letterSpacing: '0.05em'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#growthGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution Bar Chart */}
        <Card className="glass-1 lg:col-span-2 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
          <CardHeader className="bg-muted/10 border-b  p-10 text-center relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5  blur-3xl opacity-20" />
            <h3 className="font-serif text-xl font-serif font-medium">Tiers Composition</h3>
            <p className="text-xs   text-muted-foreground font-normal opacity-60 mt-1">Cross-sectional study by institutional rank.</p>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center gap-6 min-h-[400px] flex-1">
            {/* Term Lifecycle Progress */}
            <div className="relative w-40 h-40 group mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-primary/5 fill-none" strokeWidth="8" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.termProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-xs   text-muted-foreground opacity-50 font-normal">{stats.termSeason} Term</span>
                 <span className="font-serif text-3xl font-normal leading-none mt-1">{Math.round(stats.termProgress)}%</span>
              </div>
            </div>

            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={levelBreakdown} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground))" opacity={0.06} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.1em' }}
                    width={100}
                  />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                    {levelBreakdown?.map((entry, index) => (
                      <Cell key={index} fill={`oklch(0.62 0.17 ${240 + (index * 30)})`} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Insights / Narrative */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {[
          { label: 'Strategic Momentum', description: stats.growthDelta > 0 ? "Institutional growth velocity has hit peak metrics for the current cycle." : "Admission cadence is stabilizing after a high-volume registration window.", icon: Sparkle, color: 'text-success' },
          { label: 'Operational Scale', description: `Cross-institutional reach has successfully expanded to ${stats.totalStudents} active student identifiers.`, icon: GraduationCap, color: 'text-primary' },
          { label: 'Tier Saturation', description: `The Specialized Tier (IELTS/Speaking) currently accounts for ${((levelBreakdown.find(t => t.name.includes('SPECIALIZED'))?.count || 0) / (stats.totalStudents || 1) * 100).toFixed(0)}% of momentum.`, icon: Flame, color: 'text-indigo-400' },
        ].map((insight, i) => (
          <Card key={i} className="     p-8 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
             <div className="w-14 h-14  bg-primary/5 border  flex items-center justify-center group-hover:scale-110 transition-transform">
                <insight.icon className={cn("w-6 h-6", insight.color, "opacity-60")} />
             </div>
             <div>
                <p className="text-xs   text-muted-foreground font-normal opacity-50 mb-1">{insight.label}</p>
                <p className="text-sm font-normal text-foreground leading-tight">{insight.description}</p>
             </div>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  )
}
