/**
 * Granular Curriculum Generator Engine
 * Supports Day-Labeled Weekly Schedules with Specialized Day Archetypes:
 * - 📘 Grammar & Structure Day (Board layout, scope limit, CCQs, drills)
 * - 🗣️ Discussion & Debate Day (CEFR debate topics, starter questions, functional phrases)
 * - 🎮 Extra Activity & Fluency Day (Classroom games, setup steps, rules, materials)
 * - 📖 Book & Reading Day (Unit mapping, reading strategies, text vocab, comprehension Qs)
 */

export type DayArchetype = 'grammar' | 'activity' | 'discussion' | 'reading'

export interface DailySession {
  sessionNum: number
  weekNum: number
  dayNum: number
  day: string
  dayArchetype: DayArchetype
  topic: string
  grammarFocus: string
  grammarScopeLimit?: string
  boardLayout?: string
  vocabList: string[]
  unitRef: string
  activityType: string
  activityDetail: string
  objective: string
  type: 'Instruction & Practice' | 'Assessment' | 'Exam'
  ccqs: string[]
  discussionTopics?: {
    topic: string
    prompt: string
    cefrLevel: string
  }[]
  functionalPhrases?: string[]
  activityGame?: {
    gameName: string
    materials: string[]
    rules: string[]
    scoring: string
  }
  readingPassage?: {
    passageTitle: string
    readingStrategy: string
    comprehensionQuestions: string[]
  }
  phases: {
    phase: string
    time: string
    activity: string
    instructions: string
  }[]
}

export interface GranularWeek {
  weekNum: number
  title: string
  theme: string
  days: DailySession[]
}

export interface GeneratorParams {
  termWeeks: number
  sessionsPerWeek: number
  cefr: string
  theme: string
  grammarTags: string[]
  vocabTags: string[]
  idiomTags: string[]
  weeklyArchetypes?: DayArchetype[]
  selectedDays?: string[]
  detailLevel?: 'simplified' | 'detailed'
}

