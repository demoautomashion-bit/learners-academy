'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
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
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  History, 
  Filter, 
  Download,
  Plus,
  ShieldCheck,
  Search,
  Activity,
  ArrowRight,
  TrendingDown,
  Calendar,
  Wallet,
  Coins,
  FileText,
  Printer,
  Receipt
} from 'lucide-react'
import Image from 'next/image'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { EXPENDITURE_CATEGORIES } from '@/lib/registry'
import { getActiveTrimester } from '@/lib/trimesters'
import { toast } from 'sonner'
import { format, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns'

type TemporalFilter = 'daily' | 'weekly' | 'monthly' | 'seasonal'

export default function EconomicsAuditorPage() {
  // --- RULE OF HOOKS: ALL HOOKS MUST BE AT THE TOP ---
  const hasMounted = useHasMounted()
  const { economics, feePayments, addExpenditure, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilter>('monthly')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [logData, setLogData] = useState({ amount: '', category: '', description: '' })

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
      contentRef: printRef,
      documentTitle: `Institutional_Economics_Report_${new Date().toISOString().split('T')[0]}`
  })

  const currentTrimester = useMemo(() => getActiveTrimester(), [])

  // Derived financial data MUST be above any early returns to avoid Error #310
  const financialMetrics = useMemo(() => {
    // Return early if data isn't ready, but keep the hook execution consistent
    if (!isInitialized) return { totalEarnings: 0, totalExpenses: 0, margin: 0, volume: 0 }

    const expensesList = (economics?.transactions || []).filter((t: any) => t.type === 'debit')
    const earningsList = (economics?.transactions || []).filter((t: any) => t.type === 'credit')

    const expenses = expensesList.filter((log: any) => {
        const d = typeof log.date === 'string' ? parseISO(log.date) : log.date
        if (!d) return false
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const earnings = earningsList.filter((pay: any) => {
        const d = typeof pay.date === 'string' ? parseISO(pay.date) : pay.date
        if (!d) return false
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
    const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || Number(curr.amountPaid) || 0), 0)
    
    return {
        totalEarnings,
        totalExpenses,
        margin: totalEarnings - totalExpenses,
        volume: totalEarnings + totalExpenses
    }
  }, [economics, temporalFilter, currentTrimester, isInitialized])

  // --- END OF HOOKS BLOCK ---

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleExport = () => {
    const data = economics?.transactions || []
    if (data.length === 0) {
        toast.error("No transaction data available for export.")
        return
    }

    const headers = ["ID", "Category", "Participant", "Amount", "Status", "Date"]
    const csvContent = [
        headers.join(","),
        ...data.map((t: any) => [
            t.id,
            t.category,
            t.participant,
            t.amount,
            t.status,
            t.date
        ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Institutional_Audit_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Audit Exported Successfully", {
        description: "Institutional ledger CSV is ready for review."
    })
  }

  const handleLogExpenditure = async () => {
    if (!logData.amount || !logData.category || !logData.description) {
        toast.error("Incomplete Protocol", { description: "Identify the expenditure amount and category." })
        return
    }

    try {
        await addExpenditure({
            amount: Number(logData.amount),
            category: logData.category,
            description: logData.description,
            date: new Date().toISOString()
        })
        
        setIsDialogOpen(false)
        setLogData({ amount: '', category: '', description: '' })
        toast.success("Outflow Logged")
    } catch (error) {
        toast.error("Log synchronization failed")
    }
  }

  const stats = [
    { 
        label: 'Income', 
        value: `PKR ${financialMetrics.totalEarnings.toLocaleString()}`, 
        sub: 'Fee Collections', 
        icon: ArrowUpRight, 
        color: 'text-success' 
    },
    { 
        label: 'Expenses', 
        value: `PKR ${financialMetrics.totalExpenses.toLocaleString()}`, 
        sub: 'Salaries & Costs', 
        icon: ArrowDownRight, 
        color: 'text-destructive' 
    },
    { 
        label: 'Net Profit', 
        value: `PKR ${financialMetrics.margin.toLocaleString()}`, 
        sub: 'Current Margin', 
        icon: Wallet, 
        color: 'text-primary' 
    },
    { 
        label: 'Total Cashflow', 
        value: `PKR ${financialMetrics.volume.toLocaleString()}`, 
        sub: 'Institutional Volume', 
        icon: Coins, 
        color: 'text-indigo-400' 
    },
  ]

  const columns: Column<any>[] = [
    {
        label: 'Transaction',
        render: (log) => (
            <div className="flex items-center gap-4 group/tx">
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover/tx:scale-110",
                    log.type === 'credit' || !log.type ? "bg-success/5 text-success border-success/10" : "bg-destructive/5 text-destructive border-destructive/10"
                )}>
                    {log.type === 'credit' || !log.type ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{log.description}</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5 opacity-60">REF: {log.id?.slice(-8).toUpperCase() || 'MANUAL'}</span>
                </div>
            </div>
        ),
        width: '350px'
    },
    {
        label: 'Category',
        render: (log) => (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-3 py-1 font-semibold border-primary/20 text-muted-foreground">
                    {log.category || 'Institutional'}
                </Badge>
            </div>
        )
    },
    {
        label: 'Date',
        render: (log) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">{new Date(log.date || log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-xs text-muted-foreground mt-0.5 opacity-60">Record Logged</span>
            </div>
        )
    },
    {
        label: 'Amount',
        render: (log) => (
            <span className={cn(
                "text-base font-sans font-medium",
                (log.type === 'credit' || !log.type) ? "text-success" : "text-destructive"
            )}>
                {(log.type === 'credit' || !log.type) ? '+' : '-'} PKR {log.amount.toLocaleString()}
            </span>
        )
    }
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Economics"
        description="Auditing financial inflows, expenditures, and fiscal growth vectors."
        actions={
          <div className="flex items-center gap-3">
              <Select value={temporalFilter} onValueChange={(v) => setTemporalFilter(v as TemporalFilter)}>
                  <SelectTrigger className="h-11 w-48 bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20 px-4 text-xs font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary opacity-60" />
                          <SelectValue placeholder="Filter Cycle" />
                      </div>
                  </SelectTrigger>
                  <SelectContent className="glass-2 border-white/5">
                      <SelectItem value="daily" className="text-[10px] uppercase tracking-widest font-bold">Daily Cycle</SelectItem>
                      <SelectItem value="weekly" className="text-[10px] uppercase tracking-widest font-bold">Weekly Cycle</SelectItem>
                      <SelectItem value="monthly" className="text-[10px] uppercase tracking-widest font-bold">Monthly Cycle</SelectItem>
                      <SelectItem value="seasonal" className="text-[10px] uppercase tracking-widest font-bold">{currentTrimester.season} Cycle</SelectItem>
                  </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5" onClick={handlePrint}>
                 <Printer className="w-4 h-4 mr-2" /> PDF Report
              </Button>
              <Button variant="outline" className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5" onClick={handleExport}>
                 <FileText className="w-4 h-4 mr-2" /> Audit Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="h-11 px-8 font-medium bg-primary shadow-xl shadow-primary/20 rounded-xl text-white">
                        <Plus className="w-4 h-4 mr-2" /> Log Entry
                    </Button>
                </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                        <div className="p-8 space-y-8">
                            <DialogHeader className="space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Manual Ledger Entry</DialogTitle>
                                <DialogDescription className="text-xs opacity-60 font-normal leading-relaxed">
                                    Sync a manual financial record with the institutional database.
                                </DialogDescription>
                            </DialogHeader>
    
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Amount (PKR)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="0" 
                                        value={logData.amount}
                                        onChange={(e) => setLogData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="h-12 px-6 bg-muted/5 border-primary/5 rounded-2xl font-sans text-lg"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Category</Label>
                                    <Select onValueChange={(v) => setLogData(prev => ({ ...prev, category: v }))}>
                                        <SelectTrigger className="h-12 bg-muted/5 border-primary/5 rounded-2xl px-6">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-2 border-white/5 p-2 rounded-2xl">
                                            {EXPENDITURE_CATEGORIES.map(c => (
                                                <SelectItem key={c} value={c} className="rounded-xl py-3 capitalize text-sm">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Description</Label>
                                    <Input 
                                        placeholder="e.g. Campus Utility Bill" 
                                        value={logData.description}
                                        onChange={(e) => setLogData(prev => ({ ...prev, description: e.target.value }))}
                                        className="h-12 px-6 bg-muted/5 border-primary/5 rounded-2xl font-normal text-sm"
                                    />
                                </div>
                            </div>
    
                            <div className="flex flex-col gap-4 pt-4">
                                <Button 
                                    onClick={handleLogExpenditure}
                                    className="w-full h-14 bg-primary hover:bg-primary/95 rounded-[1.75rem] shadow-2xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3 group/submit"
                                >
                                    Log Transaction <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-2 transition-transform" />
                                </Button>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                 </Dialog>
          </div>
        }
      />

      {/* TEMPORAL LENS CONTROLS - REPLACED BY DROPDOWN IN HEADER */}

      <div className="mt-6">
        <EntityCardGrid 
            data={stats}
            renderItem={(stat, i) => (
              <Card key={i} className="hover-lift transition-premium h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
                  <CardTitle className="text-muted-foreground opacity-60 text-xl font-serif font-medium">
                    {stat.label}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg opacity-60 bg-muted/20")}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-1">
                  <div className="text-3xl font-sans font-normal">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-2 opacity-40">
                    <div className={cn("h-1 w-1 bg-primary/40", stat.color.replace('text-', 'bg-'))} />
                    <span className="text-[10px] text-muted-foreground font-normal">{stat.sub}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            columns={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">
         <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-md h-full flex flex-col relative isolate">
            <div className="absolute top-0 right-0 p-8 z-10">
                <Badge className="bg-destructive/10 text-destructive border-transparent font-semibold text-[10px] uppercase tracking-widest h-auto px-4 py-1.5 rounded-lg">Fiscal Outflow</Badge>
            </div>
            <CardHeader className="p-8 pb-4 border-b border-primary/5">
                <CardTitle className="font-serif text-2xl font-medium tracking-tight capitalize">{temporalFilter === 'seasonal' ? currentTrimester.season : temporalFilter} Expense Trend</CardTitle>
                <CardDescription className="text-xs font-normal opacity-60 mt-1 max-w-sm">Historical expenditure trajectory analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-1 min-h-[440px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={economics?.historicalData || []}>
                        <defs>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card) / 0.98)', 
                                borderRadius: '24px', border: '1px solid hsl(var(--primary) / 0.08)',
                                fontSize: '11px', backdropFilter: 'blur(12px)', padding: '16px',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="expenditure" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorOut)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-md h-full flex flex-col relative isolate">
            <div className="p-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-center text-success mb-10 group-hover:rotate-12 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-medium tracking-tight">Financial Health</h3>
                <p className="text-xs text-muted-foreground mt-8 leading-relaxed font-normal italic opacity-60">
                    Your institutional net margin for the <span className="text-primary font-bold">{temporalFilter === 'seasonal' ? currentTrimester.season : temporalFilter}</span> period is currently <span className="text-success font-black not-italic px-1 tracking-wider">PKR {financialMetrics.margin.toLocaleString()}</span>.
                </p>
                
                <div className="mt-auto space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Net Inflow</span>
                            </div>
                            <span className="text-sm font-sans font-medium text-success">PKR {financialMetrics.totalEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted/10 border border-white/5 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: financialMetrics.volume > 0 ? `${(financialMetrics.totalEarnings / financialMetrics.volume) * 100}%` : '0%' }}
                                className="bg-success h-full shadow-lg shadow-success/20" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center px-1 text-left">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Total Outflow</span>
                            </div>
                            <span className="text-sm font-sans font-medium text-destructive">PKR {financialMetrics.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted/10 border border-white/5 shadow-inner">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: financialMetrics.volume > 0 ? `${(financialMetrics.totalExpenses / financialMetrics.volume) * 100}%` : '0%' }}
                                className="bg-destructive h-full shadow-lg shadow-destructive/20" 
                            />
                        </div>
                    </div>
                </div>
            </div>
         </Card>
      </div>

      <div className="mt-12">
        <EntityDataGrid 
          title="Institutional Ledger"
          description={`Granular history of all transactional records for the current ${temporalFilter === 'seasonal' ? 'trimester' : temporalFilter} cycle.`}
          data={economics?.transactions || []}
          columns={columns}
          actions={
            <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Search ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-none rounded-2xl placeholder:opacity-20"
                />
            </div>
          }
          emptyState={
            <div className="text-center py-32 space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/5">
                    <History className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="space-y-1">
                    <p className="font-serif text-2xl font-medium tracking-tight">Audit Trail Quiescent</p>
                    <p className="text-xs text-muted-foreground opacity-60 italic">Ledger awaiting institutional transactional activity.</p>
                </div>
            </div>
          }
        />
      </div>
      {/* HIDDEN BRANDED PDF REPORT COMPONENT */}
      <div className="hidden">
          <div ref={printRef} className="p-12 bg-white text-black font-sans w-[210mm]">
              {/* Header: Institutional Branding */}
              <div className="flex items-center gap-6 border-b-4 border-primary pb-8 mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 overflow-hidden">
                     {/* Using a styled typography logo as placeholder or real asset if available */}
                     <span className="text-3xl font-black">TLA</span>
                  </div>
                  <div className="flex flex-col">
                      <h1 className="text-3xl font-serif font-black tracking-tighter text-primary">THE LEARNERS ACADEMY</h1>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-60 mt-1">Institutional Financial Audit Registry</p>
                      <div className="flex flex-col gap-0.5 mt-3 text-[10px] opacity-70 font-medium">
                          <span>Address: Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.</span>
                          <span>Contact: +92-3003583286 / +92-3115455533</span>
                      </div>
                  </div>
                  <div className="ml-auto text-right self-start pt-2">
                      <span className="text-[10px] uppercase tracking-widest font-black opacity-30 italic">Confidential Audit</span>
                  </div>
              </div>

              {/* Report Metadata */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="p-5 rounded-2xl bg-muted/5 border border-primary/5">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Audit Context</span>
                      <p className="text-sm font-medium mt-1">{temporalFilter === 'seasonal' ? currentTrimester.season : temporalFilter} Cycle Performance</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/5 border border-primary/5 text-right">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Generation Date</span>
                      <p className="text-sm font-medium mt-1">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
              </div>

              {/* Fiscal Summary Matrix */}
              <div className="grid grid-cols-4 gap-4 mb-10">
                  {[
                      { label: 'Total Inflow', value: `PKR ${financialMetrics.totalEarnings.toLocaleString()}`, color: 'text-success' },
                      { label: 'Total Outflow', value: `PKR ${financialMetrics.totalExpenses.toLocaleString()}`, color: 'text-destructive' },
                      { label: 'Net Surplus', value: `PKR ${financialMetrics.margin.toLocaleString()}`, color: 'text-primary' },
                      { label: 'Fiscal Volume', value: `PKR ${financialMetrics.volume.toLocaleString()}`, color: 'text-black' },
                  ].map((stat, i) => (
                      <div key={i} className="p-4 border border-black/10 rounded-xl">
                          <span className="text-[8px] uppercase tracking-widest font-bold opacity-50">{stat.label}</span>
                          <p className={cn("text-sm font-bold mt-1", stat.color)}>{stat.value}</p>
                      </div>
                  ))}
              </div>

              {/* The Ledger Table */}
              <table className="w-full border-collapse">
                  <thead>
                      <tr className="bg-primary text-white">
                          <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest font-bold">Transaction Description</th>
                          <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest font-bold">Category</th>
                          <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest font-bold">Date</th>
                          <th className="px-4 py-3 text-right text-[9px] uppercase tracking-widest font-bold">Amount (PKR)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {(economics?.transactions || []).map((log: any, i: number) => (
                          <tr key={i} className={cn(
                              "border-b border-black/5",
                              i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"
                          )}>
                              <td className="px-4 py-3 text-[11px] font-medium">{log.description}</td>
                              <td className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold opacity-60">{log.category || 'Institutional'}</td>
                              <td className="px-4 py-3 text-[11px] opacity-70">
                                  {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className={cn(
                                  "px-4 py-3 text-right text-[11px] font-bold",
                                  log.type === 'credit' ? "text-success" : "text-destructive"
                              )}>
                                  {log.type === 'credit' ? '+' : '-'} {log.amount.toLocaleString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              {/* Audit Footer */}
              <div className="mt-12 pt-8 border-t border-dashed border-black/20 flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-widest font-bold opacity-30">Software Verified</span>
                      <span className="text-[9px] font-serif italic font-bold">Nexilumina Solutions Audit Engine</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <div className="w-32 border-b border-black h-8" />
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Institutional Registrar Stamp</span>
                  </div>
              </div>
          </div>
      </div>
    </PageShell>
  )
}
