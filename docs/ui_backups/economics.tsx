'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Building2, 
  BookOpen, 
  Megaphone,
  Download,
  TrendingUp,
  ArrowUpRight,
  Database,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useData } from '@/contexts/data-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function EconomicsPage() {
  const { economics, isLoading, addExpenditure } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newExp, setNewExp] = useState({
    amount: '',
    category: 'Salaries',
    description: ''
  })

  const categories = [
    { title: 'Personnel Salaries', icon: Briefcase, color: 'oklch(0.62 0.17 240)', key: 'Salaries' },
    { title: 'Infrastructure', icon: Building2, color: 'oklch(0.70 0.14 240)', key: 'Infrastructure' },
    { title: 'Academic Supplies', icon: BookOpen, color: 'oklch(0.70 0.17 160)', key: 'Supplies' },
    { title: 'Institutional Marketing', icon: Megaphone, color: 'oklch(0.78 0.18 75)', key: 'Marketing' },
  ]

  const handleAddExpenditure = async () => {
    if (!newExp.amount || !newExp.description) {
      toast.error('Please fill all fields')
      return
    }
    const amount = parseFloat(newExp.amount)
    if (isNaN(amount)) return

    try {
      await addExpenditure({ ...newExp, amount })
      toast.success('Expenditure recorded successfully')
      setIsModalOpen(false)
      setNewExp({ amount: '', category: 'Salaries', description: '' })
    } catch (error) {
      toast.error('Failed to record expenditure')
    }
  }

  const handleDownloadLedger = () => {
    const headers = ["Category", "Description", "Date", "Amount (PKR)"]
    const rows = (economics?.expenditures || []).map((e: any) => [
      e.category, 
      e.description, 
      new Date(e.date).toLocaleDateString(), 
      e.amount
    ])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger_audit_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-20 font-sans">
       <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-widest">Auditing Institutional Ledger...</p>
    </div>
  )

  const stats = economics || {
    totalExpenditure: 0,
    actualRevenue: 0,
    projectedRevenue: 0,
    categoryBreakdown: {},
    expenditures: []
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20 px-2" 
         style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      
      {/* 1. Master Ledger Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Institutional Economics</h1>
          <p className="font-sans text-[10px] tracking-[0.3em] font-black uppercase opacity-30">Financial Performance // Rs. PKR Localization</p>
        </div>

        <div className="flex items-center gap-4 font-sans">
            <Button 
               onClick={handleDownloadLedger}
               variant="outline" 
               className="h-10 px-5 rounded-xl border-primary/10 bg-card hover:bg-primary/5 transition-premium font-bold tracking-tight text-sm gap-2"
            >
               <Download className="w-3.5 h-3.5 opacity-40" />
               Institutional Audit
            </Button>
           <Button 
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-premium font-bold tracking-tight text-sm gap-2"
           >
              <Plus className="w-4 h-4" />
              Record Expenditure
           </Button>
        </div>
      </div>

      {/* 2. Global Balance Horizon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 overflow-hidden border-primary/5 shadow-sm bg-card/60 backdrop-blur-xl flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-primary/5 px-8 py-6">
               <div className="space-y-1">
                  <CardTitle className="font-serif text-xl font-bold">Expenditure Velocity</CardTitle>
                  <CardDescription className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Term-based cumulative spend trend</CardDescription>
               </div>
               <div className="text-right font-sans">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-none">Total Outflow</p>
                  <p className="font-serif text-xl font-bold opacity-60 leading-none mt-1">Rs. {stats.totalExpenditure.toLocaleString()}</p>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[300px] flex items-center justify-center translate-y-2">
               <div className="flex flex-col items-center gap-4 opacity-10 font-sans">
                  <TrendingUp className="w-12 h-12 text-primary" />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black">Expenditure Velocity Analysis Active</p>
               </div>
               {/* Logic-driven trend bars */}
               <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between h-20 px-10 gap-4 font-sans">
                  {(stats.historicalData || []).map((data: any, i: number) => {
                    const maxVal = Math.max(...(stats.historicalData || []).map((d: any) => d.expenditure), 100000)
                    const h = data.expenditure > 0 ? Math.min((data.expenditure / maxVal) * 80 + 20, 100) : 10
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${h}%` }} 
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="w-full rounded-t-lg bg-primary/10 group-hover:bg-primary/30 transition-all border-t border-primary/5" 
                        />
                        <span className="text-[8px] font-black uppercase opacity-20">{data.month}</span>
                      </div>
                    )
                  })}
               </div>
            </CardContent>
         </Card>

         <Card className="border-primary/5 bg-primary shadow-[0_40px_100px_-30px_rgba(var(--primary),0.35)] text-primary-foreground relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110 duration-1000" />
            <CardHeader className="px-8 py-6 pb-2">
               <span className="font-sans text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 leading-none">Actual Collected Revenue</span>
               <CardTitle className="font-serif text-3xl font-bold tracking-tight">Rs. {stats.actualRevenue.toLocaleString()}</CardTitle>
               <div className="font-sans flex items-center gap-2 mt-4 inline-flex px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  Net Institutional Balance
               </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 mt-4 space-y-6">
               <div className="space-y-1.5 pt-4">
                  <div className="font-sans flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                     <span>Collection Compliance</span>
                     <span>{stats.projectedRevenue > 0 ? Math.round((stats.actualRevenue / stats.projectedRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-white transition-all duration-1000" 
                        style={{ width: `${stats.projectedRevenue > 0 ? Math.round((stats.actualRevenue / stats.projectedRevenue) * 100) : 0}%` }}
                     />
                  </div>
               </div>
               <div className="pt-2 font-sans">
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1 leading-none">Outstanding Receivables</p>
                  <p className="font-serif text-xl font-bold opacity-80 leading-none">Rs. {(stats.projectedRevenue - stats.actualRevenue).toLocaleString()}</p>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* 3. Categorical breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {categories.map((cat, idx) => {
            const amount = stats.categoryBreakdown[cat.key] || 0
            return (
              <motion.div key={cat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
                 <Card className="hover-lift transition-premium border-primary/5 shadow-sm group h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                       <div className="flex items-center justify-between mb-6">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-500" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                             <cat.icon className="w-5 h-5" />
                          </div>
                          <Badge variant="ghost" className="font-sans text-[9px] font-black uppercase tracking-widest opacity-20 px-2 py-0.5">Audit V1</Badge>
                       </div>
                       <div className="space-y-0.5 mb-6 font-sans">
                          <h4 className="font-serif font-bold text-base text-foreground/90 leading-tight">{cat.title}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Institution Category</p>
                       </div>
                       <div className="mt-auto">
                          <span className="font-serif text-xl font-bold tracking-tight text-foreground/80">Rs. {amount.toLocaleString()}</span>
                       </div>
                    </CardContent>
                 </Card>
              </motion.div>
            )
         })}
      </div>

      {/* 4. Institutional Transaction Ledger */}
      <Card className="border-primary/5 shadow-sm bg-card/60 backdrop-blur-xl">
         <CardHeader className="px-8 py-6 border-b border-primary/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <CardTitle className="font-serif text-xl font-bold">Institutional Ledger</CardTitle>
               <CardDescription className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Real-time consolidated cash flow</CardDescription>
            </div>
            <div className="flex gap-2 font-sans">
               <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-success/20 text-success bg-success/5 px-2 py-0.5">Credit: Fees</Badge>
               <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-destructive/20 text-destructive bg-destructive/5 px-2 py-0.5">Debit: Expenses</Badge>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            {stats.transactions?.length === 0 ? (
               <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 font-sans">
                  <Database className="w-8 h-8 text-primary opacity-20" />
                  <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-10">Historical data synchronized // Registry empty</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="font-sans border-b border-primary/5 bg-muted/5 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                           <th className="px-8 py-4 text-left">Entity / Source</th>
                           <th className="px-6 py-4 text-left">Description</th>
                           <th className="px-6 py-4 text-left">Date</th>
                           <th className="px-8 py-4 text-right">Adjustment</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-primary/5">
                        {stats.transactions.map((tx: any) => (
                           <tr key={tx.id} className="hover:bg-muted/10 transition-premium group">
                              <td className="px-8 py-6">
                                 <div className="space-y-0.5 font-sans">
                                    <p className="font-serif font-bold text-base text-foreground/80 leading-tight">{tx.person}</p>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/10 opacity-60 px-2 py-0.5">
                                       {tx.category}
                                    </Badge>
                                 </div>
                              </td>
                              <td className="px-6 py-6 font-sans font-medium text-sm text-foreground/60 leading-tight">{tx.description}</td>
                              <td className="font-sans px-6 py-6 text-[10px] font-bold text-muted-foreground/30">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className={cn(
                                 "px-8 py-6 text-right font-serif font-bold text-base",
                                 tx.type === 'Credit' ? "text-success" : "text-destructive/80"
                              )}>
                                 {tx.type === 'Credit' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </CardContent>
      </Card>

      {/* 5. Record Expenditure Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-primary/10 bg-card/95 backdrop-blur-3xl p-8" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          <DialogHeader className="space-y-2 mb-6 text-left">
            <DialogTitle className="font-serif text-2xl font-bold">Audit Outflow</DialogTitle>
            <DialogDescription className="font-sans text-xs tracking-tight">Record institutional expenditure for the current term cycle</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 font-sans">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Category Tier</label>
                <Select value={newExp.category} onValueChange={(v) => setNewExp({...newExp, category: v})}>
                   <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-white/50 text-xs font-bold">
                      <SelectValue placeholder="Select category..." />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl font-sans">
                      {categories.map(c => <SelectItem key={c.key} value={c.key} className="text-xs font-bold">{c.title}</SelectItem>)}
                      <SelectItem value="Other" className="text-xs font-bold">Other Institutional Cost</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Debit Amount (PKR)</label>
                <Input 
                   type="number" 
                   value={newExp.amount}
                   onChange={(e) => setNewExp({...newExp, amount: e.target.value})}
                   placeholder="Enter amount..." 
                   className="h-12 rounded-xl border-primary/10 bg-white/50 font-serif font-bold text-lg"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Capital Justification</label>
                <Input 
                   value={newExp.description}
                   onChange={(e) => setNewExp({...newExp, description: e.target.value})}
                   placeholder="Purpose of spending..." 
                   className="h-12 rounded-xl border-primary/10 bg-white/50 text-xs font-medium"
                />
             </div>
             <div className="flex flex-col gap-3 pt-6">
                <Button onClick={handleAddExpenditure} className="h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-base tracking-tight">
                   Verify and Record Ledger
                </Button>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Cancel Entry</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
