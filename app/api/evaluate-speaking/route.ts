import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(req: Request) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const questionDataRaw = formData.get('question') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No audio recording file provided' },
        { status: 400 }
      )
    }

    const question = questionDataRaw ? JSON.parse(questionDataRaw) : {}

    // Step 1: Transcribe Speech Audio via OpenAI Whisper
    console.log(`[EvaluateSpeaking] Transcribing speech audio (${file.size} bytes)...`)
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    })

    const transcriptText = transcription.text || ''
    console.log(`[EvaluateSpeaking] Transcript generated: "${transcriptText}"`)

    if (!transcriptText.trim()) {
      return NextResponse.json({
        score: 0,
        transcript: '',
        feedback: 'No audible speech was detected in your recording. Please ensure your microphone is working and speak clearly.',
        justification: 'Empty audio stream or silent recording.'
      })
    }

    // Step 2: Evaluate Transcript against Teacher Criteria using GPT-4o-mini
    const rubricPrompt = `
You are an encouraging and expert English speaking evaluator. Evaluate the student's spoken response based on the transcript generated from their audio recording.

Question Topic / Prompt: "${question.speakingTitle || question.content || 'General Speaking Assessment'}"
Teacher Evaluation Criteria / Focus: "${question.evaluationCriteria || 'Evaluate for clarity, fluency, vocabulary, and cohesion.'}"

Speech Transcript:
"${transcriptText}"

Evaluation Guidelines:
1. Be encouraging, fair, and pedagogical.
2. Ignore minor hesitation fillers ("um", "uh") common in spontaneous speech.
3. Focus on conceptual response to the topic, vocabulary range, clarity, and logical organization.
4. Return a JSON object with:
   - "score": number between 0.0 and 1.0 representing overall quality.
   - "feedback": student-facing constructive feedback (2-3 sentences).
   - "justification": teacher-facing evaluation summary explaining the marks awarded.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an encouraging academic speech evaluator that responds exclusively in JSON format.' },
        { role: 'user', content: rubricPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const rawContent = response.choices[0].message.content
    if (!rawContent) throw new Error('Empty AI completion response')

    const parsed = JSON.parse(rawContent)

    return NextResponse.json({
      score: typeof parsed.score === 'number' ? parsed.score : 0.7,
      transcript: transcriptText,
      feedback: parsed.feedback || 'Good attempt on the speaking task.',
      justification: parsed.justification || 'Evaluated by Whisper & GPT-4o-mini AI Auditor.',
    })

  } catch (error: any) {
    console.error('EVALUATE_SPEAKING_ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Speech evaluation failed' },
      { status: 500 }
    )
  }
}
