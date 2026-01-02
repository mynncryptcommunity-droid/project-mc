# 🚀 OPBNB MAINNET DEPLOYMENT STEP-BY-STEP GUIDE

**Status:** Ready for Execution
**Network:** opBNB Mainnet (Chain ID: 204)
**Expected Duration:** 30-45 minutes

---

## ⚠️ BEFORE YOU START

### DO THIS FIRST:
1. ✅ Complete all items in [MAINNET_PREPARATION_CHECKLIST.md](MAINNET_PREPARATION_CHECKLIST.md)
2. ✅ Have 2 BNB in deployer account
3. ✅ Have mainnet owner address ready
4. ✅ Have private key in `.env` file
5. ✅ NO console should run hardhat local node

---

## STEP 1: PREPARE ENVIRONMENT (5 minutes)

### 1.1 Navigate to Backend
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_backend
```

### 1.2 Create/Update `.env` File
```bash
# Check if .env exists
ls -la .env

# If not exists, create it:
cat > .env << 'EOF'
# Mainnet Deployment
PRIVATE_KEY=0xyour_deployer_private_key_here
MAINNET_OWNER_ADDRESS=0xyour_owner_address_here
MAINNET_PLATFORM_WALLET=0xyour_platform_wallet_here
OPBNBSCAN_API_KEY=your_opbnbscan_api_key_here

# Optional: Multiple keys for multi-sig
OWNER_PRIVATE_KEY=0xyour_owner_private_key_if_different
EOF
```

### 1.3 Verify Network Config
```bash
# Check hardhat.config.ts for opbnb network
grep -A5 "opbnb:" hardhat.config.ts

# Should show:
# opbnb: {
#   url: "https://opbnb-mainnet-rpc.bnbchain.org",
#   accounts: [...],
#   chainId: 204
# }
```

**If missing**, add to `hardhat.config.ts`:
```typescript
opbnb: {
  url: "https://opbnb-mainnet-rpc.bnbchain.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 204,
},
```

### 1.4 Verify Deployer Account Balance
```bash
# Using node.js
node -e "
const balance = require('web3').utils.fromWei('2000000000000000000', 'ether');
console.log('Required balance: 2 BNB');
console.log('Your balance should be >= 2 BNB');
"
```

Or check on OpBNBScan:
1. Go to https://www.opbnbscan.com
2. Paste deployer address in search
3. Verify balance >= 2 BNB

---

## STEP 2: UPDATE DEPLOYMENT SCRIPT (5 minutes)

### 2.1 Review [scripts/deploy.ts](scripts/deploy.ts)
```bash
cat scripts/deploy.ts | head -50
```

### 2.2 Verify Constructor Parameters

Check that these values are set:
```typescript
const DEFAULT_REFERRAL_ID = "A8888NR";
const OWNER_ADDRESS = process.env.MAINNET_OWNER_ADDRESS || deployer.address;
const PLATFORM_WALLET = process.env.MAINNET_PLATFORM_WALLET;
const MYNNGIFT_WALLET = deployer.address; // Or specific address
```

**If different**, edit the file:
```bash
# Backup first
cp scripts/deploy.ts scripts/deploy.ts.bak

# Edit
nano scripts/deploy.ts
# Or use your editor to update these variables
```

### 2.3 Verify Contract Initialization
Ensure the initialization sets up:
- ✅ Default referral = A8888NR
- ✅ Owner correctly assigned
- ✅ Platform wallet correctly assigned
- ✅ Layer 1 setup for default referral

---

## STEP 3: DEPLOY TO MAINNET (10-15 minutes)

### 3.1 Execute Deployment
```bash
# Make sure you're in backend directory
cd /Users/macbook/projects/project\ MC/MC/mc_backend

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network opbnb
```

### 3.2 Wait for Completion
You'll see output like:
```
Deploying MynnGift...
MynnGift deployed to: 0x...
Deploying MynnCrypt...
MynnCrypt deployed to: 0x...
Setting MynnGift address in MynnCrypt...
Deployment completed successfully!
Frontend .env updated!
```

### 3.3 Save Deployment Info
**⚠️ IMPORTANT: Copy and save this information!**

```
=== MAINNET DEPLOYMENT INFO ===
Date: 2026-01-02
Network: opBNB Mainnet (Chain ID: 204)

MynnCrypt Address:    0x_________________________
MynnGift Address:     0x_________________________
Deployer Address:     0x_________________________
Owner Address:        0x_________________________
Platform Wallet:      0x_________________________

