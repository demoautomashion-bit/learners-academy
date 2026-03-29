'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  UserPlus, 
  Users, 
  ArrowUpRight, 
  CalendarDays, 
  Filter, 
  Download,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useData } from '@/contexts/data-context'
import { getGrowthAnalytics } from '@/lib/actions/analytics'
import { cn } from '@/lib/utils'

export default function RegistrationReportsPage() {
  const { students, isLoading, economics } = useData()
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [isCalculated, setIsCalculated] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    async function load() {
       const data = await getGrowthAnalytics()
       setAnalytics(data)
       setIsCalculated(true)
    }
    load()
  }, [])

  if (isLoading || !isCalculated) return (
    <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-20">
       <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
       <p className="font-sans text-[10px] font-black uppercase tracking-widest">Compiling Growth Intelligence...</p>
    </div>
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const sevenDaysAgo = today - (7 * 24 * 60 * 60 * 1000)

  const registrationsToday = students.filter(s => new Date(s.enrolledAt).getTime() >= today).length
  const weeklyTotal = students.filter(s => new Date(s.enrolledAt).getTime() >= sevenDaysAgo).length
  const totalVerified = students.filter(s => s.status === 'active').length

  const handleDownloadReport = () => {
    const headers = ["Name", "Student ID", "Enrollment Date", "Status"]
    const rows = students.map(s => [s.name, s.studentId || 'N/A', new Date(s.enrolledAt).toLocaleDateString(), s.status])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `growth_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLedger = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20 px-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
             Registration Pulse
          </h1>
          <p className="font-sans text-[10px] tracking-[0.3em] font-black uppercase opacity-30">
             Growth Intelligence // Institutional Enrollment Audit
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Audit registry..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-10 pl-10 rounded-xl border-primary/10 bg-card/60 backdrop-blur-md focus-visible:ring-primary/20 transition-all font-medium text-sm"
              />
           </div>
           <Button variant="outline" className="h-10 w-10 rounded-xl p-0 border-primary/10 bg-card hover:bg-primary/5 transition-premium">
              <Filter className="w-4 h-4 opacity-40" />
           </Button>
           <Button 
              onClick={handleDownloadReport}
              className="h-10 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-premium font-bold tracking-tight text-sm gap-2"
           >
              <Download className="w-3.5 h-3.5" />
              Growth Report
           </Button>
        </div>
      </div>

      {/* 2. Top-Level Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard 
            label="Today's Admissions" 
            value={registrationsToday.toString()} 
            sub="24-hour cycle registrations" 
            trend={analytics?.growthTrend || "0%"} 
            icon={CalendarDays} 
            color="oklch(0.62 0.17 240)" 
         />
         <MetricCard 
            label="Weekly Cumulative" 
            value={weeklyTotal.toString()} 
            sub="Last 7-day Term cycle" 
            trend="+5%" 
            icon={TrendingUp} 
            color="oklch(0.70 0.17 160)" 
         />
         <MetricCard 
            label="Verified Personnel" 
            value={totalVerified.toString()} 
            sub="Active student registry" 
            trend="+84.2%" 
            icon={Users} 
            color="oklch(0.78 0.18 75)" 
         />
         <MetricCard 
            label="Projected Revenue" 
            value={`Rs. ${(economics?.projectedRevenue || 0).toLocaleString()}`} 
            sub="Tuition Asset Value" 
            trend="+12%" 
            icon={Sparkles} 
            color="oklch(0.62 0.17 240)" 
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
         {/* 3. Weekday Density Chart (Visualizer) */}
         <Card className="lg:col-span-2 border-primary/5 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
               <div className="space-y-1">
                  <CardTitle className="font-serif text-xl font-bold">Strategic Density</CardTitle>
                  <CardDescription className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Registration Volume per Weekday</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[300px] flex items-center justify-center translate-y-2">
               <div className="flex flex-col items-center gap-4 opacity-10">
                  <BarChart3 className="w-12 h-12 text-primary" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-black">Growth Density Visualizer Active</p>
               </div>
               {/* Logic-driven density bars */}
               <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between h-20 px-10 gap-4">
                  {(analytics?.densityData || []).map((day: any, i: number) => {
                    const h = day.count > 0 ? Math.min(day.count * 15 + 20, 100) : 10
                    return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                       <motion.div 
                         initial={{ height: 0 }} 
                         animate={{ height: `${h}%` }} 
                         transition={{ delay: i * 0.1, duration: 1 }}
                         className="w-full rounded-t-lg bg-primary/10 group-hover:bg-primary/30 transition-all border-t border-primary/5" 
                       />
                       <span className="font-sans text-[8px] font-black uppercase opacity-20">{day.label}</span>
                     </div>
                    )
                  })}
               </div>
            </CardContent>
         </Card>

         {/* 4. Enrollment Insights */}
         <div className="space-y-6 h-full flex flex-col">
            <Card className="border-primary/5 bg-sidebar text-white shadow-xl overflow-hidden relative flex-1">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
               <CardHeader className="pb-2 px-8 pt-8">
                  <CardTitle className="font-serif text-lg font-bold italic">Term Insight</CardTitle>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-4">
                  <p className="text-xs font-medium leading-relaxed opacity-60 font-serif">
                     {analytics?.insightsStr}
                  </p>
                  <div className="pt-4 border-t border-white/10">
                     <div className="font-sans flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span>Projected Registry Load</span>
                        <span>{Math.round(weeklyTotal * 0.25)} Critical Nodes</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-primary/5 shadow-sm flex-1">
               <CardHeader className="pb-2 px-8 pt-8">
                  <CardTitle className="font-serif text-base font-bold">Registration Channels</CardTitle>
                  <CardDescription className="font-sans text-[9px] uppercase font-black tracking-widest opacity-30">Lead Source Acquisition</CardDescription>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-5 pt-4">
                  {(analytics?.channels || []).map((chn: any, i: number) => (
                     <SourceRow 
                       key={chn.label} 
                       label={chn.label} 
                       percentage={chn.percentage} 
                       color={i === 0 ? "oklch(0.62 0.17 240)" : i === 1 ? "oklch(0.70 0.17 160)" : "oklch(0.78 0.18 75)"} 
                     />
                  ))}
               </CardContent>
            </Card>
         </div>
      </div>

      {/* 5. Historical Growth Table (Live) */}
      <Card className="border-primary/5 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl mb-20">
         <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="font-serif text-xl font-bold">Enrollment Ledger</CardTitle>
               <CardDescription className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Most recent institutional registrations</CardDescription>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            {students.length === 0 ? (
               <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                  <Users className="w-8 h-8 text-primary opacity-20" />
                  <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-black opacity-10">Academy registry is currently empty</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="font-sans border-b border-primary/5 bg-muted/5 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                           <th className="px-8 py-4 text-left">Personnel Personnel</th>
                           <th className="font-sans px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Student Protocol ID</th>
                           <th className="px-6 py-4 text-left">Audit Date</th>
                           <th className="px-6 py-4 text-left">Registry Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-primary/5">
                        {filteredLedger.slice(0, 10).map((student: any) => (
                           <tr key={student.id} className="hover:bg-muted/10 transition-premium group">
                              <td className="px-8 py-6 font-serif font-bold text-base text-foreground/80">{student.name}</td>
                              <td className="px-6 py-6 font-sans font-bold text-[10px] text-muted-foreground/30">{student.studentId || 'PENDING'}</td>
                              <td className="font-sans px-6 py-6 text-[10px] font-bold text-muted-foreground/30">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                              <td className="px-6 py-6">
                                 <Badge variant="outline" className="font-sans text-[9px] font-black uppercase tracking-widest border-primary/10 opacity-60">
                                    {student.status}
                                 </Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value, sub, trend, icon: Icon, color }: any) {
   return (
      <Card className="border-primary/5 shadow-sm hover-lift transition-premium group overflow-hidden h-full">
         <CardContent className="p-8 relative h-full flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <Icon className="w-24 h-24" style={{ color }} />
            </div>
            <div className="space-y-1 relative z-10">
               <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{label}</span>
               <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground/90">{value}</h2>
                  <div className="font-sans flex items-center gap-1 text-[8px] font-black text-success tracking-widest">
                     <TrendingUp className="w-2 h-2" />
                     {trend}
                  </div>
               </div>
               <p className="font-sans text-[9px] font-medium text-muted-foreground/30 pt-1 leading-none">{sub}</p>
            </div>
         </CardContent>
      </Card>
   )
}

function SourceRow({ label, percentage, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex items-center justify-between transition-premium">
            <span className="font-sans text-[10px] font-bold text-foreground/50">{label}</span>
            <span className="font-sans text-[10px] font-black text-muted-foreground/30">{percentage}%</span>
         </div>
         <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${percentage}%` }} 
               transition={{ duration: 1, ease: "easeOut" }}
               className="h-full rounded-full" 
               style={{ backgroundColor: color }} 
            />
         </div>
      </div>
   )
}
