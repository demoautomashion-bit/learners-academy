'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase, 
  Building2, 
  BookOpen, 
  Megaphone,
  Download,
  Calendar,
  ChevronRight,
  Database
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const categories = [
  { 
    title: 'Personnel Salaries', 
    icon: Briefcase,
    color: 'oklch(0.62 0.17 240)',
    description: 'Faculty and administrative payroll'
  },
  { 
    title: 'Infrastructure', 
    icon: Building2,
    color: 'oklch(0.70 0.14 240)',
    description: 'Rent, utilities, and maintenance'
  },
  { 
    title: 'Academic Supplies', 
    icon: BookOpen,
    color: 'oklch(0.70 0.17 160)',
    description: 'Books, labs, and classroom tech'
  },
  { 
    title: 'Institutional Marketing', 
    icon: Megaphone,
    color: 'oklch(0.78 0.18 75)',
    description: 'Brand awareness and digital ad spend'
  },
]

export default function EconomicsPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20">
      {/* 1. Master Ledger Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
             Institutional Economics
          </h1>
          <p className="font-sans text-[10px] tracking-[0.3em] font-black uppercase opacity-30">
             Financial Performance // Term Cycle • 2026
          </p>
        </div>

        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-10 px-5 rounded-xl gap-3 border-primary/10 bg-card hover:bg-primary/5 transition-premium font-bold tracking-tight text-sm">
              <Download className="w-3.5 h-3.5 opacity-40" />
              Download Ledger
           </Button>
           <Button className="h-10 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-premium font-bold tracking-tight text-sm">
              New Expenditure
           </Button>
        </div>
      </div>

      {/* 2. Global Balance Horizon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
         <Card className="lg:col-span-2 overflow-hidden border-primary/5 shadow-sm bg-card/60 backdrop-blur-xl flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-primary/5 px-8 py-6">
               <div className="space-y-1">
                  <CardTitle className="font-serif text-xl font-bold">Expenditure Velocity</CardTitle>
                  <CardDescription className="text-[9px] uppercase tracking-widest font-black opacity-30">Term-based cumulative spend trend</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 animate-pulse">
                  <TrendingUp className="w-8 h-8 text-primary opacity-20" />
               </div>
               <div className="space-y-1">
                  <p className="font-serif text-lg font-bold opacity-40">Calculating Term Trend</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-20">System ready // Waiting for data flow</p>
               </div>
            </CardContent>
         </Card>

         <Card className="border-primary/5 bg-primary shadow-[0_40px_100px_-30px_rgba(var(--primary),0.35)] text-primary-foreground relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110 duration-1000" />
            <CardHeader className="px-8 py-6">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Total Managed Capital</span>
               <CardTitle className="font-serif text-3xl font-bold tracking-tight">Rs. 0.00</CardTitle>
               <div className="flex items-center gap-2 mt-4 inline-flex px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  Calculated against Term target
               </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 mt-2 space-y-6">
               <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-60">
                     <span>Budget Utilization</span>
                     <span>0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-white/20 w-1/12" />
                  </div>
               </div>
               <p className="text-xs opacity-60 font-medium leading-relaxed font-serif">
                  Institutional integrity begins with financial transparency. Our economic model remains resilient through strategic term-based allocation.
               </p>
            </CardContent>
         </Card>
      </div>

      {/* 3. Categorical breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {categories.map((cat, idx) => (
            <motion.div
               key={cat.title}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * idx, duration: 0.6 }}
               className="h-full"
            >
               <Card className="hover-lift transition-premium border-primary/5 shadow-sm group h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                     <div className="flex items-center justify-between mb-6">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-500"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                           <cat.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black tracking-widest bg-muted/20 text-muted-foreground/40">
                           NO DATA
                        </div>
                     </div>
                     <div className="space-y-0.5 mb-6">
                        <h4 className="font-serif font-bold text-base text-foreground/90">{cat.title}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{cat.description}</p>
                     </div>
                     <div className="mt-auto flex items-baseline gap-2">
                        <span className="text-xl font-serif font-bold tracking-tight opacity-20">Rs. 0.00</span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-10">Audit Pending</span>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         ))}
      </div>

      {/* 4. Chronological Ledger */}
      <Card className="border-primary/5 shadow-sm bg-card/60 backdrop-blur-xl">
         <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="font-serif text-xl font-bold">Financial Transactions</CardTitle>
               <CardDescription className="text-[9px] uppercase tracking-widest font-black opacity-30">Real-time expenditure audit feed</CardDescription>
            </div>
         </CardHeader>
         <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
               <Database className="w-6 h-6 text-primary opacity-20" />
            </div>
            <div className="space-y-1">
               <p className="font-serif text-base font-bold opacity-30">Ledger Empty</p>
               <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-10">Historical data will appear upon synchronization</p>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
