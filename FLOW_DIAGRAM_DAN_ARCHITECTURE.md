# QUICK REFERENCE: Flow Diagram & Component Architecture

## 1. LOGIN FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS DAPP                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Header.jsx     │
                    │ renders        │
                    └────────┬───────┘
                             │
                    ┌────────▼────────┐
                    │ isConnected?    │
                    └────┬────────┬───┘
                    NO ◀─┘        └─▶ YES
                         │             │
         ┌───────────────┘             │
         │                             │
         ▼                             ▼
    ┌──────────────┐         ┌──────────────────┐
    │ Show         │         │ Query Contract   │
    │ "Connect"    │         │ id(address)      │
    │ Button       │         └────┬─────────┬───┘
    │              │         NO ◀─┘         └─▶ YES
    │  Click ◀─────┼─────────┐              │
    └──────┬───────┘         │              │
           │                 ▼              ▼
           │          ┌─────────────┐   ┌────────────┐
           │          │ Show Reg    │   │ Redirect   │
           │          │ Form        │   │ /dashboard │
           │          └─────┬───────┘   └────────────┘
           │                │
           │                │ Submit
           ▼                ▼
      ┌─────────────────────────┐
      │ Call register()         │
      │ (pay 0.0044 ETH)        │
      └────────────┬────────────┘
                   │
              (MetaMask approve)
                   │
                   ▼
           ┌───────────────────┐
           │ Wait Confirmation │
           └────────┬──────────┘
                    │
                    ▼
          ┌──────────────────────┐
          │ userId generated     │
          │ (e.g., A8890WR)      │
          └────────┬─────────────┘
                   │
                   ▼
          ┌──────────────────────┐
          │ Redirect /dashboard  │ ✓ SUCCESS
          └──────────────────────┘
```

---

## 2. COMPONENT HIERARCHY

```
                          App.jsx
                    (Wagmi + Router Config)
                             │
                ┌────────────┴────────────┐
                │                         │
         Layout Component              Routes
                │                         │
         ┌──────▼────────┐         ┌──────▼──────┐
         │ Header.jsx    │         │ Home Page   │
         │ - Wallet      │         │ (Landing)   │
         │   connect     │         │             │
         │ - Auth check  │         │             │
         │ - Auto-       │         │             │
         │   redirect    │         │             │
         └──────┬────────┘         └─────────────┘
                │
        ┌───────┴────────┐
        │                │
     ┌──▼──┐        ┌────▼────┐
     │ Not │        │ Registered
     │ Reg │        │
     └──┬──┘        └────┬────┘
        │                │
        ▼                ▼
   ┌─────────┐      ┌──────────┐
   │Register │      │Dashboard │
   │.jsx     │      │.jsx      │
   │         │      │          │
   │- Form  │      │- Stats   │
   │- Pay   │      │- Team    │
   │- Mint  │      │- Income  │
   │  ID    │      │- Upgrade │
   └────────┘      └──────────┘
```

---

## 3. DATA FLOW ARCHITECTURE

```
┌──────────────────────────────────────┐
│     FRONTEND (React + Wagmi)         │
│                                      │
│  User Wallet                         │
│  (MetaMask/TrustWallet)              │
│         │                            │
│         ▼                            │
│  ┌─────────────────┐                │
│  │ wagmi/hooks     │                │
│  │ - useConnect()  │                │
│  │ - useAccount()  │                │
│  │ - useReadContract()              │
│  │ - useWriteContract()             │
│  └────────┬────────┘                │
│           │                         │
└───────────┼─────────────────────────┘
            │
            │ JSON-RPC (HTTP)
            ▼
┌───────────────────────────────────────┐
│  BLOCKCHAIN NETWORK                   │
│  (Hardhat 1337 / opBNB 5611/204)     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Smart Contracts                 │ │
│  │                                 │ │
│  │ MynnCrypt.sol                   │ │
│  │ - id(address) mapping           │ │
│  │ - userInfo(id) mapping          │ │
│  │ - register() function           │ │
│  │ - upgrade() function            │ │
│  │                                 │ │
│  │ MynnGift.sol                    │ │
│  │ - receiveFromMynnCrypt()        │ │
│  │ - getUserTotalDonation()        │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Events:                              │
│  - UserRegistered                     │
│  - UserUpgraded                       │
│  - FundsDistributed                   │
│                                       │
└───────────────────────────────────────┘
```

---

## 4. WAGMI HOOK CHAIN FOR LOGIN

```
Start: User clicks "Connect Wallet"
       │
       ▼
