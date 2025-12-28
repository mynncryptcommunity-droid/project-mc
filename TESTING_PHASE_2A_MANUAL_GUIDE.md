# 🧪 PHASE 2A: REGISTRATION UI FLOW TESTING
## Manual Testing Guide for Frontend Registration

**Date:** December 21, 2025
**Target:** Localhost Frontend (localhost:5173)
**Hardhat Node:** localhost:8545
**Connected Contracts:** MynnCrypt & MynnGift deployed

---

## ✅ TEST CHECKLIST - REGISTRATION UI FLOW

### Setup
- [ ] Browser open at `http://localhost:5173`
- [ ] MetaMask extension installed
- [ ] Hardhat network added to MetaMask (localhost:8545)
- [ ] Frontend console open (F12 for dev tools)
- [ ] No errors in console initially

### Test Account Info
**For Testing:**
- Account 1 (Owner/Platform): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Account 2 (Test User): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8  
- Account 3 (Test User 2): 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

**Contract Addresses:**
- MynnCrypt: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
- MynnGift: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

---

## 📋 TEST 1: Connect Wallet

### Steps:
1. [ ] Click "Connect Wallet" button (top right of header)
2. [ ] MetaMask popup appears
3. [ ] Select Account 2 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
4. [ ] Click "Next" and "Connect"

### Expected Results:
- [ ] MetaMask popup closes
- [ ] Header shows connected wallet address
- [ ] Header shows connected icon/indicator
- [ ] No console errors

---

## 📋 TEST 2: Unregistered Wallet Should NOT Auto-Redirect

### Setup:
- Account 2 is newly connected and NOT registered yet

### Steps:
1. [ ] Wallet is connected
2. [ ] You are on homepage (`/`)
3. [ ] Try navigate to `/dashboard`
4. [ ] Try navigate to `/register`

### Expected Results:
- [ ] Can access `/register` page (register modal opens)
- [ ] Can access `/dashboard` (but should show "No data" or loading)
- [ ] NOT auto-redirected to `/dashboard` from homepage
- [ ] Can browse homepage freely

---

## 📋 TEST 3: Navigation to Register

### Setup:
- Wallet connected (Account 2)

### Steps:
1. [ ] Click "Start Now" button on hero section
   **OR**
   Click "Register" in navigation menu

### Expected Results:
- [ ] Register modal opens
- [ ] 3 input fields visible:
  - [ ] Email input field (empty)
  - [ ] Phone input field (empty)
  - [ ] Referral Code input field (empty)
- [ ] Register button present (disabled by default)
- [ ] Close button (X) present

---

## 📋 TEST 4: Register with Referral Link

### Setup:
1. Navigate to: `http://localhost:5173/register?ref=A8888NR`

### Steps:
1. [ ] Register page loads
2. [ ] Referral Code field is PRE-FILLED with "A8888NR"
3. [ ] Referral Code field is DISABLED (gray background)
4. [ ] Hover over disabled field → Tooltip/hint message shows
5. [ ] Input shows "Auto-filled from link"

### Expected Results:
- [ ] Referral code correctly auto-populated
- [ ] Cannot edit the field
- [ ] Visual feedback clear (disabled state)

---

## 📋 TEST 5: Register Without Referral Link

### Setup:
1. Navigate to: `http://localhost:5173/register` (NO query param)

### Steps:
1. [ ] Register page loads
2. [ ] Referral Code field is EMPTY
3. [ ] Referral Code field is ENABLED (white background)
4. [ ] Placeholder text shows "Enter referral code"
5. [ ] Can type in the field

### Expected Results:
- [ ] Field is editable
- [ ] Placeholder text visible
- [ ] No pre-filled value

---

## 📋 TEST 6: Form Validation

### Test 6A: Empty Email

### Steps:
1. [ ] Enter phone: `+1234567890`
2. [ ] Enter referral: `A8888NR`
3. [ ] Leave email empty
4. [ ] Click "Register"

### Expected Results:
- [ ] Error message: "Email is required" or similar
- [ ] Registration NOT submitted
- [ ] Modal stays open

---

### Test 6B: Invalid Email Format

### Steps:
1. [ ] Enter email: `invalidemail`
2. [ ] Enter phone: `+1234567890`
3. [ ] Enter referral: `A8888NR`
4. [ ] Click "Register"

### Expected Results:
- [ ] Error message: "Invalid email format" or similar
- [ ] Registration NOT submitted

---

### Test 6C: Empty Phone

### Steps:
1. [ ] Enter email: `test@example.com`
2. [ ] Leave phone empty
3. [ ] Enter referral: `A8888NR`
4. [ ] Click "Register"

### Expected Results:
- [ ] Error message: "Phone is required" or similar
- [ ] Registration NOT submitted

---

### Test 6D: Empty Referral Code

### Steps:
1. [ ] Enter email: `test@example.com`
2. [ ] Enter phone: `+1234567890`
3. [ ] Leave referral empty
4. [ ] Click "Register"

### Expected Results:
- [ ] Error message: "Referral code is required" or similar
- [ ] Registration NOT submitted

---

### Test 6E: Invalid Referral Format

### Steps:
1. [ ] Enter email: `test@example.com`
2. [ ] Enter phone: `+1234567890`
3. [ ] Enter referral: `INVALID`
4. [ ] Click "Register"

### Expected Results:
- [ ] Error message: "Invalid referral code format" or similar
- [ ] Registration NOT submitted

---

## 📋 TEST 7: Successful Registration

### Setup:
- Fresh wallet Account 2 (not yet registered)
- Wallet connected

