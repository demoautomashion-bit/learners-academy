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
