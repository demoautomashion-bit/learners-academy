'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Users, ArrowRight, Shield, Lock, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

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
    href: '/auth/login?role=student',
    icon: ClipboardList,
    accent: 'Student Access'
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 lg:px-8 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      
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
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <Logo size="2xl" orientation="vertical" />
          </motion.div>
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
            <motion.div
              key={portal.title}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                show: { opacity: 1, scale: 1, y: 0 }
              }}
              whileHover={{ y: -5 }}
              className="group h-full"
            >
              <Link href={portal.href} className="block h-full">
                <Card className={`min-h-[320px] border-border bg-card/60 backdrop-blur-2xl overflow-hidden transition-all duration-500 shadow-xl hover:border-primary/30 hover:shadow-primary/10 relative flex flex-col justify-center`}>
                  
                  {/* Hover Accent Glow */}
                  <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                    <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground border border-border">
                      {portal.accent}
                    </div>
                  </div>

                  <CardContent className="p-8 md:p-10 flex flex-col items-center text-center h-full relative z-10 flex-grow">
                    <div className={`p-5 rounded-3xl bg-primary/5 mb-8 ring-1 ring-black/5 dark:ring-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      <portal.icon className="w-10 h-10 text-primary" />
                    </div>
                    
                    <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {portal.title}
                    </h3>
                    <p className="font-sans text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                      {portal.subtitle}
                    </p>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      {portal.description}
                    </p>

                    <Button variant="outline" className="font-sans mt-auto w-full group/btn h-12 text-sm font-bold uppercase tracking-widest transition-premium border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50">
                      Enter Portal
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
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
