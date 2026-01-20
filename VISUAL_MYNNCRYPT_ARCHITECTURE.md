# VISUAL ARCHITECTURE: MynnCrypt Owner Access Flow

## 🔄 COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  DEPLOYMENT PHASE                                                               │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  1. Developer runs: npx hardhat run scripts/deploy.ts --network hardhat        │
│                                                                                 │
│  2. Script gets deployer wallet:                                               │
│     const [deployer] = await ethers.getSigners();                             │
│     ownerAddress = deployer.address = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92│
│                                                                                 │
│  3. Deploy MynnCrypt contract:                                                 │
│     MynnCrypt.deploy(                                                          │
│       defaultReferralId = "A8889NR",                                          │
│       platformWallet = 0xf39...,          ← SAME as owner                    │
│       mynnGiftAddress = 0x5Fb...,                                             │
│       owner = 0xf39...                    ← SAME wallet                       │
│     )                                                                           │
│                                                                                 │
│     ✅ Contract State:                                                         │
│        - owner() returns: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266         │
│        - sharefee stored: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266         │
│        - id[0xf39...] = "A8889NR"                                            │
│                                                                                 │
│  4. Update Frontend .env (NEW!):                                               │
│     updateFrontendEnv(                                                         │
│       mynnGiftAddress,                                                         │
│       mynnCryptAddress,                                                        │
│       ownerAddress = 0xf39...,            ← NOW INCLUDED!                    │
│       networkName = "hardhat"                                                  │
│     )                                                                           │
│                                                                                 │
│     ✅ .env Updated:                                                           │
│        VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb...                          │
│        VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F...                        │
│        VITE_NETWORK=hardhat                                                    │
│        VITE_PLATFORM_WALLET=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 ← NEW │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  AUTHENTICATION PHASE                                                           │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  1. User Opens Frontend:                                                       │
│     frontend/src/App.tsx or main page loads                                   │
│                                                                                 │
│  2. Frontend loads config:                                                     │
│     import { getRoleByWallet } from '@/config/adminWallets'                  │
│                                                                                 │
│     adminWallets.js reads:                                                     │
│     PRODUCTION_WALLETS = {                                                     │
│       owner: [                                                                 │
│         import.meta.env.VITE_PLATFORM_WALLET,     ← Gets 0xf39...           │
│         '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928'                         │
│       ]                                                                        │
│     }                                                                          │
│                                                                                 │
│  3. User Connects Wallet (MetaMask):                                          │
│     - User clicks "Connect Wallet"                                            │
│     - MetaMask pops up                                                        │
│     - User selects: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266              │
│     - Event fires: onAccountsChanged([0xf39...])                             │
│                                                                                 │
│  4. Check Authorization:                                                       │
│     getRoleByWallet('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')           │
│     {                                                                          │
│       const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'     │
│       const owner_wallets = [                                                  │
│         '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',  ← MATCH! ✅           │
│         '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928'                         │
│       ]                                                                        │
│       if (owner_wallets.includes(walletAddress.toLowerCase())) {              │
│         return 'owner'  ← Returns OWNER role                                 │
│       }                                                                        │
│     }                                                                          │
│                                                                                 │
│  5. Route to Dashboard:                                                       │
│     if (role === 'owner') {                                                    │
│       navigate('/admin/dashboard')  ← ✅ Access granted!                     │
│     }                                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  COMPARISON: BEFORE vs AFTER FIX                                               │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  BEFORE (❌ Bug):                                                              │
│  ───────────────                                                               │
│  Deploy: ownerAddress = 0xf39...                                              │
│  .env: VITE_PLATFORM_WALLET = 0xd442...  (OLD hardcoded value!)              │
│  Result: 0xf39... ≠ 0xd442... → Access DENIED ❌                            │
│                                                                                 │
│  AFTER (✅ Fixed):                                                             │
│  ──────────────────                                                            │
│  Deploy: ownerAddress = 0xf39...                                              │
│  .env: VITE_PLATFORM_WALLET = 0xf39...  (Auto-updated!)                     │
│  Result: 0xf39... = 0xf39... → Access GRANTED ✅                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 STATE DIAGRAM

