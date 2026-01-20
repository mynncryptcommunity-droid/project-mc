import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useDisconnect, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_platform.png';
import TeamMatrix from './TeamMatrix';
import TeamTree from './TeamTree';
import LevelDisclaimerBanner from './LevelDisclaimerBanner';
import Tooltip from './Tooltip';
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UsersIcon,
  ShareIcon,
  GiftIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon // New import for notification icon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import NobleGiftVisualization from './NobleGiftVisualization';
import MynnGiftTabs from './MynnGiftTabs';
import Ebook from './Ebook';
import { FaBookOpen } from 'react-icons/fa';
import { getLevelName, getLevelInfo } from '../config/levelNamesConfig';
import { getLevelDisclaimer } from '../config/dashboardTooltipsConfig';
// Import the new custom hook
// import { useNobleGiftNotifications } from '../hooks/useNobleGiftNotifications';

// Add IncomeType enum
const IncomeType = {
  REFERRAL: 1,
  UPLINE: 2,
  SPONSOR: 3,
  ROYALTY: 4,
  AUTO_UPGRADE: 5,
  NOBLEGIFT: 6,
  MATRIX: 7,      // Income from matrix
  LEADERSHIP: 8,  // Leadership income
  GLOBAL: 9       // Global share income
};

// Add reverse mapping for enum display
const IncomeTypeDisplay = {
  1: 'Referral',
  2: 'Upline',
  3: 'Sponsor',
  4: 'Royalty',
  5: 'Auto Upgrade',
  6: 'MynnGift'
};

// ✅ OPTIMIZATION: Create memoized versions of heavy sub-components
const MemoizedTeamMatrix = React.memo(TeamMatrix);
const MemoizedTeamTree = React.memo(TeamTree);
const MemoizedNobleGiftVisualization = React.memo(NobleGiftVisualization);
const MemoizedMynnGiftTabs = React.memo(MynnGiftTabs);

// Define explicit upgrade costs for each level
// These are the *individual* costs to upgrade to that level, not cumulative.
// Level 1 (registration) is assumed to be 0.0044 ETH, but we start upgrades from Level 2.
const LEVEL_UPGRADE_COSTS = {
  2: "0.0072",
  3: "0.0144",
  4: "0.0288",
  5: "0.0576",
  6: "0.1152",
  7: "0.2304",
  8: "0.4608",
  9: "0.9216",
  10: "1.8432",
  11: "3.6864",
  12: "7.3728",
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#102E50] text-[#F5C45E] p-6">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Add new CSS for sidebar animation, golden button, and futuristic cards
const sidebarStyles = `
  .sidebar {
    transition: all 0.3s ease-in-out;
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(77, 168, 218, 0.2);
  }

  .sidebar-item {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .sidebar-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(77, 168, 218, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .sidebar-item:hover::before {
    left: 100%;
  }

  .hamburger-btn {
    transition: all 0.3s ease;
    border: 1px solid rgba(77, 168, 218, 0.3);
    backdrop-filter: blur(5px);
    display: block; /* Always visible in header for small screens */
    color: #4DA8DA;
    padding: 8px;
    border-radius: 8px;
    background: none;
    cursor: pointer;
    z-index: 1001;
    position: relative;
    flex-shrink: 0;
    width: auto;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger-btn:hover {
    border-color: rgba(77, 168, 218, 0.8);
    box-shadow: 0 0 15px rgba(77, 168, 218, 0.3);
  }
  
  /* Hamburger Icon Animation */
  .hamburger-btn .icon-bar {
    display: block;
    width: 25px;
    height: 3px;
    background-color: #F5C45E; /* Golden color for hamburger */
    margin: 5px 0;
    transition: all 0.3s ease-in-out;
  }

  .hamburger-btn.open .icon-bar:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
  }

  .hamburger-btn.open .icon-bar:nth-child(2) {
    opacity: 0;
  }

  .hamburger-btn.open .icon-bar:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
  }

  @media (max-width: 768px) {
    .hamburger-btn {
      min-width: 50px;
      min-height: 50px;
      margin-right: 8px;
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 40;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .overlay.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .golden-button {
    touch-action: manipulation;
    display: inline-block;
    outline: none;
    font-family: inherit;
    font-size: 1em;
    box-sizing: border-box;
    border: none;
    border-radius: 0.3em;
    height: 2.75em;
    line-height: 2.5em;
    text-transform: uppercase;
    padding: 0 1em;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(110, 80, 20, 0.4),
      inset 0 -2px 5px 1px rgba(139, 66, 8, 1),
      inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
    background-image: linear-gradient(
      160deg,
      #a54e07,
      #b47e11,
      #fef1a2,
      #bc881b,
      #a54e07
    );
    border: 1px solid #a55d07;
    color: rgb(120, 50, 5);
    text-shadow: 0 2px 2px rgba(250, 227, 133, 1);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    background-size: 100% 100%;
    background-position: center;
    width: 100%;
  }

  .golden-button:focus,
  .golden-button:hover {
    background-size: 150% 150%;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23),
      inset 0 -2px 5px 1px #b17d10, inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
    border: 1px solid rgba(165, 93, 7, 0.6);
    color: rgba(120, 50, 5, 0.8);
  }

  .golden-button:active {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(110, 80, 20, 0.4),
      inset 0 -2px 5px 1px #b17d10, inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
  }

  .golden-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-image: linear-gradient(
      160deg,
      #7a3905,
      #835b0c,
      #beb479,
      #8b6513,
      #7a3905
    );
  }

  .btn-cssbuttons {
    --btn-color: #4DA8DA;
    position: relative;
    padding: 16px 32px;
    font-family: inherit;
    font-weight: 500;
    font-size: 16px;
    line-height: 1;
    color: white;
    background: none;
    border: none;
    outline: none;
    overflow: hidden;
    cursor: pointer;
    filter: drop-shadow(0 2px 8px rgba(77, 168, 218, 0.32));
    transition: 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  
  .btn-cssbuttons::before {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: var(--btn-color);
    border-radius: 24px;
    transition: 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  
  .btn-cssbuttons span,
  .btn-cssbuttons span span {
    display: inline-flex;
    vertical-align: middle;
    transition: 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  
  .btn-cssbuttons span {
    transition-delay: 0.05s;
  }
  
  .btn-cssbuttons span:first-child {
    padding-right: 7px;
  }
  
  .btn-cssbuttons span span {
    margin-left: 8px;
    transition-delay: 0.1s;
  }
  
  .btn-cssbuttons ul {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    margin: 0;
    padding: 0;
    list-style-type: none;
    transform: translateY(-50%);
  }
  
  .btn-cssbuttons ul li {
    flex: 1;
  }
  
  .btn-cssbuttons ul li a {
    display: inline-flex;
    vertical-align: middle;
    transform: translateY(55px);
    transition: 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    color: #F5C45E;
  }
  
  .btn-cssbuttons ul li a:hover {
    opacity: 0.5;
  }
  
  .btn-cssbuttons:hover::before {
    transform: scale(1.2);
  }
  
  .btn-cssbuttons:hover span,
  .btn-cssbuttons:hover span span {
    transform: translateY(-55px);
  }
  
  .btn-cssbuttons:hover ul li a {
    transform: translateY(0);
  }
  
  .btn-cssbuttons:hover ul li:nth-child(1) a {
    transition-delay: 0.15s;
  }
  
  .btn-cssbuttons:hover ul li:nth-child(2) a {
    transition-delay: 0.2s;
  }
  
  .btn-cssbuttons:hover ul li:nth-child(3) a {
    transition-delay: 0.25s;
  }

  .futuristic-card {
    background: linear-gradient(165deg, rgba(26, 58, 106, 0.85) 0%, rgba(16, 46, 80, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(77, 168, 218, 0.2);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .futuristic-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(77, 168, 218, 0.1),
      transparent
    );
    transition: 0.5s;
  }

  .futuristic-card:hover::before {
    left: 100%;
  }

  .futuristic-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
    border-color: rgba(77, 168, 218, 0.4);
  }

  .income-value {
    background: linear-gradient(90deg, #F5C45E, #E78B48);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(245, 196, 94, 0.3);
  }

  .income-title {
    color: #4DA8DA;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  .income-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .income-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .income-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .luxury-card {
    background: linear-gradient(135deg, rgba(26, 58, 106, 0.85) 0%, rgba(16, 46, 80, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid;
    border-image: linear-gradient(45deg, #F5C45E, #E78B48) 1;
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(245, 196, 94, 0.15);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    padding: 2rem;
  }

  .luxury-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(245, 196, 94, 0.1) 0%, transparent 50%);
    animation: rotateGradient 10s linear infinite;
  }

  @keyframes rotateGradient {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .luxury-card:hover {
    transform: translateY(-5px);
    box-shadow:
      0 15px 35px rgba(245, 196, 94, 0.2),
      0 0 15px rgba(245, 196, 94, 0.1);
  }

  .luxury-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #4DA8DA;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
    position: relative;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .luxury-amount {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, #F5C45E, #E78B48);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 0.5rem;
    position: relative;
  }

  .luxury-subtitle {
    color: rgba(245, 196, 94, 0.8);
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .luxury-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.8;
    color: #F5C45E;
  }

  /* New styles for futuristic currency conversion */
  .currency-conversion-display {
    display: flex;
    flex-direction: column; /* Stack USD and IDR */
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(245, 196, 94, 0.1);
  }

  .currency-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .converted-amount {
    font-size: 1.1rem;
    font-weight: 700;
    background: linear-gradient(90deg, #F5C45E, #E78B48);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 8px rgba(245, 196, 94, 0.4);
  }

  .currency-label {
    font-size: 0.8rem;
    color: #4DA8DA;
    opacity: 0.8;
    margin-right: 0.5rem;
  }
`;

// Contract event utilities
// eslint-disable-next-line no-unused-vars
const validateIncomeEvent = (event) => {
  if (!event) return null;
  
  try {
    // Normalize amount
    let amount = event.amount || '0';
    if (typeof amount === 'number') amount = amount.toString();
    
    // Validate and normalize timestamps
    const timestamp = event.timestamp || event.time || Math.floor(Date.now() / 1000);
    
    // Normalize user IDs
    const userId = event.userId || event.id || '';
    const fromUser = event.fromUser || event.upline || event.from || 'System';
    
    return {
      ...event,
      amount,
      timestamp,
      userId,
      fromUser
    };
  } catch (error) {
    console.error('Event validation failed:', error);
    return null;
  }
};

const handleContractError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  let errorMessage = 'An error occurred';
  
  if (error.code === 'ACTION_REJECTED') {
    errorMessage = 'Transaction was rejected by user';
  } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    errorMessage = 'Transaction may fail - please check your balance';
  } else if (error.message) {
    errorMessage = error.message.split('(')[0];
  }
  
  toast.error(errorMessage);
};
function Dashboard({ mynncryptConfig, mynngiftConfig, platformWalletConfig }) {
  const queryClient = useQueryClient();
  // Format MynnGift status from contract (translate to English)
  const formatMynnGiftStatus = (status) => {
    if (!status) return 'Loading...';
    
    // Normalize status to lowercase for comparison
    const statusLower = status.toLowerCase();
    
    // Map Indonesian status to English
    const statusMap = {
      'tidak aktif': 'Not Active',
      'belum aktif': 'Not Active',
      'aktif': 'Active',
      'donor': 'Donor',
      'penerima': 'Recipient',
      'donor & penerima': 'Donor & Recipient',
      'donor and recipient': 'Donor & Recipient',
    };
    
    // Check each mapping
    for (const [indonesian, english] of Object.entries(statusMap)) {
      if (statusLower.includes(indonesian)) {
        return english;
      }
    }
    
    // Default: return original status
    return status;
  };

  const { address, isConnected } = useAccount();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Set default to open for desktop, closed for mobile
  const [showShareModal, setShowShareModal] = useState(false);
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [incomeFilter, setIncomeFilter] = useState('ALL');
  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 items per page
  const [levelIncomeBreakdown, setLevelIncomeBreakdown] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [teamView, setTeamView] = useState('list');
  // eslint-disable-next-line no-unused-vars
  const [selectedLayer, setSelectedLayer] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [layerMembers, setLayerMembers] = useState([]); // <--- Make sure this exists
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();
  const [selectedUpgradeLevel, setSelectedUpgradeLevel] = useState(0);
const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false); // New state for direct upgrade
const levelDropdownRef = useRef(null);

