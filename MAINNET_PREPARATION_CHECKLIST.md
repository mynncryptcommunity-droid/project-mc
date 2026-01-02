# 🚀 MAINNET PREPARATION CHECKLIST

**Status:** Pre-Deployment Phase
**Network:** opBNB Mainnet (Chain ID: 204)
**Date:** January 2, 2026

---

## 📋 PHASE 1: SECURITY & CODE REVIEW

### 1.1 Smart Contract Audit
- [ ] **Internal Code Review**
  - [ ] Review mynnCrypt.sol untuk security issues
  - [ ] Review mynnGift.sol untuk security issues
  - [ ] Check untuk reentrancy vulnerabilities
  - [ ] Check untuk integer overflow/underflow
  - [ ] Verify access controls (onlyOwner, etc.)
  
- [ ] **External Audit (Recommended)**
  - [ ] Hire professional auditor (CertiK, OpenZeppelin, Hacken)
  - [ ] Expected cost: $5,000 - $25,000
  - [ ] Timeline: 2-4 weeks
  
- [ ] **Test Coverage**
  - [ ] Unit tests: Target >80% coverage
  - [ ] Integration tests: All major flows tested
  - [ ] Edge case testing: Completed
  - [ ] Mainnet simulation: Tested locally

### 1.2 Frontend Security Review
- [ ] No hardcoded sensitive data (private keys, passwords)
- [ ] Environment variables properly configured
- [ ] No console.log statements with sensitive data
- [ ] Error messages don't expose system details
- [ ] CORS properly configured
- [ ] CSP headers in place

### 1.3 Documentation Review
- [ ] API documentation complete
- [ ] Error codes documented
- [ ] Deployment procedures documented
- [ ] Incident response procedures documented
- [ ] Rollback procedures documented

---

## 🔧 PHASE 2: MAINNET ENVIRONMENT SETUP

### 2.1 Get Mainnet RPC & Resources
- [ ] Get opBNB Mainnet RPC endpoint
  - [ ] Option 1: Use BSC provided: `https://opbnb-mainnet-rpc.bnbchain.org`
  - [ ] Option 2: Get Alchemy/Infura dedicated RPC (optional for higher limits)
  
- [ ] Setup network in hardhat.config.ts
  ```typescript
  opbnb: {
    url: "https://opbnb-mainnet-rpc.bnbchain.org",
    accounts: [process.env.MAINNET_PRIVATE_KEY],
    chainId: 204,
  }
  ```

### 2.2 Get Mainnet Deployer Account
- [ ] Create or designate deployer account
  - [ ] Not the same as owner address (recommended)
  - [ ] Have 1-2 BNB for gas fees
  
- [ ] Setup environment variables
  ```bash
  MAINNET_PRIVATE_KEY=your_private_key_here
  MAINNET_DEPLOYER_ADDRESS=0x...
  MAINNET_OWNER_ADDRESS=0x...
  MAINNET_PLATFORM_WALLET=0x...
  ```

### 2.3 Estimate Gas Costs
- [ ] MynnCrypt deployment: ~2,000,000 gas
- [ ] MynnGift deployment: ~1,500,000 gas
- [ ] Total: ~3,500,000 gas
- [ ] At 10 gwei: ~0.035 BNB (~$10-15)
- [ ] Keep 1-2 BNB in deployer account for safety

---

## 📝 PHASE 3: CONTRACT DEPLOYMENT CONFIG

### 3.1 Update Deployment Script
- [ ] Verify [smart_contracts/scripts/deploy.ts](smart_contracts/scripts/deploy.ts)
  - [ ] Correct default referral ID: A8888NR
  - [ ] Correct owner address (from MAINNET_OWNER_ADDRESS)
  - [ ] Correct platform wallet address
  - [ ] Correct mynnGift wallet address

- [ ] Add mainnet-specific configs
  ```typescript
  const DEFAULT_REFERRAL = "A8888NR";
  const OWNER_ADDRESS = process.env.MAINNET_OWNER_ADDRESS;
  const PLATFORM_WALLET = process.env.MAINNET_PLATFORM_WALLET;
  ```

### 3.2 Verify Constructor Parameters
Before deploying, verify all parameters:

```solidity
// MynnCrypt Constructor
constructor(
    string memory _defaultReferralId,    // "A8888NR"
    address _sharefee,                   // Platform wallet
    address _mynnGiftWallet,             // MynnGift contract
    address _owner                       // Owner address
)

// MynnGift Constructor
constructor(
    address initialOwner,                // Owner address
    address platformWallet,              // Platform wallet
    address mynnCryptContract            // MynnCrypt contract
)
```

