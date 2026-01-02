# ✅ MAINNET PRE-DEPLOYMENT VERIFICATION CHECKLIST

**Status:** Quick Verification Before Deployment
**Estimated Time:** 15-20 minutes
**Critical:** Must complete BEFORE pressing deploy button

---

## 🔍 SECTION A: ENVIRONMENT & FILES

### A.1 Backend Environment
```bash
# Navigate to backend
cd /Users/macbook/projects/project\ MC/MC/mc_backend

# Check .env exists
[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"

# Verify .env content (don't expose keys in logs)
echo "Checking .env has required variables..."
grep -q "PRIVATE_KEY" .env && echo "✅ PRIVATE_KEY set" || echo "❌ PRIVATE_KEY missing"
grep -q "MAINNET_OWNER" .env && echo "✅ MAINNET_OWNER_ADDRESS set" || echo "❌ MAINNET_OWNER_ADDRESS missing"
grep -q "MAINNET_PLATFORM" .env && echo "✅ MAINNET_PLATFORM_WALLET set" || echo "❌ MAINNET_PLATFORM_WALLET missing"
```

### A.2 Hardhat Config
```bash
# Verify opbnb network configured
npx hardhat network-info --network opbnb

# Should output:
# ✓ Network name: opbnb
# ✓ Chain ID: 204
# ✓ RPC: https://opbnb-mainnet-rpc.bnbchain.org
```

### A.3 Deployment Script
```bash
# Check deploy.ts exists and is readable
[ -f scripts/deploy.ts ] && echo "✅ deploy.ts exists" || echo "❌ deploy.ts missing"

# Verify key parameters in deploy script
echo "Checking deploy script parameters..."
grep -q "A8888NR" scripts/deploy.ts && echo "✅ Default referral correct" || echo "⚠️  Verify default referral"
grep -q "mainnet" scripts/deploy.ts && echo "✅ Mainnet reference found" || echo "⚠️  Verify mainnet handling"
```

---

## 💰 SECTION B: ACCOUNT & FUNDING

### B.1 Deployer Account
```bash
# Check PRIVATE_KEY is valid format (should be 66 characters with 0x prefix)
echo "Checking private key format..."
PRIVKEY=$(grep PRIVATE_KEY /Users/macbook/projects/project\ MC/MC/mc_backend/.env | cut -d= -f2)
KEY_LENGTH=${#PRIVKEY}
if [ $KEY_LENGTH -eq 66 ]; then
  echo "✅ Private key format looks correct"
else
  echo "⚠️  Private key length: $KEY_LENGTH (expected 66)"
fi
```

### B.2 Deployer Balance
**Check on OpBNBScan:**
1. Go to https://www.opbnbscan.com
2. Paste deployer address in search
3. Check balance: **Must be >= 2 BNB**

```
Expected gas cost:
  MynnCrypt:  ~2,000,000 gas @ 50 gwei = ~0.1 BNB
  MynnGift:   ~1,500,000 gas @ 50 gwei = ~0.075 BNB
  Other:      ~200,000 gas @ 50 gwei = ~0.01 BNB
  ─────────────────────────────────────────────
  TOTAL:      ~0.185 BNB (with 1 BNB safety margin = 1.185 BNB minimum)
```

- [ ] Deployer has >= 2 BNB
- [ ] Owner address ready
- [ ] Platform wallet address ready

### B.3 Account Permissions
```bash
# Verify deployer and owner are DIFFERENT (for security)
DEPLOYER=$(echo $PRIVKEY | openssl pkeyutl -help 2>/dev/null || echo "Verify manually")
OWNER=$(grep MAINNET_OWNER /Users/macbook/projects/project\ MC/MC/mc_backend/.env | cut -d= -f2)

if [ "$DEPLOYER" != "$OWNER" ]; then
  echo "✅ Deployer and Owner are different (GOOD)"
else
  echo "⚠️  Deployer and Owner are same (acceptable but less secure)"
fi
```

---

## 📝 SECTION C: CONTRACT VERIFICATION

