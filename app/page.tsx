'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion'
import {
  GraduationCap, Users, ArrowRight, Shield, Lock,
  ClipboardList, Calendar, X, Megaphone, Clock, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ParticleField } from '@/components/particle-field'
import { PerspectiveTilt } from '@/components/shared/perspective-tilt'
import { useData } from '@/contexts/data-context'

// ─── RAF-based smooth counter ────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!isInView) return
    const duration = 1600
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isInView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Shared animation variants ───────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 }
  }
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } }
}

const portalItem = {
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } }
}

// ─── Data ────────────────────────────────────────────────────────
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Registration Open: Academic Term 2',
    date: 'June 11, 2026',
    category: 'Term Announcement',
    summary: 'Enrollment is now open for Term 2. Explore new English courses and book your time-slots.',
    content: 'We are pleased to announce that enrollment for Academic Term 2 is now open. Students can choose from our updated course list, including advanced communication, creative writing, and professional English. Register early to secure your preferred class times.',
  },
  {
    id: '2',
    title: 'Midterm Results & Progress Reports',
    date: 'June 01, 2026',
    category: 'Academic',
    summary: 'Midterm results and teacher feedback are now available in the student portal.',
    content: 'The midterm results for the current cycle are now ready. Parents and students can log into the Student Portal to view grades, teacher comments, and attendance records.',
  },
  {
    id: '3',
    title: 'Platform Updates & Improvements',
    date: 'May 24, 2026',
    category: 'Updates',
    summary: 'New security and platform improvements are fully live.',
    content: 'We have updated our platform with stronger security, better test tools, and mobile notifications. Check your portal settings for more details on the new features.',
  }
]

const PORTALS = [
  {
    title: 'Admin Portal',
    subtitle: 'System Control',
    description: 'Manage settings, control user access, and keep an eye on system activity.',
    href: '/auth/login?role=admin',
    icon: Shield,
    accent: 'Restricted'
  },
  {
    title: 'Teacher Portal',
    subtitle: 'Class Management',
    description: 'Run your classes, set assessments, and track how your students are doing.',
    href: '/auth/login?role=teacher',
    icon: Users,
    accent: 'Faculty Only'
  },
  {
    title: 'Assessment Portal',
    subtitle: 'Student Exams',
    description: 'Log in to start your secure, timed academic assessment.',
    href: '/student',
    icon: ClipboardList,
    accent: 'Student Access'
  }
]

