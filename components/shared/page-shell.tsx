'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGGER_CONTAINER } from '@/lib/premium-motion'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  variants?: any
}

export function PageShell({ 
  children, 
  className, 
  variants = STAGGER_CONTAINER 
}: PageShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  )
}
