# 🔧 Supabase Production Configuration

## After You Get Your Vercel URL

Once your app is deployed to Vercel, you'll get a URL like:
```
https://rehash-app-xyz123.vercel.app
```

Follow these steps to configure Supabase for production:

---

## Step 1: Update Authentication URLs

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Sidebar: Authentication → URL Configuration

3. **Set Site URL**
   - Replace `http://localhost:3000` with your Vercel URL:
   ```
   https://rehash-app-xyz123.vercel.app
   ```

4. **Add Redirect URLs**
   - Click "Add redirect URL"
   - Add these patterns (replace with your actual URL):
   ```
   https://rehash-app-xyz123.vercel.app/**
   https://rehash-app-xyz123.vercel.app/auth/callback
   https://rehash-app-xyz123.vercel.app/login
   https://rehash-app-xyz123.vercel.app/signup
   ```

5. **Save Changes**
   - Click "Save" at the bottom

---

## Step 2: Verify Storage Configuration

1. **Check Storage Bucket Exists**
   - Go to: Storage → Buckets
   - Ensure `uploads` bucket exists

2. **Verify Storage Policies**
   - Click on `uploads` bucket
   - Go to "Policies" tab
   - Should have policies for:
     - ✅ Authenticated users can upload
     - ✅ Authenticated users can read their own files
     - ✅ Authenticated users can delete their own files

3. **Update CORS (if needed)**
   - Go to: Storage → Configuration
   - Add your Vercel domain to allowed origins:
   ```
   https://rehash-app-xyz123.vercel.app
   ```

---

## Step 3: Test Email Configuration

1. **Check Email Settings**
   - Go to: Authentication → Email Templates
   - Verify templates use correct URLs

2. **Update Confirmation Email**
   - Click "Confirm signup" template
   - Ensure confirmation link uses: `{{ .SiteURL }}`
   - This will automatically use your production URL

3. **Test Email Delivery**
   - Create a test account on your live site
   - Check you receive confirmation email
   - Click confirmation link - should redirect to your Vercel URL

---

## Step 4: Configure Database (if needed)

1. **Check RLS Policies**
   - Go to: Authentication → Policies
   - Verify all tables have RLS enabled:
     - ✅ `notes`
     - ✅ `flashcards`
     - ✅ `video_essay_segments`
     - ✅ `folders`
     - ✅ `user_view_preferences`

2. **Test Policies**
   - Try creating a note on production
   - Ensure you can only see your own data

---

## Step 5: Custom Domain (Optional)

If you want to use your own domain:

### In Vercel:
1. Go to: Project → Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Configure DNS as instructed

### In Supabase:
1. Update Site URL to your custom domain
2. Update Redirect URLs to include custom domain:
   ```
   https://app.yourdomain.com/**
   ```

---

## Verification Checklist

After configuring, test these:

- [ ] Sign up with new account (test email confirmation)
- [ ] Log in and log out
- [ ] Upload an image
- [ ] Upload a text file
- [ ] Create a note
- [ ] Generate flashcards
- [ ] Create a video essay
- [ ] Test folder creation
- [ ] Export a note
- [ ] Test all major features

---

## Common Issues & Fixes

### "Invalid Redirect URL" Error
**Problem**: User sees error during login/signup
**Fix**: Add the exact URL to Supabase redirect URLs list

### Email Confirmation Links Don't Work
**Problem**: Clicking email link shows error
**Fix**: Update Site URL in Supabase to match your Vercel URL

### Files Won't Upload
**Problem**: Upload fails with CORS or policy error
**Fix**: 
1. Check storage policies allow authenticated uploads
2. Add Vercel domain to CORS allowed origins
3. Verify bucket exists and is public or has correct policies

### Can See Other Users' Data
**Problem**: Security issue - RLS not working
**Fix**: 
1. Verify RLS is enabled on all tables
2. Check policies are using `auth.uid()` correctly
3. Re-run SQL scripts if needed

---

## Production vs Development

### Development (`http://localhost:3000`)
- Uses `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` env var
- Can test locally with real Supabase data
- Email confirmations redirect to localhost

### Production (Vercel URL)
- Uses `window.location.origin` automatically
- No dev redirect URL needed
- Email confirmations redirect to production site

---

## Security Best Practices

1. **Never expose Service Role Key**
   - Only use in server-side code
   - Never send to client
   - Keep in Vercel environment variables only

2. **Use RLS (Row Level Security)**
   - Enable on all user data tables
   - Test that users can't access others' data

3. **Validate on Server**
   - Don't trust client-side validation only
   - Use server actions for sensitive operations

4. **Regular Security Audits**
   - Check Supabase logs for unusual activity
   - Review Vercel function logs
   - Monitor API usage

---

## Monitoring

### Vercel
- View deployment logs: Vercel Dashboard → Deployments
- Function logs: Click deployment → View Function Logs
- Analytics: Enable Vercel Analytics (free)

### Supabase
- Database logs: Supabase → Logs → Database
- Auth logs: Supabase → Logs → Auth
- Storage logs: Supabase → Logs → Storage

---

## Rollback Plan

If something goes wrong:

1. **Revert Deployment**
   - Go to Vercel → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Restore Supabase Settings**
   - Change Site URL back if needed
   - Verify redirect URLs

3. **Check Environment Variables**
   - Ensure all are set correctly
   - Redeploy if needed

---

**After completing these steps, your app should be fully configured for production!** ✅