// Dynamic Grammar Synthesizer for Teacher Inputs
export function getGrammarDetailsForStructure(grammarTag: string, cefr: string = 'B1') {
  const gLower = grammarTag.toLowerCase()

  if (gLower.includes('present perfect vs past simple') || (gLower.includes('present perfect') && gLower.includes('past simple'))) {
    return {
      topic: 'Present Perfect vs Past Simple',
      rule: 'Use Present Perfect for indefinite past experiences without exact timestamps (ever/never/already). Use Past Simple for completed actions at specific past times (yesterday, in 2021).',
      scope: 'Focus on contrasting finished time expressions (ago, yesterday) with open time periods (this week, so far).',
      board: 'Pres. Perf: Subj + have/has + V3 (Indefinite)  VS  Past Simple: Subj + V2 (Finished Time)',
      ccqs: [
        'Do we know exactly when the action happened in Present Perfect? (No, time is indefinite)',
        'Is "yesterday" used with Present Perfect or Past Simple? (Past Simple)',
        'Is the time period still open with "this week"? (Yes, Present Perfect)'
      ]
    }
  }

  if (gLower.includes('second conditional') || gLower.includes('2nd conditional')) {
    return {
      topic: 'Second Conditional (Hypothetical & Imaginary)',
      rule: 'If + Past Simple, Subject + WOULD / COULD + Base Verb. Used for unreal, imaginary, or highly unlikely present/future situations.',
      scope: 'Emphasize "If I WERE you" (subjunctive were) and contrast real probability (1st) with imaginary situations (2nd).',
      board: 'IF + Past Simple (Condition), Subject + WOULD + V1 (Hypothetical Result)',
      ccqs: [
        'Is this situation real or imaginary? (Imaginary / Hypothetical)',
        'Does the past simple verb refer to past time or present imaginary state? (Present/future unreal state)',
        'What modal verb expresses the hypothetical result? (Would / Could)'
      ]
    }
  }

  if (gLower.includes('first conditional') || gLower.includes('1st conditional')) {
    return {
      topic: 'First Conditional (Real Future Possibility)',
      rule: 'If + Present Simple, Subject + WILL / CAN + Base Verb. Used for real, possible future events and consequences.',
      scope: 'Teach clear condition vs result clauses and modal variations (will, can, might).',
      board: 'IF + Present Simple (Real Condition), Subject + WILL / CAN + V1 (Future Result)',
      ccqs: [
        'Is this situation likely to happen? (Yes, it is a real possibility)',
        'Can we use "will" inside the IF clause? (No, use Present Simple after IF)',
        'What verb form goes in the result clause? (WILL + Base Verb)'
      ]
    }
  }

  if (gLower.includes('third conditional') || gLower.includes('3rd conditional')) {
    return {
      topic: 'Third Conditional (Past Regrets & Imaginary Past)',
      rule: 'If + Past Perfect (had + V3), Subject + WOULD HAVE + V3. Used for impossible past conditions and imaginary past outcomes.',
      scope: 'Focus on past regrets and alternative history outcomes. Drill pronunciation contractions (would\'ve).',
      board: 'IF + had + V3 (Past Condition), Subject + WOULD HAVE + V3 (Past Imaginary Result)',
      ccqs: [
        'Did the condition actually happen in the past? (No)',
        'Can we change the past outcome now? (No, it is impossible)',
        'What form is used in the IF clause? (Past Perfect: HAD + V3)'
      ]
    }
  }

  if (gLower.includes('passive voice') || gLower.includes('passive')) {
    return {
      topic: 'Passive Voice (Focus on Action & Object)',
      rule: 'Subject + BE (am/is/are/was/were) + Past Participle (V3). Used when the focus is on the action/recipient rather than the agent.',
      scope: 'Practice transforming active sentences to passive and determining when "by + agent" is necessary or redundant.',
      board: 'Active: Agent + Verb + Object  ->  Passive: Object + BE + V3 (+ by Agent)',
      ccqs: [
        'Who is doing the action in passive voice? (The agent, but the object is the sentence focus)',
        'What two auxiliary components form every passive verb? (BE verb + Past Participle V3)',
        'When do we omit "by agent"? (When agent is unknown, obvious, or unimportant)'
      ]
    }
  }

  if (gLower.includes('reported speech') || gLower.includes('indirect speech')) {
    return {
      topic: 'Reported Speech & Tense Shifts',
      rule: 'When reporting what someone said in the past, shift tenses back one step (Present -> Past, Past/Present Perf -> Past Perf).',
      scope: 'Cover statement backshifting, pronoun changes, and time word shifts (today -> that day, tomorrow -> the next day).',
      board: 'Direct: "I am working"  ->  Reported: He said (that) he WAS working.',
      ccqs: [
        'What happens to Present Simple in reported speech? (Shifts back to Past Simple)',
        'Does the speaker\'s pronoun change when reporting? (Yes, e.g. "I" becomes "he/she")',
        'Is "that" mandatory after said/told? (No, it is optional)'
      ]
    }
  }

  if (gLower.includes('relative clauses') || gLower.includes('relative pronoun')) {
    return {
      topic: 'Relative Clauses (Who, Which, That, Where)',
      rule: 'Use relative pronouns to join sentences and provide essential (defining) or extra (non-defining) information about nouns.',
      scope: 'Contrast defining clauses (no commas, essential info) vs non-defining clauses (with commas, extra info).',
      board: 'Person: WHO/THAT  |  Thing: WHICH/THAT  |  Place: WHERE  |  Possession: WHOSE',
      ccqs: [
        'Which relative pronoun do we use for people? (Who / That)',
        'Do defining relative clauses use commas? (No commas needed)',
        'What pronoun is used for physical locations? (Where)'
      ]
    }
  }

  if (gLower.includes('modal') || gLower.includes('modals of deduction')) {
    return {
      topic: 'Modal Verbs of Deduction & Certainty',
      rule: 'MUST + V1 (90%+ certain true), MIGHT / COULD + V1 (50% possible), CAN\'T + V1 (90%+ certain impossible).',
      scope: 'Teach degrees of certainty in present speculation. Distinguish between logical deduction and obligation.',
      board: 'Subject + MUST / MIGHT / CAN\'T + V1 (Base Form)',
      ccqs: [
        'When do we use MUST? (When we are almost 100% sure something is true based on evidence)',
        'What modal means 90% impossible? (Can\'t)',
        'Does "might" express high certainty or lower possibility? (Lower possibility / ~50%)'
      ]
    }
  }

  return {
    topic: grammarTag,
    rule: `Apply accurate structural rules for ${grammarTag} within formal and informal ${cefr}-level language contexts.`,
    scope: `Focus on sentence construction, affirmative/negative forms, and common usage errors associated with ${grammarTag}.`,
    board: `Target Formula: ${grammarTag} (Form & Transformation Rules)`,
    ccqs: [
      `What is the primary function of ${grammarTag}?`,
      `How do we form affirmative and negative sentences using this structure?`,
      `What common student errors should be avoided?`
    ]
  }
}

