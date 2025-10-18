-- Fix photos table by adding missing file_size column

-- Add file_size column to photos table if it doesn't exist
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Update existing records to have a default file_size of 0 if they're null
UPDATE photos 
SET file_size = 0 
WHERE file_size IS NULL;
