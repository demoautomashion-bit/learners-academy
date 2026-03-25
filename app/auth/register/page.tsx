'use client'

import { Logo } from '@/components/logo'
import { motion } from 'framer-motion'
import { SignUp } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-linear-to-b from-background to-muted/30">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-10"
      >
        <Logo size="2xl" orientation="vertical" className="mb-4" />
        <h2 className="font-serif text-3xl font-bold text-center mb-2">Create Your Profile</h2>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-sans opacity-70">
          Join the Academy of Excellence
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="shadow-2xl rounded-3xl overflow-hidden"
      >
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 transition-all font-bold tracking-wide',
              card: 'shadow-none border-none py-6',
              headerTitle: 'font-serif text-2xl',
              headerSubtitle: 'text-editorial-meta',
            }
          }}
          fallbackRedirectUrl="/teacher" // This will be handled by onboarding logic later
        />
      </motion.div>
    </div>
  )
}
