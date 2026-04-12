'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  List, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Package,
  Users,
  Building,
  Briefcase,
  Filter,
  DollarSign,
  ArrowUpRight,
  Clock,
  History,
  Activity
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart as RePieChart
} from 'recharts'
import { useData } from '@/contexts/data-context'
import { EXPENDITURE_CATEGORIES } from '@/lib/registry'
import {
  getTrimesters,
  getDateRangeFromFilterKey,
  type TrimesterSeason,
} from '@/lib/trimesters'
import { format, isSameDay, isSameWeek, isSameMonth, subDays } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { SafeDate } from '@/components/shared/safe-date'
import { TrimesterBanner } from '@/components/shared/trimester-banner'

type TimePeriod = 'all' | 'today' | 'week' | 'month' | 'spring' | 'summer' | 'autumn' | 'winter'

export default function EconomicsPage() {
  const hasMounted = useHasMounted()
  const { economics, addExpenditure, isInitialized } = useData()
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', description: '' })
  const [periodFilter, setPeriodFilter] = useState<TimePeriod>('all')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const currentYear = new Date().getFullYear()
  
  const trimesters = getTrimesters(currentYear)

  // Human-readable label for the active period (used in exports)
  const periodLabel = (() => {
    if (periodFilter === 'all') return 'FULL HISTORY'
    if (periodFilter === 'today') return 'TODAY'
    if (periodFilter === 'week') return 'THIS WEEK'
    if (periodFilter === 'month') return 'THIS MONTH'
    const t = trimesters.find(t => t.filterKey === periodFilter)
    return t ? t.label.toUpperCase() : periodFilter.toUpperCase()
  })()

  // Filtered Data Calculations
  const filteredTransactions = (() => {
    if (!economics?.transactions) return []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const week = now.getTime() - 7 * 24 * 60 * 60 * 1000
    const month = now.getTime() - 30 * 24 * 60 * 60 * 1000

    // Check if the filter key is a trimester season
    const trimesterRange = getDateRangeFromFilterKey(periodFilter, currentYear)

    return economics.transactions.filter((tx: any) => {
      const txDate = new Date(tx.date).getTime()
      if (periodFilter === 'all') return true
      if (periodFilter === 'today') return txDate >= today
      if (periodFilter === 'week') return txDate >= week
      if (periodFilter === 'month') return txDate >= month
      if (trimesterRange) {
        return txDate >= trimesterRange.start.getTime() && txDate <= trimesterRange.end.getTime()
      }
      return true
    })
  })()

  const periodStats = (() => {
    const inflow = filteredTransactions
      .filter(tx => tx.type === 'Credit')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const outflow = filteredTransactions
      .filter(tx => tx.type === 'Debit')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const net = inflow - outflow
    const count = filteredTransactions.length

    return { inflow, outflow, net, count }
  })()




  const categoryIcons: Record<string, any> = {
    'Salaries': Users,
    'Supplies': Package,
    'Marketing': TrendingUp,
    'Infrastructure': Building,
    'Utilities': Briefcase,
    'Other': List
  }

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return
    
    try {
      await addExpenditure({
        amount: Number(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: new Date()
      })
      toast.success("Expenditure recorded.")
      setIsAddExpenseOpen(false)
      setNewExpense({ amount: '', category: '', description: '' })
    } catch (error) {
      toast.error("Failed to record expenditure.")
    }
  }

  const handleExportCSV = () => {
    if (!filteredTransactions) return
    const headers = ["Date", "Log ID", "Entity", "Category", "Description", "Type", "Amount"]
    const rows = (filteredTransactions || []).map((tx: any) => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.id,
      tx.person,
      tx.category,
      tx.description,
      tx.type,
      tx.amount
    ])
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + (rows || []).map((e: any) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Economics_Registry_${periodFilter}_${format(new Date(), 'yyyy_MM_dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV Audit Ledger exported.")
  }

  const handleExportPDF = () => {
    if (!filteredTransactions) return
    const doc = new jsPDF() as any
    const title = "THE LEARNER'S ACADEMY - INSTITUTIONAL AUDIT LEDGER"
    const date = `Generated on: ${format(new Date(), 'PPPP')} | View: ${periodLabel}`
    
    doc.setFont("times", "normal")
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(date, 14, 30)
    
    doc.setFillColor(245, 245, 245)
    doc.rect(14, 40, 182, 35, 'F')
    doc.setTextColor(0)
    doc.setFontSize(12)
    doc.text(`${periodLabel} CAPITAL SUMMARY`, 18, 48)
    doc.setFontSize(10)
    doc.text(`Total Period Earning: Rs. ${periodStats.inflow.toLocaleString()}`, 18, 56)
    doc.text(`Total Period Spending: Rs. ${periodStats.outflow.toLocaleString()}`, 18, 63)
    doc.text(`Net Institutional Margin: Rs. ${periodStats.net.toLocaleString()}`, 18, 70)
    
    const tableHeaders = [["DATE", "ENTITY", "CATEGORY", "TYPE", "AMOUNT"]]
    const tableData = (filteredTransactions || []).map((tx: any) => [
      format(new Date(tx.date), 'MMM d, yyyy'),
      tx.person,
      tx.category,
      tx.type,
      `Rs. ${tx.amount.toLocaleString()}`
    ])
    
    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 85,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], fontSize: 9, cellPadding: 4 },
      styles: { fontSize: 8, font: "helvetica", cellPadding: 3 },
      columnStyles: { 4: { halign: 'right' } }
    })
    doc.save(`Economics_Audit_${periodFilter}_${format(new Date(), 'yyyy_MM_dd')}.pdf`)
    toast.success("Branded PDF Registry generated.")
  }

  const pieData = Object.entries(economics?.categoryBreakdown || {}).map(([name, value]: [string, any]) => ({ name, value }))

  const transactionColumns: Column<any>[] = [
    {
      label: 'Log ID',
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 flex items-center justify-center text-[10px] tracking-widest font-normal transition-all",
            tx.type === 'Credit' ? "bg-success/5 text-success border border-success/10" : "bg-destructive/5 text-destructive border border-destructive/10"
          )}>
            {tx.type === 'Credit' ? 'CR' : 'DB'}
          </div>
          <div>
            <p className="text-xs font-normal text-foreground leading-none mb-1">
              <SafeDate date={tx.date} formatStr="MMM d, yyyy" />
            </p>
            <p className="text-[10px] text-muted-foreground opacity-40 font-normal tracking-wider">{(tx?.id || 'TX-ID-TBC').substring(0, 12)}</p>
          </div>
        </div>
      ),
      width: '200px'
    },
    { label: 'Entity Identifier', render: (tx) => <span className="text-xs font-normal opacity-60 text-foreground">{tx.person}</span> },
    { label: 'Asset Category', render: (tx) => <Badge variant="outline" className="text-[10px] px-3 py-0.5 font-normal opacity-70 uppercase tracking-widest">{tx.category}</Badge> },
    { label: 'Description', render: (tx) => <span className="text-[11px] text-muted-foreground font-normal opacity-80 leading-tight">{tx.description}</span> },
    { label: 'Amount', render: (tx) => (
      <span className={cn("font-serif text-lg font-medium tracking-tight", tx.type === 'Credit' ? "text-success" : "text-foreground")}>
        {tx.type === 'Credit' ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
      </span>
    )}
  ]

  const cardData = [
    { label: 'Period Earnings', value: periodStats.inflow, sub: 'Total Inflow (Credits)', icon: TrendingUp, color: 'text-success' },
    { label: 'Period Spending', value: periodStats.outflow, sub: 'Total Outflow (Debits)', icon: TrendingDown, color: 'text-destructive' },
    { label: 'Net Institutional Margin', value: periodStats.net, sub: 'Operating Result', icon: DollarSign, color: 'text-primary' },
    { label: 'Protocol Volume', value: periodStats.count, sub: 'Transactions Logged', icon: Activity, color: 'text-indigo-400', isCount: true }
  ]

  

  return (
    <PageShell>
      <PageHeader 
        title="Economics Ledger"
        description="Comprehensive audit of institutional capital deployment, operational costs, and faculty expenditure tracking."
        actions={
          <div className="flex items-center gap-4">
             <Select value={periodFilter} onValueChange={(v: TimePeriod) => setPeriodFilter(v)}>
              <SelectTrigger className="w-[200px] h-11 text-xs font-normal border-primary/10 shadow-sm">
                <SelectValue placeholder="Analyze Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full Audit History</SelectItem>
                <SelectItem value="today">Daily Pulse (Today)</SelectItem>
                <SelectItem value="week">Weekly Velocity</SelectItem>
                <SelectItem value="month">Monthly Volume</SelectItem>
                <SelectSeparator className="opacity-10" />
                {trimesters.map(t => (
                  <SelectItem key={t.filterKey} value={t.filterKey}>
                    {t.label} &nbsp;·&nbsp; {t.range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Plus className="w-4 h-4 mr-3 opacity-60" /> Log Outflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] border-white/10 glass-3">
                <DialogHeader className="p-10 pb-0">
                  <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Record Asset Outflow</DialogTitle>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-normal opacity-40 mt-2">Fiscal Institutional Entry Protocol</p>
                </DialogHeader>
                <div className="p-10 pt-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Capital Amount (Rs.)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 font-normal">Rs.</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-12 h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Asset Category</label>
                    <Select onValueChange={(val) => setNewExpense({...newExpense, category: val})}>
                      <SelectTrigger className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl">
                        <SelectValue placeholder="Select classification..." />
                      </SelectTrigger>
                      <SelectContent className="p-1.5">
                        {(EXPENDITURE_CATEGORIES || []).map(cat => (
                          <SelectItem key={cat} value={cat} className="py-3 cursor-pointer">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-2 ml-1">Audit Justification</label>
                    <Input 
                      placeholder="Functional description..." 
                      className="h-12 bg-background/30 border-white/5 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter className="p-10 pt-2 gap-3 flex flex-col sm:flex-row">
                  <Button variant="ghost" className="rounded-xl flex-1 font-normal opacity-60 hover:opacity-100" onClick={() => setIsAddExpenseOpen(false)}>Ignore</Button>
                  <Button className="rounded-xl flex-1 font-normal bg-primary text-primary-foreground shadow-xl shadow-primary/20" onClick={handleAddExpense}>Process Transaction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 font-normal transition-all hover:bg-primary/5 border-primary/10">
                  <Download className="w-4 h-4 mr-3 opacity-40" /> Export Registry
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Audit Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-5" />
                <DropdownMenuItem onClick={handleExportCSV} className="gap-3 cursor-pointer py-3 focus:bg-primary/5 font-normal">
                  <FileSpreadsheet className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs">Export as CSV Ledger</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-3 cursor-pointer py-3 focus:bg-primary/5 font-normal">
                  <FileText className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs">Export as PDF Registry</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <EntityCardGrid 
        data={cardData}
        renderItem={(stat, i) => (
          <Card key={i} className="hover-lift transition-premium bg-gradient-to-br from-background to-primary/[0.01] border-primary/5">
            <CardContent className="pt-8 pb-6 relative isolate">
              <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-4">{stat.label}</p>
              <h3 className={cn("font-serif text-2xl font-medium tracking-tight mb-4", stat.color)}>
                {stat.isCount ? stat.value : `Rs. ${stat.value.toLocaleString()}`}
              </h3>
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full ", stat.color.replace('text-', 'bg-'))} />
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-normal opacity-40">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        )}
        columns={4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
        <Card className="glass-1 lg:col-span-2 overflow-hidden rounded-2xl shadow-premium transition-premium h-full flex flex-col border-primary/5">
          <CardHeader className="bg-muted/5 border-b p-8 flex flex-row items-center justify-between">
            <div>
                <h3 className="font-serif text-xl font-medium">Outflow Visualization</h3>
                <p className="text-xs text-muted-foreground font-normal opacity-60">Expenditure velocity over the trailing 6-month cycle.</p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-primary/20 border border-primary/30 rounded-sm" />
                    <span className="text-[10px] opacity-40">Debit</span>
                 </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-12 flex-1">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economics?.historicalData || []}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.05} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.4 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.9)', 
                      borderRadius: '16px', border: '1px solid hsl(var(--primary) / 0.08)',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="expenditure" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium h-full flex flex-col border-primary/5 text-center p-8">
            <div className="mx-auto w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <History className="w-6 h-6 text-primary opacity-40" />
            </div>
            <h3 className="font-serif text-xl font-medium tracking-tight">Period Net Flow</h3>
            <p className="text-xs text-muted-foreground font-normal opacity-50 mt-2">Institutional result for the selected range.</p>
            
            <div className="flex-1 flex flex-col items-center justify-center py-8">
                <span className={cn(
                    "font-serif text-5xl font-normal leading-none",
                    periodStats.net >= 0 ? "text-success" : "text-destructive"
                )}>
                    {periodStats.net >= 0 ? '+' : ''}
                    {Math.round(periodStats.net / 1000)}k
                </span>
                <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-[0.3em] font-normal mt-6">Institutional Margin</span>
            </div>

            <div className="pt-8 border-t border-primary/5 space-y-4">
                <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] opacity-40 font-normal uppercase tracking-widest">Inflow Ratio</span>
                    <span className="text-xs font-normal">{(periodStats.inflow / (periodStats.inflow + periodStats.outflow || 1) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-primary/5 h-1.5 overflow-hidden">
                    <div 
                        className="bg-primary h-full transition-all duration-1000" 
                        style={{ width: `${(periodStats.inflow / (periodStats.inflow + periodStats.outflow || 1) * 100)}%` }} 
                    />
                </div>
            </div>
        </Card>
      </div>

      <TrimesterBanner className="mb-8" />

      <EntityDataGrid 
        title="Transaction Registry"
        description={`Displaying records for the window: ${periodLabel}`}
        data={filteredTransactions}
        columns={transactionColumns}
        emptyState={
          <div className="text-center py-32 opacity-20">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-serif text-xl font-normal">No transactional records</p>
            <p className="text-xs mt-2 font-normal">System awaiting chronological data entry</p>
          </div>
        }
      />
    </PageShell>
  )
}
