# Config Directory

## Files

### `adminWallets.js`
Centralized wallet configuration for admin dashboard access control.

**Usage:**
```javascript
import { getRoleByWallet, getAllAuthorizedWallets, isWalletAuthorized } from './adminWallets';

// Get user role
const role = getRoleByWallet(userWallet);

// Check if authorized
if (isWalletAuthorized(userWallet)) {
  // Allow access to dashboard
}

// Get all configured wallets
const config = getAllAuthorizedWallets();
```

**To Update Wallets:**
1. Open `adminWallets.js`
2. Find `HARDHAT_WALLETS` (development) or `PRODUCTION_WALLETS` (production)
3. Update wallet addresses
4. Save file - frontend reloads automatically

**Current Settings (Development):**
- Environment: `development` 
- Owner: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (hardhat account #0)
- Investor: (empty)

See `WALLET_CONFIGURATION_GUIDE.md` for detailed instructions.
