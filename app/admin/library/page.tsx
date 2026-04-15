'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Library,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Volume2,
  Trash2,
  Filter,
  MoreVertical
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Question, QuestionCategory } from '@/lib/types'

const CATEGORIES: (QuestionCategory | 'All')[] = ['All', 'Grammar', 'Vocab & Idioms', 'Listening', 'Reading', 'Speaking', 'Writing']

export default function AdminLibraryPage() {
  const hasMounted = useHasMounted()
  const { questions, deleteQuestion, approveQuestion, isInitialized } = useData()
  const [activeTab, setActiveTab] = useState<QuestionCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'approved'>('all')

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredQuestions = (Array.isArray(questions) ? questions : []).filter(q => {
    const categoryMatch = activeTab === 'All' || q.category === activeTab
    const searchMatch = (q.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    const approvalMatch = 
      filterMode === 'all' ? true :
      filterMode === 'pending' ? !q.isApproved :
      q.isApproved
    return categoryMatch && searchMatch && approvalMatch
  })

  const pendingCount = (questions || []).filter(q => !q.isApproved).length

  return (
    <PageShell>
      <PageHeader 
        title="Content Library & Audit"
        description="Institutional registry for academic assessment content. Verify and authorize staff contributions."
        actions={
            <div className="flex items-center gap-4">
                 {pendingCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse gap-1.5 px-4 py-2 border-destructive/20 bg-destructive/10 text-destructive h-11">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{pendingCount} Awaiting Audit</span>
                    </Badge>
                )}
            </div>
        }
      />

      <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden shadow-premium mt-8">
        <div className="p-8 pb-4 flex flex-col gap-6 md:flex-row md:items-center border-b border-primary/5">
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
                <Input 
                    placeholder="Identify specific instructional content..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-muted/10 border-none shadow-none text-sm font-normal"
                />
             </div>
             <div className="flex items-center gap-4 bg-primary/5 p-1.5 rounded-2xl border">
                {(['all', 'pending', 'approved'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setFilterMode(mode)}
                        className={cn(
                            "px-5 py-2 text-[10px] uppercase tracking-widest rounded-xl transition-all font-bold",
                            filterMode === mode ? "bg-white text-primary shadow-sm" : "text-muted-foreground/60 hover:text-primary"
                        )}
                    >
                        {mode}
                    </button>
                ))}
             </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="px-8 py-6 bg-transparent w-full justify-start overflow-x-auto no-scrollbar gap-2">
                {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="h-9 px-6 text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
                        {cat}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
      </Card>

      <div className="grid gap-6 mt-12">
        {filteredQuestions.length === 0 ? (
            <div className="py-32 text-center opacity-20">
                <Library className="w-16 h-16 mx-auto mb-6" />
                <p className="font-serif text-2xl">Library Pool Empty</p>
                <p className="text-sm mt-2">Modify your filters or synchronize the academic database.</p>
            </div>
        ) : (
            filteredQuestions.map((q) => (
                <Card key={q.id} className={cn(
                    "glass-1 border-primary/5 rounded-[2rem] overflow-hidden group transition-all hover:translate-y-[-2px] hover:shadow-2xl isolate",
                    !q.isApproved && "bg-warning/[0.02] border-warning/10"
                )}>
                    <div className="flex flex-col md:flex-row h-full">
                        <div className={cn(
                            "w-full md:w-2 h-2 md:h-auto shrink-0",
                            q.isApproved ? "bg-success/40" : "bg-warning"
                        )} />
                        
                        <CardContent className="p-8 flex-1 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold border-primary/10">
                                        {q.type}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-normal bg-muted/40">
                                        {q.phase}
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-normal border-primary/5 opacity-40">
                                        {q.category}
                                    </Badge>
                                    {!q.isApproved && (
                                        <Badge className="bg-warning text-warning-foreground text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-lg shadow-warning/20">
                                            Awaiting Audit
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-lg font-serif font-normal leading-relaxed text-foreground/90">
                                    {q.content}
                                    {q.type === 'Fill in the Blanks' && <span className="ml-2 text-primary border-b-2 border-primary/20 px-2 italic font-serif">{q.correctAnswer}</span>}
                                </p>
                                <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground opacity-30 font-bold">
                                    {q.passageText && <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Passage Attached</div>}
                                    {q.audioUrl && <div className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Audio Linked</div>}
                                    {q.options && q.options.length > 0 && <div>{q.options.length} Response Options</div>}
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center gap-6 md:pl-10 md:border-l border-primary/5 min-w-[120px]">
                                <div className="flex flex-col items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-widest font-bold",
                                        q.isApproved ? "text-success" : "text-warning"
                                    )}>
                                        {q.isApproved ? 'Authorized' : 'Review'}
                                    </span>
                                    <Switch 
                                        checked={q.isApproved} 
                                        onCheckedChange={(checked) => {
                                            approveQuestion(q.id, checked)
                                            toast.success(checked ? "Content authorized" : "Content reverted to draft")
                                        }}
                                        className={cn(q.isApproved ? "data-[state=checked]:bg-success" : "data-[state=checked]:bg-warning")}
                                    />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-10 h-10 hover:bg-destructive/10 text-destructive/40 hover:text-destructive group-hover:opacity-100 opacity-20 transition-all rounded-full"
                                    onClick={() => {
                                        if (confirm("Permanently purge this instructional unit from the library?")) {
                                            deleteQuestion(q.id)
                                            toast.success("Content purged")
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            ))
        )}
      </div>
    </PageShell>
  )
}
