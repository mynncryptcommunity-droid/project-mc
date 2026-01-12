import { createConfig, WagmiProvider } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Testimoni from './components/Testimoni';
import Footer from './components/Footer';
import Register from './components/Register';
import mynncryptAbiRaw from './abis/MynnCrypt.json';
import mynngiftAbiRaw from './abis/MynnGift.json';
import HowItWorks from './components/HowItWorks';
import NetworkDetector from './components/NetworkDetector';
import LocalhostAutoSwitch from './components/LocalhostAutoSwitch';
import LoadingSpinner from './components/LoadingSpinner';

// ✅ OPTIMIZATION: Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const DashboardAdmin = lazy(() => import('./pages/dashboardadmin'));

// Extract ABI from Hardhat artifact format
const mynncryptAbi = mynncryptAbiRaw.abi || mynncryptAbiRaw;
const mynngiftAbi = mynngiftAbiRaw.abi || mynngiftAbiRaw;
// Background image is now in public folder, so we don't need to import it

// ✅ Hardhat Local Network (for development/testing)
const hardhatLocal = {
  id: 1337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
};

const opbnbMainnet = {
  id: 204,
  name: 'opBNB Mainnet',
  network: 'opbnb',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
    public: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
  },
};

const opbnbTestnet = {
  id: 5611,
  name: 'opBNB Testnet',
  network: 'opbnb-testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
};

const mynncryptConfig = {
  address: import.meta.env.VITE_MYNNCRYPT_ADDRESS || '0x1923bD63B2A468d48eA70f5690239dd9B0eb24cE',
  abi: mynncryptAbi,
};

const mynngiftConfig = {
  address: import.meta.env.VITE_MYNNGIFT_ADDRESS || '0x82682F273a26Bbf5c6bD3BC267fc14c3E4D231f6',
  abi: mynngiftAbi,
};

// ✅ Platform Wallet Configuration (owner/admin wallet across networks)
const platformWalletConfig = {
  hardhat: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat first account
  testnet: import.meta.env.VITE_PLATFORM_WALLET || '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928',
  mainnet: import.meta.env.VITE_PLATFORM_WALLET || '0xd442eA3d7909e8e768DcD8D7ed7e39C5D6759928',
};

