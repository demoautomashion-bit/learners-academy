'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

export async function syncUserAction() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  // Check if user exists as teacher or student
  const existingTeacher = await prisma.teacher.findUnique({
    where: { email: user.emailAddresses[0].emailAddress }
  })

  if (existingTeacher) {
    return { role: 'teacher', data: existingTeacher }
  }

  const existingStudent = await prisma.student.findUnique({
    where: { email: user.emailAddresses[0].emailAddress }
  })

  if (existingStudent) {
    return { role: 'student', data: existingStudent }
  }

  // If not found, default to creating a student (onboarding flow)
  const newStudent = await prisma.student.create({
    data: {
      id: `stu_${userId}`,
      studentId: `STU-${userId.slice(-4)}`,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      enrolledAt: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
    }
  })

  return { role: 'student', data: newStudent }
}
