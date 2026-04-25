'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })
    
    if (!settings) {
      // Initialize if missing
      return await prisma.systemSettings.create({
        data: { id: 'singleton' }
      })
    }
    
    return settings
  } catch (error) {
    console.error('FAILED_TO_FETCH_SETTINGS:', error)
    return null
  }
}

export async function updateSystemSettings(data: {
  academyName?: string,
  tagline?: string,
  missionStatement?: string,
  logoUrl?: string
}) {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { ...data, id: 'singleton' }
    })
    
    revalidatePath('/admin/settings')
    return { success: true, data: settings }
  } catch (error) {
    console.error('FAILED_TO_UPDATE_SETTINGS:', error)
    return { success: false, error: 'Institutional sync failed' }
  }
}

export async function updateAdminPassword(adminId: string, currentPass: string, newPass: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })
    
    if (!admin) return { success: false, error: 'Identity mismatch' }
    
    const isValid = await bcrypt.compare(currentPass, admin.password)
    if (!isValid) return { success: false, error: 'Current password invalid' }
    
    const hashed = await bcrypt.hash(newPass, 10)
    
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashed }
    })
    
    return { success: true }
  } catch (error) {
    console.error('FAILED_TO_ROTATE_CREDENTIALS:', error)
    return { success: false, error: 'Security protocol violation' }
  }
}
