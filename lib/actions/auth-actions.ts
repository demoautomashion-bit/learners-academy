'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { LoginCredentials, RegisterData, AuthSession, User } from '@/lib/types/auth'

// Generate a mock JWT-like token (can be replaced with a real JWT library later)
function generateSessionToken(payload: any): string {
  return btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }))
}

export async function loginAction(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.toLowerCase().trim()
  const { password } = credentials
  let selectedRole = credentials.role

  try {
    let dbUser: any = null
    let detectedRole = selectedRole

    // 1. Prioritized Search: Try designated role first
    if (selectedRole === 'admin') {
      dbUser = await db.admin.findUnique({ where: { email } })
      if (!dbUser || dbUser.password !== password) dbUser = null
    } else if (selectedRole === 'teacher') {
      dbUser = await db.teacher.findUnique({ where: { email } })
      if (!dbUser || dbUser.employeePassword !== password) dbUser = null
    } else if (selectedRole === 'student') {
      dbUser = await db.student.findUnique({ where: { email } })
      if (!dbUser || (dbUser.password !== password && dbUser.studentId !== password)) dbUser = null
    }

    // 2. Fallback Search (Agnostic): Search other institutional roles if primary fails
    if (!dbUser) {
      // Try Admin
      dbUser = await db.admin.findUnique({ where: { email } })
      if (dbUser && dbUser.password === password) {
        detectedRole = 'admin'
      } else {
        dbUser = null
        // Try Teacher
        dbUser = await db.teacher.findUnique({ where: { email } })
        if (dbUser && dbUser.employeePassword === password) {
          detectedRole = 'teacher'
        } else {
          dbUser = null
        }
      }
    }

    if (!dbUser) {
      throw new Error('Invalid institutional credentials. Please verify your email and portal password.')
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: detectedRole as any,
      avatar: dbUser.avatar || undefined,
      createdAt: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
    }

    const token = generateSessionToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    })
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    return { user, token, expiresAt }
  } catch (error) {
    console.error('Login action error:', error)
    throw new Error(error instanceof Error ? error.message : 'Authentication failed')
  }
}

export async function registerAction(data: RegisterData): Promise<AuthSession> {
  const email = data.email.toLowerCase().trim()
  const { name, role, password } = data

  try {
    let newUser: any = null

    if (role === 'teacher') {
      newUser = await db.teacher.create({
        data: {
          name,
          email,
          employeeId: `EMP-${Date.now().toString().slice(-6)}`,
          employeePassword: password || 'Teacher123!',
          phone: 'N/A', // Default for now
          subjects: [],
          qualifications: [],
        }
      })
    } else if (role === 'student') {
      newUser = await db.student.create({
        data: {
          name,
          email,
          password: password || 'Student123!',
          studentId: `STU-${Date.now().toString().slice(-6)}`,
          phone: 'N/A',
          enrolledCourses: [],
        }
      })
    } else {
      throw new Error('Public registration only allowed for Teachers and Students')
    }

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: role as any,
      createdAt: new Date().toISOString(),
    }

    const token = generateSessionToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    })
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    revalidatePath('/')
    return { user, token, expiresAt }
  } catch (error) {
    console.error('Register action error:', error)
    throw new Error(error instanceof Error ? error.message : 'Registration failed')
  }
}

// Temporary Action to create the first Admin account
export async function createInitialAdmin(data: { email: string, password: string, name: string }) {
  try {
    const existing = await db.admin.findUnique({ where: { email: data.email } })
    if (existing) return { success: false, message: 'Admin already exists' }

    const admin = await db.admin.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'admin'
      }
    })
    return { success: true, admin }
  } catch (error) {
    console.error('Failed to create admin:', error)
    return { success: false, error: 'Database error' }
  }
}
