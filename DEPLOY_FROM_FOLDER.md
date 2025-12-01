# 📁 Deploy Directly from Folder

## ✅ Yes! You Can Deploy from Folder

You have **3 options** to deploy directly:

---

## 🚀 Option 1: Netlify CLI (Easiest)

Deploy the built folder directly using Netlify CLI.

### **Step 1: Build Locally**

```bash
cd client
npm install
npm run build
cd ..
```

### **Step 2: Deploy Built Folder**

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the build folder
netlify deploy --prod --dir=client/build
```

**That's it!** Your site will be deployed directly from the folder.

---

## 🚀 Option 2: Drag & Drop (Manual)

Deploy by dragging the build folder to Netlify.

### **Step 1: Build Locally**

```bash
cd client
npm install
npm run build
cd ..
```

### **Step 2: Drag & Drop**

1. Go to: https://app.netlify.com/drop
2. Drag the `client/build` folder
3. Wait for upload
4. **Done!** Your site is live!

**Note:** This creates a new site. To update existing site, use Option 1 or 3.

---

## 🚀 Option 3: Netlify CLI Deploy (Update Existing Site)

Deploy to your existing `cleanleaf` site.

### **Step 1: Build Locally**

```bash
cd client
npm install
npm run build
cd ..
```

### **Step 2: Link to Existing Site**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to existing site
netlify link

# Select: cleanleaf
```

### **Step 3: Deploy**

```bash
netlify deploy --prod --dir=client/build
```

**Done!** Your existing site is updated.

---

## 🎯 Recommended: Option 1 (Netlify CLI)

**Easiest and fastest!**

Just run:
```bash
cd client
npm install
npm run build
cd ..
netlify deploy --prod --dir=client/build
```

---

## 📋 Quick Script

I'll create a script that does everything automatically!

