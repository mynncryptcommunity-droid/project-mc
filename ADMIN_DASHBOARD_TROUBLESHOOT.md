# 🔧 Troubleshooting Dashboard Admin Redirect

## **Problem**
Ketika akses `/admin` setelah connect wallet, halaman terbuka sebentar lalu redirect ke dashboard user.

---

## **Root Cause**
Ada 3 kemungkinan penyebab:

### **1. Wallet Tidak Terkoneksi (Address = undefined)**
```
❌ Status: Wallet tidak connect
✅ Solusi: Click "Connect Wallet" di header sebelum akses /admin
```

### **2. Wallet Terkoneksi Tapi Role = UNKNOWN** 
```
❌ Status: Wallet terhubung tapi tidak ada di authorized list
✅ Solusi: Update adminWallets.js dengan wallet address yang benar
```

### **3. Kontrak Call Error (isOwnerError = true)**
```
❌ Status: Contract call gagal/timeout
✅ Solusi: SUDAH DIPERBAIKI - sekarang tidak menggunakan kontrak check
```

---

## **Quick Diagnostic**

### **Step 1: Buka Debug Console**
```
URL: http://localhost:5174/admin-debug
```

Lihat status:
- ✅ Connected = YES
- ✅ Address ada value
- ✅ Role = OWNER (bukan UNKNOWN)
- ✅ Can Access Admin = YES

### **Step 2: Buka Browser Console (F12)**
Akan ada log:
```javascript
DashboardAdmin - Connected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DashboardAdmin - Detected Role: owner
DashboardAdmin - Is Allowed: true
```

### **Step 3: Check Wallet Config**
File: `src/config/adminWallets.js`

Development (Hardhat Local):
```javascript
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], // First hardhat account
  investor: []
};
```

**Pastikan wallet terkoneksi match dengan address di config!**

---

## **Scenario 1: Address is undefined**

**Symptoms:**
```
Connected: NO
Address: Not Connected
Role: unknown
Can Access Admin: NO
```

**Solusi:**
1. Reload halaman (Ctrl+R)
2. Click "Connect Wallet" di Header
3. Tunggu wallet terkoneksi
4. Akses `/admin` lagi

---

## **Scenario 2: Role = UNKNOWN**

**Symptoms:**
```
Connected: YES
Address: 0xYourWallet...
Role: UNKNOWN ❌
Can Access Admin: NO
```

**Penyebab:** Wallet address tidak ada di authorized list

**Solusi:**

1. **Untuk Hardhat Local Development:**
   
   Edit file: `src/config/adminWallets.js`
   
   ```javascript
   // HARDHAT_WALLETS
   const HARDHAT_WALLETS = {
     owner: ['0xYourWalletAddress'],  // ← Ganti dengan wallet terkoneksi
     investor: []
   };
   ```

2. **Untuk Production (opBNB Mainnet):**
   
   ```javascript
   // PRODUCTION_WALLETS
   const PRODUCTION_WALLETS = {
     owner: [
       '0xYourOwnerWallet1',
       '0xYourOwnerWallet2'
     ],
     investor: [
       '0xYourInvestorWallet'
     ]
   };
   ```

3. **Restart Frontend:**
   ```bash
   npm run dev
   ```

---

## **Scenario 3: Backend/Contract Issue**

**Symptoms:**
```
Connected: YES
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Role: owner ✅
Can Access Admin: YES ✅
```

Tapi masih redirect?

**Penyebab:** Ada masalah dengan rendering komponen

**Solusi:**
1. Buka browser console (F12)
2. Check untuk error messages
3. Share error log untuk debugging lebih lanjut

---

## **Updates yang Sudah Dilakukan**

✅ **Removed kontrak owner check**
   - Sebelumnya: Check `owner()` dari kontrak MynnGift
   - Sekarang: Langsung check dari wallet config
   - Benefit: Lebih cepat, tidak timeout

✅ **Better error message**
   - Show current wallet address
   - Show detected role
   - Link ke debug console

✅ **Improved wallet connection check**
   - Check jika address undefined
   - Show helpful message jika belum connect

---

## **Testing Checklist**

- [ ] Open `/admin-debug`
- [ ] Verify status all OK
- [ ] Open browser console (F12)
- [ ] Check logs DashboardAdmin
- [ ] Try access `/admin`
- [ ] Should see admin dashboard
- [ ] Not redirected back

---

## **Common Issues & Solutions**

### **Issue: Port 5173 already in use**
```bash
# Frontend runs on different port, that's OK
# Access: http://localhost:5174/ (atau port yang ditampilkan)
```

### **Issue: "Wallet tidak terkoneksi" message**
```
Solusi: Click "Connect Wallet" di Header
Wait for MetaMask popup & confirm
Then try /admin again
```

### **Issue: Browser console shows network error**
```
Solusi: 
1. Check Hardhat node running: npx hardhat node
2. Check contracts deployed: npx hardhat run scripts/deploy.ts
3. Check .env has correct contract addresses
```

---

## **File Locations**

```
✅ Wallet Config:
   src/config/adminWallets.js

✅ Admin Dashboard:
   src/pages/dashboardadmin.jsx

✅ Debug Page:
   src/pages/AdminDebugPage.jsx

✅ Routes:
   src/App.jsx
```

---

## **How to Update Wallets Permanently**

For future updates, edit `src/config/adminWallets.js`:

```javascript
// Development
const HARDHAT_WALLETS = {
  owner: ['WALLET_1', 'WALLET_2'],  // Add multiple owners
  investor: ['INVESTOR_1', 'INVESTOR_2']  // Add investors
};

// Production
const PRODUCTION_WALLETS = {
  owner: ['YOUR_PROD_OWNER'],
  investor: ['YOUR_PROD_INVESTORS']
};
```

Then restart: `npm run dev`

---

## **Still Having Issues?**

1. **Open admin-debug page**
   - Check all status indicators

2. **Open browser console (F12)**
   - Look for error messages
   - Check DashboardAdmin logs

3. **Check terminal output**
   - Frontend dev server logs
   - Hardhat node logs

4. **Try force reload**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   ```

5. **Clear browser cache**
   ```bash
   # In DevTools: Right-click on page > Empty cache and hard refresh
   ```

If still stuck, check the debug logs and share the output!

