'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getActivities() {
  try {
    return await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  } catch (error) {
    console.error('FAILED_TO_FETCH_ACTIVITIES:', error)
    return []
  }
}

export async function logActivity(user: string, action: string, category: string) {
  try {
    const result = await db.activityLog.create({
      data: {
        user,
        action,
        category
      }
    })
    revalidatePath('/')
    return result
  } catch (error) {
    console.error('FAILED_TO_LOG_ACTIVITY:', error)
    return null
  }
}
