# ✅ DEVELOPER CHECKLIST: Implementation Guide

## 🎯 YOUR CHECKLIST - COPY THIS!

Gunakan checklist ini untuk track progress development.

---

## PHASE 1: TESTING (Week 1) - 5-6 hours

### Setup (Do once)
- [ ] Install backend dependencies: `npm install` (mc_backend)
- [ ] Install frontend dependencies: `npm install` (mc_frontend)
- [ ] Create .env file (mc_backend) with PRIVATE_KEY
- [ ] Create .env.local file (mc_frontend) with contract addresses
- [ ] Create MetaMask custom network "Hardhat Local" (1337)
- [ ] Import Hardhat test account into MetaMask (10,000 ETH)

### Terminal 1: Hardhat Node
- [ ] `cd ~/projects/project\ MC/MC/mc_backend`
- [ ] `npx hardhat node`
- [ ] Verify output: "Started HTTP... at http://127.0.0.1:8545/"
- [ ] Keep terminal running ← IMPORTANT

### Terminal 2: Deploy
- [ ] `cd ~/projects/project\ MC/MC/mc_backend` (NEW terminal)
- [ ] `npx hardhat run scripts/deploy.ts --network hardhat`
- [ ] Verify: "Deployment completed successfully!"
- [ ] Copy addresses:
  - MynnGift: `___________________`
  - MynnCrypt: `___________________`
- [ ] Close terminal (deployment done)

### Terminal 3: Frontend
- [ ] `cd ~/projects/project\ MC/MC/mc_frontend` (NEW terminal)
- [ ] `npm run dev`
- [ ] Verify: "Ready at http://localhost:5173/"
- [ ] Keep terminal running

### Testing
- [ ] Open browser: http://localhost:5173
- [ ] MetaMask: Switch to "Hardhat Local" network
- [ ] MetaMask: Show balance = 10,000 ETH
- [ ] Frontend: Page loads without errors

### TEST 1: First-Time Registration
- [ ] Landing page visible
- [ ] Click "Connect Wallet" button
- [ ] MetaMask approve → Address shows in header
- [ ] Registration form appears (not registered yet)
- [ ] Fill form:
  - Referral ID: `A8888NR`
  - Email: `test@example.com`
  - Phone: `+6281234567890`
