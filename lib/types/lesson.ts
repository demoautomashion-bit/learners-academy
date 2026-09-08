export interface VocabularyItem {
  word: string
  part_of_speech: string
  definition: string
  example_sentences: string[]
  // Legacy UI fallback fields
  partOfSpeech?: string
  def?: string
  example?: string
}

export interface IdiomItem {
  idiom: string
  definition: string
  example_sentences: string[]
  // Legacy UI fallback fields
  expression?: string
  meaning?: string
  usage?: string
}

export interface GrammarForms {
  positive: string
  negative: string
  interrogative: string
  shortAnswers: string
}

export interface GrammarDetails {
  topic: string
  rule: string
  definition: string
  usageCases: string[]
  explanation: string
  explanation_rationale: string
  syntaxFormula: string
  scope: string
  board: string
  forms: GrammarForms
  subSections: string[]
  edgeCases: string[]
  edge_case_syntax: string[]
  signalWords: string[]
  sentenceModels: string[]
  ccqs: string[]
}

export type DayArchetype = 'grammar' | 'activity' | 'discussion' | 'reading'

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
  explanation_rationale?: string
  syntaxFormula?: string
  syntaxPatterns?: GrammarForms
  grammarScopeLimit?: string
  boardLayout?: string
  grammarForms?: GrammarForms
  sentenceModels?: string[]
  grammarSubSections?: string[]
  edgeCases?: string[]
  edge_case_syntax?: string[]
  signalWords?: string[]
  vocabList: string[]
  vocabulary?: VocabularyItem[]
  idioms?: IdiomItem[]
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

export interface SingleLessonResult {
  isTerm: false
  detailLevel: 'simplified' | 'detailed'
  title: string
  cefr: string
  duration: string
  theme?: string
  grammarFocus: string
  grammarDefinition?: string
  usageCases?: string[]
  grammarExplanation?: string
  explanation_rationale?: string
  syntaxFormula?: string
  syntaxPatterns?: GrammarForms
  boardLayout?: string
  grammarScopeLimit?: string
  grammarForms?: GrammarForms
  sentenceModels?: string[]
  grammarSubSections?: string[]
  edgeCases?: string[]
  edge_case_syntax?: string[]
  signalWords?: string[]
  objectives: string[]
  vocabulary: VocabularyItem[]
  idioms: IdiomItem[]
  ccqs: string[]
  quiz?: {
    question: string
    options: string[]
    answer: string
    reason: string
  }[]
  homework?: string
}

export interface TermSyllabusResult {
  isTerm: true
  detailLevel: 'simplified' | 'detailed'
  title: string
  cefr: string
  duration: string
  theme?: string
  totalSessions: number
  selectedDays: string[]
  objectives: string[]
  weeks: GranularWeek[]
}

export type LessonPlanResult = SingleLessonResult | TermSyllabusResult
