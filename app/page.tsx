'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Users, ArrowRight, Shield, Lock, ClipboardList, Calendar, X, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ParticleField } from '@/components/particle-field'
import { PerspectiveTilt } from '@/components/shared/perspective-tilt'

const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Registration Open: Academic Term 2',
    date: 'June 11, 2026',
    category: 'Term Announcement',
    summary: 'Enrollment is now officially open for Term 2. Explore new specialized English courses and schedule time-slots.',
    content: 'We are pleased to announce that enrollment for Academic Term 2 is now open. Students can select from our newly curated syllabus, including advanced communication blocks, creative writing seminars, and professional composition. Register early to secure your preferred class times.',
  },
  {
    id: '2',
    title: 'Midterm Evaluation & Progress Reports',
    date: 'June 01, 2026',
    category: 'Academic',
    summary: 'Midterm cycle results and teacher reviews are now available in the student portal.',
    content: 'The midterm evaluations for the current cycle have been synchronized. Parents and students can log into the Assessment Portal to view detailed grading parameters, individual teacher commentary, and attendance summaries.',
  },
  {
    id: '3',
    title: 'Institutional Upgrades & Infrastructure',
    date: 'May 24, 2026',
    category: 'Updates',
    summary: 'System rotation and brand-new online platform enhancements are fully deployed.',
    content: 'We have updated our internal registry system to support multi-factor security, adaptive test generation, and seamless mobile notifications. Check the settings panel in your respective portal for detailed setup instructions.',
  }
]

const PORTALS = [
  {
    title: 'Admin Portal',
    subtitle: 'System Control',
    description: 'Configure institutional settings, manage user access, and oversee system health.',
    href: '/auth/login?role=admin',
    icon: Shield,
    accent: 'Restricted'
  },
  {
    title: 'Teacher Portal',
    subtitle: 'Instructional Command',
    description: 'Manage classes, design assessments, and monitor student performance metrics.',
    href: '/auth/login?role=teacher',
    icon: Users,
    accent: 'Faculty Only'
  },
  {
    title: 'Assessment Portal',
    subtitle: 'Academic Vault',
    description: 'Enter your secure credentials to initiate proctored academic assessments.',
    href: '/student',
    icon: ClipboardList,
    accent: 'Student Access'
  }
]

export default function HomePage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 lg:px-8 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      <ParticleField />

      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <PerspectiveTilt intensity={25} glareOpacity={0.2}>
            <Logo size="2xl" orientation="vertical" />
          </PerspectiveTilt>
        </motion.div>

        {/* Portal Grid */}
        <motion.div 
          className="grid gap-6 md:gap-8 md:grid-cols-3 w-full"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {PORTALS.map((portal) => (
            <PerspectiveTilt key={portal.title} intensity={12} className="h-full">
              <Link href={portal.href} className="block h-full">
                <Card className={`min-h-[300px] border-border bg-card/40 backdrop-blur-3xl overflow-hidden transition-all duration-700 shadow-2xl hover:border-primary/40 relative flex flex-col justify-center`}>
                  
                  {/* Floating Depth Elements */}
                  <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0 z-30">
                    <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border border-border">
                      {portal.accent}
                    </div>
                  </div>

                  <CardContent className="p-8 flex flex-col items-center text-center h-full relative z-10 flex-grow group">
                    <div 
                      className={`p-5 rounded-[2.5rem] bg-primary/5 mb-8 ring-1 ring-black/5 dark:ring-white/10 group-hover:bg-primary/10 transition-all duration-700`}
                      style={{ transform: "translateZ(80px)" }}
                    >
                      <portal.icon className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                    </div>
                    
                    <div style={{ transform: "translateZ(40px)" }} className="space-y-4 flex flex-col items-center flex-grow">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1 transition-colors">
                          {portal.title}
                        </h3>
                        <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
                          {portal.subtitle}
                        </p>
                      </div>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-grow max-w-[240px]">
                        {portal.description}
                      </p>
                    </div>

                    <div style={{ transform: "translateZ(60px)" }} className="w-full mt-8">
                      <Button variant="outline" className="font-sans w-full group/btn h-14 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 border-primary/10 hover:bg-primary hover:text-white hover:border-primary shadow-lg hover:shadow-primary/40 rounded-2xl bg-white/5 backdrop-blur-md">
                        Access Domain
                        <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </PerspectiveTilt>
          ))}
        </motion.div>

        {/* Announcements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full mt-24 mb-12"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              Latest News
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Academy Announcements
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Stay updated with academic term schedules, registration deadlines, and campus releases.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 w-full">
            {MOCK_ANNOUNCEMENTS.map((announcement) => (
              <Card 
                key={announcement.id}
                className="border-border bg-card/20 backdrop-blur-2xl rounded-[1.8rem] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg flex flex-col h-full"
              >
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary/60 bg-primary/5 px-2.5 py-1 rounded-lg">
                        {announcement.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {announcement.date}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold leading-snug">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {announcement.summary}
                    </p>
                  </div>

                  <div className="mt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedAnnouncement(announcement)}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary p-0 hover:bg-transparent hover:text-primary/70 flex items-center gap-1.5"
                    >
                      Read Full Article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Footer Integrity & Unsubscribe Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 mb-8 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-muted-foreground opacity-60">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <Lock className="w-3.5 h-3.5" />
              Encrypted
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <Shield className="w-3.5 h-3.5" />
              Audit-Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Institutional
            </div>
          </div>

          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 hover:text-primary transition-colors mt-4">
            Do you wish to opt out of notifications?{' '}
            <Link href="/unsubscribe" className="text-primary underline hover:text-primary/80 transition-colors">
              Manage SMS Settings
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Announcement Detail Modal overlay */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-background/95 border border-border p-8 rounded-[2rem] shadow-2xl z-10 space-y-6"
            >
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-primary/60 bg-primary/5 px-2.5 py-1 rounded-lg">
                    {selectedAnnouncement.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedAnnouncement.date}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight pr-8">
                  {selectedAnnouncement.title}
                </h3>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-4">
                {selectedAnnouncement.content}
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button 
                  onClick={() => setSelectedAnnouncement(null)} 
                  className="flex-1 rounded-xl h-11"
                >
                  Acknowledge
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
