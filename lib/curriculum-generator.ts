/**
 * Granular Curriculum Generator Engine
 * Supports Day-Labeled Weekly Schedules with Specialized Day Archetypes:
 * - 📘 Grammar & Structure Day (Board layout, scope limit, CCQs, drills)
 * - 🗣️ Discussion & Debate Day (CEFR debate topics, starter questions, functional phrases)
 * - 🎮 Extra Activity & Fluency Day (Classroom games, setup steps, rules, materials)
 * - 📖 Book & Reading Day (Unit mapping, reading strategies, text vocab, comprehension Qs)
 */

export type DayArchetype = 'grammar' | 'activity' | 'discussion' | 'reading'

export interface GrammarForms {
  positive: string
  negative: string
  interrogative: string
  shortAnswers: string
}

export interface DailySession {
  sessionNum: number
  weekNum: number
  dayNum: number
  day: string
  dayArchetype: DayArchetype
  topic: string
  grammarFocus: string
  grammarDefinition?: string
  usageCases?: string[]
  grammarExplanation?: string
  syntaxFormula?: string
  grammarScopeLimit?: string
  boardLayout?: string
  grammarForms?: GrammarForms
  sentenceModels?: string[]
  grammarSubSections?: string[]
  edgeCases?: string[]
  signalWords?: string[]
  vocabList: string[]
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
  phases?: {
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
  theme?: string
  grammarTags: string[]
  vocabTags: string[]
  idiomTags: string[]
  weeklyArchetypes?: DayArchetype[]
  selectedDays?: string[]
  detailLevel?: 'simplified' | 'detailed'
}

// Dynamic Grammar Synthesizer for Teacher Inputs
export function getGrammarDetailsForStructure(grammarTag: string, cefr: string = 'B1', sectionIndex: number = 0) {
  const gLower = grammarTag.toLowerCase()

  if (gLower.includes('present perfect vs past simple') || (gLower.includes('present perfect') && gLower.includes('past simple'))) {
    const subSections = [
      'Section 1: Indefinite Life Experiences (using ever / never)',
      'Section 2: Unfinished Time Periods (this week, so far) vs Finished Time (yesterday, in 2021)',
      'Section 3: Recent Actions with Present Results (already / yet / just)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Present Perfect vs Past Simple — ${currentSub}`,
      rule: 'Use Present Perfect for indefinite past experiences without exact timestamps (ever/never/already). Use Past Simple for completed actions at specific past times (yesterday, in 2021).',
      definition: 'Present Perfect links past occurrences to present relevance without specifying exact timing, whereas Past Simple describes completed actions anchored to a finished past time window.',
      usageCases: [
        'Sharing personal life experiences and accomplishments without specifying when they occurred.',
        'Contrasting ongoing or open time frames (this week, so far) against completed time frames (yesterday, last year).',
        'Reporting recent news or events that produce immediate consequences in the present.'
      ],
      explanation: `In ${cefr}-level communication, distinguishing Present Perfect from Past Simple allows speakers to separate ongoing/open life context from completed historical events. Past Simple links to a closed time window, whereas Present Perfect connects past occurrences to the speaker's present state.`,
      syntaxFormula: 'Pres. Perf: [Subject] + [have/has] + [Past Participle V3]  VS  Past Simple: [Subject] + [Past Verb V2] + [Finished Time Marker]',
      scope: 'Focus on contrasting finished time expressions (ago, yesterday, last year) with open time periods (this week, so far, in my life).',
      board: 'Pres. Perf: Subj + have/has + V3 (Indefinite)  VS  Past Simple: Subj + V2 (Finished Time)',
      forms: {
        positive: 'Pres Perf (+): [Subject] + [have/has] + [V3]  |  Past Simple (+): [Subject] + [V2] + [Time Marker]',
        negative: 'Pres Perf (-): [Subject] + [haven\'t/hasn\'t] + [V3]  |  Past Simple (-): [Subject] + [didn\'t] + [V1]',
        interrogative: 'Pres Perf (?): [Have/Has] + [Subject] + [V3] ...?  |  Past Simple (?): [Did] + [Subject] + [V1] ...?',
        shortAnswers: 'Pres Perf: Yes, [Subj] + have/has. / No, [Subj] + haven\'t/hasn\'t. | Past Simple: Yes, [Subj] + did. / No, [Subj] + didn\'t.'
      },
      subSections,
      edgeCases: [
        'Been vs. Gone: "She has been to Paris" (visited & returned) vs "She has gone to Paris" (still there now).',
        'Never use specific past timestamps (yesterday, ago, in 2018) with Present Perfect.'
      ],
      signalWords: ['ever', 'never', 'already', 'yet', 'just', 'recently', 'so far', 'since', 'for', 'yesterday', 'ago'],
      sentenceModels: [
        'Positive (+): I have already submitted the report (Pres Perf) vs I submitted it yesterday (Past Simple).',
        'Negative (-): We haven\'t met the team yet (Pres Perf) vs We didn\'t meet them last week (Past Simple).',
        'Interrogative (?): Have you ever traveled abroad? (Pres Perf) vs Did you travel abroad last summer? (Past Simple)'
      ],
      ccqs: [
        'Do we know the exact timestamp in Present Perfect? (No, time is indefinite/open)',
        'Is "yesterday" paired with Present Perfect or Past Simple? (Past Simple)',
        'Is the time period still open with "this week"? (Yes, Present Perfect)'
      ]
    }
  }

  if (gLower.includes('second conditional') || gLower.includes('2nd conditional')) {
    const subSections = [
      'Section 1: Unreal Present & Future Imaginary Scenarios',
      'Section 2: Giving Formal Advice using "If I were you, I would..."',
      'Section 3: Modal Variations in Result Clause (would vs could vs might)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Second Conditional — ${currentSub}`,
      rule: 'If + Past Simple, Subject + WOULD / COULD + Base Verb. Used for unreal, imaginary, or highly unlikely present/future situations.',
      definition: 'The Second Conditional is a complex sentence structure used to hypothesize about impossible, unreal, or highly improbable present or future situations and their imaginary outcomes.',
      usageCases: [
        'Hypothesizing about imaginary life scenarios (e.g. winning the lottery, living in another era).',
        'Offering polite, indirect advice in formal or business contexts ("If I were you, I would...").',
        'Speculating on alternative present realities and negotiating hypothetical conditions.'
      ],
      explanation: `The Second Conditional constructs hypothetical worlds. Although the IF-clause uses a Past Simple verb form, it refers to present or future unreal states rather than past time. It is frequently used for diplomacy, hypothetical problem-solving, and giving polite advice.`,
      syntaxFormula: '[IF] + [Subject] + [Past Simple V2], [Subject] + [WOULD / COULD / MIGHT] + [Base Verb V1]',
      scope: 'Emphasize "If I WERE you" (subjunctive were) and contrast real probability (1st Conditional) with imaginary situations (2nd Conditional).',
      board: 'IF + Past Simple (Hypothetical Condition), Subject + WOULD + V1 (Unreal Result)',
      forms: {
        positive: 'Positive (+): [IF] + [Subject] + [Past Simple V2], [Subject] + [WOULD] + [Base Verb V1]',
        negative: 'Negative (-): [IF] + [Subject] + [didn\'t + V1], [Subject] + [WOULD NOT (wouldn\'t)] + [Base Verb V1]',
        interrogative: 'Interrogative (?): [Wh-] + [WOULD] + [Subject] + [do] + [IF] + [Subject] + [Past Simple V2] ...?',
        shortAnswers: 'Yes, [Subject] + would. / No, [Subject] + wouldn\'t.'
      },
      subSections,
      edgeCases: [
        'Subjunctive Were: Formal written English uses "If I/he/she WERE" instead of "was".',
        'Do NOT place "would" inside the IF-clause ("If I would win" is INCORRECT; use Past Simple).'
      ],
      signalWords: ['if', 'imagine', 'suppose', 'in that case', 'if I were you'],
      sentenceModels: [
        'Positive (+): If I had more free time, I would take up painting.',
        'Negative (-): If she didn\'t live so far away, we would visit her more often.',
        'Interrogative (?): Where would you live if you could choose any country?'
      ],
      ccqs: [
        'Is this situation real or imaginary? (Imaginary / Hypothetical)',
        'Does the past verb refer to past time or present unreal state? (Present/future unreal state)',
        'What modal verb introduces the imaginary outcome? (Would / Could)'
      ]
    }
  }

  if (gLower.includes('first conditional') || gLower.includes('1st conditional')) {
    const subSections = [
      'Section 1: Real Future Conditions & Probable Consequences',
      'Section 2: Warnings, Guarantees, Offers, and Promises',
      'Section 3: Result Clause Modal Variations (will, can, may, might)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `First Conditional — ${currentSub}`,
      rule: 'If + Present Simple, Subject + WILL / CAN + Base Verb. Used for real, possible future events and consequences.',
      definition: 'The First Conditional is a two-clause conditional structure used to express real, likely future events and their probable consequences.',
      usageCases: [
        'Stating realistic future plans and contingent outcomes based on specific conditions.',
        'Delivering warnings, promises, guarantees, or negotiations in everyday and business English.',
        'Expressing varying degrees of future certainty using modals like will, can, and might in the result clause.'
      ],
      explanation: `The First Conditional expresses real-world cause and effect for future events. The IF-clause sets a realistic condition in Present Simple, while the result clause predicts the outcome using future modal verbs.`,
      syntaxFormula: '[IF] + [Subject] + [Present Simple V1/V-s], [Subject] + [WILL / CAN / MAY / MIGHT] + [Base Verb V1]',
      scope: 'Teach clear condition vs result clauses and highlight modal variations (will vs can vs might).',
      board: 'IF + Present Simple (Real Condition), Subject + WILL / CAN + V1 (Future Result)',
      forms: {
        positive: 'Positive (+): [IF] + [Subject] + [Present Simple V1/s], [Subject] + [WILL] + [Base Verb V1]',
        negative: 'Negative (-): [IF] + [Subject] + [don\'t/doesn\'t + V1], [Subject] + [WILL NOT (won\'t)] + [Base Verb V1]',
        interrogative: 'Interrogative (?): [Wh-] + [WILL] + [Subject] + [do] + [IF] + [Subject] + [Present Simple V1/s] ...?',
        shortAnswers: 'Yes, [Subject] + will. / No, [Subject] + won\'t.'
      },
      subSections,
      edgeCases: [
        'Never use "will" inside the IF-clause ("If it will rain" is INCORRECT; use Present Simple).',
        'Unless means "If... not" (e.g. "Unless you study, you won\'t pass").'
      ],
      signalWords: ['if', 'unless', 'as long as', 'provided that', 'in case'],
      sentenceModels: [
        'Positive (+): If you complete the assignment on time, you will receive full credit.',
        'Negative (-): Unless we leave right now, we won\'t arrive before dinner.',
        'Interrogative (?): What will you do if the client requests changes?'
      ],
      ccqs: [
        'Is this condition possible in the real world? (Yes, it is a real possibility)',
        'Can we put "will" inside the IF clause? (No, use Present Simple after IF)',
        'What verb form goes in the main result clause? (WILL / CAN + Base Verb)'
      ]
    }
  }

  if (gLower.includes('third conditional') || gLower.includes('3rd conditional')) {
    const subSections = [
      'Section 1: Past Regrets & Impossible Alternative History',
      'Section 2: Pronunciation, Rhythm & Contractions ("would\'ve", "could\'ve")',
      'Section 3: Result Clause Modals (would have vs could have vs might have)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Third Conditional — ${currentSub}`,
      rule: 'If + Past Perfect (had + V3), Subject + WOULD HAVE + V3. Used for impossible past conditions and imaginary past outcomes.',
      definition: 'The Third Conditional is a hypothetical sentence structure used to analyze completed past events and express impossible past conditions and alternative historical outcomes.',
      usageCases: [
        'Expressing personal regrets, remorse, or relief regarding finished past decisions.',
        'Analyzing alternative historical scenarios or past business project failures/successes.',
        'Speculating on how a past situation would have differed if a past action had occurred.'
      ],
      explanation: `The Third Conditional reflects on completed past events that cannot be changed. It allows speakers to express past regrets, relief, or speculate on how history would have unfolded under different circumstances.`,
      syntaxFormula: '[IF] + [Subject] + [had + Past Participle V3], [Subject] + [WOULD HAVE / COULD HAVE] + [Past Participle V3]',
      scope: 'Focus on past regrets and alternative history outcomes. Drill spoken contractions ("would\'ve", "hadn\'t").',
      board: 'IF + had + V3 (Past Condition), Subject + WOULD HAVE + V3 (Past Imaginary Result)',
      forms: {
        positive: 'Positive (+): [IF] + [Subject] + [had + V3], [Subject] + [WOULD HAVE] + [Past Participle V3]',
        negative: 'Negative (-): [IF] + [Subject] + [hadn\'t + V3], [Subject] + [WOULD NOT HAVE] + [Past Participle V3]',
        interrogative: 'Interrogative (?): [WOULD] + [Subject] + [have + V3] + [IF] + [Subject] + [had + V3] ...?',
        shortAnswers: 'Yes, [Subject] + would have. / No, [Subject] + wouldn\'t have.'
      },
      subSections,
      edgeCases: [
        'Both condition and result refer to PAST events that CANNOT be altered.',
        'Do not confuse HAD (Past Simple) with HAD + V3 (Past Perfect in IF clause).'
      ],
      signalWords: ['if', 'had', 'would have', 'could have', 'in retrospect', 'hindsight'],
      sentenceModels: [
        'Positive (+): If they had checked the schedule, they would have avoided the traffic delay.',
        'Negative (-): If I hadn\'t lost my passport, I wouldn\'t have missed the flight.',
        'Interrogative (?): Would you have chosen a different major if you had known?'
      ],
      ccqs: [
        'Did the past condition actually happen? (No, it is an imaginary past)',
        'Can we change the outcome now? (No, the past is finished)',
        'What verb tense is required in the IF clause? (Past Perfect: HAD + V3)'
      ]
    }
  }

  if (gLower.includes('passive voice') || gLower.includes('passive')) {
    const subSections = [
      'Section 1: Active vs Passive Concept & Present Simple Passive (is / are + V3)',
      'Section 2: Past Simple & Future Simple Passives (was / were + V3 | will be + V3)',
      'Section 3: Continuous & Perfect Aspect Passives (is being + V3 | has been + V3)',
      'Section 4: Passives with Modal Verbs & Two-Object Verbs (can be done | was given a prize)',
      'Section 5: Agent vs Agentless Passive & Academic Process Description Rules'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Passive Voice — ${currentSub}`,
      rule: 'Subject (Recipient) + BE (am/is/are/was/were/will be) + Past Participle (V3) (+ by Agent). Focuses on the receiver of the action.',
      definition: 'Passive Voice is a syntactic voice construction where the grammatical subject of the sentence receives the action of the verb rather than performing it.',
      usageCases: [
        'Writing formal academic reports, scientific papers, and process descriptions where objectivity is required.',
        'Reporting news items or crime incidents when the perpetrator/agent is unknown, obvious, or unimportant.',
        'Emphasizing the result, product, or recipient of an action rather than the person who performed it.'
      ],
      explanation: `In English syntax, Passive Voice shifts sentence focus from the agent performing the action to the recipient or outcome. It is indispensable in formal, scientific, academic, and journalistic registers where the agent is obvious, irrelevant, or intentionally omitted.`,
      syntaxFormula: '[Subject / Recipient] + [BE Auxiliary (am / is / are / was / were / will be)] + [Main Verb (Past Participle V3)] + [Optional Agent (by + Noun)]',
      scope: 'Practice active-to-passive transformations and clarify when "by + agent" is necessary versus redundant.',
      board: 'Active: Agent + Verb + Object  ->  Passive: Object + BE + V3 (+ by Agent)',
      forms: {
        positive: 'Positive (+): [Object / Recipient] + [BE (am/is/are/was/were)] + [Past Participle V3] + [by Agent]',
        negative: 'Negative (-): [Object / Recipient] + [BE + NOT (isn\'t/aren\'t/wasn\'t/weren\'t)] + [Past Participle V3]',
        interrogative: 'Interrogative (?): [BE Auxiliary] + [Object / Recipient] + [Past Participle V3] ...?',
        shortAnswers: 'Yes, [Subject] + was/were. / No, [Subject] + wasn\'t/weren\'t.'
      },
      subSections,
      edgeCases: [
        'Intransitive verbs (arrive, die, happen, exist) CANNOT be made passive.',
        'Watch out for irregular V3 forms (written, spoken, built, taken, driven).'
      ],
      signalWords: ['by', 'processed', 'manufactured', 'published', 'conducted', 'discovered'],
      sentenceModels: [
        'Active (+) -> Passive (+): "The engineer repaired the server." -> "The server WAS REPAIRED by the engineer."',
        'Active (-) -> Passive (-): "They didn\'t authorize the payment." -> "The payment WAS NOT AUTHORIZED."',
        'Active (?) -> Passive (?): "Did someone send the invitation?" -> "WAS the invitation SENT?"'
      ],
      ccqs: [
        'Who receives the action in passive voice? (The subject/recipient at the start of the sentence)',
        'What two auxiliary elements construct every passive verb? (BE verb + Past Participle V3)',
        'When do we omit "by agent"? (When agent is unknown, obvious, or unimportant)'
      ]
    }
  }

  if (gLower.includes('reported speech') || gLower.includes('indirect speech')) {
    const subSections = [
      'Section 1: Tense Backshifting Rules (Present -> Past, Past/Pres Perf -> Past Perf)',
      'Section 2: Pronoun, Possessive & Time Expression Shifts (today -> that day, tomorrow -> next day)',
      'Section 3: Said vs Told & Reported Questions (if / whether + Statement Word Order)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Reported Speech — ${currentSub}`,
      rule: 'When reporting direct quotes in past context, shift tenses back one step (Present -> Past, Past/Pres Perf -> Past Perf) and adjust pronouns.',
      definition: 'Reported (Indirect) Speech is a grammatical mechanism used to communicate what another person said without repeating their exact direct words.',
      usageCases: [
        'Summarizing meetings, interviews, customer complaints, or past dialogues in business and academic reporting.',
        'Relaying messages, instructions, or gossip accurately to third parties.',
        'Writing journalistic articles and formal meeting minutes using proper tense backshifting.'
      ],
      explanation: `Reported Speech enables speakers to convey prior conversations accurately without quoting word-for-word. It requires systematic adjustments to verb tenses, personal pronouns, possessives, and temporal adverbs to maintain chronological alignment.`,
      syntaxFormula: '[Reporting Subject] + [said (that) / told + Object (that)] + [Subject] + [Backshifted Verb] + [Rest of Clause]',
      scope: 'Cover statement backshifting, pronoun modifications, and time word shifts (today -> that day, tomorrow -> the following day).',
      board: 'Direct: "I am working"  ->  Reported: He said (that) he WAS working.',
      forms: {
        positive: 'Positive (+): [Reporting Subj] + [said (that) / told + Obj (that)] + [Subj] + [Backshifted Verb]',
        negative: 'Negative (-): [Reporting Subj] + [said (that)] + [Subj] + [didn\'t / hadn\'t] + [Base/V3 Verb]',
        interrogative: 'Interrogative (?): [Reporting Subj] + [asked + Obj] + [if / whether / Wh-] + [Statement Word Order]',
        shortAnswers: 'Reported questions use statement word order without question marks.'
      },
      subSections,
      edgeCases: [
        'General truths and permanent facts do not require tense backshifting ("He said that water boils at 100°C").',
        'Word order in reported questions reverts to Subject + Verb (omit do/does/did).'
      ],
      signalWords: ['said', 'told', 'asked', 'explained', 'mentioned', 'the previous day', 'the next day'],
      sentenceModels: [
        'Direct: "I will call you tomorrow." -> Reported: She said that she would call me the next day.',
        'Direct: "Where do you live?" -> Reported: He asked me where I lived.',
        'Direct: "Did you finish the assignment?" -> Reported: The teacher asked if I had finished the assignment.'
      ],
      ccqs: [
        'What happens to Present Simple in reported speech? (Shifts back to Past Simple)',
        'Does "told" require a direct personal object? (Yes, e.g. "told ME", whereas "said" does not)',
        'Do reported questions use question marks or statement word order? (Statement word order, no question mark)'
      ]
    }
  }

  if (gLower.includes('relative clauses') || gLower.includes('relative pronoun')) {
    const subSections = [
      'Section 1: Relative Pronouns for Persons (Who/That), Things (Which/That), Places (Where), Possessions (Whose)',
      'Section 2: Defining Clauses (Essential identifying info, no commas, "that" allowed)',
      'Section 3: Non-Defining Clauses (Extra parenthetical info, with commas, "that" forbidden) & Relative Pronoun Omission'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Relative Clauses — ${currentSub}`,
      rule: 'Use relative pronouns (who, which, that, where, whose) to connect clauses and provide essential or supplemental noun information.',
      definition: 'A Relative Clause is a subordinate adjective clause introduced by a relative pronoun that modifies and provides identifying or descriptive information about a preceding noun.',
      usageCases: [
        'Combining short sentences into smooth, sophisticated complex sentences in academic writing.',
        'Providing precise definitions and identifying specific people, places, or objects ("The man WHO lives next door...").',
        'Adding supplemental, non-defining background context in formal descriptions using commas.'
      ],
      explanation: `Relative clauses streamline complex sentence construction by embedding descriptive details directly behind target nouns. Defining relative clauses identify which noun is being discussed, while non-defining clauses add non-essential descriptive context.`,
      syntaxFormula: '[Main Noun] + [Relative Pronoun (who / which / that / where / whose)] + [Embedded Clause] + [Main Predicate]',
      scope: 'Contrast defining clauses (no commas, essential) vs non-defining clauses (with commas, extra info).',
      board: 'Person: WHO / THAT  |  Thing: WHICH / THAT  |  Place: WHERE  |  Possession: WHOSE',
      forms: {
        positive: 'Positive (+): [Main Noun] + [WHO / WHICH / THAT / WHERE] + [Defining Clause]',
        negative: 'Negative (-): [Main Noun] + [WHO / WHICH / THAT] + [Negative Clause (doesn\'t / isn\'t)]',
        interrogative: 'Interrogative (?): [Is that the Noun] + [WHERE / WHO] + [Subject + Verb] ...?',
        shortAnswers: 'Defining relative clauses specify essential identity.'
      },
      subSections,
      edgeCases: [
        'Do NOT use "that" in non-defining relative clauses (which are set off by commas).',
        'Relative pronouns can be omitted when they function as the OBJECT of the relative clause.'
      ],
      signalWords: ['who', 'which', 'that', 'where', 'whose', 'whom'],
      sentenceModels: [
        'Defining (Person): The architect WHO designed this building won an award.',
        'Defining (Thing): The software THAT we installed yesterday improved speed.',
        'Non-Defining (Extra info): Paris, WHICH is the capital of France, attracts millions of tourists.'
      ],
      ccqs: [
        'Which relative pronoun identifies people? (Who / That)',
        'Do defining relative clauses take commas around them? (No commas needed)',
        'When can we use "where"? (To refer to physical places or locations)'
      ]
    }
  }

  if (gLower.includes('modal') || gLower.includes('modals of deduction')) {
    const subSections = [
      'Section 1: High Certainty Deductions (MUST [90%+ True] vs CAN\'T [90%+ Impossible])',
      'Section 2: Possibility & Speculation (MIGHT / COULD / MAY [~50% Possible])',
      'Section 3: Past Modals of Deduction (MUST HAVE + V3 / CAN\'T HAVE + V3 / MIGHT HAVE + V3)'
    ]
    const currentSub = subSections[sectionIndex % subSections.length]
    return {
      topic: `Modals of Deduction & Speculation — ${currentSub}`,
      rule: 'MUST + V1 (90%+ sure true), MIGHT / COULD + V1 (50% possible), CAN\'T + V1 (90%+ sure impossible).',
      definition: 'Modals of Deduction are modal auxiliary verbs used by speakers to express logical conclusions, inferences, and levels of certainty based on available evidence.',
      usageCases: [
        'Evaluating circumstantial evidence and formulating logical hypotheses in investigations or problem solving.',
        'Expressing nuances of uncertainty (must vs might vs can\'t) in professional and academic discourse.',
        'Analyzing mysterious occurrences or past unverified events (must have been, could have happened).'
      ],
      explanation: `Modals of deduction allow speakers to evaluate circumstantial evidence and express varying degrees of logical certainty about present or past situations without making flat assumptions.`,
      syntaxFormula: 'Present: [Subject] + [MUST / MIGHT / COULD / CAN\'T] + [Base Verb V1]  |  Past: [Subject] + [MUST HAVE / CAN\'T HAVE] + [Past Participle V3]',
      scope: 'Teach degrees of certainty in present/past speculation. Distinguish logical deduction from obligation.',
      board: 'MUST (90% True)  |  MIGHT / COULD (50% Possible)  |  CAN\'T (90% Impossible)',
      forms: {
        positive: 'Positive (+): [Subject] + [MUST / MIGHT / COULD] + [Base Verb V1] (High to medium certainty)',
        negative: 'Negative (-): [Subject] + [CAN\'T] + [Base Verb V1] (90%+ Certain Impossible)',
        interrogative: 'Interrogative (?): [COULD / MIGHT] + [Subject] + [be + V-ing / V1] ...?',
        shortAnswers: 'Yes, [Subject] + must. / No, [Subject] + can\'t.'
      },
      subSections,
      edgeCases: [
        'Use CAN\'T for negative deduction, NOT mustn\'t ("He mustn\'t be home" is incorrect for deduction; use "can\'t be home").',
        'Present modals of deduction take a BASE VERB directly without "to".'
      ],
      signalWords: ['must', 'can\'t', 'might', 'could', 'probably', 'bound to', 'definitely'],
      sentenceModels: [
        'High Certainty (+): Look at the lights on inside; somebody MUST be home.',
        'High Certainty (-): He was in London yesterday; he CAN\'T be in Tokyo today.',
        'Uncertain Speculation (?): The store is closed; they MIGHT be on lunch break.'
      ],
      ccqs: [
        'When do we use MUST? (When evidence makes us ~100% sure something is true)',
        'What modal expresses 90% logical impossibility? (Can\'t)',
        'Does "might" express high certainty or lower possibility? (Lower possibility / ~50%)'
      ]
    }
  }

  // Smart Generic Fallback with progressive sections, academic definition & usage cases
  const genericSubSections = [
    `Section 1: Affirmative & Negative Sentence Formation Syntax of ${grammarTag}`,
    `Section 2: Question Inversion, Auxiliary Rules & Short Answers`,
    `Section 3: Contextual Application, Edge Cases & Fluency Transformation Drills`
  ]
  const currentSub = genericSubSections[sectionIndex % genericSubSections.length]

  return {
    topic: `${grammarTag} — ${currentSub}`,
    rule: `Apply accurate structural syntax rules for ${grammarTag} within formal and informal ${cefr}-level language contexts.`,
    definition: `${grammarTag} is an essential structural element in English grammar used to express precise chronological relationships, conditions, or functional communications.`,
    usageCases: [
      `Constructing grammatically accurate affirmative and negative sentences in ${cefr}-level speech and writing.`,
      `Avoiding common structural errors and subject-verb agreement pitfalls in formal examination contexts.`,
      `Developing spoken fluency and precise expression when discussing complex real-world topics.`
    ],
    explanation: `In ${cefr}-level English mastery, understanding ${grammarTag} provides structural accuracy, preventing communication misunderstandings and ensuring well-formed written and spoken expressions.`,
    syntaxFormula: `[Subject / Focus] + [Auxiliary Verb for ${grammarTag}] + [Main Verb Structure] + [Object / Complement]`,
    scope: `Focus on sentence word-order syntax, auxiliary verb placement, and common L1 student transfer errors associated with ${grammarTag}.`,
    board: `Target Formula: ${grammarTag} (Form & Sentence Transformation Rules)`,
    forms: {
      positive: `Positive (+): [Subject] + [Auxiliary + Main Verb for ${grammarTag}] + [Object / Complement]`,
      negative: `Negative (-): [Subject] + [Auxiliary + NOT + Main Verb for ${grammarTag}] + [Object / Complement]`,
      interrogative: `Interrogative (?): [Auxiliary Verb] + [Subject] + [Main Verb for ${grammarTag}] ...?`,
      shortAnswers: `Yes, [Subject] + Auxiliary. / No, [Subject] + Auxiliary + NOT.`
    },
    subSections: genericSubSections,
    edgeCases: [
      `Pay attention to subject-verb agreement and proper auxiliary verb selection.`,
      `Avoid double negatives or improper tense mixing.`
    ],
    signalWords: ['always', 'usually', 'sometimes', 'never', 'already', 'yet'],
    sentenceModels: [
      `Positive (+): Formulate a clear affirmative sentence incorporating target structure (${grammarTag}).`,
      `Negative (-): Formulate a clear negative sentence incorporating target auxiliary verb.`,
      `Interrogative (?): Formulate a clear question using correct auxiliary inversion.`
    ],
    ccqs: [
      `What is the primary function and context for using ${grammarTag}?`,
      `What is the correct auxiliary verb and word order in negative sentences?`,
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
    { topic: "Gentrification in Global Metropolises", prompt: "Is urban redevelopment beneficial for cities or destructive to working-class communities?" },
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

// Baseline Syllabus Weeks (Generic, no fake textbook titles or page numbers)
const B1_SYLLABUS_WEEKS = [
  {
    weekTitle: "Week 1: Past Events & Life Experiences",
    grammarTopic: "Present Perfect vs Past Simple",
    grammarRule: "Present Perfect for indefinite life experiences (ever/never) vs Past Simple for fixed dates (in 2022, yesterday).",
    grammarScope: "Focus on affirmative and negative forms today. Leave question inversion drills for Session 2.",
    boardFormula: "Subject + have/has + V3 (Past Participle)  VS  Subject + V2 (Past Form) + Time Marker",
    vocab: ["itinerary", "expedition", "embark", "pristine", "destination"],
    readingTitle: "Text Analysis: Historical Narratives & Past Events",
    readingStrategy: "Scanning for specific historic dates vs Skimming for narrative gist."
  },
  {
    weekTitle: "Week 2: Future Intentions & Scheduled Events",
    grammarTopic: "Future Plans: 'Be Going To' vs Present Continuous",
    grammarRule: "'Be going to' for personal intentions vs Present Continuous for fixed pre-arranged bookings.",
    grammarScope: "Teach clear contrast between intent (mental plan) vs arrangement (ticket purchased).",
    boardFormula: "Subject + am/is/are + going to + Infinitive  VS  Subject + am/is/are + V-ing (Fixed Time/Place)",
    vocab: ["reservation", "schedule", "confirmation", "itinerary", "arrangement"],
    readingTitle: "Text Analysis: Modern Innovations & Future Planning",
    readingStrategy: "Identifying author stance and technological predictions."
  },
  {
    weekTitle: "Week 3: Passive Voice in Descriptions & Processes",
    grammarTopic: "Passive Voice: Present Simple & Past Simple",
    grammarRule: "Form: Be + Past Participle. Focus on the action/object rather than who performed it.",
    grammarScope: "Limit to Present & Past Simple passive forms. Do not introduce passive modals yet.",
    boardFormula: "Object + am/is/are/was/were + V3 (Past Participle) + [by Agent]",
    vocab: ["produced", "manufactured", "exported", "heritage", "craftsmanship"],
    readingTitle: "Text Analysis: Artisanal Production & Heritage Crafts",
    readingStrategy: "Process flowchart mapping and passive verb identification."
  },
  {
    weekTitle: "Week 4: Relative Clauses & Descriptive Precision",
    grammarTopic: "Defining Relative Clauses (who, which, that, where)",
    grammarRule: "Relative pronouns without commas to give essential information identifying a person, place, or thing.",
    grammarScope: "Focus on defining clauses (no commas). Cover non-defining clauses next week.",
    boardFormula: "Noun + [who / which / that / where] + Clause  (No Commas)",
    vocab: ["guide", "location", "scenery", "resident", "environment"],
    readingTitle: "Text Analysis: Environment & Regional Descriptions",
    readingStrategy: "Identifying descriptive relative clauses and extracting key features."
  },
  {
    weekTitle: "Week 5: Conditionals & Hypothetical Scenarios",
    grammarTopic: "First Conditional (Real Future) vs Second Conditional (Unreal Present)",
    grammarRule: "First: If + Present, Will + Infinitive (real). Second: If + Past, Would + Infinitive (imaginary).",
    grammarScope: "Focus on contrasting real probability (First) vs imaginary dream scenarios (Second).",
    boardFormula: "First: If + Present Simple, Will + V1  |  Second: If + Past Simple, Would + V1",
    vocab: ["budget", "opportunity", "strategy", "outcome", "decision"],
    readingTitle: "Text Analysis: Decision Making & Cause-and-Effect Advice",
    readingStrategy: "Analyzing cause and effect in conditional advice."
  },
  {
    weekTitle: "Week 6: Mid-Term Review & Oral Evaluation Milestone",
    grammarTopic: "Mid-Term Review & Oral Defense Checkpoint",
    grammarRule: "Comprehensive synthesis of Weeks 1-5 grammar modules and vocabulary.",
    grammarScope: "Diagnostic evaluation of student grammar accuracy and oral fluency.",
    boardFormula: "Mid-Term Assessment & Progress Checklist",
    vocab: ["recap", "synthesis", "fluency", "accuracy", "assessment"],
    readingTitle: "Mid-Term Portfolio Review & Diagnostic Test",
    readingStrategy: "Comprehensive text analysis and error identification."
  },
  {
    weekTitle: "Week 7: Modals of Speculation & Deduction",
    grammarTopic: "Modals of Present Speculation (must, might, can't)",
    grammarRule: "Must + infinitive (90% sure true), Might (50% possible), Can't (90% sure impossible).",
    grammarScope: "Teach degrees of certainty using present modals. Leave past deduction for Session 2.",
    boardFormula: "Subject + MUST / MIGHT / CAN'T + V1 (Base Form)",
    vocab: ["mystery", "evidence", "artifact", "hypothesis", "clue"],
    readingTitle: "Text Analysis: Investigating Historical Mysteries",
    readingStrategy: "Evaluating evidence and modal deductions."
  },
  {
    weekTitle: "Week 8: Reported Speech & Indirect Communication",
    grammarTopic: "Reported Statements & Tense Shifts",
    grammarRule: "Backshifting tenses (Present Simple -> Past Simple, Present Perfect -> Past Perfect) in indirect reporting.",
    grammarScope: "Focus on reporting statements and tense backshifting rule.",
    boardFormula: "Direct: 'I am tired'  ->  Reported: He said (that) he WAS tired.",
    vocab: ["statement", "complaint", "feedback", "review", "testimonial"],
    readingTitle: "Text Analysis: Customer Feedback & Formal Communication",
    readingStrategy: "Distinguishing direct dialogue from reported statements."
  },
  {
    weekTitle: "Week 9: Past Habits vs Present Routines",
    grammarTopic: "Used To vs Would for Past Habits",
    grammarRule: "'Used to' for past states & actions vs 'Would' for repeated past actions only (not states).",
    grammarScope: "Emphasize that 'would' CANNOT be used for past states ('would be quiet' is incorrect).",
    boardFormula: "Subject + used to + V1 (States & Actions)  VS  Subject + would + V1 (Repeated Actions)",
    vocab: ["tradition", "nostalgia", "transformation", "heritage", "lifestyle"],
    readingTitle: "Text Analysis: Urban Transformations & Cultural History",
    readingStrategy: "Tracking historical transformations and habit contrasts."
  },
  {
    weekTitle: "Week 10: Advanced Comparison & Degree Modifiers",
    grammarTopic: "Comparatives with Modifiers (far more, slightly less, nowhere near as)",
    grammarRule: "Using degree modifiers: far / significantly / slightly / a bit + comparative adjective.",
    grammarScope: "Teach exact degree modifiers to make comparisons nuanced and formal.",
    boardFormula: "Subject + verb + [far / significantly / slightly] + Comparative Adj + than + Noun",
    vocab: ["luxury", "economical", "spacious", "congested", "tranquil"],
    readingTitle: "Text Analysis: Comparative Evaluations & Market Reviews",
    readingStrategy: "Comparative evaluation and price/value analysis."
  },
  {
    weekTitle: "Week 11: Verb Patterns (Gerunds & Infinitives)",
    grammarTopic: "Verbs Followed by Gerund (-ing) vs Infinitive (to)",
    grammarRule: "Verb patterns: enjoy/avoid/recommend + -ing vs decide/plan/hope + to-infinitive.",
    grammarScope: "Focus on verb pattern categorization and common student pre-verb errors.",
    boardFormula: "Verb + V-ing (enjoy, avoid, suggest)  VS  Verb + to-V1 (decide, plan, hope)",
    vocab: ["preference", "avoidance", "anticipation", "itinerary", "aspiration"],
    readingTitle: "Text Analysis: Psychology of Motivation & Habits",
    readingStrategy: "Extracting psychological profiles and verb structures."
  },
  {
    weekTitle: "Week 12: Term Synthesis & Final Academic Assessment",
    grammarTopic: "Final Course Synthesis & Graduation Defense",
    grammarRule: "Comprehensive term review and CEFR B1 attainment defense.",
    grammarScope: "Formal 60-minute written examination and 1-on-1 oral defense.",
    boardFormula: "Final Term Certification & Academic Evaluation Rubric",
    vocab: ["examination", "evaluation", "assessment", "rubric", "certification"],
    readingTitle: "Final Course Evaluation & Portfolio Assessment",
    readingStrategy: "Academic synthesis and portfolio defense."
  }
]

function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  if (!arr || arr.length === 0) return []
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

export function generateGranularTermRoadmap(params: GeneratorParams): GranularWeek[] {
  const { termWeeks, sessionsPerWeek, cefr, theme, grammarTags, vocabTags, idiomTags = [], weeklyArchetypes, selectedDays, detailLevel } = params

  const defaultDays = ['Monday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday']
  const daysList = selectedDays && selectedDays.length > 0
    ? selectedDays
    : defaultDays.slice(0, sessionsPerWeek)

  // STRICT GUARDRAIL: Only build Vocabulary Pool if user explicitly entered vocabulary or idioms
  const userEnteredPool = Array.from(new Set([...vocabTags, ...idiomTags])).filter(Boolean)
  const baseVocabPool = userEnteredPool.length > 0 ? userEnteredPool : []

  const vocabChunks = chunkArray(baseVocabPool, 3)

  // Determine schedule archetypes per week
  const archetypes = weeklyArchetypes && weeklyArchetypes.length === sessionsPerWeek
    ? weeklyArchetypes
    : (DEFAULT_SCHEDULE_ARCHETYPES[sessionsPerWeek] || DEFAULT_SCHEDULE_ARCHETYPES[3])

  const generatedWeeks: GranularWeek[] = []
  let overallSessionCounter = 1
  let instructionalSessionCounter = 0

  const cefrDiscussions = DISCUSSION_TOPICS_BY_CEFR[cefr] || DISCUSSION_TOPICS_BY_CEFR['B1']
  const cefrPhrases = FUNCTIONAL_PHRASES_BY_CEFR[cefr] || FUNCTIONAL_PHRASES_BY_CEFR['B1']
  const cleanTheme = theme ? theme.trim() : ''

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
      let grammarExplanation: string | undefined = undefined
      let syntaxFormula: string | undefined = undefined
      let grammarScopeLimit: string | undefined = undefined
      let boardLayout: string | undefined = undefined
      let sentenceModels: string[] | undefined = undefined
      let vocabList: string[] = []
      let activityType = ''
      let activityDetail = ''
      let objective = ''
      let ccqs: string[] = []
      let discussionTopics: DailySession['discussionTopics'] = undefined
      let functionalPhrases: string[] | undefined = undefined
      let activityGame: DailySession['activityGame'] = undefined
      let readingPassage: DailySession['readingPassage'] = undefined

      // Dynamic grammar structure resolution & progressive section chunking for current session
      const targetGrammarTag = grammarTags.length > 0
        ? grammarTags[(sessionNum - 1) % grammarTags.length]
        : weekData.grammarTopic

      // Calculate section index for multi-part progressive chunking across sessions
      const grammarTagIndex = grammarTags.length > 0 ? (sessionNum - 1) % grammarTags.length : 0
      const sectionIndex = Math.floor((sessionNum - 1) / Math.max(1, grammarTags.length))
      
      const grammarDetails = getGrammarDetailsForStructure(targetGrammarTag, cefr, sectionIndex)

      // Vocabulary Chunking: Assign 2-3 word chunks ONLY if user entered vocabulary
      if (baseVocabPool.length > 0 && (archetype === 'grammar' || archetype === 'reading')) {
        const currentChunk = vocabChunks[instructionalSessionCounter % vocabChunks.length] || []
        vocabList = currentChunk
        instructionalSessionCounter++
      } else {
        vocabList = []
      }

      // Check Mid-Term & Final Exams
      if (w === Math.floor(termWeeks / 2) && d === sessionsPerWeek) {
        type = 'Assessment'
        topicTitle = 'MID-TERM ORAL & WRITTEN EVALUATION'
        grammarFocus = 'Diagnostic assessment of Weeks 1-6 grammar, vocabulary, and speaking fluency.'
        activityType = 'Formal Evaluation'
        activityDetail = 'Students undergo individual oral presentations and written grammar check.'
        objective = 'Evaluate mid-term progress and academic attainment aligned to CEFR criteria.'
        vocabList = []
      } else if (w === termWeeks && d === sessionsPerWeek) {
        type = 'Exam'
        topicTitle = 'FINAL TERM WRITTEN & ORAL GRADUATION ASSESSMENT'
        grammarFocus = 'Comprehensive semester graduation evaluation covering complete curriculum.'
        activityType = 'Graduation Examination'
        activityDetail = 'Invigilated written exam followed by 1-on-1 speaking interview and portfolio review.'
        objective = 'Certify CEFR level proficiency and issue formal academic transcripts.'
        vocabList = []
      } else {
        const themeSuffix = cleanTheme ? ` in "${cleanTheme}" context` : ''
        
        grammarExplanation = grammarDetails.explanation
        syntaxFormula = grammarDetails.syntaxFormula
        sentenceModels = grammarDetails.sentenceModels

        // BUILD ACCORDING TO DAY ARCHETYPE
        switch (archetype) {
          case 'grammar':
            topicTitle = `📘 Grammar Focus: ${grammarDetails.topic}`
            grammarFocus = grammarDetails.rule
            grammarScopeLimit = grammarDetails.scope
            boardLayout = grammarDetails.board
            activityType = "Board Formula & Direct Instruction Drills"
            activityDetail = "Teacher delivers direct instruction using whiteboard formulas, followed by controlled sentence transformation drills."
            objective = `Master structural accuracy and form of ${grammarDetails.topic}${themeSuffix}.`
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
                prompt: `How would different stakeholders view this issue differently?`,
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
                `Scan Paragraph 2: Identify structural expressions related to ${grammarDetails.topic}.`,
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
        grammarDefinition: isSimplified ? undefined : grammarDetails.definition,
        usageCases: isSimplified ? undefined : grammarDetails.usageCases,
        grammarExplanation: isSimplified ? undefined : grammarExplanation,
        syntaxFormula: isSimplified ? undefined : syntaxFormula,
        grammarScopeLimit: isSimplified ? undefined : grammarScopeLimit,
        boardLayout: isSimplified ? undefined : boardLayout,
        grammarForms: isSimplified ? undefined : grammarDetails.forms,
        sentenceModels: isSimplified ? undefined : sentenceModels,
        grammarSubSections: isSimplified ? undefined : grammarDetails.subSections,
        edgeCases: isSimplified ? undefined : grammarDetails.edgeCases,
        signalWords: isSimplified ? undefined : grammarDetails.signalWords,
        vocabList,
        activityType,
        activityDetail,
        objective,
        type,
        ccqs: isSimplified ? [] : ccqs,
        discussionTopics: isSimplified ? undefined : discussionTopics,
        functionalPhrases: isSimplified ? undefined : functionalPhrases,
        activityGame: isSimplified ? undefined : activityGame,
        readingPassage: isSimplified ? undefined : readingPassage
      })
    }

    generatedWeeks.push({
      weekNum: w,
      title: weekData.weekTitle,
      theme: cleanTheme,
      days: weekDays
    })
  }

  return generatedWeeks
}

