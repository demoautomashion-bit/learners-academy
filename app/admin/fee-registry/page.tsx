'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Plus
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { format, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, subDays } from 'date-fns'
import { toast } from 'sonner'
import { useTransition } from 'react'

/*
  Design Rules:
  - No Bold
  - No Italics
  - Subtle STAGGERED Animations
  - Editorial Excellence
*/

export default function FeeRegistryPage() {
  const { students, courses, feePayments, recordPayment, addFeeAccount, isInitialized } = useData()

  if (!isInitialized) return <DashboardSkeleton />
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All')
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // --- Calculations ---
  const today = new Date()
  
  const stats = useMemo(() => {
    const daily = feePayments
      .filter(p => p.paymentDate && isSameDay(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)
    
    const weekly = feePayments
      .filter(p => p.paymentDate && isSameWeek(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)
    
    const monthly = feePayments
      .filter(p => p.paymentDate && isSameMonth(new Date(p.paymentDate), today))
      .reduce((sum, p) => sum + p.amountPaid, 0)

    const totalOutstanding = feePayments
      .reduce((sum, p) => sum + (p.totalAmount - p.amountPaid), 0)

    return { daily, weekly, monthly, totalOutstanding }
  }, [feePayments])

  const filteredPayments = useMemo(() => {
    return feePayments?.filter(p => {
      const matchesSearch = p.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.course.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [feePayments, searchQuery, filterStatus])

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      studentId: formData.get('studentId') as string,
      courseId: formData.get('courseId') as string,
      totalAmount: Number(formData.get('totalAmount')),
      initialDeposit: Number(formData.get('initialDeposit')),
    }

    startTransition(async () => {
      try {
        await addFeeAccount(data)
        setIsAddAccountOpen(false)
        toast.success("Academic account initialized.")
      } catch (error) {
        toast.error("Failed to link account.")
      }
    })
  }

  const handleQuickPayment = async (paymentId: string) => {
    const amount = prompt("Enter payment amount (Rs.):")
    if (!amount || isNaN(Number(amount))) return

    startTransition(async () => {
      try {
        await recordPayment(paymentId, Number(amount))
        toast.success("Payment recorded.")
      } catch (error) {
        toast.error("Ledger update failed.")
      }
    })
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Header Area */}
      <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground font-medium">
            Institutional Fee Registry
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-normal max-w-2xl opacity-80 leading-relaxed">
            Administrative ledger for tuition collection, payment scheduling, and real-time financial tracking across all academic sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button className=" font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Add Student Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl overflow-hidden">
              <DialogHeader className="p-8 bg-muted/5 border-b ">
                <DialogTitle className="font-serif text-2xl font-normal">Initiate Academic Account</DialogTitle>
                <DialogDescription className="text-xs   opacity-60">
                  Link an existing student to the financial registry
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6 text-left items-stretch">
                  <div className="space-y-2">
                    <Label className="text-xs   opacity-40 ml-1">Select Student</Label>
                    <Select name="studentId" required>
                      <SelectTrigger className=" h-12  bg-muted/5">
                        <SelectValue placeholder="Registration / UID" />
                      </SelectTrigger>
                      <SelectContent className="  ">
                        {students?.map(s => (
                          <SelectItem key={s.id} value={s.id} className="">
                            {s.name} ({s.studentId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs   opacity-40 ml-1">Academic Level</Label>
                    <Select name="courseId" required>
                      <SelectTrigger className=" h-12  bg-muted/5">
                        <SelectValue placeholder="Enrolled Course" />
                      </SelectTrigger>
                      <SelectContent className="  ">
                        {courses?.map(c => (
                          <SelectItem key={c.id} value={c.id} className="">
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs   opacity-40 ml-1">Total Flexible Fee (Rs.)</Label>
                    <Input name="totalAmount" type="number" required placeholder="0.00" className=" h-12  bg-muted/5 focus:bg-card transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs   opacity-40 ml-1">Initial Deposit (Rs.)</Label>
                    <Input name="initialDeposit" type="number" defaultValue={0} className=" h-12  bg-muted/5 focus:bg-card transition-all" />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isPending} className="w-full  font-normal shadow-lg">
                    {isPending ? 'Syncing...' : 'Authorize Registration'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Metric Cards - Daily, Weekly, Monthly */}
      <motion.div variants={STAGGER_ITEM} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {[
          { label: 'Daily Collection', value: stats.daily, info: 'Today', icon: Clock, color: 'text-primary' },
          { label: 'Weekly Velocity', value: stats.weekly, info: 'Current Week', icon: ArrowUpRight, color: 'text-success' },
          { label: 'Monthly Volume', value: stats.monthly, info: 'Current Month', icon: DollarSign, color: 'text-primary' },
          { label: 'Total Outstanding', value: stats.totalOutstanding, info: 'Uncollected', icon: AlertCircle, color: 'text-destructive' },
        ].map((stat, i) => (
          <Card key={i} className="    hover-lift transition-premium">
            <CardContent className="pt-8 pb-7 flex-1">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10  bg-primary/5 flex items-center justify-center border ">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-xs   text-muted-foreground mb-2 font-normal opacity-60">{stat.label}</p>
                  <h3 className="font-serif mb-3 text-xl font-serif font-medium">
                    Rs. {stat.value.toLocaleString()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 font-normal opacity-70  ">{stat.info}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Registry Table */}
      <motion.div variants={STAGGER_ITEM} className="space-y-6">
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-6">
            <h2 className="font-serif text-2xl text-foreground font-medium">Student Accounts</h2>
            <div className="flex gap-1 bg-muted/20 p-1  border ">
              {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={cn(
                    "px-4 py-1.5 text-xs    transition-all font-normal",
                    filterStatus === status 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <Input
              placeholder="Search registry entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-muted/10   focus:bg-background transition-all font-normal text-sm"
            />
          </div>
        </div>

        <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
          <CardContent className="p-6 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5 h-16 border-b ">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="w-[280px] text-xs   pl-10 font-normal text-muted-foreground opacity-60">Name</TableHead>
                    <TableHead className="text-xs   font-normal text-muted-foreground opacity-60">Class</TableHead>
                    <TableHead className="text-xs   font-normal text-muted-foreground opacity-60">ID & Timing</TableHead>
                    <TableHead className="text-xs   font-normal text-muted-foreground opacity-60">Status</TableHead>
                    <TableHead className="text-xs   font-normal text-muted-foreground opacity-60 w-[240px]">Dues (Rs.)</TableHead>
                    <TableHead className="text-right pr-10 text-xs   font-normal text-muted-foreground opacity-60">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-32 opacity-30">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-serif text-xl font-normal">No registry entries found</p>
                        <p className="text-xs   mt-2 font-normal">System awaiting transactional data</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments?.map((entry) => {
                      const balance = entry.totalAmount - entry.amountPaid
                      const progress = (entry.amountPaid / entry.totalAmount) * 100

                      return (
                        <TableRow key={entry.id} className="group border-b  hover:bg-primary/[0.02] transition-premium h-20">
                          <TableCell className="pl-10">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border  shadow-sm group-hover:scale-105 transition-transform">
                                <AvatarImage src={entry.student.avatar} />
                                <AvatarFallback className="text-xs bg-primary/5 text-primary font-normal">
                                  {entry.student.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-normal text-foreground leading-none mb-1">{entry.student.name}</p>
                                <p className="text-xs   text-muted-foreground font-normal">ID: {entry.student.studentId || 'GEN-ST'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-normal text-foreground leading-tight">{entry.course.title}</span>
                              <span className="text-xs   text-primary/70 font-normal mt-1 opacity-70">{entry.course.level}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs font-normal text-foreground">{entry.student.studentId || 'GEN-ST'}</span>
                              <div className="flex items-center gap-1.5 opacity-50 mt-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span className="text-xs font-normal  ">{entry.student.classTiming || 'TBC'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "inline-flex items-center gap-2.5 px-3.5 py-1.5  text-xs   border border-transparent font-normal transition-all",
                              entry.status === 'Paid' && "bg-success/5 text-success border-success/10",
                              entry.status === 'Partial' && "bg-warning/5 text-warning border-warning/10",
                              entry.status === 'Unpaid' && "bg-destructive/5 text-destructive border-destructive/10"
                            )}>
                              {entry.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 pr-6">
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                  <span className="text-xs font-normal text-foreground leading-none">Paid: {entry.amountPaid.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground   mt-1 opacity-60">Total: {entry.totalAmount.toLocaleString()}</span>
                                </div>
                                {balance > 0 ? (
                                  <span className="text-xs text-destructive font-serif font-normal italic">Rs. {balance.toLocaleString()} Due</span>
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-success opacity-40" />
                                )}
                              </div>
                              <Progress value={progress} className="h-1 bg-muted/30 [&>div]:bg-primary" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-10  hover:bg-primary/5 transition-all">
                                  <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56    p-1.5 overflow-hidden">
                                <DropdownMenuLabel className="text-xs   opacity-40 px-4 py-3 font-normal">Account Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="opacity-5" />
                                <DropdownMenuItem onClick={() => handleQuickPayment(entry.id)} className="gap-3 cursor-pointer py-3  focus:bg-primary/5 transition-all font-normal">
                                  <Plus className="w-4 h-4 text-primary opacity-60" /> <span className="text-xs">Record Contribution</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-3 cursor-pointer py-3  focus:bg-muted font-normal">
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-60" /> <span className="text-xs">Issue Statement</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="opacity-5" />
                                <DropdownMenuItem className="gap-3 cursor-pointer py-3  focus:bg-destructive/5 text-destructive font-normal">
                                  <AlertCircle className="w-4 h-4 opacity-70" /> <span className="text-xs">Send Due Reminder</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
