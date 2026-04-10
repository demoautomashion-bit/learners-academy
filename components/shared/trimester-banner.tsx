'use client'

import { useMemo } from 'react'
import { getActiveTrimester, getDaysRemaining } from '@/lib/trimesters'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface TrimesterBannerProps {
  className?: string
}

export function TrimesterBanner({ className }: TrimesterBannerProps) {
  const hasMounted = useHasMounted()

  const trimester = useMemo(() => {
    if (!hasMounted) return null
    return getActiveTrimester()
  }, [hasMounted])

  const daysRemaining = useMemo(() => {
    if (!trimester) return 0
    return getDaysRemaining(trimester)
  }, [trimester])

  if (!hasMounted || !trimester) {
    return (
      <div className={cn(
        'h-10 rounded-xl bg-primary/5 animate-pulse border border-primary/5',
        className
      )} />
    )
  }

  const progress = useMemo(() => {
    if (!hasMounted || !trimester) return 0
    const total = trimester.end.getTime() - trimester.start.getTime()
    const elapsed = new Date().getTime() - trimester.start.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }, [hasMounted, trimester])

  return (
    <div className={cn(
      'relative flex items-center gap-4 px-5 py-3 rounded-xl overflow-hidden',
      'border border-primary/8 bg-primary/[0.02]',
      'transition-all duration-300',
      className
    )}>
      {/* Progress fill */}
      <div
        className="absolute inset-0 bg-primary/[0.03] origin-left transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />

      <div className="relative flex items-center gap-2 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/50">
          Active Trimester
        </span>
      </div>

      <div className="relative flex items-center gap-1.5">
        <span className="text-sm font-serif font-normal text-foreground">
          {trimester.label}
        </span>
        <span className="text-muted-foreground opacity-30 text-sm">·</span>
        <span className="text-xs text-muted-foreground font-normal opacity-50">
          {trimester.range}
        </span>
        <span className="text-muted-foreground opacity-30 text-sm">·</span>
        <span className={cn(
          'text-[10px] font-normal tracking-wide',
          daysRemaining <= 14 ? 'text-warning' : 'text-muted-foreground opacity-40'
        )}>
          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Trimester concluded'}
        </span>
      </div>

      <div className="relative ml-auto flex items-center gap-1.5 opacity-20">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[9px] uppercase tracking-widest font-normal text-primary">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
