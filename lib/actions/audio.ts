'use server'

import fs from 'fs'
import path from 'path'

/**
 * Scans the institutional audio repository and returns a list of available filenames.
 */
export async function getInstitutionalAudioFiles() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio')
    
    if (!fs.existsSync(audioDir)) {
      return { success: true, files: [] }
    }

    const files = fs.readdirSync(audioDir)
    
    // Filter for common audio extensions
    const audioFiles = files.filter(file => 
      ['.mp3', '.wav', '.m4a', '.ogg'].includes(path.extname(file).toLowerCase())
    )

    return { 
      success: true, 
      files: audioFiles 
    }
  } catch (error) {
    console.error('Failed to scan audio repository:', error)
    return { success: false, error: 'Failed to scan repository', files: [] }
  }
}

/**
 * Uploads an audio file to the institutional repository.
 */
export async function uploadAudioFile(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio')
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    // Sanitize filename: remove special chars, keep dots and underscores
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = path.join(audioDir, sanitizedName)

    fs.writeFileSync(filePath, buffer)

    return { 
      success: true, 
      filename: sanitizedName 
    }
  } catch (error) {
    console.error('Failed to upload audio file:', error)
    return { success: false, error: 'Upload failed' }
  }
}
