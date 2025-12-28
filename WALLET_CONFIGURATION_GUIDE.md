# 🔐 Wallet Configuration Guide

## **Lokasi File Konfigurasi**

```
src/config/adminWallets.js
```

---

## **Cara Update Wallet Address**

### **1. Untuk Development (Hardhat Local)**

File: `src/config/adminWallets.js`

```javascript
// ===== HARDHAT LOCAL DEVELOPMENT =====
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], // First hardhat account
  investor: []
};
```

**Default Hardhat Accounts:**
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH) ← PLATFORM WALLET
Account #1: 0x70997970C51812e339D9B73b0245ad59720850e7 (10000 ETH)
Account #2: 0x3C44CdDdB6a900c6c2F0d2eBA61Fd3950d221C28 (10000 ETH)
```

### **2. Untuk Production (opBNB Mainnet)**

```javascript
// ===== OPBNB MAINNET (PRODUCTION) =====
const PRODUCTION_WALLETS = {
  owner: [
    '0x1234567890123456789012345678901234567890',  // owner 1
    '0x0987654321098765432109876543210987654321'   // owner 2
  ],
  investor: [
    '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',  // investor 1
    '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'   // investor 2
  ]
};
```

---

## **Step-by-Step Update Wallet**

### **Scenario 1: Update untuk Hardhat Local**

1. Buka file: `src/config/adminWallets.js`
2. Cari section `HARDHAT_WALLETS`
3. Ganti alamat di array `owner`:

```javascript
// BEFORE
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  investor: []
};

// AFTER
const HARDHAT_WALLETS = {
  owner: ['0x70997970C51812e339D9B73b0245ad59720850e7'], // Alamat baru
  investor: []
};
```

4. Simpan file
5. Frontend akan reload otomatis
6. Login dengan wallet baru untuk akses dashboard

---

### **Scenario 2: Update untuk Production (opBNB Mainnet)**

1. Buka file: `src/config/adminWallets.js`
2. Cari section `PRODUCTION_WALLETS`
3. Ganti semua alamat dengan wallet production:

```javascript
// BEFORE
const PRODUCTION_WALLETS = {
  owner: [
    '0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B',
    '0x2f48b3F7D3b2233ba1cFb2e077cF2E703eFcD7b5'
  ],
  investor: [
    '0x3A3214EbC975F7761288271aeBf72caB946a8b83',
    '0xb3174FB5f5FEAB8245B910Ba792c0AD25B024871'
  ]
};

// AFTER - Update dengan alamat production
const PRODUCTION_WALLETS = {
  owner: [
    '0xYourOwnerAddress1111111111111111111111111',
    '0xYourOwnerAddress2222222222222222222222222'
  ],
  investor: [
    '0xYourInvestorAddress11111111111111111111111',
    '0xYourInvestorAddress22222222222222222222222'
  ]
};
```

4. Simpan file
5. Deploy build production
6. Test dengan wallet production

---

## **Environment Detection**

File otomatis mendeteksi environment berdasarkan:

```javascript
const ENVIRONMENT = import.meta.env.MODE === 'production' ? 'production' : 'development';
```

**Development Mode:**
- Running: `npm run dev`
- Uses: `HARDHAT_WALLETS`

**Production Mode:**
- Build: `npm run build`
- Uses: `PRODUCTION_WALLETS`

---

## **Exported Functions**

### **1. getRoleByWallet(walletAddress)**
```javascript
import { getRoleByWallet } from '../config/adminWallets';

