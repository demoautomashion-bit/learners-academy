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
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { mockAssessments, mockCourses, mockQuestions } from '@/lib/mock-data'
import type { AssessmentTemplate } from '@/lib/types'

export default function AssessmentsPage() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>(mockAssessments)
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
    }

    setAssessments([newAssessment, ...assessments])
    setIsCreateOpen(false)
    toast.success('Assessment generated successfully')
  }

  const handleDelete = (id: string) => {
    setAssessments(assessments.filter(a => a.id !== id))
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
              <Card key={assessment.id} className="hover-lift overflow-hidden border-none shadow-sm ring-1 ring-border">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <Badge variant={assessment.phase === 'First Test' ? 'outline' : 'secondary'}>
                      {assessment.phase}
                    </Badge>
                    <CardTitle className="text-lg leading-tight">{assessment.title}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(assessment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{assessment.classLevels[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{assessment.nature}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{assessment.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" className="w-full group">
                      Review Paper
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
