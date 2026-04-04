'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface State {
  hasError: boolean
  error: Error | null
}

export class TeacherErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[TeacherPortal] Boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-12">
          <div className="p-5 bg-destructive/10 rounded-3xl border border-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive opacity-60" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-normal">Portal Error</h2>
            <p className="text-sm text-muted-foreground font-normal opacity-70 max-w-sm">
              An unexpected error occurred in this section. Your data is safe.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono text-destructive/60 mt-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="rounded-xl h-12 px-8"
          >
            <span className="text-[10px] uppercase tracking-widest font-normal">
              Reload Portal
            </span>
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
