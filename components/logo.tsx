'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  href?: string
  variant?: 'default' | 'light' | 'dark'
  loading?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const sizeMap = {
  sm: { image: 32, text: 'text-lg' },
  md: { image: 48, text: 'text-xl' },
  lg: { image: 64, text: 'text-2xl' },
  xl: { image: 80, text: 'text-3xl' },
  '2xl': { image: 120, text: 'text-4xl' },
}

export function Logo({ 
  className, 
  showText = true, 
  size = 'md',
  href = '/',
  variant = 'default',
  loading = false,
  orientation = 'horizontal',
}: LogoProps) {
  const { image: imageSize, text: textSize } = sizeMap[size]
  
  const textColorClass = variant === 'light' 
    ? 'text-white' 
    : variant === 'dark' 
      ? 'text-foreground' 
      : 'text-foreground'

  const content = (
    <div className={cn(
      'flex items-center relative transition-all duration-500', 
      orientation === 'vertical' ? 'flex-col gap-6 text-center' : 'gap-3',
      className
    )}>
      <div className={cn(
        'relative flex-shrink-0',
        loading && 'after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-white/70 after:to-transparent after:translate-x-[-100%] after:animate-shimmer overflow-hidden rounded-full'
      )}>
        <Image
          src="/images/logo.png"
          alt="The Learners Academy Logo"
          width={imageSize}
          height={imageSize}
          className={cn('object-contain transition-all duration-700', loading && 'opacity-50 grayscale contrast-125')}
          priority
        />
      </div>
      {showText && (
        <div className={cn(
          'flex flex-col leading-none relative overflow-hidden', 
          textColorClass,
          orientation === 'vertical' ? 'items-center' : ''
        )}>
          <span className={cn('font-serif font-medium tracking-tight whitespace-nowrap', textSize)}>
            The Learners Academy
          </span>
          {loading && (
            <motion.div 
              className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
        </div>
      )}
    </div>
  )

  if (href && !loading) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
