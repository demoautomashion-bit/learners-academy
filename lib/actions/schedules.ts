'use server'

import db from '@/lib/db'
import type { Schedule } from '@/lib/types'

export async function getSchedules() {
  return db.schedule.findMany()
}

export async function addSchedule(schedule: Omit<Schedule, 'id'>) {
  return db.schedule.create({ data: schedule as any })
}

export async function updateSchedule(id: string, data: Partial<Schedule>) {
  return db.schedule.update({ where: { id }, data: data as any })
}

export async function removeSchedule(id: string) {
  return db.schedule.delete({ where: { id } })
}
