'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign, 
  BarChart, 
  PieChart, 
  List, 
  ArrowUpRight, 
  ChevronRight,
  Filter,
  Package,
  Users,
  Building,
  Briefcase,
  Download,
  CreditCard,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/*
  Design Rules:
  - No Bold
  - No Italics
  - Premium Editorial Aesthetics
  - Staggered Animations
*/

export default function EconomicsPage() {
  const { economics, addExpenditure, isLoading } = useData()
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', description: '' })

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
    if (!economics?.transactions) return
    
    const headers = ["Date", "Log ID", "Entity", "Category", "Description", "Type", "Amount"]
    const rows = economics.transactions.map((tx: any) => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.id,
      tx.person,
      tx.category,
      tx.description,
      tx.type,
      tx.amount
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Economics_Registry_${format(new Date(), 'yyyy_MM_dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV Audit Ledger exported.")
  }

  const handleExportPDF = () => {
    if (!economics?.transactions) return
    
    const doc = new jsPDF() as any
    const title = "THE LEARNER'S ACADEMY - INSTITUTIONAL AUDIT LEDGER"
    const date = `Generated on: ${format(new Date(), 'PPPP')}`

    doc.setFont("times", "normal")
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(date, 14, 30)

    // KPI Summary
    doc.setFillColor(245, 245, 245)
    doc.rect(14, 40, 182, 35, 'F')
    doc.setTextColor(0)
    doc.setFontSize(12)
    doc.text("CAPITAL SUMMARY", 18, 48)
    doc.setFontSize(10)
    doc.text(`Total Realized Revenue: Rs. ${economics.actualRevenue.toLocaleString()}`, 18, 56)
    doc.text(`Total Operational Expenditure: Rs. ${economics.totalExpenditure.toLocaleString()}`, 18, 63)
    doc.text(`Current Net Margin: Rs. ${economics.netMargin.toLocaleString()}`, 18, 70)

    const tableHeaders = [["DATE", "ENTITY", "CATEGORY", "TYPE", "AMOUNT"]]
    const tableData = economics.transactions.map((tx: any) => [
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

    doc.save(`Economics_Audit_${format(new Date(), 'yyyy_MM_dd')}.pdf`)
    toast.success("Branded PDF Registry generated.")
  }

  if (isLoading || !economics) return null

  const pieData = Object.entries(economics.categoryBreakdown).map(([name, value]: [string, any]) => ({
    name,
    value
  }))

  return (
    <motion.div 
      className="space-y-6"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Header section */}
      <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-normal text-foreground font-normal">
            Institutional Economics
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-normal max-w-2xl opacity-80">
            Comprehensive audit of institutional capital deployment, operational costs, and faculty expenditure tracking.
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl px-8 h-12 font-normal text-xs uppercase tracking-[0.15em] bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="w-4 h-4 mr-3 opacity-60" /> Log Expenditure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card/90 backdrop-blur-3xl border-primary/5 rounded-[2rem] p-10">
              <DialogHeader className="mb-6">
                <DialogTitle className="font-serif text-3xl font-normal">Record Outflow</DialogTitle>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-normal opacity-60">Add a new financial transaction to the ledger.</CardDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal ml-1">Capital Amount (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 font-normal">Rs.</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-12 h-12 bg-muted/20 border-primary/5 rounded-xl font-normal text-sm focus:bg-background"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal ml-1">Asset Category</label>
                  <Select onValueChange={(val) => setNewExpense({...newExpense, category: val})}>
                    <SelectTrigger className="h-12 bg-muted/20 border-primary/5 rounded-xl font-normal text-sm focus:bg-background">
                      <SelectValue placeholder="Select classification..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-primary/5 p-1.5 focus:bg-card">
                      {['Salaries', 'Supplies', 'Marketing', 'Infrastructure', 'Utilities', 'Other'].map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-xl py-3 cursor-pointer">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal ml-1">Audit Description</label>
                  <Input 
                    placeholder="Enter transactional justification..." 
                    className="h-12 bg-muted/20 border-primary/5 rounded-xl font-normal text-sm focus:bg-background"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="mt-10 gap-3">
                <Button variant="ghost" className="rounded-xl font-normal tracking-widest uppercase text-[10px] h-12 opacity-60 hover:opacity-100" onClick={() => setIsAddExpenseOpen(false)}>Ignore</Button>
                <Button className="rounded-xl flex-1 h-12 font-normal text-[10px] uppercase tracking-[0.2em] shadow-premium" onClick={handleAddExpense}>Process Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl px-6 h-12 border-primary/10 font-normal text-xs uppercase tracking-[0.15em] transition-all hover:bg-primary/5">
                <Download className="w-4 h-4 mr-3 opacity-40" /> Export Registry
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-primary/5 shadow-premium p-1.5">
              <DropdownMenuLabel className="text-[8px] uppercase tracking-[0.3em] opacity-40 px-4 py-3 font-normal">Select Format</DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-5" />
              <DropdownMenuItem onClick={handleExportCSV} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-primary/5 font-normal">
                <FileSpreadsheet className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs">Export as CSV Ledger</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-primary/5 font-normal">
                <FileText className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs">Export as PDF Registry</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Main KPI Row */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Projected Portfolio', value: economics.projectedRevenue, sub: 'Total Contractual Value', icon: Building, color: 'text-primary', progress: (economics.actualRevenue / economics.projectedRevenue) * 100 },
          { label: 'Realized Revenue', value: economics.actualRevenue, sub: 'Fees Collected (Actual)', icon: TrendingUp, color: 'text-success', progress: 100 },
          { label: 'Institutional Expenditure', value: economics.totalExpenditure, sub: 'Outflow vs Capital Pool', icon: TrendingDown, color: 'text-destructive', progress: (economics.totalExpenditure / economics.actualRevenue) * 100 },
        ].map((stat, i) => (
          <Card key={i} className="border-primary/5 bg-card/40 backdrop-blur-3xl shadow-premium rounded-[2.5rem] overflow-hidden group relative isolate">
            <div className={cn("absolute inset-x-0 -bottom-1 h-1 transition-all opacity-20", stat.color.replace('text-', 'bg-'))} style={{ width: `${Math.min(stat.progress, 100)}%` }} />
            <CardContent className="pt-10 pb-8 relative">
              <div className="absolute right-8 top-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <stat.icon className="w-20 h-20" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4 font-normal opacity-50">{stat.label}</p>
              <h3 className="font-serif text-3xl font-normal tracking-tight mb-4">
                Rs. {stat.value.toLocaleString()}
              </h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm shadow-black/20", stat.color.replace('text-', 'bg-'))} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-normal opacity-40">{stat.sub}</span>
                </div>
                <span className="text-[10px] font-normal opacity-30 uppercase tracking-widest">{Math.round(stat.progress)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Layer */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenditure Trend */}
        <Card className="lg:col-span-2 border-primary/5 shadow-premium rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/5 border-b border-primary/5 p-8">
            <h3 className="font-serif text-2xl font-normal">Capital Expenditure Velocity</h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal opacity-60">Outflow analysis over the trailing 6-month cycle.</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economics.historicalData}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.05} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, opacity: 0.4 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, opacity: 0.4 }} 
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '16px', 
                      border: '1px solid hsl(var(--primary) / 0.1)',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      fontFamily: 'Helvetica Neue'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenditure" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorExp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categorical Breakdown */}
        <Card className="border-primary/5 shadow-premium rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/5 border-b border-primary/5 p-8 text-center">
            <h3 className="font-serif text-2xl font-normal">Allocation Model</h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal opacity-60">Distribution across institutional categories.</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`oklch(0.62 0.17 ${240 + (index * 40)})`} opacity={1 - (index * 0.15)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'hsl(var(--card))', fontSize: '10px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground opacity-50 font-normal">Total Share</span>
                <span className="font-serif text-2xl font-normal">Rs. {economics.totalExpenditure.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {pieData.map((item, index) => {
                const Icon = categoryIcons[item.name as string] || List
                return (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/5 group-hover:bg-primary/10 transition-all">
                        <Icon className="w-3.5 h-3.5 text-primary opacity-50" />
                      </div>
                      <span className="text-xs font-normal text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-normal tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                      Rs. {item.value.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Log Layer */}
      <motion.div variants={STAGGER_ITEM} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-serif text-xl font-normal text-foreground uppercase tracking-tight">Transaction Registry</h2>
          <div className="flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-normal opacity-50">Descending Chronological Record</span>
            <Button variant="ghost" size="icon" className="h-10 w-10 border border-primary/5 rounded-full hover:bg-primary/5">
              <Filter className="w-4 h-4 opacity-40" />
            </Button>
          </div>
        </div>

        <Card className="border-primary/5 shadow-premium rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10 border-b border-primary/5">
                  <TableRow className="border-none hover:bg-transparent h-16">
                    <TableHead className="w-[180px] text-[10px] uppercase tracking-[0.2em] pl-10 font-normal h-16 text-muted-foreground">Log ID</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-normal h-16 text-muted-foreground">Entity Identifier</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-normal h-16 text-muted-foreground">Curated Category</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-normal h-16 text-muted-foreground">Functional Description</TableHead>
                    <TableHead className="text-right pr-10 text-[10px] uppercase tracking-[0.2em] font-normal h-16 text-muted-foreground">Currency Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {economics.transactions.map((tx: any) => (
                    <TableRow key={tx.id} className="group border-b border-primary/5 hover:bg-primary/[0.01] transition-premium h-20">
                      <TableCell className="pl-10">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] transition-all",
                            tx.type === 'Credit' ? "bg-success/5 text-success border border-success/10" : "bg-destructive/5 text-destructive border border-destructive/10"
                          )}>
                            {tx.type === 'Credit' ? 'CR' : 'DB'}
                          </div>
                          <div>
                            <p className="text-[11px] font-normal text-foreground leading-none mb-1">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                            <p className="text-[8px] uppercase tracking-tighter text-muted-foreground opacity-50 font-normal">{tx.id.substring(0, 12)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-normal uppercase tracking-widest opacity-60 text-foreground">{tx.person}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] px-3 py-0.5 border-primary/5 rounded-full font-normal uppercase tracking-widest opacity-70">
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-normal opacity-80">{tx.description}</span>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <span className={cn(
                          "font-serif text-lg font-normal tracking-tight",
                          tx.type === 'Credit' ? "text-success" : "text-foreground"
                        )}>
                          {tx.type === 'Credit' ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
