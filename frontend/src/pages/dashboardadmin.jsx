import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi'; // Import useAccount
import logo from '../assets/logo.png';
import { UsersIcon, ChartBarIcon, GiftIcon, Cog6ToothIcon, ClipboardDocumentListIcon, ArrowRightOnRectangleIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import axios from 'axios';
import { getRoleByWallet, getAllAuthorizedWallets } from '../config/adminWallets';
import logo_platform from '../assets/logo_platform.png';

// Use logo_platform instead of logo
const logoToUse = logo_platform || logo;

function renderWithKurs(amount, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) {
  const val = parseFloat(amount);
  if (isNaN(val)) return '0.0000 opBNB';

  return (
    <div>
      <span className="text-[#E78B48] font-bold">{val.toFixed(4)} opBNB</span>
      {opbnbPriceUSD && opbnbPriceIDR ? (
        <div className="text-xs text-[#F5C45E] mt-1">
          USD: ${(val * opbnbPriceUSD).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })} / IDR: {(val * opbnbPriceIDR).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      ) : isPriceLoading ? (
        <div className="text-xs text-gray-400 mt-1">Memuat kurs...</div>
      ) : priceError ? (
        <div className="text-xs text-red-400 mt-1">{priceError}</div>
      ) : null}
    </div>
  );
}

const SIDEBAR_MENU = [
  { key: 'overview', label: 'Ringkasan', icon: ChartBarIcon },
  { key: 'user-management', label: 'Manajemen Pengguna', icon: UsersIcon },
  { key: 'finance', label: 'Keuangan & Pendapatan', icon: GiftIcon },
  { key: 'settings', label: 'Pengaturan Kontrak', icon: Cog6ToothIcon },
  { key: 'activity-logs', label: 'Aktivitas & Log', icon: ClipboardDocumentListIcon },
];

