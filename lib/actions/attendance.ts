'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTeacherAttendance(month: number, year: number) {
  // Returns all attendance records for a specific month
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  return db.teacherAttendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          avatar: true,
          status: true
        }
      }
    }
  })
}

export async function markAttendance(teacherId: string, date: string, status: string, substituteCount: number = 0) {
  const targetDate = new Date(date)
  // Ensure we operate on the date without time components for the unique check
  targetDate.setHours(0, 0, 0, 0)

  const result = await db.teacherAttendance.upsert({
    where: {
      teacherId_date: {
        teacherId,
        date: targetDate
      }
    },
    update: {
      status,
      substituteCount
    },
    create: {
      teacherId,
      date: targetDate,
      status,
      substituteCount
    }
  })

  revalidatePath('/admin/attendance')
  return result
}