### 3.3 Contract Verification Setup
- [ ] Get OpBNBScan API key from https://www.opbnbscan.com/apis
- [ ] Add to .env:
  ```bash
  OPBNBSCAN_API_KEY=your_api_key_here
  ```

- [ ] Setup verification script (optional):
  ```bash
  npx hardhat verify --network opbnb <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
  ```

---

## 🎨 PHASE 4: FRONTEND CONFIGURATION

### 4.1 Update Environment Variables
Create `mc_frontend/.env.mainnet`:

```env
# Mainnet Contract Addresses (UPDATE AFTER DEPLOYMENT)
VITE_MYNNCRYPT_ADDRESS=0x_WILL_BE_SET_AFTER_DEPLOYMENT_
VITE_MYNNGIFT_ADDRESS=0x_WILL_BE_SET_AFTER_DEPLOYMENT_

# Mainnet Network Config
VITE_NETWORK_ID=204
VITE_CHAIN_NAME=opBNB Mainnet
VITE_RPC_URL=https://opbnb-mainnet-rpc.bnbchain.org
VITE_EXPLORER_URL=https://www.opbnbscan.com
VITE_EXPLORER_API=https://api.opbnbscan.com/api

# Wallet Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_PLATFORM_WALLET=0x_your_platform_wallet_address_

# Feature Flags
VITE_ENABLE_TESTNET_WARNING=false
VITE_ENABLE_ADMIN_FUNCTIONS=true
```

### 4.2 Update Network Configuration
- [ ] Update [mc_frontend/src/config/wagmiConfig.ts](mc_frontend/src/config/wagmiConfig.ts)
  - [ ] Add opBNB mainnet chain config
  - [ ] Set correct RPC endpoint
  - [ ] Set correct chain ID: 204
  - [ ] Update explorer URL

### 4.3 Update Wallet Configuration
- [ ] Update [mc_frontend/src/config/adminWallets.js](mc_frontend/src/config/adminWallets.js)
  ```javascript
  const PRODUCTION_WALLETS = {
    owner: [
      process.env.VITE_PLATFORM_WALLET,  // Your mainnet owner address
      // Add secondary owner if needed
    ],
    investor: [
      // Add investor addresses if needed
    ]
  };
  ```

### 4.4 Build & Test
- [ ] Build production bundle: `npm run build`
- [ ] Test bundle locally: `npm run preview`
- [ ] Verify contract addresses in network tab
- [ ] Check for console errors

---

## 🔐 PHASE 5: WALLET & SECURITY

### 5.1 Mainnet Wallet Setup
- [ ] Create mainnet owner wallet
  - [ ] Store seed phrase in secure location (hardware wallet, vault)
  - [ ] Do NOT use testnet wallets for mainnet
  - [ ] Test with small amount first
  
- [ ] Create mainnet deployer wallet
  - [ ] Separate from owner for security
  - [ ] Only needs 1-2 BNB for deployment gas
  - [ ] Can be discarded after deployment

### 5.2 Private Key Management
- [ ] Never commit private keys to git
- [ ] Use `.env` file with proper `.gitignore`
- [ ] Verify `.gitignore` includes:
  ```
  .env
  .env.local
  .env*.local
  .env_mainnet
  .env_testnet
  ```

- [ ] Use hardware wallet for owner account
  - [ ] MetaMask + Ledger/Trezor integration
  - [ ] Sign transactions instead of storing keys

### 5.3 Multi-Sig Setup (Optional but Recommended)
- [ ] Setup multi-sig wallet for owner functions
  - [ ] Gnosis Safe recommended
  - [ ] 2-of-3 or 3-of-5 signature requirement
  - [ ] Better security for large transactions

### 5.4 Access Control Review
- [ ] Verify owner address
- [ ] Verify platform wallet address
- [ ] Verify permission roles
- [ ] Test ownership transfer mechanism

---

## ✅ PHASE 6: TESTING & VERIFICATION