### C.1 Smart Contract Code Review
```bash
# Check for hardcoded testnet addresses
echo "Checking for testnet artifacts..."
grep -i "localhost\|8545\|5611\|testnet" contracts/*.sol
# Should return NOTHING (no testnet references in production code)

# Check for hardcoded private keys/secrets
grep -i "private.key\|secret\|password" contracts/*.sol
# Should return NOTHING
```

### C.2 Constructor Parameters
**Verify these in deploy.ts:**

```typescript
✅ DEFAULT_REFERRAL_ID = "A8888NR"
✅ PLATFORM_WALLET = from env variable
✅ OWNER_ADDRESS = from env variable
✅ MYNNGIFT_WALLET = correctly initialized
```

### C.3 Critical Functions
Verify these functions exist and are correct:
- [ ] `register()` - User registration
- [ ] `upgrade()` - Level upgrade
- [ ] `claimRoyalty()` - Royalty claims
- [ ] `_handleFunds()` - Commission distribution
- [ ] `getDefaultRefer()` - Get default referral

---

## 🔐 SECTION D: SECURITY CHECKS

### D.1 Access Control
```bash
# Verify onlyOwner functions
grep -n "onlyOwner" contracts/*.sol | wc -l
# Should show multiple owner-protected functions

# Verify nonReentrant on funds functions
grep -n "nonReentrant" contracts/*.sol | wc -l
# Should show guards on critical functions
```

### D.2 No Hardcoded Credentials
```bash
# Search for exposed secrets
grep -r "0x[a-fA-F0-9]\{40\}" contracts/ | grep -v "address\|ADDRESS"
# Should mostly show type definitions, not addresses

# Check for .env leaks
git log --oneline -10 | grep -i "env\|key\|secret"
# Should not see secrets committed
```

### D.3 Contract Verification
- [ ] No known reentrancy bugs
- [ ] No integer overflow/underflow (using SafeMath/Solidity 0.8+)
- [ ] Access controls properly implemented
- [ ] All external calls wrapped in try-catch if needed

---

## 📡 SECTION E: NETWORK & RPC

### E.1 RPC Connectivity
```bash
# Test opBNB Mainnet RPC
curl -X POST https://opbnb-mainnet-rpc.bnbchain.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0xcc","id":1}
# 0xcc in hex = 204 in decimal ✓
```

### E.2 Network ID Verification
```bash
# Verify hardhat knows the chain ID
npx hardhat run -e "
  const hre = require('hardhat');
  console.log('Network:', hre.network.name);
  console.log('Chain ID:', hre.hardhatArguments.network);
"
```

### E.3 Gas Price Estimation
```bash
# Check current gas prices
curl -s "https://api.opbnbscan.com/api?module=gastracker&action=gasoracle" \
  | jq '.result'

# Should show SafeGasPrice, StandardGasPrice, FastGasPrice
```

---

## 🎯 SECTION F: FRONTEND READINESS

### F.1 Environment Variables
```bash
# Check frontend .env
cd /Users/macbook/projects/project\ MC/MC/mc_frontend

# Check critical variables
echo "Frontend .env checks:"
[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"

# Verify NO hardcoded testnet addresses
grep -i "5611\|testnet\|localhost" .env
# Should return NOTHING

# Verify mainnet settings
grep "VITE_NETWORK_ID" .env | grep "204" && echo "✅ Chain ID correct" || echo "⚠️  Check chain ID"
grep "VITE_RPC_URL" .env | grep "opbnb-mainnet-rpc" && echo "✅ RPC URL correct" || echo "⚠️  Check RPC"
```

### F.2 Contract Addresses
```bash
# Verify contract addresses in .env are EMPTY (will be filled after deployment)
echo "Contract addresses (should be empty or set to actual mainnet):"
grep "VITE_MYNNCRYPT_ADDRESS" .env
grep "VITE_MYNNGIFT_ADDRESS" .env

# If coming from testnet, ensure they're NOT testnet addresses:
grep "0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE" .env && echo "⚠️  WARNING: Testnet address found!" || echo "✅ No testnet addresses"
```

### F.3 Admin Wallets
```bash
# Check admin wallets configuration
grep -A5 "PRODUCTION_WALLETS" src/config/adminWallets.js

# Should have mainnet owner address(es)
# Should NOT have hardhat addresses (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
```

