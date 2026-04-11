'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  DollarSign,
  TrendingUp,
  BarChart,
  ShieldCheck,
  PlusCircle,
  FileText,
  BadgeCheck,
  UserPlus
} from 'lucide-react'
import { useData } from '@/contexts/data-context'

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Instructors',
    href: '/admin/teachers',
    icon: Users,
    items: [
      { title: 'All Instructors', href: '/admin/teachers', icon: Users },
      { title: 'New Teacher', href: '/admin/teachers/registration', icon: UserPlus },
      { title: 'Salaries', href: '/admin/teachers/payroll', icon: DollarSign },
    ]
  },
  {
    title: 'Students',
    href: '/admin/students',
    icon: GraduationCap,
    items: [
      { title: 'All Students', href: '/admin/students', icon: GraduationCap },
      { title: 'New Admission', href: '/admin/students/registration', icon: PlusCircle },
    ]
  },
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: BookOpen,
    items: [
      { title: 'Current Classes', href: '/admin/classes', icon: BookOpen },
      { title: 'Attendance', href: '/admin/attendance', icon: BadgeCheck },
      { title: 'Timetable', href: '/admin/schedule', icon: CalendarDays },
    ]
  },
  {
    title: 'School Growth',
    href: '/admin/fee-registry',
    icon: TrendingUp,
    items: [
      { title: 'Student Fees', href: '/admin/fee-registry', icon: DollarSign },
      { title: 'Batch Financials', href: '/admin/batch-financials', icon: BarChart },
      { title: 'Money Report', href: '/admin/economics', icon: TrendingUp },
      { title: 'Enrollment trends', href: '/admin/students/enrollment-trend', icon: BarChart },
    ]
  },
  {
    title: 'Settings',
    href: '/admin/test-reviews',
    icon: ShieldCheck,
    items: [
      { title: 'Test Reviews', href: '/admin/test-reviews', icon: ShieldCheck },
      { title: 'General Settings', href: '/admin/settings', icon: Settings },
    ]
  },
]
 
function AdminSidebarHeader() {
  const { state } = useSidebar()
  return (
    <SidebarHeader className="border-b border-white/5 py-8 transition-premium">
      <div className="flex items-center justify-center w-full">
        <Logo 
          size={state === 'expanded' ? "md" : "sm"} 
          variant="light" 
          showText={state === 'expanded'} 
          href="/admin" 
          orientation={state === 'expanded' ? "vertical" : "horizontal"}
          className="transition-all duration-300"
        />
      </div>
    </SidebarHeader>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { assessments } = useData()
  
  if (!user?.id) return null
  const pendingReviewCount = Array.isArray(assessments) 
    ? assessments.filter(a => a && a.status === 'pending_review').length 
    : 0

  return (
    <SidebarProvider style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <Sidebar className="border-r border-white/5 bg-sidebar transition-premium">
        <AdminSidebarHeader />

        {/* Navigation */}
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {adminNavItems?.map((item) => {
                  const safePathname = pathname || ''
                  const isActive = safePathname === item.href || 
                    (item.href !== '/admin' && safePathname.startsWith(item.href))
                  
                  const hasSubItems = Array.isArray(item.items) && item.items.length > 0
                  const isInitiallyOpen = hasSubItems && (safePathname === item.href || safePathname.startsWith(item.href))

                  if (!hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={cn(
                            "transition-premium h-11 px-4 ",
                            isActive 
                              ? "bg-primary/5 text-primary shadow-sm" 
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary font-normal"
                          )}
                          tooltip={item.title}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <Collapsible
                      key={item.href}
                      asChild
                      defaultOpen={isInitiallyOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           <SidebarMenuButton 
                             isActive={isActive} 
                             asChild
                             tooltip={item.title}
                             className={cn(
                               "transition-premium h-11 px-4  group/btn",
                               isActive && !(pathname || '').includes(item.href) 
                                 ? "bg-primary/5 text-primary shadow-sm" 
                                 : "text-muted-foreground hover:bg-primary/5 hover:text-primary font-normal"
                             )}
                          >
                            <Link href={item.href} className="flex items-center gap-3 w-full">
                              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-0.5", isActive ? "text-primary" : "text-muted-foreground opacity-60")} />
                              <span className=" transition-transform duration-300 group-hover/btn:translate-x-0.5">{item.title}</span>
                              <ChevronDown className="ml-auto w-4 h-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180 opacity-40 shrink-0" />
                            </Link>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <motion.div
                            initial={false}
                            animate="visible"
                            variants={{
                              visible: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.2, ease: "easeOut" } 
                              },
                              hidden: { 
                                opacity: 0, 
                                y: -10,
                                transition: { duration: 0.2, ease: "easeOut" }
                              }
                            }}
                            className="overflow-hidden"
                          >
                            <SidebarMenuSub className="ml-4 mt-1 border-l border-white/5 space-y-1">
                              {item.items?.map((subItem) => {
                                 const isSubActive = pathname === subItem.href
                                 return (
                                   <SidebarMenuSubItem key={subItem.href}>
                                     <SidebarMenuSubButton 
                                        asChild 
                                        isActive={isSubActive}
                                        className={cn(
                                          "h-9 px-4  transition-all text-xs ",
                                          isSubActive 
                                            ? "text-primary bg-primary/5 font-normal" 
                                            : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5 font-normal"
                                        )}
                                      >
                                       <Link href={subItem.href} className="flex items-center gap-3">
                                         {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                                         <span>{subItem.title}</span>
                                       </Link>
                                     </SidebarMenuSubButton>
                                   </SidebarMenuSubItem>
                                 )
                              })}
                            </SidebarMenuSub>
                          </motion.div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b    px-8">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-4 outline-none hover:opacity-80 transition-opacity">
              <span className="hidden md:inline-block font-normal text-sm text-foreground opacity-60">
                {String(user?.name || '')}
              </span>
              <Avatar className="h-9 w-9 border  shadow-sm">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                  {(String(user?.name || 'User')).split(' ').filter(Boolean).map(n => n?.[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin/settings" className="flex items-center gap-2 w-full">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" 
                onSelect={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
