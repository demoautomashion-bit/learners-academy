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
  createdAt: string // Always a string for safe client serialization
}

/**
 * Converts a raw Prisma AudioFile record to a plain, JSON-serializable object.
 * This prevents "unexpected response" errors caused by Date objects crossing the
 * Next.js Server Action boundary.
 */
function sanitizeAudioFile(record: any): AudioFile {
  return {
    id: record.id,
    title: record.title,
    filename: record.filename,
    url: record.url,
    teacherId: record.teacherId,
    createdAt: record.createdAt instanceof Date 
      ? record.createdAt.toISOString() 
      : String(record.createdAt)
  }
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
    // Sanitize: map all records to plain objects with string dates
    return { success: true, data: files.map(sanitizeAudioFile) }
  } catch (error) {
    console.error('DATABASE_ERROR [getTeacherAudioFiles]:', error)
    return { success: false, error: 'Failed to access institutional audio repository' }
  }
}

/**
 * Uploads an audio file, saves it to a teacher-specific directory, and records it in the database.
 * Each step is labeled for precise diagnostic reporting.
 */
export async function uploadAudioFile(formData: FormData, teacherId: string): Promise<ActionResult<AudioFile> & { diagnostic?: any }> {
  let currentStep = 'init'
  try {
    console.log(`[AudioUpload] Initiation for Teacher: ${teacherId}`)
    const file = formData.get('file') as File
    
    if (!file || file.size === 0) {
      return { success: false, error: 'No pedagogical asset provided or file is empty' }
    }

    const title = formData.get('title') as string || file.name

    // Step: Verify teacher record
    currentStep = 'teacher_lookup'
    const teacherExists = await db.teacher.findUnique({ where: { id: teacherId } })
    if (!teacherExists) {
      console.warn(`[AudioUpload] Teacher record ${teacherId} missing. Creating ghost record.`)
      currentStep = 'teacher_create'
      await db.teacher.create({
        data: {
          id: teacherId,
          name: 'Teacher',
          email: `${teacherId}@academy.edu`,
          phone: '000',
          employeeId: `EMP-${Date.now()}`
        }
      })
    }

    // Step: Read file buffer
    currentStep = 'file_read'
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Step: Create directory
    currentStep = 'dir_create'
    const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio', teacherId)
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    // Step: Write file to disk
    currentStep = 'file_write'
    const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(audioDir, sanitizedName)
    const publicUrl = `/assets/audio/${teacherId}/${sanitizedName}`
    fs.writeFileSync(filePath, buffer)
    console.log(`[AudioUpload] File persisted to: ${publicUrl}`)

    // Step: Save record to DB
    currentStep = 'db_create'
    const result = await db.audioFile.create({
      data: { title, filename: sanitizedName, url: publicUrl, teacherId }
    })

    revalidatePath('/teacher/audio-library')
    return { success: true, data: sanitizeAudioFile(result) }

  } catch (error: any) {
    console.error(`ACTION_ERROR [uploadAudioFile] at step [${currentStep}]:`, error)
    return {
      success: false,
      error: error.message || 'Unknown error',
      diagnostic: {
        step: currentStep,
        code: error.code || null,
        meta: error.meta ? JSON.stringify(error.meta) : null,
        raw: error.toString()
      }
    }
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
