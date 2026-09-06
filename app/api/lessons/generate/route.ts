import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getGrammarDetailsForStructure, generateGranularTermRoadmap } from '@/lib/curriculum-generator'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      scope = 'single',
      termWeeks = 12,
      sessionsPerWeek = 3,
      cefr = 'B1',
      topic = '',
      grammarTags = [],
      vocabTags = [],
      idiomTags = [],
      weeklyArchetypes = ['grammar', 'activity', 'discussion'],
      selectedDays = ['Monday', 'Wednesday', 'Friday'],
      detailLevel = 'detailed'
    } = body

    const primaryGrammar = grammarTags[0] || 'Grammatical Structures'

    // Fallback if OpenAI API key is missing
    if (!openai) {
      console.warn('OPENAI_API_KEY missing. Falling back to local synthesizer engine.')
      if (scope === 'term') {
        const totalSessions = termWeeks * sessionsPerWeek
        const roadmapWeeks = generateGranularTermRoadmap({
          termWeeks,
          sessionsPerWeek,
          cefr,
          theme: topic,
          grammarTags,
          vocabTags,
          idiomTags,
          weeklyArchetypes,
          selectedDays,
          detailLevel
        })
        return NextResponse.json({
          success: true,
          data: {
            isTerm: true,
            detailLevel,
            title: `${termWeeks}-Week (${totalSessions} Sessions) Syllabus Roadmap`,
            cefr,
            duration: `${totalSessions} Sessions (${sessionsPerWeek}x / week)`,
            theme: topic || undefined,
            totalSessions,
            selectedDays,
            weeks: roadmapWeeks,
            objectives: [
              `Complete ${termWeeks}-week progressive mastery from basic structures to ${cefr} CEFR proficiency.`,
              `Systematically cover target grammar (${grammarTags.join(', ') || primaryGrammar}), vocabulary, and activities.`,
              `Conduct mid-term review and final graduation evaluation.`
            ]
          }
        })
      } else {
        const gInfo = getGrammarDetailsForStructure(primaryGrammar, cefr)
        return NextResponse.json({
          success: true,
          data: {
            isTerm: false,
            detailLevel,
            title: `Mastering ${grammarTags.join(' & ') || primaryGrammar}`,
            cefr,
            duration: `45 Minutes`,
            theme: topic || undefined,
            grammarFocus: gInfo.rule,
            grammarExplanation: `In ${cefr} level communication, ${primaryGrammar} is used to clearly articulate concepts with accuracy. ${gInfo.scope}`,
            boardLayout: gInfo.board,
            grammarScopeLimit: gInfo.scope,
            grammarForms: gInfo.forms,
            sentenceModels: [
              `Positive (+): ${gInfo.forms.positive}`,
              `Negative (-): ${gInfo.forms.negative}`,
              `Interrogative (?): ${gInfo.forms.interrogative}`
            ],
            grammarSubSections: gInfo.subSections,
            edgeCases: gInfo.edgeCases,
            signalWords: gInfo.signalWords,
            objectives: [
              `Master structural form and application of ${primaryGrammar}: ${gInfo.rule}`,
              vocabTags.length > 0 ? `Apply target vocabulary: ${vocabTags.join(', ')}.` : undefined,
              idiomTags.length > 0 ? `Incorporate idioms such as "${idiomTags[0]}" naturally.` : undefined
            ].filter(Boolean),
            vocabulary: vocabTags.map(v => ({ word: v, partOfSpeech: 'noun/verb', def: `Key term for ${cefr} level contexts.`, example: `We need to focus on ${v} during our discussion.` })),
            idioms: idiomTags.map(idm => ({ expression: idm, meaning: `Common figurative expression.`, usage: `Used to express ideas fluently.` })),
            ccqs: gInfo.ccqs,
            quiz: [
              {
                question: `Which option correctly completes the sentence using ${primaryGrammar}?`,
                options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
                answer: 'Option A (Correct)',
                reason: gInfo.rule
              }
            ],
            homework: `Write a 120-word paragraph incorporating target structure (${primaryGrammar}) and target vocabulary.`
          }
        })
      }
    }

    // Call OpenAI for live AI generation
    if (scope === 'term') {
      const prompt = `You are a world-class TEFL/ESL curriculum engineer. Generate a structured JSON response for a ${termWeeks}-Week (${termWeeks * sessionsPerWeek} Total Sessions) Academic Term Roadmap.
      
      Parameters:
      - CEFR Level: ${cefr}
      - Target Grammar: ${grammarTags.join(', ') || 'Core CEFR Grammar'}
      - Target Vocabulary: ${vocabTags.join(', ') || 'Topic-related vocabulary'}
      - Target Idioms: ${idiomTags.join(', ') || 'Common idioms'}
      - Real-World Topic: ${topic || 'General Academic English'}
      - Sessions Per Week: ${sessionsPerWeek}
      - Teaching Days: ${selectedDays.join(', ')}

      Requirements:
      - Provide ZERO generic intro/outro text.
      - Return ONLY valid JSON adhering strictly to this schema:
      {
        "isTerm": true,
        "detailLevel": "${detailLevel}",
        "title": "${termWeeks}-Week (${termWeeks * sessionsPerWeek} Sessions) Syllabus Roadmap",
        "cefr": "${cefr}",
        "duration": "${termWeeks * sessionsPerWeek} Sessions (${sessionsPerWeek}x / week)",
        "theme": "${topic || 'Academic Syllabus'}",
        "totalSessions": ${termWeeks * sessionsPerWeek},
        "selectedDays": ${JSON.stringify(selectedDays)},
        "objectives": ["Objective 1", "Objective 2", "Objective 3"],
        "weeks": [
          {
            "weekNum": 1,
            "title": "Week 1 Title",
            "theme": "Week Theme",
            "days": [
              {
                "sessionNum": 1,
                "weekNum": 1,
                "dayNum": 1,
                "day": "${selectedDays[0] || 'Monday'}",
                "dayArchetype": "grammar",
                "topic": "Session Topic",
                "grammarFocus": "Concise rule summary",
                "grammarExplanation": "Detailed explanation of when and why to use this structure in real communication",
                "grammarScopeLimit": "What to cover vs leave out today",
                "boardLayout": "Whiteboard formula",
                "grammarForms": {
                  "positive": "Formula & Example",
                  "negative": "Formula & Example",
                  "interrogative": "Formula & Example",
                  "shortAnswers": "Short answer format"
                },
                "sentenceModels": [
                  "Model 1: Positive (+)",
                  "Model 2: Negative (-)",
                  "Model 3: Question (?)"
                ],
                "grammarSubSections": ["Sub-section 1", "Sub-section 2"],
                "edgeCases": ["Edge case / common mistake 1", "Edge case 2"],
                "signalWords": ["word1", "word2"],
                "vocabList": ["vocab1", "vocab2"],
                "activityType": "Activity title",
                "activityDetail": "Step-by-step activity description",
                "objective": "Session objective",
                "type": "Instruction & Practice",
                "ccqs": ["CCQ 1?", "CCQ 2?"]
              }
            ]
          }
        ]
      }
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You output strictly JSON. No markdown backticks or commentary.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4
      })

      const content = completion.choices[0].message.content || '{}'
      const parsedData = JSON.parse(content)
      return NextResponse.json({ success: true, data: parsedData })

    } else {
      // Single Plan AI Generation
      const prompt = `You are a world-class TEFL/ESL curriculum engineer. Generate a structured JSON response for a Single Session Lesson Plan.

      Parameters:
      - CEFR Level: ${cefr}
      - Target Grammar: ${grammarTags.join(', ') || primaryGrammar}
      - Target Vocabulary: ${vocabTags.join(', ')}
      - Target Idioms: ${idiomTags.join(', ')}
      - Real-World Topic: ${topic || 'General Academic English'}
      - Duration: 45 Minutes

      Requirements:
      - Provide ZERO generic intro/outro text.
      - Return ONLY valid JSON adhering strictly to this schema:
      {
        "isTerm": false,
        "detailLevel": "${detailLevel}",
        "title": "Mastering ${grammarTags.join(' & ') || primaryGrammar}",
        "cefr": "${cefr}",
        "duration": "45 Minutes",
        "theme": "${topic || 'Academic Lesson'}",
        "grammarFocus": "Concise rule summary",
        "grammarExplanation": "Detailed explanation of when, why, and how to use this grammar in authentic contexts",
        "boardLayout": "Whiteboard formula (e.g. Subj + have/has + V3)",
        "grammarScopeLimit": "Specific focus and boundaries for this single session",
        "grammarForms": {
          "positive": "Formula & Example",
          "negative": "Formula & Example",
          "interrogative": "Formula & Example",
          "shortAnswers": "Short answer formats"
        },
        "sentenceModels": [
          "Positive (+): [Full model sentence incorporating target vocabulary]",
          "Negative (-): [Full model sentence incorporating target vocabulary]",
          "Interrogative (?): [Full model question]",
          "Short Answer: [Short answer response]"
        ],
        "grammarSubSections": ["Sub-section 1", "Sub-section 2", "Sub-section 3"],
        "edgeCases": [
          "Edge case 1: Common L1 student trap or exception",
          "Edge case 2: Key usage pitfall to avoid"
        ],
        "signalWords": ["signal1", "signal2", "signal3"],
        "objectives": [
          "Objective 1",
          "Objective 2",
          "Objective 3"
        ],
        "vocabulary": [
          {
            "word": "Target Word",
            "partOfSpeech": "noun / verb / adjective",
            "def": "Clear, concise CEFR-aligned dictionary definition",
            "example": "Natural example sentence using the word"
          }
        ],
        "idioms": [
          {
            "expression": "Target Idiom",
            "meaning": "Clear literal and figurative meaning breakdown",
            "usage": "When and how to use it in conversation"
          }
        ],
        "ccqs": ["CCQ 1?", "CCQ 2?", "CCQ 3?"],
        "quiz": [
          {
            "question": "Formative evaluation question checking target structure",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "reason": "Detailed grammar reason for correct answer"
          }
        ],
        "homework": "Clear 120-word application writing prompt incorporating target grammar and vocabulary."
      }
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You output strictly JSON. No markdown backticks or commentary.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4
      })

      const content = completion.choices[0].message.content || '{}'
      const parsedData = JSON.parse(content)
      return NextResponse.json({ success: true, data: parsedData })
    }

  } catch (err: any) {
    console.error('Error generating AI lesson plan:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}
