# 🧠 Rehash App

> "People need to be reminded, not taught."  
> Rehash helps you revisit and transform what you already know into engaging video essays, so learning becomes cyclical instead of disposable.

## 🚀 Overview
"People need to be reminded, not taught". Some of the best learning comes from knowledge we have already encountered. 

Rehash is an AI-powered app that makes it easy to transform your existing notes into content that you can revisit in different forms, so you can focus on relearning what is important to you. 

Rehash aims to be your antidote to doomscrolling.

Users can upload text or images, generate rewritten scripts, and convert them into stylized explainers with narration and visuals, or in familiar or engaging formats such as comment conversation threads or MCQ quizzes respectively.

## ⚙️ Tech Stack
- **Next.js 15 (App Router)**
- **TypeScript**
- **Supabase** (Auth + DB)
- **Vercel / Fal.ai** (image & video generation)
- **OpenAI API** (narration + scripting)
- **TailwindCSS**

## 🧩 Key Features
- Smart note summarization and script generation  
- Multiple "video essay" styles  
- AI voice narration  
- Comic-style visual generation  
- Personal content vault  

## 🖥️ Demo
[https://rehash-app.vercel.app](https://rehash-app.vercel.app)

## 👥 Team
Built by Ngawang Chime for Singapore Cursor Hackathon 2025

---

## 📋 Detailed Features

- 📝 **Multi-format Input**: Paste text or upload images (JPG/PNG/HEIC) and DOCX/TXT files
- 🤖 **AI Processing**: Automatic summarization and flashcard generation
- 🎬 **Video Essay Generation**: Transform notes into engaging video content
- 🎙️ **Audio Narration**: AI-powered voice generation with ElevenLabs
- 🎨 **Visual Styles**: Multiple comic-style visual generation options
- 🗂️ **Folder Organization**: Organize notes with custom folders
- 📤 **Export Options**: Download as Markdown or CSV
- 🎮 **Gamification**: Interactive elements and progress tracking

## Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project
- API keys for:
  - Google AI (Gemini) - for text generation
  - OpenAI - for script generation and narration
  - ElevenLabs - for voice synthesis
  - Fal.ai - for image generation
  - Interfaze AI (Optional) - for enhanced image/document OCR

## Setup Instructions

### 1. Clone and Install

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order from the `scripts/` folder:
   - `01-create-tables.sql`
   - `02-enable-rls.sql`
   - `03-create-storage-bucket.sql`
   - `04-add-rehash-features.sql`
   - `07-add-audio-script-columns.sql`
   - `08-add-video-essay-segments.sql`
   - `09-add-folders-and-view-preferences.sql`

You can run these in the Supabase SQL Editor.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development redirect URL for email confirmation
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
FAL_AI_API_KEY=your_fal_ai_api_key
TAVILY_API_KEY=your_tavily_api_key

# Optional: Interfaze AI for enhanced image/document OCR
INTERFAZE_API_KEY=your_interfaze_api_key
```

**Where to find these values:**

- Supabase values: Project Settings → API in your Supabase dashboard
- Google AI API key: [Google AI Studio](https://aistudio.google.com/app/apikey)
- OpenAI API key: [OpenAI Platform](https://platform.openai.com/api-keys)
- ElevenLabs API key: [ElevenLabs](https://elevenlabs.io)
- Fal.ai API key: [Fal.ai](https://fal.ai)
- Interfaze AI API key: [Interfaze AI](https://interfaze.ai) (optional, for enhanced OCR)

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   │   ├── generate/     # AI generation endpoints
│   │   ├── folders/      # Folder management
│   │   └── auth/         # Authentication
│   ├── audio/            # Audio generation pages
│   ├── play/             # Video playback
│   ├── review/           # Flashcard review
│   ├── vault/            # User dashboard
│   └── upload/           # Note upload interface
├── components/           # React components
│   ├── ui/               # UI components (shadcn)
│   ├── script-editor.tsx # Script editing interface
│   ├── video-segments.tsx # Video segment management
│   └── flashcard-view.tsx # Flashcard interface
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── types.ts          # TypeScript types
│   └── openai-client.ts  # OpenAI integration
├── scripts/              # Database setup SQL
└── public/               # Static assets
```

## Usage

1. **Sign Up**: Create an account at `/signup`
2. **Upload Notes**: Go to `/upload` and paste text or upload files
3. **Generate Content**: Create video essays, audio narrations, or flashcards
4. **Organize**: Use folders to organize your content
5. **Review**: Practice with flashcards or watch your generated videos
6. **Export**: Download your content in various formats

## File Limits

- Maximum file size: 50 MB
- Supported formats: JPG, PNG, HEIC, DOCX, TXT, or direct text input

## Database Schema

### Main Tables

- **notes**: Stores uploaded notes with metadata
- **flashcards**: Generated Q&A pairs linked to notes
- **tags**: Organizational tags for notes
- **video_essay_segments**: Video segments for generated essays
- **folders**: User-created folders for organization
- **user_view_preferences**: User UI preferences

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your Vercel project settings. For production, do not set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - the app will use `window.location.origin` automatically.

## Troubleshooting

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check that RLS policies are enabled
- Ensure email confirmation is set up in Supabase Auth settings

### File Upload Issues

- Check Supabase Storage bucket exists and has correct policies
- Verify file size is under 50 MB
- Ensure CORS is configured in Supabase Storage settings

### AI Processing Issues

- Verify all API keys are valid
- Check API quota limits
- Review server logs for detailed error messages

### Video Generation Issues

- Ensure Fal.ai API key is properly formatted (project_id:secret_key)
- Check that video_essay_segments table exists
- Verify storage bucket policies allow uploads

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Documentation

- [Audio Feature Guide](AUDIO_FEATURE_CHANGES.md)
- [Video Essay Setup](VIDEO_ESSAY_SETUP.md)
- [Script Generation](SCRIPT_GENERATION_IMPLEMENTATION.md)
- [Folders & Views](FOLDERS_AND_VIEWS.md)
- [Interfaze AI Setup](INTERFAZE_AI_SETUP.md)
- [Git Setup Guide](GIT_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
