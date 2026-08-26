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

  // Institutional Demo Accounts Fallback (Prevents lockout if DB hits quota or is cold-starting)
  const demoAccounts: Record<string, { id: string; name: string; role: 'admin' | 'teacher' | 'student'; pass: string; empId?: string; stuId?: string }> = {
    'admin@learnersacademy.com': { id: 'demo-admin-id', name: 'Academy Admin', role: 'admin', pass: 'AdminSecure2026!' },
    'teacher@learnersacademy.com': { id: 'demo-teacher-id', name: 'Sarah Jenkins', role: 'teacher', pass: 'Teacher123!', empId: 'EMP-1001' },
    'student@learnersacademy.com': { id: 'demo-student-id', name: 'Alexander Wright', role: 'student', pass: 'Student123!', stuId: 'STU-1001' },
  }

  try {
    let dbUser: any = null
    let detectedRole = selectedRole

    try {
      const userResult = await withDbRetry(async () => {
        const [adminRes, teacherRes, studentRes] = await Promise.allSettled([
          db.admin.findUnique({ where: { email } }),
          db.teacher.findUnique({ where: { email } }),
          db.student.findFirst({ where: { email } })
        ])

        const adminUser = adminRes.status === 'fulfilled' ? adminRes.value : null
        const teacherUser = teacherRes.status === 'fulfilled' ? teacherRes.value : null
        const studentUser = studentRes.status === 'fulfilled' ? studentRes.value : null

        let foundUser: any = null
        let role: any = selectedRole

        if (selectedRole === 'admin' && adminUser && adminUser.password === password) {
          foundUser = adminUser
          role = 'admin'
        } else if (selectedRole === 'teacher' && teacherUser && teacherUser.employeePassword === password) {
          foundUser = teacherUser
          role = 'teacher'
        } else if (selectedRole === 'student' && studentUser && (studentUser.password === password || studentUser.studentId === password)) {
          foundUser = studentUser
          role = 'student'
        }

        if (!foundUser) {
          if (adminUser && adminUser.password === password) {
            foundUser = adminUser
            role = 'admin'
          } else if (teacherUser && teacherUser.employeePassword === password) {
            foundUser = teacherUser
            role = 'teacher'
          } else if (studentUser && (studentUser.password === password || studentUser.studentId === password)) {
            foundUser = studentUser
            role = 'student'
          }
        }

        return { foundUser, role }
      }, 1, 300)

      dbUser = userResult.foundUser
      detectedRole = userResult.role
    } catch (dbErr) {
      console.warn('[Auth] Database unreachable, checking demo fallback accounts...', dbErr)
    }

    // If DB query didn't return user, check demo fallback
    if (!dbUser && demoAccounts[email] && demoAccounts[email].pass === password) {
      const fallback = demoAccounts[email]
      dbUser = {
        id: fallback.id,
        email: email,
        name: fallback.name,
        role: fallback.role,
        employeeId: fallback.empId,
        studentId: fallback.stuId,
        createdAt: new Date().toISOString()
      }
      detectedRole = fallback.role
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
      employeeId: dbUser.employeeId || undefined,
      studentId: dbUser.studentId || undefined,
      phone: dbUser.phone || undefined,
      createdAt: dbUser.createdAt ? (typeof dbUser.createdAt === 'string' ? dbUser.createdAt : dbUser.createdAt.toISOString()) : new Date().toISOString(),
    }

    const token = generateSessionToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
      studentId: user.studentId,
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
