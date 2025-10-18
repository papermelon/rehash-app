-- Add audio_url and script_text columns to notes table
-- This replaces the game functionality with audio/script generation

ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS script_text TEXT,
ADD COLUMN IF NOT EXISTS audio_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS script_style TEXT,
ADD COLUMN IF NOT EXISTS script_duration_minutes INTEGER;

-- Add index for audio availability queries
CREATE INDEX IF NOT EXISTS idx_notes_audio_url ON notes(audio_url) WHERE audio_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN notes.audio_url IS 'URL to generated audio narration file in Supabase Storage';
COMMENT ON COLUMN notes.script_text IS 'AI-generated study script text for audio narration';
COMMENT ON COLUMN notes.audio_generated_at IS 'Timestamp when audio/script was generated';
COMMENT ON COLUMN notes.script_style IS 'Style template used for script generation (casually-explained, cgp-grey, kurzgesagt, school-of-life)';
COMMENT ON COLUMN notes.script_duration_minutes IS 'Target duration in minutes for the generated script';

