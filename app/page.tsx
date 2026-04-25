'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Users, ArrowRight, Shield, Lock, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ParticleField } from '@/components/particle-field'
import { PerspectiveTilt } from '@/components/shared/perspective-tilt'

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

        {/* Footer Integrity Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 flex flex-wrap justify-center gap-6 md:gap-12 text-muted-foreground opacity-60"
        >
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
        </motion.div>

      </div>
    </div>
  )
}