### F.4 Build Test
```bash
# Try building
npm run build

# Should complete without errors
# Expected output: ✓ built in XX.XXs
```

---

## ✅ SECTION G: FINAL SYSTEM CHECKS

### G.1 Git Status
```bash
# Ensure all changes committed
git status

# Should show:
# On branch main
# nothing to commit, working tree clean

# Or list what's uncommitted:
git diff --name-only
```

### G.2 No Sensitive Data in Git
```bash
# Check .gitignore has .env
cat .gitignore | grep "\.env"

# Should show:
# .env
# .env.local
# .env*.local
```

### G.3 Network Configuration Summary
```bash
# Print summary
echo "═════════════════════════════════════════"
echo "DEPLOYMENT SUMMARY"
echo "═════════════════════════════════════════"
echo "Network: opBNB Mainnet"
echo "Chain ID: 204"
echo "RPC: https://opbnb-mainnet-rpc.bnbchain.org"
echo ""
echo "Contracts:"
echo "  Default Referral: A8888NR"
echo "  Version: $(grep version package.json | head -1)"
echo ""
echo "Files:"
echo "  Backend .env: $([ -f mc_backend/.env ] && echo '✓' || echo '✗')"
echo "  Frontend .env: $([ -f mc_frontend/.env ] && echo '✓' || echo '✗')"
echo ""
echo "═════════════════════════════════════════"
```

---

## 🎬 SECTION H: PRE-DEPLOYMENT SIGN-OFF

### Before You Click Deploy:

- [ ] **Environment** - All .env files set up correctly
- [ ] **Funding** - Deployer has >= 2 BNB
- [ ] **Code** - No testnet references in code
- [ ] **Contract** - Constructor params verified
- [ ] **Network** - opBNB Mainnet (Chain ID 204) confirmed
- [ ] **RPC** - connectivity verified
- [ ] **Frontend** - Built and tested locally
- [ ] **Admin Wallets** - Configured for mainnet
- [ ] **Backup** - Deployment info location documented
- [ ] **Monitoring** - Error tracking setup (Sentry, etc.)
- [ ] **Git** - All changes committed
- [ ] **Team** - Notified and ready

### Final Check:
```bash
# Run this final verification
npx hardhat compile --network opbnb

# Should show:
# ✓ Compiled successfully
# No errors
```

---

## ⚠️ CRITICAL - FINAL REVIEW

**Before deployment, answer these:**

1. ✅ Do you have the mainnet owner private key in a SAFE place?
2. ✅ Is the deployer account funded with >= 2 BNB?
3. ✅ Are you connecting to **opBNB MAINNET** (not testnet)?
4. ✅ Are contract addresses set to **MAINNET addresses** (not testnet)?
5. ✅ Is the network ID **204** (not 5611 or 1337)?
6. ✅ Have you verified the RPC endpoint is correct?
7. ✅ Did you test locally with Vercel/server first?
8. ✅ Is monitoring/error tracking setup?

**If you answered YES to all 8:** ✅ **YOU'RE READY TO DEPLOY**

**If you answered NO to any:** 🛑 **STOP - Fix before proceeding**

---

## 📋 DEPLOYMENT READINESS FORM

```
Deployer Name: ___________________________________
Date: ___________________________________
Network: opBNB Mainnet (Chain ID: 204)

Pre-Deployment Checks:
  ☐ All environment variables configured
  ☐ Deployer account funded (>= 2 BNB)
  ☐ Contract code audited/reviewed
  ☐ Frontend build tested
  ☐ Admin wallets configured
  ☐ Monitoring systems ready
  ☐ Backup procedures documented
  ☐ Team notification completed

Verification Results:
  RPC Connectivity: ✓ / ✗
  Contract Build: ✓ / ✗
  Frontend Build: ✓ / ✗
  Network Config: ✓ / ✗
  Security Checks: ✓ / ✗

Approvals:
  Developer: _________________ Date: _________
  Owner: _________________ Date: _________

Authorization to Proceed: YES / NO
```

---

**You are now ready for mainnet deployment! 🚀**

Next: Follow [OPBNB_MAINNET_DEPLOYMENT_GUIDE.md](OPBNB_MAINNET_DEPLOYMENT_GUIDE.md)
