'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Eye, 
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react'
import { mockSubmissions, mockStudents, mockAssessments } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ResultsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [isGradeOpen, setIsGradeOpen] = useState(false)

  const filteredResults = mockSubmissions.filter(result => {
    const student = mockStudents.find(s => s.id === result.studentId)
    const assessment = mockAssessments.find(a => a.id === result.assignmentId) // Using legacy link for now
    
    const matchesSearch = student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment?.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPhase = phaseFilter === 'all' || assessment?.phase === phaseFilter
    
    return matchesSearch && matchesPhase
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Test Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Track student performance across all test phases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Award className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Average Score
            </CardDescription>
            <CardTitle className="text-2xl">84%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Grading</CardDescription>
            <CardTitle className="text-2xl text-warning">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>First Test Avg</CardDescription>
            <CardTitle className="text-2xl">79%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Test Avg</CardDescription>
            <CardTitle className="text-2xl">--</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="First Test">First Test (Mid)</SelectItem>
            <SelectItem value="Last Test">Last Test (Final)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Student</th>
                    <th className="px-4 py-3 text-left font-medium">Test & Phase</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Score</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredResults.map((result) => {
                    const student = mockStudents.find(s => s.id === result.studentId)
                    const assessment = mockAssessments.find(a => a.id === result.assignmentId)
                    
                    return (
                      <tr key={result.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary uppercase">
                                {student?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{student?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 space-y-1">
                          <p className="font-medium">{assessment?.title}</p>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {assessment?.phase}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {result.status === 'graded' ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Clock className="w-4 h-4 text-warning" />
                            )}
                            <span className="capitalize">{result.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {result.grade ? (
                            <span className="font-bold text-foreground">{result.grade}%</span>
                          ) : (
                            <span className="text-muted-foreground italic">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedResult(result)
                              setIsGradeOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Evaluate Test</DialogTitle>
            <DialogDescription>
              Review the student's randomized answers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Randomized Questions Summary</p>
              <div className="flex justify-between text-sm">
                <span>Objective Correct:</span>
                <span className="font-bold">8/10</span>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-sm font-medium">Subjective Prompt:</span>
                <p className="text-sm text-muted-foreground bg-background p-2 rounded border italic">
                "Summarize the main argument of the text..."
                </p>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-sm font-medium">Student Answer:</span>
                <p className="text-sm text-foreground bg-background p-2 rounded border">
                  The main argument focuses on the impact of technology on language learning, specifically how it bridge gaps...
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Final Score (%)</label>
              <Input type="number" placeholder="e.g. 85" max="100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback</label>
              <Textarea placeholder="Constructive feedback for the student..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsGradeOpen(false)
              toast.success('Grade submitted')
            }}>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
