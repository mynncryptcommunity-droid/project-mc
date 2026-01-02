# Admin Dashboard Access - Fixed & Setup Guide

## Problem Fixed ✅

**Issue**: Admin dashboard at `/admin` was not accessible even with the platform wallet.

**Root Cause**: The `adminWallets.js` configuration was using hardcoded wallet addresses instead of reading from the `VITE_PLATFORM_WALLET` environment variable.

**Solution**: Updated `adminWallets.js` to:
1. Read platform wallet from `VITE_PLATFORM_WALLET` environment variable (Vercel production)
2. Fall back to hardhat development wallet for local testing
3. Dynamically load wallet addresses on every build

## How Admin Access Works

### 1. Authorization Levels

| Role | Description | Access |
|------|-------------|--------|
| **Owner** | Platform administrator | Full admin dashboard access |
| **Investor** | Investor account | Full admin dashboard access |
| **User** | Regular user | No admin access |

### 2. Wallet Authorization

An address is authorized if it matches:
- `VITE_PLATFORM_WALLET` (primary owner)
- Any configured investor addresses

## Setup Instructions

### For Vercel Production Deployment

Your current environment variable is set:
```
VITE_PLATFORM_WALLET=0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B
```

This wallet can now access the admin dashboard at:
- https://project-mc-tan.vercel.app/admin

### To Add More Admin Wallets

Edit `frontend/src/config/adminWallets.js` and add to the PRODUCTION_WALLETS config:

```javascript
const PRODUCTION_WALLETS = {
  owner: [
    getPlatformWallet(),  // From VITE_PLATFORM_WALLET
    '0x...',  // Add another owner wallet here
  ],
  investor: [
    '0x...',  // Investor 1
    '0x...',  // Investor 2
  ]
};
```

Then:
1. Commit changes
2. Push to GitHub
3. Vercel auto-rebuilds
4. New wallets will have access

## Testing Admin Access

### Step 1: Visit Debug Page
Go to: https://project-mc-tan.vercel.app/admin-debug

This page shows:
- Your connected wallet address
- Your detected role (Owner/Investor/Unknown)
- All configured admin wallets
- Access control test results

### Step 2: Check Authorization

The debug page will tell you:
- ✅ If your wallet is authorized
- ❌ If your wallet is NOT authorized
- Which wallets are in the owner/investor list

### Step 3: Access Admin Dashboard

If authorized, you can access:
https://project-mc-tan.vercel.app/admin

If not authorized, you'll see:
- Your wallet address
- Your detected role
- List of authorized wallets
- Link to debug page

## Current Configuration

### Owner Wallets
```
0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B (from VITE_PLATFORM_WALLET)
0x2f48b3F7D3b2233ba1cFb2e077cF2E703eFcD7b5 (secondary)
```

### Investor Wallets
```
0x3A3214EbC975F7761288271aeBf72caB946a8b83
0xb3174FB5f5FEAB8245B910Ba792c0AD25B024871
```

## Troubleshooting

### "Wallet Tidak Terkoneksi" (Wallet Not Connected)
- **Cause**: MetaMask or wallet not connected
- **Fix**: Click MetaMask icon and connect your wallet

### "Akses Ditolak" (Access Denied)
- **Cause**: Your wallet is not in the authorized list
- **Fix**: 
  1. Check your wallet address on the debug page
  2. Verify it matches a configured admin wallet
  3. If needed, ask platform owner to add your wallet

### Admin Features Not Loading
- **Cause**: Contract configuration issue
- **Fix**: Clear browser cache and reload

## Admin Dashboard Sections

Once logged in, you can access:

1. **Ringkasan (Overview)**
   - Total platform income
   - Active users
   - System status

2. **Manajemen Pengguna (User Management)**
   - User list
   - User levels
   - User details

3. **Keuangan & Pendapatan (Finance)**
   - Income tracking
   - Royalty pool
   - Platform wallet balance

4. **Pengaturan Kontrak (Contract Settings)**
   - Contract configuration
   - Parameter adjustments

5. **Aktivitas & Log (Activity Logs)**
   - Transaction history
   - Event logs
   - User activity

## File Changes

**Modified**: `frontend/src/config/adminWallets.js`
- Now reads `VITE_PLATFORM_WALLET` from environment
- Dynamically loads owner wallet address
- Falls back to hardhat wallet for development

**Commit**: `e0f9ce4`
**Status**: ✅ Deployed to Vercel

## Testing Results

After deployment, verify:

- [ ] Navigate to https://project-mc-tan.vercel.app/admin-debug
- [ ] Check if your wallet appears in "Owner Wallets" section
- [ ] Click "Go to Admin Dashboard"
- [ ] Verify admin dashboard loads successfully
- [ ] Check all sections load data properly

## Environment Variables Reference

```env
# Admin/Owner Wallet (Vercel)
VITE_PLATFORM_WALLET=0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B

# Smart Contracts
VITE_MYNNCRYPT_ADDRESS=0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE
VITE_MYNNGIFT_ADDRESS=0x82682F273a26Bbf5c6bD3BC267fc14c3E4D231f6

# Network
VITE_NETWORK_ID=5611
VITE_RPC_URL=https://opbnb-testnet-rpc.bnbchain.org
VITE_EXPLORER_URL=https://testnet.opbnbscan.com
```

## Next Steps

1. **Test Admin Access**
   - Visit the debug page
   - Verify wallet is authorized
   - Test admin dashboard

2. **Add More Admins** (if needed)
   - Edit `adminWallets.js`
   - Add wallet addresses
   - Commit and deploy

3. **Monitor Admin Activity**
   - Check Vercel deployment logs
   - Review browser console for errors
   - Use Activity Logs section to track changes

---

**Fix Date**: 30 December 2025  
**Deployment**: Vercel (auto-deployed)  
**Live URL**: https://project-mc-tan.vercel.app/admin  
**Status**: ✅ Ready for testing
