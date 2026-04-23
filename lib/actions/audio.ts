'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import type { ActionResult } from '@/lib/types'

export interface AudioFile {
  id: string
  title: string
  filename: string
  url: string
  teacherId: string
  createdAt: Date | string
}

/**
 * Fetches audio files for a specific teacher from the database.
 */
export async function getTeacherAudioFiles(teacherId: string): Promise<ActionResult<AudioFile[]>> {
  try {
    const files = await db.audioFile.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: files as any }
  } catch (error) {
    console.error('DATABASE_ERROR [getTeacherAudioFiles]:', error)
    return { success: false, error: 'Failed to access institutional audio repository' }
  }
}

/**
 * Uploads an audio file, saves it to a teacher-specific directory, and records it in the database.
 */
export async function uploadAudioFile(formData: FormData, teacherId: string): Promise<ActionResult<AudioFile>> {
  try {
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name
    
    if (!file) return { success: false, error: 'No pedagogical asset provided' }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Teacher-specific directory
    const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio', teacherId)
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    // Sanitize filename
    const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(audioDir, sanitizedName)
    const publicUrl = `/assets/audio/${teacherId}/${sanitizedName}`

    fs.writeFileSync(filePath, buffer)

    // Save record to DB
    const result = await db.audioFile.create({
      data: {
        title,
        filename: sanitizedName,
        url: publicUrl,
        teacherId
      }
    })

    revalidatePath('/teacher/audio-library')
    return { success: true, data: result as any }
  } catch (error) {
    console.error('ACTION_ERROR [uploadAudioFile]:', error)
    return { success: false, error: 'Institutional asset upload failed' }
  }
}

/**
 * Removes an audio file from the repository and the database.
 */
export async function deleteAudioFile(id: string, teacherId: string): Promise<ActionResult> {
  try {
    const fileRecord = await db.audioFile.findFirst({
      where: { id, teacherId }
    })

    if (!fileRecord) return { success: false, error: 'Asset not found or unauthorized' }

    // Remove from filesystem
    const filePath = path.join(process.cwd(), 'public', 'assets', 'audio', teacherId, fileRecord.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Remove from DB
    await db.audioFile.delete({ where: { id } })

    revalidatePath('/teacher/audio-library')
    return { success: true }
  } catch (error) {
    console.error('ACTION_ERROR [deleteAudioFile]:', error)
    return { success: false, error: 'Asset purge operation failed' }
  }
}

/**
 * Legacy compatibility layer (scans public folder)
 * Keeping this for existing tests but moving towards DB-backed storage
 */
export async function getInstitutionalAudioFiles() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio')
    if (!fs.existsSync(audioDir)) return { success: true, files: [] }
    const files = fs.readdirSync(audioDir, { withFileTypes: true })
    
    // Flatten recursive scan or just top level? For now just top level + dirs
    const audioFiles: string[] = []
    files.forEach(f => {
       if (f.isFile() && ['.mp3', '.wav', '.m4a', '.ogg'].includes(path.extname(f.name).toLowerCase())) {
          audioFiles.push(f.name)
       }
    })

    return { success: true, files: audioFiles }
  } catch (error) {
    return { success: false, error: 'Scan failed', files: [] }
  }
}
