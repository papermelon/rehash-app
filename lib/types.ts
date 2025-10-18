export type NoteType = "text" | "image" | "pdf"
export type ScriptStyle = 'kurzgesagt' | 'casually-explained' | 'cgp-grey' | 'school-of-life'

export interface ScriptSegment {
  id: string
  text: string
  imagePrompt: string
  imageUrl?: string | null
  order: number
  model?: string | null
  cost?: number
}

export interface Folder {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  type: NoteType
  original_filename?: string
  file_size?: number
  original_text?: string
  original_file_url?: string
  summary?: string
  auto_tags?: string[]
  // New rehash fields
  input_text?: string
  notes_md?: string
  reddit_json?: RedditThread
  cards_json?: { cards: GameCard[] }
  audio_url?: string
  script_text?: string
  audio_generated_at?: string
  script_style?: ScriptStyle
  script_duration_minutes?: number
  script_segments?: ScriptSegment[]
  total_image_cost?: number
  folder_id?: string | null
  created_at: string
  updated_at: string
  processed_at?: string
}

export type ViewMode = 'grid' | 'list'

export interface Flashcard {
  id: string
  note_id: string
  user_id: string
  question: string
  answer: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface NoteTag {
  id: string
  note_id: string
  user_id: string
  tag: string
  created_at: string
}

export interface Photo {
  id: string
  rehash_id: string
  user_id: string
  image_url: string
  note: string
  idx: number
  filename?: string
  file_size?: number
  created_at: string
  updated_at: string
}

export interface Comment {
  user: string
  body: string
  up: number
  replies?: Comment[]
}

export interface RedditThread {
  title: string
  op: string
  comments: Comment[]
}

export interface GameCard {
  type: 'mcq' | 'cloze'
  prompt: string
  answer: string
  choices?: string[] // For MCQ
  text?: string // For Cloze (text with ___)
  distractors?: string[] // For Cloze
}

export interface ProcessedNote {
  summary: string
  flashcards: Array<{
    question: string
    answer: string
  }>
  tags: string[]
}

export interface ScriptGenerationRequest {
  noteId: string
  style: ScriptStyle
  durationMinutes: number
}

export interface ScriptGenerationResponse {
  script: string
  style: ScriptStyle
  durationMinutes: number
  wordCount: number
  wasSupplemented: boolean
  supplementWarning?: string
}

export interface ImageGenerationRequest {
  noteId: string
  segmentId: string
  prompt: string
  isFirstSegment?: boolean
}

export interface ImageGenerationResponse {
  imageUrl: string
  cost: number
  model: string
}
