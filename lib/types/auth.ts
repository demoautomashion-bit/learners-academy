export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  password?: string
  avatar?: string
  employeeId?: string
  studentId?: string
  enrolledCourses?: string[]
  phone?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  role: UserRole
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
