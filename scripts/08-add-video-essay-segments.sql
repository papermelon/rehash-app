-- Add script_segments and related columns for video essay feature
-- This enables AI-generated image prompts and image generation per segment

ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS script_segments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_image_cost DECIMAL(10, 4) DEFAULT 0;

-- Add index for querying segments
CREATE INDEX IF NOT EXISTS idx_notes_script_segments ON notes USING GIN (script_segments);

-- Add comments for documentation
COMMENT ON COLUMN notes.script_segments IS 'Array of script segments with text, AI-generated image prompts, and image URLs';
COMMENT ON COLUMN notes.total_image_cost IS 'Total cost in USD for all generated images for this video essay';

-- Example structure for script_segments:
-- [
--   {
--     "id": "segment-1",
--     "text": "script text for this segment",
--     "imagePrompt": "AI-generated image prompt",
--     "imageUrl": null,
--     "order": 0,
--     "model": null,
--     "cost": 0
--   }
-- ]

