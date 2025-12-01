# 🚀 How to Run the Deployment Script

## ⚡ Quick Start - 3 Simple Steps

### Step 1: Open the File Location
1. Navigate to your project folder:
   ```
   C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy
   ```

### Step 2: Run the Script
**Option A: Double-Click (Easiest)**
- Simply **double-click** on `DEPLOY_TO_NETLIFY.bat`
- A command prompt window will open automatically

**Option B: Right-Click Menu**
- **Right-click** on `DEPLOY_TO_NETLIFY.bat`
- Select **"Run as administrator"** (recommended)

**Option C: From Command Prompt**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Navigate to your folder:
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
   ```
4. Run the script:
   ```bash
   DEPLOY_TO_NETLIFY.bat
   ```

### Step 3: Follow the Prompts
The script will guide you through:
- ✅ Checking Node.js installation
- ✅ Installing Netlify CLI
- ✅ Building your application
- ✅ Logging into Netlify (browser will open)
- ✅ Setting up the site
- ✅ Deploying to production
- ✅ Displaying your final application link

---

## 📋 What to Expect

### During Execution:
1. **Command Prompt Window Opens** - Shows progress
2. **Node.js Check** - Verifies Node.js is installed
3. **Netlify CLI Installation** - Installs if needed
4. **Building App** - Takes 1-2 minutes
5. **Browser Opens** - For Netlify login
6. **Prompts Appear** - Answer questions as shown
7. **Deployment Progress** - Shows upload status
8. **Final URL Displayed** - Your application link!

### When Prompted:
- **Create new site?** → Type `Y` and press Enter
- **Site name:** → Type `portfolio-issue-tracking` (or press Enter for default)
- **Build command:** → Press Enter (already configured)
- **Publish directory:** → Press Enter (already configured)

---

## ⚠️ Troubleshooting

### Script Won't Run?
- **Right-click** → **Properties** → Uncheck "Block" if present
- Try **"Run as administrator"**

### Node.js Not Found?
- Install Node.js from: https://nodejs.org/
- Restart your computer after installation
- Run the script again

### Build Fails?
- Make sure you're connected to the internet
- Check that all files are in the correct folders
- Try running: `cd client && npm install` manually first

### Netlify Login Issues?
- Make sure you have a Netlify account (free at https://app.netlify.com)
- Allow pop-ups in your browser
- Try logging in manually first at https://app.netlify.com

---

## ✅ Success Indicators

You'll know it worked when you see:
```
================================================
   Deployment Complete!
================================================

================================================
   YOUR APPLICATION IS NOW LIVE!
================================================

Your single application link:
https://portfolio-issue-tracking.netlify.app
```

---

## 🎉 That's It!

Once you see the final URL, your application is live and ready to use!

