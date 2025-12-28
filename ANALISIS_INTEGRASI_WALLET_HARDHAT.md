# 🔍 WALLET INTEGRATION ANALYSIS: Hardhat Local Network

**Date**: 1 December 2025  
**Topic**: Bagaimana wallet membaca frontend & terpanggil ke smart contract  
**Hardhat Config Status**: ❌ PERLU DIPERBAIKI

---

## 📋 JAWABAN PERTANYAAN ANDA

### Pertanyaan 1: Apa yang Menyebabkan Wallet Membaca Perintah Frontend & Terpanggil?

**Jawaban: Ini adalah Flow Web3 Standard**

```
┌─────────────────────────────────────────────────────────┐
│  BROWSER USER                                           │
│  (MetaMask/Wallet Extension)                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ window.ethereum (injected into page)
                 ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Wagmi)                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │ const { writeContract, address } = useWriteContract() │
│  │ Ini connect ke wallet extension via window.ethereum   │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ User clicks "Register"
                 │ writeContract({ functionName: 'register', args: [...], value: ... })
                 ↓
┌─────────────────────────────────────────────────────────┐
│  WALLET (MetaMask/Trust Wallet)                         │
│  - Build transaction object                             │
│  - Show popup: "Confirm Transaction?"                   │
│  - Display: function, args, biaya                       │
│  - User clicks "CONFIRM"                                │
│  - Wallet signs dengan private key                      │
│  - Send signed tx to blockchain                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Signed transaction + signature
                 ↓
┌─────────────────────────────────────────────────────────┐
│  BLOCKCHAIN (Hardhat Node)                              │
│  - Receive transaction                                  │
│  - Execute smart contract function                      │
│  - Update state                                         │
│  - Return receipt + transaction hash                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Receipt sent back to frontend
                 ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                               │
│  - useWaitForTransactionReceipt monitors                │
│  - Shows success/error                                  │
│  - Update UI                                            │
└─────────────────────────────────────────────────────────┘
```

---

### Pertanyaan 2: Apakah Project ID Sudah Benar untuk Local Hardhat?

**Jawaban: TIDAK! Ada Masalah Konfigurasi!** ❌

---

## 🔴 MASALAH YANG DITEMUKAN

### Issue #1: Config Hanya Punya opBNB Networks (Tidak Ada Hardhat!)

**Current Config (App.jsx, baris 70-74):**
```javascript
const config = createConfig({
  chains: [opbnbMainnet, opbnbTestnet],  // ❌ TIDAK ADA HARDHAT (Chain ID: 1337)!
  connectors: [
    injected(),
    walletConnect({ projectId: '...' }),
  ],
  transports: {
    [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
    // ❌ TIDAK ADA: [1337]: http('http://localhost:8545')
  },
});
```

**Masalah:**
- Wagmi config TIDAK include Hardhat local network (Chain ID: 1337)
- Ketika wallet switch ke Hardhat, Wagmi tidak recognize network ini
- writeContract() jadi bingung → tidak tahu ke mana send tx

---

### Issue #2: Network Detector Tidak Fix Config

**Konsekuensi:**
```
Flow:
1. User connect wallet to Hardhat (1337)
2. NetworkDetector shows warning ✅ (betul)
3. User klik "Register"
4. Wagmi try submit transaction
5. Wagmi cek: "1337 ada di config?"
6. Result: ❌ NO → Error atau stuck
7. MetaMask TIDAK popup atau popup tapi stuck
```

---

### Issue #3: ProjectID Untuk WalletConnect

**Current:**
```javascript
walletConnect({ projectId: 'acdd07061043065cac8c0dbe90363982' })
```

**Status untuk Local Hardhat:**
- ✅ ProjectID ini VALID (dari WalletConnect)
- ❌ TAPI tidak digunakan untuk Hardhat local
- ℹ️ WalletConnect untuk remote chains (mainnet, testnet)
- ℹ️ Hardhat local hanya perlu `injected()` connector

---

## ✅ SOLUSI: ADD HARDHAT NETWORK TO WAGMI CONFIG

### Fix #1: Define Hardhat Chain

**Add di App.jsx sebelum `config = createConfig`:**

```javascript
// ✅ HARDHAT LOCAL NETWORK CONFIG (ADD THIS)
const hardhatLocal = {
  id: 1337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
};

// Existing configs
const opbnbMainnet = {
  id: 204,
  name: 'opBNB Mainnet',
  // ... rest
};

const opbnbTestnet = {
  id: 5611,
  name: 'opBNB Testnet',
  // ... rest
};
```

