'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
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
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export default function EnrollmentTrendPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const trendData = [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 145 },
    { month: 'Mar', count: 168 },
    { month: 'Apr', count: 190 },
    { month: 'May', count: 215 },
    { month: 'Jun', count: 240 },
  ]

  const barData = [
    { name: 'Foundation', value: 85, color: 'var(--color-primary)' },
    { name: 'Core', value: 110, color: 'var(--color-success)' },
    { name: 'Advanced', value: 45, color: 'var(--color-warning)' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Enrollment Intelligence"
        description="Predictive analytics and historical intake velocity for the current academic session."
        actions={
            <Button variant="ghost" className="font-normal" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back to Registry
            </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
        {[
            { label: 'Intake Velocity', value: '+14%', sub: 'vs Previous Month', icon: TrendingUp, color: 'text-success' },
            { label: 'Conversion Rate', value: '78%', sub: 'Institutional Target', icon: ArrowUpRight, color: 'text-primary' },
            { label: 'Waitlist Depth', value: '42', sub: 'Pending Admissions', icon: GraduationCap, color: 'text-warning' },
            { label: 'Churn Rate', value: '1.2%', sub: 'Institutional Stability', icon: Users, color: 'text-success' },
        ].map((stat, i) => (
            <Card key={i} className="glass-1 border-primary/5 rounded-[1.5rem] shadow-premium group hover:translate-y-[-2px] transition-all">
                <CardHeader className="pb-4">
                    <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-30">{stat.label}</CardDescription>
                    <div className="flex items-end justify-between mt-1">
                        <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                        <stat.icon className={cn("w-5 h-5 opacity-20", stat.color)} />
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.1em] opacity-40 mt-1 font-normal italic">{stat.sub}</p>
                </CardHeader>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-stretch">
         <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
            <CardHeader className="p-10 pb-4 border-b border-primary/5 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-serif text-xl font-medium tracking-tight">Enrollment Momentum</CardTitle>
                    <CardDescription className="text-xs font-normal opacity-40 mt-1">A cumulative trace of student admissions over the active term.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-primary/5 p-1 rounded-lg border">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-widest px-3 bg-white shadow-sm font-bold">Linear View</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-widest px-3 font-normal opacity-40">Grid View</Button>
                </div>
            </CardHeader>
            <CardContent className="p-10 flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
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
                        <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="var(--color-primary)" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }} 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="glass-1 border-primary/5 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
            <CardHeader className="p-10 pb-4 border-b border-primary/5">
                <CardTitle className="font-serif text-xl font-medium tracking-tight">Intake by Tier</CardTitle>
                <CardDescription className="text-xs font-normal opacity-40 mt-1">Cross-sectional analysis of enrollment breadth.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 flex flex-col justify-center">
                <div className="h-[250px] w-full mb-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} />
                            <Tooltip 
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card) / 0.95)', 
                                    borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.08)',
                                    fontSize: '11px', backdropFilter: 'blur(8px)'
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    {barData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 group-hover:opacity-100 transition-opacity">{item.name}</span>
                            </div>
                            <span className="text-sm font-serif">{item.value} <span className="text-[10px] opacity-40 italic">Candidates</span></span>
                        </div>
                    ))}
                </div>
            </CardContent>
         </Card>
      </div>
    </PageShell>
  )
}
