# 🚀 Quick Start: Deploy to Netlify

## ⚡ Fastest Method (5 minutes)

### Option A: Using the Batch Script (Windows)
1. Double-click `DEPLOY_TO_NETLIFY.bat`
2. Follow the on-screen prompts
3. Done! 🎉

### Option B: Manual Steps

#### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. Build Your App
```bash
cd client
npm install
npm run build
cd ..
```

#### 3. Login to Netlify
```bash
netlify login
```

#### 4. Initialize & Deploy
```bash
netlify init
```
When prompted:
- Create new site? **Y**
- Site name: `portfolio-issue-tracking` (or your choice)
- Build command: `cd client && npm install && npm run build`
- Publish directory: `client/build`

#### 5. Set Environment Variables
```bash
netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8"
```

#### 6. Deploy to Production
```bash
netlify deploy --prod
```

---

## 📋 Alternative: Deploy via Netlify Dashboard

1. **Build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Go to:** https://app.netlify.com/drop
3. **Drag & drop** the `client/build` folder
4. **Configure:**
   - Site settings → Build & deploy
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `client/build`
5. **Add environment variables:**
   - Site settings → Environment variables
   - Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
6. **Redeploy** from Deploys tab

---

## ✅ Verify Deployment

After deployment, check:
- [ ] App loads without errors
- [ ] Login works (user & admin)
- [ ] Dashboard displays portfolios
- [ ] Can log issues
- [ ] No console errors

---

## 🔧 Troubleshooting

**Build fails?**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment variables not working?**
- Make sure they start with `REACT_APP_`
- Redeploy after adding variables
- Check Netlify build logs

**Need help?** See `DEPLOY_TO_NETLIFY_COMPLETE.md` for detailed guide.