// Default weekly archetype schedules based on sessionsPerWeek
const DEFAULT_SCHEDULE_ARCHETYPES: Record<number, DayArchetype[]> = {
  2: ['grammar', 'discussion'],
  3: ['grammar', 'activity', 'discussion'],
  4: ['grammar', 'reading', 'activity', 'discussion'],
  5: ['grammar', 'reading', 'activity', 'grammar', 'discussion']
}

// CEFR-Tailored Discussion & Debate Database
const DISCUSSION_TOPICS_BY_CEFR: Record<string, Array<{ topic: string; prompt: string }>> = {
  A1: [
    { topic: "Favorite Seasons & Weather", prompt: "Which weather do you prefer and what activities do you do?" },
    { topic: "Daily Habits & Free Time", prompt: "How do you spend your weekends versus weekdays?" },
    { topic: "Travel vs Staying Home", prompt: "Do you like traveling to new cities or staying in your hometown?" }
  ],
  A2: [
    { topic: "Eating Out vs Cooking at Home", prompt: "Is it healthier and cheaper to cook or dine at restaurants?" },
    { topic: "Public Transport vs Driving", prompt: "Should cities ban cars from city centers to reduce pollution?" },
    { topic: "Social Media Habits", prompt: "Do smartphones make people more connected or more isolated?" }
  ],
  B1: [
    { topic: "Solo Backpacking vs Guided Group Tours", prompt: "Is traveling alone more rewarding than traveling with a guided tour group?" },
    { topic: "Tourism Impact on Historic Cities", prompt: "Does mass tourism destroy local culture or help local economies thrive?" },
    { topic: "Working Remotely While Traveling (Digital Nomads)", prompt: "Can you maintain high career productivity while living as a travel nomad?" },
    { topic: "Eco-Tourism & Environmental Responsibility", prompt: "Should travelers pay an environmental tax when visiting fragile natural landmarks?" }
  ],
  B2: [
    { topic: "Cultural Assimilation vs Preserving Heritage", prompt: "When living abroad, should immigrants adapt completely or preserve native customs?" },
    { topic: "The Ethics of Captive Wildlife Tourism", prompt: "Should animal sanctuaries and zoos be phased out in favor of wild reserves?" },
    { topic: "Artificial Intelligence in Education", prompt: "Will AI tutors replace human language teachers in the next decade?" }
  ],
  C1: [
    { topic: "Gentrifcation in Global Metropolises", prompt: "Is urban redevelopment beneficial for cities or destructive to working-class communities?" },
    { topic: "Overtourism & Sustainable Travel Policy", prompt: "How should UNESCO World Heritage sites regulate visitor numbers without hurting local livelihoods?" }
  ],
  C2: [
    { topic: "Linguistic Imperialism & Global English", prompt: "Does the dominance of global English erode indigenous languages and cultural nuances?" },
    { topic: "Philosophical Paradigms of Space Exploration", prompt: "Should humanity focus resources on Earth restoration before colonizing other planets?" }
  ]
}

