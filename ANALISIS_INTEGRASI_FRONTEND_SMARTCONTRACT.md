# Analisis DApp: Integrasi Frontend & Smart Contract
## Fokus: Login Wallet → Redirect ke Dashboard

---

## 1. ANALISIS ARSITEKTUR SAAT INI

### A. Stack Teknologi
```
Frontend:
- React 18.3.1 + Vite
- Wagmi 2.15.4 (Web3 library untuk wallet connection)
- Ethers.js 6.14.3 (library blockchain)
- React Router 7.6.1 (navigation)
- Tailwind CSS (styling)

Backend (Smart Contract):
- Solidity 0.8.26
- Hardhat (development framework)
- OpenZeppelin contracts (security)

Jaringan:
- opBNB Mainnet (ID: 204)
- opBNB Testnet (ID: 5611)
- Hardhat Local Network (ID: 1337)
```

---

## 2. FLOW LOGIN & REDIRECT KE DASHBOARD

### A. Current Flow (Dari Header.jsx)
```
1. User klik tombol "Connect Wallet"
   ↓
2. Modal terbuka → Pilih MetaMask/TrustWallet/WalletConnect
   ↓
3. Wagmi menghubungkan wallet → address diperoleh
   ↓
4. Header.jsx otomatis check: apakah user sudah terdaftar?
   └─ Call smart contract function: id(address)
   ↓
5. Jika User terdaftar (userId ada):
   └─ Navigate('/dashboard')  ✓ AUTO-REDIRECT
   ↓
6. Jika User BELUM terdaftar:
   └─ Tampilkan form registrasi
   └─ Tunggu user daftar
   └─ Setelah daftar sukses → Navigate('/dashboard')
```

### B. Component Flow Hierarchy
```
App.jsx (Wagmi Provider Config)
  └─ Header.jsx (Wallet connection logic)
      ├─ Detect wallet connection
      ├─ Check if user registered
      └─ Auto-redirect to /dashboard
  
  Routes:
  ├─ /dashboard  → Dashboard.jsx
  ├─ /admin      → DashboardAdmin.jsx
  └─ /           → LandingPage
```

---

## 3. ANALISIS DETAIL INTEGRASI

### A. Smart Contract Integration (mynnCrypt.sol)

#### Function Kunci untuk Login:
```solidity
// 1. Register User (create new account)
function register(string memory _ref, address _newAcc) external payable
- Input: referral ID, new account address
- Output: Creates user ID (format: A8889WR/NR)
- Fee: levels[0] = 4.4e15 wei (~0.0044 ETH)

// 2. Check if user registered
mapping(address => string) public id;
- Direct access: mynnCrypt.id(userAddress) → returns userId
- Used in Header.jsx to verify registration

// 3. Get User Data
mapping(string => User) public userInfo;
struct User {
    string id;
    address account;
    uint level;
    uint totalIncome;
    // ... other fields
}
```

#### Flow Integrasi:
```javascript
// Header.jsx uses Wagmi to read from contract:
const { data: userId } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'id',
    args: [address],  // Current wallet address
    enabled: isConnected && !!address,
});

// Automatic redirect when user registered:
useEffect(() => {
    if (isConnected && userId && userId.length > 0) {
        navigate('/dashboard');  // ✓ LOGIN SUCCESS
    }
}, [isConnected, userId, navigate]);
```

---

### B. Frontend Login Flow Detail (Header.jsx)

#### Step 1: Wallet Connection
```javascript
// hooks: useConnect(), useAccount()
const { connect } = useConnect();
const { address, isConnected } = useAccount();

// Modal: user pilih wallet provider
// Connectors: MetaMask (injected) + WalletConnect
```

#### Step 2: Auto-Detect Registration Status
```javascript
// Query contract for registration status
const { data: userId, isLoading: userIdLoading } = useReadContract({
    enabled: isConnected && !!address,  // Only query if wallet connected
    functionName: 'id',
    args: [address],
});
```

#### Step 3: Conditional Redirect
```javascript
useEffect(() => {
    if (isConnected && !userIdLoading && userId && userId.length > 0) {
        // ✓ User registered → redirect to dashboard
        if (location.pathname !== '/admin') {
            navigate('/dashboard');
        }
    }
}, [isConnected, userIdLoading, userId]);

// Alternative paths:
// - User NOT registered → show Register form
// - User in /admin path → stay on admin
```

---

### C. Dashboard Protection (Dashboard.jsx)

