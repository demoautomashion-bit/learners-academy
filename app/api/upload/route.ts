import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

/**
 * Secure token-generation endpoint for client-side Vercel Blob uploads.
 * The browser requests a short-lived token here, then uploads directly to
 * Vercel Blob CDN — bypassing all serverless function payload limits.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate and scope the upload
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/m4a',
            'audio/aac',
            'audio/*',
          ],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB hard cap enforced at CDN level
          tokenPayload: JSON.stringify({ pathname }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after the upload is complete on Vercel's side
        console.log('[BlobUpload] Upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('[BlobUpload] Token generation error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
