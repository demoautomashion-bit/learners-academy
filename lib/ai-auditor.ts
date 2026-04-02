import { Question, QuestionCategory } from './types'

interface AuditResult {
  score: number // 0 to 1
  feedback: string
  justification: string
}

/**
 * AI Academic Auditor (Simulation)
 * Analyzes subjective answers for keywords and academic markers to provide instant evaluation.
 */
export async function evaluateSubjective(
  question: Question,
  answer: string
): Promise<AuditResult> {
  const cleanAnswer = answer.trim().toLowerCase()
  
  if (!cleanAnswer || cleanAnswer.length < 5) {
    return { 
      score: 0, 
      feedback: "Answer is insufficient for academic audit.",
      justification: "Student provided an empty or critically short response."
    }
  }

  // Keywords to simulate content-aware audit
  const academicMarkers = {
      'Grammar': ['structure', 'tense', 'passive', 'active', 'clause', 'sentence'],
      'Vocab & Idioms': ['nuance', 'context', 'precise', 'phrasal', 'formal'],
      'Reading': ['comprehension', 'theme', 'inference', 'summary', 'detail'],
      'Writing': ['cohesion', 'argument', 'thesis', 'evidence', 'clarity', 'paragraph', 'introduction', 'conclusion'],
      'Listening': ['heard', 'described', 'mentioned', 'speaker', 'tone', 'audio', 'passage', 'stated'],
      'Speaking': ['fluency', 'pronunciation', 'intonation', 'articulate', 'expression', 'response', 'pace'],
      'Both': ['concept', 'analysis', 'logic', 'example']
  }

  const category = question.category as QuestionCategory
  const markers = academicMarkers[category as keyof typeof academicMarkers] || academicMarkers['Both']
  
  let scoreMod = 0
  const matched = markers.filter(m => cleanAnswer.includes(m))
  
  // Scoring logic simulation
  if (cleanAnswer.length > 50) scoreMod += 0.2
  if (matched.length > 0) scoreMod += 0.5
  if (matched.length > 2) scoreMod += 0.3
  
  const finalScore = Math.min(1, scoreMod)
  
  let feedback = ""
  let justification = ""

  if (finalScore >= 0.8) {
    feedback = "Exceptional articulation. You demonstrated strong command over the subject terminology."
    justification = `Student used specific academic markers (${matched.join(', ')}) and provided significant depth.`
  } else if (finalScore >= 0.5) {
    feedback = "Good foundational understanding, but could benefit from more specific evidence or terminology."
    justification = `Identified key terms (${matched.join(', ')}), but elaboration was moderate.`
  } else {
    feedback = "Your response is a bit brief. Try to use more specialized terminology to strengthen your argument."
    justification = "Response lacked specific academic markers. Analysis was superficial."
  }

  return {
    score: finalScore,
    feedback,
    justification
  }
}