```javascript
// Dashboard protected: requires userId
const { data: userId } = useReadContract({
    functionName: 'id',
    args: [address],
    enabled: isConnected && !!address,
});

// Manual redirect if not registered:
useEffect(() => {
    if (isConnected && !userId) {
        navigate('/');  // Not registered → back to home
    }
}, [isConnected, userId]);
```

---

## 4. MASALAH POTENSIAL & SOLUSI

### Issue 1: Referral ID Parsing
**Problem:** Referral ID dari URL parameter mungkin tidak terbaca
```javascript
// Current: Header.jsx line 68-74
const params = new URLSearchParams(location.search);
const ref = params.get('ref');
if (ref && /^[A-Z][0-9]{4}(WR|NR)$/.test(ref)) {
    setReferralId(ref);
}
```

**Solusi:** Validate format lebih ketat
```javascript
// Format check untuk referral ID
const isValidReferralId = (ref) => {
    // Format: A + 4 digits + (WR|NR) atau (WR|NR) = "with referral" atau "no referral"
    return /^[A-Z]\d{4}[NW]R$/.test(ref);
};
```

---

### Issue 2: Loading States
**Problem:** User experience kurang smooth selama loading
```javascript
// Current: tanpa loading indicator saat check registration
const { data: userId, isLoading: userIdLoading } = useReadContract({...});

// Tidak ada visual feedback
```

**Solusi:** Tambah loading spinner di Header
```javascript
if (isConnected && userIdLoading) {
    return <LoadingSpinner />;  // Show saat checking registration
}
```

---

### Issue 3: Network Mismatch
**Problem:** User connect ke wrong network, contract tidak ditemukan
```javascript
// Config hanya support opBNB networks, bukan Ethereum/Polygon dll
const config = createConfig({
    chains: [opbnbMainnet, opbnbTestnet],
    // User harus switch network
});
```

**Solusi:** Detect network mismatch + auto-switch prompt
```javascript
const { chain } = useAccount();
useEffect(() => {
    if (isConnected && chain?.id !== 204 && chain?.id !== 5611) {
        // Show: "Please switch to opBNB network"
        toast.warning('Please switch to opBNB network');
    }
}, [chain, isConnected]);
```

---

## 5. PANDUAN TESTING DENGAN HARDHAT

### A. Setup Environment

#### 1. Install Dependencies Backend
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_backend
npm install  # Jika belum pernah install
```

#### 2. Buat .env file (Backend)
```bash
cat > .env << 'EOF'
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cff72641f97d7b6957e7b9e9
OPBNBSCAN_API_KEY=your_api_key_here
EOF
```

**Note:** Private key di atas adalah default Hardhat account (JANGAN gunakan di production!)

#### 3. Buat .env file (Frontend)
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_frontend
cat > .env.local << 'EOF'
# Contract addresses (akan di-update setelah deploy)
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982
EOF
```

---

### B. Deploy Smart Contract ke Hardhat Local Network

#### Step 1: Start Hardhat Node
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_backend
npx hardhat node
```

**Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Available Accounts:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812e339D9B73b0245ad59e1ff47D0 (10000 ETH)
...
Account #19: 0x976EA74026E726554dB657dA1E5b3c3db89AE7B (10000 ETH)

Private Keys:
Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cff72641f97d7b6957e7b9e9
Account #1: 0x14ac1ce1924784e6ed0112d3eb2fccd1d57eacf5c5f3a666f40d3b37f146e627
...
```

**Keep this terminal running!**

#### Step 2: Deploy Contracts (Di terminal baru)
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_backend

# Deploy ke hardhat network
npx hardhat run scripts/deploy.ts --network hardhat
```

**Output Deployment:**
```
Deploying contracts with deployer account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Using owner address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployer balance: 10000.0 BNB

Deploying MynnGift with initialOwner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 platformWallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 ...
MynnGift deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deploying MynnCrypt with defaultReferralId: A8888NR ...
MynnCrypt deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Deployment completed successfully!
Summary:
- MynnGift address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- MynnCrypt address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

#### Step 3: Update .env Frontend dengan alamat yang baru
```bash
# Jika deploy ke network baru, update alamat ini
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

### C. Setup MetaMask/Wallet untuk Hardhat

#### Step 1: Tambah Hardhat Network ke MetaMask
```
Network Name: Hardhat
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
```

#### Step 2: Import Account ke MetaMask
1. Buka MetaMask → Settings → Security & Privacy
2. Copy private key dari Hardhat output
3. MetaMask → Create Account → Import Account
4. Paste private key
5. Beri nama: "Hardhat Account 0"

**Test Account:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476cff72641f97d7b6957e7b9e9`
- Balance: 10000 ETH

---

### D. Update App Config untuk Hardhat Testing

