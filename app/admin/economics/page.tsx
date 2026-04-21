'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
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
  FileText
} from 'lucide-react'
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

  const currentTrimester = useMemo(() => getActiveTrimester(), [])

  // Derived financial data MUST be above any early returns to avoid Error #310
  const financialMetrics = useMemo(() => {
    // Return early if data isn't ready, but keep the hook execution consistent
    if (!isInitialized) return { totalEarnings: 0, totalExpenses: 0, margin: 0, volume: 0 }

    const expensesList = (economics?.logs || [])
    const earningsList = (feePayments || [])

    const expenses = expensesList.filter((log: any) => {
        const rawDate = log.date || log.createdAt
        const d = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const earnings = earningsList.filter((pay: any) => {
        const rawDate = pay.paymentDate || pay.createdAt
        const d = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
    const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + (Number(curr.amountPaid) || 0), 0)
    
    return {
        totalEarnings,
        totalExpenses,
        margin: totalEarnings - totalExpenses,
        volume: totalEarnings + totalExpenses
    }
  }, [economics, feePayments, temporalFilter, currentTrimester, isInitialized])

  // --- END OF HOOKS BLOCK ---

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const handleExport = () => {
    const data = economics?.recentTransactions || []
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
             <Button variant="outline" className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5">
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

      {/* TEMPORAL LENS CONTROLS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/10 border border-primary/5 rounded-2xl glass-2 mt-8 w-fit shrink-0 overflow-x-auto max-w-full no-scrollbar">
          {(['daily', 'weekly', 'monthly', 'seasonal'] as const).map((t) => (
              <button 
                  key={t} 
                  onClick={() => setTemporalFilter(t)}
                  className={cn(
                      "px-6 py-2.5 text-xs text-nowrap font-semibold uppercase tracking-wide transition-all rounded-xl flex items-center gap-2",
                      temporalFilter === t 
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-primary/5"
                  )}
              >
                  {t === 'seasonal' ? `${currentTrimester.season} Cycle` : t}
              </button>
          ))}
      </div>

      <div className="mt-6">
        <EntityCardGrid 
            data={stats}
            renderItem={(stat, i) => (
            <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-md overflow-hidden rounded-[2rem] transition-all group relative isolate">
                 <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
                <CardHeader className="p-6 pb-8">
                    <div className="flex items-center justify-between mb-8">
                        <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</CardDescription>
                        <div className={cn("w-9 h-9 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", stat.color)}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </div>
                    <CardTitle className={cn("text-3xl font-sans font-normal tracking-tight", stat.color)}>{stat.value}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-4 font-medium opacity-60">{stat.sub}</p>
                </CardHeader>
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
                <CardTitle className="font-serif text-2xl font-medium tracking-tight">Expense Trend</CardTitle>
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
                            dataKey="expenses" 
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
                    Your institutional net margin is currently <span className="text-success font-black not-italic px-1 tracking-wider">{stats.netMargin}%</span>.
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
          description="Granular history of all transactional records and fiscal logging."
          data={economics?.logs || []}
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
    </PageShell>
  )
}
