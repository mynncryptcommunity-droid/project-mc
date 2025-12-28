# 🚀 START TESTING NOW - ISSUE 1.1 & 1.2

**Status**: ✅ All components ready!  
**Time to test**: ~30-45 minutes  
**Difficulty**: Easy (just follow steps)

---

## 🎯 3 QUICK STEPS TO START

### Step 1: Open 3 Terminals

**Terminal 1** - Start Hardhat blockchain:
```bash
cd "/Users/macbook/projects/project MC/MC/mc_backend"
npx hardhat node
```
Expected output: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545`

---

**Terminal 2** - Deploy smart contracts:
```bash
cd "/Users/macbook/projects/project MC/MC/mc_backend"
npx hardhat run scripts/deploy.ts --network hardhat
```
Expected output: Deployment address for MynnCrypt contract

---

**Terminal 3** - Start frontend:
```bash
cd "/Users/macbook/projects/project MC/MC/mc_frontend"
npm run dev
```
Expected output: `Local:   http://localhost:5173`

---

### Step 2: Open Browser
```
http://localhost:5173
```

---

### Step 3: Run Test Scenarios

See **TESTING SCENARIOS** below 👇

---

## ✅ TESTING SCENARIOS

### SCENARIO 1: New User Registration

**What to do:**
```
1. Open http://localhost:5173
2. Click "Join Now" button
3. See modal: "Connect Wallet"
4. Click "Connect MetaMask/Trust Wallet"
5. Approve MetaMask connection in wallet
6. Modal updates to "Masukkan Referral Link"
7. (Optional) Enter referral ID: A8888NR
8. Click "Lanjutkan Registrasi"
9. Wait for modal to show spinner...
```

**What you should see (Issue 1.2 - Loading States):**
```
✅ Modal shows LoadingSpinner (spinning yellow wheel)
✅ Modal shows message: "🌀 Memproses registrasi..."
✅ Animated dots bounce below message: "..."
✅ Button is HIDDEN (not disabled)
✅ Header shows spinner with: "🌀 Memeriksa status registrasi..."
```

**Then:**
```
10. MetaMask popup appears
11. Approve transaction (0.0044 ETH)
12. Modal spinner message changes to: "🌀 Menunggu konfirmasi transaksi..."
13. Wait 10-15 seconds for confirmation...
14. Modal closes automatically
15. See success message or dashboard
```

**Expected Result:**
```
✅ Registration successful
✅ Auto-redirect to /dashboard (2 seconds)
✅ See your new user ID
```

---

### SCENARIO 2: Already Registered User

**What to do:**
```
1. Open DevTools (F12)
2. Go to MetaMask
3. Find a wallet address you already used for registration
4. Switch to that address in MetaMask
5. Go back to browser
6. If not connected, click "Connect" button
7. Approve connection
```

**What you should see:**
```
✅ Header shows spinner: "🌀 Memeriksa status registrasi..."
✅ Spinner visible for 2-3 seconds
✅ Auto-redirect to /dashboard (NO modal)
✅ Seamless experience
```

**Expected Result:**
```
✅ Auto-redirected to dashboard
✅ No registration modal shown
✅ See your existing user ID
```

---

### SCENARIO 3: Wrong Network

**What to do:**
```
1. Close all modals if any
2. Go to MetaMask
3. Change network from Hardhat to Ethereum Mainnet
4. See what happens on page
```

**What you should see (Issue 1.1 - Network Detection):**
```
✅ Red warning toast appears at top/bottom
✅ Message says: "⚠️ You're on Ethereum. Switch to Hardhat Local"
✅ Toast stays for 10 seconds
✅ Toast disappears automatically
✅ OR: Toast auto-dismisses if you switch network back
```

**Then:**
```
5. Switch network back to Hardhat (Local 1337)
6. In MetaMask, look for "Hardhat Local" or add it if needed
```

**Expected Result:**
```
✅ Warning toast disappears when you switch back
✅ Page continues to work normally
✅ Registration flow works on correct network
```

---

### SCENARIO 4: Referral Validation

**What to do:**
```
1. Click "Join Now"
2. Connect wallet
3. Modal shows: "Masukkan Referral Link"
4. Try entering invalid referral: "INVALID"
5. Click "Lanjutkan Registrasi"
```

**What you should see:**
```
✅ Error modal: "Referral ID tidak valid. Harus berformat [A-Z][0-9]{4}(WR|NR)."
✅ Modal doesn't proceed
✅ Can close modal and try again
```

**Then try valid referral:**
```
6. Enter: A8888NR
7. Click "Lanjutkan Registrasi"
```

**Expected Result:**
```
✅ Spinner shows (registration proceeds normally)
✅ Transaction flow works
✅ Successful registration
```

---

## 🔍 WHAT TO LOOK FOR

### Issue 1.1: Network Detection ✅
- [ ] Red warning appears when on wrong network
- [ ] Warning disappears when switching back to Hardhat
- [ ] No spam of duplicate warnings
- [ ] Message is clear: "Switch to Hardhat"
- [ ] Console shows: "Network detection message"

