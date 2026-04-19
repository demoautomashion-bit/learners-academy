'use client'

import { AssessmentSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  Calendar,
  Users,
  ClipboardList,
  Trash2,
  FileText,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { toast } from 'sonner'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { cn } from '@/lib/utils'

export default function AssessmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    assessments, 
    updateAssessmentStatus,
    removeAssessment,
    isInitialized
  } = useData()

  const [searchQuery, setSearchQuery] = useState('')

  if (!user?.id) return null
  if (!isInitialized) return <AssessmentSkeleton />

  const filteredAssessments = assessments?.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleDelete = (id: string) => {
    removeAssessment(id)
    toast.success('Assessment deleted')
  }

  return (
    <PageShell>
      <PageHeader 
        title="My Assessments"
        description="Manage the tests you've created for your classes."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="hover-lift font-normal">
              <Link href="/teacher/library" className="flex items-center text-xs">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Link>
            </Button>
            <Button asChild className="hover-lift font-normal shadow-lg shadow-primary/20">
              <Link href="/teacher/assessments/generator" className="text-xs">
                New Test
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
          <Input 
            placeholder="Search tests by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-12 text-sm transition-premium focus:ring-1 focus:ring-primary/20 bg-muted/5 font-normal"
          />
        </div>

        <EntityCardGrid 
          data={filteredAssessments}
          renderItem={(assessment) => (
            <Card key={assessment.id} className="hover-lift overflow-hidden h-full flex flex-col transition-premium">
              <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0 p-6">
                <div className="space-y-3">
                  <Badge variant={assessment.phase === 'First Test' ? 'outline' : 'secondary'} className="text-[10px] font-normal h-5 border-none bg-primary/5 text-primary px-2">
                    {assessment.phase}
                  </Badge>
                  <CardTitle className="text-xl font-serif leading-tight font-medium">
                    {assessment.title}
                  </CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 hover:bg-destructive/10 transition-premium opacity-40 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(assessment.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col p-6 pt-0">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-[10px] font-normal text-muted-foreground opacity-50 items-stretch">
                  <div className="flex items-center gap-3">
                    <Users className="w-3.5 h-3.5 text-primary/60" />
                    <span className="truncate">{assessment.classLevels[0]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-3.5 h-3.5 text-primary/60" />
                    <span>{assessment.nature}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-primary/60" />
                    <span>{assessment.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/5 border group/token relative overflow-hidden transition-premium">
                  <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover/token:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col">
                    <span className="text-[10px] font-normal text-muted-foreground opacity-40">Student Test Code</span>
                    <span className="font-mono text-sm font-normal text-primary mt-1">{assessment.accessCode}</span>
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    {assessment.status === 'active' ? (
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-normal text-primary">Live</span>
                          <Switch 
                              checked={true}
                              onCheckedChange={async (checked) => {
                                const newStatus = checked ? 'active' : 'archived'
                                try {
                                  await updateAssessmentStatus(assessment.id, newStatus as any)
                                  toast.success(`Test ${checked ? 'Activated' : 'Hidden'}`)
                                } catch (err: any) {
                                  toast.error('Failed to change test status')
                                }
                              }}
                              className="scale-75 data-[state=checked]:bg-primary"
                          />
                       </div>
                    ) : assessment.status === 'archived' ? (
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-normal opacity-30">Suspended</span>
                          <Switch 
                              checked={false}
                              onCheckedChange={async (checked) => {
                                const newStatus = checked ? 'active' : 'archived'
                                try {
                                  await updateAssessmentStatus(assessment.id, newStatus as any)
                                } catch (err: any) {}
                              }}
                              className="scale-75"
                          />
                       </div>
                    ) : assessment.status === 'pending_review' ? (
                       <Badge variant="outline" className="border-warning/20 bg-warning/5 text-warning text-[10px] font-normal h-6 px-3">Reviewing</Badge>
                    ) : null}
                  </div>
                </div>

                {assessment.status === 'draft' && assessment.adminFeedback && (
                  <div className="border-l-4 border-warning/60 bg-warning/5 p-6">
                    <p className="text-[10px] font-normal text-warning mb-2">Required Revision</p>
                    <p className="text-sm italic text-muted-foreground leading-relaxed font-normal">"{assessment.adminFeedback}"</p>
                  </div>
                )}
                
                <div className="pt-2">
                   <Button 
                    onClick={() => router.push(`/teacher/results/${assessment.id}`)}
                    className="w-full group h-10 bg-primary/5 hover:bg-primary text-primary hover:text-white border transition-all shadow-sm font-normal text-[10px]"
                  >
                    View Results
                    <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          emptyState={
            <div className="col-span-full py-24 text-center">
               <div className="bg-primary/5 p-8 w-fit mx-auto border mb-6 rounded-2xl">
                  <ClipboardList className="w-12 h-12 text-primary opacity-20" />
               </div>
               <p className="text-2xl font-serif text-muted-foreground opacity-30 font-normal">No tests found in your library.</p>
            </div>
          }
          columns={3}
        />
      </div>
    </PageShell>
  )
}
