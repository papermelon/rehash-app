# ElevenLabs Audio Generation Setup

## What's Been Configured

### 1. ✅ API Key Added
- ElevenLabs API key has been added to `.env.local`
- Variable: `ELEVENLABS_API_KEY`

### 2. ✅ Audio Generation API Created
- New endpoint: `/app/api/generate/audio/route.ts`
- Features:
  - Fetches script from database
  - Calls ElevenLabs API with Rachel voice (professional, calm)
  - Uploads generated MP3 to Supabase Storage
  - Updates database with audio URL

### 3. ✅ UI Components Updated
- Added "Generate Audio Narration" button to audio page
- Shows loading state during generation
- Displays errors if generation fails
- Auto-refreshes page when audio is ready

## Voice Configuration

Currently using **Rachel** (Voice ID: `21m00Tcm4TlvDq8ikWAM`)
- Calm, professional voice
- Great for educational content
- Stability: 0.5
- Similarity Boost: 0.75

### Other Available Voices
You can change the voice by modifying `voiceId` in `/app/api/generate/audio/route.ts`:

- **Rachel**: `21m00Tcm4TlvDq8ikWAM` (professional, calm)
- **Drew**: `29vD33N1CtxCmqQRPOHJ` (warm, confident male)
- **Clyde**: `2EiwWnXFnvU5JabPnv8n` (casual, conversational male)
- **Bella**: `EXAVITQu4vr4xnSDxMaL` (friendly, warm female)
- **Antoni**: `ErXwobaYiN019PkySvjV` (energetic, young male)

## ⚠️ Important: Database Migration Required

Before audio generation will work, you **MUST** run the database migration to add the required columns.

### Run This in Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/muwkcunexnagvmbkrdbb/sql/new
2. Paste and run:

```sql
-- Add audio_url and script_text columns to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS script_text TEXT,
ADD COLUMN IF NOT EXISTS audio_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS script_style TEXT,
ADD COLUMN IF NOT EXISTS script_duration_minutes INTEGER;

-- Add index for audio availability queries
CREATE INDEX IF NOT EXISTS idx_notes_audio_url ON notes(audio_url) WHERE audio_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN notes.audio_url IS 'URL to generated audio narration file in Supabase Storage';
COMMENT ON COLUMN notes.script_text IS 'AI-generated study script text for audio narration';
COMMENT ON COLUMN notes.audio_generated_at IS 'Timestamp when audio/script was generated';
COMMENT ON COLUMN notes.script_style IS 'Style template used for script generation (casually-explained, cgp-grey, kurzgesagt, school-of-life)';
COMMENT ON COLUMN notes.script_duration_minutes IS 'Target duration in minutes for the generated script';
```

## How to Use

1. **Generate a Script First**
   - Go to a note's audio page
   - Click "Generate" tab
   - Choose a narrator style (Casually Explained, CGP Grey, Kurzgesagt, School of Life)
   - Select duration (3-15 minutes)
   - Click "Generate Script"

2. **Generate Audio**
   - After script is generated, go to "Audio" tab
   - Click "Generate Audio Narration" button
   - Wait 30-60 seconds (depending on script length)
   - Audio player will appear when ready

3. **Listen & Download**
   - Use the audio player to listen
   - Click "Download" to save MP3 file
   - Perfect for on-the-go learning!

## Cost Information

ElevenLabs costs are based on characters processed:
- Free tier: 10,000 characters/month
- Creator tier: $5/month for 30,000 characters
- A 5-minute script (~750 words) = ~3,000-4,000 characters

## Troubleshooting

### "Failed to save script" error
- ✅ Fixed: Run the database migration above

### "Failed to generate audio" error
- Check if ElevenLabs API key is valid
- Check if you have credits remaining on your ElevenLabs account
- Verify script exists before trying to generate audio

### Audio doesn't play
- Check browser console for errors
- Verify the audio URL is accessible
- Try downloading and playing locally

## Next Steps (Optional Enhancements)

1. **Add Voice Selection UI**
   - Let users choose different voices
   - Preview voice samples

2. **Audio Progress Indicator**
   - Show real-time progress during generation
   - WebSocket updates instead of page refresh

3. **Batch Audio Generation**
   - Generate audio for multiple notes at once
   - Queue system for processing

4. **Audio Caching**
   - Cache generated audio
   - Regenerate only when script changes

