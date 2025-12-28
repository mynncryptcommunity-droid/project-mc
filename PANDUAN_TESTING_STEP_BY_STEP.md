# PANDUAN STEP-BY-STEP: Testing DApp di Hardhat Local Network

## SETUP AWAL (Hanya 1x)

### Step 1: Clone dan Install Dependencies

```bash
# Backend
cd ~/projects/project\ MC/MC/mc_backend
npm install

# Frontend
cd ~/projects/project\ MC/MC/mc_frontend
npm install
```

---

### Step 2: Setup Environment Variables

**Backend (.env)**
```bash
cd ~/projects/project\ MC/MC/mc_backend
cat > .env << 'EOF'
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cff72641f97d7b6957e7b9e9
OPBNBSCAN_API_KEY=dummy
EOF
```

**Frontend (.env.local)**
```bash
cd ~/projects/project\ MC/MC/mc_frontend
cat > .env.local << 'EOF'
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982
EOF
```

---

## TESTING SESSION (Lakukan setiap kali testing)

### Terminal 1️⃣: Start Hardhat Node

```bash
cd ~/projects/project\ MC/MC/mc_backend
npx hardhat node
```

**Tunggu output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
...
```

✅ Biarkan terminal ini tetap berjalan!

---

### Terminal 2️⃣: Deploy Smart Contract

**Buka terminal BARU:**
```bash
cd ~/projects/project\ MC/MC/mc_backend
npx hardhat run scripts/deploy.ts --network hardhat
```

**Output yang diharapkan:**
```
Deploying contracts with deployer account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
MynnGift deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MynnCrypt deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Deployment completed successfully!
```

✅ Jika deployment sukses, tutup terminal ini dan lanjut ke step berikutnya

---

### Step 3️⃣: Setup MetaMask untuk Hardhat

#### 3a. Tambah Custom Network
```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency: ETH
```

**Langkah di MetaMask:**
1. MetaMask → Settings → Networks → Add Network
2. Isi data di atas
3. Save

#### 3b. Import Account
1. MetaMask → My Accounts (top-right icon)
2. Import Account
3. Paste Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476cff72641f97d7b6957e7b9e9`
4. Nama account: "Hardhat Account 0"
5. Import

**Verifikasi:** Balance harus 10,000 ETH

---

### Terminal 3️⃣: Start Frontend Dev Server

**Buka terminal BARU:**
```bash
cd ~/projects/project\ MC/MC/mc_frontend
npm run dev
```

**Output:**
```
VITE v6.3.5  ready in 274 ms
➜  Local:   http://localhost:5173/
```

✅ Frontend siap di `http://localhost:5173`

---

## TEST SCENARIOS

### TEST 1: First-Time User Registration

**Pre-requisites:**
- ✅ Hardhat node running (Terminal 1)
- ✅ Contracts deployed (Terminal 2)
- ✅ Frontend running (Terminal 3)
- ✅ MetaMask connected to Hardhat Local
- ✅ MetaMask shows 10,000 ETH balance

**Test Steps:**

1. **Buka Frontend**
   ```
   Browser → http://localhost:5173
   ```

2. **Verifikasi Landing Page**
   - [ ] Logo terlihat
   - [ ] Menu navigation terlihat
   - [ ] "Connect Wallet" button terlihat

3. **Connect Wallet**
   - [ ] Klik tombol "Connect Wallet"
   - [ ] Modal dialog muncul (MetaMask, WalletConnect, TrustWallet)
   - [ ] Klik "MetaMask"
   - [ ] MetaMask popup muncul
   - [ ] Klik "Next" → "Connect"

4. **Verify Connection**
   - [ ] Header menampilkan wallet address (shortened, e.g., `0xf39F...92266`)
   - [ ] Tombol "Disconnect" muncul

5. **Check Registration Status**
   - [ ] Header check contract: `id(userAddress)` → empty (not registered)
   - [ ] Registration form harus muncul
   - [ ] Di console: `console.log('User ID:', userId)` → empty

