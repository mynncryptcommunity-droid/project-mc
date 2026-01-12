# 🧪 Complete Testing Guide - Hardhat Configuration

## ✅ Status Konfigurasi Saat Ini

### ✔️ Hardhat Config (hardhat.config.ts)
- **Localhost Network:** Configured ✅
- **opBNB Testnet:** Configured ✅ (dengan ETH asli)
- **opBNB Mainnet:** Configured ✅
- **Gas Settings:** Auto-calculate ✅
- **Network Detection:** Enabled ✅

### ✔️ Frontend Config (App.jsx)
- **Hardhat Local (1337):** Configured ✅
- **opBNB Testnet (5611):** Configured ✅
- **opBNB Mainnet (204):** Configured ✅
- **NetworkDetector:** Enabled ✅
- **WagmiConfig:** Multi-chain support ✅

### ✔️ Deploy Script (scripts/deploy.ts)
- **Multi-network Support:** Yes ✅
- **Automatic .env Update:** Yes ✅
- **Network Detection:** Auto ✅

---

## 🚀 Testing Scenarios

### Scenario A: Testing dengan Localhost (Gratis - Tidak perlu ETH asli)

#### Step 1: Terminal 1 - Start Hardhat Node
```bash
cd /Users/macbook/projects/project\ MC/MC/smart_contracts
npx hardhat node
```
Output akan menampilkan 20 test accounts dengan 10000 ETH masing-masing.

#### Step 2: Terminal 2 - Deploy ke Localhost
```bash
cd /Users/macbook/projects/project\ MC/MC/smart_contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Harap catat contract addresses:
```
MynnGift:  0x5FbDB2315678afecb367f032d93F642f64180aa3
MynnCrypt: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

#### Step 3: Terminal 3 - Frontend
```bash
cd /Users/macbook/projects/project\ MC/MC/frontend
npm run dev
```

#### Step 4: MetaMask Setup
```
1. MetaMask → Networks → Add Network
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency: ETH
   
2. Switch to "Hardhat Local" network

3. Import Account 0 (Platform Wallet):
   - Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c6712b4663e2a574d9
   - This is the platform wallet dengan balance 9999 ETH
```

#### Step 5: Test Join Now
```
1. Frontend: http://localhost:5173
2. Buka browser console (F12)
3. Join Now button → Masukkan referral ID
4. MetaMask popup harus appear
5. Approve transaction
6. Verify success di contract
```

---

### Scenario B: Testing dengan Testnet (Perlu testnet BNB - ETH Asli!)

#### Step 1: Dapatkan Testnet BNB
```
1. Buka: https://opbnbfaucet.bnbchain.org/
2. Paste wallet address Anda
3. Klaim testnet BNB (gratis!)
4. Wait ~30 detik untuk receive
```

#### Step 2: Update .env
```bash
# smart_contracts/.env
PRIVATE_KEY=your_wallet_private_key_here
```

#### Step 3: Deploy ke Testnet
```bash
cd /Users/macbook/projects/project\ MC/MC/smart_contracts
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

Script otomatis update frontend/.env dengan addresses!

#### Step 4: MetaMask Setup
```
1. MetaMask → Networks → Add Network
   - Network Name: opBNB Testnet
   - RPC URL: https://opbnb-testnet-rpc.bnbchain.org
   - Chain ID: 5611
   - Currency: BNB
   
2. Switch to "opBNB Testnet" network

3. Import Account dengan testnet BNB:
   - MetaMask → Import Account
   - Paste private key
```

#### Step 5: Test Join Now dengan ETH Asli
```
1. Frontend: http://localhost:5173
2. MetaMask harus show opBNB Testnet
3. Join Now → Masukkan referral ID
4. MetaMask popup → Approve (actual testnet BNB akan terpakai!)
5. Verify di: https://testnet.opbnbscan.com/
```

---

## 📊 Command Reference

### Deploy Commands
```bash
# Deploy ke localhost (gratis, in-memory)
npx hardhat run scripts/deploy.ts --network localhost

# Deploy ke opBNB Testnet (gratis testnet BNB)
npx hardhat run scripts/deploy.ts --network opbnbTestnet

