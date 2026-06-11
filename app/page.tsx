'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion'
import { GraduationCap, Users, ArrowRight, Shield, Lock, ClipboardList, Calendar, X, Megaphone, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ParticleField } from '@/components/particle-field'
import { PerspectiveTilt } from '@/components/shared/perspective-tilt'
import { useRef } from 'react'

// ─── Animated Counter Component ─────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1800
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

// ─── Stagger container variants ──────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 }
  }
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const portalItem = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } }
}

// ─── Data ────────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────
export default function HomePage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)

  // Scroll progress bar
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 lg:px-8 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">

      {/* ── Scroll Progress Bar ── */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[100] shadow-[0_0_10px_rgba(0,0,0,0.3)]"
      />

      <ParticleField />

      {/* ── Countdown Ticker ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full bg-primary/5 border-b border-primary/10 py-3.5 px-4 backdrop-blur-md absolute top-0 left-0 right-0 z-30 flex items-center justify-center gap-2 text-xs font-bold text-primary"
      >
        <Clock className="w-4 h-4 text-primary animate-pulse" />
        <span>🔔 Term 2 Registration Open: Deadline closes in 14 days.</span>
        <button
          onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })}
          className="underline hover:text-primary/80 transition-colors ml-2"
        >
          View Announcement
        </button>
      </motion.div>

      {/* ── Drifting Ambient Orbs (animated) ── */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.08), transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.06), transparent 70%)' }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full pointer-events-none -translate-x-1/2"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.04), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">

        {/* ── Hero Section (layered entrance) ── */}
        <div className="flex flex-col items-center mb-20 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-6 scale-90 md:scale-100"
          >
            <PerspectiveTilt intensity={15} glareOpacity={0.15}>
              <Logo size="xl" orientation="vertical" />
            </PerspectiveTilt>
          </motion.div>

          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              Sculpting Eloquence.
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              <span className="text-primary/80">Auditing Excellence.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-base text-muted-foreground leading-relaxed max-w-xl mb-8"
          >
            Premium English language education powered by specialized faculty, audited digital curricula, and verified progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="rounded-full h-12 px-6 text-xs uppercase tracking-widest font-bold border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              Explore Term Schedules
            </Button>
            <Button
              onClick={() => document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full h-12 px-6 text-xs uppercase tracking-widest font-bold shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all duration-300"
            >
              Access Portals
            </Button>
          </motion.div>
        </div>

        {/* ── Portal Grid (staggered + hover lift/glow) ── */}
        <motion.div
          id="portals"
          className="grid gap-6 md:gap-8 md:grid-cols-3 w-full"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {PORTALS.map((portal) => (
            <motion.div
              key={portal.title}
              variants={portalItem}
              whileHover={{
                y: -10,
                transition: { duration: 0.25, ease: 'easeOut' }
              }}
              className="h-full"
            >
              <PerspectiveTilt intensity={12} className="h-full">
                <Link href={portal.href} className="block h-full">
                  <Card className="min-h-[300px] border-border bg-card/40 backdrop-blur-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:border-primary/40 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.2)] relative flex flex-col justify-center">

                    {/* Floating Depth Element */}
                    <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0 z-30">
                      <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border border-border">
                        {portal.accent}
                      </div>
                    </div>

                    <CardContent className="p-8 flex flex-col items-center text-center h-full relative z-10 flex-grow group">
                      <div
                        className="p-5 rounded-[2.5rem] bg-primary/5 mb-8 ring-1 ring-black/5 dark:ring-white/10 group-hover:bg-primary/10 transition-all duration-700"
                        style={{ transform: 'translateZ(80px)' }}
                      >
                        <portal.icon className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                      </div>

                      <div style={{ transform: 'translateZ(40px)' }} className="space-y-4 flex flex-col items-center flex-grow">
                        <div>
                          <h3 className="font-serif text-2xl font-bold mb-1 transition-colors">{portal.title}</h3>
                          <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">{portal.subtitle}</p>
                        </div>
                        <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-grow max-w-[240px]">{portal.description}</p>
                      </div>

                      <div style={{ transform: 'translateZ(60px)' }} className="w-full mt-8">
                        <Button variant="outline" className="font-sans w-full group/btn h-14 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 border-primary/10 hover:bg-primary hover:text-white hover:border-primary shadow-lg hover:shadow-primary/40 rounded-2xl bg-white/5 backdrop-blur-md">
                          Access Domain
                          <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </PerspectiveTilt>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Institutional Highlights (staggered scroll reveal) ── */}
        <motion.div
          className="w-full mt-32 grid gap-8 md:grid-cols-3 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            {
              icon: BookOpen,
              title: 'Audited Syllabus',
              desc: 'Linguistic courses mapped to international framework guidelines, verified annually by curriculum audits.'
            },
            {
              icon: Shield,
              title: 'Secure Testing Vault',
              desc: 'Proctored assessment environments, automated plagiarism checks, and encrypted academic records.'
            },
            {
              icon: Megaphone,
              title: 'Instant SMS Alerts',
              desc: 'Direct notifications on your mobile handset immediately when grades, term reports, or schedules go live.'
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUpItem}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-primary/[0.01] border border-primary/5 hover:border-primary/15 hover:bg-primary/[0.03] transition-colors duration-300 cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-2">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Quick Stats Bar (staggered + counter animation) ── */}
        <motion.div
          className="w-full mt-24 p-8 rounded-[2rem] bg-linear-to-r from-primary/5 via-primary/[0.02] to-primary/5 border border-primary/10 flex flex-col md:flex-row justify-around items-center gap-8 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {[
            { target: 98, suffix: '%', label: 'Graduation Rate' },
            { target: 12, suffix: '+', label: 'Academic Levels' },
            { target: 500, suffix: '+', label: 'Active Candidates' }
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="hidden md:block w-px h-12 bg-primary/10" />}
              <motion.div variants={fadeUpItem} className="space-y-1">
                <div className="font-serif text-4xl md:text-5xl font-black text-primary">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</div>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

        {/* ── Announcements Section (staggered scroll reveal) ── */}
        <div id="announcements" className="w-full mt-24 mb-12">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              Latest News
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Academy Announcements</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Stay updated with academic term schedules, registration deadlines, and campus releases.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {MOCK_ANNOUNCEMENTS.map((announcement) => (
              <motion.div
                key={announcement.id}
                variants={fadeUpItem}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Card className="border-border bg-card/20 backdrop-blur-2xl rounded-[1.8rem] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full">
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
                      <h3 className="font-serif text-xl font-bold leading-snug">{announcement.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{announcement.summary}</p>
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
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Footer Integrity & Unsubscribe ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mt-16 mb-8 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-muted-foreground opacity-60">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <Lock className="w-3.5 h-3.5" /> Encrypted
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <Shield className="w-3.5 h-3.5" /> Audit-Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold">
              <GraduationCap className="w-3.5 h-3.5" /> Institutional
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

      {/* ── Announcement Detail Modal ── */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
                <h3 className="font-serif text-2xl font-bold tracking-tight pr-8">{selectedAnnouncement.title}</h3>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-4">
                {selectedAnnouncement.content}
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button onClick={() => setSelectedAnnouncement(null)} className="flex-1 rounded-xl h-11">
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