// Usage
const role = getRoleByWallet('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
console.log(role); // 'owner' atau 'investor' atau 'unknown'
```

### **2. getAllAuthorizedWallets()**
```javascript
import { getAllAuthorizedWallets } from '../config/adminWallets';

// Usage
const wallets = getAllAuthorizedWallets();
console.log(wallets);
// Output:
// {
//   owners: ['0xf39Fd6...', '0x2F9B65...'],
//   investors: ['0x3A321...'],
//   environment: 'development'
// }
```

### **3. isWalletAuthorized(walletAddress)**
```javascript
import { isWalletAuthorized } from '../config/adminWallets';

// Usage
const authorized = isWalletAuthorized('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
console.log(authorized); // true atau false
```

---

## **File Structure**

```
mc_frontend/
├── src/
│   ├── config/
│   │   └── adminWallets.js          ← EDIT THIS FILE
│   ├── pages/
│   │   └── dashboardadmin.jsx       ← USES adminWallets.js
│   └── App.jsx
├── .env                              ← Contract addresses
└── package.json
```

---

## **Common Scenarios**

### **Add New Owner Wallet**

```javascript
const HARDHAT_WALLETS = {
  owner: [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',  // existing
    '0x70997970C51812e339D9B73b0245ad59720850e7'   // new owner
  ],
  investor: []
};
```

### **Add New Investor Wallet**

```javascript
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  investor: [
    '0x3C44CdDdB6a900c6c2F0d2eBA61Fd3950d221C28'  // new investor
  ]
};
```

### **Remove Investor Wallet**

```javascript
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  investor: []  // Removed all investors
};
```

---

## **Testing Updated Wallets**

### **Step 1: Update config file**
```javascript
// src/config/adminWallets.js
const HARDHAT_WALLETS = {
  owner: ['0xYourNewWalletAddress'],
  investor: []
};
```

### **Step 2: Save file**
Frontend auto-reloads

### **Step 3: Switch wallet in browser**
- Open MetaMask
- Switch to the wallet address you just added
- Go to http://localhost:5174/admin

### **Step 4: Verify access**
- ✅ Dashboard loads → Wallet authorized
- ❌ "Wallet tidak terdaftar" → Check address spelling/case

---

## **Hardhat Local Test Wallets**

Jika perlu test lebih dari 1 wallet, gunakan hardhat accounts ini:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account #1: 0x70997970C51812e339D9B73b0245ad59720850e7
Account #2: 0x3C44CdDdB6a900c6c2F0d2eBA61Fd3950d221C28
Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Account #4: 0x15d34AAf54267DB7D7c103d1391D75d30dF0355a
Account #5: 0x1CBd3b2770909D4e10f157aAFc686eb8b5B8c0e1
Account #6: 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
Account #7: 0xa0Ee7A142d267C1f36714E4a8F75759e3fFC881B
Account #8: 0xBcd4042DE68F0ec4f0eca6AC8a91F8996F12e9bf
Account #9: 0x71bE63f3384f5fb98991E1DCD3d8BAD0DEd4d19c
```

**Private Key (untuk import ke wallet):**
- Hardhat menggunakan mnemonic: `test test test test test test test test test test test junk`
- Setiap index derivasi berbeda

---

## **Verify Configuration**

### **Command: Check if config loads correctly**

```javascript
// Buka browser console saat di dashboard admin
// Copy-paste code ini:

import { getAllAuthorizedWallets } from './config/adminWallets.js';
const config = getAllAuthorizedWallets();
console.log('Current Wallet Config:', config);
```

---

## **Production Deployment Checklist**

- [ ] Update `PRODUCTION_WALLETS` dengan actual owner addresses
- [ ] Update `PRODUCTION_WALLETS` dengan actual investor addresses
- [ ] Test config dengan `getAllAuthorizedWallets()` di console
- [ ] Verify each owner/investor can login to dashboard
- [ ] Build: `npm run build`
- [ ] Deploy to production server

---

## **Rollback (Jika salah)**

```bash
# Revert to previous version
git checkout src/config/adminWallets.js

# Or manually restore hardcoded addresses
```

---

## **Summary**

✅ **Easy to update** - Just edit wallet addresses in one file  
✅ **Dev/Prod separation** - Different configs for development & production  
✅ **Auto environment detection** - No manual mode switching  
✅ **Centralized management** - All wallet config in one place  
✅ **No hardcoding in components** - DashboardAdmin uses imported config  