// Interactive Classroom Game Templates for Activity Days
const CLASSROOM_GAMES = [
  {
    gameName: "Running Dictation & Grammar Challenge",
    materials: ["Printed sentence strips", "Whiteboard markers", "Notebooks"],
    rules: [
      "Divide class into pairs: Runner and Writer.",
      "Runners sprint to read posted target sentences outside the door and memorize them.",
      "Runners dictate the exact grammar and vocabulary to Writers without touching the pen.",
      "First pair to accurately transcribe and correct grammar errors wins."
    ],
    scoring: "10 points for perfect grammar, 5 points for accurate vocabulary usage."
  },
  {
    gameName: "Information Gap & Travel Booking Roleplay",
    materials: ["Roleplay scenario cards (Client & Agent)", "Budget worksheets"],
    rules: [
      "Pair students: One travel consultant with flight schedules, one traveler with secret preferences.",
      "Students negotiate itinerary details without looking at each other's sheets.",
      "Must use target conditional and modal structures to complete the booking."
    ],
    scoring: "Evaluated on smooth negotiation, target structure usage, and accuracy."
  },
  {
    gameName: "Grammar Jeopardy & Speed Buzzer Tournament",
    materials: ["Jeopardy grid on board", "Buzzer or desk bell"],
    rules: [
      "Divide class into 3 competing teams.",
      "Categories include: Tense Transformations, Vocab Definitions, Spot the Error, and Idiom Usage.",
      "Teams buzz in to answer. Correct answers earn points; wrong answers forfeit points to competitors."
    ],
    scoring: "Team with highest cumulative score after 5 rounds wins the trophy."
  },
  {
    gameName: "Murder Mystery & Modals of Deduction Challenge",
    materials: ["Clue cards", "Character sheets", "Evidence files"],
    rules: [
      "Each student receives a character profile with hidden clues about a mysterious missing suitcase.",
      "Students mingle and interview suspects using modals of deduction ('He must have taken the map because...').",
      "Groups submit a final investigative report explaining the culprit."
    ],
    scoring: "Full points for identifying the correct suspect with accurate modal justification."
  }
]

// Functional Speaking Phrases for Discussion Days
const FUNCTIONAL_PHRASES_BY_CEFR: Record<string, string[]> = {
  A1: ["I think that...", "In my opinion...", "I agree with you.", "I don't agree.", "What about you?"],
  A2: ["From my point of view...", "That's a good point.", "I'm not sure about that.", "On one hand...", "Could you explain why?"],
  B1: [
    "From my perspective...",
    "I see your point, but consider...",
    "While that may be true, on the flip side...",
    "I would argue that...",
    "That aligns with my experience because..."
  ],
  B2: [
    "I take your point, however...",
    "It's worth considering that...",
    "That plays a crucial role in...",
    "I respectfully disagree because...",
    "To play devil's advocate for a moment..."
  ],
  C1: [
    "That raises a fundamental question regarding...",
    "Notwithstanding your premise, we must acknowledge...",
    "I would challenge the assertion that...",
    "That argument hinges upon the assumption that..."
  ]
}

