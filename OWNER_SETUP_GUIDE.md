# Owner Wallet Setup Guide (Mainnet)

## Owner Wallet Information

**Wallet Address:** `0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928`  
**Role:** Platform Owner / Admin  
**Network:** opBNB Mainnet (Chain ID: 204)  
**Website:** https://www.mynnncrypt.com

---

## Access Configuration Status

✅ **COMPLETED:**
- Owner wallet added to `adminWallets.js` (both owner and investor arrays)
- `VITE_PLATFORM_WALLET` environment variable set in Vercel
- Admin dashboard code deployed to mainnet
- GitHub changes pushed, Vercel auto-deployment triggered

---

## Step-by-Step Setup Instructions

### **Step 1: Open the Website**
1. Visit: https://www.mynnncrypt.com
2. Click "Connect Wallet"
3. Select MetaMask (or your wallet provider)
4. Connect with the owner wallet: `0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928`
5. **IMPORTANT:** Ensure you're on **opBNB Mainnet** (Chain 204)

### **Step 2: Check Registration Status**

**If wallet is NOT registered:**
- Registration page will appear
- **Referral ID:** Use `A8888NR` (default platform referral)
- Email: (Optional, for notifications)
- Phone: (Optional, for support)
- Click "Register"

**If wallet IS registered:**
- System will redirect to Dashboard automatically
- You should see your profile and income history

### **Step 3: Access Admin Dashboard**

**After successful login:**
1. Navigate to: `/admin` or look for "Admin Dashboard" link in navigation
2. You should see:
   - User management
   - Income statistics
   - Transaction history
   - System settings

**If admin dashboard is NOT accessible:**
- Clear browser cache (`Ctrl+Shift+Delete`)
- Try a different browser or incognito mode
- Verify MetaMask shows Chain ID 204
- Disconnect and reconnect wallet

---

## Technical Details

### Admin Wallet Configuration

**File:** `frontend/src/config/adminWallets.js`

```javascript
const PRODUCTION_WALLETS = {
  owner: [
    getPlatformWallet(), // From VITE_PLATFORM_WALLET env
    '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928' // Owner wallet
  ],
  investor: [
    '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928' // Can access investor dashboard
  ]
};
```

### Environment Variable

**File:** `frontend/.env` (production)

```env
VITE_PLATFORM_WALLET=0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928
```

**Note:** `.env` is in `.gitignore` so it won't be pushed to GitHub. The Vercel environment variable handles this automatically.

---

## Referral Link Configuration

### Default Referral ID: A8888NR

- Used as default when no referral is provided
- Platform ID for users without a referral sponsor
- All unsponsored users get credited under this ID

### Custom Referral IDs (Future)

If you want to create custom referral links for marketing:

1. Create ID in format: `[A-Z][0-9]{4}(WR|NR)`
   - Example: `A1234NR` (New Referral)
   - Example: `A1234WR` (WhatsApp Referral)

2. Share registration link:
   ```
   https://www.mynnncrypt.com/register?ref=A1234NR
   ```

3. Users clicking the link will auto-fill the referral ID

---

## Troubleshooting

### Issue: "Wallet not found in admin list"

**Solution:**
1. Verify correct wallet address is connected in MetaMask
2. Clear cache: `Ctrl+Shift+Delete` → "Cached images and files"
3. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Disconnect and reconnect wallet

### Issue: "Wrong network"

**Solution:**
1. Open MetaMask
2. Click network dropdown (top left)
3. Select "opBNB Mainnet"
4. If not in list, add custom network:
   - Network Name: opBNB Mainnet
   - RPC URL: https://opbnb-mainnet-rpc.bnbchain.org
   - Chain ID: 204
   - Currency: opBNB

### Issue: "Cannot see dashboard after login"

**Solution:**
1. Verify wallet is registered (should be auto-redirected if not)
2. If already registered, check admin status
3. Contact support with wallet address

---

## Smart Contract Addresses

**MynnCrypt (Main Contract):**
```
0x7a0831473eC7854ed5Aec663280edebbb215adCc
```

**MynnGift (Donation/Gift Contract):**
```
0x9017B11f41D6c0E9201E9f6F6540Abf209794e5A
```

**Network:** opBNB Mainnet (Chain 204)

---

## Security Notes

1. **Never share private key** of owner wallet
2. **Always verify** you're on correct website: https://www.mynnncrypt.com
3. **Use hardware wallet** (Ledger, Trezor) for additional security
4. **Check for HTTPS** in browser address bar
5. **Save backup** of wallet seed phrase in secure location

---

## Support

If you need help:
1. Check this guide first
2. Try the troubleshooting section
3. Contact technical support with:
   - Wallet address (without private key!)
   - Error message or screenshot
   - Steps you took before the error

---

**Last Updated:** 2024-12-19  
**Deployment Status:** ✅ Production (Mainnet)
