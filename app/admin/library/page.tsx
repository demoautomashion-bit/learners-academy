'use client'

import { useState } from 'react'
import { useData } from '@/contexts/data-context'
import type { Question, QuestionCategory } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { toast } from 'sonner'
import { 
  Search, Trash2, Library as LibraryIcon, 
  CheckCircle2, AlertCircle, ShieldCheck, 
  Volume2, BookOpen, Clock, Filter
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const CATEGORIES: QuestionCategory[] = ['Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']

const TYPE_BADGE_COLORS: Record<string, string> = {
  'MCQ':                ' bg-primary/5 text-primary',
  'True/False':         'border-success/20 bg-success/5 text-success',
  'Fill in the Blanks': 'border-warning/20 bg-warning/5 text-warning',
  'Writing':            'border-muted-foreground/20 bg-muted/50 text-muted-foreground',
  'Matching':           'border-accent/20 bg-accent/5 text-foreground',
  'Reading':            ' bg-primary/5 text-primary/70',
  'Listening':          ' bg-primary/5 text-primary/70',
  'Subjective':         'border-muted-foreground/20 bg-muted/30 text-muted-foreground',
}

export default function AdminLibraryPage() {
  const { questions, deleteQuestion, approveQuestion, isInitialized } = useData()
  const [activeTab, setActiveTab] = useState<QuestionCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'approved'>('all')

  if (!isInitialized) return <DashboardSkeleton />

  const filteredQuestions = questions?.filter((q: Question) => {
    const categoryMatch = activeTab === 'All' || q.category === activeTab
    const searchMatch = q.content.toLowerCase().includes(searchQuery.toLowerCase())
    const approvalMatch = 
      filterMode === 'all' ? true :
      filterMode === 'pending' ? !q.isApproved :
      q.isApproved
    return categoryMatch && searchMatch && approvalMatch
  })

  const pendingCount = questions?.filter(q => !q.isApproved).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Content Audit & Registry</h1>
          <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
            Institutional oversight and approval for the academic question library.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="destructive" className="animate-pulse gap-1.5 px-3 py-1 bg-destructive/10 text-destructive border-destructive/20 h-9 ">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs   font-bold">{pendingCount} Awaiting Audit</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Control Strip */}
      <Card className="glass-1 overflow-hidden">
        <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
            <Input 
              placeholder="Search institutional pool..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-9 h-11 bg-background/50   text-sm" 
            />
          </div>
          <div className="flex items-center gap-2">
             <Tabs value={filterMode} onValueChange={(v) => setFilterMode(v as any)} className="bg-muted/30 p-1 ">
               <TabsList className="bg-transparent h-9 border-none p-0">
                  <TabsTrigger value="all" className="h-7 px-4  data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs  ">All</TabsTrigger>
                  <TabsTrigger value="pending" className="h-7 px-4  data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs  ">Pending</TabsTrigger>
                  <TabsTrigger value="approved" className="h-7 px-4  data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs  ">Approved</TabsTrigger>
               </TabsList>
             </Tabs>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="px-4 pb-4 bg-transparent w-full justify-start overflow-x-auto no-scrollbar h-auto border-none">
            <TabsTrigger value="All" className="h-9 px-6  text-xs   data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Categories</TabsTrigger>
            {CATEGORIES?.map(cat => (
              <TabsTrigger key={cat} value={cat} className="h-9 px-6  text-xs   data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      {/* Question List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredQuestions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <LibraryIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-serif text-lg">No questions found matching your filters.</p>
            </motion.div>
          ) : (
            filteredQuestions?.map((q) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                variants={STAGGER_ITEM}
              >
                <Card className={`group overflow-hidden     border-none transition-premium ring-1 ${q.isApproved ? 'ring-primary/5' : 'ring-warning/30 bg-warning/[0.01]'}`}>
                  <div className="flex flex-col md:flex-row">
                    {/* Status Bar */}
                    <div className={`w-full md:w-1.5 h-1.5 md:h-auto ${q.isApproved ? 'bg-success/40' : 'bg-warning'}`} />
                    
                    <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs px-2 h-5 font-bold   border-none ${TYPE_BADGE_COLORS[q.type] || ''}`}>
                            {q.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs px-2 h-5 font-normal   bg-muted/40">
                            {q.phase}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 h-5 font-normal   ">
                            {q.category}
                          </Badge>
                          {!q.isApproved && (
                            <Badge className="bg-warning text-warning-foreground text-xs font-bold   px-1.5 h-4">
                              Awaiting Audit
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-lg leading-relaxed font-sans font-normal text-foreground/90">
                          {q.content}
                          {q.type === 'Fill in the Blanks' && <span className="ml-2 font-serif text-primary border-b-2  px-2 italic">{q.correctAnswer}</span>}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground  font-bold ">
                          {q.passageText && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Passage Included</span>}
                          {q.audioUrl && <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Audio Clip Linked</span>}
                          {q.type === 'MCQ' && <span>{q.options?.length} Options Configured</span>}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:border-l  md:pl-8">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`text-xs   font-bold ${q.isApproved ? 'text-success' : 'text-warning'}`}>
                            {q.isApproved ? 'Approved' : 'Verify'}
                          </span>
                          <Switch 
                            checked={q.isApproved}
                            onCheckedChange={(checked) => {
                              approveQuestion(q.id, checked)
                              toast.success(checked ? "Question Approved" : "Question Reverted to Draft")
                            }}
                            className={`scale-90 ${q.isApproved ? 'data-[state=checked]:bg-success' : 'data-[state=checked]:bg-warning'}`}
                          />
                        </div>

                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-9  hover:bg-destructive/10 hover: transition-premium"
                            onClick={() => {
                              if (confirm('Permanently remove this content from the institutional registry?')) {
                                deleteQuestion(q.id)
                                toast.success("Content purged")
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
