# 🚀 Testing & Vercel Deployment Guide

---

## Part 1: Browser Testing (Local)

### Step 1: Start Frontend Development Server

```bash
cd /Users/macbook/projects/project\ MC/MC/mc_frontend
npm run dev
```

**Output akan menunjukkan:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  press h + enter to show help
```

**Note:** Port bisa 5173, 5174, atau 5175 tergantung availability

### Step 2: Setup MetaMask untuk opBNB Testnet

1. **Buka MetaMask** → Click network dropdown (top left)
2. **Click "Add network"** → **Add a network manually**
3. **Isi form:**
   ```
   Network Name: opBNB Testnet
   New RPC URL: https://opbnb-testnet-rpc.bnbchain.org
   Chain ID: 5611
   Currency Symbol: BNB
   Block Explorer URL: https://testnet.opbnbscan.com
   ```
4. **Click Save**
5. **Switch ke opBNB Testnet** dari dropdown

### Step 3: Get opBNB Test Tokens

1. Buka: https://www.opbnb.com/bridge
2. Click **"Send"** (Send from BNB Chain testnet to opBNB testnet)
3. Isi:
   - From: BNB Chain Testnet (Sepolia)
   - To: opBNB Testnet
   - Amount: Minimal 0.1 BNB
4. Click "Send"
5. Tunggu 1-2 menit untuk receive di opBNB testnet

### Step 4: Test Dashboard

**URL:** `http://localhost:5174` (atau port yang muncul)

#### ✅ Checklist Testing:

```
Dashboard:
- [ ] Page load tanpa error
- [ ] "Connect Wallet" button visible
- [ ] Click connect → MetaMask popup muncul
- [ ] Wallet connected (address shows di top right)
- [ ] Network shows "opBNB Testnet"

Dashboard Content:
- [ ] "MynnGift" menu visible
- [ ] Click MynnGift → Menu opens
- [ ] Overview tab shows:
    - [ ] User level from contract
    - [ ] Rank value
    - [ ] Total Income
    - [ ] Total Donation
  
MynnGift Visualization:
- [ ] Stream A tab → Shows rank circles
- [ ] Donor slots display correctly (e.g., 2/6)
- [ ] Donation values show (0.0081 opBNB)
- [ ] If Level 8: Stream B tab visible
    - [ ] Donation values 11.56x higher
    - [ ] Slot counts correct

History Tab:
- [ ] Shows transaction history
- [ ] Shows "Menunggu data transaksi..." if no history
- [ ] Historical events display with:
    - [ ] Transaction type (Donated)
    - [ ] Rank number
    - [ ] Stream (A or B)
    - [ ] Amount in opBNB
```

### Step 5: Test Real Transaction

1. **Make donation** (manual atau via MynnCrypt → upgrade level)
2. **Check History tab** → Transaction should appear in real-time
3. **Check Dashboard** → Income/Donation values should update

### Step 6: Debug if Issues

**Open Browser Console (F12)**

```javascript
// Check if contract addresses loaded
console.log(import.meta.env.VITE_MYNNCRYPT_ADDRESS)
console.log(import.meta.env.VITE_MYNNGIFT_ADDRESS)

// Check wagmi config
console.log(window.wagmi) // if available
```

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| "Network not found" | Switch MetaMask to opBNB Testnet manually |
| "Contract not found" | Check contract addresses di `.env` file |
| "No wallet balance" | Claim opBNB dari faucet |
| "RPC error" | Try different RPC endpoint |
| Page shows localhost:5173 | Use that port instead |

---

## Part 2: Vercel Deployment

### Step 1: Create Vercel Account

1. Buka: https://vercel.com
2. Click **"Sign Up"**
3. Pilih **"Continue with GitHub"** (recommended)
4. Authorize dan selesaikan setup

### Step 2: Prepare Frontend for Vercel

Edit `mc_frontend/package.json`:

```json
{
  "name": "mynncrypt-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  ...
}
```

Build locally dulu untuk verify:

```bash
cd mc_frontend
npm run build
```

**Should output:**
```
✓ 1234 modules transformed
dist/index.html
dist/assets/app-xxxxx.js
...
```

### Step 3: Push ke GitHub

Jika belum ada repo:

```bash
cd /Users/macbook/projects/project\ MC/MC
git init
git add .
git commit -m "Initial commit - MynnGift testnet ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/project-mc.git
git push -u origin main
```

### Step 4: Create Vercel Project

