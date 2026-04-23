import { Question } from './types'

interface AuditResult {
  score: number // 0 to 1
  feedback: string
  justification: string
}

/**
 * Local keyword-based fallback scorer.
 * Used when the OpenAI API is unavailable or not configured.
 * Extracts key terms from the question and measures overlap with the student's answer.
 */
function localKeywordEvaluator(question: Question, answer: string): AuditResult {
  const cleanAnswer = answer.toLowerCase().trim()
  
  // Extract significant words from question content (filter common stop words)
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'but', 'with', 'what', 'how', 'why', 'when', 'where', 'who'])
  const questionWords = question.content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))

  // Also extract from correctAnswer if available
  const answerKeywords = (question.correctAnswer || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))

  const allKeywords = [...new Set([...questionWords, ...answerKeywords])]
  
  if (allKeywords.length === 0) {
    // No keywords to match against — give partial credit for any non-empty answer
    const score = cleanAnswer.length > 20 ? 0.6 : 0.3
    return {
      score,
      feedback: score > 0.5 
        ? "Your response has been recorded. A detailed review will follow." 
        : "Your response was brief. Consider elaborating on key concepts.",
      justification: "Local evaluation: insufficient keyword pool. Scored on response length."
    }
  }

  const matchedKeywords = allKeywords.filter(kw => cleanAnswer.includes(kw))
  const overlapRatio = matchedKeywords.length / allKeywords.length

  let score: number
  let feedback: string
  let justification: string

  if (overlapRatio >= 0.6) {
    score = 0.9
    feedback = "Excellent response. Your answer addressed the core concepts effectively."
    justification = `High keyword overlap (${matchedKeywords.length}/${allKeywords.length} terms matched): ${matchedKeywords.slice(0, 5).join(', ')}.`
  } else if (overlapRatio >= 0.3) {
    score = 0.6
    feedback = "Good attempt. Your response covered some key ideas but missed a few important concepts."
    justification = `Partial keyword overlap (${matchedKeywords.length}/${allKeywords.length} terms matched): ${matchedKeywords.slice(0, 3).join(', ')}.`
  } else if (overlapRatio > 0) {
    score = 0.3
    feedback = "Your response touched on some relevant points but needs significant development. Review the core concepts."
    justification = `Low keyword overlap (${matchedKeywords.length}/${allKeywords.length} terms matched).`
  } else {
    score = 0.1
    feedback = "Your response did not address the key concepts. Please review this topic before your next attempt."
    justification = "No significant keyword overlap detected with expected answer."
  }

  return { score, feedback, justification }
}

/**
 * AI Academic Auditor
 * First attempts to evaluate via the OpenAI API (/api/evaluate).
 * If the API is unavailable (missing key, network error, 500), falls back
 * to a smart local keyword-based evaluation so students always receive
 * meaningful feedback and a fair score.
 */
export async function evaluateSubjective(
  question: Question,
  answer: string
): Promise<AuditResult> {
  const cleanAnswer = answer.trim()
  
  if (!cleanAnswer || cleanAnswer.length < 5) {
    return { 
      score: 0, 
      feedback: "No answer was provided. A score of zero has been recorded for this question.",
      justification: "Student provided an empty or critically short response."
    }
  }

  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    })

    // If API is not configured or failed, fall back to local evaluation
    if (!response.ok) {
      console.warn(`[AI Auditor] API returned ${response.status}. Engaging local keyword evaluator.`)
      return localKeywordEvaluator(question, answer)
    }

    const data = await response.json()

    // If the API returned an error payload (e.g. missing key), use local fallback
    if (data.error) {
      console.warn('[AI Auditor] API error payload received. Engaging local keyword evaluator.')
      return localKeywordEvaluator(question, answer)
    }

    return {
      score: typeof data.score === 'number' ? Math.min(1, Math.max(0, data.score)) : 0.5,
      feedback: data.feedback || "Evaluated.",
      justification: data.justification || "AI evaluation complete."
    }
  } catch (error) {
    console.error('[AI Auditor] Network or parsing error:', error)
    return localKeywordEvaluator(question, answer)
  }
}