### Steps:
1. [ ] Navigate to register modal
2. [ ] Enter valid data:
   - Email: `testuser@example.com`
   - Phone: `+1234567890`
   - Referral: `A8888NR`
3. [ ] Click "Register"
4. [ ] MetaMask popup appears
5. [ ] Verify amount: 0.0044 ETH
6. [ ] Click "Confirm" in MetaMask

### Expected Results:
- [ ] Transaction submitted (TX hash visible)
- [ ] Spinner/loading indicator shows
- [ ] Wait for confirmation (5-10 seconds)
- [ ] Success message appears
- [ ] Modal closes automatically
- [ ] Redirected to dashboard

---

## 📋 TEST 8: Dashboard After Registration

### Setup:
- Just registered with Account 2

### Steps:
1. [ ] Dashboard loads
2. [ ] Check all data is visible:
   - [ ] User ID (should be generated, e.g., "A8889NR")
   - [ ] Level (should be 1)
   - [ ] Total Deposit (should be 0.0044 ETH)
   - [ ] Direct Team (should be 0)
   - [ ] Wallet Address matches
   - [ ] No console errors

### Expected Results:
- [ ] All fields populated correctly
- [ ] Level = 1 (CRITICAL CHECK)
- [ ] Data matches blockchain

---

## 📋 TEST 9: Copy Referral Link

### Setup:
- Logged in with registered Account 2
- On Dashboard

### Steps:
1. [ ] Click "Copy Link" button
2. [ ] Check console (no errors)
3. [ ] Manually paste (Cmd+V on Mac) somewhere
4. [ ] Check link format

### Expected Results:
- [ ] Success notification shows
- [ ] Link format: `http://localhost:5173/register?ref=USER_ID`
- [ ] USER_ID matches your registered ID
- [ ] No console errors
- [ ] Toast/notification shows "Copied!"

---

## 📋 TEST 10: Share Referral Link

### Test 10A: Copy Link Notification

### Steps:
1. [ ] Click "Copy Link"
2. [ ] Toast notification appears

### Expected Results:
- [ ] "Copied to clipboard!" message
- [ ] Notification auto-dismisses after 2-3 seconds

---

### Test 10B: WhatsApp Share

### Steps:
1. [ ] Click WhatsApp icon
2. [ ] WhatsApp web should open in new tab
3. [ ] Message pre-filled with link

### Expected Results:
- [ ] Link contains your referral ID
- [ ] Format is correct

---

### Test 10C: Telegram Share (if available)

### Steps:
1. [ ] Click Telegram icon
2. [ ] Telegram app/web opens

### Expected Results:
- [ ] Link pre-filled
- [ ] Referral ID correct

---

## 📋 TEST 11: Wallet Switch

### Setup:
- Account 2 currently connected and registered

### Steps:
1. [ ] Open MetaMask extension
2. [ ] Switch to Account 3 (0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
3. [ ] Allow switch in MetaMask

### Expected Results:
- [ ] Header shows new wallet address
- [ ] Dashboard should show:
  - [ ] "Not Registered" message OR
  - [ ] Empty state OR
  - [ ] Loading state that clears after checking
- [ ] Can navigate to register and register with new account

---

## 📋 TEST 12: Disconnect Wallet

### Setup:
- Wallet connected

### Steps:
1. [ ] Click disconnect/logout button
2. [ ] MetaMask popup confirms (if it shows)

### Expected Results:
- [ ] Header no longer shows connected address
- [ ] Header shows "Connect Wallet" button again
- [ ] Redirected to homepage
- [ ] Dashboard not accessible (will show unregistered state)

---

## 📋 TEST 13: Browser Console Check

### Steps:
1. [ ] Open DevTools (F12)
2. [ ] Check Console tab
3. [ ] Perform full registration flow
4. [ ] Monitor console for errors

### Expected Results:
- [ ] No RED error messages
- [ ] Warnings are OK (yellow)
- [ ] Network requests show successful (200 status)
- [ ] Smart contract calls show in console logs (if logging enabled)

---

## 🔍 CRITICAL DATA VERIFICATION

### Level Display (MOST CRITICAL)
After registration:
1. [ ] Open DevTools → Network tab
2. [ ] Look for smart contract call responses
3. [ ] Verify level field = 1 (NOT any other value like 17658)
4. [ ] Check all struct fields populated correctly

### BigInt Conversion
1. [ ] Check console for "Cannot convert to BigInt" errors
2. [ ] All large numbers display with proper formatting
3. [ ] No "NaN" or "undefined" values

### Address Format
1. [ ] Wallet addresses show as 0x... format
2. [ ] User IDs show as A####WR or A####NR format
3. [ ] No truncation issues

---

## ✅ SIGN-OFF

### All Phase 2A Tests Passed?
- [ ] Connect wallet works
- [ ] No auto-redirect
- [ ] Register modal opens
- [ ] Referral link auto-fill works
- [ ] Form validation works
- [ ] Successful registration flow works
- [ ] Dashboard displays correct level
- [ ] Copy link works
- [ ] Share buttons work
- [ ] Wallet switch works
- [ ] Disconnect works
- [ ] No console errors
- [ ] All data displays correctly

### If ANY test fails:
Document:
- [ ] What failed
- [ ] What you expected
- [ ] Browser console error (if any)
- [ ] MetaMask error (if any)
- [ ] Screenshot

---

## 📝 NOTES

- If you hit gas limit errors in register, increase gasLimit in transaction
- If MetaMask doesn't auto-popup, manually confirm in MetaMask extension
- If network switching errors, verify hardhat.config.ts has correct network ID
- If smart contract data doesn't load, verify contract addresses in .env match deployed addresses

