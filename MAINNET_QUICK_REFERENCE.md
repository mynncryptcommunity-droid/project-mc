# 🚀 MAINNET DEPLOYMENT - QUICK REFERENCE CHECKLIST

**Start Here** → Quick overview dari 3 dokumentasi lengkap di bawah.

---

## 📊 3 FASE DEPLOYMENT

### FASE 1: PERSIAPAN (Hari 1-7)
Lihat: [MAINNET_PREPARATION_CHECKLIST.md](MAINNET_PREPARATION_CHECKLIST.md)

**Apa yang harus dilakukan:**
- [ ] Code review & security audit
- [ ] Setup mainnet environment
- [ ] Configure deployment script
- [ ] Update frontend config
- [ ] Setup wallet & security measures
- [ ] Testing on mainnet fork
- [ ] Final verification

**Durasi:** 2-7 hari (tergantung audit)

---

### FASE 2: VERIFIKASI PRE-DEPLOYMENT (Sebelum deploy)
Lihat: [MAINNET_PRE_DEPLOYMENT_VERIFICATION.md](MAINNET_PRE_DEPLOYMENT_VERIFICATION.md)

**Apa yang harus dilakukan:**
- [ ] Jalankan semua verification checks (15-20 menit)
- [ ] Verifikasi account balance (>= 2 BNB)
- [ ] Confirm network configuration
- [ ] Test RPC connectivity
- [ ] Sign off approval form

**Durasi:** 15-20 menit (CRITICAL - jangan skip!)

---

### FASE 3: DEPLOYMENT & VERIFICATION (Deployment day)
Lihat: [OPBNB_MAINNET_DEPLOYMENT_GUIDE.md](OPBNB_MAINNET_DEPLOYMENT_GUIDE.md)

**8 Langkah Deployment:**
1. Prepare environment (5 min)
2. Update deployment script (5 min)
3. **Deploy to mainnet** (10-15 min) ⚡
4. Verify on-chain (5 min)
5. Update frontend (5 min)
6. Build production (5 min)
7. Deploy to production (varies)
8. Post-deployment verification (10 min)

**Durasi:** 45-60 menit total

---

## 🎯 QUICK DECISION TREE

```
❓ Are you ready to deploy?
  │
  ├─ NO → Go to MAINNET_PREPARATION_CHECKLIST.md
  │
  └─ YES
      │
      ├─ Have you done verification checks?
      │   ├─ NO → Go to MAINNET_PRE_DEPLOYMENT_VERIFICATION.md
      │   └─ YES
      │       │
      │       └─ Ready! Follow OPBNB_MAINNET_DEPLOYMENT_GUIDE.md
      │           Step 1 → Step 8
```

---

## 💻 COMMAND CHEAT SHEET

### Before Deployment
```bash
# 1. Prepare environment
cd mc_backend
cat > .env << 'EOF'
PRIVATE_KEY=0xyour_key
MAINNET_OWNER_ADDRESS=0xyour_owner
MAINNET_PLATFORM_WALLET=0xyour_platform
EOF

# 2. Verify network config
npx hardhat network-info --network opbnb

# 3. Check balance
# Go to https://www.opbnbscan.com and search deployer address
```

### Deploy
```bash
# 4. Deploy contracts
npx hardhat run scripts/deploy.ts --network opbnb

# 5. Save output addresses!
# Copy: MynnCrypt address, MynnGift address, transaction hash
```

### After Deployment
```bash
# 6. Update frontend
cd ../mc_frontend
cat >> .env << 'EOF'
VITE_MYNNCRYPT_ADDRESS=0x_from_deployment
VITE_MYNNGIFT_ADDRESS=0x_from_deployment
VITE_NETWORK_ID=204
VITE_RPC_URL=https://opbnb-mainnet-rpc.bnbchain.org
EOF

# 7. Build & verify
npm run build
npm run preview

# 8. Deploy to production
vercel --prod
```

---

## ⚠️ CRITICAL REQUIREMENTS

| Item | Requirement | Check |
|------|-------------|-------|
| **Deployer Balance** | >= 2 BNB | ✓ |
| **Network** | opBNB Mainnet (204) | ✓ |
| **RPC** | https://opbnb-mainnet-rpc.bnbchain.org | ✓ |
| **Private Key** | Safe & not in git | ✓ |
| **Owner Address** | Mainnet, not testnet | ✓ |
| **Contract Code** | Audited/reviewed | ✓ |
| **Frontend Build** | Tested locally | ✓ |
| **Monitoring** | Sentry/LogRocket setup | ✓ |

