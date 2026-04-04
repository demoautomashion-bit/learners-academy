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

    // Define the prompt for the OpenAI Model
    const prompt = `
You are an expert academic evaluator. Your task is to evaluate a student's answer to a given subjective test question.
Provide a strictly structured JSON response with the following keys:
- "score": A number between 0.0 and 1.0 representing the accuracy and completeness of the answer. (0.0 is completely wrong/empty, 1.0 is perfect).
- "feedback": Constructive, student-facing feedback addressing the strengths and weaknesses of the response (max 2-3 sentences).
- "justification": Teacher-facing justification for the score, pointing out specific terminology or concepts that were successfully or unsuccessfully applied.

Question details:
- Category: ${question.category}
- Type: ${question.type}
- Question Content: "${question.content}"

Student's Answer:
"${answer}"

Evaluate the answer. Only return valid JSON matching {"score": number, "feedback": string, "justification": string}.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a strict academic auditing tool that responds exclusively in JSON format." },
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
