# Frontend Testing Guide - After Deployment Fix

## Current Status
✅ Contracts deployed to localhost (http://localhost:8545)
✅ Frontend running on http://localhost:5173  
✅ ABIs properly extracted in App.jsx
✅ Debug components integrated

## What You Should See on Frontend

### 1. Check Debug Components (Top-Left Corner)
When you load http://localhost:5173, you should see **three debug panels** in the top-left:

**1️⃣ DebugInfo** (Blue panel)
- Shows: Contract addresses from .env
- Should display:
  ```
  Contracts configured:
  - MynnCrypt: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  - MynnGift: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  ```

**2️⃣ ABIDebugger** (Gray panel)  
- Shows: ABI extraction status
- Should display:
  ```
  ✅ ABI is array: true
  ✅ ABI length: [function count]
  ✅ "id" function found: true
  ```

**3️⃣ ContractTest** (Dark panel)
- Shows: Real contract bytecode verification
- Should display:
  ```
  ✅ contract_exists: Contract bytecode EXISTS
  ✅ call_id: id() returned A8888NR
  ```

### 2. If You See Errors

#### Error: "abi.filter is not a function"
**What it means:** ABI extraction failed
**Solution:**
1. Check if ABIDebugger shows "ABI is array: false"
2. Check browser console for error details
3. Verify `.env` has correct contract addresses
4. Clear browser cache and refresh

#### Error: "Contract bytecode EMPTY" in ContractTest
**What it means:** Contracts not deployed to localhost node
**Solution:**
```bash
# Stop frontend
# Restart Hardhat node in a new terminal:
cd /Users/macbook/projects/project\ MC/MC/mc_backend
npx hardhat node

# In another terminal, deploy:
npx hardhat run scripts/deploy.ts --network localhost

# Refresh frontend
```

#### Error: "id() call failed"  
**What it means:** Contract calls not reaching blockchain
**Solution:**
1. Verify `eth_getCode` returns bytecode:
   ```bash
   curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512","latest"],"id":1}'
   ```
2. If returns "0x", redeploy contracts to localhost
3. If returns bytecode, check Wagmi/Viem configuration

## Testing Workflow

### Step 1: Verify Contract Deployment
```bash
# In mc_backend folder
npx hardhat run verify_contract.ts --network localhost

# Should show:
# ✅ id(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) returned: A8888NR
```

### Step 2: Check Frontend Debug Panels
1. Open http://localhost:5173
2. Look at top-left corner
3. Verify all three debug panels show ✅ (success)

### Step 3: Register Platform Wallet (Manual Test)
Currently the registration function has ethers version issues.  
**Alternative:** Modify `register_platform_wallet.ts` to use eth_sendTransaction instead of contract.register()

### Step 4: Test Dashboard Access
```
Navigation: http://localhost:5173/dashboard
Expected: Dashboard loads without errors
Check console: Should see contract read calls
```

## Frontend Files Modified

### App.jsx (Lines 14-25, 174-179)
```jsx
// Lines 16-23: ABI Imports & Extraction
import mynncryptAbiRaw from './abis/MynnCrypt.json';
import mynngiftAbiRaw from './abis/MynnGift.json';
import ABIDebugger from './components/ABIDebugger';
import ContractTest from './components/ContractTest';

// Extract ABI from Hardhat artifact format
const mynncryptAbi = mynncryptAbiRaw.abi || mynncryptAbiRaw;
const mynngiftAbi = mynngiftAbiRaw.abi || mynngiftAbiRaw;

// Lines 174-179: Render Debug Components
<DebugInfo />
<ABIDebugger />
<ContractTest />
```

### New Components
- **ABIDebugger.jsx**: Verifies ABI extraction
- **ContractTest.jsx**: Tests contract calls and bytecode

## Important Notes

### 1. Network Configuration
- Frontend connects to: `localhost:5173` → Wagmi config
- Wagmi connects to: `http://localhost:8545` (Hardhat node via JSON-RPC)
- **DO NOT** connect to other networks while testing locally

### 2. Contract Addresses
Must match exactly in:
1. Frontend `.env` file
2. Hardhat deployment output
3. Hardhat network state

### 3. Deploying Contracts
**Remember:** Always use `--network localhost`, not `--network hardhat`

```bash
# WRONG ❌
npx hardhat run scripts/deploy.ts --network hardhat

# CORRECT ✅
npx hardhat run scripts/deploy.ts --network localhost
```

## Troubleshooting Checklist

- [ ] Hardhat node running on port 8545?
  ```bash
  lsof -i :8545
  ```

- [ ] Frontend running on port 5173?
  ```bash
  lsof -i :5173
  ```

- [ ] Contracts deployed to localhost (not ephemeral)?
  ```bash
  curl http://localhost:8545 -X POST ... eth_getCode [address] latest
  # Should return long hex string (bytecode), not "0x"
  ```

- [ ] Frontend .env has correct addresses?
  ```bash
  cat /Users/macbook/projects/project\ MC/MC/mc_frontend/.env | grep VITE_
  ```

- [ ] Debug components visible in browser?
  - Check top-left corner for colored panels
  - Open browser DevTools (F12) → Console for detailed logs

- [ ] No console errors?
  ```
  Press F12 in browser → Console tab → Should show:
  - ✅ ABIDebugger logs
  - ✅ ContractTest logs  
  - ✅ Network requests successful
  ```

## Browser DevTools Tips

### Console Commands (after page loads)
```javascript
// Check if Wagmi is connected
window.wagmi

// Check ABI in memory
window.__mynnCryptAbi  // Needs to be added to window in App.jsx

// Check contract addresses from env
console.log(import.meta.env.VITE_MYNNCRYPT_ADDRESS)
```

### Disable Cache
1. Open DevTools (F12)
2. Settings (gear icon) → Network
3. Check: "Disable cache (while DevTools is open)"

## Success Indicators

You'll know everything is working when:

1. ✅ All three debug panels show success (green checks)
2. ✅ Browser console has no errors
3. ✅ `ContractTest` shows "contract_exists: EXISTS"
4. ✅ `ContractTest` shows "call_id: id() returned A8888NR"
5. ✅ Dashboard loads without crashing
6. ✅ User data displays on dashboard (after registration)

---

**Last Updated:** After Deployment Fix
**Status:** 🟢 Ready for Testing
