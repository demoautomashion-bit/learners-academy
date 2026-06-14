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
import { ACADEMY_LEVELS } from '@/lib/registry'
import { Upload, Save, RefreshCw, Trash2, Sliders, Layout, Award, ZoomIn } from 'lucide-react'

// Default coordinates structure matching components/report-card.tsx overlays
const DEFAULT_COORDINATES = {
  studentName: { top: 27.8, left: 10, width: 80, fontSize: 36 },
  level: { top: 35.8, left: 32, width: 24, fontSize: 24 },
  midtermObtained: { top: 44.4, left: 72.5, width: 15.5, fontSize: 15 },
  finalObtained: { top: 47.9, left: 72.5, width: 15.5, fontSize: 15 },
  attendanceObtained: { top: 51.5, left: 72.5, width: 15.5, fontSize: 15 },
  participationObtained: { top: 55.0, left: 72.5, width: 15.5, fontSize: 15 },
  disciplineObtained: { top: 58.5, left: 72.5, width: 15.5, fontSize: 15 },
  extraCurricularObtained: { top: 62.1, left: 72.5, width: 15.5, fontSize: 15 },
  overallResult: { top: 70.8, left: 32, width: 14, fontSize: 18 },
  grade: { top: 70.8, left: 67, width: 14, fontSize: 18 },
  comments: { top: 76.4, left: 10, width: 80, fontSize: 24 }
}

export default function CardTemplatesPage() {
  const { cardTemplates, saveCardTemplate, deleteCardTemplate, isInitialized } = useData()
  const [selectedLevel, setSelectedLevel] = useState<string>(ACADEMY_LEVELS[0])
  const [backgroundUrl, setBackgroundUrl] = useState<string>('/actual-result-card.jpeg')
  const [coords, setCoords] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_COORDINATES)))
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)

  // Load custom template when selectedLevel or cardTemplates changes
  useEffect(() => {
    const customTemplate = (cardTemplates || []).find((t: any) => t.level === selectedLevel)
    if (customTemplate) {
      setBackgroundUrl(customTemplate.backgroundUrl)
      if (customTemplate.coordinates) {
        // Merge with defaults to prevent broken properties
        setCoords({
          ...JSON.parse(JSON.stringify(DEFAULT_COORDINATES)),
          ...customTemplate.coordinates
        })
      } else {
        setCoords(JSON.parse(JSON.stringify(DEFAULT_COORDINATES)))
      }
    } else {
      // Revert to defaults
      setBackgroundUrl('/actual-result-card.jpeg')
      setCoords(JSON.parse(JSON.stringify(DEFAULT_COORDINATES)))
    }
  }, [selectedLevel, cardTemplates])

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

  const handleCoordinateChange = (field: string, prop: string, value: number) => {
    setCoords((prev: any) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [prop]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveCardTemplate(selectedLevel, backgroundUrl, coords)
      toast.success('Card design template updated successfully.')
    } catch (error) {
      toast.error('Failed to save card design configuration.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm(`Are you sure you want to restore the default institutional design for ${selectedLevel}?`)) {
      setIsResetting(true)
      try {
        await deleteCardTemplate(selectedLevel)
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
        description="Upload custom report card designs and configure field coordinate placements per academic level."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" /> Target Level Selection
              </CardTitle>
              <CardDescription className="text-xs">Choose the class level to configure templates for.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl">
                  <SelectValue placeholder="Select Level..." />
                </SelectTrigger>
                <SelectContent className="glass-2">
                  {ACADEMY_LEVELS.map(lvl => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
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
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 max-h-[50vh] overflow-y-auto premium-scrollbar">
            <CardHeader className="p-0 mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 border-b border-white/5">
              <CardTitle className="font-serif text-lg font-medium flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" /> Coordinate Mapping Configurator
              </CardTitle>
              <CardDescription className="text-xs">Precisely reposition report card fields on the template.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {Object.keys(coords).map((field) => (
                <div 
                  key={field} 
                  className={`p-3 rounded-xl border transition-all ${
                    activeField === field 
                      ? 'border-primary/40 bg-primary/5' 
                      : 'border-white/5 bg-muted/10'
                  }`}
                  onFocus={() => setActiveField(field)}
                  onClick={() => setActiveField(field)}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div>
                      <Label className="text-[9px] uppercase tracking-widest opacity-40">Top (%)</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={coords[field].top} 
                        onChange={(e) => handleCoordinateChange(field, 'top', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs bg-background/50 border-none px-2 text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] uppercase tracking-widest opacity-40">Left (%)</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={coords[field].left} 
                        onChange={(e) => handleCoordinateChange(field, 'left', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs bg-background/50 border-none px-2 text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] uppercase tracking-widest opacity-40">Width (%)</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={coords[field].width} 
                        onChange={(e) => handleCoordinateChange(field, 'width', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs bg-background/50 border-none px-2 text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] uppercase tracking-widest opacity-40">Font (px)</Label>
                      <Input 
                        type="number" 
                        value={coords[field].fontSize} 
                        onChange={(e) => handleCoordinateChange(field, 'fontSize', parseInt(e.target.value) || 0)}
                        className="h-8 text-xs bg-background/50 border-none px-2 text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                <CardDescription className="text-xs">Visual layout for: {selectedLevel}</CardDescription>
              </div>
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] uppercase font-mono text-primary font-bold">
                A4 Layout Map
              </div>
            </CardHeader>
            <CardContent className="p-0 w-full flex justify-center items-center relative overflow-hidden bg-muted/30 rounded-2xl border border-white/5 py-8">
              {/* Scaled A4 Preview Container */}
              <div 
                className="relative bg-white shadow-lg border border-black/10 origin-center scale-[0.6] sm:scale-[0.8] md:scale-[0.9] lg:scale-[0.7] xl:scale-[0.85] transition-all"
                style={{
                  width: '210mm',
                  height: '297mm',
                  backgroundImage: `url(${backgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                {/* Visual Indicators/Labels mapped to positions */}
                {Object.keys(coords).map((field) => {
                  const isActive = activeField === field
                  return (
                    <div 
                      key={field}
                      className={`absolute flex items-center justify-center font-bold text-center border overflow-hidden whitespace-nowrap select-none transition-all ${
                        isActive 
                          ? 'border-primary bg-primary/20 text-primary z-50 animate-pulse' 
                          : 'border-dashed border-rose-500/40 bg-rose-500/10 text-rose-800/80 text-[10px] z-40'
                      }`}
                      style={{
                        top: `${coords[field].top}%`,
                        left: `${coords[field].left}%`,
                        width: `${coords[field].width}%`,
                        height: '3%',
                        fontSize: `${coords[field].fontSize * 0.75}px` // scaled preview font
                      }}
                      title={field}
                    >
                      {field.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