// ─── Main Component ──────────────────────────────────────────────
export default function HomePage() {
  const { announcements } = useData()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 28, restDelta: 0.001 })

  const displayAnnouncements = announcements.length > 0 ? announcements : MOCK_ANNOUNCEMENTS

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 lg:px-8 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">

      {/* ── Scroll Progress Bar ── */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[100] shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
      />

      <ParticleField />

      {/* ── Countdown Ticker ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full bg-primary/5 border-b border-primary/10 py-2.5 px-4 backdrop-blur-md absolute top-0 left-0 right-0 z-30 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs font-bold text-primary text-center"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
          🔔 Term 2 Registration Open — 14 days left.
        </span>
        <button
          onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })}
          className="underline hover:text-primary/70 transition-colors text-[11px]"
        >
          View Details
        </button>
      </motion.div>

      {/* ── Drifting Ambient Orbs ── */}
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

        {/* ── Hero Section ── */}
        <div className="flex flex-col items-center mb-20 text-center max-w-3xl w-full px-2">
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

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15] mb-1"
          >
            Sculpting Eloquence.
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-6"
          >
            <span className="text-primary/80">Auditing Excellence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.47, duration: 0.65 }}
            className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mb-8"
          >
            Quality English education with expert teachers, a verified course plan, and clear progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center"
          >
            <Button
              onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="w-full sm:w-auto rounded-full h-12 px-6 text-xs uppercase tracking-widest font-bold border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              View Term Schedules
            </Button>
            <Button
              onClick={() => document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto rounded-full h-12 px-6 text-xs uppercase tracking-widest font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
            >
              Go to Your Portal
            </Button>
          </motion.div>
        </div>

        {/* ── Portal Grid (scroll-triggered, glow-only hover) ── */}
        <motion.div
          id="portals"
          className="grid gap-6 md:gap-8 md:grid-cols-3 w-full"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {PORTALS.map((portal) => (
            <motion.div
              key={portal.title}
              variants={portalItem}
              className="h-full"
            >
              <PerspectiveTilt intensity={12} className="h-full">
                <Link href={portal.href} className="block h-full group">
                  <Card className="min-h-[300px] border-border bg-card/40 backdrop-blur-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:border-primary/40 hover:shadow-[0_24px_64px_-16px_hsl(var(--primary)/0.18)] relative flex flex-col justify-center">

                    <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                      <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border border-border">
                        {portal.accent}
                      </div>
                    </div>

                    <CardContent className="p-8 flex flex-col items-center text-center h-full relative z-10 flex-grow">
                      <div
                        className="p-5 rounded-[2.5rem] bg-primary/5 mb-8 ring-1 ring-black/5 dark:ring-white/10 group-hover:bg-primary/10 transition-all duration-500"
                        style={{ transform: 'translateZ(80px)' }}
                      >
                        <portal.icon className="w-10 h-10 text-primary" />
                      </div>

                      <div style={{ transform: 'translateZ(40px)' }} className="space-y-4 flex flex-col items-center flex-grow">
                        <div>
                          <h3 className="font-serif text-2xl font-bold mb-1">{portal.title}</h3>
                          <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">{portal.subtitle}</p>
                        </div>
                        <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-grow max-w-[240px]">{portal.description}</p>
                      </div>

                      <div style={{ transform: 'translateZ(60px)' }} className="w-full mt-8">
                        <Button variant="outline" className="font-sans w-full group/btn h-14 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-400 border-primary/10 hover:bg-primary hover:text-white hover:border-primary shadow-lg hover:shadow-primary/30 rounded-2xl bg-white/5 backdrop-blur-md">
                          Access Domain
                          <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </PerspectiveTilt>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Highlights Grid (staggered scroll reveal) ── */}
        <motion.div
          className="w-full mt-28 grid gap-6 md:gap-8 md:grid-cols-3 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            {
              icon: BookOpen,
              title: 'Verified Course Plan',
              desc: 'Courses designed to meet international language standards, reviewed every year.'
            },
            {
              icon: Shield,
              title: 'Secure Exam Rooms',
              desc: 'Secure exam rooms, automatic checks, and protected student records.'
            },
            {
              icon: Megaphone,
              title: 'Instant SMS Alerts',
              desc: 'Get a text message the moment your grades, term news, or class schedules are posted.'
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUpItem}
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

        {/* ── Stats Bar (staggered + RAF counters) ── */}
        <motion.div
          className="w-full mt-20 p-8 rounded-[2rem] bg-linear-to-r from-primary/5 via-primary/[0.02] to-primary/5 border border-primary/10 flex flex-col md:flex-row justify-around items-center gap-0 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {[
            { target: 98, suffix: '%', label: 'Graduation Rate' },
            { target: 12, suffix: '+', label: 'Course Levels' },
            { target: 500, suffix: '+', label: 'Active Students' }
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <>
                  {/* vertical divider on md+ */}
                  <div className="hidden md:block w-px h-12 bg-primary/10 self-center" />
                  {/* horizontal divider on mobile */}
                  <div className="block md:hidden w-full h-px bg-primary/10 my-4" />
                </>
              )}
              <motion.div variants={fadeUpItem} className="space-y-1 py-2 md:py-0">
                <div className="font-serif text-4xl md:text-5xl font-black text-primary">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</div>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

        {/* ── Announcements Section ── */}
        <div id="announcements" className="w-full mt-20 mb-12">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              Latest News
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Academy Announcements</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Stay up to date with term schedules, registration deadlines, and news from the academy.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-5 md:grid-cols-3 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {displayAnnouncements.map((announcement) => (
              <motion.div
                key={announcement.id}
                variants={fadeUpItem}
              >
                <Card className="border-border bg-card/20 backdrop-blur-2xl rounded-[1.8rem] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="space-y-3">
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

                    <div className="mt-5">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="h-10 w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest text-primary px-0 sm:px-3 hover:bg-primary/5 hover:text-primary/80 flex items-center gap-1.5 justify-start sm:justify-center transition-colors"
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

        {/* ── Footer Trust Badges ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-14 mb-8 flex flex-col items-center gap-5"
        >
          <div className="flex flex-wrap justify-center gap-5 md:gap-10 text-muted-foreground opacity-60">
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

          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 hover:text-primary transition-colors">
            Want to stop receiving messages?{' '}
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
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-background/95 border border-border p-7 sm:p-8 rounded-[2rem] shadow-2xl z-10 space-y-6 mx-2"
            >
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-primary/60 bg-primary/5 px-2.5 py-1 rounded-lg">
                    {selectedAnnouncement.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedAnnouncement.date}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight pr-8">{selectedAnnouncement.title}</h3>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-4">
                {selectedAnnouncement.content}
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button onClick={() => setSelectedAnnouncement(null)} className="flex-1 rounded-xl h-11">
                  Got It
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
