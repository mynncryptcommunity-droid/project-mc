# 📚 GitHub Repository & Vercel Deployment Guide

---

## Part 1: Create GitHub Repository

### Step 1: Create GitHub Account (if needed)

1. Buka: https://github.com
2. Click **"Sign up"**
3. Isi email, password, username
4. Verify email
5. Selesai

**Username contoh:** `yourusername` (gunakan untuk push nanti)

---

### Step 2: Create New Repository di GitHub

1. Buka: https://github.com/new
2. Isi form:

```
Repository name: project-mc
Description: MynnGift Platform - Level 4/8 Referral System
☐ Public (cek ini agar bisa diakses Vercel)
☑ Add a README file
☑ Add .gitignore (pilih Node)
☐ Choose a license (skip untuk sekarang)
```

3. Click **"Create repository"**

**Result:** Repository created di `https://github.com/yourusername/project-mc`

---

### Step 3: Push Code ke GitHub

Buka terminal di folder project:

```bash
cd /Users/macbook/projects/project\ MC/MC
```

#### **3.1: Initialize Git (jika belum)**

```bash
git init
```

#### **3.2: Add Remote Origin**

```bash
git remote add origin https://github.com/yourusername/project-mc.git
```

Ganti `yourusername` dengan username GitHub kamu!

#### **3.3: Add All Files**

```bash
git add .
```

#### **3.4: Create Initial Commit**

```bash
git commit -m "Initial commit - MynnGift platform with testnet deployment"
```

#### **3.5: Rename Branch to Main**

```bash
git branch -M main
```

#### **3.6: Push ke GitHub**

```bash
git push -u origin main
```

**First time akan minta authentication:**

**Opsi A: Personal Access Token (RECOMMENDED)**

1. Buka: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Isi:
   ```
   Token name: Vercel Deployment
   Expiration: 90 days (atau sesuai kebutuhan)
   ☑ repo (semua opsi di bawah repo otomatis terchecked)
   ☑ workflow
   ☑ write:packages
   ```
4. Click **"Generate token"**
5. **COPY token** yang muncul (hanya muncul sekali!)
6. Di terminal, paste saat diminta password:
   ```
   Username: yourusername
   Password: paste_token_here
   ```

**Opsi B: GitHub CLI (lebih mudah)**

```bash
# Install GitHub CLI (jika belum)
brew install gh

# Login
gh auth login

# Then push
git push -u origin main
```

#### **Result:**
File sudah ter-push ke GitHub. Check di:
```
https://github.com/yourusername/project-mc
```

---

## Part 2: Configure GitHub Repository untuk Vercel

### Step 4: Setup .gitignore (Important!)

Buat/edit file `.gitignore` di root project:

```bash
cat > /Users/macbook/projects/project\ MC/MC/.gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Build
/dist
/build

# Environment variables (JANGAN PUSH!)
.env
.env.local
.env.*.local
.env_testnet
.env_mainnet

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.cache
*.tgz
.turbo/
EOF
```

**Push update:**

```bash
cd /Users/macbook/projects/project\ MC/MC
git add .gitignore
git commit -m "Add .gitignore to exclude sensitive files"
git push
```

---

### Step 5: Create GitHub Personal Access Token (untuk Vercel)

1. Buka: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Isi:
   ```
   Token name: Vercel Integration
   Expiration: No expiration (atau sesuai kebutuhan)
   ☑ repo
   ☑ workflow
   ```
4. Click **"Generate token"**
5. **COPY token** (tidak bisa lihat lagi setelah close!)

---

## Part 3: Connect GitHub ke Vercel

### Step 6: Create Vercel Account

1. Buka: https://vercel.com
2. Click **"Sign Up"**
3. Pilih **"Continue with GitHub"**
4. Click **"Authorize Vercel"**
5. Selesai

---

### Step 7: Import GitHub Repo ke Vercel

1. Buka Vercel dashboard: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with GitHub"**

Jika GitHub repo belum terlihat:
- Click **"Configure GitHub App"**
- Select **"Only select repositories"**
- Choose `project-mc`
- Click **"Install & Authorize"**

4. Select repo: `yourusername/project-mc`
5. Click **"Import"**

---

### Step 8: Configure Vercel Project Settings

#### **8.1: Select Root Directory**

```
Root Directory: ./mc_frontend
```

(Penting! Karena Vercel deploy frontend saja, bukan backend)

#### **8.2: Build & Output**

Vercel auto-detect:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Biarkan default (Vercel sudah tahu Vite)

#### **8.3: Environment Variables**

Click **"Environment Variables"** dan add:

