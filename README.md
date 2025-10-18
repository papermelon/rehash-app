# Rehash - Knowledge Processing App

Transform messy workshop notes, webinar screenshots, and text dumps into structured, reviewable knowledge with AI-powered summaries and flashcards.

## Features

- 📝 **Multi-format Input**: Paste text or upload images (JPG/PNG/HEIC) and DOCX/TXT files
- 🤖 **AI Processing**: Automatic summarization and flashcard generation using Gemini 2.5-flash
- 🏷️ **Smart Organization**: Auto-tagging with manual editing capabilities
- 💾 **Personal Vault**: Secure storage with multi-tenant isolation
- 📤 **Export Options**: Download as Markdown or CSV
- 🎨 **Rehash Meter**: Playful processing animation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Gemini 2.5-flash via Vercel AI SDK
- **UI Components**: Radix UI + shadcn/ui

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- A Google AI API key (for Gemini)

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order from the `scripts/` folder:
   - `01-create-tables.sql`
   - `02-enable-rls.sql`
   - `03-create-storage-bucket.sql`

You can run these in the Supabase SQL Editor or using the Supabase CLI.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development redirect URL for email confirmation
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Google AI (for Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
\`\`\`

**Where to find these values:**

- Supabase values: Project Settings → API in your Supabase dashboard
- Google AI API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── actions/          # Server actions
│   ├── login/            # Authentication pages
│   ├── signup/
│   ├── upload/           # Note upload interface
│   ├── vault/            # User dashboard
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── types.ts          # TypeScript types
│   └── file-validation.ts
├── scripts/              # Database setup SQL
└── public/               # Static assets
\`\`\`

## Usage

1. **Sign Up**: Create an account at `/signup`
2. **Upload Notes**: Go to `/upload` and paste text or upload files
3. **Review**: View processed notes in your `/vault`
4. **Export**: Download summaries and flashcards in various formats

## File Limits

- Maximum file size: 50 MB
- Supported formats: JPG, PNG, HEIC, DOCX, TXT, or direct text input

## Database Schema

### Tables

- **notes**: Stores uploaded notes with metadata
- **flashcards**: Generated Q&A pairs linked to notes
- **tags**: Organizational tags for notes

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your Vercel project settings, except replace `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` with your production URL.

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

- Verify Google AI API key is valid
- Check API quota limits
- Review server logs for detailed error messages

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