---

## 📞 DURING DEPLOYMENT - IF STUCK

| Problem | Solution |
|---------|----------|
| "Insufficient funds" | Add more BNB to deployer account |
| "Invalid RPC response" | Check RPC endpoint is working |
| "Contract not found" | Wait 2-3 min, check on OpBNBScan |
| "MetaMask wrong network" | Add opBNB Mainnet manually (Chain ID 204) |
| "Frontend shows old addresses" | Clear cache + hard refresh + rebuild |

See [OPBNB_MAINNET_DEPLOYMENT_GUIDE.md](OPBNB_MAINNET_DEPLOYMENT_GUIDE.md) for full troubleshooting.

---

## 📊 MAINNET DETAILS

**Network:** opBNB Mainnet
- **Chain ID:** 204
- **RPC:** https://opbnb-mainnet-rpc.bnbchain.org
- **Explorer:** https://www.opbnbscan.com
- **Faucet:** N/A (mainnet)

**Contract Parameters:**
- **Default Referral:** A8888NR
- **Initial User ID:** 8889
- **Level 1 Cost:** 0.0044 BNB
- **Max Layers:** 24

**Gas Estimates:**
- MynnCrypt: ~2,000,000 gas
- MynnGift: ~1,500,000 gas
- **Total:** ~3,500,000 gas @ 50 gwei = 0.175 BNB

---

## 🎯 SUCCESS METRICS

After deployment, verify:

✅ **On-Chain**
- Contract exists on OpBNBScan
- Default referral = A8888NR
- Total users = 1 (owner)
- Platform income = 0

✅ **Frontend**
- Dashboard loads
- Connects to correct contract
- Network shows 204 (opBNB)
- MetaMask integration works

✅ **Functionality**
- Can view contract info
- Can attempt registration (optional test)
- Admin functions accessible
- No console errors

---

## 📚 DOCUMENTATION MAP

```
MAINNET_DEPLOYMENT/
├── QUICK_REFERENCE_CHECKLIST.md ← You are here
├── MAINNET_PREPARATION_CHECKLIST.md (7-14 days prep)
│   ├── Security review
│   ├── Environment setup
│   ├── Testing
│   └── Risk assessment
├── MAINNET_PRE_DEPLOYMENT_VERIFICATION.md (15-20 min before)
│   ├── Environment checks
│   ├── Balance verification
│   ├── Contract review
│   └── Sign-off form
└── OPBNB_MAINNET_DEPLOYMENT_GUIDE.md (45-60 min execution)
    ├── Step 1-8: Deploy
    ├── Troubleshooting
    └── Post-deployment
```

---

## 🚀 NEXT STEPS

**Right now:**
1. Read [MAINNET_PREPARATION_CHECKLIST.md](MAINNET_PREPARATION_CHECKLIST.md)
2. Work through all preparation items (2-7 days)
3. Once ready, read [MAINNET_PRE_DEPLOYMENT_VERIFICATION.md](MAINNET_PRE_DEPLOYMENT_VERIFICATION.md)
4. Run all verification checks (15-20 min)
5. Finally, execute [OPBNB_MAINNET_DEPLOYMENT_GUIDE.md](OPBNB_MAINNET_DEPLOYMENT_GUIDE.md)

**Timeline:**
- **Week 1:** Preparation phase
- **Week 2:** Final verification (day before)
- **Day X:** Deployment (45-60 min)

---

## ❓ FAQ

**Q: Berapa lama deployment?**
A: 45-60 menit total (termasuk build, deploy, verification)

**Q: Berapa biaya deployment?**
A: ~0.175 BNB (~$50-75) untuk gas fees

**Q: Apakah bisa rollback?**
A: Deploy sudah, tapi bisa pindah ke contract baru. Lihat OPBNB_MAINNET_DEPLOYMENT_GUIDE.md bagian Rollback.

**Q: Harus offline sebelum deploy?**
A: Sebaiknya yes, tapi tidak mandatory. Inform users dulu.

**Q: Apa jika deployment gagal?**
A: Check troubleshooting section. Biasanya bisa retry tanpa problem (khusus gas issues).

---

## ✍️ DEPLOYMENT SIGN-OFF

```
Prepared by: _______________________
Date: _______________________

Reviewed by: _______________________
Date: _______________________

Approved by Owner: _______________________
Date: _______________________

Ready to Deploy: YES / NO
```

---

**Last Updated:** January 2, 2026
**Status:** Ready for Preparation Phase

🎉 **Goodluck sa mainnet deployment!**