Transaction Hash:     0x_________________________
Block Number:         _________________________
Gas Used:             _________________________

Default Referral:     A8888NR
Initial Owner Level:  1

=== END INFO ===
```

Store this in a safe place (password manager, encrypted file, etc.)

---

## STEP 4: VERIFY DEPLOYMENT ON CHAIN (5 minutes)

### 4.1 Check on OpBNBScan

1. **Go to:** https://www.opbnbscan.com
2. **Search for MynnCrypt address** (from Step 3.3)
3. **Verify:**
   - ✅ Contract exists
   - ✅ Code is verified (if you did verification)
   - ✅ No errors in deployment

### 4.2 Read Contract Data
On OpBNBScan, click "Read Contract" and verify:

```
Function: getDefaultRefer()
Expected Result: A8888NR

Function: totalUsers()
Expected Result: 1 (the initial owner)

Function: getPlatformIncome()
Expected Result: 0 (no income yet)
```

### 4.3 Check MynnGift Contract
1. Search for MynnGift address
2. Verify contract exists
3. Check constructor parameters

---

## STEP 5: UPDATE FRONTEND (5 minutes)

### 5.1 Navigate to Frontend
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_frontend
```

### 5.2 Create `.env.mainnet`
```bash
cat > .env.mainnet << 'EOF'
# Mainnet Contract Addresses (from Step 3.3)
VITE_MYNNCRYPT_ADDRESS=0x_from_deployment_
VITE_MYNNGIFT_ADDRESS=0x_from_deployment_

# Mainnet Network Config
VITE_NETWORK_ID=204
VITE_CHAIN_NAME=opBNB Mainnet
VITE_RPC_URL=https://opbnb-mainnet-rpc.bnbchain.org
VITE_EXPLORER_URL=https://www.opbnbscan.com
VITE_EXPLORER_API=https://api.opbnbscan.com/api

# Wallet Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_PLATFORM_WALLET=0x_your_platform_wallet_

# Feature Flags
VITE_ENABLE_TESTNET_WARNING=false
VITE_ENVIRONMENT=mainnet
VITE_ENABLE_ADMIN_FUNCTIONS=true
EOF
```

### 5.3 Update `.env` (or use `.env.mainnet`)
Option A: Update main .env
```bash
cp .env .env.testnet.backup
cat .env.mainnet > .env
```

Option B: Use multiple .env files (better practice)
```bash
# Keep .env.mainnet separate
# Update build scripts to use it
```

### 5.4 Verify Frontend Config
```bash
# Check .env has correct addresses
cat .env | grep VITE_MYNNCRYPT_ADDRESS
cat .env | grep VITE_MYNNGIFT_ADDRESS
cat .env | grep VITE_RPC_URL
cat .env | grep VITE_NETWORK_ID

# Should show:
# VITE_MYNNCRYPT_ADDRESS=0x...
# VITE_MYNNGIFT_ADDRESS=0x...
# VITE_RPC_URL=https://opbnb-mainnet-rpc.bnbchain.org
# VITE_NETWORK_ID=204
```

### 5.5 Update Admin Wallets
Edit [src/config/adminWallets.js](src/config/adminWallets.js):

```javascript
// Update PRODUCTION_WALLETS
const PRODUCTION_WALLETS = {
  owner: [
    '0xyour_mainnet_owner_address_1',
    '0xyour_mainnet_owner_address_2'  // optional
  ],
  investor: [
    // Add investor addresses if needed
  ]
};
```

---

## STEP 6: BUILD PRODUCTION (5 minutes)

### 6.1 Install Dependencies (if needed)
```bash
npm install
```

### 6.2 Build Production Bundle
```bash
npm run build
```

**Wait for completion. Should see:**
```
✓ 1234 modules transformed
✓ built in 45.23s
dist/index.html          15.5 kB
dist/assets/index-abc.js 450.2 kB
...
```

### 6.3 Preview Build Locally
```bash
npm run preview
```

**Check:**
- ✅ Opens at http://localhost:4173
- ✅ Page loads without errors
- ✅ No 404 errors in console
- ✅ MetaMask can connect

### 6.4 Test with MetaMask

1. **Open http://localhost:4173**
2. **Switch MetaMask to opBNB Mainnet**
   - If not in list, add:
     - RPC: https://opbnb-mainnet-rpc.bnbchain.org
     - Chain ID: 204
     - Currency: BNB
