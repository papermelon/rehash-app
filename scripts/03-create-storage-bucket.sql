-- Create storage bucket for note uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-uploads', 'note-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the note-uploads bucket
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