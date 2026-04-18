'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useMemo } from 'react'
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
  Coins
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
  const hasMounted = useHasMounted()
  const { economics, feePayments, addExpenditure, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilter>('monthly')
  const [isLogOpen, setIsLogOpen] = useState(false)
  
  // Log Form State
  const [logData, setLogData] = useState({
    amount: '',
    category: '',
    description: ''
  })

  // Mock data/calculations for the view
  const currentTrimester = useMemo(() => getActiveTrimester(), [])

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  // Derived financial data based on filter
  const financialMetrics = useMemo(() => {
    const expenses = (economics?.logs || []).filter((log: any) => {
        const d = parseISO(log.date)
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const earnings = (feePayments || []).filter((pay: any) => {
        const d = parseISO(pay.paymentDate || pay.createdAt)
        if (temporalFilter === 'daily') return isSameDay(d, new Date())
        if (temporalFilter === 'weekly') return isSameWeek(d, new Date())
        if (temporalFilter === 'monthly') return isSameMonth(d, new Date())
        return d >= currentTrimester.start && d <= currentTrimester.end
    })

    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0)
    const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + curr.amountPaid, 0)
    
    return {
        totalEarnings,
        totalExpenses,
        margin: totalEarnings - totalExpenses,
        volume: totalEarnings + totalExpenses
    }
  }, [economics, feePayments, temporalFilter, currentTrimester])

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
        
        setIsLogOpen(false)
        setLogData({ amount: '', category: '', description: '' })
        toast.success("Outflow Logged")
    } catch (error) {
        toast.error("Log synchronization failed")
    }
  }

  const stats = [
    { 
        label: 'Gross Institutional Inflow', 
        value: `PKR ${financialMetrics.totalEarnings.toLocaleString()}`, 
        sub: 'Fee Collections & Grants', 
        icon: ArrowUpRight, 
        color: 'text-success' 
    },
    { 
        label: 'Institutional Outflow', 
        value: `PKR ${financialMetrics.totalExpenses.toLocaleString()}`, 
        sub: 'Expenditures & Salaries', 
        icon: ArrowDownRight, 
        color: 'text-destructive' 
    },
    { 
        label: 'Net Momentum', 
        value: `PKR ${financialMetrics.margin.toLocaleString()}`, 
        sub: 'Audit-Ready Margin', 
        icon: Wallet, 
        color: 'text-primary' 
    },
    { 
        label: 'Fiscal Capacity', 
        value: `PKR ${financialMetrics.volume.toLocaleString()}`, 
        sub: 'Total Transactional Density', 
        icon: Coins, 
        color: 'text-indigo-400' 
    },
  ]

  const columns: Column<any>[] = [
    {
        label: 'Fiscal Transaction',
        render: (log) => (
            <div className="flex items-center gap-4 group/tx">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover/tx:scale-110",
                    log.type === 'credit' || !log.type ? "bg-success/5 text-success border-success/10" : "bg-destructive/5 text-destructive border-destructive/10"
                )}>
                    {log.type === 'credit' || !log.type ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{log.description}</span>
                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest font-bold">Ref: {log.id.slice(-8).toUpperCase()}</span>
                </div>
            </div>
        ),
        width: '350px'
    },
    {
        label: 'Institutional Metadata',
        render: (log) => (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] px-3 py-1 font-black opacity-30 uppercase tracking-widest border-primary/10">
                    {log.category || 'Institutional'}
                </Badge>
            </div>
        )
    },
    {
        label: 'Chronology',
        render: (log) => (
            <div className="flex flex-col">
                <span className="text-[11px] font-bold opacity-70">{new Date(log.date || log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[9px] text-muted-foreground opacity-20 uppercase tracking-tighter">Financial Audit Trace</span>
            </div>
        )
    },
    {
        label: 'Magnitude',
        render: (log) => (
            <span className={cn(
                "text-base font-serif font-medium",
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
        title="Institutional Economics Ledger"
        description="Master double-entry audit of all institutional credits, debits, capital deployment, and seasonal growth tracking."
        actions={
            <div className="flex items-center gap-4">
                 <Button variant="outline" className="h-11 px-6 font-normal border-primary/10 rounded-xl glass-2 hover:bg-primary/5">
                    <Download className="w-4 h-4 mr-2 opacity-50" /> Ledger Export
                 </Button>
                 
                 <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-8 font-normal bg-primary shadow-xl shadow-primary/20 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> Log Manual Inflow/Outflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] glass-2 border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                        <div className="p-10 md:p-14 space-y-12">
                            <DialogHeader className="space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Financial Protocol</DialogTitle>
                                <DialogDescription className="text-xs opacity-40 font-normal leading-relaxed">
                                    Formalize a manual entry in the institutional ledger. This will affect net institutional margins instantly.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-8">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Magnitude (PKR)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="0" 
                                        value={logData.amount}
                                        onChange={(e) => setLogData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="h-14 px-6 bg-muted/5 border-primary/5 rounded-2xl font-serif text-lg"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Classification Pool</Label>
                                    <Select onValueChange={(v) => setLogData(prev => ({ ...prev, category: v }))}>
                                        <SelectTrigger className="h-14 bg-muted/5 border-primary/5 rounded-2xl px-6">
                                            <SelectValue placeholder="Identify Category" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-2 border-white/5 p-2">
                                            {EXPENDITURE_CATEGORIES.map(c => (
                                                <SelectItem key={c} value={c} className="rounded-xl py-3 capitalize">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Identity/Description</Label>
                                    <Input 
                                        placeholder="e.g. Utility Invoicing (June)" 
                                        value={logData.description}
                                        onChange={(e) => setLogData(prev => ({ ...prev, description: e.target.value }))}
                                        className="h-14 px-6 bg-muted/5 border-primary/5 rounded-2xl font-normal text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 pt-4">
                                <Button 
                                    onClick={handleLogExpenditure}
                                    className="w-full h-16 bg-primary hover:bg-primary/95 rounded-[1.75rem] shadow-2xl shadow-primary/20 transition-all font-medium flex items-center justify-center gap-3 group/submit"
                                >
                                    Commit Log Entry <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-2 transition-transform" />
                                </Button>
                                <Button variant="ghost" onClick={() => setIsLogOpen(false)} className="text-[10px] uppercase tracking-widest font-black opacity-30 hover:opacity-100">
                                    Retract Entry
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                 </Dialog>
            </div>
        }
      />

      {/* TEMPORAL LENS CONTROLS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/10 border border-primary/5 rounded-2xl glass-2 mt-12 w-fit">
          {(['daily', 'weekly', 'monthly', 'seasonal'] as const).map((t) => (
              <button 
                  key={t} 
                  onClick={() => setTemporalFilter(t)}
                  className={cn(
                      "px-8 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all font-black rounded-xl flex items-center gap-3",
                      temporalFilter === t 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                          : "text-muted-foreground opacity-40 hover:opacity-100 hover:bg-primary/5"
                  )}
              >
                  {t === 'seasonal' ? `${currentTrimester.season} Cycle` : t}
              </button>
          ))}
      </div>

      <div className="mt-8">
        <EntityCardGrid 
            data={stats}
            renderItem={(stat, i) => (
            <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[2rem] transition-all group relative isolate">
                 <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
                <CardHeader className="p-8 pb-10">
                    <div className="flex items-center justify-between mb-8">
                        <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</CardDescription>
                        <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <CardTitle className={cn("text-3xl font-serif font-medium tracking-tight", stat.color)}>{stat.value}</CardTitle>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-30 mt-4 font-bold italic">{stat.sub}</p>
                </CardHeader>
            </Card>
            )}
            columns={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 items-stretch">
         <Card className="lg:col-span-2 glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col relative isolate">
            <div className="absolute top-0 right-0 p-10 z-10">
                <Badge className="bg-destructive/10 text-destructive border-transparent font-black uppercase tracking-widest text-[9px] h-9 px-6 rounded-xl">Outflow Analysis</Badge>
            </div>
            <CardHeader className="p-10 pb-4 border-b border-primary/5">
                <CardTitle className="font-serif text-2xl font-medium tracking-tight">Institutional Outflow Trace</CardTitle>
                <CardDescription className="text-xs font-normal opacity-40 mt-1 max-w-sm">Chronological velocity of expenditures categorized by institutional departments.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 min-h-[440px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={economics?.historicalData || []}>
                        <defs>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--primary))" opacity={0.03} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', opacity: 0.3 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', opacity: 0.3 }} />
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
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorOut)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="glass-1 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col relative isolate">
            <div className="p-12 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-center text-success mb-10 group-hover:rotate-12 transition-transform">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-3xl font-medium tracking-tight">Financial Pulse</h3>
                <p className="text-sm text-muted-foreground mt-8 leading-relaxed font-normal italic opacity-60">
                    Your institution is currently operating at a <span className="text-success font-black not-italic px-1">78%</span> resource optimization rate.
                </p>
                
                <div className="mt-auto space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Net Inflow</span>
                            </div>
                            <span className="text-xs font-serif font-bold text-success">PKR {financialMetrics.totalEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/10 border border-white/5 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(financialMetrics.totalEarnings / financialMetrics.volume) * 100}%` }}
                                className="bg-success h-full shadow-lg shadow-success/20" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center px-1 text-left">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Total Outflow</span>
                            </div>
                            <span className="text-xs font-serif font-bold text-destructive">PKR {financialMetrics.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/10 border border-white/5 shadow-inner">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(financialMetrics.totalExpenses / financialMetrics.volume) * 100}%` }}
                                className="bg-destructive h-full shadow-lg shadow-destructive/20" 
                            />
                        </div>
                    </div>
                </div>
            </div>
         </Card>
      </div>

      <div className="mt-16">
        <EntityDataGrid 
          title="Consolidated Transaction Audit"
          description="Chronological record of every institutional financial log verified by system reconciliation protocols."
          data={economics?.logs || []}
          columns={columns}
          actions={
            <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Search Audit Trail Identification..."
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
                    <p className="text-xs text-muted-foreground opacity-40 italic">Institutional ledger awaiting generational transactional logging.</p>
                </div>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
