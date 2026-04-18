'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
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
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Library,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  UserPlus,
  Coins,
  History,
  Calendar,
  FileCheck,
  LayoutGrid,
} from 'lucide-react'
import { StabilityBoundary } from '@/components/stability/stability-boundary'

// HYDRATION GUARD COMPONENT
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  if (!hasMounted) return null
  return <>{children}</>
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Faculty Perspective',
    href: '/admin/teachers',
    icon: Users,
    items: [
      { title: 'Faculty Roster', href: '/admin/teachers', icon: Users },
      { title: 'New Registration', href: '/admin/teachers/registration', icon: UserPlus },
      { title: 'Attendance Registry', href: '/admin/attendance', icon: ClipboardList },
      { title: 'Payroll Audit', href: '/admin/teachers/payroll', icon: Coins },
    ]
  },
  {
    title: 'Student Dossier',
    href: '/admin/students',
    icon: GraduationCap,
    items: [
      { title: 'Active Roster', href: '/admin/students', icon: GraduationCap },
      { title: 'Admissions flow', href: '/admin/students/registration', icon: UserPlus },
      { title: 'Enrollment Trends', href: '/admin/students/enrollment-trend', icon: TrendingUp },
    ]
  },
  {
    title: 'Academic Environment',
    href: '/admin/classes',
    icon: BookOpen,
    items: [
      { title: 'Academic Batches', href: '/admin/classes', icon: LayoutGrid },
      { title: 'Content Library', href: '/admin/library', icon: Library },
      { title: 'Room Schedules', href: '/admin/schedule', icon: Calendar },
    ]
  },
  {
    title: 'Oversight & Quality',
    href: '/admin/test-reviews',
    icon: FileCheck,
  },
  {
    title: 'Fiscal Ledger',
    href: '/admin/fee-registry',
    icon: DollarSign,
    items: [
      { title: 'Fee Registry', href: '/admin/fee-registry', icon: DollarSign },
      { title: 'Batch Financials', href: '/admin/batch-financials', icon: Coins },
      { title: 'Economics Audit', href: '/admin/economics', icon: History },
    ]
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

function AdminSidebarHeader() {
  const { state } = useSidebar()
  return (
    <SidebarHeader className="border-b border-white/5 py-8 transition-all duration-300">
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

  // STRICT ACCESS CONTROL
  if (!user?.id) return null

  return (
    <ClientOnly>
      <SidebarProvider>
        <Sidebar className="border-r border-white/5 bg-sidebar transition-all duration-300">
          <AdminSidebarHeader />
          <SidebarContent className="px-3 py-4">
            <StabilityBoundary name="Admin Navigation">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-2">
                    {adminNavItems.map((item) => {
                      const safePathname = pathname || ''
                      const isActive = safePathname === item.href || 
                        (item.href !== '/admin' && safePathname.startsWith(item.href))
                      
                      const hasSubItems = item.items && item.items.length > 0
                      const isInitiallyOpen = hasSubItems && (safePathname === item.href || safePathname.startsWith(item.href))

                      if (!hasSubItems) {
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton 
                              asChild 
                              isActive={isActive}
                              className={cn(
                                "transition-all duration-300 h-10 px-4 font-normal",
                                isActive 
                                  ? "bg-primary/10 text-primary shadow-sm" 
                                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                              )}
                              tooltip={item.title}
                            >
                              <Link href={item.href} className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground opacity-60")} />
                                <span className="text-xs">{item.title}</span>
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
                                   "transition-all duration-300 h-10 px-4 ",
                                   isActive && !(pathname || '').includes(item.href) ? "bg-primary/5 text-primary" : ""
                                 )}
                              >
                                <Link href={item.href} className="flex items-center gap-3 w-full">
                                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground opacity-60")} />
                                  <span className="text-xs text-sidebar-foreground/80">{item.title}</span>
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
                                              "h-8 px-4 transition-all text-xs",
                                              isSubActive 
                                                ? "text-primary bg-primary/5" 
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
            </StabilityBoundary>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-8 bg-background/80 backdrop-blur-md">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-4 outline-none hover:opacity-80 transition-opacity">
                <span className="hidden md:inline-block font-medium text-xs text-muted-foreground opacity-60 uppercase tracking-widest">
                  Admin: {String(user?.name || '')}
                </span>
                <Avatar className="h-8 w-8 border shadow-sm">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                    {(String(user?.name || 'Admin')).split(' ').filter(Boolean).map(n => n?.[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin/settings" className="flex items-center gap-2 w-full text-xs p-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Portal Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-xs p-2" 
                  onSelect={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-8 text-foreground">
            <StabilityBoundary name="Admin Content Area" key={pathname || ''}>
              {children}
            </StabilityBoundary>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ClientOnly>
  )
}