const DashboardAdmin = ({ mynncryptConfig, mynngiftConfig, publicClient }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar toggle
  const { address } = useAccount(); // Get connected account address
  const [opbnbPriceUSD, setOpbnbPriceUSD] = useState(null);
  const [opbnbPriceIDR, setOpbnbPriceIDR] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(null);

  // Read data from MynnCrypt contract for total platform income calculation
  const { data: platformIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getPlatformIncome',
  });

  const { data: mynngiftPlatformIncome } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getPlatformIncome',
  });

  // Calculate total platform income
  const totalPlatformIncome = (
    (platformIncome !== undefined ? platformIncome : 0n) +
    (mynngiftPlatformIncome !== undefined ? mynngiftPlatformIncome : 0n)
  );

  useEffect(() => {
    const fetchPrice = async () => {
      setIsPriceLoading(true);
      setPriceError(null);
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,idr');
        setOpbnbPriceUSD(res.data['binancecoin']?.usd || null);
        setOpbnbPriceIDR(res.data['binancecoin']?.idr || null);
      } catch {
        setOpbnbPriceUSD(null);
        setOpbnbPriceIDR(null);
        setPriceError('Gagal memuat kurs BNB.');
      } finally {
        setIsPriceLoading(false);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 180000); // update every 3 minutes
    return () => clearInterval(interval);
  }, []);

  // Placeholder for logout function
  const handleLogout = () => {
    // Implementasi logout sebenarnya akan ditambahkan di sini
    console.log('User logged out');
    // Misalnya, redirect ke halaman login atau home
    // navigate('/');
  };

  // Check if wallet is connected
  if (!address) {
    return (
      <div className="flex h-screen bg-sfc-dark-blue text-sfc-cream items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Wallet Tidak Terkoneksi</h2>
          <p className="mb-4">Silakan hubungkan wallet Anda untuk mengakses dashboard admin.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] shadow-lg hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all duration-200 border-2 border-[#243DB6]"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Read the owner address from MynnGift contract (for reference, not blocking)
  const { isLoading: isOwnerLoading } = useReadContract({
    ...mynngiftConfig,
    functionName: 'owner',
  });

  // Tentukan role berdasarkan address wallet (dari config)
  const role = getRoleByWallet(address);
  const isAllowed = role === "owner" || role === "investor";

  // Debug logging
  useEffect(() => {
    console.log('DashboardAdmin - Connected Address:', address);
    console.log('DashboardAdmin - Detected Role:', role);
    console.log('DashboardAdmin - Is Allowed:', isAllowed);
  }, [address, role, isAllowed]);

  // Show loading while reading contract owner
  if (isOwnerLoading) {
    return (
      <div className="flex h-screen bg-sfc-dark-blue text-sfc-cream items-center justify-center">
        <p>Memuat informasi kontrak...</p>
      </div>
    );
  }

  // Check access berdasarkan config wallet, bukan kontrak
  if (!isAllowed) {
    return (
      <div className="flex h-screen bg-sfc-dark-blue text-sfc-cream items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4 text-red-500">❌ Akses Ditolak</h2>
          <div className="mb-6 space-y-2 text-sm">
            <p className="text-[#4DA8DA]">Wallet Anda: <span className="text-[#F5C45E] break-all">{address}</span></p>
            <p className="text-[#4DA8DA]">Role yang terdeteksi: <span className="text-[#F5C45E] uppercase font-bold">{role}</span></p>
          </div>
          <p className="mb-6 text-[#E78B48]">Wallet ini tidak terdaftar sebagai admin atau investor.</p>
          <div className="space-y-2">
            <a href="/admin-debug" className="block px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] shadow-lg hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all duration-200 border-2 border-[#243DB6]">
              Debug Console
            </a>
            <a href="/" className="block px-6 py-2 rounded-lg font-semibold bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition-all duration-200 border-2 border-gray-600">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Komponen breakdown pendapatan sesuai role
  function IncomeBreakdown({
    totalPlatformIncome,
    platformIncome,
    mynngiftPlatformIncome,
    opbnbPriceUSD,
    opbnbPriceIDR,
    isPriceLoading,
    priceError
  }) {
    const isInvestor = role === "investor";
    const multiplier = isInvestor ? 0.1 : 1;

    // Konversi dari BigInt ke opBNB (ether), lalu baru dikalikan multiplier
    const totalOpbnb = Number(formatEther(totalPlatformIncome)) * multiplier;
    const mynncryptOpbnb = Number(formatEther(platformIncome)) * multiplier;
    const mynngiftOpbnb = Number(formatEther(mynngiftPlatformIncome)) * multiplier;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="luxury-card md:col-span-2">
          <h2 className="luxury-title mb-2">Total Pendapatan</h2>
          {renderWithKurs(totalOpbnb, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError)}
        </div>
        <div className="luxury-card">
          <h2 className="luxury-title mb-2">Pendapatan Platform Mynncrypt</h2>
          {renderWithKurs(mynncryptOpbnb, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError)}
        </div>
        <div className="luxury-card">
          <h2 className="luxury-title mb-2">Pendapatan Mynngift</h2>
          {renderWithKurs(mynngiftOpbnb, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError)}
        </div>
        {isInvestor && (
          <div className="col-span-1 md:col-span-3 text-xs text-[#F5C45E] mt-2 text-center">
            * Anda hanya melihat 10% dari total pendapatan.
          </div>
        )}
      </div>
    );
  }

  const renderSection = () => {
    if (role === "investor") {
      // Untuk investor, hanya tampilkan breakdown pendapatan 10% dengan desain yang sama
      return (
        <IncomeBreakdown
          totalPlatformIncome={totalPlatformIncome}
          platformIncome={platformIncome}
          mynngiftPlatformIncome={mynngiftPlatformIncome}
          opbnbPriceUSD={opbnbPriceUSD}
          opbnbPriceIDR={opbnbPriceIDR}
          isPriceLoading={isPriceLoading}
          priceError={priceError}
        />
      );
    }
    // Untuk owner, tampilkan OverviewSection seperti biasa
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            mynncryptConfig={mynncryptConfig}
            mynngiftConfig={mynngiftConfig}
            publicClient={publicClient}
            opbnbPriceUSD={opbnbPriceUSD}
            opbnbPriceIDR={opbnbPriceIDR}
            isPriceLoading={isPriceLoading}
            priceError={priceError}
            totalPlatformIncome={totalPlatformIncome}
          />
        );
      case 'user-management':
        return (
          <UserManagementSection
            mynncryptConfig={mynncryptConfig}
            mynngiftConfig={mynngiftConfig}
            publicClient={publicClient}
          />
        );
      case 'finance':
        return (
          <FinanceSection
            mynncryptConfig={mynncryptConfig}
            mynngiftConfig={mynngiftConfig}
            publicClient={publicClient}
            opbnbPriceUSD={opbnbPriceUSD}
            opbnbPriceIDR={opbnbPriceIDR}
            isPriceLoading={isPriceLoading}
            priceError={priceError}
            totalPlatformIncome={totalPlatformIncome}
          />
        );
      case 'settings':
        return (
          <ContractSettingsSection
            mynncryptConfig={mynncryptConfig}
            mynngiftConfig={mynngiftConfig}
            publicClient={publicClient}
          />
        );
      case 'activity-logs':
        return (
          <ActivityLogsSection
            mynncryptConfig={mynncryptConfig}
            publicClient={publicClient}
          />
        );
      default:
        return null;
    }
  };

  // SIDEBAR STYLE (copy dari dashboard.jsx)
  const sidebarClass = `sidebar fixed top-0 left-0 h-screen bg-[#102E50]/90 z-50 border-r border-[#F5C45E]/30 shadow-2xl flex flex-col p-6`;
  const sidebarItemClass = (key) => `sidebar-item w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-semibold tracking-wide border border-transparent mb-2 ${activeSection === key ? 'bg-[#243DB6]/20 text-[#F5C45E] border-[#243DB6]' : 'text-[#F5C45E] hover:bg-[#243DB6]/10'}`;

  // HEADBAR STYLE (copy dari dashboard user)
  const headbarClass = 'bg-[#102E50] border-b border-[#F5C45E]/30 p-4 flex justify-between items-center relative';

  const filteredMenu = role === "owner" ? SIDEBAR_MENU : SIDEBAR_MENU.filter(menu => menu.key === 'overview');

  return (
    <div className="min-h-screen bg-[#102E50] text-[#F5C45E] font-futuristic">
      {/* Headbar */}
      <header className={headbarClass}>
        {/* Hamburger button for mobile */}
        <button
          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-lg text-[#4DA8DA] hover:text-[#F5C45E] focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/50"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Bars3Icon className="w-7 h-7" />
        </button>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5C45E]/20 via-[#E78B48]/20 to-[#F5C45E]/20 blur-lg rounded-full"></div>
            <img src={logoToUse} alt="Platform Logo" className="h-12 relative z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(245, 196, 94, 0.3))' }} />
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#243DB6]/20 px-4 py-2 rounded-full border border-[#243DB6]/30 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[#F5C45E] text-sm font-medium">Connected:</span>
            <span className="text-[#F5C45E] font-mono tracking-wider text-sm">
              {role === "owner" ? "Owner" : role.startsWith("investor") ? "Investor" : ""}
            </span>
          </div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row relative">
  {/* Overlay for mobile sidebar */}
  {isSidebarOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
      onClick={() => setIsSidebarOpen(false)}
    />
  )}
  {/* Sidebar */}
  <aside
    className={`
      ${sidebarClass}
      h-screen
      fixed md:static
      top-0 left-0
      z-50
      p-4 md:p-6
      w-64
      transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
      md:w-64
      overflow-y-auto
      md:block
      shadow-2xl
    `}
    style={
      typeof window !== 'undefined' && window.innerWidth < 768
        ? { pointerEvents: isSidebarOpen ? 'auto' : 'none' }
        : { pointerEvents: 'auto' }
    }
  >
    {/* Toggle Button for Sidebar - always visible on mobile */}
    <button
      className="absolute top-4 right-4 p-2 rounded-lg text-[#4DA8DA] hover:text-[#F5C45E] focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/50 z-50 md:hidden"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {isSidebarOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <Bars3Icon className="w-6 h-6" />
      )}
    </button>

    <nav className="space-y-2 flex-1 mt-16 md:mt-8">
      {filteredMenu.map((item) => (
        <button
          key={item.key}
          onClick={() => { setActiveSection(item.key); setIsSidebarOpen(false); }}
          className={sidebarItemClass(item.key)}
        >
          <item.icon className="w-5 h-5 mr-3" />
          {item.label}
        </button>
      ))}
    </nav>

    {/* Logout Button */}
    <button
      onClick={handleLogout}
      className="sidebar-item mt-auto flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10"
    >
      <ArrowRightOnRectangleIcon className="w-6 h-6" />
      <span className={isSidebarOpen ? 'ml-3' : 'hidden md:inline'}>Logout</span>
    </button>
  </aside>
  {/* Main Content */}
  <main className={`flex-1 p-4 md:p-8 md:ml-64 w-full min-w-0 transition-all duration-300`}>
    {renderSection()}
  </main>
</div>
      <style>{`
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
          pointer-events: none;
        }
        @keyframes rotateGradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .luxury-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(245, 196, 94, 0.2), 0 0 15px rgba(245, 196, 94, 0.1);
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
        .luxury-icon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 2.5rem;
          height: 2.5rem;
          opacity: 0.8;
          color: #F5C45E;
        }
        @media (max-width: 768px) {
          .luxury-card {
            padding: 1rem !important;
          }
          .luxury-title {
            font-size: 1rem !important;
          }
          .luxury-amount {
            font-size: 1.5rem !important;
          }
          .luxury-icon {
            width: 2rem !important;
            height: 2rem !important;
            top: 0.5rem !important;
            right: 0.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .luxury-card {
            padding: 0.5rem !important;
          }
          .luxury-title {
            font-size: 0.9rem !important;
          }
          .luxury-amount {
            font-size: 1.1rem !important;
          }
          .luxury-icon {
            width: 1.5rem !important;
            height: 1.5rem !important;
            top: 0.25rem !important;
            right: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

const OverviewSection = ({ mynncryptConfig, mynngiftConfig, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError, totalPlatformIncome }) => {
  // Fetch data from MynnCrypt contract
  const { data: totalUsers } = useReadContract({
    ...mynncryptConfig,
    functionName: 'totalUsers',
  });

  const { data: platformIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getPlatformIncome',
  });

  const { data: mynncryptContractBalance } = useReadContract({
    ...mynncryptConfig,
    functionName: 'checkContractBalance',
  });

  // Fetch data from MynnGift contract
  const { data: mynngiftShareFeeBalance } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getShareFeeBalance',
  });

  const { data: mynngiftGasSubsidyPoolBalance } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getGasSubsidyPoolBalance',
  });

  const { data: totalMynnGiftReceivers } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getTotalReceivers',
  });

  const { data: mynngiftPlatformIncome } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getPlatformIncome',
  });

  // Tambahkan state untuk event
  const [sharefeeEvents, setSharefeeEvents] = useState([]);
  const [mynngiftEvents, setMynngiftEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(mynncryptConfig.address, mynncryptConfig.abi, provider);
        // SharefeeDistribution(userId, sharefee, amount)
        const sharefeeLogs = await contract.queryFilter(contract.filters.SharefeeDistribution(), -1000);
        setSharefeeEvents(sharefeeLogs.slice(-5).reverse());
        // MynngiftDistribution(userId, receiver, amount)
        const mynngiftLogs = await contract.queryFilter(contract.filters.MynngiftDistribution(), -1000);
        setMynngiftEvents(mynngiftLogs.slice(-5).reverse());
      } catch {
        setSharefeeEvents([]);
        setMynngiftEvents([]);
      }
    };
    fetchEvents();
  }, [mynncryptConfig]);

  return (
    <div>
      <h2 className="luxury-title mb-8 text-[#F5C45E] font-futuristic tracking-widest drop-shadow-lg text-3xl">Ringkasan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Total Pendapatan Platform</div>
          <div className="luxury-amount">{totalPlatformIncome !== undefined ? renderWithKurs(formatEther(totalPlatformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Total Pengguna</div>
          <div className="luxury-amount">{totalUsers !== undefined ? totalUsers.toString() : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Pendapatan Platform (Mynncrypt)</div>
          <div className="luxury-amount">{platformIncome !== undefined ? renderWithKurs(formatEther(platformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12L12 22L4 12L12 2L20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Saldo Kontrak Mynncrypt</div>
          <div className="luxury-amount">{mynncryptContractBalance !== undefined ? renderWithKurs(formatEther(mynncryptContractBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Saldo Share Fee (MynnGift)</div>
          <div className="luxury-amount">{mynngiftShareFeeBalance !== undefined ? renderWithKurs(formatEther(mynngiftShareFeeBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12L12 22L4 12L12 2L20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Saldo Gas Subsidy Pool (MynnGift)</div>
          <div className="luxury-amount">{mynngiftGasSubsidyPoolBalance !== undefined ? renderWithKurs(formatEther(mynngiftGasSubsidyPoolBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Total Penerima MynnGift</div>
          <div className="luxury-amount">{totalMynnGiftReceivers !== undefined ? totalMynnGiftReceivers.toString() : 'Loading...'}</div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Pendapatan Platform (MynnGift)</div>
          <div className="luxury-amount">{mynngiftPlatformIncome !== undefined ? renderWithKurs(formatEther(mynngiftPlatformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Riwayat SharefeeDistribution</div>
          <div style={{maxHeight: 180, overflowY: 'auto'}}>
            {sharefeeEvents.length === 0 ? (
              <div className="text-[#F5C45E]">Belum ada event</div>
            ) : (
              sharefeeEvents.map((e, i) => (
                <div key={i} className="text-xs mb-2">
                  <span className="text-[#F5C45E] font-mono">{e.args.userId}</span> -
                  <span className="text-[#E78B48] font-mono ml-1">{ethers.formatEther(e.args.amount)} opBNB</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="luxury-card">
          <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="luxury-title">Riwayat MynngiftDistribution</div>
          <div style={{maxHeight: 180, overflowY: 'auto'}}>
            {mynngiftEvents.length === 0 ? (
              <div className="text-[#F5C45E]">Belum ada event</div>
            ) : (
              mynngiftEvents.map((e, i) => (
                <div key={i} className="text-xs mb-2">
                  <span className="text-[#F5C45E] font-mono">{e.args.userId}</span> -
                  <span className="text-[#E78B48] font-mono ml-1">{ethers.formatEther(e.args.amount)} opBNB</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementSection = ({ mynncryptConfig }) => {
  const [userId, setUserId] = useState('');
  const [searchId, setSearchId] = useState('');

  const { data: userInfoData, isLoading, isError, error } = useReadContract({
    ...mynncryptConfig,
    functionName: 'userInfo',
    args: [searchId],
    query: { enabled: !!searchId },
  });

  // Destructure the returned tuple from userInfo function
  // Order matches ABI: totalIncome, totalDeposit, royaltyIncome, referralIncome, levelIncome, sponsorIncome, start, level, directTeam, totalMatrixTeam, layer, account, id, referrer, upline
  const userInfo = userInfoData ? {
    totalIncome: userInfoData[0],
    totalDeposit: userInfoData[1],
    royaltyIncome: userInfoData[2],
    referralIncome: userInfoData[3],
    levelIncome: userInfoData[4],
    sponsorIncome: userInfoData[5],
    start: userInfoData[6],
    level: userInfoData[7],
    directTeam: userInfoData[8],
    totalMatrixTeam: userInfoData[9],
    layer: userInfoData[10],
    account: userInfoData[11],
    id: userInfoData[12],
    referrer: userInfoData[13],
    upline: userInfoData[14],
  } : null;

  useEffect(() => {
    console.log('UserManagementSection Debug:', {
      userId,
      searchId,
      userInfoData,
      userInfo,
      isLoading,
      isError,
      error: error?.message,
      mynncryptConfig
    });
  }, [userId, searchId, userInfoData, userInfo, isLoading, isError, error, mynncryptConfig]);

  const handleSearch = () => {
    console.log('Search clicked with userId:', userId);
    setSearchId(userId);
  };

  const buttonClass = "px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] shadow-lg hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all duration-200 border-2 border-[#243DB6]";

  return (
    <div className="space-y-8">
      <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
        <h2 className="luxury-title mb-6 text-[#F5C45E]">Manajemen Pengguna</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Masukkan User ID (contoh: user123)"
            className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            className={buttonClass}
            onClick={handleSearch}
          >
            Cari Pengguna
          </button>
        </div>
        {isLoading && <p className="text-[#4DA8DA]">Mencari informasi pengguna...</p>}
        {isError && <p className="text-red-500">Error: Pengguna tidak ditemukan atau terjadi kesalahan. Pastikan User ID benar.</p>}
        {userInfo && userInfo.account !== '0x0000000000000000000000000000000000000000' && (
          <div className="luxury-card mt-6">
            <h3 className="luxury-title mb-4">Detail Pengguna: {userInfo.id}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><span className="text-[#4DA8DA] font-semibold">Alamat:</span> <span className="luxury-amount">{userInfo.account}</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Referrer:</span> <span className="luxury-amount">{userInfo.referrer}</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Upline:</span> <span className="luxury-amount">{userInfo.upline}</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Level:</span> <span className="luxury-amount">{userInfo.level.toString()}</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Direct Team:</span> <span className="luxury-amount">{userInfo.directTeam.toString()}</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Total Matrix Team:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.totalMatrixTeam)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Total Deposit:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.totalDeposit)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Total Income:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.totalIncome)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Royalty Income:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.royaltyIncome)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Referral Income:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.referralIncome)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Level Income:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.levelIncome)).toFixed(4)} opBNB</span></p>
              <p><span className="text-[#4DA8DA] font-semibold">Sponsor Income:</span> <span className="luxury-amount">{parseFloat(formatEther(userInfo.sponsorIncome)).toFixed(4)} opBNB</span></p>
            </div>
          </div>
        )}
        {userInfo && userInfo.account === '0x0000000000000000000000000000000000000000' && searchId && !isLoading && (
          <p className="text-yellow-500">Pengguna dengan ID '{searchId}' tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

const FinanceSection = ({ mynncryptConfig, mynngiftConfig, opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError, totalPlatformIncome }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawRecipient, setWithdrawRecipient] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  // Read data from MynnCrypt contract
  const { data: platformIncome } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getPlatformIncome',
  });

  const { data: royaltyPool } = useReadContract({
    ...mynncryptConfig,
    functionName: 'royaltyPool',
  });

  const { data: mynncryptContractBalance } = useReadContract({
    ...mynncryptConfig,
    functionName: 'checkContractBalance',
  });

  // Read data from MynnGift contract
  const { data: mynngiftShareFeeBalance } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getShareFeeBalance',
  });

  const { data: mynngiftGasSubsidyPoolBalance } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getGasSubsidyPoolBalance',
  });

  const { data: mynngiftPlatformIncome } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getPlatformIncome',
  });

  // Write functions for Findup
  const { writeContract: writeFindupWithdraw, data: hashFindupWithdraw, isPending: isPendingFindupWithdraw, isSuccess: isSuccessFindupWithdraw, isError: isErrorFindupWithdraw, error: errorFindupWithdraw } = useWriteContract();
  const { isLoading: isConfirmingFindupWithdraw } = useWaitForTransactionReceipt({
    hash: hashFindupWithdraw,
  });

  const handleFindupWithdraw = () => {
    if (withdrawRecipient && mynncryptContractBalance !== undefined) {
      writeFindupWithdraw({
        ...mynncryptConfig,
        functionName: 'withdrawRemainingFunds',
        args: [withdrawRecipient],
      });
    }
  };

  // Write functions for MynnGift
  const { writeContract: writeMynnGiftWithdrawShareFee, data: hashMynnGiftWithdrawShareFee, isPending: isPendingMynnGiftWithdrawShareFee, isSuccess: isSuccessMynnGiftWithdrawShareFee, isError: isErrorMynnGiftWithdrawShareFee, error: errorMynnGiftWithdrawShareFee } = useWriteContract();
  const { isLoading: isConfirmingMynnGiftWithdrawShareFee } = useWaitForTransactionReceipt({
    hash: hashMynnGiftWithdrawShareFee,
  });

  const handleMynnGiftWithdrawShareFee = () => {
    if (withdrawAmount) {
      writeMynnGiftWithdrawShareFee({
        ...mynngiftConfig,
        functionName: 'withdrawExcessShareFeeBalance',
        args: [parseEther(withdrawAmount)],
      });
    }
  };

  const { writeContract: writeMynnGiftTopUpShareFee, data: hashMynnGiftTopUpShareFee, isPending: isPendingMynnGiftTopUpShareFee, isSuccess: isSuccessMynnGiftTopUpShareFee, isError: isErrorMynnGiftTopUpShareFee, error: errorMynnGiftTopUpShareFee } = useWriteContract();
  const { isLoading: isConfirmingMynnGiftTopUpShareFee } = useWaitForTransactionReceipt({
    hash: hashMynnGiftTopUpShareFee,
  });

  const handleMynnGiftTopUpShareFee = () => {
    if (topUpAmount) {
      writeMynnGiftTopUpShareFee({
        ...mynngiftConfig,
        functionName: 'topUpShareFeeBalance',
        value: parseEther(topUpAmount),
      });
    }
  };

  const { writeContract: writeMynnGiftWithdrawGasSubsidy, data: hashMynnGiftWithdrawGasSubsidy, isPending: isPendingMynnGiftWithdrawGasSubsidy, isSuccess: isSuccessMynnGiftWithdrawGasSubsidy, isError: isErrorMynnGiftWithdrawGasSubsidy, error: errorMynnGiftWithdrawGasSubsidy } = useWriteContract();
  const { isLoading: isConfirmingMynnGiftWithdrawGasSubsidy } = useWaitForTransactionReceipt({
    hash: hashMynnGiftWithdrawGasSubsidy,
  });

  const handleMynnGiftWithdrawGasSubsidy = () => {
    if (withdrawAmount) {
      writeMynnGiftWithdrawGasSubsidy({
        ...mynngiftConfig,
        functionName: 'withdrawExcessGasSubsidy',
        args: [parseEther(withdrawAmount)],
      });
    }
  };

  const cardClass = "luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60 shadow-lg hover:shadow-2xl transition-all duration-300";
  const buttonClass = "px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] shadow-lg hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all duration-200 border-2 border-[#243DB6]";

  return (
    <div className="space-y-8">
      <div className={cardClass}>
        <h2 className="luxury-title mb-6 text-[#F5C45E]">Keuangan & Pendapatan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={cardClass}>
            <svg className="luxury-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 className="luxury-title text-[#F5C45E]">Total Pendapatan Platform</h3>
            <p>{totalPlatformIncome !== undefined ? renderWithKurs(formatEther(totalPlatformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Pendapatan Platform (Mynncrypt)</h3>
            <p>{platformIncome !== undefined ? renderWithKurs(formatEther(platformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Royalty Pool (Mynncrypt)</h3>
            <p>{royaltyPool !== undefined ? renderWithKurs(formatEther(royaltyPool), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Saldo Kontrak Mynncrypt</h3>
            <p>{mynncryptContractBalance !== undefined ? renderWithKurs(formatEther(mynncryptContractBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Saldo Share Fee (MynnGift)</h3>
            <p>{mynngiftShareFeeBalance !== undefined ? renderWithKurs(formatEther(mynngiftShareFeeBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Saldo Gas Subsidy Pool (MynnGift)</h3>
            <p>{mynngiftGasSubsidyPoolBalance !== undefined ? renderWithKurs(formatEther(mynngiftGasSubsidyPoolBalance), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title text-[#F5C45E]">Pendapatan Platform (MynnGift) Konversi</h3>
            <p>{mynngiftPlatformIncome !== undefined ? renderWithKurs(formatEther(mynngiftPlatformIncome), opbnbPriceUSD, opbnbPriceIDR, isPriceLoading, priceError) : 'Loading...'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className={cardClass}>
            <h3 className="luxury-title mb-4 text-[#F5C45E]">Tarik Dana Sisa (Mynncrypt)</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Alamat Penerima (0x...)"
                className="p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={withdrawRecipient}
                onChange={(e) => setWithdrawRecipient(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleFindupWithdraw}
                disabled={isPendingFindupWithdraw || !withdrawRecipient || mynncryptContractBalance === 0n}
              >
                {isPendingFindupWithdraw ? 'Menunggu Persetujuan...' : isConfirmingFindupWithdraw ? 'Menunggu Konfirmasi...' : 'Tarik Semua Dana Sisa'}
              </button>
              {isSuccessFindupWithdraw && <p className="text-green-500">Penarikan berhasil! Hash: {hashFindupWithdraw}</p>}
              {isErrorFindupWithdraw && <p className="text-red-500">Error penarikan: {errorFindupWithdraw?.message}</p>}
            </div>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title mb-4 text-[#F5C45E]">Tarik Kelebihan Saldo Share Fee (MynnGift)</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="number"
                placeholder="Jumlah opBNB"
                className="p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleMynnGiftWithdrawShareFee}
                disabled={isPendingMynnGiftWithdrawShareFee || !withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0}
              >
                {isPendingMynnGiftWithdrawShareFee ? 'Menunggu Persetujuan...' : isConfirmingMynnGiftWithdrawShareFee ? 'Menunggu Konfirmasi...' : 'Tarik Share Fee'}
              </button>
              {isSuccessMynnGiftWithdrawShareFee && <p className="text-green-500">Penarikan Share Fee berhasil! Hash: {hashMynnGiftWithdrawShareFee}</p>}
              {isErrorMynnGiftWithdrawShareFee && <p className="text-red-500">Error penarikan Share Fee: {errorMynnGiftWithdrawShareFee?.message}</p>}
            </div>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title mb-4 text-[#F5C45E]">Isi Saldo Share Fee (MynnGift)</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="number"
                placeholder="Jumlah opBNB"
                className="p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleMynnGiftTopUpShareFee}
                disabled={isPendingMynnGiftTopUpShareFee || !topUpAmount || isNaN(parseFloat(topUpAmount)) || parseFloat(topUpAmount) <= 0}
              >
                {isPendingMynnGiftTopUpShareFee ? 'Menunggu Persetujuan...' : isConfirmingMynnGiftTopUpShareFee ? 'Menunggu Konfirmasi...' : 'Isi Saldo Share Fee'}
              </button>
              {isSuccessMynnGiftTopUpShareFee && <p className="text-green-500">Pengisian Saldo Share Fee berhasil! Hash: {hashMynnGiftTopUpShareFee}</p>}
              {isErrorMynnGiftTopUpShareFee && <p className="text-red-500">Error pengisian Saldo Share Fee: {errorMynnGiftTopUpShareFee?.message}</p>}
            </div>
          </div>
          <div className={cardClass}>
            <h3 className="luxury-title mb-4 text-[#F5C45E]">Tarik Kelebihan Saldo Gas Subsidy (MynnGift)</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="number"
                placeholder="Jumlah opBNB"
                className="p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleMynnGiftWithdrawGasSubsidy}
                disabled={isPendingMynnGiftWithdrawGasSubsidy || !withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0}
              >
                {isPendingMynnGiftWithdrawGasSubsidy ? 'Menunggu Persetujuan...' : isConfirmingMynnGiftWithdrawGasSubsidy ? 'Menunggu Konfirmasi...' : 'Tarik Gas Subsidy'}
              </button>
              {isSuccessMynnGiftWithdrawGasSubsidy && <p className="text-green-500">Penarikan Gas Subsidy berhasil! Hash: {hashMynnGiftWithdrawGasSubsidy}</p>}
              {isErrorMynnGiftWithdrawGasSubsidy && <p className="text-red-500">Error penarikan Gas Subsidy: {errorMynnGiftWithdrawGasSubsidy?.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractSettingsSection = ({ mynncryptConfig, mynngiftConfig }) => {
  const [newDefaultReferralId, setNewDefaultReferralId] = useState('');
  const [newSharefeeAddress, setNewSharefeeAddress] = useState('');
  const [newMynngiftWalletAddress, setNewMynngiftWalletAddress] = useState('');
  const [newPlatformWalletAddress, setNewPlatformWalletAddress] = useState('');
  const [newPromotionWalletAddress, setNewPromotionWalletAddress] = useState('');

  // Read current settings from MynnCrypt contract
  const { data: currentDefaultReferralId } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getDefaultRefer',
  });

  const { data: currentSharefeeAddress } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getSharefee',
  });

  const { data: currentMynngiftWalletAddress } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMynngiftWallet',
  });

  // Read current settings from MynnGift contract
  const { data: currentPlatformWalletAddress } = useReadContract({
    ...mynngiftConfig,
    functionName: 'platformWallet',
  });

  const { data: currentPromotionWalletAddress } = useReadContract({
    ...mynngiftConfig,
    functionName: 'promotionWallet',
  });

  // Write functions for Findup
  const { writeContract: writeSetDefaultReferralId, data: hashSetDefaultReferralId, isPending: isPendingSetDefaultReferralId, isSuccess: isSuccessSetDefaultReferralId, isError: isErrorSetDefaultReferralId, error: errorSetDefaultReferralId } = useWriteContract();
  const { isLoading: isConfirmingSetDefaultReferralId } = useWaitForTransactionReceipt({
    hash: hashSetDefaultReferralId,
  });

  const handleSetDefaultReferralId = () => {
    if (newDefaultReferralId) {
      writeSetDefaultReferralId({
        ...mynncryptConfig,
        functionName: 'setDefaultReferralId',
        args: [newDefaultReferralId],
      });
    }
  };

  const { writeContract: writeSetSharefee, data: hashSetSharefee, isPending: isPendingSetSharefee, isSuccess: isSuccessSetSharefee, isError: isErrorSetSharefee, error: errorSetSharefee } = useWriteContract();
  const { isLoading: isConfirmingSetSharefee } = useWaitForTransactionReceipt({
    hash: hashSetSharefee,
  });

  const handleSetSharefee = () => {
    if (newSharefeeAddress) {
      writeSetSharefee({
        ...mynncryptConfig,
        functionName: 'setSharefee',
        args: [newSharefeeAddress],
      });
    }
  };

  const { writeContract: writeSetMynngiftWallet, data: hashSetMynngiftWallet, isPending: isPendingSetMynngiftWallet, isSuccess: isSuccessSetMynngiftWallet, isError: isErrorSetMynngiftWallet, error: errorSetMynngiftWallet } = useWriteContract();
  const { isLoading: isConfirmingSetMynngiftWallet } = useWaitForTransactionReceipt({
    hash: hashSetMynngiftWallet,
  });

  const handleSetMynngiftWallet = () => {
    if (newMynngiftWalletAddress) {
      writeSetMynngiftWallet({
        ...mynncryptConfig,
        functionName: 'setMynngiftWallet',
        args: [newMynngiftWalletAddress],
      });
    }
  };

  // Write functions for MynnGift
  const { writeContract: writeSetPlatformWallet, data: hashSetPlatformWallet, isPending: isPendingSetPlatformWallet, isSuccess: isSuccessSetPlatformWallet, isError: isErrorSetPlatformWallet, error: errorSetPlatformWallet } = useWriteContract();
  const { isLoading: isConfirmingSetPlatformWallet } = useWaitForTransactionReceipt({
    hash: hashSetPlatformWallet,
  });

  const handleSetPlatformWallet = () => {
    if (newPlatformWalletAddress) {
      writeSetPlatformWallet({
        ...mynngiftConfig,
        functionName: 'setPlatformWallet',
        args: [newPlatformWalletAddress],
      });
    }
  };

  const { writeContract: writeSetPromotionWallet, data: hashSetPromotionWallet, isPending: isPendingSetPromotionWallet, isSuccess: isSuccessSetPromotionWallet, isError: isErrorSetPromotionWallet, error: errorSetPromotionWallet } = useWriteContract();
  const { isLoading: isConfirmingSetPromotionWallet } = useWaitForTransactionReceipt({
    hash: hashSetPromotionWallet,
  });

  const handleSetPromotionWallet = () => {
    if (newPromotionWalletAddress) {
      writeSetPromotionWallet({
        ...mynngiftConfig,
        functionName: 'setPromotionWallet',
        args: [newPromotionWalletAddress],
      });
    }
  };

  const buttonClass = "px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#243DB6] to-[#102E50] text-[#F5C45E] shadow-lg hover:from-[#F5C45E] hover:to-[#E78B48] hover:text-[#102E50] transition-all duration-200 border-2 border-[#243DB6]";

  return (
    <div className="space-y-8">
      <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
        <h2 className="luxury-title mb-6 text-[#F5C45E]">Pengaturan Findup</h2>
        <div className="space-y-4">
          <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
            <p className="mb-2"><span className="text-[#243DB6] font-semibold">Default Referral ID Saat Ini:</span> <span className="luxury-amount text-[#E78B48]">{currentDefaultReferralId !== undefined ? currentDefaultReferralId : 'Loading...'}</span></p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New Default Referral ID"
                className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={newDefaultReferralId}
                onChange={(e) => setNewDefaultReferralId(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleSetDefaultReferralId}
                disabled={isPendingSetDefaultReferralId || !newDefaultReferralId}
              >
                {isPendingSetDefaultReferralId ? 'Menunggu Persetujuan...' : isConfirmingSetDefaultReferralId ? 'Menunggu Konfirmasi...' : 'Perbarui ID'}
              </button>
            </div>
            {isSuccessSetDefaultReferralId && <p className="text-green-500">ID Referral berhasil diperbarui! Hash: {hashSetDefaultReferralId}</p>}
            {isErrorSetDefaultReferralId && <p className="text-red-500">Error: {errorSetDefaultReferralId?.message}</p>}
          </div>
          <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
            <p className="mb-2"><span className="text-[#243DB6] font-semibold">Alamat Sharefee Saat Ini:</span> <span className="luxury-amount text-[#E78B48]">{currentSharefeeAddress !== undefined ? currentSharefeeAddress : 'Loading...'}</span></p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New Sharefee Address (0x...)"
                className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={newSharefeeAddress}
                onChange={(e) => setNewSharefeeAddress(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleSetSharefee}
                disabled={isPendingSetSharefee || !newSharefeeAddress}
              >
                {isPendingSetSharefee ? 'Menunggu Persetujuan...' : isConfirmingSetSharefee ? 'Menunggu Konfirmasi...' : 'Perbarui Alamat Sharefee'}
              </button>
            </div>
            {isSuccessSetSharefee && <p className="text-green-500">Alamat Sharefee berhasil diperbarui! Hash: {hashSetSharefee}</p>}
            {isErrorSetSharefee && <p className="text-red-500">Error: {errorSetSharefee?.message}</p>}
          </div>
          <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
            <p className="mb-2"><span className="text-[#243DB6] font-semibold">Alamat MynnGift Wallet Saat Ini:</span> <span className="luxury-amount text-[#E78B48]">{currentMynngiftWalletAddress !== undefined ? currentMynngiftWalletAddress : 'Loading...'}</span></p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New MynnGift Wallet Address (0x...)"
                className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={newMynngiftWalletAddress}
                onChange={(e) => setNewMynngiftWalletAddress(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleSetMynngiftWallet}
                disabled={isPendingSetMynngiftWallet || !newMynngiftWalletAddress}
              >
                {isPendingSetMynngiftWallet ? 'Menunggu Persetujuan...' : isConfirmingSetMynngiftWallet ? 'Menunggu Konfirmasi...' : 'Perbarui Alamat MynnGift'}
              </button>
            </div>
            {isSuccessSetMynngiftWallet && <p className="text-green-500">Alamat MynnGift berhasil diperbarui! Hash: {hashSetMynngiftWallet}</p>}
            {isErrorSetMynngiftWallet && <p className="text-red-500">Error: {errorSetMynngiftWallet?.message}</p>}
          </div>
        </div>
      </div>
      <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
        <h2 className="luxury-title mb-6 text-[#F5C45E]">Pengaturan MynnGift</h2>
        <div className="space-y-4">
          <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
            <p className="mb-2"><span className="text-[#243DB6] font-semibold">Alamat Platform Wallet Saat Ini:</span> <span className="luxury-amount text-[#E78B48]">{currentPlatformWalletAddress !== undefined ? currentPlatformWalletAddress : 'Loading...'}</span></p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New Platform Wallet Address (0x...)"
                className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={newPlatformWalletAddress}
                onChange={(e) => setNewPlatformWalletAddress(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleSetPlatformWallet}
                disabled={isPendingSetPlatformWallet || !newPlatformWalletAddress}
              >
                {isPendingSetPlatformWallet ? 'Menunggu Persetujuan...' : isConfirmingSetPlatformWallet ? 'Menunggu Konfirmasi...' : 'Perbarui Alamat Platform'}
              </button>
            </div>
            {isSuccessSetPlatformWallet && <p className="text-green-500">Alamat Platform berhasil diperbarui! Hash: {hashSetPlatformWallet}</p>}
            {isErrorSetPlatformWallet && <p className="text-red-500">Error: {errorSetPlatformWallet?.message}</p>}
          </div>
          <div className="luxury-card bg-gradient-to-br from-[#243DB6] to-[#102E50] border-2 border-[#243DB6]/60">
            <p className="mb-2"><span className="text-[#243DB6] font-semibold">Alamat Promotion Wallet Saat Ini:</span> <span className="luxury-amount text-[#E78B48]">{currentPromotionWalletAddress !== undefined ? currentPromotionWalletAddress : 'Loading...'}</span></p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New Promotion Wallet Address (0x...)"
                className="flex-1 p-2 rounded-md bg-[#011220] border border-[#243DB6]/60 focus:outline-none focus:ring-2 focus:ring-[#F5C45E] text-[#F5C45E]"
                value={newPromotionWalletAddress}
                onChange={(e) => setNewPromotionWalletAddress(e.target.value)}
              />
              <button
                className={buttonClass}
                onClick={handleSetPromotionWallet}
                disabled={isPendingSetPromotionWallet || !newPromotionWalletAddress}
              >
                {isPendingSetPromotionWallet ? 'Menunggu Persetujuan...' : isConfirmingSetPromotionWallet ? 'Menunggu Konfirmasi...' : 'Perbarui Alamat Promosi'}
              </button>
            </div>
            {isSuccessSetPromotionWallet && <p className="text-green-500">Alamat Promosi berhasil diperbarui! Hash: {hashSetPromotionWallet}</p>}
            {isErrorSetPromotionWallet && <p className="text-red-500">Error: {errorSetPromotionWallet?.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityLogsSection = ({ mynncryptConfig }) => {
  const { data: recentActivities, isLoading, isError } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getRecentActivities',
    args: [20], // Ambil 20 aktivitas terakhir
  });

  return (
    <div className="luxury-card">
      <h2 className="luxury-title mb-6">Aktivitas & Log</h2>
      {isLoading && <p className="text-[#4DA8DA]">Memuat aktivitas terbaru...</p>}
      {isError && <p className="text-red-500">Error memuat aktivitas.</p>}
      {recentActivities && recentActivities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#102E50] rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4DA8DA] uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4DA8DA] uppercase tracking-wider">Level</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className="border-b border-[#4DA8DA]/10 hover:bg-[#4DA8DA]/5">
                  <td className="px-6 py-4 whitespace-nowrap text-[#F5C45E]">{activity.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#F5C45E]">{activity.level.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : ( !isLoading && !isError &&
        <p className="text-[#F5C45E]">Tidak ada aktivitas terbaru yang tersedia.</p>
      )}
    </div>
  );
};

export default DashboardAdmin;