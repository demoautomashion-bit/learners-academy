'use client'

import React, { useState, useEffect } from 'react'
import { getSystemSettings, updateSystemSettings, updateAdminPassword, updateAdminProfile } from '@/lib/actions/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SecureInput } from '@/components/ui/secure-input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Bell,
  Shield,
  Palette,
  Save,
  Upload,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  Layout
} from 'lucide-react'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { cn, getInitials } from '@/lib/utils'

export default function SettingsPage() {
  const hasMounted = useHasMounted()
  const { user, updateUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const { isInitialized: dataInitialized } = useData()
  const [identity, setIdentity] = useState({
    academyName: '',
    tagline: '',
    missionStatement: '',
    logoUrl: ''
  })
  const [security, setSecurity] = useState({
    current: '',
    newPass: '',
    confirm: ''
  })
  const [adminProfile, setAdminProfile] = useState({
    email: user?.email || '',
    avatar: user?.avatar || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const res = await getSystemSettings()
      if (res) {
        setIdentity({
          academyName: res.academyName || '',
          tagline: res.tagline || '',
          missionStatement: res.missionStatement || '',
          logoUrl: res.logoUrl || ''
        })
      }
    }
    loadSettings()
  }, [])

  if (!hasMounted) return null
  if (authLoading || !dataInitialized || !isAuthenticated || !user?.id) return <DashboardSkeleton />

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setIsLoading(true)
        const res = await updateSystemSettings({ logoUrl: base64 })
        setIsLoading(false)
        
        if (res.success) {
            setIdentity(prev => ({ ...prev, logoUrl: base64 }))
            toast.success('Institutional branding updated successfully')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveIdentity = async () => {
    setIsLoading(true)
    const res = await updateSystemSettings(identity)
    setIsLoading(false)
    if (res.success) toast.success('Institutional profile synchronized')
    else toast.error(res.error || 'Identity sync failed')
  }

  const handleUpdateSecurity = async () => {
    if (security.newPass !== security.confirm) {
        return toast.error('Tokens do not match')
    }
    setIsLoading(true)
    const res = await updateAdminPassword(user.id, security.current, security.newPass)
    setIsLoading(false)
    
    if (res.success) {
        toast.success('Security protocols rotated')
        setSecurity({ current: '', newPass: '', confirm: '' })
    } else {
        toast.error(res.error || 'Auth rotation failed')
    }
  }

  const handleAdminAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setAdminProfile(prev => ({ ...prev, avatar: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAdminProfile = async () => {
    setIsLoading(true)
    const res = await updateAdminProfile(user!.id, { 
      email: adminProfile.email, 
      avatar: adminProfile.avatar 
    })
    setIsLoading(false)
    
    if (res.success) {
      updateUser({ email: res.data?.email, avatar: res.data?.avatar })
      toast.success('Personal identity synchronized')
    } else {
      toast.error(res.error || 'Identity update failed')
    }
  }

  return (
    <PageShell>
      <PageHeader 
        title="Institutional Settings"
        description="Master configuration for academy identity, security protocols, and interface preferences."
      />

      <Tabs defaultValue="general" className="space-y-12 mt-8">
        <TabsList className="bg-primary/5 p-1.5 border border-primary/10 rounded-2xl h-14">
          <TabsTrigger value="general" className="gap-2 px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
            <Building2 className="w-4 h-4" />
            General Identity
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
            <Shield className="w-4 h-4" />
            Security & Auth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-8 md:grid-cols-3 items-start">
            <Card className="glass-1 md:col-span-2 rounded-[2rem] border-primary/5 shadow-2xl p-10">
              <div className="mb-10">
                <h3 className="font-serif text-2xl font-medium tracking-tight">Institutional Profile</h3>
                <p className="text-xs text-muted-foreground opacity-40 mt-1">Foundational data for the academy's official registry.</p>
              </div>
              <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Legal Academy Name</label>
                        <Input 
                            value={identity.academyName} 
                            onChange={e => setIdentity(prev => ({ ...prev, academyName: e.target.value }))}
                            className="h-12 bg-primary/[0.02] border-none" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Official Tagline</label>
                        <Input 
                            value={identity.tagline} 
                            onChange={e => setIdentity(prev => ({ ...prev, tagline: e.target.value }))}
                            className="h-12 bg-primary/[0.02] border-none" 
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Mission Synthesis</label>
                    <Textarea 
                        value={identity.missionStatement}
                        onChange={e => setIdentity(prev => ({ ...prev, missionStatement: e.target.value }))}
                        rows={5}
                        className="bg-primary/[0.02] border-none resize-none leading-relaxed"
                    />
                  </div>
              </div>
            </Card>

            <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-10 flex flex-col items-center">
              <div className="text-center mb-10 w-full">
                <h3 className="font-serif text-xl font-medium tracking-tight">Branding</h3>
                <p className="text-xs text-muted-foreground opacity-40 mt-1">Institutional Logo Assets</p>
              </div>
              <div className="relative group cursor-pointer mb-8">
                <div className="w-40 h-40 border-2 border-dashed border-primary/10 rounded-3xl flex items-center justify-center bg-primary/[0.02] overflow-hidden transition-all group-hover:border-primary/40">
                  {identity.logoUrl ? (
                    <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-primary opacity-20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 text-center leading-relaxed">
                Accepted Formats: PNG, SVG, JPG<br/>Recommended Resolution: 512x512px
              </p>
            </Card>
          </div>

          <div className="flex justify-end mt-12">
            <Button onClick={handleSaveIdentity} disabled={isLoading} className="font-normal h-12 px-10 shadow-xl shadow-primary/20">
              {isLoading ? 'Synchronizing...' : 'Save General Changes'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid gap-12 max-w-4xl">
                
                {/* Personal Identity Section */}
                <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-10">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-1 space-y-8 w-full">
                            <div>
                                <h3 className="font-serif text-xl font-medium tracking-tight">Personal Identity</h3>
                                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">Admin Profile Management</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Official Email Address</label>
                                <Input 
                                    value={adminProfile.email}
                                    onChange={e => setAdminProfile(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="admin@academy.com" className="h-12 bg-muted/20 border-none" 
                                />
                            </div>
                            <Button onClick={handleSaveAdminProfile} disabled={isLoading} className="font-normal h-10 px-8 shadow-md">
                                Save Profile Data
                            </Button>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 pt-2">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-32 h-32 rounded-full border-4 border-background shadow-xl">
                                    <AvatarImage src={adminProfile.avatar || undefined} alt="Admin Avatar" className="object-cover" />
                                    <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                                        {getInitials(user?.name || 'Admin', 'A')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px] rounded-full pointer-events-none">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer rounded-full" 
                                    onChange={handleAdminAvatarUpload}
                                />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Profile Picture</span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center justify-center text-destructive">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-medium tracking-tight">Credential Rotation</h3>
                            <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">Admin Password Management</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Current Password</label>
                                <SecureInput 
                                    value={security.current}
                                    onChange={e => setSecurity(prev => ({ ...prev, current: e.target.value }))}
                                    placeholder="••••••••" className="h-12 bg-muted/20 border-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">New Authority Token</label>
                                <SecureInput 
                                    value={security.newPass}
                                    onChange={e => setSecurity(prev => ({ ...prev, newPass: e.target.value }))}
                                    placeholder="••••••••" className="h-12 bg-muted/20 border-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Confirm Token</label>
                                <SecureInput 
                                    value={security.confirm}
                                    onChange={e => setSecurity(prev => ({ ...prev, confirm: e.target.value }))}
                                    placeholder="••••••••" className="h-12 bg-muted/20 border-none" 
                                />
                            </div>
                        </div>
                        <div className="p-8 bg-muted/10 rounded-3xl border border-dashed flex flex-col justify-center items-center text-center">
                            <ShieldCheck className="w-8 h-8 text-primary opacity-20 mb-4" />
                            <p className="text-xs leading-relaxed font-normal opacity-60 px-6">
                                Ensure your password exceeds 12 characters and includes non-alphanumeric symbols for institutional-grade security.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-medium">Two-Factor Authentication</h3>
                            <p className="text-xs font-normal opacity-40 mt-1">Requiring a secondary verification layer for admin access.</p>
                        </div>
                    </div>
                    <Switch className="scale-125" />
                </Card>
           </div>

           <div className="flex justify-end mt-12 max-w-4xl">
             <Button onClick={handleUpdateSecurity} disabled={isLoading} className="font-normal h-12 px-10 shadow-xl shadow-primary/20 bg-destructive hover:bg-destructive/90">
                Update Security Protocols
             </Button>
           </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
