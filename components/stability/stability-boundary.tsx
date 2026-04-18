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
          <div className="space-y-4 w-full max-w-2xl text-left">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-serif text-xl font-bold">Execution Context Fault</h3>
            </div>
            
            <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/10 backdrop-blur-md">
              <div className="space-y-1 mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-destructive/60">Exception Identity</p>
                <p className="font-mono text-xs font-bold text-destructive break-all">
                  {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown Runtime Exception'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                   <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Stack Trace Audit</p>
                   <p className="text-[9px] font-mono opacity-20">{this.props.name || 'Global Core'}</p>
                </div>
                <div className="max-h-[300px] overflow-auto rounded-xl bg-black/[0.03] border border-black/[0.05] p-4 custom-scrollbar">
                  <pre className="font-mono text-[9px] opacity-40 leading-relaxed whitespace-pre-wrap">
                    {this.state.error?.stack || 'No extended trace data captured'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleReset}
                className="h-9 px-6 rounded-xl text-[10px] uppercase tracking-widest border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-all"
              >
                <RefreshCcw className="mr-2 h-3 w-3" />
                Attempt Recovery
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="h-9 px-6 rounded-xl text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100"
              >
                Force Reload
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