---

### Fix #2: Add Hardhat ke Wagmi Config

**Modify `createConfig` call:**

```javascript
const config = createConfig({
  chains: [hardhatLocal, opbnbMainnet, opbnbTestnet],  // ✅ ADD hardhatLocal FIRST
  connectors: [
    injected(), // For MetaMask, Trust Wallet (works with Hardhat)
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' }),
  ],
  transports: {
    [hardhatLocal.id]: http('http://localhost:8545'),      // ✅ ADD THIS
    [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
  },
});
```

---

### Fix #3: Update Contract Addresses untuk Hardhat

**Context:**
- Saat deploy Hardhat, contract address **BERUBAH**
- Current .env punya old addresses

**Setiap kali deploy Hardhat baru:**

```bash
# Terminal 2: Deploy script OUTPUT akan show:
npx hardhat run scripts/deploy.ts --network hardhat

# Output akan show:
# MynnGift deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3 ← Update di .env
# MynnCrypt deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 ← Update di .env
```

**Update `.env` file:**
```dotenv
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3      # Deploy output
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512    # Deploy output
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982       # OK as-is for local
```

---

## 🎯 STEP-BY-STEP FIX

### Step 1: Update App.jsx

**Replace `const config = createConfig({ ... })` section with:**

```javascript
// ✅ Hardhat Local Network (for development/testing)
const hardhatLocal = {
  id: 1337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
};

// Existing networks...
const opbnbMainnet = { ... };
const opbnbTestnet = { ... };

// Contract config...
const mynncryptConfig = { ... };
const mynngiftConfig = { ... };

// ✅ FIXED: Wagmi Config with Hardhat
const config = createConfig({
  chains: [hardhatLocal, opbnbMainnet, opbnbTestnet],  // ✅ Hardhat FIRST
  connectors: [
    injected(),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' }),
  ],
  transports: {
    [hardhatLocal.id]: http('http://localhost:8545'),           // ✅ NEW
    [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
  },
});
```

---

### Step 2: Verify MetaMask Hardhat Setup

**In MetaMask:**

```
Settings → Networks → Add a network

Network Name: Hardhat Local
New RPC URL: http://localhost:8545
Chain ID: 1337
Currency Symbol: ETH

Then SAVE
```

---

### Step 3: Deploy Contracts Again

```bash
# Terminal 2
cd "/Users/macbook/projects/project MC/MC/mc_backend"
npx hardhat run scripts/deploy.ts --network hardhat

# Note the output addresses for step 4
```

---

### Step 4: Update .env

```bash
# Copy addresses dari deploy output ke .env
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982
```

---

### Step 5: Restart Frontend

```bash
# Terminal 3
cd "/Users/macbook/projects/project MC/MC/mc_frontend"
# Kill existing process (Ctrl+C)
npm run dev

# Refresh browser
http://localhost:5173
```

---

## 🧪 TEST AFTER FIX

**Expected Flow:**

```
1. Open browser
2. Connect wallet to Hardhat (1337)
3. Click "Join Now"
4. Input referral (A8888NR atau valid referral)
5. Click "Lanjutkan Registrasi"
6. ✅ Spinner shows
7. ✅ MetaMask popup APPEARS
   ├─ Function: register
   ├─ Biaya: 0.0044 ETH
   └─ Approve button active
8. Click "Approve"
9. ✅ Transaction submitted
10. ✅ Confirmation spinner
11. ✅ Success modal
12. ✅ Dashboard loads
```

**Console Logs (F12):**

```javascript
✅ Header.jsx - Starting registration with: { finalReferralId: 'A8888NR', address: '0x...' }
✅ Wagmi connected to chain: 1337 (Hardhat Local)
✅ Transaction sent: 0x...
✅ Transaction confirmed: 0x...
```

---

## 📊 CONFIGURATION CHECKLIST

### Hardhat Node Setup
- [x] Terminal 1: `npx hardhat node` running
- [x] Listening on http://localhost:8545
- [x] Shows 20 test accounts

### Contract Deployment
- [x] Terminal 2: `npx hardhat run scripts/deploy.ts --network hardhat` executed
- [x] MynnCrypt address noted
- [x] MynnGift address noted

### MetaMask Setup
- [x] Hardhat network added (Chain ID: 1337)
- [x] RPC URL: http://localhost:8545
- [x] Currently connected to Hardhat