**Opsi 1: Import dari GitHub (RECOMMENDED)**

1. Buka https://vercel.com/new
2. Click **"Import Git Repository"**
3. Paste GitHub repo URL:
   ```
   https://github.com/YOUR_USERNAME/project-mc.git
   ```
4. Click **"Import"**
5. Vercel akan auto-detect Vite project

**Opsi 2: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd mc_frontend
vercel
```

Follow prompts:
```
? Set up and deploy "~/project-mc/mc_frontend"? [Y/n] y
? Which scope do you want to deploy to? YOUR_ACCOUNT
? Link to existing project? [y/N] n
? What's your project's name? mynncrypt-ui
? In which directory is your code located? ./
? Want to modify these settings? [y/N] n
```

### Step 5: Configure Environment Variables di Vercel

1. Buka Vercel dashboard → Your project
2. Click **Settings** → **Environment Variables**
3. Add variables:

   ```
   VITE_MYNNCRYPT_ADDRESS = 0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE
   VITE_MYNNGIFT_ADDRESS = 0x82682F273a26Bbf5c6bD3BC267fc14c3E4D231f6
   VITE_WALLETCONNECT_PROJECT_ID = acdd07061043065cac8c0dbe90363982
   VITE_NETWORK_ID = 5611
   VITE_PLATFORM_WALLET = 0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B
   ```

4. Click **Save**
5. Redeploy:
   - Click **Deployments** → **Latest** → **Redeploy**

### Step 6: Configure Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add domain:
   ```
   mynncrypt.com
   mynngift.app
   dll
   ```
3. Follow DNS setup instructions

### Step 7: Verify Deployment

1. Vercel akan auto-generate URL:
   ```
   https://mynncrypt-ui.vercel.app
   ```

2. Click URL dan test:
   - [ ] Page loads
   - [ ] Wallet connect works
   - [ ] Dashboard functional
   - [ ] MynnGift menu works
   - [ ] opBNB Testnet detected

### Step 8: Setup Auto-Deploy

**Default:** Vercel auto-deploy on push to main branch

**To disable auto-deploy:**
1. Settings → Git
2. Uncheck **"Automatic Deployments"**

---

## 📋 Quick Reference

### Local Development:
```bash
cd mc_frontend
npm install      # Install dependencies (jika belum)
npm run dev      # Start server → http://localhost:5174
npm run build    # Build for production
```

### Vercel Commands:
```bash
vercel login                # Login ke Vercel account
vercel                      # Deploy current folder
vercel --prod               # Deploy to production
vercel env pull             # Pull env variables
vercel env add NAME value   # Add env variable
```

### Environment Variables Needed:

**Frontend (.env / Vercel):**
```
VITE_MYNNCRYPT_ADDRESS=0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE
VITE_MYNNGIFT_ADDRESS=0x82682F273a26Bbf5c6bD3BC267fc14c3E4D231f6
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **opBNB Faucet:** https://www.opbnb.com/bridge
- **Testnet Explorer:** https://testnet.opbnbscan.com
- **MetaMask:** https://metamask.io

---

## ✅ Deployment Checklist

```
LOCAL TESTING:
- [ ] npm run dev works
- [ ] Page loads at localhost:5174
- [ ] MetaMask connects
- [ ] Dashboard shows data
- [ ] MynnGift menu functional
- [ ] History tab works
- [ ] No console errors

VERCEL DEPLOYMENT:
- [ ] GitHub repo created & pushed
- [ ] Vercel project created
- [ ] Env variables added
- [ ] Build successful
- [ ] URL accessible
- [ ] Wallet connect works
- [ ] Dashboard functional
- [ ] No 404 errors

POST-DEPLOYMENT:
- [ ] Share Vercel URL
- [ ] Test on mobile
- [ ] Verify environment variables
- [ ] Check console for errors
```

---

## Troubleshooting

### Build Error: "Module not found"
```bash
# Clear node_modules
rm -rf node_modules
npm install
npm run build
```

### Env Variables Not Loading
```bash
# Check .env file
cat .env

# Rebuild locally
npm run build

# Or redeploy on Vercel
```

### MetaMask Not Detecting Network
- Manually add opBNB Testnet ke MetaMask
- Clear MetaMask cache
- Restart browser

### Slow Performance on Vercel
- Check network tab (F12)
- Verify RPC endpoint responsive
- Consider using NodeReal RPC instead of public

---

Ready? Start dengan **Step 1** untuk browser testing! 🚀
