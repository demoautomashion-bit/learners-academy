'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if the component has mounted on the client.
 * Essential for any logic that relies on browser APIs or prevents hydration mismatches.
 */
export function useClientOnly() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