### 6.1 Local Testing (Mainnet Fork)
```bash
# Test on mainnet fork locally
npx hardhat node --fork https://opbnb-mainnet-rpc.bnbchain.org

# In separate terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

- [ ] Deploy succeeds
- [ ] Default referral setup correct
- [ ] Initial user has correct layer/level
- [ ] All contract functions callable

### 6.2 Testnet Final Verification
- [ ] Deploy to opBNB testnet if not done yet
- [ ] Run comprehensive test suite:
  - [ ] User registration flow
  - [ ] Referral system
  - [ ] Commission distribution
  - [ ] Upgrade/level system
  - [ ] Dashboard functionality

- [ ] Monitor testnet for 1-2 weeks:
  - [ ] Check for unexpected behavior
  - [ ] Monitor gas costs
  - [ ] Verify commission calculations

### 6.3 Contract Code Verification
- [ ] All contract source code matches deployed bytecode
- [ ] Constructor arguments properly documented
- [ ] Version control clean (no uncommitted changes)

### 6.4 Performance Testing
- [ ] Load test with 100+ concurrent users
- [ ] Verify response times <2 seconds
- [ ] Check error handling under load
- [ ] Monitor memory/CPU usage

---

## 🚀 PHASE 7: MAINNET DEPLOYMENT

### 7.1 Pre-Deployment Checklist
- [ ] All previous phases completed ✅
- [ ] Mainnet private key in secure location
- [ ] Deployer account funded with 2 BNB
- [ ] Owner account created
- [ ] Platform wallet address confirmed
- [ ] Contract code audited
- [ ] All tests passing
- [ ] Emergency procedures documented
- [ ] Rollback plan documented
- [ ] Monitoring setup (Sentry, etc.)

### 7.2 Deployment Process

**Step 1: Final Code Review**
```bash
# Update .env with mainnet keys
MAINNET_PRIVATE_KEY=your_private_key
MAINNET_OWNER_ADDRESS=0x...
MAINNET_PLATFORM_WALLET=0x...

# Verify hardhat config
cat hardhat.config.ts | grep -A5 "opbnb:"
```

**Step 2: Deploy Contracts**
```bash
cd mc_backend
npx hardhat run scripts/deploy.ts --network opbnb
```

**Step 3: Save Deployment Info**
```
MynnCrypt Address:  0x_________________________________
MynnGift Address:   0x_________________________________
Deployment Hash:    0x_________________________________
Timestamp:          ________________________
Gas Used:           _________
```

**Step 4: Verify on OpBNBScan**
- [ ] Visit https://www.opbnbscan.com
- [ ] Search for MynnCrypt contract address
- [ ] Verify contract source code (optional but recommended)

**Step 5: Update Frontend**
```bash
# Update mc_frontend/.env
VITE_MYNNCRYPT_ADDRESS=0x_from_deployment_
VITE_MYNNGIFT_ADDRESS=0x_from_deployment_

# Build production
npm run build

# Test preview
npm run preview
```

### 7.3 Post-Deployment Verification
- [ ] Can view contract on OpBNBScan
- [ ] Contract functions callable from frontend
- [ ] Dashboard loads correct data
- [ ] Register button functional
- [ ] Commission calculations correct
- [ ] Database synced correctly

### 7.4 Monitoring & Alerts
- [ ] Setup error monitoring (Sentry)
- [ ] Setup transaction monitoring
- [ ] Setup price feed monitoring (if applicable)
- [ ] Setup user activity alerts
- [ ] Setup emergency contact procedures

---

## 🎯 PHASE 8: LAUNCH & OPERATIONS

### 8.1 Soft Launch
- [ ] Limited users (100-500)
- [ ] Monitor closely for issues
- [ ] Collect user feedback
- [ ] Fix bugs quickly

### 8.2 Full Launch
- [ ] Open registration to all
- [ ] Marketing campaign
- [ ] Community support
- [ ] Monitor metrics continuously

### 8.3 Ongoing Maintenance
- [ ] Weekly security reviews
- [ ] Monthly contract audits
- [ ] Quarterly performance reviews
- [ ] Annual comprehensive audit

---

## 📊 RISK ASSESSMENT

| Risk | Mitigation | Status |
|------|-----------|--------|
| Smart contract bugs | Audited + tested thoroughly | ⏳ Pending audit |
| Private key loss | Hardware wallet + multi-sig | ⏳ Setup needed |
| Network issues | RPC fallback + monitoring | ⏳ Config needed |
| User loss of funds | Clear docs + support team | ⏳ Team prep needed |
| Regulatory issues | Legal review (if required) | ⏳ Pending |

---

## 📞 SUPPORT CONTACTS

- **Emergency Contact:** [Your contact info]
- **Security Issues:** [Security contact]
- **Technical Support:** [Support contact]
- **Legal/Compliance:** [Legal contact]

---

## 📝 SIGN-OFF

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | _ | _ | ⏳ Pending |
| Auditor | _ | _ | ⏳ Pending |
| Owner | _ | _ | ⏳ Pending |

---

**Last Updated:** January 2, 2026
**Next Review:** January 15, 2026
