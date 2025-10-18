-- Add rehash features to existing schema
-- This extends the existing notes table and adds photos table for multi-file uploads

-- Add new columns to notes table for rehash outputs
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image'::TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS input_text TEXT,
ADD COLUMN IF NOT EXISTS notes_md TEXT,
ADD COLUMN IF NOT EXISTS reddit_json JSONB,
ADD COLUMN IF NOT EXISTS cards_json JSONB;

-- Create photos table for multi-file uploads
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rehash_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  note TEXT DEFAULT '',
  idx INTEGER DEFAULT 0,
  filename TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_rehash_id ON photos(rehash_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_idx ON photos(idx);

-- Add trigger to auto-update updated_at for photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_photos_updated_at'
  ) THEN
    CREATE TRIGGER update_photos_updated_at
      BEFORE UPDATE ON photos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- For hackathon simplicity, disable RLS on photos table
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON COLUMN notes.input_text IS 'Consolidated text from all uploaded files and annotations';
COMMENT ON COLUMN notes.notes_md IS 'Clean markdown notes generated from input_text';
COMMENT ON COLUMN notes.reddit_json IS 'Reddit thread JSON with title, OP, and nested comments';
COMMENT ON COLUMN notes.cards_json IS 'Game cards JSON with MCQ and Cloze items for Space Invaders';

-- Backfill default type value for existing rows
UPDATE notes
SET type = COALESCE(type, 'image');

-- Ensure type column uses allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notes_type_check'
  ) THEN
    ALTER TABLE notes
      ADD CONSTRAINT notes_type_check CHECK (type IN ('text', 'image', 'pdf'));
  END IF;
END;
$$;

COMMENT ON TABLE photos IS 'Individual images/files uploaded as part of a rehash session';
COMMENT ON COLUMN photos.rehash_id IS 'References the notes table (represents one rehash session)';
COMMENT ON COLUMN photos.note IS 'User annotation for this specific image/file';
COMMENT ON COLUMN photos.idx IS 'Display order of images in the upload';