6. **Fill Registration Form**
   ```
   Referral ID: A8888NR
   Email: test@example.com
   Phone: +6281234567890
   ```
   - [ ] Form validation: all fields required
   - [ ] Referral ID format valid (regex: /^[A-Z]\d{4}[NW]R$/)

7. **Submit Registration**
   - [ ] Klik "Register" button
   - [ ] MetaMask popup: Review transaction
   - [ ] Amount: 0.0044 ETH (level 1 cost)
   - [ ] Gas fee: ~0.001 ETH
   - [ ] Klik "Confirm" di MetaMask

8. **Wait for Confirmation**
   - [ ] Status: "Processing..." (spinner)
   - [ ] Wait ~5-10 detik untuk block confirmation
   - [ ] Status: "Success!"

9. **Auto-Redirect**
   - [ ] Browser auto-redirect ke `/dashboard`
   - [ ] Dashboard menampilkan user data
   - [ ] Welcome message dengan user ID (format: `A####WR`)

10. **Verify Dashboard Data**
    - [ ] User ID terlihat
    - [ ] Balance/income terlihat
    - [ ] Level: 1 (initial level)
    - [ ] Team members: 0 (no referrals yet)

---

### TEST 2: Return User Auto-Redirect

**Pre-requisites:**
- ✅ User sudah register dari TEST 1
- ✅ Frontend masih berjalan

**Test Steps:**

1. **Disconnect Wallet**
   - [ ] Header → Klik disconnect button
   - [ ] Verify: Header kembali ke "Connect Wallet"

2. **Connect Wallet Kembali**
   - [ ] Klik "Connect Wallet"
   - [ ] Approve di MetaMask
   - [ ] Address ditampilkan di header

3. **Verify Auto-Redirect**
   - [ ] Dashboard langsung muncul (NO registration form!)
   - [ ] User data sudah terupdate
   - [ ] Navigation: home page → dashboard (automatic)

---

### TEST 3: Invalid Referral ID

**Pre-requisites:**
- ✅ Hardhat node & contracts deployed
- ✅ Frontend running
- ✅ NEW wallet (belum register)

**Test Steps:**

1. **Connect Wallet** (account baru)
   ```bash
   # Buat account baru di MetaMask atau gunakan Account #1
   ```

2. **Try Invalid Referral**
   - [ ] Registration form ada
   - [ ] Masukkan Referral ID: `INVALID123`
   - [ ] System harus reject (show error)
   - [ ] Format check fail → form disabled

3. **Try Valid Format tapi User Doesn't Exist**
   - [ ] Masukkan: `B0000NR` (valid format tapi user tidak ada)
   - [ ] Error: "Referral not found"
   - [ ] Registration button disabled

4. **Try Valid Referral** (A8888NR)
   - [ ] Masukkan: `A8888NR`
   - [ ] No error
   - [ ] Proceed dengan registration (seperti TEST 1)

---

### TEST 4: Different Wallets

**Pre-requisites:**
- ✅ Account 0 sudah register
- ✅ Need Account 1 untuk test

**Test Steps:**

1. **Switch ke Account #1 di MetaMask**
   ```
   MetaMask top-right → Select Account #1
   Address: 0x70997970C51812e339D9B73b0245ad59e1ff47D0
   ```

2. **Reload Frontend**
   ```
   http://localhost:5173 (F5 refresh)
   ```

3. **Connect Wallet**
   - [ ] Should connect Account #1
   - [ ] Address di header: `0x7099...7D0`

4. **Verify Not Registered**
   - [ ] Registration form muncul
   - [ ] Account #1 is new user

5. **Register Account #1 dengan Referral A8889WR**
   ```
   Referral ID: A8889WR  (use Account 0's ID)
   Email: account1@example.com
   Phone: +6281111111111
   ```
   - [ ] Transaction succeed
   - [ ] User ID generated: `A####WR` (dengan referral!)
   - [ ] Auto-redirect ke dashboard

6. **Verify Referral Structure**
   - [ ] Account 0 dashboard → Team: 1 member (Account 1)
   - [ ] Account 1 dashboard → Referrer: A8889WR (Account 0)

---

## TROUBLESHOOTING

