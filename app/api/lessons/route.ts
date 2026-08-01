import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET /api/lessons - Fetch saved syllabi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const cefr = searchParams.get('cefr')
    const scope = searchParams.get('scope')

    const where: any = {}
    if (teacherId) where.teacherId = teacherId
    if (cefr && cefr !== 'ALL') where.cefr = cefr
    if (scope && scope !== 'ALL') where.scope = scope

    const syllabi = await db.lessonSyllabus.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: syllabi })
  } catch (error: any) {
    console.error('Error fetching syllabi:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabi' },
      { status: 500 }
    )
  }
}

// POST /api/lessons - Save a newly generated syllabus
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      scope,
      cefr,
      topic,
      duration,
      grammar,
      vocabulary,
      idioms,
      timeline,
      weeks,
      quiz,
      homework,
      teacherId,
      teacherName
    } = body

    if (!title || !cefr || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'Missing required syllabus fields' },
        { status: 400 }
      )
    }

    const newSyllabus = await db.lessonSyllabus.create({
      data: {
        title,
        scope: scope || 'single',
        cefr,
        topic: topic || 'General Context',
        duration: duration || '45 Minutes',
        grammar: grammar || [],
        vocabulary: vocabulary || null,
        idioms: idioms || null,
        timeline: timeline || null,
        weeks: weeks || null,
        quiz: quiz || null,
        homework: homework || null,
        teacherId,
        teacherName: teacherName || 'Teacher'
      }
    })

    return NextResponse.json({ success: true, data: newSyllabus })
  } catch (error: any) {
    console.error('Error saving syllabus:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save syllabus' },
      { status: 500 }
    )
  }
}
