import type { User, UserRole, AuthSession, LoginCredentials, RegisterData } from './types/auth'

// Mock user database
const mockUsers: User[] = []

// Generate a mock JWT-like token
function generateMockToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

// Mock login function
export async function mockLogin(credentials: LoginCredentials): Promise<AuthSession> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Find user by email and role
  const user = mockUsers.find(
    u => u.email === credentials.email && u.role === credentials.role
  )

  // For demo purposes, also allow login with just role selection
  // In production, this would validate actual credentials
  const demoUser = mockUsers.find(u => u.role === credentials.role)

  const matchedUser = user || demoUser

  if (!matchedUser) {
    throw new Error('Invalid credentials or user not found')
  }

  const token = generateMockToken(matchedUser)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return {
    user: matchedUser,
    token,
    expiresAt,
  }
}

// Mock register function
export async function mockRegister(data: RegisterData): Promise<AuthSession> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Check if email already exists
  const existingUser = mockUsers.find(u => u.email === data.email)
  if (existingUser) {
    throw new Error('Email already registered')
  }

  // Create new user
  const newUser: User = {
    id: `${data.role}-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: new Date().toISOString(),
  }

  // In a real app, this would save to database
  mockUsers.push(newUser)

  const token = generateMockToken(newUser)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return {
    user: newUser,
    token,
    expiresAt,
  }
}

// Mock logout function
export async function mockLogout(): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
}

// Validate token and return user
export function validateToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token))
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null
    }

    // Find user
    const user = mockUsers.find(u => u.id === payload.sub)
    return user || null
  } catch {
    return null
  }
}

// Get role-specific redirect path
export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'teacher':
      return '/teacher'
    case 'student':
      return '/student'
    default:
      return '/auth/login'
  }
}

// Check if user has access to a specific portal
export function hasPortalAccess(userRole: UserRole, portal: UserRole): boolean {
  // Users can only access their own portal
  return userRole === portal
}
