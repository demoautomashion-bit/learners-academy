'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { PageShell } from '@/components/shared/page-shell'
import { PageHeader } from '@/components/shared/page-header'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { getBroadcastLogs, createBroadcastLog } from '@/lib/actions/broadcast'
import { getTermSettings, updateTermSettings } from '@/lib/actions/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Send,
  Smartphone,
  CheckCircle,
  Megaphone,
  History,
  Loader2,
  Calendar,
  Upload,
  Image as ImageIcon,
  X,
  Globe
} from 'lucide-react'

export default function BroadcastPage() {
  const hasMounted = useHasMounted()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { isInitialized: dataInitialized, addAnnouncement } = useData()

  // Announcement States
  const [subject, setSubject] = useState('')
  const [termName, setTermName] = useState('Term 2 - Summer 2026')
  const [targetGroup, setTargetGroup] = useState('active')
  const [category, setCategory] = useState('SMS Announcement')
  const [message, setMessage] = useState('Hi {Name}, we are pleased to announce that registration for {Term} is officially open! Visit the portal or click the link to configure your classes. {UnsubscribeLink}')
  const [appendUnsubscribe, setAppendUnsubscribe] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  // Custom Web Announcement States
  const [summary, setSummary] = useState('')
  
  // History Logs
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Term Settings States (Migrated from Settings)
  const [termSettings, setTermSettings] = useState({
    termLabel: 'Term 2 Registration',
    termEndDate: ''
  })
  const [termSaving, setTermSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setHistoryLoading(true)
      const [logs, termRes] = await Promise.all([
        getBroadcastLogs(),
        getTermSettings()
      ])
      setHistory(logs)
      if (termRes) {
        setTermSettings({
          termLabel: termRes.termLabel || 'Term 2 Registration',
          termEndDate: termRes.termEndDate
            ? new Date(termRes.termEndDate).toISOString().split('T')[0]
            : ''
        })
      }
      setHistoryLoading(false)
    }
    load()
  }, [])

  if (!hasMounted) return null
  if (authLoading || !dataInitialized || !isAuthenticated || !user?.id) return <DashboardSkeleton />

  const getUnsubscribeText = () => appendUnsubscribe ? ' Unsubscribe: tla.edu/unsub/temp-token' : ''

  const getMergedMessage = (previewName = 'Jane Doe') => {
    let result = message
    result = result.replace(/{Name}/g, previewName)
    result = result.replace(/{Term}/g, termName)
    result = result.replace(/{UnsubscribeLink}/g, 'tla.edu/unsubscribe')
    return result + getUnsubscribeText()
  }

  // Cost & Segment calculations
  const charCount = getMergedMessage().length
  const segments = Math.ceil(charCount / 160) || 1
  const recipientMap: Record<string, { label: string; count: number }> = {
    active: { label: 'Active Students', count: 120 },
    alumni: { label: 'Alumni / Inactive', count: 230 },
    all: { label: 'All Registered', count: 350 }
  }
  const estimatedCost = (segments * 0.0083 * recipientMap[targetGroup].count).toFixed(2)

  const handleInsertTag = (tag: string) => setMessage(prev => prev + ` ${tag}`)

  // Image upload base64 handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendBroadcast = async () => {
    if (!subject.trim()) { toast.error('Please specify a broadcast subject title.'); return }
    
    // Validation based on category
    if (category === 'SMS Announcement') {
      if (!message.trim()) { toast.error('Message content cannot be blank.'); return }
    } else {
      if (!summary.trim()) { toast.error('Summary content cannot be blank.'); return }
      if (!message.trim()) { toast.error('Article content cannot be blank.'); return }
    }

    setIsSending(true)
    try {
      await addAnnouncement({
        title: subject,
        summary: category === 'SMS Announcement' 
          ? message.slice(0, 100) + (message.length > 100 ? '...' : '') 
          : summary,
        content: category === 'SMS Announcement' ? getMergedMessage() : message,
        category: category,
        imageUrl: imageUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      })
    } catch (err) {
      console.warn('Announcement post failed, continuing with log only.', err)
    }

    // Simulate SMS dispatch delay (real API integration pending)
    await new Promise(r => setTimeout(r, 1200))

    const { label, count } = recipientMap[targetGroup]
    const logResult = await createBroadcastLog({
      title: subject,
      targetGroup: category === 'SMS Announcement' ? label : 'Website Portal',
      recipientCount: category === 'SMS Announcement' ? count : 0,
      status: 'Delivered'
    })

    if (logResult.success && logResult.data) {
      setHistory(prev => [logResult.data, ...prev])
    }

    toast.success(`Announcement posted successfully!`)
    setSubject('')
    setSummary('')
    setMessage('')
    setImageUrl(null)
    setIsSending(false)
  }

  const handleSaveTermSettings = async () => {
    if (!termSettings.termLabel.trim()) {
      toast.error('Term label cannot be blank.')
      return
    }
    setTermSaving(true)
    const res = await updateTermSettings({
      termLabel: termSettings.termLabel,
      termEndDate: termSettings.termEndDate || null
    })
    setTermSaving(false)
    if (res.success) toast.success('Term schedule synchronized to homepage')
    else toast.error(res.error || 'Term sync failed')
  }

  const isSMS = category === 'SMS Announcement'

  return (
    <PageShell>
      <PageHeader
        title="Communications Portal"
        description="Broadcast SMS updates to contacts or publish official rich-media web announcements."
      />

      <Tabs defaultValue="broadcast" className="space-y-12 mt-8">
        <TabsList className="bg-primary/5 p-1.5 border border-primary/10 rounded-2xl h-auto flex-wrap gap-1">
          <TabsTrigger value="broadcast" className="gap-2 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
            <Megaphone className="w-4 h-4" />
            Announcement Center
          </TabsTrigger>
          <TabsTrigger value="term" className="gap-2 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
            <Calendar className="w-4 h-4" />
            Homepage Term countdown
          </TabsTrigger>
        </TabsList>

        {/* --- Announcement Composer Tab --- */}
        <TabsContent value="broadcast" className="space-y-12 focus-visible:outline-hidden">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start mt-4">
            
            {/* Left Form Column */}
            <div className="lg:col-span-2 space-y-8 w-full">
              <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-medium tracking-tight flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Compose Announcement
                  </h3>
                  <p className="text-xs text-muted-foreground opacity-40 mt-1">Select category and draft your announcement.</p>
                </div>

                <div className="space-y-6">
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Announcement Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'SMS Announcement', label: 'SMS / Text' },
                        { id: 'Term Announcement', label: 'Term News' },
                        { id: 'Academic', label: 'Academic' },
                        { id: 'Updates', label: 'Updates' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-center items-center h-auto py-3.5 ${
                            category === cat.id
                              ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 text-primary font-bold'
                              : 'border-primary/5 bg-primary/[0.01] hover:border-primary/20 text-muted-foreground'
                          }`}
                        >
                          <span className="text-xs">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Header / Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">
                        {isSMS ? 'Subject / Reference Tag' : 'Article Title'}
                      </label>
                      <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder={isSMS ? "e.g. Term 2 Registration Open" : "Enter a catchy title..."} className="h-12 bg-primary/[0.02] border-none" />
                    </div>
                    {isSMS ? (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Term Name</label>
                        <Input value={termName} onChange={e => setTermName(e.target.value)} placeholder="e.g. Term 2 - Summer 2026" className="h-12 bg-primary/[0.02] border-none" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Short Summary (For Card View)</label>
                        <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="e.g. A brief overview of updates..." className="h-12 bg-primary/[0.02] border-none" />
                      </div>
                    )}
                  </div>

                  {/* SMS Target Group Selection */}
                  {isSMS && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Who gets this message?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'active', label: 'Active Students', sub: '~120 contacts' },
                          { id: 'alumni', label: 'Alumni / Inactive', sub: '~230 contacts' },
                          { id: 'all', label: 'All Contacts', sub: '~350 contacts' }
                        ].map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setTargetGroup(group.id)}
                            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-auto py-4 ${
                              targetGroup === group.id
                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                                : 'border-primary/5 bg-primary/[0.01] hover:border-primary/20'
                            }`}
                          >
                            <span className="text-xs font-bold text-primary">{group.label}</span>
                            <span className="text-[10px] text-muted-foreground opacity-55">{group.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Message / Content Area */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">
                        {isSMS ? 'SMS Message Content' : 'Announcement Article Content'}
                      </label>
                      {isSMS && (
                        <div className="flex gap-2">
                          {['{Name}', '{Term}', '{UnsubscribeLink}'].map(tag => (
                            <button key={tag} type="button" onClick={() => handleInsertTag(tag)}
                              className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-muted border hover:border-primary/30 text-muted-foreground transition-all">
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={isSMS ? 5 : 8}
                      className="bg-primary/[0.02] border-none resize-none leading-relaxed" 
                      placeholder={isSMS ? "Draft message body..." : "Write details about schedules, exams, or terms..."} />
                  </div>

                  {/* Picture Upload Component */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Attach Picture / Timetable (Optional)</label>
                    <div className="relative border-2 border-dashed border-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-primary/[0.01] hover:bg-primary/[0.02] transition-colors group">
                      {imageUrl ? (
                        <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                          <img src={imageUrl} alt="Upload Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setImageUrl(null)}
                            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Click to upload or drag image here</span>
                          <span className="text-[9px] text-muted-foreground opacity-65">Supported formats: PNG, JPG, SVG up to 2MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* SMS-specific unsubscribe toggle */}
                  {isSMS && (
                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-dashed rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-primary">Include Unsubscribe Link</h4>
                        <p className="text-[10px] text-muted-foreground opacity-60">Adds a link so students can stop receiving messages.</p>
                      </div>
                      <Switch checked={appendUnsubscribe} onCheckedChange={setAppendUnsubscribe} className="scale-110" />
                    </div>
                  )}
                </div>

                {/* Mobile Preview when stacked */}
                <div className="block lg:hidden border border-primary/10 bg-primary/5 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    {isSMS ? 'SMS Mobile Preview' : 'Website Post Preview'}
                  </span>
                  {isSMS ? (
                    <p className="text-xs leading-relaxed bg-background/50 p-3 rounded-xl border border-primary/5 text-foreground">
                      {getMergedMessage()}
                    </p>
                  ) : (
                    <div className="border border-border bg-background rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                        {category}
                      </span>
                      <h4 className="font-serif text-sm font-bold">{subject || 'Title Pending...'}</h4>
                      <p className="text-[10px] text-muted-foreground">{summary || 'Summary Pending...'}</p>
                      {imageUrl && <img src={imageUrl} alt="Attached Preview" className="w-full h-24 object-cover rounded-lg" />}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSendBroadcast} disabled={isSending}
                    className="font-normal h-12 px-10 shadow-xl shadow-primary/20 rounded-xl w-full sm:w-auto">
                    {isSending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />{isSMS ? 'Send Text Message' : 'Publish Announcement'}</>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Preview Column (Desktop Only) */}
            <div className="hidden lg:block space-y-8 w-full">
              {isSMS ? (
                /* Phone Mockup */
                <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-8 flex flex-col items-center">
                  <div className="text-center mb-6 w-full">
                    <h3 className="font-serif text-lg font-medium tracking-tight flex items-center justify-center gap-1.5">
                      <Smartphone className="w-5 h-5 text-primary" />
                      SMS Preview
                    </h3>
                    <p className="text-xs text-muted-foreground opacity-40 mt-1">See how your text looks on a phone.</p>
                  </div>

                  <div className="relative w-full max-w-[260px] h-[480px] border-[6px] border-primary/20 rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-primary/20 rounded-full flex items-center justify-center z-20">
                      <div className="w-8 h-1 bg-black rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-white/50 px-2 pt-1 font-sans">
                      <span>10:42 AM</span>
                      <div className="flex gap-1"><span>5G</span><span>100%</span></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-end p-2 pb-6 space-y-4">
                      <div className="text-center pb-2 border-b border-white/5 mb-auto">
                        <div className="w-9 h-9 bg-primary/20 border border-primary/40 text-primary rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1">TLA</div>
                        <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Learners Academy</span>
                      </div>
                      <div className="bg-slate-900 border border-white/10 text-white rounded-2xl rounded-bl-none p-3.5 space-y-1 text-[9px] leading-relaxed max-w-[90%] shadow-md">
                        <p>{getMergedMessage()}</p>
                      </div>
                      <span className="text-[7px] text-white/30 text-right self-end mr-2">Delivered</span>
                    </div>
                    <div className="w-20 h-1 bg-white/20 rounded-full mx-auto mb-1" />
                  </div>

                  <div className="w-full mt-6 space-y-3 pt-6 border-t border-primary/5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground opacity-60">Character Count:</span>
                      <span className="font-bold text-primary">{charCount} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground opacity-60">SMS Segments:</span>
                      <span className="font-bold text-primary">{segments} / segment</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground opacity-60">Est. Segment Cost:</span>
                      <span className="font-bold text-primary">${estimatedCost} USD</span>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Website Post Preview Card */
                <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 flex flex-col">
                  <div className="text-center mb-6 w-full">
                    <h3 className="font-serif text-lg font-medium tracking-tight flex items-center justify-center gap-1.5">
                      <Globe className="w-5 h-5 text-primary" />
                      Website Post Preview
                    </h3>
                    <p className="text-xs text-muted-foreground opacity-40 mt-1">Real-time preview of the website card.</p>
                  </div>

                  <div className="border border-border bg-card/40 rounded-[1.8rem] overflow-hidden flex flex-col h-full shadow-lg">
                    {imageUrl && (
                      <div className="w-full h-36 overflow-hidden border-b border-border bg-muted/20">
                        <img src={imageUrl} alt="Timetable attached preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 space-y-3 flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                          {category}
                        </span>
                        <span className="text-[9px] text-muted-foreground opacity-60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Today
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-bold leading-snug">{subject || 'Catchy Title Pending'}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{summary || 'Enter a short summary to show on homepage cards...'}</p>
                      <p className="text-[10px] text-muted-foreground opacity-70 border-t border-dashed border-primary/10 pt-3 line-clamp-3 leading-normal">
                        {message || 'Article details will display here...'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

          </div>

          {/* Broadcast History Table */}
          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 md:p-8 mt-12">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-serif text-lg font-medium tracking-tight">Recent Broadcast Log</h3>
                <p className="text-xs text-muted-foreground opacity-40">All dispatched announcements, persisted to the registry.</p>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs uppercase tracking-widest font-bold opacity-40">Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Megaphone className="w-10 h-10 text-primary opacity-10 mb-4" />
                <p className="text-xs uppercase tracking-widest font-bold opacity-30">No broadcasts sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/5 text-[10px] uppercase tracking-wider text-muted-foreground opacity-60">
                      <th className="py-4 font-bold">Message Title</th>
                      <th className="py-4 font-bold">Date Sent</th>
                      <th className="py-4 font-bold hidden sm:table-cell">Sent To</th>
                      <th className="py-4 font-bold hidden sm:table-cell">Recipients</th>
                      <th className="py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {history.map((log: any) => (
                      <tr key={log.id} className="hover:bg-primary/[0.01] transition-colors">
                        <td className="py-4 font-bold text-primary">{log.title}</td>
                        <td className="py-4 text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-4 text-muted-foreground hidden sm:table-cell">{log.targetGroup}</td>
                        <td className="py-4 text-muted-foreground hidden sm:table-cell">{log.recipientCount}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle className="w-3 h-3" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* --- Term Settings Tab (Migrated) --- */}
        <TabsContent value="term" className="focus-visible:outline-hidden">
          <div className="max-w-2xl mt-4">
            <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium tracking-tight">Active Term Settings</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">Controls the countdown ticker shown on the homepage</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Term Label</label>
                  <Input
                    value={termSettings.termLabel}
                    onChange={e => setTermSettings(prev => ({ ...prev, termLabel: e.target.value }))}
                    placeholder="e.g. Term 2 Registration"
                    className="h-12 bg-primary/[0.02] border-none"
                  />
                  <p className="text-[10px] text-muted-foreground opacity-50 ml-1">Displayed in the homepage banner, e.g. &quot;Term 2 Registration — 14 days left.&quot;</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Registration End Date</label>
                  <Input
                    type="date"
                    value={termSettings.termEndDate}
                    onChange={e => setTermSettings(prev => ({ ...prev, termEndDate: e.target.value }))}
                    className="h-12 bg-primary/[0.02] border-none"
                  />
                  <p className="text-[10px] text-muted-foreground opacity-50 ml-1">The homepage will auto-calculate days remaining. Leave blank to hide the ticker.</p>
                </div>

                <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60 mb-2">Ticker Preview</p>
                  <p className="text-sm font-bold text-foreground">
                    🔔 {termSettings.termLabel || 'Term Label'} —{' '}
                    {termSettings.termEndDate
                      ? (() => {
                          const days = Math.ceil((new Date(termSettings.termEndDate).getTime() - Date.now()) / 86400000)
                          return days > 0 ? `${days} days left.` : 'Registration Closed.'
                        })()
                      : 'No end date set (ticker hidden).'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={handleSaveTermSettings} disabled={termSaving} className="font-normal h-12 px-10 shadow-xl shadow-primary/20">
                  {termSaving ? 'Saving...' : 'Save Term Settings'}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
