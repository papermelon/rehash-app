-- Fixed script for Rehash setup - handles existing triggers and creates missing components

-- 1. First, let's check if the trigger exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_photos_updated_at') THEN
        DROP TRIGGER update_photos_updated_at ON photos;
    END IF;
END $$;

-- 2. Add new columns to notes table for rehash outputs (if they don't exist)
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS input_text TEXT,
ADD COLUMN IF NOT EXISTS notes_md TEXT,
ADD COLUMN IF NOT EXISTS reddit_json JSONB,
ADD COLUMN IF NOT EXISTS cards_json JSONB;

-- 3. Create photos table for multi-file uploads (if it doesn't exist)
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

-- 4. Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_photos_rehash_id ON photos(rehash_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_idx ON photos(idx);

-- 5. Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create the trigger (now that we've dropped the old one)
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. For hackathon simplicity, disable RLS on photos table
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- 8. Create storage bucket for note uploads (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-uploads', 'note-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Set up storage policies for the note-uploads bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'note-uploads');

    CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'note-uploads' 
      AND auth.role() = 'authenticated'
    );

    CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'note-uploads' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

    CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'note-uploads' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
END $$;
