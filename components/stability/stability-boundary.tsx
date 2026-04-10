'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Institutional Stability Boundary
 * A premium error boundary designed to catch component-level crashes
 * while keeping the portal interactive.
 */
export class StabilityBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[StabilityBoundary] Component ${this.props.name || 'Unknown'} crashed:`, error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="p-8 rounded-2xl border border-primary/5 bg-primary/[0.02] backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
          <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-primary/40" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold opacity-80">Module Temporarily Offline</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-50">
              Technical disruption safe-guarded in {this.props.name || 'this section'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={this.handleReset}
            className="h-8 rounded-lg text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
          >
            <RefreshCcw className="mr-2 h-3 w-3" />
            Restore Registry View
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