- [ ] Click Register button
- [ ] MetaMask approve transaction
- [ ] Amount: ~0.0044 ETH
- [ ] Transaction confirmed (wait 5-10 seconds)
- [ ] Auto-redirect to dashboard
- [ ] Dashboard shows user ID (format: A####NR or A####WR)
- [ ] Dashboard shows Level 1
- [ ] No console errors

**Result:** ✅ Pass / ❌ Fail
**Issues found:** _______________

### TEST 2: Returning User Auto-Redirect
- [ ] Disconnect wallet (Header button)
- [ ] Connect wallet again
- [ ] Dashboard appears immediately (NO registration form)
- [ ] User data still there
- [ ] No console errors

**Result:** ✅ Pass / ❌ Fail

### TEST 3: Invalid Referral
- [ ] Disconnect current wallet
- [ ] Switch to Account #1 in MetaMask (use token pocket or another)
- [ ] Connect new wallet
- [ ] Registration form appears
- [ ] Enter Referral ID: `INVALID123`
- [ ] System should reject (format error or validation)
- [ ] Try: `B0000NR` (valid format but doesn't exist)
- [ ] System shows error: "not found" or similar
- [ ] Try: `A8888NR` (default - should work)
- [ ] No error
- [ ] Can proceed with registration

**Result:** ✅ Pass / ❌ Fail

### TEST 4: Multiple Users
- [ ] Account #0: Already registered
- [ ] Account #1: Register with referral A8889WR (Account #0's ID)
- [ ] Account #0 dashboard → Team section → see Account #1
- [ ] Account #1 dashboard → Referrer → see A8889WR
- [ ] Multi-level structure working

**Result:** ✅ Pass / ❌ Fail

### Cleanup Test 1
- [ ] All 4 tests passed? → ✅ Move to Phase 2
- [ ] Any test failed? → 🔴 Debug & fix first

---

## PHASE 2: IMPROVEMENTS (Week 2-3) - 8-10 hours

### Issue 1.1: Network Detection (2 hours)

**Pre-requisite:**
- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 1.1
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 1

**Implementation:**
- [ ] Create file: `mc_frontend/src/components/NetworkDetector.jsx`
- [ ] Copy code from CONTOH_IMPLEMENTASI (Section 1)
- [ ] Import in App.jsx after WagmiProvider
- [ ] Test: Connect to wrong network (Ethereum) → warning appears
- [ ] Test: Switch to Hardhat → no warning
- [ ] Commit changes: `git commit -m "feat: add network detector"`

**Verification:**
- [ ] Wrong network shows warning toast
- [ ] Right network = no warning
- [ ] Auto-switch works (optional)

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### Issue 1.2: Loading States (1 hour)

**Pre-requisite:**
- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 1.2
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 2

**Implementation:**
- [ ] Create component: `LoadingSpinner` in Header.jsx
- [ ] Add condition: if (isConnected && userIdLoading) → show spinner
- [ ] Add condition: if (userIdError) → show error state
- [ ] Test: Refresh page → see "Checking registration..." spinner
- [ ] Wait ~2-3 seconds → spinner disappears, dashboard/form appears
- [ ] Commit: `git commit -m "feat: add loading states in header"`

**Verification:**
- [ ] Spinner appears during loading
- [ ] Spinner disappears when done
- [ ] Error state shows if error occurs

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### Issue 1.3: Error Handling (2 hours)

**Pre-requisite:**
- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 1.3
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 3

**Implementation:**
- [ ] Create hook: `mc_frontend/src/hooks/useContractError.ts`
- [ ] Copy code from CONTOH_IMPLEMENTASI (Section 3)
- [ ] Use in Header.jsx:
  ```javascript
  useContractError(userIdError, {
    showToast: true,
    context: 'Registration Check'
  });
  ```
- [ ] Use in Register.jsx for writeError
- [ ] Test error scenarios:
  - Wrong fee → clear error message
  - Invalid referral → clear error message
  - Network error → helpful message
- [ ] Commit: `git commit -m "feat: improve error handling with useContractError hook"`

**Verification:**
- [ ] Error toast appears with user-friendly message
- [ ] No technical jargon in messages
- [ ] Logged to console for debugging

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### Issue 2.1: Referral Validation (2 hours)

**Pre-requisite:**
- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 2.1
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 4

**Implementation:**
- [ ] Create hook: `mc_frontend/src/hooks/useReferralValidation.ts`
- [ ] Copy code from CONTOH_IMPLEMENTASI (Section 4)
- [ ] Use in Register.jsx:
  ```javascript
  const referralValidation = useReferralValidation(referralId, mynncryptConfig);
  ```
- [ ] Disable button if !referralValidation.canProceed
- [ ] Show error if referralValidation.errorMessage
- [ ] Test:
  - Invalid format → error shown
  - Valid format but user doesn't exist → error shown
  - Valid format and exists → no error
- [ ] Commit: `git commit -m "feat: validate referral existence"`

**Verification:**
- [ ] Error message shows for invalid format
- [ ] Error message shows for non-existent user
- [ ] No error for valid referral

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### Issue 2.2: Transaction Timeout (1.5 hours)

**Pre-requisite:**
- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 2.2
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 5

**Implementation:**
- [ ] Create hook: `mc_frontend/src/hooks/useTransactionWithTimeout.ts`
- [ ] Copy code from CONTOH_IMPLEMENTASI (Section 5)
- [ ] Use in Register.jsx:
  ```javascript
  const { status, timeElapsed, isConfirmed } = useTransactionWithTimeout(hash, {
    timeoutMs: 120000,
    onTimeout: () => toast.warning('Transaction taking long...')
  });
  ```
- [ ] Show progress bar during confirmation
- [ ] Show warning if timeout
- [ ] Test on slow network (simulate)
- [ ] Commit: `git commit -m "feat: add transaction timeout handling"`

**Verification:**
- [ ] Timer shows during confirmation
- [ ] Progress bar visible
- [ ] Warning appears if > 2 min

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### Issue 2.3: Auto ABI Generation (1 hour)

**Pre-requisite:**
- [ ] Check hardhat.config.ts abiExporter config

**Status:** Already in hardhat.config.ts
- [ ] Verify abiExporter config exists
- [ ] ABIs auto-generate on compile
- [ ] Check: `mc_backend/abis/` has MynnCrypt.json, MynnGift.json
- [ ] Copy to frontend: cp abis/*.json ../mc_frontend/src/abis/
- [ ] Commit: `git commit -m "chore: auto ABI generation verified"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### App.jsx: Add Hardhat Network (0.5 hours)

**Pre-requisite:**
- [ ] Read CONTOH_IMPLEMENTASI_CODE.md Section 6

**Implementation:**
- [ ] Open `mc_frontend/src/App.jsx`
- [ ] Add hardhatNetwork config from Section 6
- [ ] Update chains array to include hardhatNetwork
- [ ] Update transports to include hardhat RPC
- [ ] Test: Chain detection shows "Hardhat Local"
- [ ] Commit: `git commit -m "feat: add Hardhat network to config"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

### All Tests Again (1 hour)

**Implementation:**
- [ ] Run all 4 test scenarios again
- [ ] Verify no regressions
- [ ] Check for new bugs
- [ ] TEST 1: ✅ Pass
- [ ] TEST 2: ✅ Pass
- [ ] TEST 3: ✅ Pass
- [ ] TEST 4: ✅ Pass

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

## PHASE 3: TESTNET DEPLOYMENT (Week 2-3) - 3-4 hours

### Deploy to opBNB Testnet

- [ ] Get testnet BNB from faucet (0.1-0.5 BNB)
  - Faucet: https://testnet-faucet.bnbchain.org
  - Send to your deployer address

- [ ] Update .env (mc_backend):
  ```
  PRIVATE_KEY=your_private_key_here
  ```

- [ ] Deploy contracts:
  ```bash
  cd ~/projects/project\ MC/MC/mc_backend
  npx hardhat run scripts/deploy.ts --network opbnbTestnet
  ```

- [ ] Copy new addresses from output:
  - MynnGift: `___________________`
  - MynnCrypt: `___________________`

- [ ] Update .env.local (mc_frontend):
  ```
  VITE_MYNNCRYPT_ADDRESS=0x...from_testnet_deploy
  VITE_MYNNGIFT_ADDRESS=0x...from_testnet_deploy
  ```

- [ ] Restart frontend: Kill `npm run dev`, run again

- [ ] Update MetaMask:
  - Network: opBNB Testnet (5611)
  - RPC: https://opbnb-testnet-rpc.bnbchain.org
  - Test with deployed contracts

- [ ] Run all 4 test scenarios on testnet
  - TEST 1: ✅ Pass
  - TEST 2: ✅ Pass
  - TEST 3: ✅ Pass
  - TEST 4: ✅ Pass

- [ ] Check explorer: https://testnet.opbnbscan.com
  - Search your transaction hash
  - Verify contract interaction

- [ ] Commit: `git commit -m "chore: testnet deployment and verification"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

## PHASE 4: MEDIUM PRIORITY (Week 3) - 8-10 hours

### Issue 3.1: Smart Contract Events

- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 3.1
- [ ] Add event listeners to frontend
- [ ] Subscribe to UserRegistered events
- [ ] Show real-time updates
- [ ] Commit: `git commit -m "feat: add smart contract event listeners"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

### Issue 3.2: Gas Estimation

- [ ] Read REKOMENDASI_IMPROVEMENTS.md Issue 3.2
- [ ] Add gas estimation before registration
- [ ] Show estimated fee in UI
- [ ] Commit: `git commit -m "feat: add gas estimation UI"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

### Issue 3.3: Caching & Optimization

- [ ] Implement React Query caching
- [ ] Reduce contract queries
- [ ] Commit: `git commit -m "feat: add query caching optimization"`

**Status:** ⬜️ TODO / ⏳ IN PROGRESS / ✅ DONE

---

## FINAL CHECKS BEFORE PRODUCTION

- [ ] Security audit booked (professional)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors on frontend
- [ ] No console warnings (except expected)
- [ ] Error handling comprehensive
- [ ] Loading states clear
- [ ] Network detection working
- [ ] Mobile responsive tested
- [ ] Performance acceptable (< 3 sec load)
- [ ] Analytics setup (optional)
- [ ] Monitoring setup (Sentry, etc.)
- [ ] Backup & recovery procedures documented
- [ ] Emergency pause function tested
- [ ] Multi-sig wallet setup (if needed)

---

## GIT COMMIT MESSAGES TEMPLATE

Use these commit messages:

```bash
# Setup phase
git commit -m "chore: setup dependencies and .env files"
git commit -m "test: setup Hardhat local network"

# Improvements phase
git commit -m "feat: add network detector component"
git commit -m "feat: add loading states to header"
git commit -m "feat: improve error handling with custom hook"
git commit -m "feat: add referral validation"
git commit -m "feat: add transaction timeout handling"

# Testing phase
git commit -m "test: verify all 4 scenarios pass on Hardhat"
git commit -m "test: verify all scenarios pass on testnet"

# Deployment
git commit -m "chore: deploy contracts to opBNB testnet"
git commit -m "chore: update contract addresses in .env"

# Documentation
git commit -m "docs: update README with setup instructions"
```

---

## TIME TRACKING

Use this to track actual hours:

```
PHASE 1: Testing
- Setup: ___ hours (estimated 1)
- TEST 1: ___ hours (estimated 1)
- TEST 2: ___ hours (estimated 0.5)
- TEST 3: ___ hours (estimated 0.5)
- TEST 4: ___ hours (estimated 1)
- Debugging: ___ hours
Total Phase 1: ___ hours

PHASE 2: Improvements
- Issue 1.1: ___ hours (estimated 2)
- Issue 1.2: ___ hours (estimated 1)
- Issue 1.3: ___ hours (estimated 2)
- Issue 2.1: ___ hours (estimated 2)
- Issue 2.2: ___ hours (estimated 1.5)
- Issue 2.3: ___ hours (estimated 1)
- App.jsx: ___ hours (estimated 0.5)
- Re-test: ___ hours (estimated 1)
Total Phase 2: ___ hours

PHASE 3: Testnet
- Deploy: ___ hours (estimated 1)
- Testing: ___ hours (estimated 2)
- Verification: ___ hours (estimated 1)
Total Phase 3: ___ hours

PHASE 4: Medium Priority
- Issue 3.1: ___ hours (estimated 2)
- Issue 3.2: ___ hours (estimated 2)
- Issue 3.3: ___ hours (estimated 2)
Total Phase 4: ___ hours

GRAND TOTAL: ___ hours
```

---

## HELP COMMANDS

If stuck:
```bash
# Check Hardhat node status
lsof -i :8545

# Kill Hardhat if frozen
pkill -f "hardhat node"

# Clear cache
rm -rf ~/projects/project\ MC/MC/mc_backend/cache
rm -rf ~/projects/project\ MC/MC/mc_backend/artifacts

# Check npm version
npm -v

# Reinstall dependencies
npm install --force

# Clear git cache
git rm -r --cached .
git add .

# Check git status
git status
```

---

## RESOURCES

- **Testing Guide:** PANDUAN_TESTING_STEP_BY_STEP.md
- **Code Examples:** CONTOH_IMPLEMENTASI_CODE.md
- **Improvements:** REKOMENDASI_IMPROVEMENTS.md
- **Architecture:** FLOW_DIAGRAM_DAN_ARCHITECTURE.md
- **Full Analysis:** ANALISIS_INTEGRASI_FRONTEND_SMARTCONTRACT.md

---

## SIGN-OFF

When all phases complete:

```
Developer: _________________ Date: _______
Reviewer: __________________ Date: _______
QA Lead: ___________________ Date: _______
Product Manager: ___________ Date: _______

✅ All tests passed
✅ Code review approved
✅ Ready for production
```

---

**Status:** Ready to start
**Last Updated:** 30 November 2025
**Estimated Total Time:** 3-4 weeks
**Go Live Date:** Week 5+