# Deploy ke opBNB Mainnet (perlu real BNB!)
npx hardhat run scripts/deploy.ts --network opbnb
```

### Testing Commands
```bash
# Test dengan localhost
npx hardhat test --network localhost

# Test dengan testnet
npx hardhat test --network opbnbTestnet

# Verify contract di testnet
npx hardhat verify --network opbnbTestnet <ADDRESS> <CONSTRUCTOR_ARGS>
```

### Node Commands
```bash
# Start local node
npx hardhat node

# Compile contracts
npx hardhat compile

# Check accounts
npx hardhat accounts
```

---

## 🔍 Troubleshooting

### Problem 1: MetaMask popup tidak muncul
```
Solution:
1. Pastikan wallet sudah connect
2. Check network correct:
   - Localhost: Chain ID 1337
   - Testnet: Chain ID 5611
3. Restart frontend: Ctrl+C, npm run dev
4. Clear browser cache: F12 → Application → Clear
```

### Problem 2: Wrong network error
```
Solution:
1. Check NetworkDetector component showing warning
2. Verify .env has correct contract address
3. Network ID di MetaMask harus match hardhat config
4. Restart MetaMask extension
```

### Problem 3: Transaction failed
```
Solution:
1. Check gas limit (sufficient?)
2. Check balance (have enough ETH/BNB?)
3. Check contract state (deployed?)
4. Look at tx in: 
   - Localhost: terminal output
   - Testnet: https://testnet.opbnbscan.com/
```

### Problem 4: .env not updating
```
Solution:
1. Check deploy script run complete ✅
2. Verify file path: frontend/.env (tidak mc_frontend)
3. Restart frontend untuk re-read .env
4. Check file permissions
```

---

## 📋 Pre-Testing Checklist

### Before Testing Localhost
- [ ] Terminal 1: `npx hardhat node` running
- [ ] Terminal 2: Deploy success ✅
- [ ] Terminal 3: `npm run dev` running
- [ ] MetaMask: Hardhat Local network added
- [ ] MetaMask: Connected to Hardhat Local
- [ ] Browser: http://localhost:5173 loading
- [ ] Console: No errors (F12)

### Before Testing Testnet
- [ ] PRIVATE_KEY set di .env ✅
- [ ] Wallet have testnet BNB (dari faucet)
- [ ] Deploy success ✅
- [ ] Frontend .env updated with testnet addresses
- [ ] MetaMask: opBNB Testnet network added
- [ ] MetaMask: Connected to opBNB Testnet
- [ ] Browser: Frontend loading ✅
- [ ] Console: No errors

---

## 🎯 Expected Behavior

### Localhost Testing
```
✅ Join Now button works
✅ MetaMask popup appears
✅ Transaction approval works
✅ No gas issues (unlimited gas)
✅ Contract functions execute
✅ State updates in contract
```

### Testnet Testing
```
✅ Join Now button works
✅ MetaMask popup appears
✅ Transaction requires testnet BNB
✅ Gas fee calculated automatically
✅ Confirmation takes ~3-10 seconds
✅ Transaction visible on opBNBScan
✅ Contract state updates on testnet
```

---

## 🌐 Useful Links

- **Hardhat Docs:** https://hardhat.org/docs
- **opBNB Testnet Faucet:** https://opbnbfaucet.bnbchain.org/
- **opBNB Testnet Explorer:** https://testnet.opbnbscan.com/
- **opBNB Mainnet Explorer:** https://opbnbscan.com/
- **Wagmi Docs:** https://wagmi.sh/

---

## 📝 Network Summary Table

| Network | Chain ID | RPC | Currency | Cost | Best For |
|---------|----------|-----|----------|------|----------|
| Hardhat Local | 1337 | http://localhost:8545 | ETH (fake) | Free | Development |
| opBNB Testnet | 5611 | https://opbnb-testnet-rpc.bnbchain.org | BNB (testnet) | Free | Before mainnet |
| opBNB Mainnet | 204 | https://opbnb-mainnet-rpc.bnbchain.org | BNB (real) | $ | Production |

---

**Last Updated:** 8 January 2026  
**Status:** ✅ Ready for Full Testing!
