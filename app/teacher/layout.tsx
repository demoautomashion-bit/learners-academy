'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  useSidebar,
} from '@/components/ui/sidebar'
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
} from 'lucide-react'

const teacherNavItems = [
  {
    title: 'Dashboard',
    href: '/teacher',
    icon: LayoutDashboard,
  },
  {
    title: 'My Classes',
    href: '/teacher/classes',
    icon: BookOpen,
  },
  {
    title: 'Library',
    href: '/teacher/library',
    icon: Library,
  },
  {
    title: 'Assessments',
    href: '/teacher/assessments',
    icon: ClipboardList,
  },
  {
    title: 'Results',
    href: '/teacher/results',
    icon: FileCheck,
  },
  {
    title: 'Settings',
    href: '/teacher/settings',
    icon: Settings,
  },
]
 
function TeacherSidebarHeader() {
  const { state } = useSidebar()
  return (
    <SidebarHeader className="border-b border-white/5 py-8 transition-premium">
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
  const { user } = useAuth()

  // Middleware handles route protection now. 
  // Custom checks for 'teacher' role can be added here if needed, 
  // or refined in clerkMiddleware.

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/5 bg-sidebar transition-premium">
        <TeacherSidebarHeader />

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>

            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {teacherNavItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/teacher' && pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={cn(
                          "transition-premium h-11 px-4 rounded-xl",
                          isActive 
                            ? "bg-primary/5 text-primary font-bold shadow-sm" 
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        )}
                        tooltip={item.title}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                          <span className="tracking-tight">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>


      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b border-primary/5 bg-card/80 backdrop-blur-xl px-8">
          <SidebarTrigger className="-ml-2" />
          
          <div className="flex-1" />
          
          {/* Notifications removed for minimalist UI */}

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block font-medium text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Avatar className="h-9 w-9 border border-primary/10 shadow-sm">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6 text-foreground">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