const config = createConfig({
  chains: [opbnbMainnet, opbnbTestnet, hardhatLocal],  // ✅ opBNB Mainnet FIRST for production
  connectors: [
    injected(), // Menghilangkan target: 'metaMask' agar semua injected wallet (termasuk TokenPocket) bisa dideteksi
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' }),
  ],
  transports: {
    [hardhatLocal.id]: http('http://localhost:8545'),           // ✅ NEW: Hardhat local RPC
    [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
  },
});

// Buat publicClient - akan di-update berdasarkan selected chain di AppContent
const publicClientDefault = createPublicClient({
  chain: opbnbMainnet,  // ✅ Default to mainnet for production
  transport: http('https://opbnb-mainnet-rpc.bnbchain.org'),
});

const queryClient = new QueryClient();

function App() {
  const [hasMetaMask, setHasMetaMask] = useState(true);

  useEffect(() => {
    if (!window.ethereum) {
      setHasMetaMask(false);
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {!hasMetaMask && (
          <div className="bg-red-600 text-white text-center py-2">
            Wallet tidak terdeteksi. Fitur transaksi dinonaktifkan. Install MetaMask untuk pengalaman penuh.
          </div>
        )}
        <LocalhostAutoSwitch />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        <AppContent
          mynncryptConfig={mynncryptConfig}
          mynngiftConfig={mynngiftConfig}
          platformWalletConfig={platformWalletConfig}
          publicClient={publicClientDefault}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function AppContent({ mynncryptConfig, mynngiftConfig, platformWalletConfig, publicClient }) {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);

  useEffect(() => {
    const tryReconnect = async () => {
      try {
        // Jangan reconnect jika user sudah logout
        if (localStorage.getItem('loggedOut')) {
          return;
        }

        // Check if window.ethereum exists before accessing it
        if (!window.ethereum) {
          console.warn('No Ethereum provider detected');
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        // Hanya reconnect jika:
        // 1. Ada accounts di MetaMask
        // 2. Belum connected ke Wagmi
        // 3. Belum attempt reconnect
        if (accounts.length > 0 && !isConnected && !hasAttemptedReconnect) {
          console.log('Attempting to reconnect to MetaMask...');
          
          // Cari connector injected (untuk MetaMask, TokenPocket, dll)
          const connector = connectors.find((c) => c.id === 'injected') || connectors[0];
          if (connector) {
            await connectAsync({ connector });
            setHasAttemptedReconnect(true);
          }
        }
      } catch (error) {
        console.error('AppContent.jsx: Failed to reconnect:', error);
        setHasAttemptedReconnect(true);
      }
    };

    tryReconnect();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen text-sfc-cream relative">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                      backgroundImage: 'url(/newbackground.png)', backgroundSize: 'cover', 
                      backgroundPosition: 'center', opacity: 0.7, zIndex: 0 }} className="parallax-background"></div>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                      background: 'linear-gradient(to bottom, rgba(24, 59, 78, 0.7), rgba(39, 84, 138, 0.7))', 
                      zIndex: 1 }}></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Network Detector - Silent component untuk detect wrong network */}
          <NetworkDetector />
          <Header mynncryptConfig={mynncryptConfig} />
          <MainContent
            mynncryptConfig={mynncryptConfig}
            mynngiftConfig={mynngiftConfig}
            platformWalletConfig={platformWalletConfig}
            publicClient={publicClient}
          />
        </div>
      </div>
    </BrowserRouter>
  );
}

function MainContent({ mynncryptConfig, mynngiftConfig, platformWalletConfig, publicClient }) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      const sections = document.querySelectorAll('.section');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              
              // Animate elements within the section
              const fadeElements = entry.target.querySelectorAll('.fade-element');
              fadeElements.forEach((el, index) => {
                setTimeout(() => {
                  el.classList.add('animate');
                }, index * 100);
              });
            }
          });
        },
        { threshold: 0.1 }
      );
      sections.forEach((section) => observer.observe(section));
      
      // Scroll progress indicator
      const progressIndicator = document.createElement('div');
      progressIndicator.className = 'scroll-progress';
      document.body.appendChild(progressIndicator);
      
      const updateScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressIndicator.style.width = scrollPercent + '%';
      };
      
      window.addEventListener('scroll', updateScrollProgress);
      
      // Parallax effect for background
      const handleParallax = () => {
        const scrolled = window.pageYOffset;
        const background = document.querySelector('.parallax-background');
        if (background) {
          const speed = scrolled * 0.5;
          background.style.transform = `translateY(${speed}px)`;
        }
      };
      
      window.addEventListener('scroll', handleParallax);
      
      return () => {
        sections.forEach((section) => observer.unobserve(section));
        window.removeEventListener('scroll', updateScrollProgress);
        window.removeEventListener('scroll', handleParallax);
        if (progressIndicator.parentNode) {
          progressIndicator.parentNode.removeChild(progressIndicator);
        }
      };
    }
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
          .section {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
          }
          .section.visible {
            opacity: 1;
            transform: translateY(0);
          }
          
          /* Enhanced animations for specific sections */
          #home.section {
            transition-delay: 0.1s;
          }
          #about.section {
            transform: translateY(30px);
            transition-delay: 0.2s;
          }
          #testimoni.section {
            transform: translateY(30px);
            transition-delay: 0.3s;
          }
          #footer.section {
            transform: translateY(30px);
            transition-delay: 0.4s;
          }
          
          /* Additional animation variants */
          .slide-in-left {
            transform: translateX(-50px);
          }
          .slide-in-right {
            transform: translateX(50px);
          }
          .scale-up {
            transform: scale(0.95);
          }
          
          /* Enhanced visible states */
          .slide-in-left.visible,
          .slide-in-right.visible,
          .scale-up.visible {
            transform: translateX(0) scale(1);
          }
          
          /* Staggered animation delays */
          .stagger-1 { transition-delay: 0.1s; }
          .stagger-2 { transition-delay: 0.2s; }
          .stagger-3 { transition-delay: 0.3s; }
          .stagger-4 { transition-delay: 0.4s; }
          
          /* Parallax effect for background */
          .parallax-background {
            transform: translateZ(-1px) scale(1.1);
            z-index: -1;
          }
          
          /* Scroll progress indicator */
          .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #DDA853, #F3F3E0);
            z-index: 1000;
            transition: width 0.1s ease;
          }
          
          /* Micro-interactions */
          .micro-hover {
            transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          }
          
          .micro-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          
          /* Fade-in elements within sections */
          .fade-element {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          
          .fade-element.animate {
            opacity: 1;
            transform: translateY(0);
          }
          
          /* Page transition animations */
          .page-transition {
            animation: fadeIn 0.5s ease forwards;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="home" className="section scale-up">
                <Hero mynncryptConfig={mynncryptConfig} mynngiftConfig={mynngiftConfig} />
              </section>
              <section id="about" className="section slide-in-left stagger-1">
                <About />
              </section>
              <section id="testimoni" className="section slide-in-right stagger-2">
                <Testimoni />
              </section>
              <section id="footer" className="section stagger-3">
                <Footer />
              </section>
            </>
          }
        />
        <Route
          path="/register"
          element={<div className="page-transition"><Register mynncryptConfig={mynncryptConfig} /></div>}
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<div className="page-transition"><LoadingSpinner message="Loading Dashboard..." size="large" /></div>}>
              <div className="page-transition">
                <Dashboard
                  mynncryptConfig={mynncryptConfig}
                  mynngiftConfig={mynngiftConfig}
                  platformWalletConfig={platformWalletConfig}
                  publicClient={publicClient}
                />
              </div>
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="page-transition"><LoadingSpinner message="Loading Admin Dashboard..." size="large" /></div>}>
              <div className="page-transition">
                <DashboardAdmin
                  mynncryptConfig={mynncryptConfig}
                  mynngiftConfig={mynngiftConfig}
                  publicClient={publicClient}
                />
              </div>
            </Suspense>
          }
        />
        <Route
          path="/how-it-works"
          element={<div className="page-transition"><HowItWorks /></div>}
        />
      </Routes>
    </>
  );
}

export default App;