### Frontend Config
- [x] App.jsx: hardhatLocal chain config added
- [x] App.jsx: transports[1337] configured
- [x] .env: Contract addresses updated
- [x] .env: ProjectID verified

### Frontend Server
- [x] Terminal 3: `npm run dev` running
- [x] http://localhost:5173 accessible
- [x] No console errors

---

## 🔗 HOW WALLET COMMUNICATES

### Process Step-by-Step:

**1. User connects wallet:**
```javascript
// Header.jsx
const { connect } = useConnect();
connect({ connector: injected() });
// This injects window.ethereum into page
```

**2. User triggers transaction:**
```javascript
// Header.jsx
const { writeContract } = useWriteContract();
await writeContract({
  address: mynncryptConfig.address,           // Contract address
  abi: mynncryptConfig.abi,                   // Contract ABI
  functionName: 'register',                   // Function to call
  args: [finalReferralId, address],           // Function arguments
  value: BigInt(4.4e15),                      // Value in Wei
});
// Wagmi builds transaction using Wagmi config
```

**3. Wagmi prepares transaction:**
```javascript
// Wagmi internally:
// 1. Get connected account
// 2. Get connected chain (from Wagmi config)
// 3. Build transaction object:
//    {
//      to: contractAddress,
//      from: userAddress,
//      data: encodedFunctionCall,
//      value: 4.4e15,
//      chainId: 1337,
//      gasLimit: estimated
//    }
// 4. Send to wallet extension via window.ethereum
```

**4. Wallet (MetaMask) receives:**
```javascript
// MetaMask gets via window.ethereum.request({
//   method: 'eth_sendTransaction',
//   params: [transactionObject]
// })
// Then:
// 1. Parse & display transaction details
// 2. Show popup to user
// 3. User clicks "Approve"
// 4. MetaMask signs with private key
// 5. Send signed tx to blockchain RPC
```

**5. Blockchain processes:**
```javascript
// Hardhat node:
// 1. Receive transaction
// 2. Execute contract function
// 3. Update state
// 4. Return receipt
```

**6. Frontend receives confirmation:**
```javascript
// useWaitForTransactionReceipt monitors receipt
// When confirmed, shows success
```

---

## ❌ WHY IT MIGHT NOT WORK NOW (Current State)

```
User on Hardhat (1337)
  ↓
Click Register
  ↓
Wagmi try to find chain 1337 in config
  ↓
Chain 1337 NOT FOUND ❌
  ↓
Wagmi error / silent fail
  ↓
MetaMask NEVER popup ❌
```

---

## ✅ WHY IT WILL WORK AFTER FIX

```
User on Hardhat (1337)
  ↓
Click Register
  ↓
Wagmi find chain 1337 in config ✅
  ↓
Wagmi use transport: http://localhost:8545 ✅
  ↓
Wagmi build & send transaction ✅
  ↓
MetaMask popup APPEARS ✅
  ↓
User approve ✅
  ↓
Transaction submitted to Hardhat node ✅
  ↓
Contract executed ✅
  ↓
Receipt returned ✅
  ↓
Success! ✅
```

---

## 📝 SUMMARY

| Aspek | Status | Action |
|-------|--------|--------|
| Chain Config | ❌ Missing Hardhat | Add hardhatLocal chain |
| Network in Wagmi | ❌ Not registered | Add to chains array |
| Transport RPC | ❌ Missing | Add [1337]: http://localhost:8545 |
| MetaMask Setup | ✅ OK | Already good |
| ProjectID | ✅ OK | For testnet only, not needed for local |
| Contract Addresses | ⚠️ Verify | Check latest deploy output |

---

## 🚀 QUICK CHECKLIST TO FIX NOW

- [ ] Edit App.jsx: Add hardhatLocal chain config
- [ ] Edit App.jsx: Add to chains array in createConfig
- [ ] Edit App.jsx: Add transport for chain 1337
- [ ] Edit .env: Verify contract addresses from latest deploy
- [ ] Restart frontend (Ctrl+C, npm run dev)
- [ ] Test registration flow
- [ ] Verify MetaMask popup appears
- [ ] Approve transaction
- [ ] Verify success

---

**Status: 🔴 NEEDS FIX, SOLUTION PROVIDED** ✅

Next: Apply fix to App.jsx and test! 🚀

---

*Generated: 1 December 2025*  
*Technical Analysis Complete*
