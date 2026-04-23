'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGGER_ITEM } from '@/lib/premium-motion'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export interface Column<T> {
  label: string
  render: (item: T, index: number) => React.ReactNode
  className?: string
  width?: string
}

interface EntityDataGridProps<T = any> {
  data: T[]
  columns: Column<T>[]
  emptyState?: React.ReactNode
  cardWrapper?: boolean
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  rowClassName?: string | ((item: T) => string)
}

export function EntityDataGrid<T>({ 
  data, 
  columns, 
  emptyState, 
  cardWrapper = true,
  title,
  description,
  actions,
  className,
  rowClassName
}: EntityDataGridProps<T>) {
  
  const TableContent = (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10 border-b h-16">
            <TableRow className="border-none hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead 
                  key={i} 
                  style={{ width: col.width }}
                  className={cn(
                    "text-xs font-normal text-muted-foreground opacity-80",
                    i === 0 && "pl-10",
                    i === columns.length - 1 && "pr-10 text-right",
                    col.className
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-32 text-center text-sm text-muted-foreground opacity-50"
                >
                  {emptyState || 'No institutional records localize for this query.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, ri) => (
                <TableRow 
                  key={ri} 
                  className={cn(
                    "group border-b hover:bg-primary/[0.01] transition-premium h-20",
                    typeof rowClassName === 'function' ? rowClassName(item) : rowClassName
                  )}
                >
                  {columns.map((col, ci) => (
                    <TableCell 
                      key={ci} 
                      className={cn(
                        "text-sm font-normal",
                        ci === 0 && "pl-10",
                        ci === columns.length - 1 && "pr-10 text-right",
                        col.className
                      )}
                    >
                      {col.render(item, ri)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-primary/5">
        {data.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground opacity-50">
            {emptyState || 'No institutional records found.'}
          </div>
        ) : (
          data.map((item, ri) => (
            <div key={ri} className="p-6 space-y-4 hover:bg-primary/[0.01] transition-colors">
              {columns.map((col, ci) => (
                <div key={ci} className={cn(
                  "flex flex-col gap-1",
                  ci === columns.length - 1 && "pt-2"
                )}>
                  {col.label && ci < columns.length - 1 && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-40">
                      {col.label}
                    </span>
                  )}
                  <div className={cn(
                    "w-full",
                    ci === columns.length - 1 && "flex justify-end"
                  )}>
                    {col.render(item, ri)}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )

  if (!cardWrapper) {
    return (
      <motion.div variants={STAGGER_ITEM} className={cn("space-y-6", className)}>
        {TableContent}
      </motion.div>
    )
  }

  return (
    <motion.div variants={STAGGER_ITEM} className={cn("", className)}>
      <Card className="glass-1 overflow-hidden rounded-2xl shadow-premium transition-premium hover:translate-y-[-2px] h-full flex flex-col">
        {(title || description || actions) && (
          <CardHeader className="bg-muted/5 border-b p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                {title && <CardTitle className="font-serif text-xl font-medium">{title}</CardTitle>}
                {description && <CardDescription className="text-xs mt-1 font-normal opacity-60">{description}</CardDescription>}
              </div>
              {actions && <div>{actions}</div>}
            </div>
          </CardHeader>
        )}
        <CardContent className="p-0 flex-1">
          {TableContent}
        </CardContent>
      </Card>
    </motion.div>
  )
}
