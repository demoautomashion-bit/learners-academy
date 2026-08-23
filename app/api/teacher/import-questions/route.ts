import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

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

    let text = ''
    let defaultClassLevel = 'Level 1'
    let defaultPhase = 'First Test'
    let defaultCategory = 'Grammar'

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      defaultClassLevel = (formData.get('defaultClassLevel') as string) || 'Level 1'
      defaultPhase = (formData.get('defaultPhase') as string) || 'First Test'
      defaultCategory = (formData.get('defaultCategory') as string) || 'Grammar'

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = (file.name || '').toLowerCase()

        if (fileName.endsWith('.pdf')) {
          try {
            const pdfData = await pdfParse(buffer)
            text = pdfData.text || ''
          } catch (err) {
            console.error('[ImportQuestions] PDF Parse error:', err)
          }
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
          try {
            const docxData = await mammoth.extractRawText({ buffer })
            text = docxData.value || ''
          } catch (err) {
            console.error('[ImportQuestions] Docx Parse error:', err)
          }
        } else {
          // Plain text fallback
          text = buffer.toString('utf-8')
        }
      }
    } else {
      const body = await req.json()
      text = body.text || ''
      defaultClassLevel = body.defaultClassLevel || 'Level 1'
      defaultPhase = body.defaultPhase || 'First Test'
      defaultCategory = body.defaultCategory || 'Grammar'
    }

    // Clean up null/replacement characters if any remain
    text = text.replace(/\0/g, '').replace(/\uFFFD/g, ' ').trim()

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: 'No readable text could be extracted from the document or input provided.' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert curriculum designer and exam question extractor.
Analyze the following document/test text and extract ALL questions into a structured JSON array under the key "questions".

Context Defaults (use if not explicitly specified in the text):
- Class Level: "${defaultClassLevel}"
- Test Phase: "${defaultPhase}"
- Category: "${defaultCategory}"

CRITICAL FORMATTING & EXTRACTION RULES:
1. Question Content:
   - Clean the question text. REMOVE all leading numbering junk like "1.", "Q2:", "Question 3:".
   - Keep the prompt clear, grammatically flawless, and concise.

2. Determine Question Type:
   - 'MCQ': Multiple choice questions with options.
   - 'True/False': True or false statements.
   - 'Matching': Matching left items to right items.
   - 'Fill-in-the-Blank': Sentence with blanks (e.g. ____ or [...]).
   - 'Subjective': Short answer, open-ended, or conceptual questions.
   - 'Writing': Extended essay, story, letter, or written composition prompt.

3. Question Fields by Type:
   - For 'MCQ': 
     - Provide 'options' as a string array of choices (e.g. ["Option A text", "Option B text", ...]). REMOVE prefix labels like "A)", "B)".
     - Provide 'correctAnswer' matching the exact text of the correct option choice.
   - For 'True/False':
     - 'options': ["True", "False"]
     - 'correctAnswer': "True" or "False"
   - For 'Matching':
     - Provide 'matchPairs' as an array of objects: [{"left": "Left item", "right": "Right matching item"}]
   - For 'Subjective' and 'Writing':
     - Generate a thorough, professional 'evaluationCriteria' (AI Rubric / "Things to Look For") describing key concepts, facts, keywords, and criteria required for full marks.
     - For 'Writing': Also set 'writingGenre' (e.g., "Essay", "Letter", "Narrative") and reasonable 'wordLimitMin' & 'wordLimitMax'.
   - For 'Fill-in-the-Blank':
     - Set 'correctAnswer' to the expected missing word(s).

4. Auto-Assess Attributes:
   - 'difficulty': Assess complexity as "Easy", "Medium", or "Hard".
   - 'phase': Determine if question belongs to "First Test" (formative/mid-term), "Last Test" (final/summative), or "Both".
   - 'category': Assign one of: "Grammar", "Vocabulary", "Reading", "Writing", "Listening", "Speaking".
   - 'classLevel': Assign the class level string (e.g., "${defaultClassLevel}").

Return strictly valid JSON in this exact JSON format:
{
  "questions": [
    {
      "category": "Grammar",
      "type": "MCQ",
      "phase": "First Test",
      "difficulty": "Medium",
      "classLevel": "Level 1",
      "content": "Clean question text without Q1/numbering",
      "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      "correctAnswer": "Choice 1",
      "evaluationCriteria": "Rubric details if subjective/writing",
      "writingGenre": "Essay",
      "wordLimitMin": 50,
      "wordLimitMax": 150,
      "matchPairs": [{"left": "Word", "right": "Definition"}]
    }
  ]
}

Document/Exam Text to Process:
"""
${text.slice(0, 10000)}
"""`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract and format exam questions into structured JSON. Return JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const rawContent = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(rawContent)

    const questions = Array.isArray(parsed.questions) ? parsed.questions : []

    return NextResponse.json({ questions, extractedTextSnippet: text.slice(0, 300) })
  } catch (error: any) {
    console.error('[ImportQuestions] Error parsing document:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to extract questions from document.' },
      { status: 500 }
    )
  }
}
