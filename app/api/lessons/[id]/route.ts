import { NextResponse } from 'next/server'
import db from '@/lib/db'

// DELETE /api/lessons/[id] - Remove saved syllabus
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Syllabus ID is required' },
        { status: 400 }
      )
    }

    await db.lessonSyllabus.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Syllabus deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting syllabus:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete syllabus' },
      { status: 500 }
    )
  }
}
