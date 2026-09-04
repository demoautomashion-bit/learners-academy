/**
 * Granular Curriculum Generator Engine
 * Builds progressive, non-repeating 12-week course roadmaps with fine-grained daily details:
 * - Specific Grammar Sub-rules
 * - Explicit Target Vocabulary Lists
 * - Classroom Activity Methodologies
 * - Coursebook / Unit Section Mappings
 * - Concept Check Questions (CCQs)
 * - 4-Phase Daily Timelines (Warm-up, Instruction, Practice, Wrap-up)
 */

export interface DailySession {
  sessionNum: number
  weekNum: number
  dayNum: number
  day: string
  topic: string
  grammarFocus: string
  vocabList: string[]
  unitRef: string
  activityType: string
  activityDetail: string
  objective: string
  type: 'Instruction & Practice' | 'Assessment' | 'Exam'
  ccqs: string[]
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

interface GeneratorParams {
  termWeeks: number
  sessionsPerWeek: number
  cefr: string
  theme: string
  grammarTags: string[]
  vocabTags: string[]
  idiomTags: string[]
}

// Progressive CEFR Syllabus Curricula Templates
const CEFR_CURRICULUM_TEMPLATES: Record<string, Array<{ weekTitle: string; topics: Array<{ topic: string; grammar: string; vocab: string[]; unit: string; activity: string; detail: string; ccqs: string[] }> }>> = {
  B1: [
    {
      weekTitle: "Week 1: Past Events & Life Experiences",
      topics: [
        {
          topic: "Present Perfect vs Past Simple (Life Experiences)",
          grammar: "Present Perfect + ever/never for unspecified past experience vs Past Simple + definite time (yesterday, in 2022).",
          vocab: ["itinerary", "expedition", "embark", "pristine", "destination"],
          unit: "Unit 1A (pp. 10-13): Horizons",
          activity: "Find Someone Who... Survey",
          detail: "Students interview classmates about past travel experiences using 'Have you ever...' and follow up with 'When did you...?'",
          ccqs: ["Did the action happen in the past? Yes.", "Do we know the exact time? No for Present Perfect, Yes for Past Simple."]
        },
        {
          topic: "Present Perfect Continuous (Ongoing Duration)",
          grammar: "Form: Have/Has been + -ing with 'for' (duration) and 'since' (starting point).",
          vocab: ["backpacking", "sojourn", "hospitality", "excursion", "unwinding"],
          unit: "Unit 1B (pp. 14-17): Journey Duration",
          activity: "Pair Timeline Reconstruction",
          detail: "Students map out a traveler's timeline and describe how long they have been staying at each location.",
          ccqs: ["Is the action finished or still happening? Still happening.", "What preposition marks duration? 'For'."]
        },
        {
          topic: "Past Continuous & Past Simple (Interrupted Actions)",
          grammar: "Past Continuous (was/were + -ing) interrupted by Past Simple (when/while clause).",
          vocab: ["encounter", "unexpected", "mishap", "layover", "transit"],
          unit: "Unit 1C (pp. 18-21): Travel Mishaps",
          activity: "Story Chain & Narrative Building",
          detail: "In groups of 4, students construct a travel story where background events are interrupted by unexpected incidents.",
          ccqs: ["Which action started first? The continuous action.", "Which action interrupted it? The past simple action."]
        }
      ]
    },
    {
      weekTitle: "Week 2: Future Intentions & Scheduled Events",
      topics: [
        {
          topic: "Future Plans: 'Be Going To' vs Present Continuous",
          grammar: "'Be going to' for personal intentions vs Present Continuous for fixed arrangements with time/place.",
          vocab: ["reservation", "flight schedule", "boarding", "confirmation", "itinerary"],
          unit: "Unit 2A (pp. 22-25): Future Travel",
          activity: "Travel Agent Role-Play",
          detail: "One student plays a travel consultant confirming fixed flight details, while the client explains personal intentions.",
          ccqs: ["Is this a pre-arranged booking or just an intention?", "Does it have a fixed time and place?"]
        },
        {
          topic: "Future Predictions: Will vs 'Be Going To'",
          grammar: "'Will' for spontaneous decisions & opinion predictions vs 'going to' for evidence-based predictions.",
          vocab: ["forecast", "unpredictable", "turbulence", "expedition", "climate"],
          unit: "Unit 2B (pp. 26-29): Weather & Plans",
          activity: "Forecast & Warning Debate",
          detail: "Students analyze weather forecast maps and predict trip hazards using evidence ('Look at those clouds, it's going to rain!').",
          ccqs: ["Are we looking at physical evidence? Yes = going to.", "Is this an instant decision? Yes = will."]
        },
        {
          topic: "Future Time Clauses (when, as soon as, before, until)",
          grammar: "Using Present Simple in future time clauses after temporal conjunctions (e.g., 'As soon as we arrive...').",
          vocab: ["customs", "immigration", "arrival", "departure", "terminal"],
          unit: "Unit 2C (pp. 30-33): Airport Logistics",
          activity: "Sequential Plan Blueprint",
          detail: "Students draft an airport arrival checklist using time clauses: 'Before we collect bags, we will pass immigration.'",
          ccqs: ["Do we use 'will' inside the 'when/before' clause? No, Present Simple."]
        }
      ]
    },
    {
      weekTitle: "Week 3: Passive Voice in Descriptions & Processes",
      topics: [
        {
          topic: "Passive Voice: Present Simple & Past Simple",
          grammar: "Form: Be + Past Participle. Focus on the action/object rather than the agent.",
          vocab: ["produced", "manufactured", "exported", "heritage", "craftsmanship"],
          unit: "Unit 3A (pp. 34-37): Local Crafts & Culture",
          activity: "Cultural Souvenir Exhibition",
          detail: "Students present cultural items describing how they are made and when they were created ('This rug is hand-woven...').",
          ccqs: ["Do we care who made it or what happened to it? What happened.", "What form of verb follows 'be'? Past Participle."]
        },
        {
          topic: "Passive Voice with Modals (can be done, must be kept)",
          grammar: "Modal + be + Past Participle for safety rules, regulations, and guidelines.",
          vocab: ["prohibited", "mandatory", "restricted", "passport", "regulation"],
          unit: "Unit 3B (pp. 38-41): Airport Regulations",
          activity: "Safety Infographic Design",
          detail: "Pairs create an airline safety poster detailing what must be done, stored, or turned off during flight.",
          ccqs: ["Is 'can be stored' active or passive? Passive.", "Who performs the action? Unspecified passenger."]
        },
        {
          topic: "Passive Voice in Reporting & Historical Facts",
          grammar: "Past Passive for historical facts: 'The monument was constructed in 1889 by...'",
          vocab: ["monument", "architectural", "landmark", "century", "restored"],
          unit: "Unit 3C (pp. 42-45): World Wonders",
          activity: "Museum Tour Guide Presentations",
          detail: "Students act as tour guides explaining when historic landmarks were built, destroyed, or renovated.",
          ccqs: ["Was it built in the past? Yes.", "Why use passive? The monument is the main topic."]
        }
      ]
    },
    {
      weekTitle: "Week 4: Relative Clauses & Descriptive Precision",
      topics: [
        {
          topic: "Defining Relative Clauses (who, which, that, where)",
          grammar: "Using relative pronouns without commas to give essential information identifying a person, place, or thing.",
          vocab: ["guide", "resort", "scenery", "local", "exotic"],
          unit: "Unit 4A (pp. 46-49): Descriptive Travel",
          activity: "Travel Guessing Game",
          detail: "Students write clue cards defining places ('A place where people...'), and partners guess the travel destination.",
          ccqs: ["Is the clause essential to know which place we mean? Yes.", "Do we use commas? No."]
        },
        {
          topic: "Non-Defining Relative Clauses (extra info with commas)",
          grammar: "Adding non-essential information enclosed in commas using who/which/where (cannot use 'that').",
          vocab: ["picturesque", "breathtaking", "metropolis", "bustling", "renowned"],
          unit: "Unit 4B (pp. 50-53): Famous Destinations",
          activity: "Travel Brochure Copywriting",
          detail: "Students write rich brochure entries: 'Kyoto, which was the ancient capital of Japan, is famous for gardens.'",
          ccqs: ["Can we remove the clause and still understand the main sentence? Yes.", "Can we use 'that'? No."]
        },
        {
          topic: "Relative Clauses with Prepositions & Whose",
          grammar: "'Whose' for possession and prepositions in relative clauses ('The tour guide to whom we spoke...').",
          vocab: ["host", "proprietor", "heritage", "cuisine", "hospitality"],
          unit: "Unit 4C (pp. 54-57): Homestays & Hosts",
          activity: "Homestay Review & Recommendation",
          detail: "Students write recommendations for hosts whose homes they visited during fictional trips.",
          ccqs: ["Does 'whose' show ownership? Yes."]
        }
      ]
    },
    {
      weekTitle: "Week 5: Conditionals & Hypothetical Travel Scenarios",
      topics: [
        {
          topic: "First Conditional: Real Future Possibilities (if + present, will)",
          grammar: "Form: If + Present Simple, Will/Can + Infinitive. Real future conditions and consequences.",
          vocab: ["budget", "backpacking", "flight deal", "opportunity", "itinerary"],
          unit: "Unit 5A (pp. 58-61): Trip Planning",
          activity: "Decision Tree Negotiation",
          detail: "Groups budget a trip with conditional rules: 'If we save \$200 on flights, we will book a nicer hotel.'",
          ccqs: ["Is this condition possible? Yes.", "Which clause uses Present Simple? The 'if' clause."]
        },
        {
          topic: "Second Conditional: Hypothetical & Imaginary Situations",
          grammar: "Form: If + Past Simple, Would/Could + Infinitive for unreal present or future scenarios.",
          vocab: ["desert island", "lottery", "secluded", "paradise", "adventure"],
          unit: "Unit 5B (pp. 62-65): Dream Vacation",
          activity: "Dream Trip Interview",
          detail: "Students interview each other: 'If you had an unlimited travel budget, where would you go and why?'",
          ccqs: ["Is this situation real right now? No, imaginary.", "What verb form follows 'if'? Past Simple."]
        },
        {
          topic: "Mixed Conditionals Review & Expressing Wishes (I wish...)",
          grammar: "'I wish I could...', 'If only I had...' for present regrets and unfulfilled desires in travel.",
          vocab: ["regret", "missed opportunity", "language barrier", "homesick", "adaptation"],
          unit: "Unit 5C (pp. 66-69): Travel Reflections",
          activity: "Reflective Journal Writing",
          detail: "Students write diary reflections expressing wishes about travel skills: 'I wish I spoke fluent French.'",
          ccqs: ["Do I speak fluent French now? No.", "Does 'wish + past' express a current desire? Yes."]
        }
      ]
    },
    {
      weekTitle: "Week 6: Mid-Term Review & Oral Evaluation Milestone",
      topics: [
        {
          topic: "Grammar & Vocabulary Consolidation Workshop",
          grammar: "Comprehensive review of Present Perfect, Future forms, Passives, Relative Clauses, and Conditionals.",
          vocab: ["recap", "synthesis", "fluency", "accuracy", "assessment"],
          unit: "Mid-Term Review Module (pp. 70-71)",
          activity: "Interactive Team Quiz & Diagnostic",
          detail: "Gamified team competition testing target grammar structures and vocabulary across Weeks 1-5.",
          ccqs: ["Diagnostic review of student comprehension."]
        },
        {
          topic: "MID-TERM ORAL PRESENTATION EVALUATION",
          grammar: "Oral presentation using target structures (Past Perfect/Simple, Passives, Conditionals).",
          vocab: ["presentation", "articulation", "discourse", "rhetoric", "delivery"],
          unit: "Oral Exam Module",
          activity: "Student Travel Presentation & Defense",
          detail: "Each student gives a 3-minute oral presentation on a trip experience or dream itinerary, evaluated on rubric.",
          ccqs: ["Evaluation of spoken fluency, grammar accuracy, and vocabulary depth."]
        },
        {
          topic: "MID-TERM WRITTEN ASSESSMENT & FEEDBACK",
          grammar: "Written examination covering Weeks 1-5 grammar, vocabulary, and reading comprehension.",
          vocab: ["examination", "feedback", "corrective", "analysis", "progress"],
          unit: "Written Exam Module",
          activity: "Formal Mid-Term Written Test",
          detail: "45-minute written evaluation followed by peer review and targeted error correction feedback.",
          ccqs: ["Assessment of written accuracy and sentence construction."]
        }
      ]
    },
    {
      weekTitle: "Week 7: Modals of Deduction & Speculation",
      topics: [
        {
          topic: "Modals of Present Speculation (must, might, can't)",
          grammar: "Must + infinitive (90% sure true), Might/May (50% possible), Can't + infinitive (90% sure impossible).",
          vocab: ["mystery", "landmark", "artifact", "archaeological", "clue"],
          unit: "Unit 7A (pp. 72-75): Historical Mysteries",
          activity: "Mystery Artifact Deduction",
          detail: "Students examine photos of strange artifacts and speculate: 'It must be an ancient tool... It can't be modern.'",
          ccqs: ["When do we use 'must'? When we are almost certain it's true.", "When do we use 'can't'? When we are certain it's impossible."]
        },
        {
          topic: "Modals of Past Deduction (must have, might have, couldn't have)",
          grammar: "Modal + have + Past Participle for speculating about completed past events.",
          vocab: ["expedition", "disappearance", "lost city", "investigation", "hypothesis"],
          unit: "Unit 7B (pp. 76-79): Unsolved Journeys",
          activity: "Detective Investigation Casebook",
          detail: "Students solve a mystery disappearance of an explorer: 'They must have lost their map in the storm.'",
          ccqs: ["Are we speculating about the past? Yes.", "What follows the modal? 'have + past participle'."]
        },
        {
          topic: "Obligation & Permission Modals (have to, must, allowed to)",
          grammar: "Must (internal obligation) vs Have to (external rule/law); Don't have to (lack of obligation).",
          vocab: ["visa", "permit", "entry requirement", "vaccination", "embassy"],
          unit: "Unit 7C (pp. 80-83): International Border Control",
          activity: "Consulate Visa Interview",
          detail: "Pair roleplay where an official explains visa requirements: 'You don't have to pay a fee, but you must bring a passport.'",
          ccqs: ["Does 'don't have to' mean forbidden? No, it means optional."]
        }
      ]
    },
    {
      weekTitle: "Week 8: Reported Speech & Indirect Communication",
      topics: [
        {
          topic: "Reported Statements & Tense Shifts",
          grammar: "Backshifting tenses (Present Simple -> Past Simple, Present Perfect -> Past Perfect) in indirect reporting.",
          vocab: ["statement", "complaint", "feedback", "review", "testimonial"],
          unit: "Unit 8A (pp. 84-87): Hotel Reviews & Complaints",
          activity: "Manager Feedback Relay",
          detail: "Students report customer complaints to hotel managers: 'The guest said that the air conditioning was broken.'",
          ccqs: ["Did the guest speak in the past? Yes.", "Why did the tense shift back? Because we report past words."]
        },
        {
          topic: "Reported Questions & Imperatives (asked if/whether, told to)",
          grammar: "Reporting questions without inversion ('She asked me where I lived') and commands ('He told us to wait').",
          vocab: ["enquiry", "inquiry", "assistance", "guidance", "concierge"],
          unit: "Unit 8B (pp. 88-91): Tour Guide Instructions",
          activity: "Tourist Information Relay",
          detail: "Students report questions asked at an information kiosk: 'The tourist asked if the museum was open on Mondays.'",
          ccqs: ["Do we use auxiliary 'do/did' in reported questions? No.", "Word order: Subject before verb."]
        },
        {
          topic: "Reporting Verbs (offer, promise, suggest, refuse, remind)",
          grammar: "Using pattern reporting verbs (suggest + -ing, promise + to-infinitive, remind + object + to).",
          vocab: ["recommendation", "suggestion", "guarantee", "advise", "negotiation"],
          unit: "Unit 8C (pp. 92-95): Travel Advice Columns",
          activity: "Advice Column Copywriting",
          detail: "Students summarize travel advice using reporting verbs: 'The guide recommended visiting early in the morning.'",
          ccqs: ["Which verb pattern follows 'suggest'? V-ing or that-clause."]
        }
      ]
    },
    {
      weekTitle: "Week 9: Past Habits vs Present Routines",
      topics: [
        {
          topic: "Used To vs Would for Past Habits",
          grammar: "'Used to' for past states & actions vs 'Would' for repeated past actions only (not states).",
          vocab: ["tradition", "nostalgia", "transformation", "heritage", "lifestyle"],
          unit: "Unit 9A (pp. 96-99): Changing Cities",
          activity: "City Transformation Comparison",
          detail: "Students compare old and modern photos of cities: 'People used to travel by horse-drawn carriage...'",
          ccqs: ["Can we use 'would' for states ('would be a quiet town')? No, only 'used to'."]
        },
        {
          topic: "Be Used To vs Get Used To (Acclimatization)",
          grammar: "'Be used to + -ing' (customary state) vs 'Get used to + -ing' (process of adapting).",
          vocab: ["culture shock", "acclimatize", "adaptation", "jet lag", "customs"],
          unit: "Unit 9B (pp. 100-103): Living Abroad",
          activity: "Expat Adaptation Interview",
          detail: "Students interview an 'expat' about adapting to new customs: 'At first it was strange, but I got used to eating late.'",
          ccqs: ["Is 'get used to' a process over time? Yes.", "What verb form follows 'used to' here? V-ing or Noun."]
        },
        {
          topic: "Habitual Contrast: Present Habits vs Irritating Habits (Always + -ing)",
          grammar: "Present Simple for normal routines vs Present Continuous + always/forever for annoying habits.",
          vocab: ["annoyance", "pet peeve", "etiquette", "commute", "behavior"],
          unit: "Unit 9C (pp. 104-107): Travel Etiquette",
          activity: "Commuter Etiquette Forum",
          detail: "Students discuss airport & bus etiquette: 'Some passengers are always taking phone calls on speakerphone!'",
          ccqs: ["Does 'always + continuous' show mild frustration? Yes."]
        }
      ]
    },
    {
      weekTitle: "Week 10: Advanced Comparison & Nuanced Descriptions",
      topics: [
        {
          topic: "Comparatives with Modifiers (far more, slightly less, nowhere near as)",
          grammar: "Using degree modifiers: far / significantly / slightly / a bit + comparative adjective.",
          vocab: ["luxury", "economical", "spacious", "congested", "tranquil"],
          unit: "Unit 10A (pp. 108-111): Hotel & Resort Comparison",
          activity: "Hotel Booking Evaluation Matrix",
          detail: "Pairs compare 3 hotel options using precise modifiers: 'Resort A is significantly more spacious than Resort B.'",
          ccqs: ["Which modifier shows a huge difference? 'Far' or 'significantly'."]
        },
        {
          topic: "Superlatives & 'By Far the Most...'",
          grammar: "Emphatic superlatives using 'by far the most', 'one of the most', 'easily the best'.",
          vocab: ["spectacular", "unmatched", "extraordinary", "iconic", "destination"],
          unit: "Unit 10B (pp. 112-115): World Wonders Ranking",
          activity: "Travel Awards Presentation",
          detail: "Students hold a 'World Travel Awards' event presenting trophies: 'This beach is by far the most pristine in Asia.'",
          ccqs: ["Does 'by far' add strong emphasis? Yes."]
        },
        {
          topic: "Similes & Comparative Structures (The more..., the better...)",
          grammar: "Double comparative structures: 'The earlier we book, the cheaper the tickets will be.'",
          vocab: ["efficiency", "proactive", "advantageous", "cost-effective", "strategy"],
          unit: "Unit 10C (pp. 116-119): Travel Strategy",
          activity: "Travel Hack Elevator Pitch",
          detail: "Students present travel tips using double comparatives: 'The more research you do, the smoother your trip goes.'",
          ccqs: ["Do both clauses use comparative forms? Yes."]
        }
      ]
    },
    {
      weekTitle: "Week 11: Verb Patterns (Gerunds & Infinitives)",
      topics: [
        {
          topic: "Verbs Followed by Gerund (-ing) vs Infinitive (to)",
          grammar: "Verb patterns: enjoy/avoid/recommend + -ing vs decide/plan/hope + to-infinitive.",
          vocab: ["preference", "avoidance", "anticipation", "itinerary", "aspiration"],
          unit: "Unit 11A (pp. 120-123): Travel Preferences",
          activity: "Travel Personality Profiler",
          detail: "Students create travel style quizzes: 'Do you enjoy exploring ruins or do you prefer to relax on a beach?'",
          ccqs: ["Which form follows 'enjoy'? -ing.", "Which form follows 'decide'? to-infinitive."]
        },
        {
          topic: "Verbs with Change in Meaning (remember, stop, try, regret)",
          grammar: "Contrast: 'Stop to talk' (pause action to talk) vs 'Stop talking' (cease talking).",
          vocab: ["recollection", "cessation", "attempt", "mindfulness", "experience"],
          unit: "Unit 11B (pp. 124-127): Travel Memories",
          activity: "Travel Mistake Confessions",
          detail: "Students share stories: 'I remembered to lock the door, but I forgot to take my passport!'",
          ccqs: ["Did 'stop doing' mean quit? Yes.", "Did 'stop to do' mean pause in order to do? Yes."]
        },
        {
          topic: "Prepositions Followed by Gerunds in Travel Contexts",
          grammar: "Preposition + -ing pattern ('interested in visiting', 'famous for hosting', 'after arriving').",
          vocab: ["hospitality", "cuisine", "renowned", "specialized", "cultural"],
          unit: "Unit 11C (pp. 128-131): Cultural Immersion",
          activity: "Cultural Etiquette Guidebook",
          detail: "Students write etiquette rules: 'Be careful about taking photos... Always thank hosts after eating.'",
          ccqs: ["What verb form always follows a preposition? V-ing."]
        }
      ]
    },
    {
      weekTitle: "Week 12: Term Synthesis & Final Academic Assessment",
      topics: [
        {
          topic: "Term Grammar & Vocabulary Master Review",
          grammar: "Complete synthesis of B1 CEFR grammar modules and high-frequency travel/academic vocabulary.",
          vocab: ["synthesis", "proficiency", "fluency", "mastery", "portfolio"],
          unit: "Final Review Module (pp. 132-135)",
          activity: "Comprehensive Curriculum Tournament",
          detail: "Interactive review challenge preparing students for final written & oral evaluations.",
          ccqs: ["Comprehensive check of term learning outcomes."]
        },
        {
          topic: "FINAL TERM WRITTEN EXAMINATION",
          grammar: "Formal 60-minute written examination testing grammar precision, vocabulary range, and essay writing.",
          vocab: ["examination", "evaluation", "assessment", "rubric", "certification"],
          unit: "Final Exam Module",
          activity: "Formal Invigilated Written Exam",
          detail: "Students complete formal written assessment covering all 12 weeks of B1 CEFR learning objectives.",
          ccqs: ["Evaluation of written accuracy, structural variety, and vocabulary usage."]
        },
        {
          topic: "FINAL ORAL DEFENSE & GRADUATION PORTFOLIO",
          grammar: "Individual oral interview & portfolio presentation aligned to CEFR B1 speaking criteria.",
          vocab: ["defense", "interview", "graduation", "attainment", "feedback"],
          unit: "Graduation Module",
          activity: "Individual Oral Examination & Certificate Presentation",
          detail: "1-on-1 speaking interview where students defend their semester portfolio and receive final feedback.",
          ccqs: ["Final evaluation of spoken fluency, pronunciation, grammar control, and CEFR attainment."]
        }
      ]
    }
  ]
}

export function generateGranularTermRoadmap(params: GeneratorParams): GranularWeek[] {
  const { termWeeks, sessionsPerWeek, cefr, theme, grammarTags, vocabTags } = params

  // Select base CEFR template (fallback to B1)
  const templateWeeks = CEFR_CURRICULUM_TEMPLATES[cefr] || CEFR_CURRICULUM_TEMPLATES['B1']
  const generatedWeeks: GranularWeek[] = []

  let overallSessionCounter = 1

  for (let w = 1; w <= termWeeks; w++) {
    const templateWeek = templateWeeks[(w - 1) % templateWeeks.length]
    const weekDays: DailySession[] = []

    for (let d = 1; d <= sessionsPerWeek; d++) {
      const sessionNum = overallSessionCounter++
      
      // Determine topic source
      const topicIndex = (d - 1) % templateWeek.topics.length
      const baseTopic = templateWeek.topics[topicIndex]

      // Check if Mid-term or Final
      let type: 'Instruction & Practice' | 'Assessment' | 'Exam' = 'Instruction & Practice'
      let topicTitle = baseTopic.topic
      let grammarFocus = baseTopic.grammar
      let vocabList = [...baseTopic.vocab]
      let unitRef = baseTopic.unit
      let activityType = baseTopic.activity
      let activityDetail = baseTopic.detail
      let objective = `Master ${baseTopic.topic} in "${theme}" context with featured target vocabulary.`
      let ccqs = baseTopic.ccqs

      // Inject custom user tags if provided
      if (grammarTags.length > 0 && d === 1 && w !== 6 && w !== 12) {
        const customGrammar = grammarTags[(w - 1) % grammarTags.length]
        if (customGrammar) {
          topicTitle = `${customGrammar} & ${baseTopic.topic.split('(')[0].trim()}`
          grammarFocus = `Core Focus: ${customGrammar}. ${baseTopic.grammar}`
        }
      }

      if (vocabTags.length > 0) {
        vocabList = Array.from(new Set([...vocabTags.slice(0, 3), ...vocabList])).slice(0, 5)
      }

      if (w === Math.floor(termWeeks / 2) && d === sessionsPerWeek) {
        type = 'Assessment'
        topicTitle = 'MID-TERM ORAL & WRITTEN EVALUATION'
        grammarFocus = 'Comprehensive diagnostic evaluation of Weeks 1-6 grammar and vocabulary mastery.'
        activityType = 'Formal Diagnostic Assessment'
        activityDetail = 'Students undergo oral presentations and written grammar check aligned to CEFR criteria.'
        objective = 'Evaluate mid-term progress, speaking fluency, and grammatical accuracy.'
      } else if (w === termWeeks && d === sessionsPerWeek) {
        type = 'Exam'
        topicTitle = 'FINAL TERM WRITTEN & ORAL GRADUATION ASSESSMENT'
        grammarFocus = 'Final term evaluation covering complete semester curriculum.'
        activityType = 'Comprehensive Final Exam'
        activityDetail = 'Invigilated written exam followed by 1-on-1 oral defense and portfolio review.'
        objective = 'Certify CEFR level proficiency and academic attainment.'
      }

      // Generate 4-Phase Timeline
      const phases = [
        {
          phase: 'Phase 1: Warm-Up & Schema Activation',
          time: '10 Mins',
          activity: 'Interactive Icebreaker & Board Discussion',
          instructions: `Teacher introduces "${theme}" context using board prompts. Students discuss initial thoughts in pairs.`
        },
        {
          phase: 'Phase 2: Direct Instruction & Concept Check',
          time: '15 Mins',
          activity: 'Form & Meaning Breakdown',
          instructions: `Explain ${grammarFocus}. Conduct Concept Check Questions (CCQs) on board.`
        },
        {
          phase: 'Phase 3: Guided Practice & Classroom Dynamics',
          time: '15 Mins',
          activity: activityType,
          instructions: activityDetail
        },
        {
          phase: 'Phase 4: Wrap-Up & Exit Assignment',
          time: '5 Mins',
          activity: 'Exit Ticket & Homework Check',
          instructions: `Review target vocabulary (${vocabList.slice(0, 3).join(', ')}). Assign textbook exercises from ${unitRef}.`
        }
      ]

      weekDays.push({
        sessionNum,
        weekNum: w,
        dayNum: d,
        day: `Session ${sessionNum} (Week ${w}, Day ${d})`,
        topic: topicTitle,
        grammarFocus,
        vocabList,
        unitRef,
        activityType,
        activityDetail,
        objective,
        type,
        ccqs,
        phases
      })
    }

    generatedWeeks.push({
      weekNum: w,
      title: templateWeek.weekTitle,
      theme,
      days: weekDays
    })
  }

  return generatedWeeks
}
