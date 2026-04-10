'use client'

import { useEffect, useState, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Institutional Hydration Guard
 * Ensures that components with environmental dependencies (Dates, Browser APIs)
 * only render once the client has stabilized.
 */
export function ClientOnly({ children, fallback = null }: Props) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
