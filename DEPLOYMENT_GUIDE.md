# 🚀 Complete Deployment Guide for Portfolio Issue Tracking System

## 📋 Pre-Deployment Checklist

- ✅ Supabase database is set up and running
- ✅ All database tables are created (run `DATABASE_SETUP.sql` in Supabase)
- ✅ Environment variables are configured
- ✅ Application works locally

---

## 🎯 **OPTION 1: VERCEL DEPLOYMENT (RECOMMENDED)**

### Why Vercel?
- ✅ **FREE tier available**
- ✅ **Automatic deployments** from GitHub
- ✅ **Global CDN** for fast performance
- ✅ **Perfect for React apps**
- ✅ **Easy environment variable management**
- ✅ **Custom domain support**

### Step-by-Step Deployment:

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Navigate to Your Project**
```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc"
```

#### **4. Deploy to Vercel**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name: `portfolio-issue-tracking`
- In which directory is your code? `./client`
- Override settings? **N**

#### **5. Set Environment Variables in Vercel**

After deployment, go to your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   - `REACT_APP_SUPABASE_URL` = `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8`

3. Redeploy the application

#### **6. Deploy from GitHub (Alternative - Recommended for updates)**

1. **Create a GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository (e.g., `portfolio-issue-tracking`)

2. **Push your code to GitHub**
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracking.git
   git push -u origin main
   ```

3. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `build`
   - Add environment variables
   - Click "Deploy"

---

## 🌐 **OPTION 2: NETLIFY DEPLOYMENT**

### Step-by-Step:

#### **1. Install Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **2. Login to Netlify**
```bash
netlify login
```

#### **3. Build Your Application**
```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc\client"
npm install
npm run build
```

#### **4. Deploy to Netlify**
```bash
netlify deploy --prod
```

When prompted:
- Choose "Create & configure a new site"
- Site name: `portfolio-issue-tracking`
- Publish directory: `build`

#### **5. Set Environment Variables**
```bash
netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8"
```

#### **6. Redeploy**
```bash
netlify deploy --prod
```

---

## 🖥️ **OPTION 3: TRADITIONAL HOSTING (VPS/cPanel)**

### For VPS (Ubuntu/Linux):

#### **1. Connect to Your Server**
```bash
ssh your_username@your_server_ip
```

#### **2. Install Node.js and npm**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **3. Install Nginx**
```bash
sudo apt update
sudo apt install nginx
```

#### **4. Upload Your Code**
Use FileZilla or SCP:
```bash
scp -r "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc" your_username@your_server_ip:/var/www/
```

#### **5. Build the Application**
```bash
cd /var/www/3\ Hlsc/client
npm install
npm run build
```

#### **6. Configure Nginx**
Create a new configuration:
```bash
sudo nano /etc/nginx/sites-available/portfolio-tracker
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    root /var/www/3 Hlsc/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **7. Enable the Site**
```bash
sudo ln -s /etc/nginx/sites-available/portfolio-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **8. Set Up SSL (Optional but Recommended)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

### For cPanel Hosting:

1. **Build Locally**
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc\client"
   npm install
   npm run build
   ```

2. **Upload Build Folder**
   - Go to cPanel File Manager
   - Navigate to `public_html`
   - Upload all files from `client/build` folder
   - Upload `.htaccess` file (see below)

3. **Create .htaccess**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_FILENAME} !-l
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## ⚙️ **Post-Deployment Configuration**

### 1. **Update Supabase CORS Settings**

In your Supabase dashboard:
1. Go to Project Settings → API
2. Add your deployment URL to allowed origins

### 2. **Test Your Deployment**

Visit your deployed URL and test:
- ✅ Dashboard loads
- ✅ Can view portfolios
- ✅ Can log issues
- ✅ Can edit issues
- ✅ Charts display correctly
- ✅ User filtering works
- ✅ CSV export functions

### 3. **Set Up Custom Domain (Optional)**

#### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

#### For Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Follow DNS configuration instructions

---

## 🔒 **Security Considerations**

### 1. **Environment Variables**
- ✅ Never commit `.env` files to Git
- ✅ Use platform-specific environment variable management
- ✅ Rotate Supabase keys if exposed

### 2. **Supabase Security**
Enable Row Level Security (RLS) in Supabase:

```sql
-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY "Allow public read access" ON issues
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON issues
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. **Add Authentication (Recommended)**
Consider adding Supabase Auth for production:
```bash
npm install @supabase/auth-helpers-react
```

---

## 📊 **Monitoring & Maintenance**

### 1. **Set Up Analytics**
- Add Google Analytics
- Use Vercel Analytics (free)
- Monitor Supabase usage

### 2. **Error Tracking**
Consider integrating:
- Sentry (error tracking)
- LogRocket (session replay)

### 3. **Performance Monitoring**
- Use Lighthouse scores
- Monitor Core Web Vitals
- Check Supabase query performance

---

## 🐛 **Troubleshooting Common Issues**

### Issue: Build Fails
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules package-lock.json build
npm install
npm run build
```

### Issue: Environment Variables Not Working
- Ensure variables start with `REACT_APP_`
- Redeploy after adding variables
- Check for typos in variable names

### Issue: Blank Page After Deployment
- Check browser console for errors
- Verify Supabase credentials
- Check CORS settings in Supabase

### Issue: Routes Not Working (404)
- Ensure SPA rewrites are configured
- Check `vercel.json` or `_redirects` file
- Verify build output directory

---

## 📞 **Support Resources**

- **Vercel Documentation**: https://vercel.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Supabase Documentation**: https://supabase.com/docs
- **React Deployment**: https://create-react-app.dev/docs/deployment

---

## ✅ **Deployment Checklist**

- [ ] Database is set up in Supabase
- [ ] Application builds successfully locally
- [ ] Environment variables are configured
- [ ] Platform account is created (Vercel/Netlify)
- [ ] Code is deployed
- [ ] Environment variables are set in platform
- [ ] Application is accessible via URL
- [ ] All features work correctly
- [ ] CORS is configured in Supabase
- [ ] Custom domain is set up (optional)
- [ ] SSL certificate is active
- [ ] Analytics are set up (optional)
- [ ] Monitoring is configured (optional)

---

## 🎉 **You're All Set!**

Your Portfolio Issue Tracking System is now deployed and ready for production use!

**Need Help?** 
- Check the troubleshooting section
- Review platform-specific documentation
- Test thoroughly before going live
