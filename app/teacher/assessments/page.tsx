'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Calendar,
  Users,
  ClipboardList,
  Edit,
  Trash2,
  Library,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Copy,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { generateSecureToken } from '@/lib/utils'
import { AssessmentSkeleton } from '@/components/dashboard-skeleton'

export default function AssessmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  if (!user?.id) return null
  const { 
    assessments, 
    updateAssessmentStatus,
    removeAssessment,
    teachers,
    isInitialized
  } = useData()

  // Find current teacher's requiresReview flag
  const currentTeacher = teachers.find(t => t.id === user?.id)
  const requiresReview = !!currentTeacher?.requiresReview
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssessments = assessments?.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    removeAssessment(id)
    toast.success('Assessment deleted')
  }

  if (!isInitialized) return <AssessmentSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={STAGGER_ITEM}>
          <h1 className="text-3xl font-serif tracking-tight text-foreground font-normal">
            Assessment Registry
          </h1>
          <p className="text-muted-foreground mt-1 text-sm opacity-70">
            Define and coordinate active examination blocks
          </p>
        </motion.div>
        
        <motion.div variants={STAGGER_ITEM} className="flex gap-2">
           <Button variant="outline" asChild className="hover-lift border-primary/20 bg-card/40 backdrop-blur-md rounded-xl h-10 px-6">
            <Link href="/teacher/library" className="flex items-center text-xs uppercase tracking-widest font-normal">
              <Plus className="w-4 h-4 mr-2" />
              Build Block
            </Link>
          </Button>
          <Button asChild className="hover-lift shadow-premium rounded-xl h-10 px-6">
            <Link href="/teacher/assessments/generator" className="text-xs uppercase tracking-widest font-normal">
              Initiate Registry
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* List */}
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 transition-premium" />
            <Input 
              placeholder="Search registry by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12 bg-card/40 backdrop-blur-md border-primary/5 rounded-2xl text-sm transition-premium focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
        >
          {filteredAssessments.length === 0 ? (
            <div className="col-span-full py-24 text-center">
               <div className="bg-primary/5 p-8 rounded-full w-fit mx-auto border border-primary/5 mb-6">
                  <ClipboardList className="w-12 h-12 text-primary opacity-20" />
               </div>
               <p className="text-2xl font-serif text-muted-foreground opacity-30">No active assessments in current registry.</p>
            </div>
          ) : (
            filteredAssessments?.map((assessment) => (
              <motion.div
                key={assessment.id}
                variants={STAGGER_ITEM}
                layout
              >
                <Card className="hover-lift overflow-hidden border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-2xl h-full flex flex-col hover:shadow-massive transition-premium">
                  <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0 p-6">
                    <div className="space-y-3">
                      <Badge variant={assessment.phase === 'First Test' ? 'outline' : 'secondary'} className="text-[9px] uppercase tracking-widest font-normal h-5 border-none bg-primary/5 text-primary px-2">
                        {assessment.phase}
                      </Badge>
                      <CardTitle className="text-xl font-serif font-normal group-hover:text-primary transition-colors leading-tight">
                        {assessment.title}
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-premium opacity-40 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(assessment.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col p-6 pt-0">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-[9px] uppercase tracking-widest font-normal text-muted-foreground opacity-50">
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
                    
                    {/* Status + Token strip */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-primary/5 group/token relative overflow-hidden transition-premium">
                        <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover/token:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col">
                          <span className="text-[8px] uppercase tracking-[0.2em] font-normal text-muted-foreground opacity-40">Access Token</span>
                          <span className="font-mono text-sm font-normal tracking-widest text-primary mt-1">{assessment.accessCode}</span>
                        </div>
                        <div className="relative z-10 flex items-center gap-4">
                          {/* Status chip */}
                          {assessment.status === 'active' && (
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-primary">Live</span>
                                <Switch 
                                    checked={true}
                                    onCheckedChange={async (checked) => {
                                      const newStatus = checked ? 'active' : 'archived'
                                      try {
                                        await updateAssessmentStatus(assessment.id, newStatus as any)
                                        toast.success(`Registry entry ${checked ? 'Activated' : 'Suspended'}`)
                                      } catch (err: any) {
                                        toast.error('Failed to shift registry status')
                                      }
                                    }}
                                    className="scale-75 data-[state=checked]:bg-primary"
                                />
                             </div>
                          )}
                          {assessment.status === 'archived' && (
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30">Suspended</span>
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
                          )}
                          {assessment.status === 'pending_review' && (
                             <Badge variant="outline" className="border-warning/20 bg-warning/5 text-warning text-[8px] uppercase font-bold tracking-widest h-6 px-3">Reviewing</Badge>
                          )}
                        </div>
                      </div>

                      {/* Admin feedback block — shown when revision is required */}
                      {assessment.status === 'draft' && assessment.adminFeedback && (
                        <div className="border-l-4 border-warning/60 bg-warning/5 rounded-r-2xl p-6">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-warning mb-2">Revision Directive</p>
                          <p className="text-sm italic text-muted-foreground leading-relaxed">"{assessment.adminFeedback}"</p>
                        </div>
                      )}
                    
                    <div className="pt-2">
                       <Button 
                        onClick={() => router.push(`/teacher/results/${assessment.id}`)}
                        className="w-full group rounded-xl h-10 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/5 transition-all shadow-sm font-normal text-xs uppercase tracking-widest"
                      >
                        Inspect Result
                        <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
