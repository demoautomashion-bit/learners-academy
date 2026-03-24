'use client'

import { useState } from 'react'
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Calendar,
  Users,
  ClipboardList,
  Edit,
  Trash2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Copy,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import type { AssessmentTemplate } from '@/lib/types'

export default function AssessmentsPage() {
  const { user } = useAuth()
  const { 
    assessments, 
    courses: mockCourses, 
    questions: mockQuestions, 
    publishAssessment, 
    removeAssessment 
  } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const myClasses = mockCourses.filter(c => c.teacherId === user?.id)

  const filteredAssessments = assessments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateAssessment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Logic to verify questions exist in library for this phase
    const phase = formData.get('phase') as 'First Test' | 'Last Test'
    const availableQuestions = mockQuestions.filter(q => q.phase === phase || q.phase === 'Both')
    
    if (availableQuestions.length < 5) {
      toast.error(`Not enough questions in Library for ${phase}. Please add more first.`)
      return
    }

    const newAssessment: AssessmentTemplate = {
      id: `test-${Date.now()}`,
      title: formData.get('title') as string,
      phase: phase,
      classLevels: [formData.get('classLevel') as string],
      nature: formData.get('nature') as 'MCQ' | 'Subjective' | 'Mixed',
      totalMarks: parseInt(formData.get('totalMarks') as string),
      durationMinutes: parseInt(formData.get('duration') as string),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      accessCode: '',
    }

    publishAssessment(newAssessment)
    setIsCreateOpen(false)
    toast.success('Assessment generated successfully')
  }

  const handleDelete = (id: string) => {
    removeAssessment(id)
    toast.success('Assessment deleted')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Assessments
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage exam papers for your terms
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Test</DialogTitle>
              <DialogDescription>
                The system will automatically select questions from your Library.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssessment}>
              <FieldGroup className="py-4 space-y-4">
                <Field>
                  <FieldLabel>Test Title</FieldLabel>
                  <Input name="title" placeholder="e.g. Mid-term Assessment" required />
                </Field>
                <Field>
                  <FieldLabel>Test Phase</FieldLabel>
                  <Select name="phase" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Test">First Test (Mid-term)</SelectItem>
                      <SelectItem value="Last Test">Last Test (Final-term)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Target Class</FieldLabel>
                  <Select name="classLevel" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {myClasses.map(c => (
                        <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Question Nature</FieldLabel>
                  <Select name="nature" defaultValue="Mixed" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">MCQ Only</SelectItem>
                      <SelectItem value="Subjective">Subjective Only</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Marks</FieldLabel>
                    <Input name="totalMarks" type="number" defaultValue="100" />
                  </Field>
                  <Field>
                    <FieldLabel>Mins</FieldLabel>
                    <Input name="duration" type="number" defaultValue="60" />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Paper</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div className="grid gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No assessments found
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <Card className="hover-lift overflow-hidden border-none shadow-sm ring-1 ring-border h-full">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <Badge variant={assessment.phase === 'First Test' ? 'outline' : 'secondary'} className="text-[10px] uppercase tracking-widest font-bold border-primary/20 bg-primary/5 text-primary">
                        {assessment.phase}
                      </Badge>
                      <CardTitle className="font-serif text-xl tracking-tight leading-none pt-1">{assessment.title}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-premium"
                      onClick={() => handleDelete(assessment.id)}
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] uppercase tracking-wider font-bold text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">{assessment.classLevels[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.nature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                        <span>{assessment.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                        <span>{new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-primary/5 group/token relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/token:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Access Token</span>
                        <span className="font-mono text-sm font-bold tracking-tighter text-primary">{assessment.accessCode}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl relative z-10 hover:bg-primary/10 hover:text-primary transition-premium"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(assessment.accessCode)
                          toast.success("Access Token Copied", {
                            description: "The code is ready to share with your students."
                          })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full group rounded-xl h-10 border-primary/10 hover:bg-primary/5 hover:text-primary transition-premium font-semibold">
                        Review Exam Paper
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
