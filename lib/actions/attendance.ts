'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTeacherAttendance(startDateInput?: Date, endDateInput?: Date) {
  // Returns all attendance records for a specific date range, default is current month
  const today = new Date()
  const startDate = startDateInput || new Date(today.getFullYear(), today.getMonth(), 1)
  const endDate = endDateInput || new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
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
    },
    orderBy: {
      date: 'asc'
    }
  })
}

export async function markAttendance(
  teacherId: string, 
  date: string, 
  status?: string, 
  substituteCount?: number,
  details?: any
) {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // Fetch existing record to ensure we don't wipe out other fields
  const existing = await db.teacherAttendance.findUnique({
    where: {
      teacherId_date: {
        teacherId,
        date: targetDate
      }
    }
  })

  // Use existing values if not provided to prevent accidental reset bug
  const finalStatus = status !== undefined ? status : (existing?.status || 'Present')
  const finalCount = substituteCount !== undefined ? substituteCount : (existing?.substituteCount || 0)
  const finalDetails = details !== undefined ? details : (existing?.details || [])

  const result = await db.teacherAttendance.upsert({
    where: {
      teacherId_date: {
        teacherId,
        date: targetDate
      }
    },
    update: {
      status: finalStatus,
      substituteCount: finalCount,
      details: finalDetails,
    },
    create: {
      teacherId,
      date: targetDate,
      status: finalStatus,
      substituteCount: finalCount,
      details: finalDetails,
    }
  })

  revalidatePath('/')
  return result
}

/**
 * Specifically adds a granular log event to a teacher's daily record 
 * without needing to know the current status.
 */
export async function addAttendanceEvent(
  teacherId: string, 
  date: string, 
  event: { type: string, label: string, info?: string, time?: string }
) {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  const timestamp = event.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  const existing = await db.teacherAttendance.findUnique({
    where: { teacherId_date: { teacherId, date: targetDate } }
  })

  const currentDetails = Array.isArray(existing?.details) ? existing.details : []
  const newDetails = [...currentDetails, { ...event, time: timestamp }]

  // If this was a substitution event, we also increment the count
  let newCount = existing?.substituteCount || 0
  if (event.type === 'Substitution') {
    newCount += 1
  }

  const result = await db.teacherAttendance.upsert({
    where: { teacherId_date: { teacherId, date: targetDate } },
    update: { 
      details: newDetails,
      substituteCount: newCount
    },
    create: {
      teacherId,
      date: targetDate,
      status: 'Present',
      substituteCount: newCount,
      details: newDetails
    }
  })

  revalidatePath('/')
  return result
}
