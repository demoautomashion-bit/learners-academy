'use client'

import { useState, useRef } from 'react'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/premium-motion'
import { 
  Volume2, Plus, Search, Trash2, Play, Pause, 
  Music, UploadCloud, Clock, Calendar, FileAudio 
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

export default function AudioLibraryPage() {
  const { audioFiles, uploadAudio, deleteAudio, isInitialized } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = audioFiles?.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlay = (file: any) => {
    if (playingId === file.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = file.url
        audioRef.current.play()
        setPlayingId(file.id)
      }
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    
    if (!file) {
      toast.error('Please select a pedagogical asset')
      return
    }

    setIsUploading(true)
    try {
      await uploadAudio(formData)
      setIsUploadOpen(false)
      toast.success('Institutional asset verified and stored')
    } catch {
      // Error handled by context
    } finally {
      setIsUploading(false)
    }
  }

  if (!isInitialized) return <DashboardSkeleton />

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-medium text-foreground leading-none">Institutional Audio Vault</h1>
              <p className="text-muted-foreground text-sm mt-2 opacity-70">
                Securely manage your private repository of auditory pedagogical assets.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 hover-lift shadow-premium">
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-xs font-normal">Add Asset</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-serif font-normal">Upload Auditory Block</DialogTitle>
              <DialogDescription className="text-xs opacity-60">
                Add high-fidelity audio clips for your listening assessments.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="p-6 pt-2 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Asset Title</label>
                  <Input name="title" placeholder="e.g., Unit 4 - Listening Comprehension" required 
                    className="h-12 bg-muted/5 border-primary/10 rounded-xl focus:ring-primary/20" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Audio File</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/10 rounded-2xl p-8 text-center cursor-pointer hover:bg-primary/[0.02] transition-all group"
                  >
                    <UploadCloud className="w-10 h-10 text-primary/20 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">MP3, WAV, or OGG (Max 20MB)</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      name="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) toast.info(`Selected: ${file.name}`)
                      }}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-primary/5 flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={isUploading} className="rounded-xl flex-1">
                  {isUploading ? "Processing..." : "Verify & Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="px-2">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-60 transition-all" />
          <Input 
            placeholder="Search audio vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 bg-card border-primary/5 rounded-2xl shadow-sm focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Grid Section */}
      <AnimatePresence mode="wait">
        {filteredFiles?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="p-8 bg-muted/5 rounded-[3rem] border border-dashed border-primary/10 mb-6">
              <Music className="w-16 h-16 text-primary/10" />
            </div>
            <h3 className="text-xl font-serif font-normal text-muted-foreground/60">Registry Empty</h3>
            <p className="text-sm text-muted-foreground/40 mt-2">Upload your first auditory block to begin building assessments.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2"
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
          >
            {filteredFiles?.map((file) => (
              <motion.div key={file.id} variants={STAGGER_ITEM}>
                <Card className="glass-1 border-primary/5 rounded-[2rem] overflow-hidden group hover-lift transition-premium shadow-premium">
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/5 rounded-xl text-primary">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteAudio(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-medium text-foreground/80 line-clamp-1">{file.title}</h4>
                      <p className="text-[10px] font-mono text-muted-foreground opacity-40 uppercase tracking-widest">{file.filename}</p>
                    </div>

                    <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground opacity-60">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handlePlay(file)}
                        className={`w-10 h-10 rounded-full p-0 shadow-lg transition-all ${
                          playingId === file.id ? "bg-primary scale-110 shadow-primary/20" : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {playingId === file.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Player */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)}
        className="hidden"
      />
    </div>
  )
}