### Problem 1: MetaMask Error "RPC URL is blocked"

**Solution:**
```bash
# Ensure Hardhat node running:
npm hardhat node

# MetaMask settings:
- RPC URL: http://127.0.0.1:8545 (NOT https://)
- Test: Send 0 ETH to yourself → should work
```

---

### Problem 2: Contract Address Mismatch

**Issue:** Error "Contract not found" di frontend

**Solution:**
1. Verify deployment output:
   ```bash
   # Terminal 2, setelah deploy:
   MynnCrypt deployed to: 0x...
   MynnGift deployed to: 0x...
   ```

2. Update .env.local frontend:
   ```bash
   VITE_MYNNCRYPT_ADDRESS=0x<from_deployment>
   VITE_MYNNGIFT_ADDRESS=0x<from_deployment>
   ```

3. Restart dev server (Terminal 3):
   ```bash
   npm run dev
   ```

---

### Problem 3: Transaction Fails "gas limit exceeded"

**Issue:** Registration transaction reverted

**Solution:**
```bash
# Check Hardhat node logs (Terminal 1)
# Usually: insufficient balance OR invalid params

# Verify:
1. Account balance: 10,000 ETH (show in MetaMask)
2. Fee amount: 0.0044 ETH (correct level[0])
3. Referral ID exists in contract
```

---

### Problem 4: Auto-Redirect Not Working

**Debug:**
```javascript
// Open browser console (F12)
console.log('isConnected:', isConnected);        // Should be true
console.log('userId:', userId);                  // Should NOT be empty after register
console.log('navigate:', location.pathname);     // Check URL

// Check Network
console.log('chain ID:', chain?.id);             // Should be 1337
```

**Fix:**
1. Clear localStorage: MetaMask → Settings → Advanced → Clear activity
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Reconnect wallet

---

### Problem 5: Frontend Can't Connect to Hardhat Node

**Issue:** "No provider detected"

**Solution:**
```bash
# Verify Hardhat node is running:
# Terminal 1 should show: "Started HTTP... at http://127.0.0.1:8545/"

# Check MetaMask:
# 1. MetaMask → Settings → Networks → Hardhat Local
# 2. RPC URL: http://127.0.0.1:8545 (✓ exactly this)
# 3. Test connection: send 0 ETH to yourself

# If still fail:
# MetaMask → Clear activity tab → Reconnect
```

---

## CHECKLIST SEBELUM DEPLOY KE TESTNET

- [ ] TEST 1: First registration works ✓
- [ ] TEST 2: Auto-redirect works ✓
- [ ] TEST 3: Referral validation works ✓
- [ ] TEST 4: Multiple users work ✓
- [ ] Browser console: No errors ✓
- [ ] MetaMask: Transactions confirm ✓
- [ ] Dashboard: All data displays correctly ✓
- [ ] Network switching: Works correctly ✓

---

## NEXT: DEPLOY KE TESTNET

Setelah semua test di Hardhat sukses:

```bash
# 1. Update .env dengan testnet key
PRIVATE_KEY=your_testnet_pk

# 2. Deploy ke opBNB Testnet
cd ~/projects/project\ MC/MC/mc_backend
npx hardhat run scripts/deploy.ts --network opbnbTestnet

# 3. Update frontend .env.local dengan contract address dari testnet deployment

# 4. Update App.jsx to use testnet RPC

# 5. Test di testnet (same test scenarios)
```

---

## USEFUL COMMANDS

```bash
# Verify Hardhat is running
lsof -i :8545

# Kill Hardhat if stuck
pkill -f "hardhat node"

# Check MetaMask logs
# MetaMask → Settings → Advanced → Download state logs

# View Hardhat Node Logs (Ctrl+C to stop)
cd ~/projects/project\ MC/MC/mc_backend && npx hardhat node

# Clear hardhat cache
rm -rf ~/projects/project\ MC/MC/mc_backend/cache
rm -rf ~/projects/project\ MC/MC/mc_backend/artifacts
```

---

**Status:** Ready to test! 🚀
**Network:** Hardhat Local (1337)
**Last Updated:** 30 November 2025
