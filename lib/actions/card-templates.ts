'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getCardTemplates() {
  try {
    const templates = await db.cardTemplate.findMany()
    return { success: true, data: templates }
  } catch (error) {
    console.error('FAILED_TO_FETCH_CARD_TEMPLATES:', error)
    return { success: false, error: 'Failed to fetch card templates' }
  }
}

export async function saveCardTemplate(level: string, backgroundUrl: string, coordinates: any) {
  try {
    const template = await db.cardTemplate.upsert({
      where: { level },
      update: {
        backgroundUrl,
        coordinates: coordinates || {}
      },
      create: {
        level,
        backgroundUrl,
        coordinates: coordinates || {}
      }
    })

    revalidatePath('/admin/classes/templates')
    revalidatePath('/teacher/results/report-card')
    return { success: true, data: template }
  } catch (error) {
    console.error('FAILED_TO_SAVE_CARD_TEMPLATE:', error)
    return { success: false, error: 'Failed to save card template configuration' }
  }
}

export async function deleteCardTemplate(level: string) {
  try {
    await db.cardTemplate.deleteMany({
      where: { level }
    })

    revalidatePath('/admin/classes/templates')
    revalidatePath('/teacher/results/report-card')
    return { success: true }
  } catch (error) {
    console.error('FAILED_TO_DELETE_CARD_TEMPLATE:', error)
    return { success: false, error: 'Failed to reset card template' }
  }
}
