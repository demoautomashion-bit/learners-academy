'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Hash, 
  Phone,
  ShieldCheck,
  Camera
} from 'lucide-react'
import Image from 'next/image'

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
      value: user?.id ? `EMP-${user.id.toUpperCase().split('-').pop()}` : 'Not Assigned',
      icon: Hash,
      description: 'Institutional identification number'
    },
    {
      label: 'Phone Number',
      value: 'Not Provided in Registry',
      icon: Phone,
      description: 'Contact number for administrative purposes'
    }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-normal text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-editorial-meta opacity-70">
          Manage your professional identity within the institutional academy registry.
        </p>
      </div>

      <Card className="border-primary/5 bg-card/40 backdrop-blur-md shadow-premium rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-primary/5 p-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden ring-4 ring-primary/5 shadow-premium group/avatar">
                {user?.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name || 'Avatar'} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center text-3xl font-sans text-primary">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl font-normal leading-none text-foreground/80">{user?.name}</CardTitle>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className="text-[9px] h-5 px-2 py-0 tracking-widest uppercase font-normal text-primary/70 border-primary/10 bg-primary/5">
                    Registry: Teacher
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 font-normal uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-success/50" />
                    <span>Verified Faculty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-px bg-primary/5">
            {profileData.map((item, index) => (
              <div key={index} className="bg-card p-8 hover:bg-muted/5 transition-premium group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground opacity-50">{item.label}</p>
                    <item.icon className="w-4 h-4 text-primary opacity-20 group-hover:opacity-60 transition-premium" />
                  </div>
                  <p className="font-normal text-lg text-foreground/80 leading-tight font-sans">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-[2rem] bg-primary/[0.02] border border-primary/10 p-8">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-primary/5 border border-primary/5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-primary/60" />
          </div>
          <div className="space-y-2">
            <h3 className="font-normal text-primary text-base uppercase tracking-widest opacity-80">Institutional Protection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed opacity-70">
              These records are synchronized directly with the central administration database. 
              Contact the Registrar&apos;s Office to initiate any formal institutional updates or credential changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