useEffect(() => {
  if (!isLevelDropdownOpen) return;
  function handleClickOutside(event) {
    if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
      setIsLevelDropdownOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isLevelDropdownOpen]);

  useEffect(() => {
    const handleResize = () => {
      // If screen is resized to desktop, open sidebar
      if (window.innerWidth >= 768 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
      // If screen is resized to mobile, close sidebar
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSidebarOpen]);

  // Add contract read for royalty pool at the top
  const { data: royaltyPool } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'royaltyPool',
  });

  // Add new states for tracking
  // eslint-disable-next-line no-unused-vars
  const [upgradeHistory, setUpgradeHistory] = useState([]);
  const [recentUpgrades, setRecentUpgrades] = useState([]);
  const [downlineStats, setDownlineStats] = useState({
    totalUpgrades: 0,
    totalCommissions: 0,
    activeDownlines: 0
  });

  // Add state for members per layer
  const [membersPerLayer, setMembersPerLayer] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [selectedLevel, setSelectedLevel] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [membersByLevel, setMembersByLevel] = useState({});

  // Add state for matrix users per layer
  const [matrixUsers, setMatrixUsers] = useState({});

  // ✅ Check if user is platform wallet - use default referral ID instead of address lookup
  const isPlatformWallet = platformWalletConfig && address && (
    address.toLowerCase() === platformWalletConfig.hardhat?.toLowerCase() ||
    address.toLowerCase() === platformWalletConfig.testnet?.toLowerCase() ||
    address.toLowerCase() === platformWalletConfig.mainnet?.toLowerCase()
  );

  // Debug: Log platform wallet check
  useEffect(() => {
    if (address && platformWalletConfig) {
      console.log('🔍 Platform Wallet Check:', {
        connectedAddress: address.toLowerCase(),
        hardhat: platformWalletConfig.hardhat?.toLowerCase(),
        testnet: platformWalletConfig.testnet?.toLowerCase(),
        mainnet: platformWalletConfig.mainnet?.toLowerCase(),
        isPlatformWallet: isPlatformWallet,
      });
    }
  }, [address, platformWalletConfig, isPlatformWallet]);

  // Fetch user ID (skip for platform wallet, will use default referral ID)
  const { 
    data: userId, 
    isLoading: userIdLoading, 
    error: userIdError, 
    refetch: refetchUserId 
  } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'id',
    args: [address],
    enabled: !!address && !isPlatformWallet,  // ✅ Skip for platform wallet
  });

  // ✅ Handle user registration check - redirect if not registered
  useEffect(() => {
    // Skip check if wallet not connected
    if (!isConnected) {
      console.log('⏳ Wallet not connected yet');
      return;
    }
    
    // Platform wallet always OK
    if (isPlatformWallet) {
      console.log('✅ Platform wallet detected - skipping registration check');
      return;
    }
    
    // Still loading user ID
    if (userIdLoading) {
      console.log('⏳ Loading user ID...');
      return;
    }
    
    // User exists and has a userId
    if (userId && userId.length > 0) {
      console.log('✅ User registered with ID:', userId);
      return;
    }
    
    // User NOT registered and NO error (meaning function returned empty string)
    if (!userIdError && (!userId || userId.length === 0)) {
      console.error('❌ User not registered in contract. Redirecting to registration...');
      toast.error('You are not yet registered. Please complete registration first.');
      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/'), 2000);
      return;
    }
    
    // There was an error reading from contract
    if (userIdError) {
      console.error('⚠️ Error checking registration status:', userIdError);
      toast.error(`Failed to check registration status: ${userIdError.message}`);
      return;
    }
  }, [isConnected, isPlatformWallet, userId, userIdLoading, userIdError, navigate]);

  // ✅ Use effective userId for platform wallet (use default referral ID)
  const effectiveUserId = useMemo(() => {
    if (isPlatformWallet) {
      return 'A8888NR'; // Default platform referral ID
    }
    return userId;
  }, [isPlatformWallet, userId]);

  // ✅ Fetch user info using userId (string ID like "A8888NR")
  // Wait for userId to be loaded before fetching userInfo
  const { 
    data: userInfoRaw, 
    isLoading: userInfoLoading, 
    refetch: refetchUserInfo 
  } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'userInfo',
    args: effectiveUserId ? [effectiveUserId] : undefined,
    enabled: !!effectiveUserId,
    watch: true,  // ✅ Enable real-time updates
  });

  // Memoize userInfo with corrected income categorization
  const userInfo = useMemo(() => {
    if (!userInfoRaw || !Array.isArray(userInfoRaw)) return null;
    
    // Safety check: ensure we have valid numeric values before converting to BigInt
    const safeConvertToBigInt = (value) => {
      if (!value) return 0n;
      const str = typeof value === 'string' ? value : value.toString?.() || '0';
      // Check if it's a valid numeric string
      if (!/^\d+$/.test(str)) return 0n;
      try {
        return BigInt(str);
      } catch (e) {
        console.warn('⚠️ Dashboard - Failed to convert to BigInt:', { value, error: e.message });
        return 0n;
      }
    };
    
    // Get the raw values and ensure they're BigInts with null checks
    // Struct User order:
    // 0: totalIncome, 1: totalDeposit, 2: royaltyIncome, 3: referralIncome, 4: levelIncome, 5: sponsorIncome,
    // 6: start, 7: level, 8: directTeam, 9: totalMatrixTeam, 10: layer, 11: account, 12: id, 13: referrer,
    // 14: upline, 15: directTeamMembers
    const rawRoyaltyIncome = safeConvertToBigInt(userInfoRaw[2]);
    const rawReferralIncome = safeConvertToBigInt(userInfoRaw[3]);
    const rawSponsorIncome = safeConvertToBigInt(userInfoRaw[5]); // sponsorIncome at index 5
    const rawLevelIncome = safeConvertToBigInt(userInfoRaw[4]); // levelIncome at index 4
    
    // If level < 8, add royalty income to referral income
    const level = userInfoRaw[7] ? Number(userInfoRaw[7]) : 0;
    let correctedRoyaltyIncome = 0n;
    let correctedReferralIncome = rawReferralIncome;
    
    if (level < 8 && rawRoyaltyIncome > 0n) {
      correctedReferralIncome = rawReferralIncome + rawRoyaltyIncome;
      correctedRoyaltyIncome = 0n;
    } else {
      correctedRoyaltyIncome = rawRoyaltyIncome;
    }

    return {
      account: userInfoRaw[11] || '', // account at index 11
      id: userInfoRaw[12] || '', // id at index 12
      referrer: userInfoRaw[13] || '', // referrer at index 13
      upline: userInfoRaw[14] || '', // upline at index 14
      layer: userInfoRaw[10] ? Number(userInfoRaw[10]) : 0, // layer at index 10
      start: userInfoRaw[6] ? Number(userInfoRaw[6]) : 0, // start at index 6
      level: level, // level at index 7
      directTeam: userInfoRaw[8] ? Number(userInfoRaw[8]) : 0, // directTeam at index 8
      directTeamMembers: userInfoRaw[15] || [], // directTeamMembers at index 15
      totalIncome: safeConvertToBigInt(userInfoRaw[0]), // totalIncome at index 0
      totalDeposit: safeConvertToBigInt(userInfoRaw[1]), // totalDeposit at index 1
      royaltyIncome: correctedRoyaltyIncome,
      referralIncome: correctedReferralIncome,
      sponsorIncome: rawSponsorIncome,
      levelIncome: rawLevelIncome, // Add levelIncome
      totalMatrixTeam: userInfoRaw[9] ? Number(userInfoRaw[9]) : 0, // totalMatrixTeam at index 9
    };
  }, [userInfoRaw]);

  // Fetch upline and referrer info
  const { data: uplineInfoRaw } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'userInfo',
    args: userInfo?.upline ? [userInfo.upline] : undefined,
    enabled: !!userInfo?.upline,
  });

  // Memoize uplineInfo
  const uplineInfo = useMemo(() => {
    if (!uplineInfoRaw) return null;
    // Struct User order: totalIncome(0), totalDeposit(1), royaltyIncome(2), referralIncome(3), 
    // levelIncome(4), sponsorIncome(5), start(6), level(7), directTeam(8), totalMatrixTeam(9), 
    // layer(10), account(11), id(12), referrer(13), upline(14), directTeamMembers(15)
    const totalMatrixTeam = Number(uplineInfoRaw[9].toString());
    return {
      account: uplineInfoRaw[11],
      id: uplineInfoRaw[12],
      referrer: uplineInfoRaw[13],
      upline: uplineInfoRaw[14],
      layer: Number(uplineInfoRaw[10]),
      start: Number(uplineInfoRaw[6]),
      level: Number(uplineInfoRaw[7]),
      directTeam: Number(uplineInfoRaw[8]),
      directTeamMembers: uplineInfoRaw[15],
      totalMatrixTeam: totalMatrixTeam,
      totalIncome: uplineInfoRaw[0],
      totalDeposit: uplineInfoRaw[1],
      royaltyIncome: uplineInfoRaw[2],
      referralIncome: uplineInfoRaw[3],
      levelIncome: uplineInfoRaw[4],
      sponsorIncome: uplineInfoRaw[5],
    };
  }, [uplineInfoRaw]);

  const { data: referrerInfoRaw } = useReadContract({
    ...mynncryptConfig,
    functionName: 'userInfo',
    args: userInfo?.referrer ? [userInfo.referrer] : undefined,
    enabled: !!userInfo?.referrer,
  });

  // Memoize referrerInfo
  const referrerInfo = useMemo(() => {
    if (!referrerInfoRaw) return null;
    // Struct User order: totalIncome(0), totalDeposit(1), royaltyIncome(2), referralIncome(3), 
    // levelIncome(4), sponsorIncome(5), start(6), level(7), directTeam(8), totalMatrixTeam(9), 
    // layer(10), account(11), id(12), referrer(13), upline(14), directTeamMembers(15)
    const totalMatrixTeam = Number(referrerInfoRaw[9].toString());
    return {
      account: referrerInfoRaw[11],
      id: referrerInfoRaw[12],
      referrer: referrerInfoRaw[13],
      upline: referrerInfoRaw[14],
      layer: Number(referrerInfoRaw[10]),
      start: Number(referrerInfoRaw[6]),
      level: Number(referrerInfoRaw[7]),
      directTeam: Number(referrerInfoRaw[8]),
      directTeamMembers: referrerInfoRaw[15],
      totalMatrixTeam: totalMatrixTeam,
      totalIncome: referrerInfoRaw[0],
      totalDeposit: referrerInfoRaw[1],
      royaltyIncome: referrerInfoRaw[2],
      referralIncome: referrerInfoRaw[3],
      levelIncome: referrerInfoRaw[4],
      sponsorIncome: referrerInfoRaw[5],
    };
  }, [referrerInfoRaw]);

  // Fetch default referral ID
  const { data: defaultReferralId } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getDefaultRefer',
  });

  const { data: royaltyIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getRoyaltyIncome',
    args: userId !== undefined && userId !== null ? [userId] : undefined,
    enabled: !!userId,
  });

  // eslint-disable-next-line no-unused-vars
  const { data: autoUpgradeBalance } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getAutoUpgradeBalance',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: nobleGiftStatus, refetch: refetchNobleGiftStatus } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserStatus',
    args: [address],
    enabled: !!address,
  });

  // eslint-disable-next-line no-unused-vars
  const { data: nobleGiftRank, refetch: refetchNobleGiftRank } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserRank',
    args: [address],
    enabled: !!address,
  });

  // eslint-disable-next-line no-unused-vars
  const { data: nobleGiftTotalDonation, refetch: refetchNobleGiftTotalDonation } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserTotalDonation',
    args: [address],
    enabled: !!address,
  });

  // eslint-disable-next-line no-unused-vars
  const { data: nobleGiftTotalIncome, refetch: refetchNobleGiftTotalIncome } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserTotalIncome',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream A income (from Level 4 deposits)
  const { data: mynnGiftIncomeStreamA, refetch: refetchMynnGiftIncomeStreamA } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserTotalIncome_StreamA',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream B income (from Level 8 deposits)
  const { data: mynnGiftIncomeStreamB, refetch: refetchMynnGiftIncomeStreamB } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserTotalIncome_StreamB',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream A rank
  const { data: mynnGiftRankStreamA } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserRank_StreamA',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream B rank
  const { data: mynnGiftRankStreamB } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserRank_StreamB',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream A income breakdown per rank
  const { data: mynnGiftIncomeBreakdownA } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserIncomeBreakdown_StreamA',
    args: [address],
    enabled: !!address,
  });

  // ✅ NEW: Fetch Stream B income breakdown per rank
  const { data: mynnGiftIncomeBreakdownB } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserIncomeBreakdown_StreamB',
    args: [address],
    enabled: !!address,
  });

  // Fetch NobleGift waiting queue for the user's current rank
  const { data: nobleGiftWaitingQueue, isLoading: nobleGiftWaitingQueueLoading, error: nobleGiftWaitingQueueError, refetch: refetchNobleGiftWaitingQueue } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankWaitingQueue',
    args: nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0 ? [nobleGiftRank] : undefined,
    enabled: !!address && nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0,
  });

  // Check if user is in NobleGift waiting queue
  // eslint-disable-next-line no-unused-vars
  const { data: isUserInNobleGiftWaitingQueue, isLoading: isUserInNobleGiftWaitingQueueLoading, refetch: refetchIsUserInNobleGiftWaitingQueue } = useReadContract({
    ...mynngiftConfig,
    functionName: 'isInWaitingQueue',
    args: nobleGiftRank !== undefined && nobleGiftRank !== null && address ? [nobleGiftRank, address] : undefined,
    enabled: !!address && nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0,
  });

  // Get user's position in NobleGift waiting queue
  // eslint-disable-next-line no-unused-vars
  const { data: nobleGiftQueuePosition, isLoading: nobleGiftQueuePositionLoading, refetch: refetchNobleGiftQueuePosition } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getWaitingQueuePosition',
    args: nobleGiftRank !== undefined && nobleGiftRank !== null && address ? [nobleGiftRank, address] : undefined,
    enabled: !!address && nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0 && isUserInNobleGiftWaitingQueue === true,
  });

  // Fetch current rank donors for the user's rank
  // eslint-disable-next-line no-unused-vars
  const { data: currentRankDonors, isLoading: isCurrentRankDonorsLoading, refetch: refetchCurrentRankDonors } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankDonors',
    args: nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0 ? [nobleGiftRank] : undefined,
    enabled: !!address && nobleGiftRank !== undefined && nobleGiftRank !== null && nobleGiftRank > 0,
  });

  // Write functions for NobleGift waiting queue
  // eslint-disable-next-line no-unused-vars
  const { writeContract: writeJoinNobleGiftWaitingQueue, data: hashJoinNobleGiftWaitingQueue, isPending: isJoiningNobleGiftWaitingQueue, isSuccess: isSuccessJoinNobleGiftWaitingQueue, isError: isErrorJoinNobleGiftWaitingQueue, error: errorJoinNobleGiftWaitingQueue } = useWriteContract();
  // eslint-disable-next-line no-unused-vars
  const { isLoading: isConfirmingJoinNobleGiftWaitingQueue, isSuccess: isConfirmedJoinNobleGiftWaitingQueue } = useWaitForTransactionReceipt({
    hash: hashJoinNobleGiftWaitingQueue,
  });

  // eslint-disable-next-line no-unused-vars
  const handleJoinNobleGiftWaitingQueue = async () => {
    try {
      if (nobleGiftRank === undefined || nobleGiftRank === null || nobleGiftRank === 0) {
        toast.error("Cannot join queue: MynnGift Rank is not valid.");
        return;
      }
      // Check if the user is already a receiver
      if (nobleGiftStatus === 'Recipient' || nobleGiftStatus === 'Donor & Recipient') {
        toast.error("You are already a MynnGift recipient or have already participated.");
        return;
      }
      // Check if the user is already in the waiting queue
      if (isUserInNobleGiftWaitingQueue) {
        toast.error("You are already in the MynnGift waiting queue.");
        return;
      }
      writeJoinNobleGiftWaitingQueue({
        ...mynngiftConfig,
        functionName: 'joinWaitingQueue',
        args: [nobleGiftRank],
      });
      toast.info("MynnGift waiting queue join request sent successfully! Waiting for confirmation.");
    } catch (error) {
      handleContractError(error, "joining MynnGift waiting queue");
    }
  };

  // Refetch NobleGift data after successful join or if error occurs
  useEffect(() => {
    if (isConfirmedJoinNobleGiftWaitingQueue) {
      toast.success("Successfully joined the MynnGift waiting queue!");
      refetchNobleGiftStatus();
      refetchNobleGiftWaitingQueue();
      refetchIsUserInNobleGiftWaitingQueue();
      refetchNobleGiftQueuePosition(); // Refetch position after joining
    }
    if (isErrorJoinNobleGiftWaitingQueue) {
      handleContractError(errorJoinNobleGiftWaitingQueue, "joining MynnGift waiting queue");
    }
  }, [isConfirmedJoinNobleGiftWaitingQueue, isErrorJoinNobleGiftWaitingQueue, errorJoinNobleGiftWaitingQueue, refetchNobleGiftStatus, refetchNobleGiftWaitingQueue, refetchIsUserInNobleGiftWaitingQueue, refetchNobleGiftQueuePosition]);

  // Add contract read for NobleGift global stats
  // eslint-disable-next-line no-unused-vars
  const { data: gasSubsidyPoolBalance } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getGasSubsidyPoolBalance',
    enabled: true, // Always enabled as it's a global stat
  });

  // eslint-disable-next-line no-unused-vars
  const { data: totalNobleGiftReceivers } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getTotalReceivers',
    enabled: true, // Always enabled as it's a global stat
  });

  // Fetch matrix income
  // eslint-disable-next-line no-unused-vars
  const { data: matrixIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMatrixIncome',
    args: [address],
    enabled: !!address,
  });

  // Fetch leadership income
  // eslint-disable-next-line no-unused-vars
  const { data: leadershipIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getLeadershipIncome',
    args: [address],
    enabled: !!address,
  });

  // Fetch global share income
  // eslint-disable-next-line no-unused-vars
  const { data: globalShareIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getGlobalShareIncome',
    args: [address],
    enabled: !!address,
  });

  // Fetch detailed income history with watch enabled
  // eslint-disable-next-line no-unused-vars
  const { data: incomeHistoryRaw, isLoading: incomeHistoryLoading, error: incomeHistoryError, refetch: refetchIncomeHistory } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getIncome',
    args: userId !== undefined && userId !== null ? [userId] : undefined,
    enabled: !!userId, // ✅ FIXED: Only need userId, userInfo is not needed for getIncome
    watch: true
  });

  // Fetch level income breakdown
  // eslint-disable-next-line no-unused-vars
  const { data: levelIncomeBreakdownRaw, isLoading: levelIncomeLoading, error: levelIncomeError } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getLevelIncome',
    args: userId !== undefined && userId !== null ? [userId] : undefined,
    enabled: !!userId, // ✅ FIXED: Only need userId, userInfo is not needed
  });

  // Fetch next level cost
  const { data: nextLevelCost } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getLevelCost',
    args: userInfo?.level !== undefined ? [BigInt(userInfo.level) + BigInt(1)] : undefined,
    enabled: !!userInfo?.level,
  });

  // Process income history data with enhanced error handling and real-time updates
  useEffect(() => {
    console.log('� Income History useEffect running');
    if (incomeHistoryRaw && Array.isArray(incomeHistoryRaw)) {
      try {
        const processedHistory = incomeHistoryRaw.map((income, idx) => {
          if (!income) return null;
          
          const layer = Number(income.layer ?? 0);
          const senderId = income.id?.toString() || '';
          
          // Convert amount to ether for logging
          const amountInEther = income.amount ? ethers.formatEther(income.amount?.toString() || '0') : '0';
          
          // FILTER: Exclude MynnGift deposits (layers 4 and 8 = pengeluaran, bukan income)
          // MynnGift deposits are recorded with layer 4 (Level 4 upgrade) or layer 8 (Level 8 upgrade)
          // These are EXPENSES, not income - should NOT appear in income history
          // Only referral (0), sponsor (1), upline (10+), and royalty should be shown
          if (layer === 4 || layer === 8) {
            return null; // Skip MynnGift deposits from income history
          }
          
          if (layer >= 2 && layer <= 9 && senderId === receiverId) {
            return null; // Skip other MynnGift entries
          }
          
          // Determine income type based on layer
          const incomeType = ((lyr) => {
              if (lyr === 0) {
                return IncomeType.REFERRAL;
              }
              if (lyr === 1) {
                return IncomeType.SPONSOR;
              }
              if (lyr === 4) {
                return IncomeType.ROYALTY;
              }
              if (lyr === 11) {
                return IncomeType.ROYALTY;
              }
              // ✅ FIXED: Any layer >= 10 (except 11) is UPLINE income from level upgrades
              // Layer 10 = Level 1 upline, Layer 12 = Level 2 upline, etc.
              if (lyr >= 10) {
                console.log(`  → Mapped to UPLINE (layer ${lyr} = level ${lyr - 10 + 1} upline income)`);
                return IncomeType.UPLINE;
              }
              // Fallback for types not explicitly mapped (shouldn't happen)
              console.log(`  → Mapped to REFERRAL (fallback for layer ${lyr})`);
              return IncomeType.REFERRAL; 
          })(layer);

          const senderIdFromContract = income.id?.toString() || '';
          // ✅ FIXED: Contract Income struct hanya punya: id, layer, amount, time
          // Tidak punya receiverId - kita gunakan userId dari context
          const receiverIdFromContract = userId?.toString() || '';

          // Construct the new income object with explicit fields
          const newIncomeObj = {
            senderId: senderIdFromContract,
            receiverId: receiverIdFromContract,
            incomeType: incomeType,
            amount: ethers.formatEther(income.amount?.toString() || '0'),
            // ✅ Contract uses 'time' (unix seconds), convert to milliseconds
            timestamp: (Number(income.time || 0) * 1000),
            layer: Number(income.layer ?? 0)
          };
          
          // Special logging for royalty and large amounts
          
          return newIncomeObj;
        }).filter(Boolean); // Remove null entries
        
        // Combine with existing income history, ensuring no duplicates.
        // Duplicates are identified by senderId, receiverId, incomeType, amount, and timestamp.
        const combinedHistory = [];
        const uniqueEntriesMap = new Map(); // Key: `${receiverId}-${incomeType}-${amount}-${roundedTimestamp}`, Value: income object

        [...processedHistory, ...incomeHistory].forEach(income => {
          // For sponsor income, prioritize entries with a non-empty senderId
          const isSponsor = income.incomeType === IncomeType.SPONSOR;
          
          // Use a rounded timestamp for better matching (e.g., to the nearest 10 seconds)
          // This helps catch duplicates even if timestamps differ by a few milliseconds/seconds.
          const roundedTimestamp = Math.floor(income.timestamp / 10000) * 10000; 
          const baseKey = `${income.receiverId}-${income.incomeType}-${income.amount}-${roundedTimestamp}`;

          if (uniqueEntriesMap.has(baseKey)) {
            const existingIncome = uniqueEntriesMap.get(baseKey);
            
            if (isSponsor) {
              // If the existing entry has an empty senderId and the new entry has a non-empty one,
              // replace the existing entry with the new (more complete) one.
              if (existingIncome.senderId === '' && income.senderId !== '') {
                uniqueEntriesMap.set(baseKey, income);
              }
              // Otherwise, if the new entry has an empty senderId and the existing has a non-empty one,
              // or if both are valid/invalid, we keep the existing (first one encountered).
            }
            // For other income types, or if not sponsor, just keep the first one encountered (existingIncome).
          } else {
            // If no entry exists for this baseKey, add the current income entry.
            uniqueEntriesMap.set(baseKey, income);
          }
        });

        // Convert map values back to an array
        combinedHistory.push(...Array.from(uniqueEntriesMap.values()));

        // Sort by time in descending order
        combinedHistory.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, not Date object
        
        console.log('Processed and Combined Income History:', combinedHistory);
        setIncomeHistory(combinedHistory); // Set the combined, unique, and sorted history
      } catch (error) {
        setIncomeHistory([]);
      }
    } else {
      setIncomeHistory([]);
    }
  }, [incomeHistoryRaw, userId]);

  // Process level income breakdown with proper error handling
  useEffect(() => {
    if (levelIncomeBreakdownRaw && Array.isArray(levelIncomeBreakdownRaw)) {
      try {
        const processedBreakdown = Array.from(levelIncomeBreakdownRaw).map((amount, index) => {
          return {
            level: index + 1,
            amount: amount ? ethers.formatEther(amount.toString()) : '0',
          };
        });
        console.log('Processed Level Income Breakdown:', processedBreakdown);
        setLevelIncomeBreakdown(processedBreakdown);
      } catch (error) {
        console.error('Error processing level income breakdown:', error);
        setLevelIncomeBreakdown([]);
      }
    } else {
      console.log('No level income breakdown data available');
      setLevelIncomeBreakdown([]);
    }
  }, [levelIncomeBreakdownRaw]);

  const { writeContract: upgrade, isPending: isUpgrading } = useWriteContract();
  const { writeContract: claimRoyalty, isPending: isClaiming, data: hashClaimRoyalty } = useWriteContract();
  // eslint-disable-next-line no-unused-vars
  const { writeContract: autoUpgrade, isPending: isAutoUpgrading } = useWriteContract();
  
  // ✅ Wait for claim royalty transaction confirmation
  const { isLoading: isConfirmingClaimRoyalty, isSuccess: isConfirmedClaimRoyalty } = useWaitForTransactionReceipt({
    hash: hashClaimRoyalty,
  });
  
  // ✅ Auto-refetch when claim royalty is confirmed
  useEffect(() => {
    if (isConfirmedClaimRoyalty) {
      console.log('✅ Claim Royalty transaction confirmed, waiting for block state update...');
      
      // ✅ Add delay to allow blockchain state to be fully updated
      // Some RPCs may need a small delay for data consistency
      const delayMs = 1500; // 1.5 seconds
      const timeoutId = setTimeout(() => {
        console.log('✅ Now refetching user data after state update...');
        
        // ✅ Invalidate all contract query caches to force fresh reads
        queryClient.invalidateQueries({ queryKey: ['readContract'] });
        
        // ✅ Then refetch specific data
        refetchUserInfo().then(() => {
          console.log('✅ User info refetched');
        }).catch(err => console.error('Error refetching user info:', err));
        refetchUserId().then(() => {
          console.log('✅ User ID refetched');
        }).catch(err => console.error('Error refetching user ID:', err));
        // ✅ Also refetch income history to show new royalty in transaction list
        refetchIncomeHistory().then(() => {
          console.log('✅ Income history refetched - royalty claim should now appear');
        }).catch(err => console.error('Error refetching income history:', err));
      }, delayMs);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isConfirmedClaimRoyalty, refetchUserInfo, refetchUserId, refetchIncomeHistory, queryClient]);

  // Mapping level ke nama rank
  const rankNames = {
    1: 'Copper 🟤',
    2: 'Silver ⚪',
    3: 'Gold 🟡',
    4: 'Platinum 🔘',
    5: 'Titanium 🌫️',
    6: 'Amber 🟠',
    7: 'Topaz 💎',
    8: 'Garnet 🔴',
    9: 'Onyx ⚫',
    10: 'Sapphire 🔵',
    11: 'Ruby ❤️',
    12: 'Diamond 💠',
  };

  const getRankName = (level) => {
    return rankNames[level] || 'N/A';
  };

  // Add NobleGift rank names
  const nobleGiftRankNames = {
    1: 'Squire',
    2: 'Knight',
    3: 'Baron',
    4: 'Viscount',
    5: 'Earl',
    6: 'Marquis',
    7: 'Duke',
    8: 'Archon',
  };

  // eslint-disable-next-line no-unused-vars
  const getNobleGiftRankName = (rank) => {
    return nobleGiftRankNames[rank] || 'N/A';
  };

  const calculateCumulativeUpgradeCost = useCallback((currentLevel, targetLevel) => {
    let totalCost = 0n;
    if (currentLevel >= targetLevel) return 0n; // No cost if already at or above target

    for (let i = currentLevel + 1; i <= targetLevel; i++) {
      const cost = LEVEL_UPGRADE_COSTS[i];
      if (cost) {
        totalCost += ethers.parseEther(cost);
      } else {
        console.warn(`Cost for level ${i} not defined.`);
        return 0n; // Return 0 if any intermediate level cost is not defined
      }
    }
    return totalCost;
  }, []);

  const handleUpgrade = async () => {
    if (!userInfo || userInfo.level === undefined) {
      toast.error("User information has not been loaded.");
      return;
    }

    const currentLevel = Number(userInfo.level);
    const targetLevel = selectedUpgradeLevel > 0 ? selectedUpgradeLevel : currentLevel + 1; // Default to next level if not specified

    if (targetLevel <= currentLevel) {
      toast.error("Target level must be higher than your current level.");
      return;
    }

    if (targetLevel > 12) { // Assuming 12 is the maximum level
      toast.error("You have reached the maximum level or selected an invalid level.");
      return;
    }

    const cumulativeCost = calculateCumulativeUpgradeCost(currentLevel, targetLevel);

    if (cumulativeCost === 0n) {
      toast.error("Cannot calculate upgrade cost. Check level or cost configuration.");
      return;
    }

    try {
      const previousLevel = userInfo?.level;

      await upgrade({
        ...mynncryptConfig,
        functionName: 'upgrade',
        value: cumulativeCost,
        args: [userId, BigInt(targetLevel - currentLevel)], // Pass userId and number of levels to upgrade
      });
      
      const levelName = getLevelName(targetLevel);
      const levelIcon = getLevelInfo(targetLevel)?.icon || "📊";
      toast.success(`Successfully upgraded to ${levelIcon} Level ${targetLevel} - ${levelName}!`);

      // Refetch user info to get the updated level
      await refetchUserInfo();
      await refetchUserId();

      // Check if the new level is 4 or more after successful upgrade
      if (previousLevel < 4 && targetLevel >= 4) { // Check if previous level was below 4 and new level is 4 or higher
        toast.success('🎉 Congratulations! You are now eligible for MynnGift!');
      }
      
      // Check if reached Stream B (level 8)
      if (previousLevel < 8 && targetLevel >= 8) {
        toast.success('🔥 Awesome! You have unlocked Stream B - Royalty Claims!');
      }
      
      // Check if reached Master Miner (level 12)
      if (previousLevel < 12 && targetLevel >= 12) {
        toast.success('👑 Incredible! You have reached Master Miner - Maximum Level!');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      // Check if it's a network-related error or transaction rejection
      if (error.code === 'ACTION_REJECTED' || error.code === 'UNPREDICTABLE_GAS_LIMIT' || error.message.includes('network')) {
        toast.error('Upgrade failed: Please check your network.');
      } else {
        toast.error(`Upgrade failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleClaimRoyalty = useCallback(async () => {
    // Validate level first
    if (userInfo?.level !== 8 && userInfo?.level !== 12) {
      toast.error('Claim royalty only available at level 8 and 12');
      return;
    }
    
    // Validate direct team requirement (minimum 2)
    if ((userInfo?.directTeam || 0) < 2) {
      toast.error('You need minimum 2 direct team members to be eligible for royalty claims');
      return;
    }
    
    // ✅ Validate royalty income exists (use getRoyaltyIncome mapping, not buggy struct field)
    if (!royaltyIncome || BigInt(royaltyIncome || 0n) === 0n) {
      toast.error('No royalty income to claim');
      return;
    }
    
    try {
      await claimRoyalty({
        ...mynncryptConfig,
        functionName: 'claimRoyalty',
      });
      toast.success('Claim royalty transaction sent! Waiting for confirmation...');
      // ✅ Transaction confirmation will trigger auto-refetch via useEffect above
    } catch (error) {
      toast.error('Claim failed: ' + error.message);
    }
  }, [claimRoyalty, mynncryptConfig, userInfo, royaltyIncome]);

  // Process income event function
  const processIncomeEvent = useCallback((event, type, currentUserId) => { // Added currentUserId as explicit param
    console.log('Processing real-time income event:', { event, type, currentUserId });

    let senderId = '';
    let receiverId = currentUserId || '';
    let incomeType = type;
    let layer = 0;
    let amount = ethers.formatEther(event.amount?.toString() || '0');
    let timestamp = Number(event.timestamp || Math.floor(Date.now() / 1000)) * 1000; // Convert to milliseconds

    if (event.eventName) {
      switch(event.eventName.toLowerCase()) {
        case 'referraldistribution':
          senderId = event.args?.referrerId || '';
          receiverId = event.args?.userId || currentUserId || '';
          incomeType = IncomeType.REFERRAL;
          layer = 0; // Referral is layer 0
          break;
        case 'uplinedistribution':
          senderId = event.args?.uplineId || '';
          receiverId = event.args?.userId || currentUserId || '';
          incomeType = IncomeType.UPLINE;
          layer = event.args?.level ? Number(event.args.level) + 10 : 10; // Upline layer + OFFSET
          break;
        case 'sponsordistribution':
          senderId = event.args?.sponsorId || '';
          receiverId = event.args?.userId || currentUserId || '';
          incomeType = IncomeType.SPONSOR;
          layer = 1; // Sponsor is layer 1
          break;
        case 'royaltyreward': // Assuming RoyaltyReward event is for direct royalty income
          senderId = 'System'; // Royalty usually from system/pool
          receiverId = event.args?.userId || currentUserId || '';
          incomeType = IncomeType.ROYALTY;
          layer = 4; // Or appropriate layer for royalty
          break;
        default:
          // Handle other event types or fallbacks if needed
          senderId = event.args?.fromUser || event.args?.sender || '';
          receiverId = event.args?.toUser || currentUserId || '';
          incomeType = type; // Use the provided type as fallback
          layer = event.args?.layer || event.args?.level || 0;
          break;
      }
    }

    // Ensure receiverId is always the current dashboard user
    if (receiverId !== currentUserId) {
      console.warn(`Event receiverId (${receiverId}) does not match current user ID (${currentUserId}). Adjusting to current user.`);
      receiverId = currentUserId;
    }

    const newIncome = {
      senderId: senderId || 'System', // Ensure senderId is not empty
      receiverId: receiverId,
      incomeType: incomeType,
      amount: amount,
      timestamp: timestamp,
      layer: layer
    };

    console.log('Processed new income event object:', newIncome);

    setIncomeHistory(prev => {
      const exists = prev.some(income =>
        income.senderId === newIncome.senderId &&
        income.receiverId === newIncome.receiverId &&
        income.incomeType === newIncome.incomeType &&
        income.amount === newIncome.amount &&
        Math.abs(income.timestamp - newIncome.timestamp) < 5000 // Allow for slight timestamp difference (5 seconds)
      );

      if (!exists) {
        // Add to history and sort by timestamp
        return [...prev, newIncome].sort((a, b) => b.timestamp - a.timestamp);
      }
      return prev;
    });
  }, []); // Depend on userId for receiverId consistency, but processIncomeEvent does not directly use userId in its useCallback dependencies as userId is passed as a parameter.

  // Utility function to validate income events and amounts
  const validateAndNormalizeEvent = useCallback((event, currentUserId) => { // Pass currentUserId
    try {
      if (!event) throw new Error('Event is null or undefined');
      
      // Normalize amount
      let amount = event.amount || '0';
      if (typeof amount === 'number') amount = amount.toString();
      
      // Validate and normalize timestamps
      const timestamp = event.timestamp || event.time || Math.floor(Date.now() / 1000); // In seconds
      
      // Normalize user IDs based on event arguments
      let sender = 'System';
      let receiver = currentUserId || '';

      if (event.eventName === 'ReferralDistribution') {
        sender = event.args?.referrerId || '';
        receiver = event.args?.userId || '';
      } else if (event.eventName === 'UplineDistribution') {
        sender = event.args?.uplineId || '';
        receiver = event.args?.userId || '';
      } else if (event.eventName === 'SponsorDistribution') {
        sender = event.args?.sponsorId || '';
        receiver = event.args?.userId || '';
      } else if (event.eventName === 'RoyaltyReward') {
        sender = 'System';
        receiver = event.args?.userId || '';
      } else {
        sender = event.fromUser || event.upline || event.from || 'System';
        receiver = event.userId || event.id || '';
      }
      
      return {
        ...event,
        senderId: sender,
        receiverId: receiver,
        amount,
        timestamp,
        layer: Number(event.level || event.layer || 0)
      };
    } catch (error) {
      console.error('Event validation failed:', error);
      return null;
    }
  }, []); // No dependencies for useCallback, as it only uses its parameters and global constants.

  // Hook to manage contract event subscriptions
  // eslint-disable-next-line no-unused-vars
  const useContractEvents = (config, userId) => {
    useEffect(() => {
      if (!config?.abi || !config?.address || !userId) {
        console.log('Missing required contract configuration:', {
          hasAbi: !!config?.abi,
          hasAddress: !!config?.address,
          userId
        });
        return;
      }

      let provider;
      let contract;

      const setup = async () => {
        try {
          // Initialize provider
          provider = new ethers.WebSocketProvider(window.ethereum);
          contract = new ethers.Contract(config.address, config.abi, provider);
          
          console.log('Contract setup successful');
          
          // Event handlers
          // eslint-disable-next-line no-unused-vars
          const handleUpgrade = async (id, newLevel, cost, event) => {
            try {
              console.log('Upgrade event:', { id, newLevel, cost });
              
              if (id.toString() === userId.toString()) {
                setRecentUpgrades(prev => [{
                  id: id.toString(),
                  newLevel: Number(newLevel),
                  cost: ethers.formatEther(cost),
                  timestamp: Date.now()
                }, ...prev].slice(0, 5));
                
                await Promise.all([refetchUserInfo(), refetchUserId()]);
              }
            } catch (_error) {
              console.error('Error handling upgrade event:', _error);
            }
          };
          
          const handleIncome = (eventData, type) => { // Changed param from (toUserId, fromUserId, amount, event, type)
            try {
              // Pass userId to validateAndNormalizeEvent and processIncomeEvent
              const validatedEvent = validateAndNormalizeEvent(eventData, userId);
              
              if (validatedEvent && validatedEvent.receiverId === userId.toString()) { // Check receiverId from validated event
                processIncomeEvent(validatedEvent, type, userId); // Pass userId explicitly
              }
            } catch (_error) {
              console.error('Error handling income event:', _error);
            }
          };

          // Subscribe to events
          contract.on('Upgraded', handleUpgrade);
          contract.on('ReferralDistribution', (...args) => handleIncome({ eventName: 'ReferralDistribution', args: { userId: args[0], referrerId: args[1], amount: args[2] } }, IncomeType.REFERRAL));
          contract.on('UplineDistribution', (...args) => handleIncome({ eventName: 'UplineDistribution', args: { userId: args[0], uplineId: args[1], amount: args[2] } }, IncomeType.UPLINE));
          contract.on('SponsorDistribution', (...args) => handleIncome({ eventName: 'SponsorDistribution', args: { userId: args[0], sponsorId: args[1], amount: args[2] } }, IncomeType.SPONSOR));
          contract.on('RoyaltyReward', (...args) => handleIncome({ eventName: 'RoyaltyReward', args: { userId: args[0], amount: args[1] } }, IncomeType.ROYALTY));

          console.log('Event listeners set up successfully');
        } catch (error) {
          console.error('Error setting up contract events:', error);
        }
      };

      setup();

      // Cleanup
      return () => {
        if (contract) {
          contract.removeAllListeners();
        }
        if (provider) {
          provider.removeAllListeners();
        }
      };
    }, [config?.abi, config?.address, userId]); // Removed processIncomeEvent and validateAndNormalizeEvent as they are not valid dependencies
  };

  // Setup event listeners using wagmi hooks with automatic data refresh
  useEffect(() => {
    if (!mynncryptConfig?.abi || !userId) return;

    try {
      console.log('Setting up contract event listeners for userId:', userId);
      
      const contract = {
        abi: mynncryptConfig.abi,
        address: mynncryptConfig.address
      };

      // Use BrowserProvider instead of Web3Provider which is no longer used in ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Buat kontrak instance secara asinkron
      provider.getSigner().then(signer => {
        const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);
        
        // Handle upgrade events
        const onUpgrade = async (id, newLevel, cost, event) => {
          console.log('Upgrade event detected:', { id, newLevel, cost, event });
          setRecentUpgrades(prev => [{
            id,
            newLevel: Number(newLevel),
            cost: ethers.formatEther(cost),
            timestamp: Date.now()
          }, ...prev].slice(0, 5));

          // Refresh data after upgrade
          await Promise.all([
            refetchUserInfo(),
            refetchUserId()
          ]);
        };
        contractInstance.on('Upgraded', onUpgrade);

        // Handle referral income events with enhanced logging
        const referralFilter = contractInstance.filters.ReferralDistribution();
        const onReferral = async (toUserId, fromUserId, amount, event) => {
          console.log('Referral income event detected:', { toUserId, fromUserId, amount, event });
          
          // Make sure we only process events for our user
          if (toUserId !== userId) {
            console.log('Skipping referral event for different user');
            return;
          }

          processIncomeEvent({
            eventName: 'ReferralDistribution', // Add eventName to identify type
            args: { userId: toUserId, referrerId: fromUserId, amount: amount } // Pass event arguments
          }, IncomeType.REFERRAL, userId); // Pass userId explicitly

          // Refresh user data
          await refetchUserInfo();
        };
        contractInstance.on(referralFilter, onReferral);

        // Handle upline income events with enhanced logging
        const uplineFilter = contractInstance.filters.UplineDistribution();
        const onUpline = async (toUserId, uplineId, amount, event) => {
          console.log('Upline income event detected:', { toUserId, uplineId, amount, event });

          // Make sure we only process events for our user
          if (toUserId !== userId) {
            console.log('Skipping upline event for different user');
            return;
          }

          processIncomeEvent({
            eventName: 'UplineDistribution', // Add eventName to identify type
            args: { userId: toUserId, uplineId: uplineId, amount: amount, level: event?.args?.level || 0 } // Pass event arguments
          }, IncomeType.UPLINE, userId); // Pass userId explicitly

          // Refresh user data
          await refetchUserInfo();
        };
        contractInstance.on(uplineFilter, onUpline);

        // Handle sponsor income events
        const sponsorFilter = contractInstance.filters.SponsorDistribution();
        const onSponsor = (receivedUserId, fromUser, amount, level) => { // Renamed userId to receivedUserId for clarity
          console.log('Sponsor income event detected:', { receivedUserId, fromUser, amount, level });

          if (receivedUserId !== userId) {
            console.log('Skipping sponsor event for different user');
            return;
          }

          processIncomeEvent({
            eventName: 'SponsorDistribution',
            args: { userId: receivedUserId, sponsorId: fromUser, amount: amount, level: level}
          }, IncomeType.SPONSOR, userId);
        };
        contractInstance.on(sponsorFilter, onSponsor);

        // Handle RoyaltyReward events
        const royaltyRewardFilter = contractInstance.filters.RoyaltyReward();
        const onRoyaltyReward = (receivedUserId, amount) => {
          console.log('RoyaltyReward event detected:', { receivedUserId, amount });

          if (receivedUserId !== userId) {
            console.log('Skipping RoyaltyReward event for different user');
            return;
          }

          processIncomeEvent({
            eventName: 'RoyaltyReward',
            args: { userId: receivedUserId, amount: amount}
          }, IncomeType.ROYALTY, userId);
        };
        contractInstance.on(royaltyRewardFilter, onRoyaltyReward);

        // Cleanup function for this specific instance
        return () => {
          try {
            contractInstance.off('Upgraded', onUpgrade);
            contractInstance.off('ReferralDistribution', onReferral);
            contractInstance.off('UplineDistribution', onUpline);
            contractInstance.off('SponsorDistribution', onSponsor);
            contractInstance.off('RoyaltyReward', onRoyaltyReward);
          } catch (_error) {
            console.error('Error cleaning up event listeners (inner):', _error);
          }
        };
      }).catch(error => {
        console.error('Error getting signer for event listeners:', error);
      });
      
      // Pastikan ada cleanup untuk outer useEffect juga
      return () => {
        // Cleanup dilakukan di dalam then() block
      };
    } catch (error) {
      console.error('Error setting up event listeners (outer):', error);
    }
  }, [mynncryptConfig?.abi, mynncryptConfig?.address, userId, processIncomeEvent, refetchUserInfo, refetchUserId, validateAndNormalizeEvent]);

  // eslint-disable-next-line no-unused-vars
  const handleAutoUpgrade = useCallback(async () => {
    try {
      await autoUpgrade({
        ...mynncryptConfig,
        functionName: 'autoUpgrade',
        args: [userId],
      });
      toast.success('Auto-upgrade successful!');
      refetchUserInfo();
      refetchUserId();
    } catch (error) {
      toast.error('Auto-upgrade failed: ' + error.message);
    }
  }, [userId, autoUpgrade, mynncryptConfig, refetchUserInfo, refetchUserId]);

  const handleShareReferral = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCopyLink = useCallback(() => {
    // Detect environment - support localhost for testing
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `http://${window.location.hostname}:${window.location.port}`
      : 'https://project-mc-tan.vercel.app';
    
    const referralLink = `${baseUrl}/register?ref=${userId}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Referral link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link. Please try again.');
    });
  }, [userId]);

  const handleLogout = useCallback(() => {
    localStorage.setItem('loggedOut', 'true');
    disconnect();
    navigate('/');
  }, [disconnect, navigate]);

  // Enhanced debugging with more detailed information
  useEffect(() => {
    console.log('Debug Dashboard State:', {
      isConnected,
      address,
      userId: userId?.toString(),
      userIdLoading,
      userIdError: userIdError?.message,
      userInfo: userInfo ? {
        ...userInfo,
        totalIncome: userInfo.totalIncome ? ethers.formatEther(userInfo.totalIncome) : '0',
        referralIncome: userInfo.referralIncome ? ethers.formatEther(userInfo.referralIncome) : '0',
        levelIncome: userInfo.levelIncome ? ethers.formatEther(userInfo.levelIncome) : '0',
        royaltyIncome: userInfo.royaltyIncome ? ethers.formatEther(userInfo.royaltyIncome) : '0',
      } : null,
      userInfoRaw,
      userInfoLoading,
      upline: userInfo?.upline,
      referrer: userInfo?.referrer,
      uplineInfo,
      referrerInfo,
      defaultReferralId,
      nextLevelCost: nextLevelCost?.toString(),
      incomeHistory: incomeHistory.length,
      levelIncomeBreakdown: levelIncomeBreakdown.length,
      activeSection,
    });
  }, [isConnected, address, userId, userIdLoading, userIdError, userInfoRaw, userInfoLoading, uplineInfo, referrerInfo, defaultReferralId, userInfo, nextLevelCost, incomeHistory, levelIncomeBreakdown, activeSection]);

  // Refetch data if userId changes
  useEffect(() => {
    if (userId) {
      console.log('UserId changed, refetching data...');
      refetchUserInfo();
    }
  }, [userId, refetchUserInfo]);

  // Add contract read for income breakdown
  const { data: incomeBreakdown } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getUserIncomeBreakdown',
    args: userId ? [userId] : undefined,
    enabled: !!userId
  });

  // Calculate total referral and sponsor income from incomeHistory
  // eslint-disable-next-line no-unused-vars
  const totalReferral = useMemo(() =>
    incomeHistory
      .filter(item => item.incomeType === IncomeType.REFERRAL && item.receiverId === userId?.toString())
      .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  , [incomeHistory, userId]);

  // Hitung total sponsor income hanya dari incomeHistory bertipe sponsor dan level/layer 1
  const totalSponsor = useMemo(() =>
    incomeHistory
      .filter(item => item.incomeType === IncomeType.SPONSOR && item.layer === 1) // Changed to incomeType and layer
      .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  , [incomeHistory]);

  // Calculate claimed royalty from income history (Type 4 = ROYALTY claim)
  const claimedRoyalty = useMemo(() => {
    if (!incomeHistory || !Array.isArray(incomeHistory)) return 0;
    return incomeHistory
      .filter(income => income.incomeType === IncomeType.ROYALTY)
      .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
  }, [incomeHistory]);

  // ✅ FIRST: Fetch MynnGift income breakdown for all ranks (MOVED UP before calculateTotalIncome)
  const { data: mynngiftIncomeBreakdown } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserIncomeBreakdown',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // ✅ Memoize MynnGift income breakdown (array per rank 1-8) (MOVED UP)
  const mynngiftIncomePerRank = useMemo(() => {
    if (!mynngiftIncomeBreakdown || !Array.isArray(mynngiftIncomeBreakdown)) return [];
    return mynngiftIncomeBreakdown.map((amount, idx) => ({
      rank: idx + 1,
      amount: amount ? ethers.formatEther(amount.toString()) : '0',
    }));
  }, [mynngiftIncomeBreakdown]);

  // ✅ Calculate total MynnGift income (MOVED UP before calculateTotalIncome)
  const totalMynngiftIncome = useMemo(() => {
    if (!mynngiftIncomePerRank.length) return 0;
    return mynngiftIncomePerRank.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  }, [mynngiftIncomePerRank]);

  // Update calculateTotalIncome to use the same sources as the breakdown
  const calculateTotalIncome = useMemo(() => {
    // Use the same calculation as the breakdown: referral, sponsor, upline, royalty
    const referral = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[0])) : 0; // Use contract's referral income
    const upline = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[1])) : 0;
    const sponsor = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[2])) : 0; // Use contract's sponsor income
    
    // ✅ OPTION B: Only include CLAIMED royalty in total income (from history layer 11)
    // Pending/claimable royalty is NOT included in total until it's claimed
    const totalRoyalty = claimedRoyalty;
    
    // ✅ NEW: Include MynnGift income (Stream A and B combined)
    const mynngiftTotal = totalMynngiftIncome || 0;
    
    return (referral + sponsor + upline + totalRoyalty + mynngiftTotal).toFixed(4);
  }, [incomeBreakdown, claimedRoyalty, totalMynngiftIncome]); // ✅ Add totalMynngiftIncome to dependencies

  // Get user level to determine stream eligibility
  const userLevel = userInfo ? userInfo.level : 0;
  const isEligibleForStreamA = userLevel >= 4;
  const isEligibleForStreamB = userLevel >= 8;

  // Render income breakdown with MynnGift streams
  const renderIncomeBreakdown = () => (
    <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-[#F5C45E] mb-6">Income Breakdown</h3>
      <div className="income-grid">
        {/* Referral Income */}
        <div className="futuristic-card p-4">
          <div className="flex flex-col space-y-2">
            <span className="income-title">Referral Income</span>
            <span className="income-value text-xl">
              {incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[0])).toFixed(4) : '0.0000'} opBNB
            </span>
            <span className="text-xs text-gray-400">
              91% from direct referral member registration fees
            </span>
          </div>
        </div>
        {/* Upline Income */}
        <div className="futuristic-card p-4">
          <div className="flex flex-col space-y-2">
            <span className="income-title">Upline Income</span>
            <span className="income-value text-xl">
              {incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[1])).toFixed(4) : '0.0000'} opBNB
            </span>
            <span className="text-xs text-gray-400">
              Income from upline network (matrix upgrades)
            </span>
          </div>
        </div>
        {/* Sponsor Income */}
        <div className="futuristic-card p-4">
          <div className="flex flex-col space-y-2">
            <span className="income-title">Sponsor Income</span>
            <span className="income-value text-xl">
              {incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[2])).toFixed(4) : '0.0000'} opBNB
            </span>
            <span className="text-xs text-gray-400">
              Sponsor income (10% bonus from downline matrix upgrades, excluding direct referral)
            </span>
          </div>
        </div>
        {/* Royalty Income */}
        <div className="futuristic-card p-4">
          <div className="flex flex-col space-y-2">
            <span className="income-title">Royalty Income</span>
            <span className="income-value text-xl">
              {claimedRoyalty.toFixed(4)} opBNB
            </span>
            <span className="text-xs text-gray-400">
              Royalty income claimed from network
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Add debug logging for main data
  useEffect(() => {
    console.log('Dashboard Main Data:', {
      userId: userId?.toString(),
      userInfo,
      incomeHistory,
      levelIncomeBreakdown,
      nobleGiftStatus,
      nobleGiftRank: nobleGiftRank?.toString(),
      nobleGiftTotalDonation: nobleGiftTotalDonation?.toString(),
      nobleGiftTotalIncome: nobleGiftTotalIncome?.toString(),
      nobleGiftWaitingQueue: nobleGiftWaitingQueue,
      nobleGiftWaitingQueueLoading: nobleGiftWaitingQueueLoading, // <--- Add this line
      nobleGiftWaitingQueueError: nobleGiftWaitingQueueError?.message, // <--- Add this line
      calculateTotalIncome,
    });
  }, [userId, userInfo, incomeHistory, levelIncomeBreakdown, nobleGiftStatus, nobleGiftRank, nobleGiftTotalDonation, nobleGiftTotalIncome, nobleGiftWaitingQueue, nobleGiftWaitingQueueLoading, nobleGiftWaitingQueueError, calculateTotalIncome]);

  // Add debug log for section changes
  useEffect(() => {
    console.log('Active Section Changed:', activeSection);
  }, [activeSection]);

  // Add contract read for layer members
  // eslint-disable-next-line no-unused-vars
  const { data: layerMembersData, isLoading: isLoadingLayerMembers, error: layerMembersError, refetch: refetchLayerMembers } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMatrixUsers',
    args: [userId || '', BigInt(selectedLayer || 1)],
    enabled: !!userId && activeSection === 'timsaya',
    onSuccess: (data) => {
      console.log('Successfully fetched layer members:', data);
      if (data) {
        setMembersPerLayer(prev => ({
          ...prev,
          [selectedLayer]: data
        }));
      }
    },
    onError: (error) => {
      console.error('Error fetching layer members:', error);
    }
  });

  // Update effect to use refetchLayerMembers instead of direct contract call
  useEffect(() => {
    if (!userId || !selectedLayer) return;

    console.log('Fetching members for layer:', selectedLayer);
    refetchLayerMembers()
      .then(() => {
        console.log('Layer members refetched successfully');
      })
      .catch(error => {
        console.error('Error refetching layer members:', error);
      });
  }, [userId, selectedLayer, refetchLayerMembers]);

  // Process layer members data with debug logging
  useEffect(() => {
    console.log('Layer members raw data:', layerMembersData);
    if (layerMembersData) {
      try {
        const processedMembers = layerMembersData.map(member => ({
          id: member.id,
          account: member.account,
          layer: Number(member.layer),
          level: Number(member.level),
          directTeam: Number(member.directTeam),
          totalMatrixTeam: Number(member.totalMatrixTeam)
        }));
        console.log('Processed layer members:', processedMembers);
        setLayerMembers(processedMembers);
      } catch (error) {
        console.error('Error processing layer members:', error);
        setLayerMembers([]);
      }
    }
  }, [layerMembersData]);

  // Calculate total matrix members
  // eslint-disable-next-line no-unused-vars
  const calculateTotalMatrixMembers = useMemo(() => {
    let total = 0;
    Object.values(membersPerLayer).forEach(members => {
      if (Array.isArray(members)) {
        total += members.length;
      }
    });
    return total;
  }, [membersPerLayer]);

  // Add contract read for direct team users
  // eslint-disable-next-line no-unused-vars
  const { data: directTeamData, isLoading: isLoadingDirectTeam, error: directTeamError } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getDirectTeamUsers',
    args: [userId || ''],
    enabled: !!userId && activeSection === 'timsaya',
    onSuccess: (data) => {
      console.log('Successfully fetched direct team:', data);
      if (data) {
        // Group members by level
        const groupedMembers = data.reduce((acc, member) => {
          const level = Number(member.level);
          if (!acc[level]) {
            acc[level] = [];
          }
          acc[level].push(member);
          return acc;
        }, {});
        console.log('Grouped members by level:', groupedMembers);
        setMembersByLevel(groupedMembers);
      }
    },
    onError: (error) => {
      console.error('Error fetching direct team:', error);
    }
  });

  // Add contract read for matrix users with the same pattern as direct team
  // eslint-disable-next-line no-unused-vars
  const { data: matrixUsersData, isLoading: matrixLoading, error: matrixError } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMatrixUsers',
    args: userId ? [userId.toString(), BigInt(selectedLayer)] : undefined,
    enabled: !!userId && activeSection === 'timsaya',
    onSuccess: (data) => {
      console.log(`Successfully fetched matrix users for layer ${selectedLayer}:`, data);
      if (data) {
        try {
          const processedUsers = data.map(user => {
            console.log('Processing matrix user:', user);
            return {
              id: user.id?.toString() || '',
              account: user.account?.toString() || '',
              layer: Number(user.layer || 0),
              level: Number(user.level || 0),
              directTeam: Number(user.directTeam || 0),
              totalMatrixTeam: Number(user.totalMatrixTeam || 0)
            };
          });
          console.log(`Processed matrix users for layer ${selectedLayer}:`, processedUsers);
          setMatrixUsers(prev => ({
            ...prev,
            [selectedLayer]: processedUsers
          }));
        } catch (error) {
          console.error('Error processing matrix users:', error);
        }
      }
    },
    onError: (error) => {
      console.error(`Error fetching matrix users for layer ${selectedLayer}:`, error);
    }
  });

  // Update effect to handle layer changes
  useEffect(() => {
    if (!userId || !selectedLayer) return;

    console.log('Fetching matrix users for layer:', selectedLayer);
    console.log('Current userId:', userId);
    console.log('Contract params:', {
      userId: userId.toString(),
      layer: selectedLayer,
      enabled: !!userId && activeSection === 'timsaya'
    });
  }, [userId, selectedLayer, activeSection]);

  // Add debug effect for matrix users state
  useEffect(() => {
    console.log('Matrix Users State Updated:', {
      selectedLayer,
      users: matrixUsers[selectedLayer],
      totalUsers: Object.values(matrixUsers).reduce((acc, users) => acc + (users?.length || 0), 0)
    });
  }, [matrixUsers, selectedLayer]);

  // Get level cost from contract
  // eslint-disable-next-line no-unused-vars
  const getLevelCost = useCallback(async (level) => {
    try {
      const cost = await mynncryptConfig.read.getLevelCost([BigInt(level)]);
      return cost;
    } catch (error) {
      console.error(`Error getting cost for level ${level}:`, error);
      return BigInt(0);
    }
  }, [mynncryptConfig]);

  // Calculate total deposit including registration and upgrades
  const calculateTotalDeposit = useMemo(() => {
    if (!userInfo?.level) return '0';
    
    try {
      // Registration cost is 0.0044 ETH
      let totalDeposit = ethers.parseEther('0.0044');
      
      // Level upgrade costs (without registration fee)
      const levelCosts = {
        2: ethers.parseEther('0.0072'),  // Level 2 upgrade cost
        3: ethers.parseEther('0.0144'),  // Level 3 upgrade cost
        4: ethers.parseEther('0.0288'),  // Level 4 upgrade cost
        5: ethers.parseEther('0.0576'),  // Level 5 upgrade cost
        6: ethers.parseEther('0.1152'),  // Level 6 upgrade cost
        7: ethers.parseEther('0.2304'),  // Level 7 upgrade cost
        8: ethers.parseEther('0.4608'),  // Level 8 upgrade cost
        9: ethers.parseEther('0.9216'),  // Level 9 upgrade cost
        10: ethers.parseEther('1.8432'), // Level 10 upgrade cost
        11: ethers.parseEther('3.6864'), // Level 11 upgrade cost
        12: ethers.parseEther('7.3728')  // Level 12 upgrade cost
      };

      // Add up costs for all levels up to current level
      for (let i = 2; i <= userInfo.level; i++) {
        if (levelCosts[i]) {
          totalDeposit += levelCosts[i];
        }
      }

      console.log('Total Deposit Calculation:', {
        level: userInfo.level,
        registrationFee: '0.0044',
        totalDeposit: ethers.formatEther(totalDeposit)
      });

      return ethers.formatEther(totalDeposit);
    } catch (error) {
      console.error('Error calculating total deposit:', error);
      return '0';
    }
  }, [userInfo?.level]);

  // Setup polling for income updates
  useEffect(() => {
    if (!mynncryptConfig || !userId) return;

    console.log('Setting up income polling for userId:', userId);

    // Poll for income updates every 30 seconds
    const pollInterval = setInterval(async () => {
      try {
        // Refetch income data
        await refetchUserInfo();
      } catch (error) {
        console.error('Error polling for income updates:', error);
      }
    }, 30000); // 30 seconds

    return () => {
      console.log('Cleaning up income polling');
      clearInterval(pollInterval);
    };
  }, [mynncryptConfig, userId, refetchUserInfo]);

  // Filter income history - Exclude MynnGift (NOBLEGIFT) as it's spending, not income
  const allowedIncomeTypes = useMemo(() => [
    IncomeType.REFERRAL,
    IncomeType.UPLINE,
    IncomeType.SPONSOR,
    IncomeType.ROYALTY
    // NOTE: IncomeType.NOBLEGIFT (6) is excluded because MynnGift donations are spending/expenses,
    // not actual income. They are being filtered out in the income processing step above.
  ], []);

  const filteredIncomeHistory = useMemo(() => {
    if (incomeFilter === 'ALL') return incomeHistory;
    return incomeHistory.filter(item => allowedIncomeTypes.includes(item.type) && item.type === Number(incomeFilter));
  }, [incomeHistory, incomeFilter, allowedIncomeTypes]);

  // Calculate pagination data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIncomeHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIncomeHistory.length / itemsPerPage);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Income History Table Component
  const IncomeHistoryTable = () => (
    <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold text-[#F5C45E]">Income History</h3>
        <select 
          value={incomeFilter}
          onChange={(e) => { setIncomeFilter(e.target.value); setCurrentPage(1); }} // Reset page on filter change
          className="bg-[#102E50] text-[#F5C45E] p-2 rounded border border-[#4DA8DA]/30"
        >
          <option value="ALL">All</option>
          {allowedIncomeTypes.map((value) => (
            <option key={value} value={value}>
              {IncomeTypeDisplay[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-sm font-semibold text-gray-400">Time</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-400">Type</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-400">From</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-400">Amount</th>
              <th className="text-center p-3 text-sm font-semibold text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems
                .map((income, index) => (
                  <tr key={`${income.senderId}-${income.receiverId}-${income.incomeType}-${income.timestamp}-${index}`} className="border-b border-gray-700/50 hover:bg-[#4DA8DA]/5"> 
                              <td className="p-3 text-sm">
                                <div className="flex flex-col">
                                  <span className="text-[#F5C45E]">
                                    {new Date(income.timestamp).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(income.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${income.incomeType === IncomeType.REFERRAL ? 'bg-blue-100 text-blue-800' :
                                    income.incomeType === IncomeType.UPLINE ? 'bg-green-100 text-green-800' :
                                    income.incomeType === IncomeType.SPONSOR ? 'bg-purple-100 text-purple-800' :
                                    income.incomeType === IncomeType.ROYALTY ? 'bg-yellow-100 text-yellow-800' :
                          income.incomeType === IncomeType.NOBLEGIFT ? 'bg-pink-100 text-pink-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                  {IncomeTypeDisplay[income.incomeType]}
                                </span>
                              </td>
                              <td className="p-3 text-sm">
                                <div className="flex flex-col">
                                  <span className="text-[#4DA8DA] font-mono">
                                    {income.senderId ? `${income.senderId.slice(0, 6)}...${income.senderId.slice(-4)}` : 'System'}
                                  </span>
                                  {income.incomeType === IncomeType.REFERRAL && (
                                    <span className="text-xs text-gray-400">Direct Referral</span>
                                  )}
                                  {income.incomeType === IncomeType.UPLINE && (
                                    <span className="text-xs text-gray-400">Matrix Upline</span>
                                  )}
                                  {income.incomeType === IncomeType.SPONSOR && (
                                    <span className="text-xs text-gray-400">Team Sponsor</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-[#F5C45E] font-mono font-semibold">
                                    {parseFloat(income.amount).toFixed(4)}
                                  </span>
                                  <span className="text-xs text-gray-400">opBNB</span>
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Sukses
                                </span>
                              </td>
                            </tr>
                          ))) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-400">
                  No income history to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-[#4DA8DA]/20 text-[#F5C45E] disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-[#F5C45E] text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-[#4DA8DA]/20 text-[#F5C45E] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    if (!mynncryptConfig || !userId) return;

    try {
      console.log('Setting up dashboard data and listeners');
      
      // Use wagmi contract events
      const handleEvent = (event, handlerName) => {
        console.log(`Handling ${handlerName} event:`, event);
        try {
          switch (handlerName) {
            case 'Upgraded':
              setRecentUpgrades(prev => [{
                id: event.args.id,
                newLevel: Number(event.args.newLevel),
                cost: ethers.formatEther(event.args.cost),
                timestamp: Date.now()
              }, ...prev].slice(0, 5));
              break;
            case 'ReferralDistribution':
            case 'UplineDistribution':
            case 'SponsorDistribution': {
              // Move the variable declaration outside the case block to fix the lexical declaration error
              let newIncome;
              if (event.args) {
                newIncome = {
                  id: event.args.userId,
                  type: handlerName === 'ReferralDistribution' ? 1 : 
                        handlerName === 'UplineDistribution' ? 2 : 3,
                  amount: ethers.formatEther(event.args.amount),
                  from: event.args.fromUser,
                  time: new Date(),
                  level: Number(event.args.level || 0)
                };
              }
              setIncomeHistory(prev => [newIncome, ...prev.slice(0, 99)]);
              break;
            }
          }
        } catch (error) {
          console.error(`Error handling ${handlerName} event:`, error);
        }
      };

      // We cannot use mynncryptConfig.getContract() because it is not available
      // Instead, we will create a contract instance using ethers.Contract
      let contractInstance = null;
      let unsubscribes = [];
      
      try {
        // Buat provider dan contract instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then(signer => {
          contractInstance = new ethers.Contract(mynncryptConfig.address, mynncryptConfig.abi, signer);
          
          // Setup event listeners
          contractInstance.on('Upgraded', (event) => handleEvent(event, 'Upgraded'));
          contractInstance.on('ReferralDistribution', (event) => handleEvent(event, 'ReferralDistribution'));
          contractInstance.on('UplineDistribution', (event) => handleEvent(event, 'UplineDistribution'));
          contractInstance.on('SponsorDistribution', (event) => handleEvent(event, 'SponsorDistribution'));
        }).catch(error => {
          console.error('Error getting signer for event listeners:', error);
        });
      } catch (error) {
        console.error('Error setting up contract instance for events:', error);
      }

      // Return cleanup function
      return () => {
        // Hapus semua event listeners jika contractInstance tersedia
        if (contractInstance) {
          try {
            contractInstance.removeAllListeners('Upgraded');
            contractInstance.removeAllListeners('ReferralDistribution');
            contractInstance.removeAllListeners('UplineDistribution');
            contractInstance.removeAllListeners('SponsorDistribution');
          } catch (_error) {
            console.error('Error in event cleanup:', _error);
          }
        }
        
        // Juga bersihkan unsubscribes lama jika ada
        unsubscribes.forEach(unsubscribe => {
          try {
            if (unsubscribe) unsubscribe();
          } catch (_error) { // eslint-disable-line no-unused-vars
            // Ignore error because unsubscribes might be empty
          }
        });
      };
    } catch (error) {
      console.error('Error in setting up event listeners:', error);
    }
  }, [mynncryptConfig, userId]);

  // Enhanced downline details fetching with error handling
  const getDownlineDetails = useCallback(async () => {
    if (!mynncryptConfig?.contract || !userId) {
      console.log('Missing required data for downline details:', { 
        mynncryptConfig: !!mynncryptConfig?.contract, 
        userId 
      });
      return;
    }

    try {
      console.log('Fetching downline details for userId:', userId);
      
      // Get direct team members
      const directTeam = await mynncryptConfig.read.getDirectTeamUsers([userId])
        .catch(error => {
          console.error('Error fetching direct team:', error);
          return [];
        });
      
      // Get matrix team members for first 3 layers
      const matrixTeams = await Promise.all(
        [1, 2, 3].map(layer => 
          mynncryptConfig.read.getMatrixUsers([userId, BigInt(layer)])
            .catch(error => {
              console.error(`Error fetching matrix layer ${layer}:`, error);
              return [];
            })
        )
      );
      
      // Calculate active downlines safely
      const activeDownlines = [...directTeam, ...matrixTeams.flat()]
        .filter(Boolean) // Remove any null/undefined entries
        .filter((member, index, self) => 
          index === self.findIndex(m => m?.id === member?.id) && 
          Number(member?.level || 0) > 1
        ).length;

      console.log('Downline details processed:', {
        directTeamCount: directTeam.length,
        matrixTeamCounts: matrixTeams.map(team => team.length),
        activeDownlines
      });

      setDownlineStats(prev => ({
        ...prev,
        activeDownlines
      }));
    } catch (error) {
      console.error('Error in getDownlineDetails:', error);
      handleContractError(error, 'fetching downline details');
    }
  }, [mynncryptConfig, userId]); // Removed handleContractError as it's not a valid dependency

  // Add effect to setup event listeners and fetch initial data with error handling
  useEffect(() => {
    console.log('Setting up dashboard data and listeners');
    let cleanup;
    
    try {
      cleanup = setupEventListeners();
      getDownlineDetails();
    } catch (error) {
      console.error('Error in dashboard setup effect:', error);
    }
    
    return () => {
      try {
        if (cleanup) cleanup();
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    };
  }, [setupEventListeners, getDownlineDetails]);

  // Add new component for Recent Upgrades
  const RecentUpgradesCard = () => (
    <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-[#F5C45E] mb-4">Recent Team Upgrades</h3>
      <div className="space-y-4">
        {recentUpgrades.map((upgrade, index) => (
          <div key={`${upgrade.id}-${index}`} className="flex items-center justify-between p-3 bg-[#102E50] rounded-lg">
            <div className="flex flex-col">
              <span className="text-[#4DA8DA] font-mono">ID: {upgrade.id}</span>
              <span className="text-sm text-gray-400">Level {upgrade.newLevel}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#F5C45E]">{upgrade.cost} opBNB</span>
              <span className="text-xs text-gray-400">
                {new Date(upgrade.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {recentUpgrades.length === 0 && (
          <p className="text-center text-gray-400">No recent upgrades yet</p>
        )}
      </div>
    </div>
  );

  // Add new component for Downline Statistics
  const DownlineStatsCard = () => (
    <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-[#F5C45E] mb-6">Downline Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-[#102E50] rounded-lg">
          <p className="text-sm text-gray-400">Total Commission</p>
          <p className="text-2xl text-[#F5C45E]">{downlineStats.totalCommissions.toFixed(4)} opBNB</p>
        </div>
        <div className="p-4 bg-[#102E50] rounded-lg">
          <p className="text-sm text-gray-400">Active Downlines</p>
          <p className="text-2xl text-[#F5C45E]">{downlineStats.activeDownlines}</p>
        </div>
      </div>
    </div>
  );

  // Update renderMainContent to include new components
  const renderMainContent = () => {
    // Pindahkan definisi totalIncomeNumber ke sini agar bisa diakses
    const totalIncomeNumber = parseFloat(calculateTotalIncome) || 0;

    switch(activeSection) {
      // DISABLED: Ebook feature for future use
      // case 'ebooks':
      //   return (
      //     <div className="space-y-6">
      //       <Ebook />
      //     </div>
      //   );
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Level Disclaimer Banner - Top */}
            <LevelDisclaimerBanner 
              variant="warning"
              className="mb-6"
            />

            {/* Top Row: User Info & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1: Informasi Pengguna */}
              <div className="luxury-card w-full max-w-full p-3 sm:p-6 rounded-xl">
                <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="luxury-title">User Information</h3>
                {userId ? (
                  <div className="space-y-2 text-white">
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">User ID:</span> <span className="font-mono text-[#F5C45E]">{userId.toString()}</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Wallet Address:</span> <span className="font-mono text-[#F5C45E]">{address ? `${address.slice(0, 8)}......${address.slice(-4)}` : 'Not Connected'}</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Level:</span> <span className="font-mono text-[#F5C45E]">{userInfoLoading ? 'Loading...' : 
                      userInfo?.level !== undefined ? `Level ${userInfo.level}` : 'N/A'
                    }</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Layer:</span> <span className="font-mono text-[#F5C45E]">{userInfoLoading ? 'Loading...' : 
                      userInfo?.layer !== undefined ? userInfo.layer : 'N/A'
                    }</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Upline:</span> <span className="font-mono text-[#F5C45E]">{userInfoLoading ? 'Loading...' : 
                      userInfo?.upline?.toString() || 'N/A'
                    }</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Referrer:</span> <span className="font-mono text-[#F5C45E]">{userInfoLoading ? 'Loading...' : 
                      userInfo?.referrer?.toString() || 'N/A'
                    }</span></p>
                    <p className="text-sm"><span className="font-semibold text-[#4DA8DA]">Direct Team:</span> <span className="font-mono text-[#F5C45E]">{userInfoLoading ? 'Loading...' : 
                      userInfo?.directTeam !== undefined ? userInfo.directTeam : 'N/A'
                    }</span></p>
                    <button
                      className="btn-cssbuttons mt-4 w-full"
                      onClick={handleShareReferral}
                    >
                      <span>
                        Share Referral Link
                        <span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 3.5L3.5 20.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.5 3.5L20.5 20.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </span>
                      <ul>
                        <li>
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handleCopyLink();
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 12.9V17.1C16 20.6 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </li>
                        <li>
                          <a href={(() => {
                            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                              ? `http://${window.location.hostname}:${window.location.port}`
                              : 'https://project-mc-tan.vercel.app';
                            return `https://wa.me/?text=Join%20Smart%20Mynncrypt%20Community%20using%20my%20referral%20link:%20${encodeURIComponent(baseUrl)}/register?ref=${userId}`;
                          })()} target="_blank" rel="noopener noreferrer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99622 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83208 6.75926 5.13534 7.96335C4.4386 9.16745 4.07046 10.5335 4.06776 11.9246C4.06507  13.3158 4.42793 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9001 16.124 19.0668 17.6222 17.5816C19.1205 16.0965 19.9715 14.0796 19.99 11.97C19.983 10.9173 19.7682 9.87634 19.3581 8.9068C18.948 7.93725 18.3505 7.05819 17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.2242 8.64 17.64L8.4 17.48L5.91 18.12L6.57 15.69L6.39 15.44C5.75186 14.3662 5.41702 13.1302 5.41702 11.87C5.41702 10.6098 5.75186 9.37377 6.39 8.29999C7.37359 6.66339 9.01574 5.58769 10.8679 5.33642C12.72 5.08515 14.5895 5.68458 16.0137 6.99449C17.4379 8.30439 18.2834 10.1995 18.34 12.19C18.3327 13.9182 17.6359 15.5725 16.3812 16.8186C15.1265 18.0648 13.4681 18.7501 11.74 18.75L12 18.53ZM15.41 13.22C15.2813 13.1461 15.1432 13.0925 15 13.06C14.8567 13.0276 14.7093 13.0116 14.561 13.0125C14.4126 13.0134 14.2654 13.0312 14.1225 13.0654C13.9796 13.0997 13.8427 13.15 13.716 13.2147C13.5893 13.2795 13.4743 13.3579 13.3749 13.4473C13.2755 13.5368 13.1929 13.6362 13.1301 13.7422C13.0673 13.8482 13.0251 13.9595 13.0048 14.0741C12.9846 14.1886 12.9865 14.3048 13.01 14.42C13.0094 14.4924 13.0192 14.5645 13.0391 14.6338C13.059 14.703 13.0887 14.7686 13.1272 14.8282C13.1657 14.8879 13.2124 14.9409 13.2655 14.9852C13.3186 15.0296 13.3775 15.0647 13.44 15.09C13.6 15.16 13.89 15.26 14.37 15.45C14.8309 15.6264 15.2785 15.8437 15.71 16.1C16.0992 16.3194 16.4584 16.5871 16.78 16.897C17.0256 17.1389 17.2025 17.4358 17.2957 17.7601C17.3889 18.0843 17.3956 18.4262 17.3152 18.7537C17.2348 19.0812 17.0697 19.3838 16.834 19.6346C16.5983 19.8854 16.2989 20.0771 15.9625 20.1933C15.6261 20.3095 15.2633 20.3468 14.91 20.3017C14.5567 20.2567 14.2232 20.1307 13.94 19.936C13.6159 19.7136 13.3358 19.4311 13.1158 19.1035C12.8958 18.7759 12.7399 18.4093 12.66 18.0239C12.5801 17.6385 12.5778 17.2417 12.6532 16.8553C12.7286 16.4689 12.8803 16.1003 13.0966 15.7699C13.313 15.4396 13.5901 15.1534 13.9118 14.9267C14.2336 14.7001 14.5941 14.5374 14.9751 14.4478C15.3561 14.3582 15.7504 14.3434 16.1371 14.4043C16.5237 14.4652 16.8952 14.6007 17.23 14.8039C17.5648 15.0072 17.8573 15.2742 18.09 15.59C18.1753 15.7139 18.2191 15.8592 18.2161 16.0071C18.2131 16.155 18.1635 16.2984 18.0736 16.4184C17.9837 16.5384 17.8576 16.6296 17.7125 16.6804C17.5674 16.7312 17.4099 16.7393 17.26 16.704L15.41 13.22Z" fill="currentColor"/>
                            </svg>
                          </a>
                        </li>
                      </ul>
                    </button>
                  </div>
                ) : (
                  <p className="text-[#BE3D2A] text-center">You have not registered yet. Please register on the main page.</p>
                )}
              </div>

              {/* Card 2: Level & Progress */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-[#F5C45E] mb-4">Level & Progress</h2>
                <div className="space-y-3">
                  {/* Current Level Display with Icon */}
                  {userInfo?.level !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-[#102E50]/50 rounded-lg border border-[#F5C45E]/20 mb-4">
                      <span className="text-3xl">
                        {getLevelInfo(userInfo.level)?.icon || "📊"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-[#4DA8DA]">Current Rank</p>
                        <p className="text-lg font-bold text-[#F5C45E]">
                          {getLevelName(userInfo.level)}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{getLevelDisclaimer()}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Current Level:</span>
                    <span className="font-semibold text-[#F5C45E]">
                      {userInfo?.level !== undefined ? userInfo.level : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 relative" ref={levelDropdownRef}>
  <span className="mb-1">Select Target Level:</span>
  <button
    type="button"
    className="bg-[#102E50] text-[#F5C45E] p-2 rounded border border-[#4DA8DA]/30 w-full flex justify-between items-center"
    onClick={() => setIsLevelDropdownOpen((prev) => !prev)}
    disabled={userInfo?.level === undefined || userInfo.level >= 12}
    style={{ minHeight: 40 }}
  >
    {selectedUpgradeLevel && selectedUpgradeLevel > 0
      ? `Level ${selectedUpgradeLevel} - ${getLevelName(selectedUpgradeLevel)}`
      : 'Select Level'}
    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {isLevelDropdownOpen && (
    <div className="absolute left-0 right-0 mt-1 bg-[#102E50] border border-[#4DA8DA]/30 rounded shadow-lg z-50 max-h-60 overflow-auto">
      {Array.from({ length: 12 - (userInfo?.level || 0) }).map((_, index) => {
        const levelOption = (userInfo?.level || 0) + index + 1;
        const isNextLevelOnly = levelOption === (userInfo?.level || 0) + 1; // Only next level is enabled
        
        if (levelOption > 12) return null;
        return (
          <div
            key={levelOption}
            className={`px-4 py-2 ${
              isNextLevelOnly 
                ? 'cursor-pointer hover:bg-[#4DA8DA] hover:text-[#102E50] text-[#F5C45E]' 
                : 'cursor-not-allowed opacity-40 text-gray-500'
            } ${selectedUpgradeLevel === levelOption ? 'bg-[#4DA8DA] text-[#102E50]' : ''}`}
            onClick={() => {
              if (isNextLevelOnly) {
                setSelectedUpgradeLevel(levelOption);
                setIsLevelDropdownOpen(false);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <span>{getLevelInfo(levelOption)?.icon}</span>
              <span>Level {levelOption} - {getLevelName(levelOption)}</span>
            </div>
            {!isNextLevelOnly && <span className="text-xs">(complete level {levelOption - 1} first)</span>}
          </div>
        );
      })}
      {Array.from({ length: 12 - (userInfo?.level || 0) }).length === 0 && (
        <div className="px-4 py-2 text-gray-400">No levels available</div>
      )}
    </div>
  )}
</div>
                  <div className="flex justify-between items-center">
                    <span>Total Upgrade Cost:</span>
                    <span className="font-semibold text-[#F5C45E]">
                      {userInfo?.level !== undefined && selectedUpgradeLevel > userInfo.level ?
                        `${ethers.formatEther(calculateCumulativeUpgradeCost(Number(userInfo.level), selectedUpgradeLevel))} opBNB`
                        : 'Select Level'}
                    </span>
                  </div>
                </div>
                {userId && userInfo?.level !== undefined && (
                  <div className="mt-4">
                    {userInfo.level < 12 ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading || selectedUpgradeLevel === 0 || selectedUpgradeLevel <= userInfo.level}
                        className="golden-button"
                      >
                        {isUpgrading ? 'Upgrading...' : `Upgrade to Level ${selectedUpgradeLevel}`}
                      </button>
                    ) : (
                      <p className="text-center text-green-400">You have reached the maximum level!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Card 3: MynnGift Status */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-[#F5C45E] mb-4">MynnGift Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>MynnGift Rank:</span>
                    <span className="font-semibold text-[#F5C45E]">
                      {nobleGiftRank !== undefined && nobleGiftRank !== null ? `Rank ${nobleGiftRank}` : 'Not Active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <span className={`font-semibold ${nobleGiftStatus && nobleGiftStatus !== 'Not Active' ? 'text-green-400' : 'text-gray-400'}`}>
                      {formatMynnGiftStatus(nobleGiftStatus)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Income:</span>
                    <span className="font-semibold text-[#F5C45E]">
                      {nobleGiftTotalIncome !== undefined ? `${ethers.formatEther(nobleGiftTotalIncome)} opBNB` : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: MynnGift Income Stream A & B */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-[#F5C45E] mb-4">📊 Income Streams</h2>
                <div className="space-y-4">
                  {/* Stream A: Level 4 */}
                  <div className="bg-[#0A1E2E] rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-400">Stream A (Level 4)</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">0.0081 opBNB entry</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Income:</span>
                      <span className="font-semibold text-white">
                        {mynnGiftIncomeStreamA !== undefined ? `${ethers.formatEther(mynnGiftIncomeStreamA)} opBNB` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Current Rank:</span>
                      <span className="font-semibold text-blue-300">
                        {mynnGiftRankStreamA !== undefined && mynnGiftRankStreamA !== null ? `Rank ${Number(mynnGiftRankStreamA)}` : 'Not Active'}
                      </span>
                    </div>
                    {/* Stream A breakdown */}
                    {mynnGiftIncomeBreakdownA && mynnGiftIncomeBreakdownA.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 space-y-1">
                        <div className="font-semibold text-blue-300">Per-Rank Income:</div>
                        <div className="grid grid-cols-4 gap-1">
                          {mynnGiftIncomeBreakdownA.map((income, idx) => {
                            const rank = idx + 1;
                            const incomeAmount = Number(income) / 1e18;
                            return incomeAmount > 0 ? (
                              <div key={rank} className="bg-blue-500/10 px-2 py-1 rounded text-center">
                                <div className="font-semibold text-blue-300">R{rank}</div>
                                <div className="text-blue-200">{incomeAmount.toFixed(4)}</div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stream B: Level 8 */}
                  <div className="bg-[#0A1E2E] rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-400">Stream B (Level 8)</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">0.0936 opBNB entry</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Income:</span>
                      <span className="font-semibold text-white">
                        {mynnGiftIncomeStreamB !== undefined ? `${ethers.formatEther(mynnGiftIncomeStreamB)} opBNB` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Current Rank:</span>
                      <span className="font-semibold text-purple-300">
                        {mynnGiftRankStreamB !== undefined && mynnGiftRankStreamB !== null ? `Rank ${Number(mynnGiftRankStreamB)}` : 'Not Active'}
                      </span>
                    </div>
                    {/* Stream B breakdown */}
                    {mynnGiftIncomeBreakdownB && mynnGiftIncomeBreakdownB.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 space-y-1">
                        <div className="font-semibold text-purple-300">Per-Rank Income:</div>
                        <div className="grid grid-cols-4 gap-1">
                          {mynnGiftIncomeBreakdownB.map((income, idx) => {
                            const rank = idx + 1;
                            const incomeAmount = Number(income) / 1e18;
                            return incomeAmount > 0 ? (
                              <div key={rank} className="bg-purple-500/10 px-2 py-1 rounded text-center">
                                <div className="font-semibold text-purple-300">R{rank}</div>
                                <div className="text-purple-200">{incomeAmount.toFixed(4)}</div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Combined Total */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-yellow-400">Combined MynnGift Income:</span>
                      <span className="text-2xl font-bold text-[#F5C45E]">
                        {mynnGiftIncomeStreamA !== undefined && mynnGiftIncomeStreamB !== undefined 
                          ? ethers.formatEther(BigInt(mynnGiftIncomeStreamA) + BigInt(mynnGiftIncomeStreamB))
                          : 'Loading...'}
                        {' opBNB'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Income Card with Luxury Effect */}
              <div className="luxury-card w-full max-w-full p-3 sm:p-6 rounded-xl">
                <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="luxury-title">Total Income</h3>
                <p className="luxury-amount">{calculateTotalIncome} opBNB</p>
                {/* Currency conversion */}
                <div className="currency-conversion-display">
                  {isPriceLoading ? (
                    <span>Loading harga...</span>
                  ) : priceError ? (
                    <span className="text-red-400">{priceError}</span>
                  ) : opbnbPriceUSD && totalIncomeNumber > 0 ? (
                    <>
                      <div className="currency-row">
                        <span className="currency-label">USD</span>
                        <span className="converted-amount">
                          ≈ {(totalIncomeNumber * opbnbPriceUSD).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-center">Estimated rate based on BNB price (CoinGecko)</div>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>

              {/* Total Deposit Card */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Total Deposit</h3>
                <p className="text-2xl font-bold text-white">
                  {calculateTotalDeposit} opBNB
                </p>
                <p className="text-sm text-gray-400 mt-2">Total registration fee & level upgrade costs</p>
                <p className="text-xs text-gray-500 mt-1">Registration fee: 0.0044 opBNB</p>
              </div>

              {/* Claimable Royalty Card with golden-button */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Claimable Royalty Balance</h3>
                <p className="text-2xl font-bold text-white">
                  {royaltyIncome ? ethers.formatEther(royaltyIncome) : '0'} opBNB
                </p>
                  <button
                    onClick={handleClaimRoyalty}
                  disabled={!royaltyIncome || BigInt(royaltyIncome || 0n) === 0n || isClaiming || isConfirmingClaimRoyalty || (userInfo?.level !== 8 && userInfo?.level !== 12) || (userInfo?.directTeam || 0) < 2}
                  className="golden-button mt-2"
                  title={((userInfo?.level !== 8 && userInfo?.level !== 12) ? 'Claim royalty only available at level 8 and 12' : ((userInfo?.directTeam || 0) < 2 ? 'Need minimum 2 direct team members to be eligible for royalty' : 'Claim your royalty income'))}
                  >
                    {isClaiming ? 'Claiming...' : isConfirmingClaimRoyalty ? 'Confirming...' : 'Claim Royalty'}
                  </button>
                <p className="text-xs text-yellow-400 mt-2">Claim royalty can only be done at level 8 and 12 according to smart contract terms.</p>
              </div>

              {/* Royalty Pool Card (global) */}
              <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Royalty Pool Balance</h3>
                <p className="text-2xl font-bold text-white">
                  {royaltyPool ? ethers.formatEther(royaltyPool) : '0'} opBNB
                </p>
                <p className="text-sm text-gray-400 mt-2">Total royalty pool balance not yet distributed</p>
              </div>
            </div>

            {/* Bottom Row: Income Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderIncomeBreakdown()}
              <IncomeHistoryTable />
            </div>

            {/* Remove Recent Upgrades and Team Stats sections */}
          </div>
        );
      case 'timsaya':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#F5C45E]">Matrix Team</h2>
              <div className="text-sm text-gray-400">
                Your ID: <span className="text-[#F5C45E]">{userId}</span>
              </div>
            </div>
            <MemoizedTeamMatrix userId={userId} mynncryptConfig={mynncryptConfig} />
          </div>
        );
      case 'treeview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#F5C45E]">Team Structure</h2>
              <div className="text-sm text-gray-400">
                Your ID: <span className="text-[#F5C45E]">{userId}</span>
              </div>
            </div>
            <div className="bg-[#1A3A6A] w-full max-w-full p-3 sm:p-6 rounded-lg shadow-lg">
              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  Visualization of your team structure in tree form. Usage guide:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                  <li>Click "See Tree" button to view member team structure</li>
                  <li>Click "Back to Root" to return to your team structure</li>
                  <li>Node color shows member level</li>
                  <li>Node with orange glow is your current position</li>
                </ul>
              </div>
              {userId ? (
                <MemoizedTeamTree userId={userId} mynncryptConfig={mynncryptConfig} />
              ) : (
                <p className="text-gray-400">Please connect your wallet to view the team tree.</p>
              )}
            </div>
          </div>
        );
      case 'noblegift':
        // Use new MynnGiftTabs component with hybrid approach
        return (
          <MemoizedMynnGiftTabs
            mynngiftConfig={mynngiftConfig}
            mynncryptConfig={mynncryptConfig}
          />
        );
      default:
        return null;
    }
  };

  // Update debug logging for both upline and referrer data
  useEffect(() => {
    console.log('User Info Debug:', {
      userInfo,
      upline: userInfo?.upline?.toString(),
      referrer: userInfo?.referrer?.toString(),
      defaultReferralId,
      isLoading: userInfoLoading
    });
  }, [userInfo, defaultReferralId, userInfoLoading]);

  // Add style tag for sidebar
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = sidebarStyles;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  // Add state for opBNB price (USD only)
  const [opbnbPriceUSD, setOpbnbPriceUSD] = useState(null);
  const [opbnbPriceIDR, setOpbnbPriceIDR] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(null);

  // Fetch opBNB price from CoinGecko (USD only)
  useEffect(() => {
    const fetchPrice = async () => {
      setIsPriceLoading(true);
      setPriceError(null);
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        setOpbnbPriceUSD(res.data['binancecoin']?.usd || null);
        setOpbnbPriceIDR(null);
        console.log('Fetched BNB price:', res.data['binancecoin']);
      } catch (e) {
        setOpbnbPriceUSD(null);
        setOpbnbPriceIDR(null);
        setPriceError('Failed to load BNB rate.');
        console.error('Error fetching BNB price:', e);
      } finally {
        setIsPriceLoading(false);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 180000); // update every 3 minutes
    return () => clearInterval(interval);
  }, []);

  // Fetch total users from mynncryptConfig
  const { data: totalUsersCount } = useReadContract({
    ...mynncryptConfig,
    functionName: 'totalUsers',
    enabled: true,
  });

  // Panggil custom hook NobleGift Notifications
  // const {
  //   unreadNobleGiftNotifications,
  //   setShowNobleGiftNotificationsModal,
  //   markAllNobleGiftNotificationsAsRead,
  //   NobleGiftNotificationsModal,
  // } = useNobleGiftNotifications(nobleGiftTotalIncome, nobleGiftRank, getNobleGiftRankName);

  if (userIdError) {
    return (
      <div className="min-h-screen bg-[#102E50] text-[#F5C45E] p-6">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>Failed to load dashboard: {userIdError.message}</p>
      </div>
    );
  }

  if (userIdLoading || userInfoLoading) {
    return (
      <div className="min-h-screen bg-[#102E50] text-[#F5C45E] p-6">
        <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
        <p>Please wait while we fetch your data.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#102E50] text-[#F5C45E] relative">
        {/* Remove the background overlay for the dashboard since we want to keep the original background */}
        {/* The dashboard has its own background styling, so we don't add the overlay here */}
        {/* Header Dashboard */}
        <header className="bg-[#102E50] border-b border-[#F5C45E]/30 p-4">
          <div className="container mx-auto flex items-center flex-wrap"> {/* Changed justify-between to flex-wrap */}
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 flex-grow min-w-0"> {/* Added flex-grow and min-w-0 */}
              <div className="relative flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5C45E]/20 via-[#E78B48]/20 to-[#F5C45E]/20 blur-lg rounded-full"></div>
                <img 
                  src={logo} 
                  alt="Platform Logo" 
                  className="h-14 sm:h-20 relative z-10 transform hover:scale-105 transition-transform duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(245, 196, 94, 0.3))'
                  }}
                />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-[#F5C45E]">MynncryptCommunity</h1>
            </div>

            {/* Right side items: Connection Status & Hamburger Button */}
            <div className="flex items-center space-x-4 ml-auto"> {/* Keep ml-auto to push to right when possible */}
              {/* Notifikasi NobleGift - TAMBAHKAN INI */}
              {/* <button
                onClick={() => {
                  setShowNobleGiftNotificationsModal(true);
                  markAllNobleGiftNotificationsAsRead(); // Mark as read when opened
                }}
                className="relative p-2 rounded-full text-[#4DA8DA] hover:bg-[#4DA8DA]/10 focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/50"
              >
                <EnvelopeIcon className="w-6 h-6" />
                {unreadNobleGiftNotifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {unreadNobleGiftNotifications}
                  </span>
                )}
              </button> */}
              {/* Akhir Notifikasi NobleGift */}

              {/* Connected Wallet Status and Hamburger Button Container */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {isConnected && (
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-2 bg-[#1A3A6A] px-4 py-2 rounded-full border border-[#4DA8DA]/30 shadow-lg relative overflow-hidden group sm:max-w-none min-w-0"> {/* Added min-w-0 for better content shrinking */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4DA8DA]/10 via-[#F5C45E]/5 to-[#4DA8DA]/10 animate-pulse"></div>
                      <div className="relative z-10 flex items-center space-x-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                        <span className="text-[#4DA8DA] text-xs sm:text-sm font-medium">Connected:</span>
                        <span className="text-[#F5C45E] font-mono tracking-wider text-xs sm:text-sm truncate">
                          {`${address?.slice(0, 8)}......${address?.slice(-4)}`}
                        </span>
                      </div>
                      <div className="absolute inset-0 border border-[#4DA8DA]/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                )}
                {/* Hamburger Button (now on the right) */}
                <button
                  className={`hamburger-btn flex-shrink-0 ${isSidebarOpen ? 'open' : ''}`}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  title={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
                  type="button"
                >
                  <span className="icon-bar" aria-hidden="true"></span>
                  <span className="icon-bar" aria-hidden="true"></span>
                  <span className="icon-bar" aria-hidden="true"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex">
          {/* Sidebar Overlay for Small Screens */}
          <div 
            className={`overlay ${isSidebarOpen ? 'active' : ''} md:hidden`} 
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            role="presentation"
            aria-hidden={!isSidebarOpen}
          ></div>

          {/* Sidebar */}
          <aside
            className={`fixed top-[70px] sm:top-[96px] h-[calc(100vh-70px)] sm:h-[calc(100vh-96px)] bg-[#102E50]/95 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out w-64
              ${isSidebarOpen ? 'left-0' : '-left-full md:left-0 md:w-16'}`}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex flex-col h-full p-4">
              {/* Navigation Items */}
              <nav className="space-y-4 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection('dashboard');
                    setTimeout(() => setIsSidebarOpen(false), 100);
                  }}
                  className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg ${activeSection === 'dashboard' ? 'bg-[#4DA8DA]/20 text-[#F5C45E]' : 'text-[#4DA8DA] hover:bg-[#4DA8DA]/10'}`}
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>Dashboard</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection('timsaya');
                    setTimeout(() => setIsSidebarOpen(false), 100);
                  }}
                  className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg ${activeSection === 'timsaya' ? 'bg-[#4DA8DA]/20 text-[#F5C45E]' : 'text-[#4DA8DA] hover:bg-[#4DA8DA]/10'}`}
                >
                  <UsersIcon className="w-6 h-6" />
                  <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>My Team</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection('treeview');
                    setTimeout(() => setIsSidebarOpen(false), 100);
                  }}
                  className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg ${activeSection === 'treeview' ? 'bg-[#4DA8DA]/20 text-[#F5C45E]' : 'text-[#4DA8DA] hover:bg-[#4DA8DA]/10'}`}
                >
                  <ShareIcon className="w-6 h-6" />
                  <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>Tree View</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection('noblegift');
                    setTimeout(() => setIsSidebarOpen(false), 100);
                  }}
                  className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg ${activeSection === 'noblegift' ? 'bg-[#4DA8DA]/20 text-[#F5C45E]' : 'text-[#4DA8DA] hover:bg-[#4DA8DA]/10'}`}
                >
                  <GiftIcon className="w-6 h-6" />
                  <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>MynnGift</span>
                </button>
              </nav>

              {/* Total Pengguna Card - Moved to Sidebar */}
              {totalUsersCount !== undefined && totalUsersCount !== null && isSidebarOpen && (
                <>
                  {/* Ebook Menu Item - DISABLED FOR FUTURE USE */}
                  {/* 
                  <button
                    className={`sidebar-item flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === 'ebooks' ? 'active bg-gradient-to-r from-[#DDA853] to-[#E5C893] text-[#183B4E]' : 'hover:bg-[#4DA8DA]/10'
                    }`}
                    onClick={() => { setActiveSection('ebooks'); setIsSidebarOpen(false); }}
                  >
                    <FaBookOpen className="w-6 h-6" />
                    <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>Ebook</span>
                  </button>
                  */}

                  <div className="bg-[#1A3A6A] p-3 sm:p-6 rounded-lg shadow-lg flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="h-8 w-8 text-[#F5C45E]" />
                      <div>
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-[#F5C45E]">{totalUsersCount.toString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={() => { handleLogout(); setIsSidebarOpen(false); } } // Close sidebar on logout
                className="sidebar-item mt-auto flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
                <span className={`${isSidebarOpen ? 'ml-3' : 'hidden'}`}>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content with adjusted margin */}
          <main className="flex-1 p-2 sm:p-4 lg:p-6 transition-all duration-300 md:ml-16">
            <div className="max-w-screen-xl mx-auto w-full">
              {renderMainContent()}
            </div>
          </main>
        </div>

        {showShareModal && (
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              className="modal-wrapper w-full max-w-md mx-auto bg-[#183B4E] text-[#F3F3E0] rounded-xl p-4 sm:p-8 relative text-center"
            >
              <button
                className="modal-close"
                onClick={() => setShowShareModal(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
              <h3 className="modal-title" style={{ fontSize: '24px', marginBottom: '20px' }}>
                Share Your Referral Link
              </h3>
              <input
                type="text"
                value={(() => {
                  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? `http://${window.location.hostname}:${window.location.port}`
                    : 'https://project-mc-tan.vercel.app';
                  return `${baseUrl}/register?ref=${userId}`;
                })()}
                readOnly
                style={{
                  width: '100%',
                  height: '45px',
                  background: '#fff',
                  border: 'none',
                  outline: 'none',
                  borderRadius: '40px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                  padding: '0 15px',
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '15px',
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  background: '#DDA853',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '10px 20px',
                  color: '#183B4E',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => (e.target.style.background = '#FFC107')}
                onMouseOut={(e) => (e.target.style.background = '#DDA853')}
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Render NobleGift Notifications Modal */}
        {/* <NobleGiftNotificationsModal /> */}

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Dashboard, (prevProps, nextProps) => {
  // Return true if props are equal (don't re-render)
  return (
    prevProps.mynncryptConfig === nextProps.mynncryptConfig &&
    prevProps.mynngiftConfig === nextProps.mynngiftConfig &&
    prevProps.platformWalletConfig === nextProps.platformWalletConfig
  );
});