'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
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
 * Prevents "unexpected response" errors from Date objects crossing the Server Action boundary.
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
    return { success: true, data: files.map(sanitizeAudioFile) }
  } catch (error) {
    console.error('DATABASE_ERROR [getTeacherAudioFiles]:', error)
    return { success: false, error: 'Failed to access institutional audio repository' }
  }
}

/**
 * Saves an audio file record to the database AFTER the client has uploaded
 * it directly to Vercel Blob. This action only handles the DB write.
 */
export async function saveAudioRecord(
  blobUrl: string,
  title: string,
  filename: string,
  teacherId: string
): Promise<ActionResult<AudioFile> & { diagnostic?: any }> {
  let currentStep = 'init'
  try {
    console.log(`[AudioRecord] Saving DB record for Teacher: ${teacherId}`)

    // Step: Verify teacher record
    currentStep = 'teacher_lookup'
    const teacherExists = await db.teacher.findUnique({ where: { id: teacherId } })
    if (!teacherExists) {
      console.warn(`[AudioRecord] Teacher record ${teacherId} missing. Creating ghost record.`)
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

    // Step: Save record to DB
    currentStep = 'db_create'
    const result = await db.audioFile.create({
      data: {
        title: title || filename,
        filename,
        url: blobUrl,
        teacherId
      }
    })

    revalidatePath('/teacher/audio-library')
    return { success: true, data: sanitizeAudioFile(result) }

  } catch (error: any) {
    console.error(`ACTION_ERROR [saveAudioRecord] at step [${currentStep}]:`, error)
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
 * Removes an audio file from Vercel Blob and the database.
 */
export async function deleteAudioFile(id: string, teacherId: string): Promise<ActionResult> {
  try {
    const fileRecord = await db.audioFile.findFirst({
      where: { id, teacherId }
    })

    if (!fileRecord) return { success: false, error: 'Asset not found or unauthorized' }

    // Remove from Vercel Blob using the stored CDN URL
    try {
      await del(fileRecord.url)
      console.log(`[AudioDelete] Blob removed: ${fileRecord.url}`)
    } catch (blobErr) {
      // Log but don't block DB cleanup if blob is already gone
      console.warn('[AudioDelete] Blob removal warning:', blobErr)
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
