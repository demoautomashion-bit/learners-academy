'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
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
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  Receipt,
} from 'lucide-react'

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Teachers',
    href: '/admin/teachers',
    icon: Users,
  },
  {
    title: 'Attendance',
    href: '/admin/attendance',
    icon: ClipboardCheck,
  },
  {
    title: 'Students',
    href: '/admin/students',
    icon: GraduationCap,
  },
  {
    title: 'Growth Reports',
    href: '/admin/growth',
    icon: TrendingUp,
  },
  {
    title: 'Fees',
    href: '/admin/fees',
    icon: Receipt,
  },
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: BookOpen,
  },
  {
    title: 'Economics',
    href: '/admin/economics',
    icon: DollarSign,
  },
  {
    title: 'Schedule',
    href: '/admin/schedule',
    icon: CalendarDays,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
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

  // Middleware handles route protection now.

  return (
    <SidebarProvider style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <Sidebar className="border-r border-white/5 bg-sidebar transition-premium">
        <AdminSidebarHeader />

        {/* Navigation */}
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>

            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href))
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

      {/* Main Content Area */}
      <SidebarInset className="bg-background">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b border-primary/5 bg-card/80 backdrop-blur-xl px-8">
          <SidebarTrigger className="-ml-2" />
          
          <div className="flex-1" />
          
          {/* Notifications */}


          {/* Quick User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-4 outline-none hover:opacity-80 transition-opacity">
              <span className="hidden md:inline-block font-medium text-sm text-muted-foreground">
                {user?.name}
              </span>
              <Avatar className="h-9 w-9 border border-primary/10 shadow-sm">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
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

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
