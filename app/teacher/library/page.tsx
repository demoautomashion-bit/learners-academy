'use client'

import { useState } from 'react'
import { useData } from '@/contexts/data-context'
import type { Question, QuestionCategory } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  Trash2,
  Edit,
  X,
  Library as LibraryIcon,
  FileText
} from 'lucide-react'
import Image from 'next/image'

const questionSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['MCQ', 'Subjective']),
  phase: z.enum(['First Test', 'Last Test', 'Both']),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  options: z.string().optional(),
  correctAnswer: z.string().optional(),
  imageUrl: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

const CATEGORIES: QuestionCategory[] = [
  'Grammar',
  'Vocab & Idioms',
  'Listening',
  'Reading',
  'Speaking',
  'Writing'
]

export default function QuestionLibraryPage() {
  const { questions, addQuestion, deleteQuestion, updateQuestion } = useData()
  const [activeTab, setActiveTab] = useState<QuestionCategory>('Grammar')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'MCQ',
      phase: 'Both',
    },
  })

  const selectedType = watch('type')
  const imageUrl = watch('imageUrl')

  const filteredQuestions = questions.filter((q: Question) =>
    q.category === activeTab &&
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = (data: QuestionFormValues) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      category: data.category as QuestionCategory,
      type: data.type,
      content: data.content,
      phase: data.phase,
      options: (data.type === 'MCQ' && data.options) ? data.options.split(',').map((o: string) => o.trim()) : undefined,
      correctAnswer: data.correctAnswer || '',
      imageUrl: data.imageUrl,
    }

    addQuestion(newQuestion)
    setIsAddingQuestion(false)
    reset()
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
        <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="py-4 space-y-4">
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={watch('category')} onValueChange={(val) => setValue('category', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.category.message}</p>}
                </Field>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select defaultValue="MCQ" onValueChange={(val) => setValue('type', val as any)}>
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
                  <Select defaultValue="Both" onValueChange={(val) => setValue('phase', val as any)}>
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
                  <Textarea {...register('content')} placeholder="Enter question or prompt" />
                  {errors.content && <p className="text-[10px] text-destructive font-bold uppercase mt-1">{errors.content.message}</p>}
                </Field>
                <Field>
                  <FieldLabel>Visual Aid (Optional Image)</FieldLabel>
                  {imageUrl ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <Image 
                        src={imageUrl} 
                        alt="Question image" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => setValue('imageUrl', '')}
                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Input
                      placeholder="Paste image URL (optional)"
                      value={imageUrl || ''}
                      onChange={(e) => setValue('imageUrl', e.target.value)}
                    />
                  )}
                </Field>
                {selectedType === 'MCQ' && (
                  <Field>
                    <FieldLabel>Options (comma separated)</FieldLabel>
                    <Input {...register('options')} placeholder="Opt 1, Opt 2, Opt 3" />
                  </Field>
                )}
                <Field>
                  <FieldLabel>Correct Answer</FieldLabel>
                  <Input {...register('correctAnswer')} placeholder="Enter correct answer" />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsAddingQuestion(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add to Library'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as QuestionCategory)} className="w-full">
            <TabsList className="bg-muted p-1 w-full justify-start overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} className="flex-1 md:flex-none h-10 px-4">
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
                            {q.imageUrl && (
                              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-primary/5 shadow-sm mt-3">
                                <Image 
                                  src={q.imageUrl} 
                                  alt="Question visual aid" 
                                  fill 
                                  className="object-cover"
                                />
                              </div>
                            )}
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
