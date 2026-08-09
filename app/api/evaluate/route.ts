import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Ensure we fail gracefully if no API key is set
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Method not allowed. Use POST." }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export async function POST(req: Request) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { question, answer } = await req.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Missing question or answer payload' },
        { status: 400 }
      )
    }

    // Writing metadata sections
    const writingDetailsSection = question.type === 'Writing' ? `
Writing Details:
- Writing Genre: ${question.writingGenre || 'General Writing'}
- Sub-Type / Style: ${question.writingSubType || 'Standard'}
${question.evaluationCriteria ? `- Evaluation Criteria ("Things to Look For"): "${question.evaluationCriteria}"\n` : ''}${question.wordLimitMin || question.wordLimitMax ? `- Target Word Count: ${question.wordLimitMin || 0} to ${question.wordLimitMax || 'unlimited'} words\n` : ''}` : ''

    const referenceAnswerSection = question.correctAnswer && question.correctAnswer.trim()
      ? `\nReference / Expected Answer Key (AI Rubric):\n"${question.correctAnswer}"\n\nIMPORTANT: Use the Reference Answer Key as your primary rubric. Award full or near-full marks if the student's answer is semantically equivalent, covers the same key concepts and facts, or is contextually correct — even if the wording, phrasing, or sentence structure is different. Only deduct marks for genuinely missing concepts or factual inaccuracies.\n`
      : `\nNo reference answer was provided. Evaluate based on academic accuracy, relevance to the question, and depth of explanation.\n`

    const prompt = `
You are an encouraging, fair, and supportive academic auditor. Your goal is to evaluate a student's answer based on conceptual correctness and semantic understanding of the rubric, rather than rigid grammatical or word-for-word matching.

Evaluation Rules:
1. Ignore minor spelling mistakes, typos, and grammatical errors. Do not deduct points for them.
2. Focus on whether the student's answer demonstrates a correct understanding of the core concept.
3. For Writing tasks, check if the student adheres to the expected genre, structural format, and key evaluation criteria listed in the rubric.
4. Be lenient and encouraging. If the student clearly understands the concept but expresses it in a different way or in simpler phrasing, award full or near-full marks.
5. Provide constructive, warm, and encouraging feedback to the student that highlights what they got right, while gently pointing out any gaps (max 2-3 sentences).

Provide a strictly structured JSON response with the following keys:
- "score": A number between 0.0 and 1.0 representing the accuracy and completeness of the answer. (0.0 is completely wrong/empty, 1.0 is perfect).
- "feedback": Constructive, encouraging, student-facing feedback (max 2-3 sentences).
- "justification": Teacher-facing justification for the score, explaining why the marks were awarded.

Question details:
- Category: ${question.category}
- Type: ${question.type}
- Question Content: "${question.content}"
${writingDetailsSection}${referenceAnswerSection}
Student's Answer:
"${answer}"

Evaluate the answer. Only return valid JSON matching {"score": number, "feedback": string, "justification": string}.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an encouraging and fair academic auditor that evaluates conceptual correctness, ignoring minor typos and grammar, and responds exclusively in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temperature for consistent grading
    })

    const rawResponse = response.choices[0].message.content
    if (!rawResponse) throw new Error("Empty response from OpenAI")

    const parsed = JSON.parse(rawResponse)

    return NextResponse.json({
      score: typeof parsed.score === "number" ? parsed.score : 0,
      feedback: parsed.feedback || "Evaluated.",
      justification: parsed.justification || "Evaluated by AI.",
    })

  } catch (error) {
    console.error('AI Auditor Error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    )
  }
}
