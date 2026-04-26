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
    FileText
} from 'lucide-react'
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
import { format } from 'date-fns'
import { cn, getInitials } from '@/lib/utils'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const YEARS = [2024, 2026, 2027, 2028, 2029] // Excluding 2025 as requested

export default function PayrollManagementPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [staffList, setStaffList] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'))
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    
    // Payment Dialog State
    const [payingTeacher, setPayingTeacher] = useState<any>(null)
    const [bonus, setBonus] = useState('0')
    const [deduction, setDeduction] = useState('0')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        loadData()
    }, [selectedMonth, selectedYear])

    const loadData = async () => {
        setIsLoading(true)
        const [statsRes, listRes] = await Promise.all([
            getPayrollStats(selectedMonth, selectedYear),
            getMonthlyPayrollList(selectedMonth, selectedYear)
        ])

        if (statsRes.success) setStats(statsRes.data)
        if (listRes.success) setStaffList(listRes.data)
        setIsLoading(false)
    }

    const handleProcessPayment = async () => {
        if (!payingTeacher) return
        
        setIsProcessing(true)
        const res = await processPayroll({
            teacherId: payingTeacher.id,
            month: selectedMonth,
            year: selectedYear,
            amount: payingTeacher.baseSalary,
            bonus: Number(bonus),
            deductions: Number(deduction)
        })

        if (res.success) {
            toast.success(`Disbursement complete for ${payingTeacher.name}`)
            setPayingTeacher(null)
            loadData()
        } else {
            toast.error(res.error || "Payment protocol failed")
        }
        setIsProcessing(false)
    }

    const filteredStaff = useMemo(() => {
        return staffList.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [staffList, searchQuery])

    if (isLoading && !stats) return <DashboardSkeleton />

    const kpis = [
        { label: 'Institutional Liability', value: `PKR ${stats?.totalLiability?.toLocaleString() || 0}`, sub: 'Monthly Commitment', icon: Wallet, color: 'text-primary' },
        { label: 'Distributed Funds', value: `PKR ${stats?.distributed?.toLocaleString() || 0}`, sub: 'Verified Payouts', icon: Banknote, color: 'text-success' },
        { label: 'Pending Protocols', value: stats?.pendingCount || 0, sub: 'Awaiting Authorization', icon: AlertCircle, color: 'text-warning' },
        { label: 'Staff Capacity', value: stats?.totalStaff || 0, sub: 'Active Personnel', icon: TrendingUp, color: 'text-indigo-400' },
    ]

    const columns: Column<any>[] = [
        {
            label: 'Personnel Profile',
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
            label: 'Base Salary',
            render: (teacher) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">PKR {teacher.baseSalary.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">Standard Rate</span>
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
                title="Personnel Payroll Portal"
                description="Managing institutional disbursements, staff salary audit, and fiscal resource allocation."
                actions={
                    <div className="flex items-center gap-3">
                         <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="h-12 w-40 bg-muted/5 border-primary/10 rounded-2xl glass-1 px-4 text-[10px] font-black uppercase tracking-widest">
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
                            <SelectTrigger className="h-12 w-32 bg-muted/5 border-primary/10 rounded-2xl glass-1 px-4 text-[10px] font-black uppercase tracking-widest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-3 border-primary/10 rounded-2xl">
                                {YEARS.map(y => (
                                    <SelectItem key={y} value={y.toString()} className="text-[10px] uppercase font-bold tracking-widest">{y}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <Button variant="outline" className="h-12 px-6 rounded-2xl border-primary/10 glass-1 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">
                            <Download className="w-4 h-4 mr-2" /> Export
                         </Button>
                    </div>
                }
            />

            <div className="mt-8">
                <EntityCardGrid 
                    data={kpis}
                    renderItem={(item, i) => (
                        <Card key={i} className="hover-lift transition-premium h-full flex flex-col overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                                <item.icon className="w-16 h-16" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-8">
                                <CardTitle className="text-muted-foreground opacity-60 text-lg font-serif font-medium uppercase tracking-wider">
                                    {item.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 flex-1">
                                <div className="text-4xl font-serif font-normal">{item.value}</div>
                                <div className="flex items-center gap-2 mt-3 opacity-40">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", item.color.replace('text-', 'bg-'))} />
                                    <span className="text-[11px] text-muted-foreground font-medium tracking-wide">{item.sub}</span>
                                </div>
                            </CardContent>
                        </Card>
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
                <DialogContent className="sm:max-w-[480px] glass-3 border-white/10 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <div className="p-10 space-y-10">
                        <DialogHeader className="space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <DialogTitle className="font-serif text-3xl font-medium tracking-tight">Authorize Disbursement</DialogTitle>
                            <DialogDescription className="text-sm opacity-60 leading-relaxed font-normal">
                                Finalize salary distribution for <span className="font-bold text-foreground opacity-100">{payingTeacher?.name}</span> for the month of {selectedMonth}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 bg-muted/10 p-8 rounded-[2rem] border border-primary/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Base Salary</span>
                                <span className="text-xl font-serif">PKR {payingTeacher?.baseSalary?.toLocaleString()}</span>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Incentive / Bonus</Label>
                                    <Input 
                                        type="number" 
                                        value={bonus}
                                        onChange={(e) => setBonus(e.target.value)}
                                        className="h-12 px-5 bg-background border-primary/10 rounded-xl focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-30 ml-1">Deductions</Label>
                                        <span className="text-[9px] text-warning font-bold uppercase tracking-widest opacity-60">
                                            {payingTeacher?.absentCount} Absents Detected
                                        </span>
                                    </div>
                                    <Input 
                                        type="number" 
                                        value={deduction}
                                        onChange={(e) => setDeduction(e.target.value)}
                                        className="h-12 px-5 bg-background border-primary/10 rounded-xl focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Net Distribution</span>
                                <span className="text-2xl font-serif text-primary">
                                    PKR {( (payingTeacher?.baseSalary || 0) + Number(bonus) - Number(deduction) ).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button 
                                onClick={handleProcessPayment}
                                disabled={isProcessing}
                                className="w-full h-16 bg-primary hover:bg-primary/95 rounded-[1.75rem] shadow-2xl shadow-primary/20 transition-all font-black text-[11px] uppercase tracking-[0.2em] group/btn overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isProcessing ? "Synchronizing..." : "Execute Protocol"}
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                </span>
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => setPayingTeacher(null)} 
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                Abort Protocol
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageShell>
    )
}