```
VITE_MYNNCRYPT_ADDRESS = 0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE
VITE_MYNNGIFT_ADDRESS = 0x82682F273a26Bbf5c6bD3BC267fc14c3E4D231f6
VITE_WALLETCONNECT_PROJECT_ID = acdd07061043065cac8c0dbe90363982
VITE_NETWORK_ID = 5611
VITE_RPC_URL = https://opbnb-testnet-rpc.bnbchain.org
VITE_EXPLORER_URL = https://testnet.opbnbscan.com
VITE_PLATFORM_WALLET = 0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B
```

Untuk setiap variable:
- Paste value
- Click **"Add"**

#### **Result:**
```
7 environment variables added
```

---

### Step 9: Deploy!

1. Review settings
2. Click **"Deploy"**
3. Tunggu ~2-3 menit (Vercel build & deploy)

**Vercel akan menampilkan:**
```
Deployment successful! 🎉

Your project is live at:
https://project-mc-yourusername.vercel.app
```

---

### Step 10: Verify Deployment

1. Click URL yang muncul
2. Cek:
   - [ ] Page load tanpa error
   - [ ] Wallet connect button visible
   - [ ] Dashboard functional
   - [ ] MynnGift menu works

---

## Part 4: Setup Auto-Deployment

### Step 11: Configure Auto-Deploy

Vercel **otomatis** deploy setiap kali push ke GitHub main branch.

**Untuk disable:**
1. Buka Vercel project settings
2. Click **"Git"**
3. Uncheck **"Automatic Deployments"** (jika tidak ingin auto-deploy)

### Step 12: Manual Redeploy (jika perlu)

```bash
# Di terminal, push changes
git add .
git commit -m "Update MynnGift UI"
git push

# Vercel otomatis trigger deploy
# Check di Vercel dashboard → Deployments
```

---

## 📋 Complete Workflow Example

### **First Time Setup:**

```bash
# 1. Navigate ke project
cd /Users/macbook/projects/project\ MC/MC

# 2. Initialize git
git init

# 3. Add remote (ganti USERNAME)
git remote add origin https://github.com/USERNAME/project-mc.git

# 4. Add all files
git add .

# 5. Create commit
git commit -m "Initial commit"

# 6. Rename to main
git branch -M main

# 7. Push
git push -u origin main
```

### **Subsequent Updates:**

```bash
# Make changes to code
# Then:
git add .
git commit -m "Description of changes"
git push

# Vercel automatically deploys!
```

---

## 🔒 Security Best Practices

### **DO NOT commit:**
```bash
.env              # Private keys, API keys
.env.local        # Local config
node_modules/     # Dependencies (reinstall via npm)
dist/             # Build artifacts (regenerate on deploy)
.DS_Store         # macOS files
```

### **DO commit:**
```bash
.env.example      # Template (no values)
package.json      # Dependencies list
package-lock.json # Exact versions
.gitignore        # Ignore rules
README.md         # Documentation
src/              # Source code
```

---

## 🔗 Important Links

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | https://github.com | Repository hosting |
| GitHub Settings | https://github.com/settings/tokens | Create access tokens |
| Vercel | https://vercel.com | Deployment platform |
| Vercel Dashboard | https://vercel.com/dashboard | Manage projects |

---

## ✅ Checklist

```
GITHUB:
- [ ] GitHub account created
- [ ] Repository created (project-mc)
- [ ] .gitignore configured
- [ ] Code pushed to main branch
- [ ] Repository public & accessible

VERCEL:
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported
- [ ] Root directory set to ./mc_frontend
- [ ] Environment variables added (7 total)
- [ ] Initial deployment successful
- [ ] Live URL working
- [ ] Wallet connect functional

TESTING:
- [ ] Visit Vercel URL
- [ ] Page loads without errors
- [ ] Dashboard displays
- [ ] MynnGift menu works
- [ ] No 404 errors
- [ ] Environment variables working
```

---

## Troubleshooting

### "Authentication failed"
```bash
# Use GitHub CLI instead
brew install gh
gh auth login
gh repo create project-mc --source=. --remote=origin --push
```

### "Module not found" on Vercel
```bash
# Check build logs in Vercel dashboard
# Usually: missing dependency or wrong root directory
```

### Environment variables not loading
```bash
# 1. Check .env file NOT committed
git status
git rm --cached .env  # if committed by accident

# 2. Add to Vercel settings
# 3. Redeploy
```

### Build fails with "vite not found"
```bash
# Check mc_frontend/package.json has vite
# Or install: npm install
```

---

## Next Steps After Deployment

1. **Share Vercel URL** with team/users
2. **Setup custom domain** (optional):
   - Vercel Settings → Domains
   - Add your domain (mynncrypt.com, etc)
3. **Monitor deployments**:
   - Vercel dashboard shows all deployments
   - Rollback if needed
4. **Setup analytics** (optional):
   - Vercel Web Analytics
5. **Continue development**:
   - Local: `npm run dev`
   - Push changes: `git push`
   - Auto-deploy: Vercel handles it

---

Ready? Start dengan **Part 1 Step 1**! 🚀
