# 🚀 Vercel Deployment - Step by Step Guide

## ✅ Pre-Deployment Checklist

- [x] GitHub repository set up: `https://github.com/papermelon/rehash-app.git`
- [x] Code pushed to main branch
- [ ] Environment variables ready
- [ ] Supabase project configured
- [ ] API keys obtained

---

## 📋 Step 1: Prepare Your Environment Variables

You'll need these environment variables for Vercel. **Copy this list and have your values ready:**

### Required Variables:

```bash
# Supabase (Get from: https://supabase.com → Your Project → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google AI (Get from: https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here

# OpenAI (Get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key_here

# ElevenLabs (Get from: https://elevenlabs.io)
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Fal.ai (Get from: https://fal.ai)
FAL_AI_API_KEY=your_fal_key_here

# Tavily (Get from: https://tavily.com)
TAVILY_API_KEY=your_tavily_key_here
```

### Optional Variables:

```bash
# Interfaze AI - Enhanced OCR (Get from: https://interfaze.ai)
INTERFAZE_API_KEY=your_interfaze_key_here
```

### ⚠️ IMPORTANT: DO NOT ADD THESE IN PRODUCTION:
```bash
# These are for local development only:
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL  # Don't add to Vercel!
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Easiest)

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign in with GitHub (or create account)

2. **Import Repository**
   - Click "Import Project"
   - Select: `papermelon/rehash-app`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `pnpm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from Step 1 above
   - For each variable:
     - Name: (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
     - Value: (paste your value)
     - Environment: Select "Production, Preview, and Development"
   - Click "Add" for each variable

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://rehash-app-xxx.vercel.app`

### Option B: Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? rehash-app
# - In which directory is your code located? ./
# - Want to modify settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... (repeat for all variables)

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Configure Supabase for Production

Once you have your Vercel URL (e.g., `https://rehash-app-xxx.vercel.app`):

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Update Authentication Settings**
   - Go to: Authentication → URL Configuration
   - **Site URL**: Add your Vercel URL
     ```
     https://rehash-app-xxx.vercel.app
     ```
   - **Redirect URLs**: Add these URLs:
     ```
     https://rehash-app-xxx.vercel.app/**
     https://rehash-app-xxx.vercel.app/auth/callback
     ```

3. **Update CORS (if needed)**
   - Go to: Settings → API
   - Ensure your Vercel domain is allowed

4. **Save Changes**

---

## ✅ Step 4: Test Your Deployment

### Test Authentication
1. Visit: `https://your-app.vercel.app/signup`
2. Create a test account
3. Check email for confirmation
4. Log in

### Test File Upload
1. Go to: `/upload`
2. Upload a test image or text file
3. Verify processing works

### Test Video Generation
1. Create a note
2. Generate a video essay
3. Verify segments are created

### Check for Errors
1. Open browser console (F12)
2. Look for any red errors
3. Check Vercel deployment logs:
   - Go to: https://vercel.com/dashboard
   - Select your project → Deployments
   - Click on latest deployment → View Function Logs

---

## 🎯 Step 5: Custom Domain (Optional)

### Add Your Own Domain

1. **In Vercel Dashboard**
   - Go to: Your Project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `rehash.yoursite.com`)

2. **Update DNS Records**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Wait for DNS propagation (5-30 minutes)

3. **Update Supabase**
   - Add your custom domain to Supabase redirect URLs

---

## 🐛 Troubleshooting

### Build Fails
- **Check:** All environment variables are set
- **Check:** Node.js version (Vercel uses Node 18+ by default)
- **Fix:** Review build logs in Vercel dashboard

### Authentication Not Working
- **Check:** Supabase redirect URLs include your Vercel URL
- **Check:** Site URL is set correctly in Supabase
- **Fix:** Add `https://your-app.vercel.app/**` to redirect URLs

### API Routes Failing
- **Check:** All API keys are valid
- **Check:** Service Role Key is added (for server-side operations)
- **Fix:** View Function Logs in Vercel dashboard

### "Module not found" Errors
- **Check:** All dependencies are in `package.json`
- **Fix:** Run `pnpm install` locally and push changes

### Image/Video Generation Not Working
- **Check:** Fal.ai API key is properly formatted
- **Check:** Supabase Storage policies are correct
- **Fix:** Test API keys individually

---

## 💰 Cost Estimate

### Free Tier Limits (Vercel Hobby Plan)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Unlimited team members
- ✅ Automatic HTTPS

### External Services (Pay-as-you-go)
- **Supabase**: Free tier → 500MB database, 1GB storage
- **OpenAI**: ~$0.002 per 1K tokens (very cheap)
- **ElevenLabs**: 10,000 characters free/month
- **Fal.ai**: Pay per image generation (~$0.05-0.15 per image)

**Expected Monthly Cost**: $0-10 for moderate usage

---

## 📚 Post-Deployment Tasks

- [ ] Test all features thoroughly
- [ ] Set up monitoring (Vercel Analytics is free)
- [ ] Configure custom domain (optional)
- [ ] Enable preview deployments for PRs
- [ ] Set up Vercel Analytics for insights

---

## 🔗 Useful Links

- **Your GitHub Repo**: https://github.com/papermelon/rehash-app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Your Deployment**: (will be available after deployment)

---

## 🆘 Need Help?

If you run into issues:
1. Check Vercel Function Logs
2. Check Supabase Logs
3. Review browser console errors
4. Check this troubleshooting guide

---

**Ready to deploy? Start with Step 1!** 🚀

