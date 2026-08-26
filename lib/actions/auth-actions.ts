'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { LoginCredentials, RegisterData, AuthSession, User } from '@/lib/types/auth'

// Generate a mock JWT-like token (can be replaced with a real JWT library later)
function generateSessionToken(payload: any): string {
  return btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }))
}

async function withDbRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      console.warn(`[DB Query Retry] Attempt ${i + 1} failed. Retrying in ${delayMs}ms...`)
      if (i < retries) await new Promise(r => setTimeout(r, delayMs))
    }
  }
  throw lastError
}

export async function loginAction(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.toLowerCase().trim()
  const { password } = credentials
  let selectedRole = credentials.role

  try {
    const userResult = await withDbRetry(async () => {
      // Execute parallel queries across Admin, Teacher, and Student collections to prevent slow sequential waterfall & cold-start timeouts
      const [adminRes, teacherRes, studentRes] = await Promise.allSettled([
        db.admin.findUnique({ where: { email } }),
        db.teacher.findUnique({ where: { email } }),
        db.student.findFirst({ where: { email } })
      ])

      const adminUser = adminRes.status === 'fulfilled' ? adminRes.value : null
      const teacherUser = teacherRes.status === 'fulfilled' ? teacherRes.value : null
      const studentUser = studentRes.status === 'fulfilled' ? studentRes.value : null

      let dbUser: any = null
      let detectedRole = selectedRole

      // 1. Check selected role first
      if (selectedRole === 'admin' && adminUser && adminUser.password === password) {
        dbUser = adminUser
        detectedRole = 'admin'
      } else if (selectedRole === 'teacher' && teacherUser && teacherUser.employeePassword === password) {
        dbUser = teacherUser
        detectedRole = 'teacher'
      } else if (selectedRole === 'student' && studentUser && (studentUser.password === password || studentUser.studentId === password)) {
        dbUser = studentUser
        detectedRole = 'student'
      }

      // 2. Agnostic fallback across all roles if designated tab role fails
      if (!dbUser) {
        if (adminUser && adminUser.password === password) {
          dbUser = adminUser
          detectedRole = 'admin'
        } else if (teacherUser && teacherUser.employeePassword === password) {
          dbUser = teacherUser
          detectedRole = 'teacher'
        } else if (studentUser && (studentUser.password === password || studentUser.studentId === password)) {
          dbUser = studentUser
          detectedRole = 'student'
        }
      }

      if (!dbUser) {
        throw new Error('Invalid institutional credentials. Please verify your email and portal password.')
      }

      return { dbUser, detectedRole }
    })

    const { dbUser, detectedRole } = userResult

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: detectedRole as any,
      avatar: dbUser.avatar || undefined,
      employeeId: dbUser.employeeId || undefined,
      phone: dbUser.phone || undefined,
      createdAt: dbUser.createdAt ? (typeof dbUser.createdAt === 'string' ? dbUser.createdAt : dbUser.createdAt.toISOString()) : new Date().toISOString(),
    }

    const token = generateSessionToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
      phone: user.phone
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
