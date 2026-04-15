'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  ChevronRight, 
  AlertTriangle,
  LayoutGrid,
  History
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export default function GlobalScheduleHubPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { courses, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const rooms = [
    { id: '301', name: 'Room 301', capacity: 25, type: 'Lecturing' },
    { id: '302', name: 'Room 302', capacity: 20, type: 'Phonetics Lab' },
    { id: '303', name: 'Room 303', capacity: 15, type: 'Focus Group' },
    { id: '304', name: 'Room 304', capacity: 30, type: 'Main Hall' },
  ]

  const stats = [
      { label: 'Room Utilization', value: '72%', sub: 'Institutional Capacity', icon: LayoutGrid, color: 'text-primary' },
      { label: 'Active Sessions', value: courses.length, sub: 'Current Hour', icon: Clock, color: 'text-success' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Schedule Hub"
        description="Master oversight of room allocation, physical logistics, and institutional timing synchronization."
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
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="font-serif text-xl font-medium tracking-tight">Institutional Room Registry</h3>
                <p className="text-xs text-muted-foreground opacity-40 mt-1 font-normal">Auditing physical assets and their associated instructional load.</p>
            </div>
            <div className="relative w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <Input
                    placeholder="Locate physical asset..."
                    className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rooms.map((room) => {
                const assignedBatches = courses.filter(c => c.roomNumber === room.id)
                return (
                    <Card key={room.id} className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden group hover:translate-y-[-2px] transition-all">
                        <div className="p-8 pb-6 flex items-center justify-between border-b border-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{room.name}</span>
                                    <span className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">{room.type}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-normal border-primary/10 opacity-60">CAPACITY: {room.capacity}</Badge>
                        </div>
                        <div className="p-8">
                            <div className="space-y-4">
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Active Assignments</span>
                                {assignedBatches.length === 0 ? (
                                    <div className="py-8 text-center bg-muted/10 rounded-2xl border border-dashed text-xs text-muted-foreground opacity-40 font-normal">
                                        No instructional units assigned to this geometry.
                                    </div>
                                ) : (
                                    assignedBatches.map(batch => (
                                        <div key={batch.id} className="flex items-center justify-between p-4 bg-primary/[0.02] border border-primary/5 rounded-2xl group/item hover:bg-primary/5 transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium">{batch.name}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-40">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{batch.startTime} - {batch.endTime}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/classes/schedule?id=${batch.id}`)}>
                                                <ChevronRight className="w-4 h-4 opacity-20 group-hover/item:opacity-100 transition-opacity" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
      </div>
    </PageShell>
  )
}
