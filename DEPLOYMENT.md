# Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up with tables and storage bucket

### Steps

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   Add these in Vercel project settings → Environment Variables:
   
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
   \`\`\`
   
   **Important**: Do NOT add `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` in production. The app will use `window.location.origin` automatically.

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

5. **Configure Supabase Auth Redirect**
   - Go to your Supabase project → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL" and "Redirect URLs"
   - Example: `https://your-project.vercel.app`

### Post-Deployment

1. **Test Authentication**
   - Sign up with a new account
   - Check email confirmation works
   - Verify login/logout

2. **Test File Upload**
   - Upload a test image and a DOCX/TXT file
   - Verify processing works
   - Check files appear in Supabase Storage

3. **Monitor Logs**
   - Check Vercel deployment logs for errors
   - Monitor Supabase logs for database issues

## Deploy to Other Platforms

### Railway

1. Connect your GitHub repo
2. Add environment variables
3. Deploy with `npm run build && npm start`

### DigitalOcean App Platform

1. Create new app from GitHub
2. Set build command: `npm run build`
3. Set run command: `npm start`
4. Add environment variables

### Self-Hosted (Docker)

Create a `Dockerfile`:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

Build and run:
\`\`\`bash
docker build -t rehash-app .
docker run -p 3000:3000 --env-file .env rehash-app
\`\`\`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret!) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI API key for Gemini |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Dev only | Local redirect URL (http://localhost:3000) |

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify Node.js version is 18+
- Review build logs for specific errors

### Authentication Not Working
- Verify Supabase redirect URLs include your deployment URL
- Check email confirmation settings in Supabase
- Ensure cookies are enabled

### File Upload Fails
- Verify Supabase Storage bucket exists
- Check CORS settings in Supabase
- Ensure storage policies allow authenticated uploads

### AI Processing Fails
- Verify Google AI API key is valid
- Check API quota limits
- Review server logs for detailed errors