3. **Click "Join Now"**
4. **Verify:**
   - ✅ Contract addresses show in console
   - ✅ MetaMask connects
   - ✅ No errors about contracts

---

## STEP 7: DEPLOY TO PRODUCTION (varies)

### Option A: Deploy to Vercel (Recommended)

See [GITHUB_VERCEL_SETUP.md](GITHUB_VERCEL_SETUP.md) for complete guide.

**Quick steps:**
```bash
# 1. Commit changes
git add -A
git commit -m "chore: mainnet deployment and configuration"
git push origin main

# 2. Vercel auto-deploys (if setup)
# Or manual deploy:
npm install -g vercel
vercel --prod
```

### Option B: Deploy to Your Own Server

```bash
# Build
npm run build

# Copy dist folder to your server
scp -r dist/* your_server:/var/www/mynngift/

# Update web server config (nginx/apache)
# Point to dist/index.html for SPA routing
```

### Option C: Deploy to AWS/GCP/DigitalOcean

Follow your cloud provider's deployment guide.

---

## STEP 8: POST-DEPLOYMENT VERIFICATION (10 minutes)

### 8.1 Check Contract on Chain
```bash
# Visit mainnet explorer
# https://www.opbnbscan.com/address/0xyourcontract
```

Verify:
- ✅ Contract exists
- ✅ Balance shows transfers
- ✅ Transactions visible

### 8.2 Test Frontend
1. **Visit your deployed URL** (Vercel, server, etc.)
2. **Connect wallet** with opBNB Mainnet
3. **Verify dashboard:**
   - ✅ No 404 errors
   - ✅ Contract addresses correct
   - ✅ Network shows 204 (opBNB)
4. **Test registration flow** (with very small amount)
5. **Check transaction** on OpBNBScan

### 8.3 Monitor Logs
```bash
# If Vercel:
# Visit Vercel Dashboard → Functions/Logs

# If Self-hosted:
# Check nginx/app logs
tail -f /var/log/nginx/error.log
tail -f /var/log/app.log
```

### 8.4 Setup Monitoring
- [ ] Setup Sentry for error tracking
- [ ] Setup LogRocket for user sessions
- [ ] Setup Datadog for performance
- [ ] Setup PagerDuty for alerts

---

## ✅ FINAL CHECKLIST

Before you celebrate:

- [ ] Contracts deployed to mainnet
- [ ] Contracts verified on OpBNBScan
- [ ] Frontend deployed and working
- [ ] MetaMask connections work
- [ ] Dashboard shows correct network (204)
- [ ] Contract addresses correct in frontend
- [ ] Admin wallets configured
- [ ] Monitoring setup
- [ ] Backup of deployment info saved
- [ ] Team notified

---

## 🆘 TROUBLESHOOTING

### Issue: "Insufficient funds for gas"
```bash
# Solution: Add more BNB to deployer account
# Check balance on OpBNBScan
# Should be >= 2 BNB
```

### Issue: "Invalid RPC response"
```bash
# Solution: Check RPC endpoint
# Verify: https://opbnb-mainnet-rpc.bnbchain.org

# Or use alternative RPC:
# https://opbnb-rpc.bnbchain.org/http
```

### Issue: "Contract not found on OpBNBScan"
```bash
# Give it 2-3 minutes for indexing
# Check chain ID matches (204)
# Verify contract address is correct
```

### Issue: "MetaMask says wrong network"
```bash
# Add opBNB Mainnet manually:
# RPC: https://opbnb-mainnet-rpc.bnbchain.org
# Chain ID: 204
# Symbol: BNB
```

### Issue: "Frontend shows old contract addresses"
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
# Check .env was updated
# Rebuild: npm run build
```

---

## 📝 DEPLOYMENT SIGN-OFF

**I confirm:**
- ✅ All checks completed
- ✅ Contracts deployed successfully
- ✅ Frontend working correctly
- ✅ Monitoring in place
- ✅ Emergency procedures documented

**Date:** ________________
**Deployer:** ________________
**Owner Approval:** ________________

---

## 📞 EMERGENCY CONTACTS

**If something goes wrong:**

1. **Check logs** for error messages
2. **Verify network** is opBNB Mainnet (404)
3. **Verify contract addresses** are correct
4. **Verify wallet** has BNB for gas
5. **Contact technical support** if still stuck

---

**Congratulations on mainnet deployment! 🎉**

Next step: Monitor and gather user feedback.
