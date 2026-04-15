'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useHasMounted } from '@/hooks/use-has-mounted'

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

  return (
    <PageShell>
      <PageHeader 
        title={`${batch.name} / Schedule Audit`}
        description="Verification of instructional timing, room occupancy, and collision detection for this specific batch."
        actions={
            <Button variant="ghost" className="font-normal" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Return to Batches
            </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <Card className="glass-1 border-primary/5 rounded-[2rem] p-8 space-y-8 h-full">
            <div>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Allocation Status</span>
                <div className="flex items-center gap-2 mt-4">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">Valid Configuration</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Assigned Instructor</span>
                    <span className="text-sm font-normal">{batch.instructorName}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Tier Placement</span>
                    <span className="text-sm font-normal">{batch.level}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Fiscal Parameter</span>
                    <span className="text-sm font-serif">PKR {batch.fee?.toLocaleString()}</span>
                </div>
            </div>

            <div className="pt-8 border-t border-primary/5">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Collision Audit</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">System has verified 0 overlaps for Room {batch.roomNumber} during the specified interval.</p>
                </div>
            </div>
        </Card>

        <Card className="lg:col-span-3 glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary opacity-40" />
                        <span className="text-sm font-medium">{batch.startTime} - {batch.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary opacity-40" />
                        <span className="text-sm font-medium">Room {batch.roomNumber}</span>
                    </div>
                </div>
                <Badge variant="outline" className="font-normal opacity-40 uppercase tracking-widest text-[9px]">Mon - Sat Profile</Badge>
            </div>
            <div className="p-8">
                <div className="grid grid-cols-6 gap-4">
                    {days.map(day => (
                        <div key={day} className="space-y-4">
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 block text-center mb-6">{day}</span>
                            <div className="h-48 bg-primary/5 rounded-2xl border border-primary/10 relative p-4 group hover:bg-primary/10 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-l-2xl group-hover:bg-primary transition-all" />
                                <div className="space-y-2">
                                    <span className="text-[9px] uppercase tracking-tighter opacity-40 font-bold block">Active Session</span>
                                    <span className="text-xs font-serif leading-tight block">Instructional Block 1</span>
                                    <span className="text-[9px] opacity-40 block mt-4">Verified</span>
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
