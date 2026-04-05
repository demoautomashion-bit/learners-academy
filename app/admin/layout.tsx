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
    title: 'Faculty Registry',
    href: '/admin/teachers',
    icon: Users,
    items: [
      { title: 'Instructor Roster', href: '/admin/teachers', icon: Users },
      { title: 'Onboarding Protocol', href: '/admin/teachers/registration', icon: UserPlus },
      { title: 'Payroll Audit', href: '/admin/teachers/payroll', icon: DollarSign },
    ]
  },
  {
    title: 'Student Body',
    href: '/admin/students',
    icon: GraduationCap,
    items: [
      { title: 'Student Registry', href: '/admin/students', icon: GraduationCap },
      { title: 'Enrollment Registry', href: '/admin/students/registration', icon: PlusCircle },
    ]
  },
  {
    title: 'Academic Ops',
    href: '/admin/classes',
    icon: BookOpen,
    items: [
      { title: 'Active Batches', href: '/admin/classes', icon: BookOpen },
      { title: 'Attendance Registry', href: '/admin/attendance', icon: BadgeCheck },
      { title: 'Schedule Auditor', href: '/admin/schedule', icon: CalendarDays },
    ]
  },
  {
    title: 'Institutional intelligence',
    href: '/admin/fee-registry',
    icon: TrendingUp,
    items: [
      { title: 'Fee Tracking', href: '/admin/fee-registry', icon: DollarSign },
      { title: 'Economics Ledger', href: '/admin/economics', icon: TrendingUp },
      { title: 'Growth Framework', href: '/admin/growth', icon: BarChart },
    ]
  },
  {
    title: 'Governance',
    href: '/admin/test-reviews',
    icon: ShieldCheck,
    items: [
      { title: 'Quality Controls', href: '/admin/test-reviews', icon: ShieldCheck },
      { title: 'System Settings', href: '/admin/settings', icon: Settings },
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
  if (!user?.id) return null
  const { assessments } = useData()
  const pendingReviewCount = assessments?.filter(a => a.status === 'pending_review').length

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
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href))
                  
                  const hasSubItems = item.items && item.items.length > 0
                  const isInitiallyOpen = hasSubItems && (pathname === item.href || pathname.startsWith(item.href))

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
                               isActive && !pathname.includes(item.href) 
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
                {user?.name}
              </span>
              <Avatar className="h-9 w-9 border  shadow-sm">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
