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
  md: { image: 48, text: 'text-[22px]' },
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
      orientation === 'vertical' ? 'flex-col gap-2.5 text-center' : 'gap-3',
      className
    )}>
      <div className={cn(
        'relative flex-shrink-0 group/logo',
        loading && 'after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-white/70 after:to-transparent after:translate-x-[-100%] after:animate-shimmer overflow-hidden rounded-full'
      )}>
        {/* Cinematic Logo Disk */}
        <div className="absolute inset-[-15%] rounded-full bg-primary/5 blur-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-1000" />
        <div className="relative p-4 md:p-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-white/5 opacity-40" />
            <Image
              src="/images/logo.png"
              alt="The Learners Academy Logo"
              width={imageSize}
              height={imageSize}
              className={cn('object-contain relative z-10 transition-all duration-700 drop-shadow-2xl', loading && 'opacity-50 grayscale contrast-125')}
              priority
            />
        </div>
      </div>
      {showText && (
        <div className={cn(
          'flex flex-col leading-none relative overflow-hidden', 
          textColorClass,
          orientation === 'vertical' ? 'items-center' : ''
        )}>
          <span className={cn('font-serif font-medium tracking-tighter whitespace-nowrap', textSize)}>
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
