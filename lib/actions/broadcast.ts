'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getBroadcastLogs() {
  try {
    return await db.broadcastLog.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('FAILED_TO_FETCH_BROADCAST_LOGS:', error)
    return []
  }
}

export async function createBroadcastLog(data: {
  title: string
  targetGroup: string
  recipientCount: number
  status?: string
}) {
  try {
    const result = await db.broadcastLog.create({
      data: {
        title: data.title,
        targetGroup: data.targetGroup,
        recipientCount: data.recipientCount,
        status: data.status || 'Delivered'
      }
    })
    revalidatePath('/admin/broadcast')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('FAILED_TO_CREATE_BROADCAST_LOG:', error)
    return { success: false, error: error.message || 'Failed to save broadcast log' }
  }
}
