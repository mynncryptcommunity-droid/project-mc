# 🚀 MynnGift Testnet Deployment Guide

## Network: opBNB Testnet (Chain ID: 5611)
- **RPC**: https://opbnb-testnet-rpc.bnbchain.org
- **Explorer**: https://testnet.opbnbscan.com
- **Faucet**: https://www.opbnb.com/bridge (untuk opBNB test token)

---

## Step 1: Persiapan Environment

### 1.1 Setup Private Key
```bash
cd /Users/macbook/projects/project\ MC/MC/mc_backend
```

Buat atau edit `.env` file:
```env
PRIVATE_KEY=your_private_key_here
OPBNBSCAN_API_KEY=your_opbnbscan_api_key_here
```

⚠️ **PENTING**: Jangan share PRIVATE_KEY di mana saja!

### 1.2 Dapatkan Private Key
Dari MetaMask:
1. Buka MetaMask
2. Click icon account → Settings
3. Click "Export Private Key"
4. Copy & paste ke `.env`

### 1.3 Dapatkan opBNB Test Tokens
1. Go to https://www.opbnb.com/bridge
2. Connect wallet dengan MetaMask
3. Switch network ke **opBNB Testnet**
4. Faucet request opBNB (dapat ~1 opBNB)

---

## Step 2: Deploy Smart Contracts ke Testnet

### 2.1 Deploy MynnCrypt Contract
```bash
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

**Output akan menunjukkan:**
```
MynnCrypt deployed to: 0x...
MynnGift deployed to: 0x...
```

💾 **Simpan addresses ini!**

### 2.2 Verify Di opBNBScan (Optional but recommended)
```bash
npx hardhat verify --network opbnbTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Step 3: Update Frontend Config

### 3.1 Update Contract Addresses
Edit: `mc_frontend/src/config.js` (atau file config yang ada)

```javascript
export const CONTRACTS = {
  MYNNCRYPT: {
    address: '0x...', // Dari deploy script
    abi: MynnCryptABI,
  },
  MYNNGIFT: {
    address: '0x...', // Dari deploy script
    abi: MynnGiftABI,
  },
};

export const NETWORKS = {
  opbnbTestnet: {
    chainId: 5611,
    name: 'opBNB Testnet',
    rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
    blockExplorer: 'https://testnet.opbnbscan.com',
  },
};
```

### 3.2 Update ABI Files (Jika diperlukan)
Copy terbaru dari `mc_backend/artifacts/contracts/` ke `mc_frontend/src/abis/`:

```bash
cp mc_backend/artifacts/contracts/mynnCrypt.sol/MynnCrypt.json mc_frontend/src/abis/
cp mc_backend/artifacts/contracts/mynnGift.sol/MynnGift.json mc_frontend/src/abis/
```

---

## Step 4: Setup Frontend untuk Testnet

### 4.1 Update wagmi/Viem Config
Edit: `mc_frontend/src/wagmi.config.ts` (atau setup wallet config)

```typescript
import { createConfig, http } from '@wagmi/core'
import { opBnb } from 'viem/chains'

// Define opBNB Testnet
export const opBnbTestnet = {
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: { name: 'opBNB', symbol: 'opBNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.opbnbscan.com' },
  },
}

export const wagmiConfig = createConfig({
  chains: [opBnbTestnet],
  transports: {
    [opBnbTestnet.id]: http(),
  },
})
```

### 4.2 Add Testnet ke MetaMask
```javascript
// Di console browser:
ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x15eb',
    chainName: 'opBNB Testnet',
    rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org'],
    blockExplorerUrls: ['https://testnet.opbnbscan.com'],
    nativeCurrency: { name: 'opBNB', symbol: 'opBNB', decimals: 18 },
  }],
})
```

---

## Step 5: Testing di Testnet

### 5.1 Start Frontend
```bash
cd mc_frontend
npm run dev
# Akses: http://localhost:5174
```

### 5.2 Checklist Testing
- [ ] MetaMask connect sukses
- [ ] Chain selector menunjukkan "opBNB Testnet"
- [ ] Wallet menunjukkan opBNB balance
- [ ] Dashboard loading data
- [ ] MynnGift menu bisa dibuka
- [ ] Bisa donate di Stream A (0.0081 opBNB)
- [ ] History tab menunjukkan transactions
- [ ] Rank visualization update real-time
- [ ] Stream B accessible untuk Level 8+ users

### 5.3 Debugging
Jika ada error, check:
1. **Browser Console** (F12 → Console)
   - Lihat error messages
   - Check network requests
2. **MetaMask** 
   - Pastikan network benar (opBNB Testnet)
   - Pastikan ada opBNB balance
3. **Contract Addresses**
   - Pastikan addresses di config matching dengan deploy output
4. **ABI Files**
   - Pastikan ABI files sudah updated

---

## Step 6: Troubleshooting

### Error: "Network RPC not responding"
```bash
# Cek RPC connection
curl https://opbnb-testnet-rpc.bnbchain.org -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Response harusnya: 0x15eb (5611 in hex)
```

### Error: "Contract not found"
- Check contract address di config
- Verify di https://testnet.opbnbscan.com
- Pastikan contract deployed dengan benar

### Error: "User rejected transaction"
- MetaMask dialog muncul tapi user click reject
- Confirm transaction di MetaMask

### Error: "Insufficient balance"
- Dapatkan lebih banyak opBNB dari faucet
- Atau request dari wallet lain

---

## Step 7: Deploy ke Mainnet (Later)

Ketika sudah tested & siap mainnet:

```bash
# Update .env dengan mainnet key
PRIVATE_KEY=mainnet_private_key

# Deploy ke mainnet
npx hardhat run scripts/deploy.ts --network opbnb

# Update frontend config ke mainnet addresses
```

---

## Useful Links

- **opBNB Testnet Faucet**: https://www.opbnb.com/bridge
- **opBNBScan Testnet**: https://testnet.opbnbscan.com
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org/v6/
- **Wagmi Docs**: https://wagmi.sh/

---

## Quick Commands Reference

```bash
# Backend
cd mc_backend
npx hardhat run scripts/deploy.ts --network opbnbTestnet  # Deploy
npx hardhat run scripts/deploy.ts --network localhost      # Local dev

# Frontend
cd mc_frontend
npm run dev                                                # Start dev server
npm run build                                              # Production build

# Check Network
npx hardhat network-info --network opbnbTestnet
```

---

Siap? Mulai dari Step 1! 🚀
