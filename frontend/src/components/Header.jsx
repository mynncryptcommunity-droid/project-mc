import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo_platform.png';
import metamaskLogo from '../assets/metamask-logo.svg';
import trustwalletLogo from '../assets/trustwallet-logo.svg';
import GooeyNav from './GooeyNav';
import LoadingSpinner from './LoadingSpinner';

export default function Header({ mynncryptConfig }) {
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [referralId, setReferralId] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { 
    writeContract: register, 
    data: hash,
    isPending: isWritePending
  } = useWriteContract();
  const navigate = useNavigate();
  const location = useLocation();

  // Cek apakah pengguna sudah terdaftar
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
    enabled: isConnected && !!address,
  });

  // Cek validitas referral ID
  const { 
    data: referralAddress, 
    isLoading: referralLoading,
    error: referralError 
  } = useReadContract({
    address: mynncryptConfig.address,
    abi: mynncryptConfig.abi,
    functionName: 'userIds',
    args: [referralId],
    enabled: !!referralId && referralId !== 'A8888NR',
  });

  // Tunggu konfirmasi transaksi
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt
  } = useWaitForTransactionReceipt({ 
    hash,
  });

  // ✅ Deteksi platform wallet (gunakan default referral A8888NR)
  const isPlatformWallet = address && (
    address.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'  // Hardhat default account 0
  );

  // Parse referral ID dari URL untuk metode otomatis
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    console.log('Header.jsx - Query ref:', ref);
    if (ref && /^[A-Z][0-9]{4}(WR|NR)$/.test(ref)) {
      setReferralId(ref);
      if (!isConnected) setShowModal(true); // Buka modal hanya jika belum terhubung
    }
  }, [location, isConnected]);

  // ✅ Auto-redirect berdasarkan wallet status
  // PENTING: Only redirect jika YAKIN tentang userId status (tidak loading, tidak error)
  useEffect(() => {
    console.log('🔍 Header.jsx - Checking redirect logic');
    console.log('   isConnected:', isConnected);
    console.log('   address:', address);
    console.log('   userIdLoading:', userIdLoading);
    console.log('   userIdError:', userIdError);
    console.log('   userId:', userId);
    console.log('   location.pathname:', location.pathname);

    // ⚠️ GUARD: Jangan redirect jika dalam keadaan undefined/loading
    if (!isConnected || !address || userIdLoading || userIdError) {
      console.log('⏳ Header.jsx - Not ready for redirect decision yet, waiting...');
      console.log('   Reasons:', {
        notConnected: !isConnected,
        noAddress: !address,
        loading: userIdLoading,
        error: !!userIdError
      });
      return;
    }

    // ✅ SAFE STATE: Wallet connected, address exists, no loading/errors
    // Now we can safely check userId

    // ⚠️ EXCLUDE: Don't redirect if user intentionally on admin pages
    if (location.pathname.startsWith('/admin')) {
      console.log('📌 Header.jsx - User on admin page, skipping auto-redirect');
      return;
    }

    // ✅ Jika userId ada (registered) → AUTO redirect dashboard
    if (userId && typeof userId === 'string' && userId.length > 0) {
      console.log('✅ Header.jsx - Wallet REGISTERED');
      console.log('   userId:', userId);
      if (location.pathname !== '/dashboard') {
        console.log('🚀 Redirecting to /dashboard');
        navigate('/dashboard');
      }
      return;
    }

    // ✅ Jika userId kosong (NOT registered) → STAY di homepage
    if (typeof userId === 'string' && userId.length === 0) {
      console.log('❌ Header.jsx - Wallet connected but NOT registered');
      console.log('   Staying at homepage');
      console.log('   User can click "Join Now" to register');
      return;
    }

    // ⚠️ Unexpected state
    console.warn('⚠️ Header.jsx - Unexpected userId state:', userId);
  }, [isConnected, address, userIdLoading, userIdError, userId, navigate, location.pathname]);

  // Debug status koneksi wallet
  useEffect(() => {
    console.log('Header.jsx - Wallet Status:', { isConnected, isConnecting, address, connectError });
    if (window.ethereum) {
      console.log('Header.jsx - window.ethereum detected');
    } else {
      console.log('Header.jsx - window.ethereum NOT detected');
    }
  }, [isConnected, isConnecting, address, connectError]);

  // Definisikan fungsi callback
  const handleRegisterSuccess = useCallback((userId) => {
    const hasReferral = userId.includes('WR');
    setRegisterMessage(`Registrasi berhasil! ID Anda: ${userId}${hasReferral ? ' (Daftar dengan referral)' : ' (Tanpa referral)'}`);
    setIsSuccess(true);
    setShowRegisterModal(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  }, [navigate]);

  const handleRegisterError = useCallback((error) => {
    console.error('Header.jsx - Registration error:', error);
    const errorMsg = error?.shortMessage || error?.message || 'Unknown error';
    setRegisterMessage(`Registrasi gagal: ${errorMsg}`);
    setIsSuccess(false);
    setShowRegisterModal(true);
    setIsRegistering(false);
  }, []);

  const handleRegistrationResult = useCallback(async () => {
    try {
      console.log('Header.jsx - Starting post-registration verification...');
      let newUserId = null;
      let retryCount = 0;
      const maxRetries = 8;  // 8 attempts × 3 detik = 24 detik total
      const retryInterval = 3000;  // 3 seconds between attempts
      
      // Retry loop untuk tunggu block confirmation
      while (!newUserId && retryCount < maxRetries) {
        console.log(`Header.jsx - Verification attempt ${retryCount + 1}/${maxRetries}...`);
        
        // Wait sebelum retry
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
        
        // Coba fetch user ID
        const { data } = await refetchUserId();
        console.log(`Header.jsx - Refetch result (attempt ${retryCount + 1}):`, data);
        
        if (data && data.length > 0) {
          newUserId = data;
          console.log('✅ Header.jsx - User ID found after', retryCount + 1, 'attempts:', newUserId);
          break;
        }
        
        retryCount++;
      }
      
      // Jika masih tidak dapat userId setelah retry
      if (!newUserId) {
        const errorMsg = `Failed to fetch new user ID after ${maxRetries} attempts (${maxRetries * 3} seconds). Block confirmation may be delayed or contract state not updated.`;
        console.error('❌ Header.jsx -', errorMsg);
        throw new Error(errorMsg);
      }
      
      handleRegisterSuccess(newUserId);
    } catch (error) {
      console.error('❌ Header.jsx - Post-registration verification failed:', error);
      handleRegisterError(error);
    } finally {
      setIsRegistering(false);
    }
  }, [refetchUserId, handleRegisterSuccess, handleRegisterError]);

  // Efek untuk menangani hasil transaksi
  useEffect(() => {
    if (isConfirmed && receipt) {
      handleRegistrationResult();
    }
  }, [isConfirmed, receipt, handleRegistrationResult]);

  const handleJoinClick = async () => {
    if (!isConnected) {
      console.log('Header.jsx - Wallet not connected, opening modal...');
      setShowModal(true);
      return;
    }

    if (userIdLoading) {
      console.log('Header.jsx - Checking registration status...');
      setRegisterStatus('Memeriksa status registrasi...');
      return;
    }

    if (userId && userId.length > 0) {
      console.log('Header.jsx - User already registered:', userId);
      setRegisterStatus('Anda sudah terdaftar. Mengarahkan ke dashboard...');
      // Redirect setelah 1 detik agar user lihat pesan dulu
      setTimeout(() => navigate('/dashboard'), 1000);
      return;
    }

    let finalReferralId = 'A8888NR';
    
    if (referralId) {
      const parsedRef = referralId.includes('ref=') 
        ? new URLSearchParams(referralId.split('?')[1]).get('ref') 
        : referralId;
      
      // Validate format
      if (!/^[A-Z][0-9]{4}(WR|NR)$/.test(parsedRef)) {
        setRegisterMessage('Referral ID tidak valid. Harus berformat [A-Z][0-9]{4}(WR|NR).');
        setIsSuccess(false);
        setShowRegisterModal(true);
        return;
      }

      // FIX: A8888NR adalah default referral - ALWAYS VALID, tidak perlu check
      if (parsedRef === 'A8888NR') {
        finalReferralId = 'A8888NR';
        console.log('Header.jsx - Using default referral: A8888NR (Platform Wallet)');
      } else {
        // Only check non-default referrals against smart contract
        if (referralLoading) {
          setRegisterStatus('Memeriksa referral ID...');
          return;
        }
        if (referralError || !referralAddress) {
          setRegisterMessage('Referral ID tidak ditemukan di kontrak.');
          setIsSuccess(false);
          setShowRegisterModal(true);
          return;
        }
        finalReferralId = parsedRef;
        console.log('Header.jsx - Using referral ID:', finalReferralId);
      }
    } else {
      console.log('Header.jsx - No referral provided, using default: A8888NR');
    }

    console.log('Header.jsx - Starting registration with:', { finalReferralId, address });
    setIsRegistering(true);
    setRegisterStatus('Memproses registrasi...');

    try {
      await register({
        address: mynncryptConfig.address,
        abi: mynncryptConfig.abi,
        functionName: 'register',
        args: [finalReferralId, address],
        value: BigInt(4.4e15), // 0.0044 ETH
      });
      setRegisterStatus('Menunggu konfirmasi transaksi...');
    } catch (error) {
      handleRegisterError(error);
    }
  };

  const handleConnect = (connector) => {
    console.log('Header.jsx - Attempting to connect with:', connector.id);
    const connectorToUse = connector === walletConnect
      ? walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' })
      : connector;
    connect({ connector: connectorToUse }, {
      onSuccess: () => {
        console.log('Header.jsx - Connection successful');
        setShowModal(true);
      },
      onError: (error) => {
        console.error('Header.jsx - Connect error:', error.message);
        alert('Gagal menghubungkan wallet: ' + (error.message || 'Wallet tidak terdeteksi. Pastikan MetaMask atau Trust Wallet terinstal.'));
      },
    });
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'Join Now', href: '#join', isJoinNow: true }
  ];

  return (
    <>
      <header className="bg-sfc-dark-blue/80 backdrop-blur-md text-sfc-cream sticky top-0 z-50 shadow-lg">
        <style>
          {`
            .header-container {
              position: relative;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 40px;
              height: 80px;
              background: linear-gradient(90deg, rgba(24,59,78,0.9) 0%, rgba(39,84,138,0.9) 100%);
              border-bottom: 1px solid rgba(221,168,83,0.2);
              box-shadow: 0 4px 30px rgba(0,0,0,0.1);
            }
            .logo-title-container {
              display: flex;
              align-items: center;
              gap: 12px;
              min-width: 0;
            }
            .logo-img {
              width: 150px;
              height: 150px;
              flex-shrink: 0;
            }
            .header-title {
              font-size: 1.2rem;
              border: 1px solid rgba(221, 168, 83, 0.5);
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 5px 15px;
              border-radius: 8px;
              box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(221, 168, 83, 0.2);
              font-weight: 700;
              background: linear-gradient(45deg, #F3F3E0, #DDA853);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .logo-container {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 8px 20px 8px 12px;
              background: rgba(255,255,255,0.05);
              border-radius: 14px;
              border: 1px solid rgba(221,168,83,0.1);
              transition: all 0.3s ease;
              min-width: 320px;
            }
            .logo-container:hover {
              background: rgba(255,255,255,0.1);
              transform: translateY(-1px);
            }
            .logo-container img {
              height: 38px;
              width: auto;
            }
            .logo-container h1 {
              font-size: 1.6rem;
              font-weight: 600;
              background: linear-gradient(45deg, #F3F3E0, #DDA853);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
              white-space: nowrap;
            }
            .nav-button {
              background: #DDA853;
              border: none;
              border-radius: 50px;
              padding: 10px 20px;
              margin: 0 10px;
              color: #183B4E;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
              transform: translateY(0);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .nav-button:hover {
              background: #FFC107;
              color: #fff;
              transform: translateY(-3px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .nav-button:active {
              transform: translateY(1px);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .nav-button.active {
              background: #FFC107;
              color: #fff;
            }
            .join-now-button {
              --white: #F3F3E0;
              --gold-100: #F5C45E;
              --gold-200: #FFD700;
              --gold-300: #FFF9C4;
              --mid-blue: #27548A;
              --dark-blue: #183B4E;
              --radius: 18px;
              border-radius: var(--radius);
              outline: none;
              cursor: pointer;
              font-size: 23px;
              font-family: Arial;
              background: transparent;
              letter-spacing: -1px;
              border: 0;
              position: relative;
              width: 220px;
              height: 80px;
              display: ${location.pathname === '/dashboard' ? 'none' : 'block'};
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .join-now-button:hover {
              transform: translateY(-4px);
              filter: brightness(1.15);
            }
            .join-now-button:active {
              transform: translateY(-1px);
            }
            .bg { 
              position: absolute; 
              inset: 0; 
              border-radius: inherit; 
              filter: blur(1px); 
            }
            .bg::before, .bg::after { 
              content: ""; 
              position: absolute; 
              inset: 0; 
              border-radius: calc(var(--radius) * 1.1); 
              background: var(--dark-blue); 
            }
            .bg::before { 
              filter: blur(5px); 
              transition: all 0.3s ease; 
              box-shadow: 
                -7px 6px 0 0 rgba(221, 168, 83, 0.5),
                -14px 12px 0 0 rgba(255, 215, 0, 0.4),
                -21px 18px 4px 0 rgba(255, 215, 0, 0.3),
                -28px 24px 8px 0 rgba(221, 168, 83, 0.2),
                -35px 30px 12px 0 rgba(255, 215, 0, 0.15),
                -42px 36px 16px 0 rgba(221, 168, 83, 0.1),
                -56px 42px 20px 0 rgba(255, 215, 0, 0.08); 
            }
            .wrap { 
              border-radius: inherit; 
              overflow: hidden; 
              height: 100%; 
              transform: translate(6px, -6px); 
              padding: 3px; 
              background: linear-gradient(135deg, var(--gold-100) 0%, var(--gold-200) 50%, var(--gold-100) 100%); 
              position: relative; 
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            .outline { 
              position: absolute; 
              overflow: hidden; 
              inset: 0; 
              opacity: 0; 
              outline: none; 
              border-radius: inherit; 
              transition: all 0.4s ease; 
            }
            .outline::before { 
              content: ""; 
              position: absolute; 
              inset: 2px; 
              width: 120px; 
              height: 300px; 
              margin: auto; 
              background: linear-gradient(to right, transparent 0%, var(--white) 50%, transparent 100%); 
              animation: spin 3s linear infinite; 
              animation-play-state: paused; 
            }
            .content { 
              pointer-events: none; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              z-index: 1; 
              position: relative; 
              height: 100%; 
              gap: 16px; 
              border-radius: calc(var(--radius) * 0.85); 
              font-weight: 700; 
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
              background: linear-gradient(135deg, var(--gold-200) 0%, var(--gold-300) 50%, var(--gold-200) 100%); 
              box-shadow: inset -2px 12px 11px -5px var(--gold-100), inset 1px -3px 11px 0px rgba(0, 0, 137, 0.35), 0 0 15px rgba(255, 215, 0, 0.2); 
              color: #1a1a2e;
            }
            .content::before { 
              content: ""; 
              inset: 0; 
              position: absolute; 
              z-index: 10; 
              width: 80%; 
              top: 45%; 
              bottom: 35%; 
              opacity: 0.7; 
              margin: auto; 
              background: linear-gradient(to bottom, transparent, var(--mid-blue)); 
              filter: brightness(1.3) blur(5px); 
            }
            .words { 
              display: flex; 
              flex-direction: row; 
              align-items: center; 
              justify-content: center; 
            }
            .char { 
              transition: all 0.3s ease; 
              display: inline-block; 
            }
            .char span { 
              display: inline-block; 
              color: transparent; 
              position: relative; 
            }
            .char:nth-child(5) { 
              margin-left: 5px; 
            }
            .char.state-1 span:nth-child(5) { 
              margin-right: -3px; 
            }
            .char.state-1 span { 
              animation: charAppear 1.2s ease backwards calc(var(--i) * 0.03s); 
            }
            .char.state-1 span::before, .char span::after { 
              content: attr(data-label); 
              position: absolute; 
              color: var(--white); 
              text-shadow: -1px 1px 2px var(--dark-blue); 
              left: 0; 
            }
            .char span::before { 
              opacity: 0; 
              transform: translateY(-100%); 
            }
            .char.state-2 { 
              position: absolute; 
              left: 80px; 
            }
            .char.state-2 span::after { 
              opacity: 1; 
            }
            .icon { 
              animation: resetArrow 0.8s cubic-bezier(0.7, -0.5, 0.3, 1.2) forwards; 
              z-index: 10; 
            }
            .icon div, .icon div::before, .icon div::after { 
              height: 3px; 
              border-radius: 1px; 
              background-color: var(--white); 
            }
            .icon div::before, .icon div::after { 
              content: ""; 
              position: absolute; 
              right: 0; 
              transform-origin: center right; 
              width: 14px; 
              border-radius: 15px; 
              transition: all 0.3s ease; 
            }
            .icon div { 
              position: relative; 
              width: 24px; 
              box-shadow: -2px 2px 5px var(--mid-blue); 
              transform: scale(0.9); 
              background: linear-gradient(to bottom, var(--white), var(--gold-100)); 
              animation: swingArrow 1s ease-in-out infinite; 
              animation-play-state: paused; 
            }
            .icon div::before { 
              transform: rotate(44deg); 
              top: 1px; 
              box-shadow: 1px -2px 3px -1px var(--mid-blue); 
              animation: rotateArrowLine 1s linear infinite; 
              animation-play-state: paused; 
            }
            .icon div::after { 
              bottom: 1px; 
              transform: rotate(316deg); 
              box-shadow: -2px 2px 3px 0 var(--mid-blue); 
              background: linear-gradient(200deg, var(--white), var(--gold-100)); 
              animation: rotateArrowLine2 1s linear infinite; 
              animation-play-state: paused; 
            }
            .path { 
              position: absolute; 
              z-index: 12; 
              bottom: 0; 
              left: 0; 
              right: 0; 
              stroke-dasharray: 150 480; 
              stroke-dashoffset: 150; 
              pointer-events: none; 
            }
            .splash { 
              position: absolute; 
              top: 0; 
              left: 0; 
              pointer-events: none; 
              stroke-dasharray: 60 60; 
              stroke-dashoffset: 60; 
              transform: translate(-17%, -31%); 
              stroke: var(--gold-300); 
            }
            .join-now-button:hover .words { 
              opacity: 1; 
            }
            .join-now-button:hover .words span { 
              animation-play-state: running; 
            }
            .join-now-button:hover .char.state-1 span::before { 
              animation: charAppear 0.7s ease calc(var(--i) * 0.03s); 
            }
            .join-now-button:hover .char.state-1 span::after { 
              opacity: 1; 
              animation: charDisappear 0.7s ease calc(var(--i) * 0.03s); 
            }
            .join-now-button:hover .wrap { 
              transform: translate(8px, -8px) scale(1.05);
              box-shadow: 0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2);
            }
            .join-now-button:hover .outline { 
              opacity: 1; 
            }
            .join-now-button:hover .outline::before, 
            .join-now-button:hover .icon div::before, 
            .join-now-button:hover .icon div::after, 
            .join-now-button:hover .icon div { 
              animation-play-state: running; 
            }
            .join-now-button:active .bg::before { 
              filter: blur(5px); 
              opacity: 0.7; 
              box-shadow: -7px 6px 0 0 rgba(221, 168, 83, 0.4), -14px 12px 0 0 rgba(221, 168, 83, 0.25), -21px 18px 4px 0 rgba(221, 168, 83, 0.15); 
            }
            .join-now-button:active .content { 
              box-shadow: inset -1px 12px 8px -5px rgba(39, 84, 138, 0.4), inset 0px -3px 8px 0px var(--gold-200); 
            }
            .join-now-button:active .words, 
            .join-now-button:active .outline { 
              opacity: 0; 
            }
            .join-now-button:active .wrap { 
              transform: translate(3px, -3px) scale(0.98);
            }
            .join-now-button:active .splash { 
              animation: splash 0.8s cubic-bezier(0.3, 0, 0, 1) forwards 0.05s; 
            }
            .join-now-button:focus .path { 
              animation: path 1.6s ease forwards 0.2s; 
            }
            .join-now-button:focus .icon { 
              animation: arrow 1s cubic-bezier(0.7, -0.5, 0.3, 1.5) forwards; 
            }
            .char.state-2 span::after, 
            .join-now-button:focus .char.state-1 span { 
              animation: charDisappear 0.5s ease forwards calc(var(--i) * 0.03s); 
            }
            .join-now-button:focus .char.state-2 span::after { 
              animation: charAppear 1s ease backwards calc(var(--i) * 0.03s); 
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
            @keyframes charAppear { 
              0% { transform: translateY(50%); opacity: 0; filter: blur(20px); } 
              20% { transform: translateY(70%); opacity: 1; } 
              50% { transform: translateY(-15%); opacity: 1; filter: blur(0); } 
              100% { transform: translateY(0); opacity: 1; } 
            }
            @keyframes charDisappear { 
              0% { transform: translateY(0); opacity: 1; } 
              100% { transform: translateY(-70%); opacity: 0; filter: blur(3px); } 
            }
            @keyframes arrow { 
              0% { opacity: 1; } 
              50% { transform: translateX(60px); opacity: 0; } 
              51% { transform: translateX(-200px); opacity: 0; } 
              100% { transform: translateX(-128px); opacity: 1; } 
            }
            @keyframes swingArrow { 
              50% { transform: translateX(5px) scale(0.9); } 
            }
            @keyframes rotateArrowLine { 
              50% { transform: rotate(30deg); } 
              80% { transform: rotate(55deg); } 
            }
            @keyframes rotateArrowLine2 { 
              50% { transform: rotate(330deg); } 
              80% { transform: rotate(300deg); } 
            }
            @keyframes resetArrow { 
              0% { transform: translateX(-128px); } 
              100% { transform: translateX(0); } 
            }
            @keyframes path { 
              from { stroke: var(--white); } 
              to { stroke-dashoffset: -480; stroke: #DDA853; } 
            }
            @keyframes splash { 
              to { stroke-dasharray: 2 60; stroke-dashoffset: -60; } 
            }
            .modal-overlay { 
              position: fixed; 
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              z-index: 1000; 
            }
            .modal-wrapper {
              width: 420px;
              background: rgb(2, 0, 36);
              background: linear-gradient(90deg, rgba(2, 0, 36, 1) 9%, rgba(9, 9, 121, 1) 68%, rgba(0, 91, 255, 1) 97%);
              backdrop-filter: blur(9px);
              color: #fff;
              border-radius: 12px;
              padding: 30px 40px;
              position: relative;
            }
            .modal-title {
              font-size: 36px;
              text-align: center;
              margin-bottom: 30px;
            }
            .modal-wrapper .btn {
              width: 100%;
              height: 45px;
              background: #fff;
              border: none;
              outline: none;
              border-radius: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              cursor: pointer;
              font-size: 16px;
              color: #333;
              font-weight: 600;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
              transform: translateY(0);
            }
            .modal-wrapper .btn:hover {
              background: #DDA853;
              color: #183B4E;
              transform: translateY(-3px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .modal-wrapper .btn:active {
              transform: translateY(1px);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .modal-wrapper .register-link {
              font-size: 14.5px;
              text-align: center;
              margin: 20px 0 15px;
            }
            .modal-wrapper .register-link p a {
              color: #fff;
              text-decoration: none;
              font-weight: 600;
            }
            .modal-wrapper .register-link p a:hover {
              text-decoration: underline;
            }
            .modal-close { 
              position: absolute; 
              top: 15px; 
              right: 15px; 
              background: none; 
              border: none; 
              color: #fff; 
              font-size: 1.5rem; 
              cursor: pointer; 
            }
            .wallet-button img { 
              width: 24px; 
              height: 24px; 
            }
            .status-message-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-top: 10px;
              padding: 8px 16px;
              background: rgba(221, 168, 83, 0.1);
              border-left: 3px solid #DDA853;
              border-radius: 4px;
              animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .status-message {
              margin-top: 0;
              text-align: left;
              color: #fff;
              font-size: 14px;
            }
            .register-modal-wrapper {
              width: 420px;
              background: #183B4E;
              color: #F3F3E0;
              border-radius: 12px;
              padding: 30px 40px;
              position: relative;
              text-align: center;
            }
            .register-modal-wrapper h3 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .register-modal-wrapper p {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .register-modal-wrapper button {
              background: #DDA853;
              border: none;
              border-radius: 40px;
              padding: 10px 20px;
              color: #183B4E;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
              transform: translateY(0);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .register-modal-wrapper button:hover {
              background: #FFC107;
              color: #fff;
              transform: translateY(-3px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .register-modal-wrapper button:active {
              transform: translateY(1px);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .referral-input {
              width: 100%;
              height: 45px;
              background: #fff;
              border: none;
              outline: none;
              borderRadius: 40px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 0 15px;
              font-size: 16px;
              color: #333;
              margin-bottom: 15px;
            }
            .referral-input::placeholder {
              color: #999;
            }
            @media (max-width: 768px) {
              .header-container {
                width: 100vw;
                box-sizing: border-box;
                flex-direction: column;
                align-items: stretch;
                padding: 12px 8px;
              }
              .header-row {
                flex-direction: column;
                gap: 16px;
                width: 100%;
                align-items: stretch;
              }
              .gooey-nav {
                display: ${isNavOpen ? 'flex' : 'none'};
                flex-direction: column;
                position: absolute;
                top: 80px;
                right: 0;
                background: rgba(24,59,78,0.9);
                width: 100%;
                box-shadow: 0 4px 30px rgba(0,0,0,0.1);
                border-top: 1px solid rgba(221,168,83,0.2);
                padding-bottom: 20px;
                align-items: center;
              }
              .gooey-nav-items {
                flex-direction: column;
                width: 80%;
                margin-top: 20px;
              }
              .gooey-nav-item {
                width: 100%;
                text-align: center;
              }
              .join-now-button {
                display: flex;
                width: 100%;
                max-width: 100vw;
                box-sizing: border-box;
                justify-content: center;
                align-items: center;
                margin: 16px 0 0 0;
                font-size: 1.1rem;
                padding: 14px 0;
                border-radius: 16px;
                box-shadow: none;
              }
            }
            .hamburger-menu {
              display: none;
              background: none;
              border: none;
              cursor: pointer;
              padding: 10px;
              position: relative;
              z-index: 60;
            }
            @media (max-width: 768px) {
              .hamburger-menu {
                display: block;
              }
            }
            .hamburger-icon {
              width: 25px;
              height: 3px;
              background-color: #F3F3E0;
              margin: 5px 0;
              transition: 0.4s;
            }
            .hamburger-menu.open .hamburger-icon:nth-child(1) {
              transform: rotate(-45deg) translate(-5px, 6px);
            }
            .hamburger-menu.open .hamburger-icon:nth-child(2) {
              opacity: 0;
            }
            .hamburger-menu.open .hamburger-icon:nth-child(3) {
              transform: rotate(45deg) translate(-5px, -6px);
            }
          `}
        </style>
        <div className="header-container">
          <div className="logo-title-container">
            <img src={logo} alt="Mynncrypt Logo" className="logo-img" />
            <span className="header-title">Mynncrypt Community</span>
          </div>
          <div className="header-row">
            <GooeyNav 
              items={navItems}
              initialActiveIndex={0}
              colors={{
                background: 'rgba(24,59,78,0.9)',
                active: '#DDA853',
                text: '#F3F3E0'
              }}
              onNavLinkClick={() => setIsNavOpen(false)}
              onJoinNowClick={handleJoinClick}
            />
            <button className={`hamburger-menu ${isNavOpen ? 'open' : ''}`} onClick={() => setIsNavOpen(!isNavOpen)}>
              <div className="hamburger-icon"></div>
              <div className="hamburger-icon"></div>
              <div className="hamburger-icon"></div>
            </button>
          </div>
          {registerStatus && (
        <div className="status-message-container">
          <p className="status-message">{registerStatus}</p>
          <LoadingSpinner message="" size="small" />
        </div>
      )}
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 className="modal-title">{isConnected ? 'Masukkan Referral Link' : 'Connect Wallet'}</h3>
            {isConnected ? (
              <>
                <input
                  type="text"
                  className="referral-input"
                  placeholder="Masukkan Referral Link (opsional)"
                  value={referralId}
                  onChange={(e) => setReferralId(e.target.value)}
                />
                {isRegistering || isWritePending || isConfirming ? (
                  <div className="w-full">
                    <LoadingSpinner 
                      message={isConfirming ? 'Menunggu konfirmasi transaksi...' : 'Memproses registrasi...'} 
                      size="medium" 
                    />
                  </div>
                ) : (
                  <button
                    className="btn"
                    onClick={handleJoinClick}
                    disabled={isRegistering || isWritePending || isConfirming}
                  >
                    Lanjutkan Registrasi
                  </button>
                )}
              </>
            ) : (
              <>
                <p>Harap hubungkan wallet Anda untuk melanjutkan.</p>
                <button
                  className="btn wallet-button"
                  onClick={() => handleConnect(injected())}
                  disabled={isRegistering}
                >
                  <img src={metamaskLogo} alt="MetaMask Logo" />
                  Connect MetaMask/Trust Wallet
                </button>
                <button
                  className="btn wallet-button"
                  onClick={() => handleConnect(walletConnect())}
                  disabled={isRegistering}
                >
                  <img src={trustwalletLogo} alt="Trust Wallet Logo" />
                  Connect Trust Wallet
                </button>
                <div className="register-link">
                  <p>
                    Tidak punya wallet?{' '}
                    <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                      Pelajari cara membuatnya
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="register-modal-wrapper">
            <h3>{isSuccess ? 'Registrasi Berhasil' : 'Registrasi Gagal'}</h3>
            <p>{registerMessage}</p>
            {isRegistering && <p>Memproses...</p>}
            <button
              onClick={() => {
                setShowRegisterModal(false);
                if (isSuccess) navigate('/dashboard');
              }}
              disabled={isRegistering}
            >
              {isSuccess ? 'Ke Dashboard' : 'Tutup'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}