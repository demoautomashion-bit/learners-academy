'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Schedule, ActionResult } from '@/lib/types'

export async function getSchedules(): Promise<ActionResult<Schedule[]>> {
  try {
    const data = await db.schedule.findMany()
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getSchedules]:', error)
    return { success: false, error: 'Institutional calendar access failed' }
  }
}

export async function addSchedule(schedule: Omit<Schedule, 'id'>): Promise<ActionResult<Schedule>> {
  try {
    const res = await db.schedule.create({ data: schedule as any })
    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [addSchedule]:', error)
    return { success: false, error: 'Schedule creation failed' }
  }
}

export async function updateSchedule(id: string, data: Partial<Schedule>): Promise<ActionResult<Schedule>> {
  try {
    const res = await db.schedule.update({ where: { id }, data: data as any })
    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [updateSchedule]:', error)
    return { success: false, error: 'Institutional timing update failed' }
  }
}

export async function removeSchedule(id: string): Promise<ActionResult> {
  try {
    const res = await db.schedule.delete({ where: { id } })
    revalidatePath('/')
    return { success: true, data: res }
  } catch (error) {
    console.error('DATABASE_ERROR [removeSchedule]:', error)
    return { success: false, error: 'Schedule deletion failed' }
  }
}
