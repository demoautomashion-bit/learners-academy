'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { 
  Search, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Waves, 
  Zap, 
  GraduationCap,
  Sparkle,
  Flame,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { format, isSameDay, isSameWeek, isSameMonth, subDays, eachDayOfInterval } from 'date-fns'
import type { Student } from '@/lib/types'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ClientDate } from '@/components/shared/client-date'
import {
  getTrimesters,
  getActiveTrimester,
  getDaysRemaining,
  getDateRangeFromFilterKey,
} from '@/lib/trimesters'
import { TrimesterBanner } from '@/components/shared/trimester-banner'

type TimePeriod = 'all' | 'today' | 'week' | 'month' | 'spring' | 'summer' | 'autumn' | 'winter'

export default function EnrollmentTrendPage() {
  const hasMounted = useHasMounted()
  const { students, courses: mockCourses, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')
  const [classFilter, setClassFilter] = useState('all')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const stats = (() => {
    if (!students) return { today: 0, week: 0, month: 0, semester: 0, growthDelta: 0, termSeason: '', termProgress: 0 }
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const week = now.getTime() - 7 * 24 * 60 * 60 * 1000
    const month = now.getTime() - 30 * 24 * 60 * 60 * 1000
    const semester = now.getTime() - 90 * 24 * 60 * 60 * 1000

    const todayCount = students.filter(s => new Date(s.enrolledAt).getTime() >= today).length
    const weekCount = students.filter(s => new Date(s.enrolledAt).getTime() >= week).length
    const monthCount = students.filter(s => new Date(s.enrolledAt).getTime() >= month).length
    const semesterCount = students.filter(s => new Date(s.enrolledAt).getTime() >= semester).length

    // Growth Delta Logic from legacy Growth page
    const lastWeekly = students?.filter(s => s.enrolledAt && isSameWeek(new Date(s.enrolledAt), subDays(now, 7))).length
    const growthDelta = weekCount > lastWeekly ? ((weekCount - lastWeekly) / (lastWeekly || 1)) * 100 : (-(lastWeekly - weekCount) / (lastWeekly || 1)) * 100

    // Term Progress — driven by getActiveTrimester()
    const activeTrimester = getActiveTrimester(now)
    const termSeason = activeTrimester.season
    const daysInTerm = (activeTrimester.end.getTime() - activeTrimester.start.getTime()) / (1000 * 60 * 60 * 24)
    const daysPassed = (now.getTime() - activeTrimester.start.getTime()) / (1000 * 60 * 60 * 24)
    const termProgress = Math.min((daysPassed / daysInTerm) * 100, 100)

    return { 
      today: todayCount, 
      week: weekCount, 
      month: monthCount, 
      semester: semesterCount,
      growthDelta,
      termSeason,
      termProgress
    }
  })()

  const trendData = (() => {
    // Last 30 days registration trend for the AreaChart
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
  })()

  const levelBreakdown = (() => {
    const tiers = [
      { name: 'Foundation', match: ['foundation', 'pre-foundation'] },
      { name: 'Core Tier', match: ['beginner', 'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6'] },
      { name: 'Advanced', match: ['advanced'] },
      { name: 'Specialized', match: ['ielts', 'speaking', 'grammar'] }
    ]

    return tiers?.map(tier => ({
      name: tier.name.toUpperCase(),
      count: students?.filter(s => {
        const studentCourse = mockCourses.find(c => c.id === s.enrolledCourses[0])?.title || ''
        return tier.match.some(m => studentCourse.toLowerCase().includes(m))
      }).length
    }))
  })()

  const currentYear = new Date().getFullYear()
  const trimesters = getTrimesters(currentYear)

  const filteredStudents = (() => {
    return students?.filter(student => {
      const enrollmentDate = new Date(student.enrolledAt).getTime()
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      
      // Time Filter
      let matchesPeriod = true
      if (periodFilter === 'today') matchesPeriod = enrollmentDate >= today
      else if (periodFilter === 'week') matchesPeriod = enrollmentDate >= (now.getTime() - 7 * 24 * 60 * 60 * 1000)
      else if (periodFilter === 'month') matchesPeriod = enrollmentDate >= (now.getTime() - 30 * 24 * 60 * 60 * 1000)
      else {
        const trimesterRange = getDateRangeFromFilterKey(periodFilter, currentYear)
        if (trimesterRange) {
          matchesPeriod = enrollmentDate >= trimesterRange.start.getTime() && enrollmentDate <= trimesterRange.end.getTime()
        }
      }

      // Class Filter
      const matchesClass = classFilter === 'all' || student.enrolledCourses.includes(classFilter)

      // Search Filter
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesPeriod && matchesClass && matchesSearch
    })
  })()

  const columns: Column<Student>[] = [
    {
      label: 'Student ID',
      render: (student) => (
        <span className="font-sans font-normal text-primary text-sm opacity-60">
          {student.studentId || 'ID-TBC'}
        </span>
      ),
      width: '120px'
    },
    {
      label: 'Student Name',
      render: (student) => (
        <p className="font-normal text-sm">{student.name}</p>
      ),
      width: '200px'
    },
    {
      label: 'Guardian Name',
      render: (student) => (
        <span className="text-muted-foreground font-normal opacity-40 text-xs">
          {student.guardianName || 'N/A'}
        </span>
      )
    },
    {
      label: 'Class & Timing',
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-normal text-sm">
            {mockCourses.find(c => c.id === student.enrolledCourses[0])?.title || 'Registry Level'}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal opacity-40 uppercase tracking-widest mt-0.5">
            {student.classTiming || 'Timing TBC'}
          </span>
        </div>
      )
    },
    {
      label: 'Admission Date',
      render: (student) => (
        <span className="font-sans text-xs opacity-50 font-normal">
          <ClientDate date={student.enrolledAt} formatString="MMM d, yyyy" fallback="---" />
        </span>
      )
    }
  ]

  const periodStatData = [
    { label: 'Daily', value: stats.today, sub: 'New students today', icon: TrendingUp, color: 'text-success' },
    { label: 'Weekly', value: stats.week, sub: 'Last 7 days', icon: Zap, color: 'text-primary' },
    { label: 'Monthly', value: stats.month, sub: 'Last 30 days', icon: Calendar, color: 'text-indigo-400' },
    { label: 'Semester', value: stats.semester, sub: 'Last 3 months', icon: Waves, color: 'text-primary' },
  ]

  if (!isInitialized || !hasMounted) {
    return <DashboardSkeleton />
  }

  return (
    <PageShell>
      <PageHeader 
        title="Student Enrollment"
        description="Track how many students are joining and which levels they are choosing."
      />

      <TrimesterBanner className="mb-8" />

      <EntityCardGrid 
        data={periodStatData}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium border-primary/5 bg-gradient-to-br from-background to-primary/[0.02]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-normal opacity-50 uppercase tracking-widest flex items-center gap-2">
                <stat.icon className="w-3 h-3 text-primary opacity-40" />
                {stat.label}
              </CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>
                  {stat.value}
                </CardTitle>
                {i === 1 && (
                  <div className={cn("flex items-center gap-1 text-[10px] font-normal", stats.growthDelta >= 0 ? "text-success" : "text-destructive")}>
                    {stats.growthDelta >= 0 ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />} 
                    {Math.abs(stats.growthDelta).toFixed(0)}%
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground font-normal opacity-40 mt-1 uppercase tracking-[0.2em]">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={4}
      />

      {/* Analytics Visuals Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch mb-12">
        {/* Admission Velocity Chart */}
        <Card className="glass-1 lg:col-span-3 overflow-hidden rounded-2xl shadow-premium transition-premium h-full flex flex-col">
          <CardHeader className="bg-muted/5 border-b p-8">
            <h3 className="font-serif text-xl font-medium">Enrollment Trend</h3>
            <p className="text-xs text-muted-foreground font-normal opacity-60 mt-1">New students over the last 30 days</p>
          </CardHeader>
          <CardContent className="p-6 pt-12 flex-1">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.06} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, opacity: 0.4 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, opacity: 0.4 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.9)', 
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.08)',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution Bar Chart */}
        <Card className="glass-1 lg:col-span-2 overflow-hidden rounded-2xl shadow-premium h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-32 h-32 group mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" className="stroke-primary/5 fill-none" strokeWidth="6" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="58" 
                  className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={`${2 * Math.PI * 58 * (1 - stats.termProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-[10px] text-muted-foreground opacity-50 font-normal uppercase tracking-widest">{stats.termSeason} Term</span>
                 <span className="font-serif text-2xl font-normal leading-none mt-1">{Math.round(stats.termProgress)}%</span>
              </div>
            </div>

            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={levelBreakdown} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, opacity: 0.5, letterSpacing: '0.05em' }} width={80} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                    {levelBreakdown?.map((entry, index) => (
                      <Cell key={index} fill={`oklch(0.62 0.17 ${240 + (index * 30)})`} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
        </Card>
      </div>

      <EntityDataGrid 
        title="Recent Enrollments"
        data={filteredStudents}
        columns={columns}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Select value={periodFilter} onValueChange={(v: TimePeriod) => setPeriodFilter(v)}>
                <SelectTrigger className="w-[180px] h-10 text-xs font-normal border-primary/10">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admissions</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectSeparator className="opacity-10" />
                  {trimesters.map(t => (
                    <SelectItem key={t.filterKey} value={t.filterKey}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px] h-10 text-xs font-normal border-primary/10">
                  <SelectValue placeholder="Class Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {mockCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs font-normal border-primary/10"
              />
            </div>
          </div>
        }
      />
    </PageShell>
  )
}