### Issue 1.2: Loading States ✅
- [ ] Spinner animates smoothly (yellow rotating circle)
- [ ] Message shows: "Memproses registrasi..."
- [ ] Dots animate below message
- [ ] Button is hidden (not showing "Memproses...")
- [ ] Message updates to "Menunggu konfirmasi..."
- [ ] Header spinner shows for 2-3 seconds
- [ ] No "hang" feeling - user sees feedback

---

## �� CONSOLE CHECKS

**Press F12 to open DevTools → Console tab**

**What to look for:**

```javascript
// Should see these logs:
"Header.jsx - Wallet Status: {...}"
"NetworkDetector.jsx - Chain: 1337"
"Header.jsx - Check registration..."
"Header.jsx - Registration successful"

// Should NOT see red errors ❌
```

---

## ⏱️ EXPECTED TIMING

### Hardhat (Local)
```
Network detection:      ~0 sec (instant)
Check registration:     ~1-2 sec
Registration modal:     ~0 sec
Process registration:   ~10-15 sec
Total:                  ~15-20 sec (FAST!)
```

### Testnet (If testing there)
```
Same as above but transaction takes 5-15 sec per block
Total:                  ~30-40 sec
```

---

## 🐛 TROUBLESHOOTING

### Problem: Spinner not showing
**Solution:**
```
1. Check: Is registerStatus state being set?
2. Look in Console (F12) for: "Memeriksa status..."
3. Check: Is LoadingSpinner component imported?
4. Try refreshing browser (F5)
```

### Problem: Network warning not showing
**Solution:**
```
1. Verify: You connected to ETHEREUM, not Hardhat
2. Check: Is MetaMask showing different chain?
3. Try: Switching to Ethereum Mainnet, then back
4. Look in Console for: "Wrong network detected"
```

### Problem: Transaction stuck/hanging
**Solution:**
```
1. Wait 30+ seconds (network might be slow)
2. Check MetaMask: Is transaction pending?
3. Try refreshing page (Hardhat node still running?)
4. Check Terminal 1: Is `hardhat node` still running?
```

### Problem: Registration modal not showing
**Solution:**
```
1. Verify: Are you connected to wallet?
2. Check: Is it a new wallet address (not registered)?
3. Try: Disconnecting and reconnecting wallet
4. Look in Console for errors
```

---

## 📝 TEST CHECKLIST

Copy this and mark as you test:

```
ISSUE 1.1: NETWORK DETECTION
☐ Red warning appears on wrong network
☐ Warning message clear and readable
☐ Warning disappears on correct network
☐ No duplicate warnings spam
☐ Console shows detection message

ISSUE 1.2: LOADING STATES
☐ Spinner shows when checking registration
☐ Spinner animates smoothly
☐ Message updates correctly
☐ Spinner shows in modal during registration
☐ Spinner message changes: "Memproses" → "Menunggu konfirmasi"
☐ Button hidden during loading (not disabled)
☐ Header spinner visible for 2-3 sec
☐ No UI feels "hung" or frozen

GENERAL
☐ New user registration works
☐ Already registered user auto-redirects
☐ Auto-redirect takes ~2-3 seconds
☐ Success modal shows correct user ID
☐ All text is readable and clear
☐ Animations are smooth (not jittery)
☐ Mobile responsive (if you want to test)
```

---

## 🎉 IF EVERYTHING WORKS

**Great!** You've successfully tested Issues 1.1 & 1.2!

Next steps:
```
1. Take screenshot of spinner for documentation
2. Close terminals (Ctrl+C)
3. Move to Issue 1.3: Error Handling Hook
4. Or take a break! ☕
```

---

## 🆘 IF SOMETHING BREAKS

**Don't worry!** These are the debug steps:

```bash
# Check 1: Is Hardhat still running?
# Terminal 1 - should show: "Started HTTP..."
# If not: Run it again

# Check 2: Is MetaMask connected?
# MetaMask icon should show: Connected badge
# If not: Click Connect button

# Check 3: Is frontend running?
# Terminal 3 - should show: "Local: http://localhost:5173"
# If error: Try: npm install && npm run dev

# Check 4: Check browser console
# F12 → Console tab
# Look for red errors (❌)
# Copy-paste error message for debugging
```

---

## 📞 QUICK REFERENCE

| What | Where | What to do |
|------|-------|-----------|
| Test registration | http://localhost:5173 | Click "Join Now" |
| See spinner | Modal during registration | Should animate |
| See network warning | After connecting to Ethereum | Red toast |
| Check logs | F12 Console | Look for "Header.jsx" messages |
| Restart | New terminal | `npm run dev` |

---

**STATUS: ✅ READY TO TEST!**

Open those 3 terminals and start testing! 🚀

Any issues? Check TROUBLESHOOTING section above ⬆️

---

*Test Guide for Issues 1.1 & 1.2*  
*30 November 2025*