// B1 Baseline Syllabus Template Data
const B1_SYLLABUS_WEEKS = [
  {
    weekTitle: "Week 1: Past Events & Life Experiences",
    grammarTopic: "Present Perfect vs Past Simple",
    grammarRule: "Present Perfect for indefinite life experiences (ever/never) vs Past Simple for fixed dates (in 2022, yesterday).",
    grammarScope: "Focus on affirmative and negative forms today. Leave question inversion drills for Session 2.",
    boardFormula: "Subject + have/has + V3 (Past Participle)  VS  Subject + V2 (Past Form) + Time Marker",
    vocab: ["itinerary", "expedition", "embark", "pristine", "destination"],
    unit: "Unit 1A (pp. 10-13): Horizons",
    readingTitle: "The Great Silk Road Expeditions",
    readingStrategy: "Scanning for specific historic dates vs Skimming for narrative gist."
  },
  {
    weekTitle: "Week 2: Future Intentions & Scheduled Events",
    grammarTopic: "Future Plans: 'Be Going To' vs Present Continuous",
    grammarRule: "'Be going to' for personal intentions vs Present Continuous for fixed pre-arranged bookings.",
    grammarScope: "Teach clear contrast between intent (mental plan) vs arrangement (ticket purchased).",
    boardFormula: "Subject + am/is/are + going to + Infinitive  VS  Subject + am/is/are + V-ing (Fixed Time/Place)",
    vocab: ["reservation", "flight schedule", "boarding", "confirmation", "itinerary"],
    unit: "Unit 2A (pp. 22-25): Future Travel",
    readingTitle: "Hyperloop & The Future of High-Speed Transit",
    readingStrategy: "Identifying author stance and technological predictions."
  },
  {
    weekTitle: "Week 3: Passive Voice in Descriptions & Processes",
    grammarTopic: "Passive Voice: Present Simple & Past Simple",
    grammarRule: "Form: Be + Past Participle. Focus on the action/object rather than who performed it.",
    grammarScope: "Limit to Present & Past Simple passive forms. Do not introduce passive modals yet.",
    boardFormula: "Object + am/is/are/was/were + V3 (Past Participle) + [by Agent]",
    vocab: ["produced", "manufactured", "exported", "heritage", "craftsmanship"],
    unit: "Unit 3A (pp. 34-37): Local Crafts & Culture",
    readingTitle: "How Venetian Glass Artifacts Are Hand-Crafted",
    readingStrategy: "Process flowchart mapping and passive verb identification."
  },
  {
    weekTitle: "Week 4: Relative Clauses & Descriptive Precision",
    grammarTopic: "Defining Relative Clauses (who, which, that, where)",
    grammarRule: "Relative pronouns without commas to give essential information identifying a person, place, or thing.",
    grammarScope: "Focus on defining clauses (no commas). Cover non-defining clauses next week.",
    boardFormula: "Noun + [who / which / that / where] + Clause  (No Commas)",
    vocab: ["guide", "resort", "scenery", "local", "exotic"],
    unit: "Unit 4A (pp. 46-49): Descriptive Travel",
    readingTitle: "Unexplored Eco-Resorts of the Amazon Rainforest",
    readingStrategy: "Identifying descriptive relative clauses and extracting key destination features."
  },
  {
    weekTitle: "Week 5: Conditionals & Hypothetical Travel Scenarios",
    grammarTopic: "First Conditional (Real Future) vs Second Conditional (Unreal Present)",
    grammarRule: "First: If + Present, Will + Infinitive (real). Second: If + Past, Would + Infinitive (imaginary).",
    grammarScope: "Focus on contrasting real probability (First) vs imaginary dream scenarios (Second).",
    boardFormula: "First: If + Present Simple, Will + V1  |  Second: If + Past Simple, Would + V1",
    vocab: ["budget", "backpacking", "flight deal", "opportunity", "itinerary"],
    unit: "Unit 5A (pp. 58-61): Trip Planning",
    readingTitle: "10 Travel Mistakes You Should Avoid At All Costs",
    readingStrategy: "Analyzing cause and effect in conditional advice."
  },
  {
    weekTitle: "Week 6: Mid-Term Review & Oral Evaluation Milestone",
    grammarTopic: "Mid-Term Review & Oral Defense Checkpoint",
    grammarRule: "Comprehensive synthesis of Weeks 1-5 grammar modules and vocabulary.",
    grammarScope: "Diagnostic evaluation of student grammar accuracy and oral fluency.",
    boardFormula: "Mid-Term Assessment & Progress Checklist",
    vocab: ["recap", "synthesis", "fluency", "accuracy", "assessment"],
    unit: "Mid-Term Review Module (pp. 70-71)",
    readingTitle: "Mid-Term Portfolio Review & Diagnostic Test",
    readingStrategy: "Comprehensive text analysis and error identification."
  },
  {
    weekTitle: "Week 7: Modals of Speculation & Deduction",
    grammarTopic: "Modals of Present Speculation (must, might, can't)",
    grammarRule: "Must + infinitive (90% sure true), Might (50% possible), Can't (90% sure impossible).",
    grammarScope: "Teach degrees of certainty using present modals. Leave past deduction for Session 2.",
    boardFormula: "Subject + MUST / MIGHT / CAN'T + V1 (Base Form)",
    vocab: ["mystery", "landmark", "artifact", "archaeological", "clue"],
    unit: "Unit 7A (pp. 72-75): Historical Mysteries",
    readingTitle: "The Mysterious Disappearance of Amelia Earhart",
    readingStrategy: "Evaluating historical evidence and modal deductions."
  },
  {
    weekTitle: "Week 8: Reported Speech & Indirect Communication",
    grammarTopic: "Reported Statements & Tense Shifts",
    grammarRule: "Backshifting tenses (Present Simple -> Past Simple, Present Perfect -> Past Perfect) in indirect reporting.",
    grammarScope: "Focus on reporting statements and tense backshifting rule.",
    boardFormula: "Direct: 'I am tired'  ->  Reported: He said (that) he WAS tired.",
    vocab: ["statement", "complaint", "feedback", "review", "testimonial"],
    unit: "Unit 8A (pp. 84-87): Hotel Reviews & Complaints",
    readingTitle: "Behind the Scenes of Luxury Hotel Concierge Desks",
    readingStrategy: "Distinguishing direct dialogue from reported statements."
  },
  {
    weekTitle: "Week 9: Past Habits vs Present Routines",
    grammarTopic: "Used To vs Would for Past Habits",
    grammarRule: "'Used to' for past states & actions vs 'Would' for repeated past actions only (not states).",
    grammarScope: "Emphasize that 'would' CANNOT be used for past states ('would be quiet' is incorrect).",
    boardFormula: "Subject + used to + V1 (States & Actions)  VS  Subject + would + V1 (Repeated Actions)",
    vocab: ["tradition", "nostalgia", "transformation", "heritage", "lifestyle"],
    unit: "Unit 9A (pp. 96-99): Changing Cities",
    readingTitle: "How Tokyo Evolved From a Fishing Village to a Megacity",
    readingStrategy: "Tracking historical transformations and habit contrasts."
  },
  {
    weekTitle: "Week 10: Advanced Comparison & Degree Modifiers",
    grammarTopic: "Comparatives with Modifiers (far more, slightly less, nowhere near as)",
    grammarRule: "Using degree modifiers: far / significantly / slightly / a bit + comparative adjective.",
    grammarScope: "Teach exact degree modifiers to make comparisons nuanced and formal.",
    boardFormula: "Subject + verb + [far / significantly / slightly] + Comparative Adj + than + Noun",
    vocab: ["luxury", "economical", "spacious", "congested", "tranquil"],
    unit: "Unit 10A (pp. 108-111): Resort Comparison",
    readingTitle: "The Highs and Lows of Overwater Bungalow Resorts",
    readingStrategy: "Comparative evaluation and price/value analysis."
  },
  {
    weekTitle: "Week 11: Verb Patterns (Gerunds & Infinitives)",
    grammarTopic: "Verbs Followed by Gerund (-ing) vs Infinitive (to)",
    grammarRule: "Verb patterns: enjoy/avoid/recommend + -ing vs decide/plan/hope + to-infinitive.",
    grammarScope: "Focus on verb pattern categorization and common student pre-verb errors.",
    boardFormula: "Verb + V-ing (enjoy, avoid, suggest)  VS  Verb + to-V1 (decide, plan, hope)",
    vocab: ["preference", "avoidance", "anticipation", "itinerary", "aspiration"],
    unit: "Unit 11A (pp. 120-123): Travel Preferences",
    readingTitle: "Psychology of Travel: What Your Vacation Style Says About You",
    readingStrategy: "Extracting psychological profiles and verb structures."
  },
  {
    weekTitle: "Week 12: Term Synthesis & Final Academic Assessment",
    grammarTopic: "Final Course Synthesis & Graduation Defense",
    grammarRule: "Comprehensive term review and CEFR B1 attainment defense.",
    grammarScope: "Formal 60-minute written examination and 1-on-1 oral defense.",
    boardFormula: "Final Term Certification & Academic Evaluation Rubric",
    vocab: ["examination", "evaluation", "assessment", "rubric", "certification"],
    unit: "Final Exam Module (pp. 132-135)",
    readingTitle: "Final Course Evaluation & Portfolio Assessment",
    readingStrategy: "Academic synthesis and portfolio defense."
  }
]

