/**
 * Admin & Investor Wallet Configuration
 * 
 * DEVELOPMENT (Hardhat Local):
 * - Use first hardhat account as platform wallet (has 10000 ETH)
 * 
 * PRODUCTION (opBNB Mainnet):
 * - Set actual owner and investor wallets
 * 
 * How to update:
 * 1. Change addresses below
 * 2. Restart frontend (npm run dev)
 * 3. Login with authorized wallet to access dashboard
 */

// ===== HARDHAT LOCAL DEVELOPMENT =====
// First hardhat account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const HARDHAT_WALLETS = {
  owner: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], // Development platform wallet
  investor: []
};

// ===== OPBNB MAINNET (PRODUCTION) =====
const PRODUCTION_WALLETS = {
  owner: [
    '0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B', // ownerw
    '0x2f48b3F7D3b2233ba1cFb2e077cF2E703eFcD7b5'  // ownera
  ],
  investor: [
    '0x3A3214EbC975F7761288271aeBf72caB946a8b83', // investor1
    '0xb3174FB5f5FEAB8245B910Ba792c0AD25B024871'  // investor2
  ]
};

/**
 * Select which wallet configuration to use
 * Change to 'production' when deploying to mainnet
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
