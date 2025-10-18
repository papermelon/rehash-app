# Video Essay Creator - Setup Guide

## Overview

The Video Essay Creator transforms your notes into professional video essays with:
- AI-generated scripts styled after popular YouTube creators
- Editable script text for customization
- AI-generated image prompts for each segment
- Image generation using fal.ai (flux-pro/kontext and recraft/v3)
- Professional audio narration using ElevenLabs

## Environment Variables

Add these to your `.env.local` file:

```bash
# Required: Fal.ai API Key for image generation
FAL_AI_API_KEY=your_project_id:your_secret_key

# Already configured (should exist):
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migration

Run the migration to add new columns for video essay features:

```sql
-- Run this in your Supabase SQL Editor:
-- File: scripts/08-add-video-essay-segments.sql
```

This adds:
- `script_segments` (JSONB) - stores segments with text, image prompts, and URLs
- `total_image_cost` (DECIMAL) - tracks total cost of generated images

## Creator Styles

The tool now features 4 YouTube creator styles:

### 1. Kurzgesagt – The Cosmic Explainer 🌌
- **Tone**: Calm, intellectual, visually rich
- **Visual Style**: Elegant motion graphics, pastel gradients, flat 2D illustrations
- **Best for**: Science, philosophy, big ideas

### 2. Casually Explained – The Comedian Philosopher 😐
- **Tone**: Deadpan, witty, self-aware
- **Visual Style**: Simple stick figures, minimal line art, ironic charts
- **Best for**: Relatable topics, everyday logic, humor

### 3. CGP Grey – The Logical Narrator 📊
- **Tone**: Analytical, structured, clear
- **Visual Style**: Clean diagrams, maps, flowcharts, infographics
- **Best for**: Complex systems, logical explanations, structured topics

### 4. The School of Life – The Human Storyteller 🎨
- **Tone**: Thoughtful, poetic, emotionally intelligent
- **Visual Style**: Minimalist vector animation, soft palettes, metaphorical imagery
- **Best for**: Personal growth, meaning, reflective topics

## Image Generation Strategy

The tool uses a two-tier approach for cost efficiency:

1. **First Segment (Style Anchor)**
   - Model: `flux-pro/kontext` 
   - Cost: ~$0.04 per image
   - Purpose: Establishes visual style and consistency

2. **Additional Segments**
   - Model: `recraft/v3/text-to-image`
   - Cost: ~$0.02 per image
   - Purpose: Maintains style while reducing costs

**Example Cost**: 20 images = (1 × $0.04) + (19 × $0.02) = $0.42 per video essay

## Workflow

### 1. Generate Script
- Select a creator style
- Choose duration (1-10 minutes)
- AI generates script and automatically creates segments with image prompts

### 2. Edit Script
- Make any changes to the script text
- Edits are saved automatically
- Changes persist for audio generation

### 3. Review & Edit Image Prompts
- Each segment has an AI-generated image prompt
- Edit prompts to refine the visual output
- Remove unwanted segments
- Add custom segments if needed

### 4. Generate Images
- Generate images one-by-one for control
- Or use "Generate All Missing Images" for batch processing
- Cost tracker shows running total

### 5. Generate Audio
- Uses current script text (including any edits)
- ElevenLabs generates professional narration
- Regenerate anytime with edited script

## API Routes

### New Endpoints

- `POST /api/update-script` - Save edited script text
- `POST /api/generate/segments` - Generate segments and image prompts
- `POST /api/generate/image` - Generate image for a segment using fal.ai
- `POST /api/remove-segment` - Remove a segment

### Updated Endpoints

- `POST /api/generate/script` - Now auto-generates segments with prompts
- `POST /api/generate/audio` - Uses edited script_text from database

## Components

### New Components

- `components/script-editor.tsx` - Editable script with save/cancel
- `components/video-essay-controls.tsx` - Style selector, duration, regenerate
- `components/video-segments.tsx` - Segment list with image generation

### Updated Components

- `app/audio/[id]/audio-page-client.tsx` - Complete restructure with new layout
- `components/script-generator.tsx` - Updated default style to Kurzgesagt

## Fal.ai Models

### flux-pro/kontext
- High-quality, consistent style
- Supports image-to-image + text prompts
- Used for style anchor frames
- 1024x576 resolution (16:9 widescreen)

### recraft/v3/text-to-image
- Fast, cost-effective
- Good for additional stills
- Digital illustration style
- 1024x576 resolution

## Cost Management

The tool provides:
- Per-segment cost display
- Running total in controls bar
- Cost stored in database (`total_image_cost`)

Average costs:
- Short video (5 segments): ~$0.12
- Medium video (10 segments): ~$0.22
- Long video (20 segments): ~$0.42

## Troubleshooting

### Images not generating
- Check `FAL_AI_API_KEY` is set correctly in `.env.local`
- Verify format: `project_id:secret_key`
- Check fal.ai account has credits

### Script segments not appearing
- Run database migration (`08-add-video-essay-segments.sql`)
- Regenerate script to create segments
- Check browser console for errors

### Audio using old script
- Save script edits before generating audio
- Audio uses `script_text` column from database
- Ensure script_text is updated after edits

## Next Steps

Future enhancements could include:
- Video rendering with images + audio sync
- Custom character/scene image uploads for consistency
- Timeline editor for precise image/audio timing
- Export to video formats (MP4, WebM)
- Animation effects and transitions

