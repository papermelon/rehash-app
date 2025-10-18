# 📋 Environment Variables Checklist for Vercel

## Copy-Paste Template

Use this template when adding environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
FAL_AI_API_KEY=
TAVILY_API_KEY=
INTERFAZE_API_KEY=
```

---

## Where to Get Each Key

| Variable | Where to Get It | Link |
|----------|----------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | https://supabase.com/dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | https://supabase.com/dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Service Role (secret!) | https://supabase.com/dashboard |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio | https://aistudio.google.com/app/apikey |
| `OPENAI_API_KEY` | OpenAI Platform → API Keys | https://platform.openai.com/api-keys |
| `ELEVENLABS_API_KEY` | ElevenLabs Dashboard | https://elevenlabs.io |
| `FAL_AI_API_KEY` | Fal.ai Dashboard | https://fal.ai |
| `TAVILY_API_KEY` | Tavily Dashboard | https://tavily.com |
| `INTERFAZE_API_KEY` | Interfaze AI Dashboard (Optional) | https://interfaze.ai |

---

## Checklist

Before deploying, make sure you have:

- [ ] All 8 required API keys ready (or at least the critical ones)
- [ ] Supabase project is set up with all SQL scripts run
- [ ] Storage bucket created in Supabase
- [ ] All keys are valid and working

### Critical Keys (Must Have):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`

### Important Keys (Core Features):
- [ ] `OPENAI_API_KEY` (for audio narration & scripts)
- [ ] `ELEVENLABS_API_KEY` (for voice synthesis)
- [ ] `FAL_AI_API_KEY` (for image generation)

### Optional Keys:
- [ ] `TAVILY_API_KEY` (for web search)
- [ ] `INTERFAZE_API_KEY` (for enhanced OCR)

---

## Quick Add in Vercel

When in Vercel's "Environment Variables" section:

1. For each variable:
   - **Name**: Copy from the left column above
   - **Value**: Paste your key
   - **Environment**: Select "Production, Preview, and Development"
   - Click "Add"

2. Repeat for all variables

3. Deploy!

---

## ⚠️ Security Notes

- **NEVER** commit these keys to Git
- The `SUPABASE_SERVICE_ROLE_KEY` is especially sensitive - it bypasses RLS!
- All keys starting with `NEXT_PUBLIC_` will be visible in client-side code
- Keep your API keys secure and rotate them if compromised

---

## Testing After Deployment

After adding variables and deploying:

1. Check browser console for any "undefined" environment variable errors
2. Test authentication (needs Supabase keys)
3. Test AI generation (needs OpenAI/Google AI keys)
4. Test image generation (needs Fal.ai key)

If something doesn't work, check the Vercel Function Logs!

