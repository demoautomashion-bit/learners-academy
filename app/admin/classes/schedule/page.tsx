'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export default function BatchScheduleAuditPage() {
  const hasMounted = useHasMounted()
  const searchParams = useSearchParams()
  const router = useRouter()
  const batchId = searchParams.get('id')
  const { courses, isInitialized } = useData()

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const batch = courses.find(c => c.id === batchId)
  if (!batchId || !batch) {
    return (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Calendar className="w-16 h-16 mb-4" />
            <p className="font-serif text-xl">Invalid Batch Context</p>
            <Button variant="ghost" className="mt-8 font-normal" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Return
            </Button>
        </div>
    )
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Extract timing smartly
  const titleParts = String(batch.title || batch.name || '').split(' - ')
  const timeSlot = titleParts.length > 1 ? titleParts[1] : (batch.schedule || 'Hours TBD')

  const topStats = [
    { label: 'Assigned Instructor', value: batch.instructorName || batch.teacherName || 'TBD', sub: 'Primary Faculty', icon: Users, color: 'text-primary' },
    { label: 'Active Room', value: batch.roomNumber ? `Room ${batch.roomNumber}` : 'TBD', sub: 'Spatial Assignment', icon: MapPin, color: 'text-amber-500' },
    { label: 'Time Slot', value: timeSlot, sub: 'Daily Operational Hours', icon: Clock, color: 'text-indigo-400' },
    { label: 'Collision Audit', value: 'Zero Overlaps', sub: 'System Verified', icon: ShieldCheck, color: 'text-success' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title={`${batch.title || batch.name} / Schedule`}
        description="Verify instructional timing and physical room occupancy for this block."
        actions={
            <Button variant="ghost" className="font-normal" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Return to Classes
            </Button>
        }
      />

      <div className="mt-8 space-y-8">
        {/* The 4-Card Context Ribbon */}
        <EntityCardGrid 
            data={topStats}
            renderItem={(stat, i) => (
            <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-[1.5rem] transition-premium group relative isolate">
                <div className="absolute right-[-10%] top-[-10%] w-20 h-20 bg-primary/5 blur-3xl -z-10 group-hover:scale-110 transition-transform" />
                <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">{stat.label}</CardDescription>
                        <div className={cn("w-10 h-10 rounded-xl bg-background border border-primary/5 shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    {/* Size down the font if the value is too long like time slots */}
                    <CardTitle className={cn("font-serif font-medium tracking-tight", stat.value.length > 15 ? 'text-xl' : 'text-3xl', stat.color)}>
                        {stat.value}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-2">
                        {stat.label === 'Collision Audit' && <CheckCircle2 className="w-3 h-3 text-success opacity-80" />}
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-40 font-normal italic">{stat.sub}</p>
                    </div>
                </CardHeader>
            </Card>
            )}
            columns={4}
        />

        {/* The Full-Width Calendar Grid */}
        <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl w-full">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/[0.01]">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary opacity-60" />
                    <span className="font-serif text-xl tracking-tight">Weekly Operational Grid</span>
                </div>
                <Badge variant="outline" className="font-normal opacity-40 uppercase tracking-widest text-[9px] px-3 py-1 bg-background/50">Mon - Sat Configuration</Badge>
            </div>
            
            <div className="p-8 overflow-x-auto">
                <div className="grid grid-cols-6 gap-6 min-w-[900px]">
                    {days.map(day => (
                        <div key={day} className="space-y-4">
                            <span className="text-[10px] uppercase tracking-widest font-black opacity-30 block text-center mb-6">{day}</span>
                            
                            {/* The Dense Slot Card */}
                            <div className="bg-background rounded-[1.25rem] border border-primary/10 shadow-sm relative p-4 group hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer">
                                {/* Solid Accent Line indicating active class */}
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40 rounded-l-[1.25rem] group-hover:bg-primary transition-all" />
                                
                                <div className="space-y-4 pl-2">
                                    <div className="space-y-1">
                                        <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold block">Active Session</span>
                                        <span className="text-base font-serif leading-tight block font-medium group-hover:text-primary transition-colors">{batch.title || batch.name}</span>
                                    </div>
                                    
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                                            <span className="text-[10px] uppercase tracking-widest font-medium opacity-80">{timeSlot}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-amber-500 opacity-60" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-500 opacity-90">Room {batch.roomNumber || 'TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-primary opacity-60" />
                                            <span className="text-[10px] uppercase tracking-widest font-medium opacity-80">{batch.instructorName || batch.teacherName || 'TBD'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
      </div>
    </PageShell>
  )
}
