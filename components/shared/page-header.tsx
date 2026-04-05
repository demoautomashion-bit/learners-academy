'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGGER_ITEM } from '@/lib/premium-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  className 
}: PageHeaderProps) {
  return (
    <motion.div 
      variants={STAGGER_ITEM} 
      className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl text-foreground font-medium">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm font-normal opacity-80 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
