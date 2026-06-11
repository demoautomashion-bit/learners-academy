'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { ParticleField } from '@/components/particle-field'
import { PerspectiveTilt } from '@/components/shared/perspective-tilt'
import { BellOff, CheckCircle, ShieldCheck, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Prefill phone from query parameter if available
  useEffect(() => {
    const phoneParam = searchParams.get('phone') || searchParams.get('p')
    if (phoneParam) {
      setPhone(phoneParam)
    }
  }, [searchParams])

  const handleConfirmUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      toast.error('Please enter a valid phone number.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCompleted(true)
      toast.success('Your subscription preference has been updated.')
    }, 1500)
  }

  const handleResubscribe = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCompleted(false)
      toast.success('You have successfully resubscribed to announcements.')
    }, 1200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 lg:px-8 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      <ParticleField />

      {/* Decorative Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        
        {/* Header Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <Logo size="lg" orientation="vertical" />
          </Link>
        </motion.div>

        {/* Action Card */}
        <PerspectiveTilt intensity={10} className="w-full">
          <Card className="border-border bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden p-8 md:p-10">
            <CardContent className="p-0">
              
              <AnimatePresence mode="wait">
                {!isCompleted ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
                        <BellOff className="w-6 h-6" />
                      </div>
                      <h2 className="font-serif text-2xl font-bold tracking-tight">
                        Opt-Out of SMS Alerts
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Please confirm your phone number below to unsubscribe from all term announcements and academic alerts.
                      </p>
                    </div>

                    <form onSubmit={handleConfirmUnsubscribe} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 000-0000"
                          className="h-12 bg-primary/[0.02] border-none text-center text-sm font-semibold tracking-wide"
                          required
                        />
                      </div>

                      <div className="p-4 bg-muted/20 rounded-2xl border border-dashed text-left space-y-2">
                        <div className="flex gap-2 items-center text-primary font-bold text-[10px] uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-primary opacity-60" />
                          Registry Protection Notice
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Your contact data is processed in accordance with system security protocol. Once opted out, you will only receive alerts if you choose to manually opt back in.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="h-12 rounded-xl text-xs uppercase tracking-widest font-bold shadow-lg shadow-primary/20 w-full"
                        >
                          {isSubmitting ? 'Processing request...' : 'Confirm Unsubscribe'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          asChild
                          className="h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-full"
                        >
                          <Link href="/" className="flex items-center justify-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Academy Portal
                          </Link>
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-serif text-2xl font-bold tracking-tight">
                        Successfully Unsubscribed
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Your phone number <strong className="text-primary">{phone}</strong> will no longer receive broadcast announcements from our academy system.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/10 rounded-2xl border text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-primary opacity-40" />
                      Changed your mind? You can resubscribe instantly.
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={handleResubscribe}
                        disabled={isSubmitting}
                        className="h-12 rounded-xl text-xs uppercase tracking-widest font-bold w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20 shadow-lg text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Resubscribing...' : 'Resubscribe Now'}
                      </Button>

                      <Button
                        variant="ghost"
                        asChild
                        className="h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-full"
                      >
                        <Link href="/">
                          Back to Academy Portal
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </PerspectiveTilt>

      </div>
    </div>
  )
}
