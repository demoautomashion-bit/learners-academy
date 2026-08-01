'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Award,
  Download,
  FileText,
  Trash2,
  Eye,
  Sparkles,
  BookMarked,
  Printer,
  Copy,
  CheckCircle2,
  X,
  Layers,
  ArrowRight
} from 'lucide-react'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Mock Saved Syllabi Data
const INITIAL_SAVED_ITEMS = [
  {
    id: 'syl-1',
    title: 'Level 4 English: 3-Month Comprehensive Term Roadmap',
    type: 'Term Syllabus',
    scope: '3 Months (12 Weeks)',
    cefr: 'B2',
    topic: 'Business English & Formal Negotiation',
    grammar: ['Second Conditional', 'Passive Voice', 'Reported Speech'],
    createdAt: '2026-07-28',
    classesCount: '36 Sessions',
    targetBatch: 'Level 4 - Evening Batch'
  },
  {
    id: 'syl-2',
    title: 'Mastering Present Perfect vs Past Simple',
    type: 'Single Lesson',
    scope: '45 Minutes',
    cefr: 'B1',
    topic: 'Travel & World Experiences',
    grammar: ['Present Perfect vs Past Simple'],
    createdAt: '2026-07-25',
    classesCount: '1 Session',
    targetBatch: 'Level 3 - Foundation'
  },
  {
    id: 'syl-3',
    title: 'Advanced Relative Clauses & Formal Discourse',
    type: 'Single Lesson',
    scope: '60 Minutes',
    cefr: 'C1',
    topic: 'Academic Essay Writing',
    grammar: ['Defining & Non-Defining Relative Clauses'],
    createdAt: '2026-07-20',
    classesCount: '1 Session',
    targetBatch: 'Level 5 - Advanced'
  },
  {
    id: 'syl-4',
    title: 'Elementary Communication & Daily Habits (1-Month Roadmap)',
    type: 'Term Syllabus',
    scope: '1 Month (4 Weeks)',
    cefr: 'A2',
    topic: 'Daily Routines & Social Exchanges',
    grammar: ['Present Simple', 'Adverbs of Frequency', 'Past Simple'],
    createdAt: '2026-07-15',
    classesCount: '12 Sessions',
    targetBatch: 'Level 2 - Beginner'
  }
]

export default function SavedSyllabiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCefr, setSelectedCefr] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [items, setItems] = useState(INITIAL_SAVED_ITEMS)
  const [previewItem, setPreviewItem] = useState<any>(null)
  const [downloadToast, setDownloadToast] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.grammar.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCefr = selectedCefr === 'ALL' || item.cefr === selectedCefr
    const matchesType = selectedType === 'ALL' || item.type === selectedType

    return matchesSearch && matchesCefr && matchesType
  })

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    if (previewItem?.id === id) setPreviewItem(null)
  }

  const triggerDownload = (fileName: string, fileType: string) => {
    setDownloadToast(`Preparing ${fileName}.${fileType} download...`)
    setTimeout(() => {
      setDownloadToast(null)
    }, 2500)
  }

  return (
    <PageShell>
      <PageHeader
        title="Saved Lessons & Term Syllabi Library"
        description="Access, review, print, and export your previously generated lesson plans and 3-month course roadmaps."
        badgeText="Library Repository"
        icon={BookMarked}
        action={
          <Link href="/teacher/lesson-generator">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Create New Syllabus
            </Button>
          </Link>
        }
      />

      {/* Toast Download Notification */}
      {downloadToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4 animate-bounce" />
          {downloadToast}
        </motion.div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by topic, grammar, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* CEFR Filter */}
          <Select value={selectedCefr} onValueChange={setSelectedCefr}>
            <SelectTrigger className="w-36 text-xs h-9">
              <SelectValue placeholder="CEFR Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="A1">A1 Level</SelectItem>
              <SelectItem value="A2">A2 Level</SelectItem>
              <SelectItem value="B1">B1 Level</SelectItem>
              <SelectItem value="B2">B2 Level</SelectItem>
              <SelectItem value="C1">C1 Level</SelectItem>
              <SelectItem value="C2">C2 Level</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40 text-xs h-9">
              <SelectValue placeholder="Syllabus Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Scopes</SelectItem>
              <SelectItem value="Single Lesson">Single Lessons</SelectItem>
              <SelectItem value="Term Syllabus">3-Month Term Syllabi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Syllabi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge
                  variant={item.type === 'Term Syllabus' ? 'default' : 'secondary'}
                  className="text-[10px] font-semibold"
                >
                  {item.type}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  CEFR {item.cefr}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold leading-snug text-foreground line-clamp-2">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                Context: <span className="text-foreground font-medium">{item.topic}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0">
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Grammar Focus:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.grammar.map((g) => (
                    <Badge key={g} variant="outline" className="text-[10px] bg-muted/30">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {item.scope}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.createdAt}
                </span>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border pt-3 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewItem(item)}
                className="text-xs gap-1 flex-1"
              >
                <Eye className="w-3.5 h-3.5" />
                View & Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/20 mt-6">
          <BookMarked className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No Syllabi Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No saved lesson plans match your search query or filters.
          </p>
        </div>
      )}

      {/* Preview & Export Modal */}
      {previewItem && (
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-[10px]">
                  {previewItem.type}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {previewItem.cefr} Level
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold">{previewItem.title}</DialogTitle>
              <DialogDescription className="text-xs">
                Target Batch: <span className="font-medium text-foreground">{previewItem.targetBatch}</span> • {previewItem.scope}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-xs font-semibold text-primary block">Real-World Topic Context</span>
                <p className="text-xs text-foreground">{previewItem.topic}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-xs font-semibold text-primary block">Core Grammatical Focus</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewItem.grammar.map((g: string) => (
                    <Badge key={g} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Export Toolbar */}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerDownload(previewItem.title, 'pdf')}
                  className="text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  PDF File
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerDownload(previewItem.title, 'docx')}
                  className="text-xs gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Word Document
                </Button>
              </div>

              <Button
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  )
}
