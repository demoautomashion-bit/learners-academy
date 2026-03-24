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

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you'd upload to a CDN. Here we simulate with a URL.
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
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsLoading(false)
    toast.success('Settings synchronized successfully')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your academy settings and preferences
        </p>
      </div>

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
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Institute Information</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Academy Branding</CardTitle>
                <CardDescription>
                  Manage the official logo and institutional profile icon.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative group cursor-pointer mb-6">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-center bg-muted/30 overflow-hidden transition-all group-hover:border-primary/50">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-primary/20" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
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
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Official Logo</p>
                  <p className="text-[11px] text-muted-foreground">Supported: JPG, PNG, SVG (Max 2MB)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="px-8 font-semibold uppercase tracking-wide">
              {isLoading ? 'Syncing...' : 'Save General changes'}
            </Button>
          </div>
        </TabsContent>



        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">Chrome on macOS - Active now</p>
                </div>
                <Button variant="outline" size="sm">This device</Button>
              </div>
              <Button variant="destructive" className="w-full">
                Sign Out All Other Sessions
              </Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Interface Configuration</CardTitle>
              <CardDescription>
                Tailor the visual intensity and density of your administration portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Dark Mode Appearance</p>
                  <p className="text-sm text-editorial-meta">
                    Shift to a premium dark aesthetic for focused work
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">High-Density Compact Mode</p>
                  <p className="text-sm text-editorial-meta">
                    Maximize information visibility by reducing whitespace
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="px-8 font-semibold uppercase tracking-wide">
              {isLoading ? 'applying...' : 'Apply Appearance'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