┌─────────────────────────┐
│ useConnect()            │
│ - Shows wallet menu     │
│ - User selects MetaMask │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ MetaMask.request()           │
│ - User approves connection   │
│ - Returns: address           │
└────────┬─────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ useAccount()               │
│ - isConnected = true       │
│ - address = 0xf39F...      │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ useReadContract()          │
│ - Call: id(address)        │
│ - Query smart contract     │
└────────┬───────────────────┘
         │
    ┌────┴────┐
    │          │
NO  │          │  YES
    ▼          ▼
┌────────┐  ┌───────────┐
│ Empty  │  │ User ID   │
│        │  │ found!    │
└────┬───┘  └─────┬─────┘
     │            │
     ▼            ▼
┌────────────┐  ┌───────────┐
│Show Reg    │  │Navigate   │
│Form        │  │/dashboard │
└────────────┘  └───────────┘
```

---

## 5. STATE MANAGEMENT FLOW

```
User Action          Wagmi Hook           State Update       Result
─────────────────────────────────────────────────────────────────────

Connect Wallet  →  useConnect()      →  isConnected: true
                                    →  address: 0x...
                                    →  isConnecting: false

[Loading] 
Checking Reg    →  useReadContract()  →  userIdLoading: true
                                      →  userId: null
                                      →  error: null

[Success]
Found User ID   →  useReadContract()  →  userIdLoading: false
                   returns userId       →  userId: "A8890WR"
                                      →  error: null
                                      
                                      ▼ Auto-trigger
                                      
Navigate to     →  useEffect()       →  location: /dashboard
Dashboard       →  navigate()         →  Header hidden
                                      →  Dashboard rendered

[Error]
Failed Reg      →  useReadContract()  →  userIdLoading: false
                   throws error        →  userId: null
                                      →  error: "Contract error"
                                      
                                      ▼ Show error to user
                                      
Show Error      →  toast.error()      →  Message displayed
                →  try again          →  user can retry
```

---

## 6. CONTRACT INTEGRATION POINTS

```
Frontend                          Smart Contract (Solidity)
─────────────────────────────────────────────────────────

Header.jsx                        mynnCrypt.sol
│
├─ useReadContract({
│    functionName: 'id',
│    args: [address]          ──→ mapping(address => string) id;
│  })                          
│                               
├─ useWriteContract({
│    functionName: 'register',
│    args: [referralId,        ──→ function register(string _ref,
│           newAccount]        │              address _newAcc)
│  })                          │              external payable
│                              
├─ Events listener:
│    UserRegistered        ◀─── emit UserRegistered(userId, address, ref);
│    UserUpgraded          ◀─── emit UserUpgraded(userId, level, amount);
│    FundsDistributed      ◀─── emit FundsDistributed(to, amount);


Register.jsx
│
├─ useWriteContract({
│    functionName: 'register'
│  })
│
├─ useWaitForTransactionReceipt({
│    hash                   ──→ Wait for block confirmation
│  })
│
├─ Refetch userInfo        ──→ mapping(string => User) userInfo;


Dashboard.jsx
│
├─ useReadContract({
│    functionName: 'userInfo',
│    args: [userId]        ──→ struct User data (income, level, etc)
│  })
│
├─ useReadContract({
│    functionName: 'teams',
│    args: [userId, layer] ──→ Team member lists
│  })
│
└─ useWriteContract({
     functionName: 'upgrade',
     args: [level]         ──→ Upgrade user to next level
   })
```

---

## 7. ERROR HANDLING FLOW

```
                    User Action
                         │
                         ▼
                  Try-Catch Block
                    /         \
                  /             \
                 ▼               ▼
             Success          Error
                │              / | \
                │            /   |   \
                │           /    |    \
                ▼          ▼     ▼     ▼
            Process    Network Contract User
            Result     Error   Error    Rejected
              │          │       │       │
              ▼          ▼       ▼       ▼
            Show      Retry   Retry   Close
            Success   Auto    Manual   Dialog
            Message   │        │
                      ▼        ▼
                    Log      Show
                    Error    Error
                    Toast
```

---

## 8. REGISTRATION PAYMENT FLOW

```
User Input           Wagmi Call           MetaMask         Chain Result
──────────────────────────────────────────────────────────────────────

