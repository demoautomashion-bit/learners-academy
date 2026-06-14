'use client'

import React, { useState, useEffect } from 'react'
import { useData } from '@/contexts/data-context'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { CARD_TEMPLATE_TIERS } from '@/lib/utils/card-tiers'
import { Upload, Save, Trash2, Sliders, Layout, Award } from 'lucide-react'

// Default container dimensions structure
const DEFAULT_DIMENSIONS = {
  width: 100, // percentage of standard 210mm layout
  height: 100, // percentage of standard 297mm layout
  borderRadius: 0, // edges in px
  padding: 0 // inner boundary padding in px
}

export default function CardTemplatesPage() {
  const { cardTemplates, saveCardTemplate, deleteCardTemplate } = useData()
  const [selectedTier, setSelectedTier] = useState<string>(CARD_TEMPLATE_TIERS[0].id)
  const [backgroundUrl, setBackgroundUrl] = useState<string>('/actual-result-card.jpeg')
  const [dimensions, setDimensions] = useState<any>({ ...DEFAULT_DIMENSIONS })
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Load custom template when selectedTier or cardTemplates changes
  useEffect(() => {
    const customTemplate = (cardTemplates || []).find((t: any) => t.level === selectedTier)
    if (customTemplate) {
      setBackgroundUrl(customTemplate.backgroundUrl)
      if (customTemplate.coordinates) {
        setDimensions({
          ...DEFAULT_DIMENSIONS,
          ...customTemplate.coordinates
        })
      } else {
        setDimensions({ ...DEFAULT_DIMENSIONS })
      }
    } else {
      setBackgroundUrl('/actual-result-card.jpeg')
      setDimensions({ ...DEFAULT_DIMENSIONS })
    }
  }, [selectedTier, cardTemplates])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string)
        toast.success('Design uploaded. Click Save to publish changes.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDimensionChange = (prop: string, value: number) => {
    setDimensions((prev: any) => ({
      ...prev,
      [prop]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveCardTemplate(selectedTier, backgroundUrl, dimensions)
      toast.success('Card design template updated successfully.')
    } catch (error) {
      toast.error('Failed to save card design configuration.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm(`Are you sure you want to restore the default design for this tier?`)) {
      setIsResetting(true)
      try {
        await deleteCardTemplate(selectedTier)
        toast.success('Card design restored to defaults.')
      } catch (error) {
        toast.error('Failed to reset template.')
      } finally {
        setIsResetting(false)
      }
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Card Design Templates"
        description="Upload custom report card designs and configure display boundaries per academic tier."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" /> Target Tier Group
              </CardTitle>
              <CardDescription className="text-xs">Choose the class level group to configure designs for.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl">
                  <SelectValue placeholder="Select Tier Group..." />
                </SelectTrigger>
                <SelectContent className="glass-2">
                  {CARD_TEMPLATE_TIERS.map(tier => (
                    <SelectItem key={tier.id} value={tier.id}>{tier.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload New Design
              </CardTitle>
              <CardDescription className="text-xs">Upload background image (A4 JPEG/PNG format recommended).</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-4">
              <div className="relative border-2 border-dashed border-primary/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-primary/[0.01] hover:bg-primary/[0.03] transition-all">
                <Upload className="w-8 h-8 text-primary opacity-40 mb-2" />
                <span className="text-xs font-medium text-muted-foreground opacity-60">Upload card background image</span>
                <input 
                  type="file" 
                  accept="image/*,application/zip,application/pdf" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" /> Card Dimension Controls
              </CardTitle>
              <CardDescription className="text-xs">Precisely modify the card layout sizes, edges, and padding constraints.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <Label className="text-xs font-semibold">Width Scale (%)</Label>
                <Input 
                  type="number"
                  min="20"
                  max="150"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 100)}
                  className="mt-1 h-10 bg-background/50 border-none px-3"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Height Scale (%)</Label>
                <Input 
                  type="number"
                  min="20"
                  max="150"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 100)}
                  className="mt-1 h-10 bg-background/50 border-none px-3"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Edges / Border Radius (px)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={dimensions.borderRadius}
                  onChange={(e) => handleDimensionChange('borderRadius', parseFloat(e.target.value) || 0)}
                  className="mt-1 h-10 bg-background/50 border-none px-3"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Inner Margin/Padding (px)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="200"
                  value={dimensions.padding}
                  onChange={(e) => handleDimensionChange('padding', parseFloat(e.target.value) || 0)}
                  className="mt-1 h-10 bg-background/50 border-none px-3"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10 text-xs font-bold uppercase tracking-wider"
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button 
              onClick={handleReset} 
              disabled={isResetting} 
              variant="outline" 
              className="h-12 px-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-bold uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE VISUAL PREVIEW */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <Card className="w-full glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
            <CardHeader className="p-0 mb-6 w-full flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Live Card Layout Preview
                </CardTitle>
                <CardDescription className="text-xs">Visual layout preview matching real proportions</CardDescription>
              </div>
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] uppercase font-mono text-primary font-bold">
                Adaptive Preview
              </div>
            </CardHeader>
            <CardContent className="p-0 w-full flex justify-center items-center relative overflow-hidden bg-muted/30 rounded-2xl border border-white/5 py-4 min-h-[400px]">
              {/* Aspect Ratio Box to avoid clipping & cuts */}
              <div className="w-full max-w-[400px] aspect-[1/1.414] relative flex items-center justify-center p-4">
                <div 
                  className="shadow-2xl border border-black/10 transition-all duration-300"
                  style={{
                    width: `${dimensions.width || 100}%`,
                    height: `${dimensions.height || 100}%`,
                    borderRadius: `${dimensions.borderRadius || 0}px`,
                    padding: `${dimensions.padding || 0}px`,
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    aspectRatio: '210/297'
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 rounded-[inherit]">
                    <span className="text-[10px] uppercase tracking-widest bg-white/95 text-black font-bold px-2 py-1 rounded shadow-sm">
                      A4 Template View
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

