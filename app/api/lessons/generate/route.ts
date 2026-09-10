import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getGrammarDetailsForStructure, generateGranularTermRoadmap } from '@/lib/curriculum-generator'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const SYSTEM_PROMPT = `You are an expert TEFL/ESL curriculum engineer. Generate a structured JSON response for an ESL lesson plan strictly adhering to the schema and rules below. Omit all conversational text, introductory remarks, and unnecessary fluff. Keep descriptions clean, concise, and classroom-ready.

### 1. VOCABULARY & IDIOMS (If provided; otherwise set to [])
- Vocabulary Objects:
  - "word": string
  - "part_of_speech": string (e.g., "noun", "verb", "adjective")
  - "definition": concise CEFR-aligned meaning
  - "example_sentences": array of exactly 2 clear model sentences
- Idiom Objects:
  - "idiom": string
  - "definition": concise CEFR-aligned meaning
  - "example_sentences": array of exactly 2 clear model sentences

### 2. GRAMMAR EXPLANATION & RATIONALE
- Provide a brief 1-2 sentence explanation covering:
  - What the targeted grammar structure is used for.
  - The core communicative reason/rationale behind using it in real-world contexts ("explanation_rationale").

### 3. GRAMMAR CHUNKING, SYNTAX & EDGE CASES
- Progressive Chunking: Break complex grammar concepts into logical sub-topics for this specific session. Focus strictly on the assigned chunk.
- Syntax Models: Provide standard formulas using standardized notation (e.g., [Subject] + [have/has] + [V3]).
- Edge-Case Handling:
  - Identify key edge cases, irregular forms, and common L1 interference pitfalls specific to this lesson's grammar chunk ("edgeCases").
  - Provide concise, explicit explanations for why each edge case occurs and how students should avoid mistakes.
### OUTPUT CONSTRAINTS
- Strict JSON output matching the target schema. No extra commentary or fluff.`

