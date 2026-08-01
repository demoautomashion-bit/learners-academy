'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Download,
  FileText,
  Trash2,
  Eye,
  BookMarked,
  Printer,
  RefreshCw
} from 'lucide-react'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'

export default function SavedSyllabiPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCefr, setSelectedCefr] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState<any>(null)
  const [downloadToast, setDownloadToast] = useState<string | null>(null)

  // Fetch real data from database via GET /api/lessons
  const fetchSyllabi = async () => {
    setIsLoading(true)
    try {
      const url = user?.id ? `/api/lessons?teacherId=${user.id}` : '/api/lessons'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load syllabi:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSyllabi()
  }, [user?.id])

  // Delete real record from database via DELETE /api/lessons/[id]
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        if (previewItem?.id === id) setPreviewItem(null)
      }
    } catch (err) {
      console.error('Failed to delete syllabus:', err)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.grammar && item.grammar.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase())))
    
    const matchesCefr = selectedCefr === 'ALL' || item.cefr === selectedCefr
    const matchesType = selectedType === 'ALL' || item.scope === selectedType

    return matchesSearch && matchesCefr && matchesType
  })

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

      {/* Download Toast Notification */}
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

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40 text-xs h-9">
              <SelectValue placeholder="Syllabus Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Scopes</SelectItem>
              <SelectItem value="single">Single Session</SelectItem>
              <SelectItem value="term">3-Month Term Roadmap</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchSyllabi} className="h-9 px-2.5">
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Loading Skeleton / Spinner */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading saved syllabi from database...</p>
        </div>
      ) : (
        /* Syllabi Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant={item.scope === 'term' ? 'default' : 'secondary'}
                    className="text-[10px] font-semibold"
                  >
                    {item.scope === 'term' ? '3-Month Term Roadmap' : 'Single Session'}
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
                    {item.grammar && item.grammar.map((g: string) => (
                      <Badge key={g} variant="outline" className="text-[10px] bg-muted/30">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {item.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
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
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/20 mt-6">
          <BookMarked className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No Saved Syllabi</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Generate and save a lesson plan or term syllabus to build your personal library.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-[10px]">
                  {previewItem.scope === 'term' ? '3-Month Term Roadmap' : 'Single Session Plan'}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {previewItem.cefr} Level
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold">{previewItem.title}</DialogTitle>
              <DialogDescription className="text-xs">
                Instructor: <span className="font-medium text-foreground">{previewItem.teacherName}</span> • {previewItem.duration}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-xs font-semibold text-primary block">Real-World Topic Context</span>
                <p className="text-xs text-foreground">{previewItem.topic}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-xs font-semibold text-primary block">Grammar Focus</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewItem.grammar && previewItem.grammar.map((g: string) => (
                    <Badge key={g} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

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
                  Word File
                </Button>
              </div>

              <Button
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  )
}
