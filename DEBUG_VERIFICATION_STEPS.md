# 🐛 Debug Verification Steps - MetaMask Popup Issue

## Status: DebugInfo Component Integrated ✅

The `DebugInfo.jsx` component has been successfully integrated into `App.jsx` and the frontend has been restarted on `http://localhost:5173`.

---

## 📋 Verification Steps (Do These Now)

### Step 1: Open Frontend
```
URL: http://localhost:5173
```
- You should see the DApp homepage
- Check bottom-right corner: You should see a **🐛 DEBUG** button

### Step 2: Click DEBUG Button
- Click the red 🐛 button in bottom-right
- A debug console overlay should appear
- Shows:
  - ✅ Connected Wallet Address
  - ✅ Current Chain ID
  - ✅ MynnCrypt Contract Address (from .env)
  - ✅ MynnGift Contract Address (from .env)
  - ✅ ABI Loading Status
  - ✅ Environment Variables

### Step 3: Click "Check Contract Info"
- Button is inside the debug overlay
- Opens browser DevTools Console automatically
- Look for output:
  ```javascript
  {
    walletConnected: true,
    walletAddress: "0x...",
    chainId: 1337,
    chainName: "hardhat",
    mynncryptAddress: "0x...",
    mynngiftAddress: "0x...",
    abiLoaded: {
      MynnCrypt: true/false,
      MynnGift: true/false
    },
    environment: {
      VITE_MYNNCRYPT_ADDRESS: "0x...",
      VITE_MYNNGIFT_ADDRESS: "0x...",
      VITE_WALLETCONNECT_PROJECT_ID: "..."
    }
  }
  ```

### Step 4: Verify Contract Addresses
**Compare these TWO sources:**

**Source 1: .env file (frontend)**
```bash
# In mc_frontend/.env
VITE_MYNNCRYPT_ADDRESS=0x...
VITE_MYNNGIFT_ADDRESS=0x...
```

**Source 2: Hardhat deployment (Terminal 2 output)**
- Look for when you ran: `npx hardhat run scripts/deploy.ts --network hardhat`
- Should show:
  ```
  MynnCrypt contract deployed to: 0x...
  MynnGift contract deployed to: 0x...
  ```

**CRITICAL:** If addresses don't match:
1. Copy addresses from Terminal 2 deployment output
2. Update `mc_frontend/.env` with correct addresses
3. Save file
4. Frontend will auto-reload (should show updated addresses in debug console)

### Step 5: Verify ABI Loading
In browser console (F12), run:
```javascript
window.debugGetContractInfo()
```

Look for:
```javascript
abiLoaded: {
  MynnCrypt: true,  // Must be TRUE
  MynnGift: true    // Must be TRUE
}
```

**If either is FALSE:**
- ABI JSON files not loading properly
- Check: `mc_frontend/src/abis/MynnCrypt.json` and `MynnGift.json` exist
- Check: They have valid JSON content
- Check: Import statements in App.jsx are correct

### Step 6: Test Registration Again
- Click "Register" button
- Try to register with referral A8888NR
- Watch console for logs:
  ```
  Header.jsx:194 Header.jsx - Starting registration with: {...}
  ```

**Expected outcomes:**
- ✅ MetaMask popup should appear
- ✅ Showing transaction confirmation
- ✅ Gas estimate visible
- ✅ After approval: Success message
- ❌ If no popup: Check debug console for errors

---

## 🔍 Debug Functions Available

Run these in browser console (F12):

### Get Contract Info
```javascript
window.debugGetContractInfo()
```
Returns all contract configuration, addresses, ABI loading status.

### Check Recent Transactions
```javascript
window.debugCheckTransaction()
```
Shows last attempted transaction details and error (if any).

---

## 📊 Expected vs Actual

### Expected Flow:
```
User clicks "Register"
  ↓
Console: "Starting registration with: {...}"
  ↓
Wagmi calls writeContract()
  ↓
MetaMask popup appears
  ↓
User confirms transaction
  ↓
Success modal shows
  ↓
Redirect to dashboard
```

### Current Issue:
```
User clicks "Register"
  ✅ Console: "Starting registration with: {...}"
  ❌ MetaMask popup: NOT APPEARING
  ✅ No error in console
  → Likely: Contract address or ABI mismatch
```

---

## 🛠️ Troubleshooting Matrix

| Issue | Check | Solution |
|-------|-------|----------|
| Debug button not visible | Bottom-right corner | Refresh page (Ctrl+R) |
| ABI not loading (false) | ABIs exist in src/abis/ | Verify JSON files are valid |
| Contract address wrong | Compare .env vs deployment output | Update .env with correct address |
| Chain ID wrong | Should be 1337 | Check Hardhat node is running (`npx hardhat node`) |
| Wallet not connected | Reload page and connect MetaMask again | Ensure MetaMask is set to Hardhat network |

---

## 📝 Next Steps After Verification

1. **If addresses match AND ABIs load:** 
   - Problem is in Wagmi transaction building or RPC call
   - Need to add more detailed logging in Header.jsx writeContract call
   
2. **If addresses DON'T match:**
   - Update .env immediately
   - Restart frontend: `npm run dev`
   - Test registration again
   
3. **If ABI doesn't load:**
   - Verify JSON files in src/abis/ are valid
   - Check imports in App.jsx line 17-18
   - May need to restart frontend

---

## 🚀 Quick Reference

**Running Services (Required):**
```
Terminal 1: npx hardhat node
Terminal 2: Already deployed (check Terminal 2 for addresses)
Terminal 3: npm run dev (frontend running on http://localhost:5173)
```

**Key Files:**
- Frontend .env: `mc_frontend/.env`
- Debug component: `mc_frontend/src/components/DebugInfo.jsx`
- Header logic: `mc_frontend/src/components/Header.jsx` (line ~194)
- App config: `mc_frontend/src/App.jsx` (lines ~25-100)

**Debug Console Shortcut:**
- Keyboard: Click 🐛 button or open DevTools F12
- Overlay: Red box bottom-right with buttons
- Functions: window.debugGetContractInfo(), window.debugCheckTransaction()

---

## 📞 Getting Help

If verification fails:
1. Take screenshot of debug info showing addresses and ABI status
2. Run: `window.debugGetContractInfo()` and copy output
3. Check Terminal 2 for deployment addresses
4. Compare all three sources
5. Report findings for next debugging step

---

**Created:** After DebugInfo.jsx integration
**Status:** Ready for verification
**Last Updated:** Current session

