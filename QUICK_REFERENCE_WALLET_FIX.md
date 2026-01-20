# QUICK REFERENCE: MynnCrypt Owner Access - Testing & Troubleshooting

## 🚀 QUICK TEST (5 minutes)

### 1. Deploy Fresh Instance
```bash
cd /Users/macbook/projects/project MC/MC/smart_contracts
npx hardhat run scripts/deploy.ts --network hardhat
```

### 2. Check .env Updated
```bash
cat ../frontend/.env | grep VITE_PLATFORM_WALLET
```
**Expected:** Shows deployer wallet address (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 for hardhat)

### 3. Start Frontend
```bash
cd ../frontend
npm run dev
```

### 4. Test Access
- Connect with owner wallet → Dashboard ✅ Full Access
- Connect with other wallet → Dashboard ❌ Unauthorized

---

## 🔍 VERIFICATION CHECKLIST

```
□ Deploy script runs successfully
  └─ Check: "Deployment completed successfully!"

□ Frontend .env updated
  └─ Check: VITE_PLATFORM_WALLET matches deployed owner

□ Frontend starts without errors
  └─ Check: npm run dev completes

□ Owner wallet can access dashboard
  └─ Check: No "unauthorized" message

□ Non-owner wallet blocked
  └─ Check: Shows "unauthorized" or redirects
```

---

## 🐛 COMMON ISSUES & FIXES

| Issue | Cause | Solution |
|-------|-------|----------|
| `VITE_PLATFORM_WALLET` not updated | File permission or path issue | Manual edit: `nano frontend/.env` |
| Owner wallet shows as "unknown" | .env not reloaded | Restart frontend: `Ctrl+C` → `npm run dev` |
| Wallet not connecting | Network mismatch | Verify MetaMask network matches VITE_NETWORK |
| Deploy fails | Insufficient gas | Fund wallet with BNB |
| Admin page blank | Cache issue | Clear browser cache + restart frontend |

---

## 📝 MANUAL FIX (If Auto-Update Fails)

```bash
# Navigate to frontend config
cd /Users/macbook/projects/project MC/MC/frontend

# Edit .env
nano .env

# Find: VITE_PLATFORM_WALLET=0x...
# Replace with: VITE_PLATFORM_WALLET=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Save: Ctrl+O, Enter, Ctrl+X

# Verify
cat .env | grep VITE_PLATFORM_WALLET

# Restart frontend
npm run dev
```

---

## 🔗 WALLET ADDRESS REFERENCE

| Network | Owner Address | Notes |
|---------|---------------|-------|
| Hardhat Local | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Account #0, 10000 ETH |
| opBNB Testnet | `0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B` | From .env PLATFORM_WALLET |
| opBNB Mainnet | `0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928` | Actual owner wallet |

---

## 📊 QUICK DIAGNOSTIC

### Check What Contract Says
```bash
cd smart_contracts

# Create quick check script (save as scripts/quick-check.ts)
cat > scripts/quick-check.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Your contract
  
  const contract = await ethers.getContractAt("MynnCrypt", address);
  const owner = await contract.owner();
  
  console.log("✅ Contract Owner:", owner);
  console.log("✅ Deployer Address:", deployer.address);
  console.log("✅ Match?", owner.toLowerCase() === deployer.address.toLowerCase() ? "YES ✅" : "NO ❌");
}

main().catch(console.error);
EOF

# Run it
npx hardhat run scripts/quick-check.ts --network hardhat
```

### Check What Frontend Sees
```bash
cd frontend

# Open browser console (F12 → Console tab)
# Paste:
JSON.parse(localStorage.getItem('walletConfig')) 
// or check in adminWallets.js
```

---

## ✅ VERIFICATION COMMANDS

```bash
# 1. Check deployment worked
grep "Deployment completed successfully" <deployment_output>

# 2. Check .env updated
grep "VITE_PLATFORM_WALLET=" frontend/.env

# 3. Check frontend starts
cd frontend && npm run dev 2>&1 | head -20

# 4. Check network config
grep "VITE_NETWORK=" frontend/.env

# 5. Compare addresses (should match)
echo "Smart contract owner:"
grep "owner:" <deployment_output> | tail -1
echo "\nFrontend config:"
grep "VITE_PLATFORM_WALLET=" frontend/.env
```

---

## 🎯 SUCCESS CRITERIA

✅ **All should be true:**
1. Deploy script completes without error
2. .env file includes updated VITE_PLATFORM_WALLET
3. Frontend starts without error
4. Owner wallet connect shows dashboard
5. Non-owner wallet shows unauthorized
6. Admin panel fully functional
7. No console errors in browser F12

---

## 📞 QUICK SUPPORT

**Issue:** "Still can't access dashboard"
1. Restart frontend: `Ctrl+C` + `npm run dev`
2. Clear cache: `Cmd+Shift+Delete` in browser
3. Reconnect wallet: Disconnect + Connect again
4. Check address: Log it in console

**Issue:** ".env not updated"
1. Check script output: Did it say "Frontend .env updated"?
2. Manual fix: Edit `frontend/.env` directly
3. Verify: `cat frontend/.env | grep VITE_PLATFORM_WALLET`

**Issue:** "Wallet address mismatch"
1. Check frontend: `cat frontend/.env | grep VITE_PLATFORM_WALLET`
2. Check contract: `npx hardhat run scripts/quick-check.ts`
3. Compare: Should be SAME (ignore case)

---

**Last Updated:** January 12, 2026
**Fix Version:** Deploy Script v2.1
**Status:** ✅ Ready for Testing