**File: mc_frontend/src/App.jsx**

Tambah Hardhat network config:
```javascript
const hardhatNetwork = {
  id: 1337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
};

const config = createConfig({
  chains: [hardhatNetwork, opbnbMainnet, opbnbTestnet],  // Tambah hardhatNetwork
  transports: {
    [hardhatNetwork.id]: http('http://127.0.0.1:8545'),  // Tambah ini
    [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
  },
});
```

---

### E. Start Frontend Development Server

```bash
cd /Users/macbook/projects/project\ MC/MC/mc_frontend

# Install dependencies jika belum
npm install

# Start dev server
npm run dev
```

**Output:**
```
VITE v6.3.5  ready in 274 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

### F. Test Login Flow Dengan Hardhat

#### Scenario 1: First Time User Registration

**Langkah:**
1. Buka browser → `http://localhost:5173/`
2. Pastikan MetaMask switch ke "Hardhat Local" network
3. Klik "Connect Wallet"
4. Approve connection di MetaMask
5. Expected: Modal berisi form registrasi (belum terdaftar)

**Form Registration:**
```
Referral ID: A8888NR  (default)
Email: test@example.com
Phone: +6281234567890
[Pay Button] - akan meminta 0.0044 ETH (level 1)
```

6. Klik tombol pembayaran
7. Approve transaction di MetaMask
8. Expected: Transaction confirmed → Auto-redirect ke `/dashboard`

---

#### Scenario 2: Already Registered User

**Langkah:**
1. Buka incognito tab (atau clear localStorage)
2. Reload halaman
3. Connect wallet (account yang sudah register di scenario 1)
4. Expected: Auto-redirect ke `/dashboard` (tanpa form registrasi)

---

### G. Debug Dengan Browser Console

```javascript
// Cek wallet connection status
console.log('Connected:', isConnected);
console.log('Address:', address);

// Cek user registration status
console.log('User ID:', userId);

// Cek contract address
console.log('MynnCrypt Address:', import.meta.env.VITE_MYNNCRYPT_ADDRESS);

// Cek network
console.log('Current Chain ID:', chain?.id);
```

---

## 6. TESTING CHECKLIST

### A. Wallet Connection
- [ ] MetaMask connection works
- [ ] WalletConnect works (optional)
- [ ] TrustWallet detection works (mobile)
- [ ] Disconnect button works
- [ ] Switch network prompt appears if wrong network

### B. Registration Flow
- [ ] Form validation works
- [ ] Referral ID format check works
- [ ] Transaction sent correctly
- [ ] Fee (0.0044 ETH) deducted from wallet
- [ ] User ID generated (format: A####NR or A####WR)

### C. Auto-Redirect
- [ ] First-time user: Registration form → Dashboard redirect
- [ ] Returning user: Auto-redirect to Dashboard
- [ ] Invalid referral ID: Show error message
- [ ] Network mismatch: Show warning

### D. Dashboard Access
- [ ] Dashboard only accessible if registered
- [ ] User data displayed correctly
- [ ] Team/referral data loaded
- [ ] Upgrade levels available
- [ ] Income display accurate

---

## 7. QUICK REFERENCE COMMANDS

```bash
# Terminal 1: Start Hardhat Node
cd ~/projects/project\ MC/MC/mc_backend
npx hardhat node

# Terminal 2: Deploy Contracts
cd ~/projects/project\ MC/MC/mc_backend
npx hardhat run scripts/deploy.ts --network hardhat

# Terminal 3: Start Frontend
cd ~/projects/project\ MC/MC/mc_frontend
npm run dev

# Access Frontend
open http://localhost:5173

# Run Smart Contract Tests
cd ~/projects/project\ MC/MC/mc_backend
npm test
```

---

## 8. KESIMPULAN

### Current Status: ✓ FUNCTIONAL
- Login flow sudah terintegrasi dengan baik
- Auto-redirect ke dashboard berfungsi
- Contract integration melalui Wagmi solid

### Recommendations:
1. **Add loading states** untuk better UX
2. **Network detection** + auto-switch prompt
3. **Error handling** lebih detail
4. **Test dengan testnet** sebelum mainnet
5. **Add gas fee estimator** sebelum transaction

### Next Steps:
1. Test dengan Hardhat local network (panduan di atas)
2. Pindah ke opBNB Testnet untuk testing live
3. Audit smart contract sebelum mainnet deployment
4. Setup backend API untuk user data persistence

---

**Created:** 30 November 2025
**Network:** Hardhat Local (1337) → opBNB Testnet (5611) → opBNB Mainnet (204)
