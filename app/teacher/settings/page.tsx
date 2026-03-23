'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Hash, 
  Phone,
  ShieldCheck
} from 'lucide-react'

export default function TeacherSettingsPage() {
  const { user } = useAuth()

  const profileData = [
    {
      label: 'Teacher Name',
      value: user?.name,
      icon: User,
      description: 'The full name displayed across the academy'
    },
    {
      label: 'Email Address',
      value: user?.email,
      icon: Mail,
      description: 'Primary contact and login email'
    },
    {
      label: 'Employee ID',
      value: user?.employeeId || 'EMP-101', // Fallback for demo
      icon: Hash,
      description: 'Institutional identification number'
    },
    {
      label: 'Phone Number',
      value: user?.phone || '+92 300 1234567', // Fallback for demo
      icon: Phone,
      description: 'Contact number for administrative purposes'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-editorial-label">
          Manage your professional identity within The Learners Academy.
        </p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-serif text-primary border border-primary/20">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'T'}
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">{user?.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-bold text-primary border-primary/20 bg-primary/5">
                  Teacher
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-success" />
                  <span>Verified Professional</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {profileData.map((item, index) => (
              <div key={index} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-muted flex items-center justify-center h-fit">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-medium text-lg leading-none">{item.value}</p>
                    <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-accent/5 border border-accent/10 p-6">
        <h3 className="font-serif font-semibold text-accent mb-2">Administrative Note</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The records above are synchronized with the central administration database. 
          If you need to update any information, please contact the Registrar&apos;s Office.
        </p>
      </div>
    </div>
  )
}
