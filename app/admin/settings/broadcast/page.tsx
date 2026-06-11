'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  Send, 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Sparkles, 
  Smartphone, 
  CheckCircle,
  HelpCircle,
  Megaphone,
  History
} from 'lucide-react'

const MOCK_HISTORY = [
  { id: '1', title: 'Mid-term Cycle Announcements', date: 'June 01, 2026', group: 'Active Students', count: 124, status: 'Delivered' },
  { id: '2', title: 'Term 2 Registration Open', date: 'May 15, 2026', group: 'All Registered', count: 350, status: 'Delivered' },
  { id: '3', title: 'System Security Upgrade Update', date: 'April 20, 2026', group: 'Active Students', count: 120, status: 'Delivered' }
]

export default function BroadcastPage() {
  const hasMounted = useHasMounted()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { isInitialized: dataInitialized } = useData()

  // Form states
  const [subject, setSubject] = useState('')
  const [termName, setTermName] = useState('Term 2 - Summer 2026')
  const [targetGroup, setTargetGroup] = useState('active') // active, alumni, all
  const [message, setMessage] = useState('Hi {Name}, we are pleased to announce that registration for {Term} is officially open! Visit the portal or click the link to configure your classes. {UnsubscribeLink}')
  const [appendUnsubscribe, setAppendUnsubscribe] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [history, setHistory] = useState(MOCK_HISTORY)

  if (!hasMounted) return null
  if (authLoading || !dataInitialized || !isAuthenticated || !user?.id) return <DashboardSkeleton />

  const getUnsubscribeText = () => {
    return appendUnsubscribe ? ' Unsubscribe: tla.edu/unsub/temp-token' : ''
  }

  const getMergedMessage = (previewName = 'Jane Doe') => {
    let result = message
    result = result.replace(/{Name}/g, previewName)
    result = result.replace(/{Term}/g, termName)
    result = result.replace(/{UnsubscribeLink}/g, 'tla.edu/unsubscribe')
    return result + getUnsubscribeText()
  }

  const charCount = getMergedMessage().length
  const segments = Math.ceil(charCount / 160) || 1
  const estimatedCost = (segments * 0.0083 * (targetGroup === 'active' ? 120 : targetGroup === 'alumni' ? 230 : 350)).toFixed(2)

  const handleInsertTag = (tag: string) => {
    setMessage(prev => prev + ` ${tag}`)
  }

  const handleSendBroadcast = () => {
    if (!subject.trim()) {
      toast.error('Please specify a broadcast subject title.')
      return
    }
    if (!message.trim()) {
      toast.error('Message content cannot be blank.')
      return
    }

    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const recipientCount = targetGroup === 'active' ? 120 : targetGroup === 'alumni' ? 230 : 350
      toast.success(`Mock Broadcast Sent! Simulated ${recipientCount} SMS updates dispatched successfully.`)
      
      // Add to mock history log
      const newLog = {
        id: (history.length + 1).toString(),
        title: subject,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        group: targetGroup === 'active' ? 'Active Students' : targetGroup === 'alumni' ? 'Alumni / Inactive' : 'All Registered',
        count: recipientCount,
        status: 'Delivered'
      }
      setHistory(prev => [newLog, ...prev])
      setSubject('')
    }, 1200)
  }

  return (
    <PageShell>
      <PageHeader 
        title="SMS Broadcast Center"
        description="Design, preview, and dispatch institutional announcements to students' registered phone numbers."
      />

      <div className="grid gap-8 lg:grid-cols-3 items-start mt-8">
        
        {/* Left Form Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-8 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-medium tracking-tight flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Compose Announcement
              </h3>
              <p className="text-xs text-muted-foreground opacity-40 mt-1">Configure your target segment and draft the SMS body.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Subject / Header (For Website News)</label>
                  <Input 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Term 2 General Registration Open"
                    className="h-12 bg-primary/[0.02] border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Target Term Reference</label>
                  <Input 
                    value={termName} 
                    onChange={e => setTermName(e.target.value)}
                    placeholder="e.g. Term 2 - Summer 2026"
                    className="h-12 bg-primary/[0.02] border-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Recipient Segmentation</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'active', label: 'Active Students', sub: '~120 contacts' },
                    { id: 'alumni', label: 'Alumni / Inactive', sub: '~230 contacts' },
                    { id: 'all', label: 'All Contacts', sub: '~350 contacts' }
                  ].map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setTargetGroup(group.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
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

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">SMS Message Content</label>
                  <div className="flex gap-2">
                    {['{Name}', '{Term}', '{UnsubscribeLink}'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleInsertTag(tag)}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-muted border hover:border-primary/30 text-muted-foreground transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="bg-primary/[0.02] border-none resize-none leading-relaxed"
                  placeholder="Draft message body..."
                />
              </div>

              {/* Opt-out switch toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/20 border border-dashed rounded-2xl">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary">Append Compliance Unsubscribe Footer</h4>
                  <p className="text-[10px] text-muted-foreground opacity-60">Adds direct link token to allow student self-serve unsubscribe.</p>
                </div>
                <Switch 
                  checked={appendUnsubscribe} 
                  onCheckedChange={setAppendUnsubscribe}
                  className="scale-110" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSendBroadcast} 
                disabled={isSending} 
                className="font-normal h-12 px-10 shadow-xl shadow-primary/20 rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending Broadcast...' : 'Dispatch SMS Announcement'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Phone Mockup Column */}
        <div className="space-y-8">
          <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-8 flex flex-col items-center">
            <div className="text-center mb-6 w-full">
              <h3 className="font-serif text-lg font-medium tracking-tight flex items-center justify-center gap-1.5">
                <Smartphone className="w-5 h-5 text-primary" />
                Live Handset Preview
              </h3>
              <p className="text-xs text-muted-foreground opacity-40 mt-1">Real-time simulation of incoming SMS.</p>
            </div>

            {/* Handset Mockup Container */}
            <div className="relative w-full max-w-[260px] h-[480px] border-[6px] border-primary/20 rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl overflow-hidden flex flex-col justify-between">
              
              {/* Speaker & Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-primary/20 rounded-full flex items-center justify-center z-20">
                <div className="w-8 h-1 bg-black rounded-full" />
              </div>

              {/* Header Status Bar */}
              <div className="flex justify-between items-center text-[8px] text-white/50 px-2 pt-1 font-sans">
                <span>10:42 AM</span>
                <div className="flex gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Messaging Canvas */}
              <div className="flex-1 flex flex-col justify-end p-2 pb-6 space-y-4">
                
                {/* Contact Banner Header */}
                <div className="text-center pb-2 border-b border-white/5 mb-auto">
                  <div className="w-9 h-9 bg-primary/20 border border-primary/40 text-primary rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1">
                    TLA
                  </div>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Learners Academy</span>
                </div>

                {/* SMS Text Bubble */}
                <div className="bg-slate-900 border border-white/10 text-white rounded-2xl rounded-bl-none p-3.5 space-y-1 text-[9px] leading-relaxed max-w-[90%] shadow-md">
                  <p>{getMergedMessage()}</p>
                </div>
                
                <span className="text-[7px] text-white/30 text-right self-end mr-2">Delivered</span>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-20 h-1 bg-white/20 rounded-full mx-auto mb-1" />
            </div>

            {/* Simulated Specs Indicators */}
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
        </div>

      </div>

      {/* Broadcast Logs & History Table */}
      <div className="mt-12">
        <Card className="glass-1 rounded-[2rem] border-primary/5 shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-serif text-lg font-medium tracking-tight">Recent Broadcast Log</h3>
              <p className="text-xs text-muted-foreground opacity-40">List of dispatched announcements and status metrics.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-primary/5 text-[10px] uppercase tracking-wider text-muted-foreground opacity-60">
                  <th className="py-4 font-bold">Campaign / Subject</th>
                  <th className="py-4 font-bold">Date Sent</th>
                  <th className="py-4 font-bold">Target Segment</th>
                  <th className="py-4 font-bold">Recipients</th>
                  <th className="py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/[0.01] transition-colors">
                    <td className="py-4 font-bold text-primary">{log.title}</td>
                    <td className="py-4 text-muted-foreground">{log.date}</td>
                    <td className="py-4 text-muted-foreground">{log.group}</td>
                    <td className="py-4 text-muted-foreground">{log.count}</td>
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
        </Card>
      </div>

    </PageShell>
  )
}
