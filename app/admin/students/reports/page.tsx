'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  UserPlus, 
  Users, 
  ArrowUpRight, 
  Calendar, 
  Filter, 
  Download,
  MoreVertical,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  CalendarDays
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function RegistrationReportsPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
             Registration Pulse
          </h1>
          <p className="font-sans text-[10px] tracking-[0.3em] font-black uppercase opacity-30">
             Growth Intelligence // Enrollment Audit
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search registry..." 
                className="w-64 h-10 pl-10 rounded-xl border-primary/10 bg-card/60 backdrop-blur-md focus-visible:ring-primary/20 transition-all font-medium text-sm"
              />
           </div>
           <Button variant="outline" className="h-10 w-10 rounded-xl p-0 border-primary/10 bg-card hover:bg-primary/5">
              <Filter className="w-4 h-4 opacity-40" />
           </Button>
           <Button className="h-10 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-premium font-bold tracking-tight text-sm">
              Export Growth Data
           </Button>
        </div>
      </div>

      {/* 2. Top-Level Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard 
            label="Today's Admissions" 
            value="0" 
            sub="System audit in progress" 
            trend="0%" 
            icon={CalendarDays} 
            color="oklch(0.62 0.17 240)" 
         />
         <MetricCard 
            label="Weekly Cumulative" 
            value="0" 
            sub="Target: 180 (Seasonal)" 
            trend="0%" 
            icon={TrendingUp} 
            color="oklch(0.70 0.17 160)" 
         />
         <MetricCard 
            label="Conversion Velocity" 
            value="0%" 
            sub="Inquiry to Enrollment" 
            trend="0%" 
            icon={Sparkles} 
            color="oklch(0.78 0.18 75)" 
         />
         <MetricCard 
            label="Revenue Projection" 
            value="Rs. 0" 
            sub="Active Term Cycle" 
            trend="0%" 
            icon={TrendingUp} 
            color="oklch(0.62 0.17 240)" 
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
         {/* 3. Weekday Density Chart (Empty) */}
         <Card className="lg:col-span-2 border-primary/5 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
               <div className="space-y-1">
                  <CardTitle className="font-serif text-xl font-bold">Strategic Density</CardTitle>
                  <CardDescription className="text-[9px] uppercase tracking-widest font-black opacity-30">Registration Volume per Weekday</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                  <BarChart3 className="w-8 h-8 text-primary opacity-20" />
               </div>
               <div className="space-y-1">
                  <p className="font-serif text-lg font-bold opacity-30">Analytical Grid Initialized</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-10">Waiting for term active registration data</p>
               </div>
            </CardContent>
         </Card>

         {/* 4. Quick Highlights / Meta */}
         <div className="space-y-6 h-full flex flex-col">
            <Card className="border-primary/5 bg-sidebar text-white shadow-xl overflow-hidden relative flex-1">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
               <CardHeader className="pb-2 px-8 pt-8">
                  <CardTitle className="font-serif text-lg font-bold italic">Growth Insight</CardTitle>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-4">
                  <p className="text-xs font-medium leading-relaxed opacity-50 font-serif">
                     System is monitoring daily admission trends. Historical insights will be generated after the first 7-day Term cycle completion.
                  </p>
                  <div className="pt-4 border-t border-white/5">
                     <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span>Predicted Volume</span>
                        <span>Calculating...</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-primary/5 shadow-sm flex-1">
               <CardHeader className="pb-2 px-8 pt-8">
                  <CardTitle className="font-serif text-base font-bold">Registry Channels</CardTitle>
                  <CardDescription className="text-[9px] uppercase font-black tracking-widest opacity-30">Lead Source Attribution</CardDescription>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-4 pt-4">
                  <ChannelPlaceholder label="Organic Search" />
                  <ChannelPlaceholder label="Referral" />
                  <ChannelPlaceholder label="Digital Ads" />
               </CardContent>
            </Card>
         </div>
      </div>

      {/* 5. Historical Cohort Table (Empty) */}
      <Card className="border-primary/5 shadow-sm overflow-hidden min-h-[400px] mb-20 bg-card/60 backdrop-blur-xl">
         <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="font-serif text-xl font-bold">Enrollment Ledger</CardTitle>
               <CardDescription className="text-[9px] uppercase tracking-widest font-black opacity-30">Chronological Registration Log</CardDescription>
            </div>
         </CardHeader>
         <CardContent className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
               <Users className="w-6 h-6 text-primary opacity-20" />
            </div>
            <div className="space-y-1">
               <p className="font-serif text-base font-bold opacity-30">No Active Enrollments</p>
               <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-10">System ready to capture new term registrations</p>
            </div>
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
            <div className="flex items-start justify-between relative z-10 font-sans">
               <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{label}</span>
                  <div className="flex items-baseline gap-2">
                     <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground/90">{value}</h2>
                  </div>
                  <p className="text-[9px] font-medium text-muted-foreground/30 pt-1 leading-none">{sub}</p>
               </div>
               <div className="p-2.5 rounded-xl border border-primary/5 bg-card/40 backdrop-blur-md">
                  <Icon className="w-4 h-4" style={{ color }} />
               </div>
            </div>
         </CardContent>
      </Card>
   )
}

function ChannelPlaceholder({ label }: { label: string }) {
   return (
      <div className="space-y-2">
         <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-foreground/40">{label}</span>
            <span className="text-[9px] font-black text-muted-foreground/10">0%</span>
         </div>
         <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden" />
      </div>
   )
}
