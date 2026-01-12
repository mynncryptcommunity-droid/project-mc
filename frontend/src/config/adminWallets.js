/**
 * Admin & Investor Wallet Configuration
 * 
 * DEVELOPMENT (Hardhat Local):
 * - Use first hardhat account as platform wallet (has 10000 ETH)
 * 
 * PRODUCTION (opBNB Testnet):
 * - Use environment variables for wallet addresses
 * 
 * How to update:
 * 1. Set VITE_PLATFORM_WALLET in .env or Vercel environment variables
 * 2. Restart frontend (npm run dev)
 * 3. Login with authorized wallet to access dashboard
 */

// Get wallet from environment variable or use defaults
const getPlatformWallet = () => {
  // Try to get from environment variable first (Vercel production)
  const envWallet = import.meta.env.VITE_PLATFORM_WALLET;
  if (envWallet && envWallet !== '0x0000000000000000000000000000000000000000') {
    return envWallet;
  }
  // Fallback to hardhat development wallet
  return '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
};

// ===== HARDHAT LOCAL DEVELOPMENT =====
// First hardhat account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], // Development platform wallet
  investor: []
};

// ===== OPBNB MAINNET (PRODUCTION) =====
// Platform/Owner wallet from smart contract deployment
const PRODUCTION_WALLETS = {
  owner: [
    getPlatformWallet(), // Use environment variable: 0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928
    '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928' // Owner/Admin wallet (mainnet)
  ],
  investor: [
    '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928' // Owner can also see investor dashboard
  ]
};

/**
 * Select which wallet configuration to use based on MODE
 * - MODE='development': Use Hardhat wallets
 * - MODE='production': Use environment variable + production wallets
 */
const ENVIRONMENT = import.meta.env.MODE === 'production' ? 'production' : 'development';

// Get the appropriate wallet config based on environment
const getWalletConfig = () => {
  if (ENVIRONMENT === 'production') {
    return PRODUCTION_WALLETS;
  }
  return HARDHAT_WALLETS;
};

const WALLET_CONFIG = getWalletConfig();

/**
 * Get user role based on wallet address
 * @param {string} walletAddress - User's wallet address
 * @returns {string} - Role: 'owner', 'investor', or 'unknown'
 */
export const getRoleByWallet = (walletAddress) => {
  if (!walletAddress) return 'unknown';
  
  const lowerAddress = walletAddress.toLowerCase();
  
  // Check owner wallets
  const ownerMatch = WALLET_CONFIG.owner.some(
    addr => addr.toLowerCase() === lowerAddress
  );
  if (ownerMatch) return 'owner';
  
  // Check investor wallets
  const investorMatch = WALLET_CONFIG.investor.some(
    addr => addr.toLowerCase() === lowerAddress
  );
  if (investorMatch) return 'investor';
  
  return 'unknown';
};

/**
 * Get all authorized wallets (for reference)
 * @returns {object} - All configured wallets
 */
export const getAllAuthorizedWallets = () => {
  return {
    owners: WALLET_CONFIG.owner,
    investors: WALLET_CONFIG.investor,
    environment: ENVIRONMENT
  };
};

/**
 * Check if wallet is authorized
 * @param {string} walletAddress - User's wallet address
 * @returns {boolean} - True if wallet is owner or investor
 */
export const isWalletAuthorized = (walletAddress) => {
  const role = getRoleByWallet(walletAddress);
  return role === 'owner' || role === 'investor';
};

export default WALLET_CONFIG;
