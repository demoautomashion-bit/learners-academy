'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DollarSign,
  Search,
  MoreVertical,
  Plus,
  ArrowUpRight,
  TrendingDown,
  History,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Student } from '@/lib/types'

export default function FeeRegistryPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { students, feePayments, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredStudents = (Array.isArray(students) ? students : []).filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: Column<Student>[] = [
    {
      label: 'Financial Identity',
      render: (student) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(student.name, 'S')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1.5">{student.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">{student.studentId}</span>
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      label: 'Account Status',
      render: (student) => (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold bg-success/5 text-success border-success/20 uppercase tracking-widest py-1 px-3">
                Clear
            </Badge>
            <span className="text-[10px] text-muted-foreground opacity-40 font-normal uppercase tracking-widest">Trimester 2</span>
        </div>
      )
    },
    {
        label: 'Last Inflow',
        render: (student) => (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-serif">PKR 12,000</span>
                <span className="text-[9px] text-muted-foreground opacity-40 uppercase tracking-widest">June 12, 2026</span>
            </div>
        )
    },
    {
      label: 'Oversight',
      render: (student) => (
        <div className="flex items-center gap-4 text-muted-foreground opacity-40">
           <History className="w-4 h-4" />
           <Printer className="w-4 h-4" />
        </div>
      )
    },
    {
      label: 'Actions',
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Fiscal Gateways</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-success/5 text-success font-normal">
              <Plus className="w-4 h-4 opacity-60" /> <span className="text-xs">Record Collection</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <Printer className="w-4 h-4 opacity-60" /> <span className="text-xs">Generate Receipt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal">
              <TrendingDown className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Apply Relief</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Cycle Collection', value: 'PKR 4.2M', sub: 'Active Trimester', icon: TrendingDown, color: 'text-success' },
    { label: 'Outstanding Debt', value: 'PKR 125k', sub: 'Follow-up Required', icon: Clock, color: 'text-warning' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Fee & Fiscal Registry"
        description="Master ledger for student tuition, scholarship allocations, and institutional revenue collection."
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="font-normal border-primary/5 hover:bg-primary/5 h-11">
                <FileText className="w-4 h-4 mr-2 opacity-50" /> Fiscal Summary
             </Button>
             <Button className="font-normal bg-primary shadow-lg shadow-primary/20 h-11">
                Sync Collection Cycle
             </Button>
          </div>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{stat.label}</CardDescription>
                <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 mt-2 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="mt-12">
        <EntityDataGrid 
          title="Consolidated Fee Ledger"
          description="A centralized trace of student account balances and institutional inflows."
          data={filteredStudents}
          columns={columns}
          actions={
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/20 p-1 border rounded-xl overflow-hidden">
                    {['Spring', 'Summer', 'Autumn', 'Winter'].map(t => (
                        <button key={t} className={cn(
                            "px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all",
                            t === 'Summer' ? "bg-white text-primary shadow-sm" : "text-muted-foreground opacity-40 hover:opacity-100"
                        )}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="relative w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Identify student account..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
                    />
                </div>
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">Ledger Empty</p>
              <p className="text-xs mt-2 font-normal">System awaiting student registration synchronization</p>
            </div>
          }
        />
      </div>
    </PageShell>
  )
}
