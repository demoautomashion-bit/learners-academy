'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import type { User, UserRole, AuthState, LoginCredentials, RegisterData } from '@/lib/types/auth'
import { mockLogin, mockRegister, mockLogout, validateToken, getRoleRedirectPath } from '@/lib/auth-mock'

const AUTH_STORAGE_KEY = 'learners_academy_auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkAccess: (requiredRole: UserRole) => boolean
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          const { token, user } = JSON.parse(stored)
          const validatedUser = validateToken(token)
          
          if (validatedUser) {
            console.log('Restored auth session for:', validatedUser.email)
            setState({
              user: validatedUser,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error)
      }
      
      setState(prev => ({ ...prev, isLoading: false }))
    }

    initializeAuth()
  }, [])

  // Handle route protection
  useEffect(() => {
    console.log(`Checking route protection for ${pathname} (Auth: ${state.isAuthenticated}, Loading: ${state.isLoading})`)
    if (state.isLoading) return

    // Special exception for the Master Hub (homepage)
    // We allow users to see the hub and choose their portal manually even if logged in
    if (pathname === '/') return

    const isAuthPage = pathname.startsWith('/auth')
    const isProtectedRoute = pathname.startsWith('/admin') || 
                            pathname.startsWith('/teacher') || 
                            pathname.startsWith('/student')

    if (!state.isAuthenticated && isProtectedRoute) {
      // Allow access to the student entry page without authentication
      if (pathname === '/student') return
      
      router.push('/auth/login')
      return
    }

    if (state.isAuthenticated && isAuthPage) {
      router.push(getRoleRedirectPath(state.user!.role))
      return
    }

    // Check role-based access
    if (state.isAuthenticated && isProtectedRoute) {
      const pathRole = pathname.split('/')[1] as UserRole
      if (state.user?.role !== pathRole) {
        const redirectPath = getRoleRedirectPath(state.user!.role)
        console.log(`Role mismatch: ${state.user?.role} vs ${pathRole}. Redirecting to ${redirectPath}`)
        
        // Brief delay to allow the toast to be seen if navigating
        toast.error(`Access Restricted`, {
          description: `Your account is registered as a ${state.user?.role}. Redirecting to your designated portal.`,
          duration: 4000,
        })
        
        router.push(redirectPath)
      }
    }
  }, [state.isAuthenticated, state.isLoading, state.user, pathname, router])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const session = await mockLogin(credentials)
      
      // Store in sessionStorage
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt,
      }))

      setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
      })

      // Redirect is handled by AuthProvider useEffect
      // router.push(getRoleRedirectPath(session.user.role))
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const session = await mockRegister(data)
      
      // Store in sessionStorage
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt,
      }))

      setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
      })

      // Redirect is handled by AuthProvider useEffect
      // router.push(getRoleRedirectPath(session.user.role))
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await mockLogout()
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      router.push('/auth/login')
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const checkAccess = useCallback((requiredRole: UserRole): boolean => {
    return state.user?.role === requiredRole
  }, [state.user])

  const updateUser = useCallback((data: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev
      const newUser = { ...prev.user, ...data }
      
      // Update session storage too
      try {
        const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          const session = JSON.parse(stored)
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
            ...session,
            user: newUser
          }))
        }
      } catch (e) {
        console.error('Failed to update session storage', e)
      }
      
      return { ...prev, user: newUser }
    })
  }, [])

  if (!mounted) return <div id="auth-hydrating" />

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      checkAccess,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
