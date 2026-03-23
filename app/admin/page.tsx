'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  DollarSign,
  UserPlus,
  Award,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  mockDashboardStats,
  mockEnrollmentTrend,
  mockRevenueData,
  mockCoursePopularity,
  mockStudents,
  mockCourses,
} from '@/lib/mock-data'

const statCards = [
  {
    title: 'Total Students',
    value: mockDashboardStats.totalStudents,
    icon: GraduationCap,
    change: '+12%',
    changeType: 'positive' as const,
    href: '/admin/students',
  },
  {
    title: 'Active Teachers',
    value: mockDashboardStats.totalTeachers,
    icon: Users,
    change: '+2',
    changeType: 'positive' as const,
    href: '/admin/teachers',
  },
  {
    title: 'Total Classes',
    value: mockDashboardStats.totalCourses,
    icon: BookOpen,
    change: '+3',
    changeType: 'positive' as const,
    href: '/admin/classes',
  },
  {
    title: 'Revenue',
    value: `$${mockDashboardStats.revenue.toLocaleString()}`,
    icon: DollarSign,
    change: `+${mockDashboardStats.revenueChange}%`,
    changeType: 'positive' as const,
    href: '/admin/settings',
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
          Dashboard Registry
        </h1>
        <p className="text-editorial-meta text-lg mt-1">
          Welcome back. Monitoring academy performance and student growth.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {statCards.map((stat) => (
          <motion.div
            key={stat.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Link href={stat.href}>
              <Card className="hover-lift cursor-pointer transition-premium border-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-editorial-label">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground opacity-50" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-serif font-bold tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] h-4 px-1.5 font-bold",
                        stat.changeType === 'positive' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Monthly Gain</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Enrollment Trend
            </CardTitle>
            <CardDescription>
              Student enrollments over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEnrollmentTrend}>
                  <defs>
                    <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#enrollmentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Class Popularity
            </CardTitle>
            <CardDescription>
              Most enrolled classes this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCoursePopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    className="text-xs" 
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="var(--color-accent)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Latest student enrollments</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/students">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStudents.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-premium group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold text-primary tracking-tighter">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif font-bold text-base leading-tight">{student.name}</p>
                      <p className="text-editorial-label text-[10px] lowercase opacity-70">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className="text-editorial-label text-[9px]">Term Progress</span>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-16 h-1" />
                        <span className="text-[10px] font-bold">{student.progress}%</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5",
                        student.status === 'active' 
                          ? 'text-success border-success/20 bg-success/5' 
                          : 'text-muted-foreground border-border bg-muted/20'
                      )}
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/students?action=add">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Student
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/teachers?action=add">
                <Users className="w-4 h-4 mr-2" />
                Add New Teacher
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/classes?action=add">
                <BookOpen className="w-4 h-4 mr-2" />
                Create Class
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/settings">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Classes</CardTitle>
            <CardDescription className="text-editorial-meta">Overview of current educational cycles</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/5">
            <Link href="/admin/classes" className="flex items-center">
              Manage Registry
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCourses.filter(c => c.status === 'active').slice(0, 6).map((course) => (
              <div 
                key={course.id} 
                className="group p-5 rounded-2xl border bg-card hover-lift transition-premium cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/20 bg-primary/5 text-primary">
                    {course.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {course.enrolled}/{course.capacity}
                  </span>
                </div>
                <p className="font-medium text-sm mb-1 line-clamp-1">{course.title}</p>
                <p className="text-xs text-muted-foreground mb-3">{course.teacherName}</p>
                <Progress value={(course.enrolled / course.capacity) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
