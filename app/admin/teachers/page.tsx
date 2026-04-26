'use client'

import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EntityCardGrid } from '@/components/shared/entity-card-grid'
import { EntityDataGrid, Column } from '@/components/shared/entity-data-grid'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { Teacher } from '@/lib/types'

export default function TeachersPage() {
  const hasMounted = useHasMounted()
  const router = useRouter()
  const { teachers, removeTeacher, updateTeacher, updateTeacherStatus, updateTeacherReviewFlag, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  if (!hasMounted) return null
  if (!isInitialized) return <DashboardSkeleton />

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher =>
    (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.subjects?.join(' ') || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusToggle = async (teacher: Teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active'
    try {
      await updateTeacherStatus(teacher.id, newStatus as any)
      toast.success(`Staff status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await removeTeacher(id)
        toast.success("Staff member deleted")
      } catch (error) {
        toast.error("Error deleting record")
      }
    }
  }

  const columns: Column<Teacher>[] = [
    {
      label: 'ID',
      render: (teacher) => (
        <span className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded">
          {teacher.employeeId}
        </span>
      ),
      width: '120px'
    },
    {
      label: 'Name',
      render: (teacher) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9 border shadow-sm transition-transform duration-500">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback className="text-xs bg-primary/5 text-primary font-bold">
              {getInitials(teacher.name, 'T')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium leading-none">{teacher.name}</span>
        </div>
      ),
      width: '240px'
    },
    {
      label: 'Email',
      render: (teacher) => (
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <Mail className="w-3.5 h-3.5 opacity-40" />
          <span className="text-xs font-normal underline decoration-primary/10 underline-offset-4">{teacher.email}</span>
        </div>
      )
    },
    {
      label: 'Phone Number',
      render: (teacher) => (
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <Phone className="w-3.5 h-3.5 opacity-40" />
          <span className="text-xs font-normal tracking-tight">{teacher.phone}</span>
        </div>
      )
    },
    {
      label: 'Actions',
      render: (teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 hover:bg-primary/5">
              <MoreVertical className="w-4 h-4 text-muted-foreground opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 overflow-hidden">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-40 px-4 py-3 font-normal">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
                onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <ExternalLink className="w-4 h-4 opacity-60" /> <span className="text-xs">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => setEditingTeacher(teacher)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              <Edit className="w-4 h-4 opacity-60" /> <span className="text-xs">Modify Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-normal">Test Review</span>
                <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">
                    {teacher.requiresReview ? "Mandatory Audit" : "Auto-Publish"}
                </span>
              </div>
              <Switch 
                checked={!!teacher.requiresReview}
                onCheckedChange={async (checked) => {
                  try {
                    await updateTeacherReviewFlag(teacher.id, checked)
                    toast.success(checked ? "Oversight Active" : "Direct Access Enabled")
                  } catch (err) {
                    toast.error("Sync Failed")
                  }
                }}
                className="scale-75 data-[state=checked]:bg-primary"
              />
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => handleStatusToggle(teacher)}
                className="gap-3 cursor-pointer py-3 focus:bg-primary/5 transition-all font-normal"
            >
              {teacher.status === 'active' ? (
                <><XCircle className="w-4 h-4 text-destructive opacity-80" /> <span className="text-xs">Deactivate</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4 text-success opacity-80" /> <span className="text-xs">Activate</span></>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-5" />
            <DropdownMenuItem 
               onClick={() => handleDelete(teacher.id)}
               className="gap-3 cursor-pointer py-3 focus:bg-destructive/5 text-destructive font-normal"
            >
              <Trash2 className="w-4 h-4 opacity-60" /> <span className="text-xs font-medium">Delete Record</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '100px'
    }
  ]

  const stats = [
    { label: 'Staff Active', value: teachers.filter(t => t.status === 'active').length, sub: 'Currently Working', icon: ShieldCheck, color: 'text-success' },
    { label: 'Total Staff', value: teachers.length, sub: 'Portal Registry', icon: Users, color: 'text-primary' },
  ]

  return (
    <PageShell>
      <PageHeader 
        title="Staff List"
        description="View and manage all teachers and administrative staff members."
        actions={
          <Button 
            className="font-normal bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => router.push('/admin/teachers/registration')}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        }
      />

      <EntityCardGrid 
        data={stats}
        renderItem={(stat, i) => (
          <Card key={i} className="glass-1 hover-lift border-primary/5 shadow-premium overflow-hidden rounded-2xl transition-premium group">
            <CardHeader className="pb-6 relative isolate">
                <div className="absolute right-6 top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <stat.icon className="w-10 h-10" />
                </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">{stat.label}</CardDescription>
                <CardTitle className={cn("text-2xl font-serif font-medium", stat.color)}>{stat.value}</CardTitle>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 mt-2 font-normal italic">{stat.sub}</p>
            </CardHeader>
          </Card>
        )}
        columns={2}
      />

      <div className="mt-12">
        <EntityDataGrid 
          title="Staff Registry"
          description="Manage staff status and details for all active members."
          data={filteredTeachers}
          columns={columns}
          actions={
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/10 focus:bg-background transition-all font-normal text-sm border-none shadow-none w-full"
              />
            </div>
          }
          emptyState={
            <div className="text-center py-24 opacity-30">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl font-normal">No staff members found</p>
              <p className="text-xs mt-2 font-normal">Add a staff member to see them here.</p>
            </div>
          }
        />
      </div>

      <ModifyTeacherDialog 
        teacher={editingTeacher} 
        onClose={() => setEditingTeacher(null)} 
        onUpdate={updateTeacher}
      />
    </PageShell>
  )
}

function ModifyTeacherDialog({ teacher, onClose, onUpdate }: { teacher: Teacher | null, onClose: () => void, onUpdate: any }) {
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        email: '',
        phone: '',
        employeePassword: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                employeeId: teacher.employeeId || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                employeePassword: teacher.employeePassword || ''
            })
        }
    }, [teacher])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!teacher) return
        
        setIsSaving(true)
        try {
            await onUpdate(teacher.id, formData)
            toast.success("Profile Updated", { description: "Institutional records have been synchronized." })
            onClose()
        } catch (err) {
            toast.error("Update Failed")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={!!teacher} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md glass-3 border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <DialogHeader className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                            <Edit className="w-5 h-5" />
                        </div>
                        <DialogTitle className="font-serif text-xl font-medium tracking-tight">Modify Profile</DialogTitle>
                        <DialogDescription className="text-[11px] opacity-60 leading-relaxed font-normal">
                            Update faculty credentials and institutional identifiers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Full Name</Label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="Teacher Name"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Employee ID</Label>
                            <Input 
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="EMP-001"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Official Email</Label>
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                placeholder="email@academy.com"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Phone Number</Label>
                                <Input 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                    placeholder="+1 234..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase tracking-widest font-black opacity-30 ml-1">Portal Password</Label>
                                <Input 
                                    type="password"
                                    value={formData.employeePassword}
                                    onChange={(e) => setFormData({...formData, employeePassword: e.target.value})}
                                    className="h-10 bg-background/50 border-primary/10 rounded-lg text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-12 bg-primary hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                        >
                            {isSaving ? "Synchronizing..." : "Update Record"}
                        </Button>
                        <Button 
                            type="button"
                            variant="ghost" 
                            onClick={onClose} 
                            className="h-10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
