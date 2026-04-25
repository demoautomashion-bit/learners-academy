'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGGER_ITEM } from '@/lib/premium-motion'
import { cn } from '@/lib/utils'

interface EntityCardGridProps<T = any> {
  data?: T[]
  renderItem?: (item: T, index: number) => React.ReactNode
  children?: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 5
  className?: string
  gap?: 4 | 6 | 8
}

export function EntityCardGrid<T>({ 
  data, 
  renderItem, 
  children, 
  columns = 3, 
  className,
  gap = 6 
}: EntityCardGridProps<T>) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
  }

  const gridGap = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <motion.div 
      variants={STAGGER_ITEM} 
      className={cn(
        "grid grid-cols-1 items-stretch", 
        gridCols[columns], 
        gridGap[gap],
        className
      )}
    >
      {data && renderItem ? data.map((item, i) => renderItem(item, i)) : children}
    </motion.div>
  )
}
