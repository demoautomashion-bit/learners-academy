'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { TeacherErrorBoundary } from '@/components/teacher-error-boundary'
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
  BookOpen,
  Library,
  ClipboardList,
  FileCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Users,
  Award,
  Sparkles,
  Search,
  BookMarked
} from 'lucide-react'

const teacherNavItems = [
  {
    title: 'Dashboard',
    href: '/teacher',
    icon: LayoutDashboard,
  },
  {
    title: 'Academic Environment',
    href: '/teacher/classes',
    icon: BookOpen,
    items: [
      { title: 'My Active Batches', href: '/teacher/classes', icon: BookOpen },
      { title: 'Student Dossiers', href: '/teacher/students', icon: Users },
    ]
  },
  {
    title: 'Content Registry',
    href: '/teacher/library',
    icon: Library,
    items: [
        { title: 'Institutional Library', href: '/teacher/library', icon: Library },
        { title: 'Personal Resources', href: '/teacher/library', icon: BookMarked },
    ]
  },
  {
    title: 'Assessment Protocol',
    href: '/teacher/assessments',
    icon: ClipboardList,
    items: [
        { title: 'Question Registry', href: '/teacher/assessments', icon: ClipboardList },
        { title: 'Test Generator', href: '/teacher/assessments/generator', icon: Sparkles },
    ]
  },
  {
    title: 'Evaluations & Auditor',
    href: '/teacher/results',
    icon: FileCheck,
    items: [
        { title: 'Term Records', href: '/teacher/results', icon: FileCheck },
        { title: 'Institutional Analytics', href: '/teacher/results/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'System Settings',
    href: '/teacher/settings',
    icon: Settings,
  },
]
 
function TeacherSidebarHeader() {
  const { state } = useSidebar()
  return (
    <SidebarHeader className="border-b border-white/5 py-8 transition-all duration-300">
      <div className="flex items-center justify-center w-full">
        <Logo 
          size={state === 'expanded' ? "md" : "sm"} 
          variant="light" 
          showText={state === 'expanded'} 
          href="/teacher" 
          orientation={state === 'expanded' ? "vertical" : "horizontal"}
          className="transition-all duration-300"
        />
      </div>
    </SidebarHeader>
  )
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  if (!user?.id) return null

  return (
    <SidebarProvider style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <Sidebar className="border-r border-white/5 bg-sidebar transition-all duration-300">
        <TeacherSidebarHeader />
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {teacherNavItems?.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/teacher' && pathname.startsWith(item.href))
                  
                  const hasSubItems = item.items && item.items.length > 0
                  const isInitiallyOpen = hasSubItems && (pathname === item.href || pathname.startsWith(item.href))

                  if (!hasSubItems) {
                    return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className={cn(
                              "transition-all duration-300 h-10 px-4 rounded-xl font-normal",
                              isActive 
                                ? "bg-primary/10 text-primary font-bold shadow-sm" 
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            )}
                            tooltip={item.title}
                          >
                            <Link href={item.href} className="flex items-center gap-3">
                              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground opacity-60")} />
                              <span className="text-xs uppercase tracking-widest">{item.title}</span>
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
                               "transition-all duration-300 h-10 px-4 rounded-xl",
                               isActive && !pathname.includes(item.href) ? "bg-primary/5 text-primary" : ""
                             )}
                          >
                            <Link href={item.href} className="flex items-center gap-3 w-full">
                              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground opacity-60")} />
                              <span className="text-xs uppercase tracking-widest text-sidebar-foreground/80">{item.title}</span>
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
                                height: "auto", 
                                opacity: 1, 
                                transition: { height: { duration: 0.3 }, opacity: { duration: 0.2, delay: 0.1 } } 
                              },
                              hidden: { height: 0, opacity: 0 }
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
                                          "h-8 px-4 rounded-lg transition-all text-xs tracking-widest uppercase",
                                          isSubActive 
                                            ? "text-primary bg-primary/5 font-bold" 
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

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-primary/5 bg-card/40 backdrop-blur-xl px-8">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-4 outline-none hover:opacity-80 transition-opacity">
              <span className="hidden md:inline-block font-medium text-xs text-muted-foreground opacity-60 uppercase tracking-widest">
                {user?.name}
              </span>
              <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-primary/5 shadow-premium">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link href="/teacher/settings" className="flex items-center gap-2 w-full text-xs uppercase tracking-widest p-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg text-xs uppercase tracking-widest p-2" 
                onSelect={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6 text-foreground">
          <TeacherErrorBoundary>
            {children}
          </TeacherErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
