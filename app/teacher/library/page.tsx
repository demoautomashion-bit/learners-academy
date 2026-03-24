'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  Trash2,
  Edit,
  Library as LibraryIcon,
} from 'lucide-react'
import { useData } from '@/contexts/data-context'
import type { Question, QuestionCategory } from '@/lib/types'

const CATEGORIES: QuestionCategory[] = [
  'Grammar',
  'Vocab & Idioms',
  'Listening',
  'Reading',
  'Speaking',
  'Writing'
]

export default function LibraryPage() {
  const { questions, addQuestion, deleteQuestion } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('Grammar')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const filteredQuestions = questions.filter(q => 
    q.category === activeTab &&
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      category: formData.get('category') as QuestionCategory,
      type: formData.get('type') as 'MCQ' | 'Subjective',
      content: formData.get('content') as string,
      phase: formData.get('phase') as 'First Test' | 'Last Test' | 'Both',
      options: (formData.get('type') === 'MCQ') ? (formData.get('options') as string).split(',').map(o => o.trim()) : undefined,
      correctAnswer: formData.get('correctAnswer') as string,
    }

    addQuestion(newQuestion)
    setIsAddOpen(false)
    toast.success('Question added to library')
  }

  const handleDelete = (id: string) => {
    deleteQuestion(id)
    toast.success('Question removed')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Assessment Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your question bank and content blocks
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to Library</DialogTitle>
              <DialogDescription>
                Create a new content block for your assessments.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuestion}>
              <FieldGroup className="py-4 space-y-4">
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select name="category" defaultValue={activeTab} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                      <SelectItem value="Subjective">Subjective</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Test Phase</FieldLabel>
                  <Select name="phase" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Applicable Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Test">First Test (Mid)</SelectItem>
                      <SelectItem value="Last Test">Last Test (Final)</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Content</FieldLabel>
                  <Textarea name="content" placeholder="Enter question or prompt" required />
                </Field>
                <Field>
                  <FieldLabel>Options (MCQ only - comma separated)</FieldLabel>
                  <Input name="options" placeholder="Opt 1, Opt 2, Opt 3" />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save to Library</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} className="flex-1 md:flex-none">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search in ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid gap-4">
                {filteredQuestions.length === 0 ? (
                  <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <LibraryIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-lg">Empty Category</p>
                      <p className="text-muted-foreground max-w-xs">
                        There are no content blocks in {activeTab} yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredQuestions.map(q => (
                    <Card key={q.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{q.type}</Badge>
                              <Badge variant="secondary">{q.phase}</Badge>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {q.content}
                            </p>
                            {q.options && (
                              <div className="ml-4 mt-2 space-y-1">
                                {q.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(q.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Blocks</span>
                <span className="font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">First Test</span>
                <span className="font-bold">{questions.filter(q => q.phase === 'First Test').length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last Test</span>
                <span className="font-bold">{questions.filter(q => q.phase === 'Last Test').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
