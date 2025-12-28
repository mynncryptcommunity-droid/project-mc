# 🚀 How to Test Dashboard Admin - Step by Step

## **Prerequisite**
- ✅ Frontend running at http://localhost:5174/
- ✅ Wallet installed (MetaMask recommended)
- ✅ Hardhat network configured (localhost:8545)

---

## **STEP 1: Check Wallet Connection**

### Do This
1. Look at top-right corner of page (Header)
2. Click "Connect Wallet" button if wallet not connected
3. Select MetaMask or your wallet
4. Approve the connection in wallet

### Expected
- ✅ Header shows your wallet address
- ✅ Shows small icon/avatar
- ✅ Shows "Connected" status

---

## **STEP 2: Open Debug Console**

### Do This
```
Go to: http://localhost:5174/admin-debug
```

### Expected
You should see a page with:
- Wallet Connection Status
- Connected: YES ✅
- Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (or your wallet)
- Role: 👑 OWNER (or 💰 INVESTOR)

---

## **STEP 3: Check Authorized Wallets**

### Look For
```
Authorized Wallets Config section

Owner Wallets:
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 ← Your wallet (if hardhat)
  [If showing "← Your wallet" next to it, you're good!]
```

### If Role Shows "UNKNOWN"
**Problem:** Your wallet not in authorized list

**Solution:**
1. Edit: `src/config/adminWallets.js`
2. Find: `const HARDHAT_WALLETS`
3. Update: Add your wallet address
   ```javascript
   const HARDHAT_WALLETS = {
     owner: ['YOUR_WALLET_ADDRESS'],
     investor: []
   };
   ```
4. Save and wait for frontend reload
5. Try debug page again

---

## **STEP 4: Check Access Control Test**

### Look For
```
Access Control Test section

All should show ✅ PASS or 🟢:
- Wallet Connected: ✅ PASS
- Address Exists: ✅ PASS
- Role Detected: ✅ owner
- Can Access Admin: ✅ YES
```

### If Any Shows ❌ FAIL
See **Troubleshooting** section below

---

## **STEP 5: Open Browser Console**

### Do This
1. Press `F12` (or right-click → Inspect)
2. Go to Console tab
3. You should see messages like:
   ```
   DashboardAdmin - Connected Address: 0xf39Fd...
   DashboardAdmin - Detected Role: owner
   DashboardAdmin - Is Allowed: true
   ```

### If No Messages
- Refresh page with `Ctrl+R` (Cmd+R on Mac)
- Check browser is at `/admin-debug`

---

## **STEP 6: Access Admin Dashboard**

### Do This
```
Go to: http://localhost:5174/admin
```

### Expected
- ✅ Dashboard loads without redirect
- ✅ See "Ringkasan" page with overview data
- ✅ Sidebar menu shows 5 options:
  - Ringkasan
  - Manajemen Pengguna
  - Keuangan & Pendapatan
  - Pengaturan Kontrak
  - Aktivitas & Log

### If Redirected Back
Follow **Troubleshooting** below

---

## **Troubleshooting**

### **Problem 1: Shows "Wallet Tidak Terkoneksi"**

```
Symptoms:
- Page shows message about wallet not connected
- Header doesn't show wallet address
```

**Solution:**
1. Click "Connect Wallet" in header
2. Approve in MetaMask/wallet popup
3. Refresh page with Ctrl+R
4. Try `/admin` again

---

### **Problem 2: Shows "❌ Akses Ditolak" with Role UNKNOWN**

```
Symptoms:
- Debug page shows: Role: UNKNOWN ❌
- Error message shows your wallet address
```

**Solution:**
1. Note your wallet address from error message
2. Edit: `src/config/adminWallets.js`
3. Update HARDHAT_WALLETS:
   ```javascript
   const HARDHAT_WALLETS = {
     owner: ['YOUR_WALLET_ADDRESS_HERE'],  // Replace with your address
     investor: []
   };
   ```
4. Save file
5. Frontend will auto-reload
6. Try `/admin` again

---

### **Problem 3: Page Redirects to Dashboard**

```
Symptoms:
- /admin opens briefly then redirects to /dashboard
- No error message shown
```

**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Try debug page: http://localhost:5174/admin-debug
4. Check all statuses:
   - Connected: YES?
   - Role: not UNKNOWN?
   - Can Access Admin: YES?
5. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R Mac)
6. Try `/admin` again

---

### **Problem 4: Debug Page Shows Blank or Error**

```
Symptoms:
- /admin-debug page is blank or shows JS error
```

**Solution:**
1. Check browser console (F12) for error
2. Try hard refresh: Ctrl+Shift+R
3. Clear browser cache:
   - Right-click page → "Empty cache and hard reload"
4. Check frontend dev server:
   - Look at terminal where you ran `npm run dev`
   - Should say "ready in X ms"
5. Try restarting frontend:
   ```bash
   npm run dev
   ```

---

### **Problem 5: Wallet Shows But Access Still Denied**

```
Symptoms:
- Connected: YES ✅
- Role: shows (owner or investor) ✅
- But still shows "Akses Ditolak" on /admin
```

**Possible Causes:**
1. **Wallet address mismatch**
   - Check exact address in debug page
   - Check it matches in adminWallets.js
   - Case sensitive!

2. **Role is "investor" but page expects "owner"**
   - Check if dashboard restricts to owner only
   - Update config to add wallet as owner

3. **Frontend not reloaded after config change**
   - Restart: `npm run dev`
   - Hard refresh browser: Ctrl+Shift+R

---

## **Complete Test Flow Checklist**

Use this as your checklist:

- [ ] Wallet connected (header shows address)
- [ ] Open /admin-debug
- [ ] Check: Connected = YES
- [ ] Check: Address = your wallet
- [ ] Check: Role = owner or investor (not unknown)
- [ ] Check: Can Access Admin = YES
- [ ] Open browser console (F12)
- [ ] See DashboardAdmin logs
- [ ] Open /admin
- [ ] Dashboard loads (no redirect)
- [ ] See Overview page with data
- [ ] See sidebar with 5 menu items
- [ ] ✅ DONE!

---

## **Advanced: Check Hardhat Network**

If everything above is OK but still issues:

### Verify Hardhat Running
```bash
# Terminal showing hardhat node should show:
# ✓ Listening on http://127.0.0.1:8545
```

### Verify Contracts Deployed
```bash
# Check .env has correct addresses:
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Force Redeploy
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

---

## **Support**

If still stuck:

1. **Collect info:**
   - Screenshot of debug page
   - Browser console error (F12)
   - Terminal output where frontend runs

2. **Share debug page output:**
   - All the status values
   - Your wallet address
   - Authorized wallets shown

3. **Check logs:**
   - Frontend console (where npm run dev)
   - Browser console (F12)
   - Hardhat terminal (npx hardhat node)

---

## **Success Indicators**

✅ You're good when you see:

```
1. /admin-debug shows all ✅ PASS
2. /admin loads without redirect
3. Dashboard shows data (Overview page)
4. Sidebar menu clickable
5. Can switch between sections
6. No error messages
```

---

Good luck! 🎉

