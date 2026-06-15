'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getAnnouncements() {
  try {
    return await db.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('FAILED_TO_FETCH_ANNOUNCEMENTS:', error)
    return []
  }
}

export async function getAnnouncementById(id: string) {
  try {
    return await db.announcement.findUnique({ where: { id } })
  } catch (error) {
    console.error('FAILED_TO_FETCH_ANNOUNCEMENT_BY_ID:', error)
    return null
  }
}

export async function createAnnouncement(data: {
  title: string
  summary: string
  content: string
  category: string
  date: string
  imageUrl?: string | null
}) {
  try {
    const result = await db.announcement.create({
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        category: data.category,
        date: data.date,
        imageUrl: data.imageUrl || null
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('FAILED_TO_CREATE_ANNOUNCEMENT:', error)
    return { success: false, error: error.message || 'Failed to create announcement' }
  }
}
