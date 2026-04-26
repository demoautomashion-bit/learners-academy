'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
    Coins, 
    Search, 
    Filter, 
    Download, 
    CreditCard, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    ArrowRight,
    Plus,
    Calendar,
    Wallet,
    History,
    Banknote,
    FileText,
    RefreshCw
} from 'lucide-react'
import { useHasMounted } from '@/hooks/use-has-mounted'
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
import { getPayrollStats, getMonthlyPayrollList, processPayroll } from '@/lib/actions/payroll'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { cn, getInitials } from '@/lib/utils'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).filter(y => y !== 2025)

export default function PayrollManagementPage() {
    const hasMounted = useHasMounted()
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [staffList, setStaffList] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'))
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    
    // Payment Dialog State
    const [payingTeacher, setPayingTeacher] = useState<any>(null)
    const [commissionRate, setCommissionRate] = useState('20')
    const [bonus, setBonus] = useState('0')
    const [deduction, setDeduction] = useState('0')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (payingTeacher) {
            setCommissionRate((payingTeacher.commissionRate * 100).toString())
        }
    }, [payingTeacher])

    useEffect(() => {
        if (hasMounted) {
            loadData()
        }
    }, [selectedMonth, selectedYear, hasMounted])

    const loadData = async () => {
        setIsLoading(true)
        
        // Safety Timeout: Force clear loading after 8 seconds if server hangs
        const timeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false)
                toast.error("Institutional Link Unstable", {
                    description: "The database is taking too long to respond. Please try refreshing."
                })
            }
        }, 8000)

        try {
            console.time('payroll-data-fetch')
            const [statsRes, listRes] = await Promise.all([
                getPayrollStats(selectedMonth, selectedYear),
                getMonthlyPayrollList(selectedMonth, selectedYear)
            ])
            console.timeEnd('payroll-data-fetch')

            if (statsRes.success) setStats(statsRes.data)
            if (listRes.success) {
                setStaffList(listRes.data)
            } else {
                toast.error(listRes.error || "Failed to load staff list")
            }
            
            if (!statsRes.success && !listRes.success) {
                toast.error("Payroll intelligence offline")
            }
        } catch (err) {
            console.error("PAYROLL_LOAD_CRITICAL:", err)
            toast.error("Institutional Data Layer Timeout")
        } finally {
            clearTimeout(timeout)
            setIsLoading(false)
        }
    }

    const handleProcessPayment = async () => {
        if (!payingTeacher) return
        
        setIsProcessing(true)
        const rate = Number(commissionRate) / 100
        const baseAmount = payingTeacher.totalRevenue * rate

        const res = await processPayroll({
            teacherId: payingTeacher.id,
            month: selectedMonth,
            year: selectedYear,
            amount: baseAmount,
            bonus: Number(bonus),
            deductions: Number(deduction)
        })

        if (res.success) {
            toast.success(`Salary paid to ${payingTeacher.name}`)
            setPayingTeacher(null)
            loadData()
        } else {
            toast.error(res.error || "Payment failed")
        }
        setIsProcessing(false)
    }

    const exportPayrollPDF = () => {
        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()
            
            // 1. Institutional Branding
            doc.setFillColor(31, 41, 55)
            doc.rect(0, 0, pageWidth, 40, 'F')
            
            doc.setFillColor(255, 255, 255)
            doc.circle(23, 20, 11, 'F')
            
            try {
                doc.addImage('/images/logo.png', 'PNG', 15, 12, 16, 16)
            } catch (e) {}

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text("THE LEARNERS ACADEMY", 42, 18)
            
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text("Institutional Payroll Registry & Salary Audit", 42, 24)
            doc.text("Suzuki Stop, Sara-Kharbar, Mominabad, Alamdar Road.", 42, 28)

            doc.setTextColor(40)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(`PAYROLL SUMMARY: ${selectedMonth.toUpperCase()} ${selectedYear}`, 15, 55)
            
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 61)

            const tableData = staffList.map(t => {
                const net = t.record ? (t.record.amount + t.record.bonus - t.record.deductions) : 0
                return [
                    t.employeeId,
                    t.name,
                    t.totalStudents,
                    `PKR ${t.totalRevenue.toLocaleString()}`,
                    t.record ? `${(t.record.amount / t.totalRevenue * 100).toFixed(0)}%` : `${(t.commissionRate * 100)}%`,
                    t.record ? `PKR ${net.toLocaleString()}` : 'PENDING',
                    t.record ? 'PAID' : 'AWAITING'
                ]
            })

            autoTable(doc, {
                startY: 70,
                head: [['ID', 'Personnel Name', 'Students', 'Revenue', 'Rate', 'Net Salary', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8 },
                styles: { fontSize: 7.5, cellPadding: 5 }
            })

            doc.save(`Payroll_${selectedMonth}_${selectedYear}.pdf`)
            toast.success("Payroll Audit Exported")
        } catch (err) {
            toast.error("Export Failed")
        }
    }

    const filteredStaff = useMemo(() => {
        return staffList.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [staffList, searchQuery])

    if (!hasMounted) return null
    if (isLoading && !stats) return <DashboardSkeleton />

    const kpis = [
        { label: 'Monthly Payroll', value: `PKR ${stats?.totalLiability?.toLocaleString() || 0}`, sub: 'Budgeted Salary', icon: Wallet, color: 'text-indigo-400', gradient: 'from-indigo-500/10 to-transparent' },
        { label: 'Paid Amount', value: `PKR ${stats?.distributed?.toLocaleString() || 0}`, sub: 'Funds Disbursed', icon: CheckCircle2, color: 'text-success', gradient: 'from-success/10 to-transparent' },
        { label: 'Pending Payments', value: stats?.pendingCount || 0, sub: 'Due This Month', icon: AlertCircle, color: 'text-warning', gradient: 'from-warning/10 to-transparent' },
        { label: 'Staff Count', value: stats?.totalStaff || 0, sub: 'Active Personnel', icon: TrendingUp, color: 'text-primary', gradient: 'from-primary/10 to-transparent' },
    ]

    const columns: Column<any>[] = [
        {
            label: 'Teacher',
            render: (teacher) => (
                <div className="flex items-center gap-4 group">
                    <Avatar className="h-10 w-10 border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{teacher.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-widest">{teacher.employeeId}</span>
                    </div>
                </div>
            ),
            width: '300px'
        },
        {
            label: 'Student Load',
            render: (teacher) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{teacher.totalStudents} Students</span>
                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">Across {teacher.courses.length} Classes</span>
                </div>
            )
        },
        {
            label: 'Potential Revenue',
            render: (teacher) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">PKR {teacher.totalRevenue.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">Total Fees</span>
                </div>
            )
        },
        {
            label: 'Status',
            render: (teacher) => (
                teacher.record ? (
                    <Badge className="bg-success/5 text-success border-success/10 py-1.5 px-4 font-bold tracking-widest text-[9px] rounded-full uppercase">
                        <CheckCircle2 className="w-3 h-3 mr-2" /> Verified Paid
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-warning border-warning/20 bg-warning/5 py-1.5 px-4 font-bold tracking-widest text-[9px] rounded-full uppercase">
                         Awaiting
                    </Badge>
                )
            )
        },
        {
            label: 'Net Distribution',
            render: (teacher) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {teacher.record ? `PKR ${(teacher.record.amount + teacher.record.bonus - teacher.record.deductions).toLocaleString()}` : '--'}
                    </span>
                    {teacher.record?.paidAt && (
                        <span className="text-[9px] text-muted-foreground opacity-50 italic">Paid {format(new Date(teacher.record.paidAt), 'MMM dd')}</span>
                    )}
                </div>
            )
        },
        {
            label: 'Administrative Control',
            render: (teacher) => (
                <div className="flex items-center justify-end">
                    {!teacher.record ? (
                        <Button 
                            onClick={() => {
                                setPayingTeacher(teacher)
                                // Auto-calculate suggested deduction for absents (e.g. 500 per day)
                                setDeduction((teacher.absentCount * 500).toString())
                            }}
                            className="h-10 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase font-black tracking-widest"
                        >
                            Process
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 hover:opacity-100 transition-opacity">
                            <FileText className="w-4 h-4" />
                        </Button>
                    )
                    }
                </div>
            ),
            width: '180px'
        }
    ]

    return (
        <PageShell>
            <PageHeader 
                title="Staff Payroll"
                description="Manage teacher salaries based on student enrollment and commission rates."
                actions={
                    <div className="flex items-center gap-3">
                         <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="h-12 w-40 bg-muted/5 border-primary/10 rounded-2xl glass-1 px-4 text-[10px] font-black uppercase tracking-widest outline-none">
                                <Calendar className="w-4 h-4 mr-2 opacity-40" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-3 border-primary/10 rounded-2xl">
                                {MONTHS.map(m => (
                                    <SelectItem key={m} value={m} className="text-[10px] uppercase font-bold tracking-widest">{m}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                            <SelectTrigger className="h-12 w-32 bg-muted/5 border-primary/10 rounded-2xl glass-1 px-4 text-[10px] font-black uppercase tracking-widest outline-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-3 border-primary/10 rounded-2xl">
                                {YEARS.map(y => (
                                    <SelectItem key={y} value={y.toString()} className="text-[10px] uppercase font-bold tracking-widest">{y}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <Button onClick={exportPayrollPDF} variant="outline" className="h-12 px-6 rounded-2xl border-primary/10 glass-1 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all">
                            <Download className="w-4 h-4 mr-2" /> PDF
                         </Button>
                         <Button onClick={loadData} variant="outline" className="h-12 w-12 rounded-2xl border-primary/10 glass-1 p-0 flex items-center justify-center hover:bg-primary/5">
                            <RefreshCw className={cn("w-4 h-4 opacity-40", isLoading && "animate-spin opacity-100")} />
                         </Button>
                    </div>
                }
            />

            <div className="mt-8">
                <EntityCardGrid 
                    data={kpis}
                    renderItem={(item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group"
                        >
                            <Card className="hover-lift transition-premium h-full flex flex-col overflow-hidden relative border-primary/5 glass-1">
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500", item.gradient)} />
                                <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
                                    <item.icon className={cn("w-16 h-16", item.color)} />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-8 px-8 relative z-10">
                                    <CardTitle className="text-muted-foreground opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">
                                        {item.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 flex-1 relative z-10">
                                    <div className="text-4xl font-serif font-normal group-hover:tracking-tight transition-all duration-300">{item.value}</div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className={cn("h-1 w-4 rounded-full group-hover:w-8 transition-all duration-500", item.color.replace('text-', 'bg-'))} />
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">{item.sub}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    columns={4}
                />
            </div>

            <div className="mt-12">
                <EntityDataGrid 
                    title="Staff Payroll Ledger"
                    description={`Consolidated salary registry for the period of ${selectedMonth} ${selectedYear}.`}
                    data={filteredStaff}
                    columns={columns}
                    actions={
                        <div className="relative w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-20 group-focus-within:opacity-100 transition-opacity" />
                            <Input
                                placeholder="Search personnel registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 h-14 bg-muted/5 focus:bg-background transition-all font-normal text-sm border-none shadow-none rounded-2xl placeholder:opacity-20"
                            />
                        </div>
                    }
                />
            </div>

            {/* Payment Dialog */}
            <Dialog open={!!payingTeacher} onOpenChange={(o) => !o && setPayingTeacher(null)}>
                <DialogContent className="sm:max-w-md glass-3 border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                    <div className="p-6 space-y-6">
                        <DialogHeader className="space-y-2">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <DialogTitle className="font-serif text-xl font-medium tracking-tight">Pay Teacher</DialogTitle>
                            <DialogDescription className="text-[11px] opacity-60 leading-relaxed font-normal">
                                Finalizing salary for <span className="font-bold text-foreground opacity-100">{payingTeacher?.name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 bg-muted/20 p-6 rounded-[1.5rem] border border-primary/5">
                            <div className="grid grid-cols-2 gap-4 border-b border-primary/5 pb-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest opacity-30 block">Students</span>
                                    <span className="text-sm font-bold">{payingTeacher?.totalStudents} Load</span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] uppercase font-black tracking-widest opacity-30 block">Revenue</span>
                                    <span className="text-sm font-bold text-success">PKR {payingTeacher?.totalRevenue?.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Commission Rate (%)</Label>
                                    <Input 
                                        type="number" 
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(e.target.value)}
                                        className="h-10 px-4 bg-background/50 border-primary/10 rounded-lg focus:ring-primary/20 text-sm font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Bonus</Label>
                                        <Input 
                                            type="number" 
                                            value={bonus}
                                            onChange={(e) => setBonus(e.target.value)}
                                            className="h-10 px-4 bg-background/50 border-primary/10 rounded-lg focus:ring-primary/20 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Deductions</Label>
                                        <Input 
                                            type="number" 
                                            value={deduction}
                                            onChange={(e) => setDeduction(e.target.value)}
                                            className="h-10 px-4 bg-background/50 border-primary/10 rounded-lg focus:ring-primary/20 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-primary/10 flex justify-between items-end">
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary opacity-60 mb-1">Final Salary</span>
                                <span className="text-2xl font-serif text-primary">
                                    PKR {( (payingTeacher?.totalRevenue * (Number(commissionRate) / 100)) + Number(bonus) - Number(deduction) ).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button 
                                onClick={handleProcessPayment}
                                disabled={isProcessing}
                                className="w-full h-12 bg-primary hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest group/btn"
                            >
                                {isProcessing ? "Processing..." : "Confirm Payment"}
                                <ArrowRight className="ml-2 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => setPayingTeacher(null)} 
                                className="h-10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageShell>
    )
}
