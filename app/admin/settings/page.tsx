'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SecureInput } from '@/components/ui/secure-input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'

export default function SettingsPage() {
  const hasMounted = useHasMounted()
  const { user, updateUser, isInitialized: authInitialized } = useAuth()
  const { isInitialized: dataInitialized } = useData()
  const [isLoading, setIsLoading] = useState(false)

  if (!hasMounted) return null
  if (!authInitialized || !dataInitialized || !user?.id) return <DashboardSkeleton />

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string })
        toast.success('Academy logo updated successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)
    toast.success('Settings synchronized successfully')
  }

  return (
    <PageShell>
      <PageHeader 
        title="Settings"
        description="Manage your academy settings and preferences"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2 px-6">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-6">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 px-6">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            <Card className="glass-1 md:col-span-2 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
              <CardHeader>
                <CardTitle className="font-serif text-xl font-medium">Institute Information</CardTitle>
                <CardDescription>
                  Core academic identity and branding parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-editorial-label">Institute Name</FieldLabel>
                    <Input defaultValue="The Learners Academy" className="bg-background/50" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Academic Tagline</FieldLabel>
                    <Input defaultValue="Premium English Language Education" className="bg-background/50" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-editorial-label">Registry Description</FieldLabel>
                    <Textarea 
                      defaultValue="Empowering learners with world-class language education since 2010."
                      rows={4}
                      className="bg-background/50"
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
              <CardHeader>
                <CardTitle className="font-serif text-xl font-medium">Academy Branding</CardTitle>
                <CardDescription>
                  Manage the official logo and institutional profile icon.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 flex-1">
                <div className="relative group cursor-pointer mb-6">
                  <div className="w-32 h-32 border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden transition-all">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary/20" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-normal text-primary opacity-60">Official Logo</p>
                  <p className="text-xs text-muted-foreground">Supported: JPG, PNG, SVG (Max 2MB)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="font-normal">
              {isLoading ? 'Syncing...' : 'Save General changes'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password regularly to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Current Password</FieldLabel>
                  <SecureInput placeholder="••••••••" />
                </Field>
                <Field>
                  <FieldLabel>New Password</FieldLabel>
                  <SecureInput placeholder="••••••••" />
                  <FieldDescription>
                    Must be at least 8 characters with a mix of letters, numbers, and symbols
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <SecureInput placeholder="••••••••" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-normal">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass-1 rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-medium">Interface Configuration</CardTitle>
              <CardDescription>
                Tailor the visual intensity and density of your administration portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-normal">Dark Mode Appearance</p>
                  <p className="text-sm text-muted-foreground opacity-60">
                    Shift to a premium dark aesthetic for focused work
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-normal">High-Density Compact Mode</p>
                  <p className="text-sm text-muted-foreground opacity-60">
                    Maximize information visibility by reducing whitespace
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="font-normal">
              {isLoading ? 'applying...' : 'Apply Appearance'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