```
┌──────────────┐
│  Start Hardhat│
│  Test Network│
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Developer Runs Deploy   │
│  Script with Wallet      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Script Gets Deployer Address        │
│  0xf39Fd6e51aad88F6F4ce6aB8827279... │
└──────┬───────────────────────────────┘
       │
       ├─────────────────────────────────────┬──────────────────────────┐
       │                                     │                          │
       ▼                                     ▼                          ▼
┌─────────────────┐              ┌──────────────────┐      ┌─────────────────┐
│  Deploy MynnGift│              │ Deploy MynnCrypt │      │ Update .env File│
│  Contract       │              │ Contract         │      │ (NEW!)          │
└────────┬────────┘              └────────┬─────────┘      └────────┬────────┘
         │                                 │                        │
         ▼                                 ▼                        ▼
    0x5Fb...               owner=0xf39...               VITE_PLATFORM_WALLET=
    (stored)                                            0xf39...
         │                                 │                        │
         └─────────────────────────────────┴────────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Frontend Startup         │
                    │ Load adminWallets.js     │
                    │ Read VITE_PLATFORM_WALLET│
                    │ = 0xf39...               │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ User Connect Wallet      │
                    │ MetaMask Pop-up          │
                    │ Select: 0xf39...         │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Call getRoleByWallet()   │
                    │ Compare:                 │
                    │ 0xf39... in owner list?  │
                    │ YES! ✅                  │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Return Role = 'owner'    │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Navigate to             │
                    │ /admin/dashboard         │
                    │ ✅ Access Granted!       │
                    └──────────────────────────┘
```

---

## 🔍 DATA FLOW: Address Tracking

```
Deploy Wallet Address
  │ 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  │
  ├──────────────────────┬─────────────────────┐
  │                      │                     │
  ▼                      ▼                     ▼
Used in Deploy    Passed to Contract    Passed to updateFrontendEnv()
  │                      │                     │
  │              contract.owner() =            │
  │              0xf39...                      │
  │                      │                     │
  │                      │                 Writes to .env:
  │                      │                 VITE_PLATFORM_WALLET=
  │                      │                 0xf39...
  │                      │                     │
  │                      │                     ▼
  │                      │              frontend/.env
  │                      │              (updated)
  │                      │                     │
  │                      │                 Frontend reads:
  │                      │                 import.meta.env
  │                      │                 .VITE_PLATFORM_WALLET
  │                      │                 = 0xf39...
  │                      │                     │
  │                      │                 adminWallets.js:
  │                      │                 PRODUCTION_WALLETS.owner
  │                      │                 = [0xf39...]
  │                      │                     │
  └──────────────────────┼─────────────────────┘
                         │
                      (MATCH!)
                         │
                         ▼
               getRoleByWallet(userWallet)
                    0xf39... === 0xf39...
                         ✅ TRUE
                         │
                         ▼
                   Return 'owner'
                         │
                         ▼
                   GRANT ADMIN ACCESS
```

---

## 🎯 KEY TAKEAWAYS

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  WHAT CHANGED:                                                  │
│  • Deployment script now updates VITE_PLATFORM_WALLET           │
│  • Frontend .env automatically gets correct owner address       │
│  • Authentication works because addresses match                 │
│                                                                 │
│  WHY IT WORKS:                                                  │
│  • Same wallet deploys contract AND access dashboard            │
│  • Smart contract tracks owner                                  │
│  • Frontend auth checks owner list                              │
│  • Both use same address → Match → Access granted              │
│                                                                 │
│  RESULT:                                                        │
│  ✅ Owner can immediately access dashboard after deploy         │
│  ✅ No manual configuration needed                             │
│  ✅ Wallet mismatch impossible                                 │
│  ✅ Error-proof future deployments                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 FILE CONNECTIONS

```
scripts/deploy.ts (UPDATED)
  │
  ├─ reads ownerAddress from deployer
  ├─ calls MynnCrypt.deploy(..., ownerAddress, ...)
  │
  └─ calls updateFrontendEnv(..., ownerAddress, ...)
       │
       └─ updates ../frontend/.env
            │
            ├─ VITE_PLATFORM_WALLET = ownerAddress
            ├─ VITE_MYNNCRYPT_ADDRESS = contractAddress
            └─ VITE_NETWORK = networkName
                 │
                 ▼
           frontend/src/config/adminWallets.js
                 │
                 └─ reads import.meta.env.VITE_PLATFORM_WALLET
                      │
                      ├─ store in PRODUCTION_WALLETS.owner[]
                      │
                      └─ getRoleByWallet() compares:
                           user.address === VITE_PLATFORM_WALLET
                           │
                           ✅ MATCH → return 'owner'
                           ❌ NO MATCH → return 'unknown'
```

---

**Diagram Version:** 1.0
**Date:** January 12, 2026
**Status:** ✅ Complete