Amount: 0.0044 ETH   │
                     ├─ writeContract({
Gas: estimated       │    functionName: 'register'
                     │    args: [refId, address]
                     │    value: 0.0044 ETH
                     │  })
                     │
                     ▼
                [MetaMask Popup]
                     │
          ┌──────────┴──────────┐
          │                     │
    User Rejects         User Approves
          │                     │
          ▼                     ▼
     Return null          MetaMask sends
                          TX to chain
                               │
                               ▼ (in mempool)
                          
                    [Hardhat node / RPC]
                               │
              ┌────────────────┴─────────────────┐
              │                                  │
          Success                            Fail
              │                               │
              ▼                               ▼
         Execute register()          Revert TX
         - Create user ID            (reasons:
         - Store userData            - wrong fee
         - Emit event                - invalid ref
                 │                   - already reg.)
                 │
                 ▼ (block confirms)
         
         Transaction Confirmed
              │
              ▼
         useWaitForTransactionReceipt
         detects hash confirmation
              │
              ▼
         Refetch userId
              │
              ▼
         Navigate /dashboard
```

---

## 9. NETWORK SWITCHING FLOW

```
┌─ Hardhat Local (1337)
│  └─ ID: 1337
│  └─ RPC: http://127.0.0.1:8545
│  └─ Use: Local development
│
├─ opBNB Testnet (5611)
│  └─ ID: 5611
│  └─ RPC: https://opbnb-testnet-rpc.bnbchain.org
│  └─ Use: Integration testing
│  └─ Faucet: https://testnet-faucet.bnbchain.org
│
└─ opBNB Mainnet (204)
   └─ ID: 204
   └─ RPC: https://opbnb-mainnet-rpc.bnbchain.org
   └─ Use: Production
   └─ Real BNB required

Detection:
    User connects wallet
          │
          ▼
    Check chain.id
          │
    ┌─────┼─────┐
    │     │     │
   1337  5611  204  [Other]
    │     │     │        │
    ▼     ▼     ▼        ▼
    ✓     ✓     ✓       ✗ Show warning
  Accept Accept Accept   Offer to switch
                          │
                          ▼
                     switchNetwork(5611)
```

---

## 10. TESTING FLOW

```
┌─────────────────────────────────────────┐
│ Setup Phase (First Time)                │
├─────────────────────────────────────────┤
│ ✓ Install dependencies                  │
│ ✓ Create .env files                     │
│ ✓ Start Hardhat node                    │
│ ✓ Deploy contracts                      │
│ ✓ Setup MetaMask Hardhat network        │
│ ✓ Import test accounts                  │
└──────────┬────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Testing Phase (Each Time)               │
├─────────────────────────────────────────┤
│ 1. Terminal 1: npx hardhat node         │
│ 2. Terminal 2: npm run dev (frontend)   │
│ 3. Browser: http://localhost:5173       │
│ 4. MetaMask: Switch to Hardhat Local    │
│ 5. Test scenarios:                      │
│    - TEST 1: New user registration      │
│    - TEST 2: Auto-redirect               │
│    - TEST 3: Referral validation        │
│    - TEST 4: Multiple users             │
│ 6. Check results against checklist      │
└──────────┬────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ All Tests Pass?                         │
├─────────────────────────────────────────┤
│ YES ──→ Ready for testnet deployment    │
│ NO  ──→ Fix issues, re-test             │
└─────────────────────────────────────────┘
```

---

## KEY FILES REFERENCE

```
Frontend:
├─ src/App.jsx               ← Wagmi config, chain setup
├─ src/components/Header.jsx ← Wallet connection, auto-redirect
├─ src/components/Register.jsx ← Registration form
├─ src/components/Dashboard.jsx ← User dashboard
├─ src/abis/
│  ├─ MynnCrypt.json        ← Contract ABI
│  └─ MynnGift.json
└─ .env.local               ← Contract addresses

Backend:
├─ contracts/mynnCrypt.sol  ← Main registration logic
├─ contracts/mynnGift.sol   ← Gift distribution
├─ scripts/deploy.ts        ← Deployment script
├─ hardhat.config.ts        ← Network config
└─ .env                     ← Private key, API keys

Tests:
├─ test/                    ← Hardhat test files
└─ PANDUAN_TESTING_STEP_BY_STEP.md
```

---

**Status:** Ready to implement
**Last Updated:** 30 November 2025