function postProcessTermData(parsedData: any, vocabTags: string[], idiomTags: string[], cefr: string = 'B1') {
  if (!parsedData || !parsedData.weeks || !Array.isArray(parsedData.weeks)) return parsedData

  const cleanVocab = Array.from(new Set((vocabTags || []).map(v => v.trim()).filter(Boolean)))
  const cleanIdioms = Array.from(new Set((idiomTags || []).map(i => i.trim()).filter(Boolean)))

  if (cleanVocab.length === 0 && cleanIdioms.length === 0) return parsedData

  let sessionCount = 0

  parsedData.weeks.forEach((w: any) => {
    (w.days || []).forEach((d: any) => {
      sessionCount++

      // Ensure vocab
      if (cleanVocab.length > 0) {
        const chunkIndex = (sessionCount - 1) % Math.max(1, Math.ceil(cleanVocab.length / 3))
        const chunk = cleanVocab.slice(chunkIndex * 3, chunkIndex * 3 + 3)
        const activeVocabChunk = chunk.length > 0 ? chunk : cleanVocab.slice(0, 3)

        if (!d.vocabList || !Array.isArray(d.vocabList) || d.vocabList.length === 0) {
          d.vocabList = activeVocabChunk
        }
        if (!d.vocabulary || !Array.isArray(d.vocabulary) || d.vocabulary.length === 0) {
          d.vocabulary = activeVocabChunk.map((v: string) => ({
            word: v,
            part_of_speech: 'noun/verb',
            definition: `Target vocabulary term for ${cefr} level context.`,
            example_sentences: [`Model sentence 1 using "${v}".`, `Model sentence 2 using "${v}".`],
            partOfSpeech: 'noun/verb',
            def: `Target vocabulary term for ${cefr} level context.`,
            example: `Model sentence 1 using "${v}".`
          }))
        }
      }

      // Ensure idioms
      if (cleanIdioms.length > 0) {
        const idiomChunkIndex = (sessionCount - 1) % Math.max(1, Math.ceil(cleanIdioms.length / 2))
        const idiomChunk = cleanIdioms.slice(idiomChunkIndex * 2, idiomChunkIndex * 2 + 2)
        const activeIdiomChunk = idiomChunk.length > 0 ? idiomChunk : cleanIdioms.slice(0, 2)

        if (!d.idiomList || !Array.isArray(d.idiomList) || d.idiomList.length === 0) {
          d.idiomList = activeIdiomChunk
        }
        if (!d.idioms || !Array.isArray(d.idioms) || d.idioms.length === 0) {
          d.idioms = activeIdiomChunk.map((idm: string) => ({
            idiom: idm,
            definition: `Target expression for ${cefr} level speaking.`,
            example_sentences: [`In context, "${idm}" conveys natural nuance.`, `Students applied "${idm}" in conversation.`],
            expression: idm,
            meaning: `Target expression for ${cefr} level speaking.`,
            usage: `In context, "${idm}" conveys natural nuance.`
          }))
        }
      }
    })
  })

  return parsedData
}

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
              `Systematically cover target grammar (${grammarTags.join(', ') || primaryGrammar}) across progressive sub-sections.`,
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
            grammarDefinition: gInfo.definition,
            usageCases: gInfo.usageCases,
            grammarExplanation: gInfo.explanation,
            explanation_rationale: gInfo.explanation_rationale,
            syntaxFormula: gInfo.syntaxFormula,

            boardLayout: gInfo.board,
            grammarScopeLimit: gInfo.scope,
            grammarForms: gInfo.forms,
            sentenceModels: gInfo.sentenceModels || [
              `Positive (+): ${gInfo.forms?.positive || 'She has finished the work.'}`,
              `Negative (-): ${gInfo.forms?.negative || 'They have not arrived yet.'}`,
              `Interrogative (?): ${gInfo.forms?.interrogative || 'Have you seen the report?'}`
            ],
            grammarSubSections: gInfo.subSections,
            edgeCases: gInfo.edgeCases,
            edge_case_syntax: gInfo.edge_case_syntax,
            signalWords: gInfo.signalWords,
            objectives: [
              `Master structural form and sentence syntax of ${primaryGrammar}: ${gInfo.rule}`,
              vocabTags.length > 0 ? `Apply target vocabulary: ${vocabTags.join(', ')}.` : undefined,
              idiomTags.length > 0 ? `Incorporate idioms such as "${idiomTags[0]}" naturally.` : undefined
            ].filter(Boolean),
            vocabulary: vocabTags.length > 0
              ? vocabTags.map((v: string) => ({
                  word: v,
                  part_of_speech: 'noun/verb',
                  definition: `Key term for ${cefr} level contexts.`,
                  example_sentences: [
                    `We need to focus on ${v} during our discussion.`,
                    `The student used ${v} effectively in written composition.`
                  ],
                  partOfSpeech: 'noun/verb',
                  def: `Key term for ${cefr} level contexts.`,
                  example: `We need to focus on ${v} during our discussion.`
                }))
              : [],
            idioms: idiomTags.length > 0
              ? idiomTags.map((idm: string) => ({
                  idiom: idm,
                  definition: `Common figurative expression.`,
                  example_sentences: [
                    `They used "${idm}" to express ideas fluently.`,
                    `In formal discourse, "${idm}" conveys nuanced meaning.`
                  ],
                  expression: idm,
                  meaning: `Common figurative expression.`,
                  usage: `Used to express ideas fluently.`
                }))
              : [],
            ccqs: gInfo.ccqs,
            quiz: [
              {
                question: `Which option correctly completes the sentence using ${primaryGrammar}?`,
                options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
                answer: 'Option A (Correct)',
                reason: gInfo.rule
              }
            ],
            homework: vocabTags.length > 0
              ? `Write a 120-word paragraph incorporating target structure (${primaryGrammar}) and target vocabulary.`
              : `Write a 120-word paragraph incorporating target structure (${primaryGrammar}).`
          }
        })
      }
    }

    // Call OpenAI for live AI generation
    if (scope === 'term') {
      const prompt = `Generate a structured JSON response for a ${termWeeks}-Week (${termWeeks * sessionsPerWeek} Total Sessions) Academic Term Roadmap.
      
      Parameters:
      - CEFR Level: ${cefr}
      - Target Grammar: ${grammarTags.join(', ') || 'Core CEFR Grammar'}
      - Target Vocabulary: ${vocabTags.length > 0 ? vocabTags.join(', ') : 'NONE PROVIDED BY TEACHER'}
      - Target Idioms: ${idiomTags.length > 0 ? idiomTags.join(', ') : 'NONE PROVIDED BY TEACHER'}
      - Real-World Topic: ${topic || 'General Academic English'}
      - Sessions Per Week: ${sessionsPerWeek}
      - Teaching Days: ${selectedDays.join(', ')}

      STRICT CONSTRAINTS:
      1. VOCABULARY & IDIOMS RULE: If Target Vocabulary is "NONE PROVIDED BY TEACHER", return empty arrays [] for "vocabList" and "vocabulary" in all session objects. DO NOT invent unrequested vocabulary words. If Target Idioms is "NONE PROVIDED BY TEACHER", return empty arrays [] for "idioms".
      2. DIVERSE GRAMMAR CHUNKING RULE: Break down complex grammar topics (e.g. Active/Passive Voice, Conditionals, Reported Speech, Tenses, Modals) into progressive, sequential sub-sections across sessions.
      3. DEFINITION & RATIONALE RULE: For every session, provide formal academic "grammarDefinition", 2-3 "usageCases", and a 1-2 sentence "explanation_rationale" (why speakers use this in real-world communicative context).
      4. EDGE CASE & SYNTAX RULE: Include "edgeCases" (pitfalls/exceptions), "edge_case_syntax" (explicit structural formulas for edge cases), "syntaxPatterns" (pure structural formulas), and "sentenceModels" (concrete example sentences).

      Return ONLY valid JSON adhering strictly to this schema:
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
                "topic": "Session Topic — Progressive Sub-Section Name",
                "grammarFocus": "Concise rule summary",
                "grammarDefinition": "Formal academic definition of this grammatical concept",
                "usageCases": ["Real-world usage scenario 1", "Real-world usage scenario 2"],
                "grammarExplanation": "Detailed explanation of when and why to use this structure",
                "explanation_rationale": "Core communicative rationale explaining real-world communicative value.",
                "syntaxFormula": "Exact word order syntax breakdown [Subject] + [Auxiliary] + [Verb]...",
                "syntaxPatterns": {
                  "positive": "[Subject] + [Aux] + [V3]",
                  "negative": "[Subject] + [Aux] + not + [V3]",
                  "interrogative": "[Aux] + [Subject] + [V3]?",
                  "shortAnswers": "Yes, [Subject] + [Aux]. / No, [Subject] + [Aux] + not."
                },
                "grammarScopeLimit": "What to cover vs leave out today",
                "boardLayout": "Whiteboard formula",
                "grammarForms": {
                  "positive": "[Subject] + [Aux] + [V3]",
                  "negative": "[Subject] + [Aux] + not + [V3]",
                  "interrogative": "[Aux] + [Subject] + [V3]?",
                  "shortAnswers": "Short answer format"
                },
                "sentenceModels": [
                  "Positive (+): Full example sentence",
                  "Negative (-): Full example sentence",
                  "Interrogative (?): Full example question"
                ],
                "grammarSubSections": ["Sub-section 1", "Sub-section 2"],
                "edgeCases": ["Edge case / common mistake 1", "Edge case 2"],
                "edge_case_syntax": ["[Edge Case Formula 1]", "[Edge Case Formula 2]"],
                "signalWords": ["word1", "word2"],
                "vocabList": [],
                "vocabulary": [],
                "idioms": [],
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4
      })

      const content = completion.choices[0].message.content || '{}'
      let parsedData = JSON.parse(content)
      parsedData = postProcessTermData(parsedData, vocabTags, idiomTags, cefr)
      return NextResponse.json({ success: true, data: parsedData })

    } else {
      // Single Plan AI Generation
      const prompt = `Generate a structured JSON response for a Single Session Lesson Plan.

      Parameters:
      - CEFR Level: ${cefr}
      - Target Grammar: ${grammarTags.join(', ') || primaryGrammar}
      - Target Vocabulary: ${vocabTags.length > 0 ? vocabTags.join(', ') : 'NONE PROVIDED BY TEACHER'}
      - Target Idioms: ${idiomTags.length > 0 ? idiomTags.join(', ') : 'NONE PROVIDED BY TEACHER'}
      - Real-World Topic: ${topic || 'General Academic English'}
      - Duration: 45 Minutes

      STRICT CONSTRAINTS:
      1. VOCABULARY & IDIOMS RULE: If Target Vocabulary is "NONE PROVIDED BY TEACHER", return empty array [] for "vocabulary". If Target Idioms is "NONE PROVIDED BY TEACHER", return empty array [] for "idioms". DO NOT invent unrequested vocabulary/idioms.
      2. DEFINITION & RATIONALE RULE: Provide formal academic "grammarDefinition", 2-3 "usageCases", and a 1-2 sentence "explanation_rationale" (communicative purpose).
      3. PURE SYNTAX RULES VS EXAMPLES RULE: Separately provide "syntaxPatterns" (pure structural formulas) and "sentenceModels" (actual full example sentences).
      4. EDGE CASE & SYNTAX RULE: Include "edgeCases" and "edge_case_syntax" (explicit structural formulas for edge cases).

      Return ONLY valid JSON adhering strictly to this schema:
      {
        "isTerm": false,
        "detailLevel": "${detailLevel}",
        "title": "Mastering ${grammarTags.join(' & ') || primaryGrammar}",
        "cefr": "${cefr}",
        "duration": "45 Minutes",
        "theme": "${topic || 'Academic Lesson'}",
        "grammarFocus": "Concise rule summary",
        "grammarDefinition": "Formal academic definition of this grammatical concept",
        "usageCases": [
          "Real-world usage scenario 1",
          "Real-world usage scenario 2"
        ],
        "grammarExplanation": "Detailed explanation of when, why, and how to use this grammar in authentic contexts",
        "explanation_rationale": "Brief 1-2 sentence explanation of what target structure is used for and its core communicative rationale in real-world contexts.",
        "syntaxFormula": "Word order syntax formula (e.g. [Subject] + [have/has] + [V3])",
        "syntaxPatterns": {
          "positive": "[Subject] + [Aux] + [V3]",
          "negative": "[Subject] + [Aux] + not + [V3]",
          "interrogative": "[Aux] + [Subject] + [V3]?",
          "shortAnswers": "Yes, [Subject] + [Aux]. / No, [Subject] + [Aux] + not."
        },
        "boardLayout": "Whiteboard formula (e.g. Subj + have/has + V3)",
        "grammarScopeLimit": "Specific focus and boundaries for this single session",
        "grammarForms": {
          "positive": "[Subject] + [Aux] + [V3]",
          "negative": "[Subject] + [Aux] + not + [V3]",
          "interrogative": "[Aux] + [Subject] + [V3]?",
          "shortAnswers": "Short answer formats"
        },
        "sentenceModels": [
          "Positive (+): [Full model sentence]",
          "Negative (-): [Full model sentence]",
          "Interrogative (?): [Full model question]",
          "Short Answer: [Short answer response]"
        ],
        "grammarSubSections": ["Sub-section 1", "Sub-section 2", "Sub-section 3"],
        "edgeCases": [
          "Edge case 1: Common L1 student trap or exception",
          "Edge case 2: Key usage pitfall to avoid"
        ],
        "edge_case_syntax": [
          "[Structural syntax formula for Edge Case 1]",
          "[Structural syntax formula for Edge Case 2]"
        ],
        "signalWords": ["signal1", "signal2", "signal3"],
        "objectives": [
          "Objective 1",
          "Objective 2"
        ],
        "vocabulary": ${vocabTags.length > 0 ? `[${vocabTags.map((v: string) => JSON.stringify({ word: v, part_of_speech: 'noun', definition: `Definition of ${v}`, example_sentences: [`Example 1 using ${v}.`, `Example 2 using ${v}.`] })).join(',')}]` : '[]'},
        "idioms": ${idiomTags.length > 0 ? `[${idiomTags.map((idm: string) => JSON.stringify({ idiom: idm, definition: `Definition of ${idm}`, example_sentences: [`Example 1 using ${idm}.`, `Example 2 using ${idm}.`] })).join(',')}]` : '[]'},
        "ccqs": ["CCQ 1?", "CCQ 2?", "CCQ 3?"],
        "quiz": [
          {
            "question": "Formative evaluation question checking target structure",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "reason": "Detailed grammar reason for correct answer"
          }
        ],
        "homework": "Clear 120-word application writing prompt incorporating target grammar."
      }
      `

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