export function generateGranularTermRoadmap(params: GeneratorParams): GranularWeek[] {
  const { termWeeks, sessionsPerWeek, cefr, theme, grammarTags, vocabTags, weeklyArchetypes, selectedDays, detailLevel } = params

  const defaultDays = ['Monday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday']
  const daysList = selectedDays && selectedDays.length > 0
    ? selectedDays
    : defaultDays.slice(0, sessionsPerWeek)

  // Determine schedule archetypes per week (e.g. ['grammar', 'activity', 'discussion'])
  const archetypes = weeklyArchetypes && weeklyArchetypes.length === sessionsPerWeek
    ? weeklyArchetypes
    : (DEFAULT_SCHEDULE_ARCHETYPES[sessionsPerWeek] || DEFAULT_SCHEDULE_ARCHETYPES[3])

  const generatedWeeks: GranularWeek[] = []
  let overallSessionCounter = 1

  const cefrDiscussions = DISCUSSION_TOPICS_BY_CEFR[cefr] || DISCUSSION_TOPICS_BY_CEFR['B1']
  const cefrPhrases = FUNCTIONAL_PHRASES_BY_CEFR[cefr] || FUNCTIONAL_PHRASES_BY_CEFR['B1']

  for (let w = 1; w <= termWeeks; w++) {
    const weekData = B1_SYLLABUS_WEEKS[(w - 1) % B1_SYLLABUS_WEEKS.length]
    const weekDays: DailySession[] = []

    for (let d = 1; d <= sessionsPerWeek; d++) {
      const sessionNum = overallSessionCounter++
      const archetype = archetypes[(d - 1) % archetypes.length]
      const dayName = daysList[(d - 1) % daysList.length] || `Day ${d}`

      let type: 'Instruction & Practice' | 'Assessment' | 'Exam' = 'Instruction & Practice'
      let topicTitle = ''
      let grammarFocus = ''
      let grammarScopeLimit: string | undefined = undefined
      let boardLayout: string | undefined = undefined
      let vocabList = [...weekData.vocab]
      let unitRef = weekData.unit
      let activityType = ''
      let activityDetail = ''
      let objective = ''
      let ccqs: string[] = []
      let discussionTopics: DailySession['discussionTopics'] = undefined
      let functionalPhrases: string[] | undefined = undefined
      let activityGame: DailySession['activityGame'] = undefined
      let readingPassage: DailySession['readingPassage'] = undefined

      // Dynamic grammar structure resolution for current session
      const targetGrammarTag = grammarTags.length > 0
        ? grammarTags[(sessionNum - 1) % grammarTags.length]
        : weekData.grammarTopic

      const grammarDetails = getGrammarDetailsForStructure(targetGrammarTag, cefr)

      if (vocabTags.length > 0) {
        vocabList = Array.from(new Set([...vocabTags.slice(0, 3), ...vocabList])).slice(0, 5)
      }

      // Check Mid-Term & Final Exams
      if (w === Math.floor(termWeeks / 2) && d === sessionsPerWeek) {
        type = 'Assessment'
        topicTitle = 'MID-TERM ORAL & WRITTEN EVALUATION'
        grammarFocus = 'Diagnostic assessment of Weeks 1-6 grammar, vocabulary, and speaking fluency.'
        activityType = 'Formal Evaluation'
        activityDetail = 'Students undergo individual oral presentations and written grammar check.'
        objective = 'Evaluate mid-term progress and academic attainment aligned to CEFR criteria.'
      } else if (w === termWeeks && d === sessionsPerWeek) {
        type = 'Exam'
        topicTitle = 'FINAL TERM WRITTEN & ORAL GRADUATION ASSESSMENT'
        grammarFocus = 'Comprehensive semester graduation evaluation covering complete curriculum.'
        activityType = 'Graduation Examination'
        activityDetail = 'Invigilated written exam followed by 1-on-1 speaking interview and portfolio review.'
        objective = 'Certify CEFR level proficiency and issue formal academic transcripts.'
      } else {
        // BUILD ACCORDING TO DAY ARCHETYPE
        switch (archetype) {
          case 'grammar':
            topicTitle = `📘 Grammar Focus: ${grammarDetails.topic}`
            grammarFocus = grammarDetails.rule
            grammarScopeLimit = grammarDetails.scope
            boardLayout = grammarDetails.board
            activityType = "Board Formula & Direct Instruction Drills"
            activityDetail = "Teacher delivers direct instruction using whiteboard formulas, followed by controlled sentence transformation drills."
            objective = `Master structural accuracy and form of ${grammarDetails.topic} in "${theme}" context.`
            ccqs = grammarDetails.ccqs
            break

          case 'discussion':
            const discTopic = cefrDiscussions[(sessionNum - 1) % cefrDiscussions.length]
            topicTitle = `🗣️ Discussion & Debate: ${discTopic.topic}`
            grammarFocus = `Apply ${grammarDetails.topic} naturally during persuasive speaking.`
            activityType = "Class Debate & Panel Discussion"
            activityDetail = `Students are assigned pro/con positions on "${discTopic.topic}". They utilize target functional phrases to debate.`
            objective = `Develop spoken fluency, argumentation, and natural usage of functional expressions.`
            discussionTopics = [
              {
                topic: discTopic.topic,
                prompt: discTopic.prompt,
                cefrLevel: cefr
              },
              {
                topic: `Alternative Perspective: ${discTopic.topic}`,
                prompt: `How would local residents versus international tourists view this issue differently?`,
                cefrLevel: cefr
              }
            ]
            functionalPhrases = cefrPhrases
            ccqs = [
              "Are you expressing agreement or polite disagreement?",
              "What phrase can you use to introduce a counter-argument?"
            ]
            break

          case 'activity':
            const gameTemplate = CLASSROOM_GAMES[(sessionNum - 1) % CLASSROOM_GAMES.length]
            topicTitle = `🎮 Fluency Game: ${gameTemplate.gameName}`
            grammarFocus = `Consolidate ${grammarDetails.topic} through interactive classroom dynamics.`
            activityType = gameTemplate.gameName
            activityDetail = gameTemplate.rules.join(" ")
            objective = `Reinforce target vocabulary and structural patterns through high-energy cooperative gameplay.`
            activityGame = gameTemplate
            ccqs = [
              "What are the game rules and scoring conditions?",
              "What grammar structure must be used to score points?"
            ]
            break

          case 'reading':
            topicTitle = `📖 Book & Reading: ${weekData.readingTitle}`
            grammarFocus = `Analyze ${grammarDetails.topic} within authentic reading text.`
            activityType = "Text Analysis & Vocab Extraction"
            activityDetail = `Students read "${weekData.readingTitle}", practice ${weekData.readingStrategy}, and extract target vocabulary.`
            objective = `Enhance reading comprehension, context vocabulary extraction, and text strategy.`
            readingPassage = {
              passageTitle: weekData.readingTitle,
              readingStrategy: weekData.readingStrategy,
              comprehensionQuestions: [
                `What is the main topic of "${weekData.readingTitle}"?`,
                `Scan Paragraph 2: Find two target vocabulary words used in context.`,
                `Identify one instance of ${grammarDetails.topic} in the text and explain why the author used it.`
              ]
            }
            ccqs = [
              "Are we skimming for the main idea or scanning for specific facts?",
              "What does this target vocabulary word mean in Paragraph 3?"
            ]
            break
        }
      }

      // Generate 4-Phase Timeline customized for archetype
      const phases = [
        {
          phase: 'Phase 1: Warm-Up & Schema Activation',
          time: '10 Mins',
          activity: archetype === 'discussion' ? 'Debate Icebreaker Prompt' : archetype === 'activity' ? 'Game Rules & Team Setup' : archetype === 'reading' ? 'Title & Image Prediction' : 'Grammar Warm-Up & Board Teaser',
          instructions: `Teacher introduces "${theme}" context. Students discuss initial prompts in pairs.`
        },
        {
          phase: 'Phase 2: Core Delivery & Instruction',
          time: '15 Mins',
          activity: archetype === 'grammar' ? 'Whiteboard Formula Breakdown' : archetype === 'discussion' ? 'Functional Language Input' : archetype === 'reading' ? 'Guided Text Reading & Strategy' : 'Game Demo & Safety Trial',
          instructions: archetype === 'grammar' ? `Explain ${boardLayout || grammarFocus}. Conduct Concept Check Questions (CCQs).` : `Introduce key expressions (${(functionalPhrases || vocabList).slice(0, 3).join(', ')}).`
        },
        {
          phase: 'Phase 3: Guided Practice & Dynamics',
          time: '15 Mins',
          activity: activityType,
          instructions: activityDetail
        },
        {
          phase: 'Phase 4: Wrap-Up & Assessment',
          time: '5 Mins',
          activity: 'Exit Ticket & Homework Check',
          instructions: `Review target vocabulary (${vocabList.slice(0, 3).join(', ')}). Assign exercises from ${unitRef}.`
        }
      ]

      // If simplified mode, strip heavy extra fields for lightweight presentation
      const isSimplified = detailLevel === 'simplified'

      weekDays.push({
        sessionNum,
        weekNum: w,
        dayNum: d,
        day: `${dayName} — Session ${sessionNum}`,
        dayArchetype: archetype,
        topic: topicTitle,
        grammarFocus,
        grammarScopeLimit: isSimplified ? undefined : grammarScopeLimit,
        boardLayout: isSimplified ? undefined : boardLayout,
        vocabList,
        unitRef,
        activityType,
        activityDetail,
        objective,
        type,
        ccqs: isSimplified ? [] : ccqs,
        discussionTopics: isSimplified ? undefined : discussionTopics,
        functionalPhrases: isSimplified ? undefined : functionalPhrases,
        activityGame: isSimplified ? undefined : activityGame,
        readingPassage: isSimplified ? undefined : readingPassage,
        phases: isSimplified ? [] : phases
      })
    }

    generatedWeeks.push({
      weekNum: w,
      title: weekData.weekTitle,
      theme,
      days: weekDays
    })
  }

  return generatedWeeks
}
