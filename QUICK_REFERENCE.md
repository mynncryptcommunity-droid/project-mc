# ⚡ Quick Reference Card - Debug Session

## 🎯 What Just Happened

✅ **DebugInfo.jsx** created and integrated  
✅ **App.jsx** updated with import and component render  
✅ **Frontend restarted** - ready at http://localhost:5173  
✅ **Debug console** now available in browser

---

## 🚀 What To Do Now (3 Simple Steps)

### Step 1: Open Browser
```
URL: http://localhost:5173
Look for: 🐛 DEBUG button (bottom-right corner, RED box)
```

### Step 2: Click DEBUG Button
```
Click the red 🐛 button
See contract addresses and chain info
Click "Check Contract Info" for detailed log
```

### Step 3: Compare Addresses
```
DEBUG OVERLAY SHOWS:
  MynnCrypt: 0x5FbDB2315678afccb...
  
TERMINAL 2 SHOWS (from deploy):
  MynnCrypt deployed to: 0x5FbDB2315678afccb...
  
MUST MATCH! If not:
  1. Update mc_frontend/.env
  2. Restart npm run dev
  3. Test again
```

---

## 📍 Key Locations

| Item | Location |
|------|----------|
| Debug Component | `mc_frontend/src/components/DebugInfo.jsx` |
| App Config | `mc_frontend/src/App.jsx` (line 170) |
| Frontend .env | `mc_frontend/.env` |
| Contract Addresses (from deploy) | **Terminal 2 output** |
| Registration Logic | `mc_frontend/src/components/Header.jsx` (line ~194) |
| Running Server | http://localhost:5173 |

---

## 🔍 Debug Console Commands

In browser DevTools (F12) console tab:

```javascript
// Get all contract info
window.debugGetContractInfo()

// Check last transaction
window.debugCheckTransaction()
```

---

## 🛠️ Expected Output

### Debug Info Should Show:
```
✅ Wallet connected: true
✅ Chain ID: 1337
✅ Chain Name: hardhat
✅ ABI Loaded: MynnCrypt: true, MynnGift: true
✅ Contract addresses (from .env)
```

### If Anything is FALSE or Missing:
- Restart frontend
- Check .env file
- Verify deployment addresses
- Look for error in debug overlay

---

## ⚠️ Most Common Issue

**Problem:** Debug shows wrong contract address  
**Cause:** .env file outdated (old deployment address)  
**Solution:**
1. Get address from Terminal 2 deployment output
2. Update `mc_frontend/.env`
3. Frontend auto-reloads
4. Test registration again

---

## 🧪 Test Registration

After verifying addresses and ABIs:

1. Click "Register" button on DApp
2. Use referral: **A8888NR**
3. Watch console: Should see "Starting registration with: {...}"
4. **Expected:** MetaMask popup appears
5. **Not working?** Check Terminal 1 (Hardhat node) for errors

---

## 📊 Verification Checklist

- [ ] Frontend running on http://localhost:5173
- [ ] 🐛 DEBUG button visible
- [ ] Can open debug overlay
- [ ] Contract addresses shown
- [ ] Addresses match Terminal 2 deployment
- [ ] ABI loads: true for both MynnCrypt and MynnGift
- [ ] MetaMask popup appears on registration attempt

---

## 💡 If MetaMask Still Doesn't Pop Up

1. Run in console: `window.debugCheckTransaction()`
2. Copy the error output
3. Check Terminal 1 (Hardhat node) for blockchain errors
4. May indicate contract address is still wrong

---

## 🎯 Goal

**Get MetaMask popup to appear when clicking "Register"**

Current status: Console shows registration starts, but MetaMask popup missing  
Debug tool purpose: Identify if it's address/ABI mismatch  
Expected result: After fix, full registration flow works

---

**Session:** MetaMask Popup Debug  
**Status:** ✅ Ready for Testing  
**Time:** Now!

