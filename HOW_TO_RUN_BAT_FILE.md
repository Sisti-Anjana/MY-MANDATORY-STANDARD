# 🔧 How to Run .bat File (If It Opens in VS Code)

## ⚠️ Problem
When you double-click `REDEPLOY.bat`, it opens in VS Code instead of running.

## ✅ Solution: Use Command Prompt

### Method 1: Right-Click Menu (Easiest)

1. **Right-click** on `REDEPLOY.bat`
2. Select **"Run as administrator"** (or just **"Run"**)
3. Click **"Yes"** if Windows asks for permission
4. The script will run in a command window!

---

### Method 2: From Command Prompt

1. **Press `Windows Key + R`**
2. Type: `cmd`
3. Press **Enter**

4. **Navigate to your folder:**
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
   ```
   Press Enter

5. **Run the script:**
   ```bash
   REDEPLOY.bat
   ```
   Press Enter

---

### Method 3: From File Explorer Address Bar

1. **Open File Explorer**
2. Navigate to the folder containing `REDEPLOY.bat`
3. **Click in the address bar** at the top
4. Type: `cmd`
5. Press **Enter**
6. Type: `REDEPLOY.bat`
7. Press **Enter**

---

### Method 4: Run Commands Directly

Instead of using the .bat file, run these commands directly:

1. **Open Command Prompt** (Windows Key + R → type `cmd` → Enter)

2. **Navigate to folder:**
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
   ```

3. **Build:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## 🎯 Recommended: Method 1 (Right-Click)

**Just right-click on `REDEPLOY.bat` → "Run as administrator"**

That's the easiest way!

