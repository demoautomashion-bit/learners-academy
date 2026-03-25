'use client'

import { Logo } from '@/components/logo'
import { motion } from 'framer-motion'
import { SignIn } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-linear-to-b from-background to-muted/30">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <Logo size="2xl" orientation="vertical" className="mb-4" />
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-sans opacity-70">
          Identity & Access Management
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="shadow-2xl rounded-2xl overflow-hidden scale-110"
      >
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 transition-all',
              card: 'shadow-none border-none py-4',
              headerTitle: 'font-serif text-2xl',
              headerSubtitle: 'text-muted-foreground',
            }
          }}
          fallbackRedirectUrl="/teacher" // Default for now
        />
      </motion.div>
    </div>
  )
}
