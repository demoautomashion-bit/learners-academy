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
  const { termWeeks, sessionsPerWeek, cefr, theme, grammarTags, vocabTags, weeklyArchetypes } = params

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

      // Custom user tags integration
      if (grammarTags.length > 0 && d === 1 && w !== 6 && w !== 12) {
        const customG = grammarTags[(w - 1) % grammarTags.length]
        if (customG) {
          weekData.grammarTopic = customG
        }
      }
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
            topicTitle = `📘 Grammar Focus: ${weekData.grammarTopic}`
            grammarFocus = weekData.grammarRule
            grammarScopeLimit = weekData.grammarScope
            boardLayout = weekData.boardFormula
            activityType = "Board Formula & Direct Instruction Drills"
            activityDetail = "Teacher delivers direct instruction using whiteboard formulas, followed by controlled sentence transformation drills."
            objective = `Master structural accuracy and form of ${weekData.grammarTopic} in "${theme}" context.`
            ccqs = [
              `When do we use this structure? ${weekData.grammarRule.slice(0, 50)}...`,
              `What is the auxiliary verb form on the board? ${weekData.boardFormula.slice(0, 35)}...`,
              `Does this represent a finished or ongoing state?`
            ]
            break

          case 'discussion':
            const discTopic = cefrDiscussions[(sessionNum - 1) % cefrDiscussions.length]
            topicTitle = `🗣️ Discussion & Debate: ${discTopic.topic}`
            grammarFocus = `Apply ${weekData.grammarTopic} naturally during persuasive speaking.`
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
            grammarFocus = `Consolidate ${weekData.grammarTopic} through interactive classroom dynamics.`
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
            grammarFocus = `Analyze ${weekData.grammarTopic} within authentic reading text.`
            activityType = "Text Analysis & Vocab Extraction"
            activityDetail = `Students read "${weekData.readingTitle}", practice ${weekData.readingStrategy}, and extract target vocabulary.`
            objective = `Enhance reading comprehension, context vocabulary extraction, and text strategy.`
            readingPassage = {
              passageTitle: weekData.readingTitle,
              readingStrategy: weekData.readingStrategy,
              comprehensionQuestions: [
                `What is the main topic of "${weekData.readingTitle}"?`,
                `Scan Paragraph 2: Find two target vocabulary words used in context.`,
                `Identify one instance of ${weekData.grammarTopic} in the text and explain why the author used it.`
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
          instructions: archetype === 'grammar' ? `Explain ${boardLayout}. Conduct Concept Check Questions (CCQs).` : `Introduce key expressions (${(functionalPhrases || vocabList).slice(0, 3).join(', ')}).`
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

      weekDays.push({
        sessionNum,
        weekNum: w,
        dayNum: d,
        day: `Session ${sessionNum} (Week ${w}, Day ${d})`,
        dayArchetype: archetype,
        topic: topicTitle,
        grammarFocus,
        grammarScopeLimit,
        boardLayout,
        vocabList,
        unitRef,
        activityType,
        activityDetail,
        objective,
        type,
        ccqs,
        discussionTopics,
        functionalPhrases,
        activityGame,
        readingPassage,
        phases
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
