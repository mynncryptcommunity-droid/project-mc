import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { useNavigate } from 'react-router-dom';
import metamaskLogo from '../assets/metamask-logo.svg';
import walletconnectLogo from '../assets/walletconnect-logo.png';
import Tooltip from './Tooltip';
import { createTooltipProps } from '../config/tooltipsConfig';
// Import images for slideshow
import bnbCoinImage from '../assets/bnb_coin.png';
import blockchainImage from '../assets/blockchain.jpg';
import defiImage from '../assets/defi.jpg';

// Database integration will be added later

export default function Hero({ mynncryptConfig }) {
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [referralId, setReferralId] = useState('');
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { 
    writeContract: register, 
    data: hash,
    isPending: isWritePending
  } = useWriteContract();
  const navigate = useNavigate();

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of images for slideshow
  const slides = [
    bnbCoinImage,
    blockchainImage,
    defiImage
  ];

  // Effect for automatic slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [slides.length]);

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

  // Debug status koneksi wallet
  useEffect(() => {
    console.log('Hero.jsx - Wallet Status:', { isConnected, isConnecting, address, connectError });
    if (window.ethereum) {
      console.log('Hero.jsx - window.ethereum detected');
    } else {
      console.log('Hero.jsx - window.ethereum NOT detected');
    }
  }, [isConnected, isConnecting, address, connectError]);

  const handleRegisterSuccess = useCallback((userId) => {
    const hasReferral = userId.includes('WR');
    setRegisterMessage(`Registrasi berhasil! ID Anda: ${userId}${hasReferral ? ' (Daftar dengan referral)' : ' (Tanpa referral)'}`);
    setIsSuccess(true);
    setShowRegisterModal(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  }, [navigate]);

  const handleRegisterError = useCallback((error) => {
    console.error('Hero.jsx - Registration error:', error);
    const errorMsg = error?.shortMessage || error?.message || 'Unknown error';
    setRegisterMessage(`Registrasi gagal: ${errorMsg}`);
    setIsSuccess(false);
    setShowRegisterModal(true);
    setIsRegistering(false);
  }, []);

  const handleRegistrationResult = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data: newUserId } = await refetchUserId();
      if (newUserId && newUserId.length > 0) {
        handleRegisterSuccess(newUserId);
      } else {
        throw new Error('Failed to fetch new user ID');
      }
    } catch (error) {
      handleRegisterError(error);
    } finally {
      setIsRegistering(false);
    }
  }, [refetchUserId, handleRegisterSuccess, handleRegisterError]);

  useEffect(() => {
    if (isConfirmed && receipt) {
      handleRegistrationResult();
    }
  }, [isConfirmed, receipt, handleRegistrationResult]);

  const handleJoinClick = async () => {
    console.log('🔵 Hero.jsx - handleJoinClick CALLED');
    console.log('🔵 Hero.jsx - isConnected:', isConnected);
    
    if (!isConnected) {
      console.log('🔵 Hero.jsx - Wallet not connected, opening modal');
      setShowModal(true);
      return;
    }

    console.log('🔵 Hero.jsx - Wallet connected, checking registration status...');
    console.log('🔵 Hero.jsx - userIdLoading:', userIdLoading);
    console.log('🔵 Hero.jsx - userIdError:', userIdError);
    console.log('🔵 Hero.jsx - userId:', userId);
    
    // Jika userId sudah loaded dan user sudah registered
    if (!userIdLoading && !userIdError && userId && typeof userId === 'string' && userId.length > 0) {
      console.log('🔵 Hero.jsx - User already registered, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    // Jika masih loading atau ada error atau belum registered, buka modal wallet
    console.log('🔵 Hero.jsx - Opening wallet modal');
    setShowModal(true);
  };

  const handleConnect = (connector) => {
    console.log('Hero.jsx - Attempting to connect with:', connector.id);
    const connectorToUse = connector === walletConnect
      ? walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '46ff419a446c6d1f3e3e11d0410c9920' })
      : connector;
    connect({ connector: connectorToUse }, {
      onSuccess: () => {
        console.log('Hero.jsx - Connection successful');
        setShowModal(true);
      },
      onError: (error) => {
        console.error('Hero.jsx - Connect error:', error.message);
        alert('Gagal menghubungkan wallet: ' + (error.message || 'Wallet tidak terdeteksi. Pastikan MetaMask atau Trust Wallet terinstal.'));
      },
    });
  };


  return (
    <section className="bg-sfc-dark-blue text-sfc-cream py-20">
      <div className="container mx-auto px-4">
        {/* Side-by-side layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text content on the left */}
          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-6">
              <h1 className="hero-title mb-0">
                Welcome to Mynncrypt Community: 
                <span className="gradient-text">The Future of Your Decentralized Finance</span>
              </h1>
              <Tooltip {...createTooltipProps('smartContract', 'bottom', '🔐')} />
            </div>
            <p className="hero-subtitle mb-8">
              Are you ready to be part of the true financial revolution? 
              Mynncrypt Community is not just another DApp, it's an ecosystem 
              built on the foundation of transparent & seamless Smart Contracts. 
              Forget concerns about system integrity. Here, trust is guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                className="animated-button"
                onClick={() => navigate('/how-it-works')}
              >
                <span className="circle"></span>
                <span className="text">Learn More</span>
                <svg className="arr-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <svg className="arr-2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button 
                className="animated-button join-now-hero-button"
                onClick={handleJoinClick}
              >
                <span className="circle"></span>
                <span className="text">Join Now</span>
                <svg className="arr-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <svg className="arr-2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button 
                className="animated-button faq-button"
                onClick={() => navigate('/faq')}
                title="View Anti-Scam FAQ"
              >
                <span className="circle"></span>
                <span className="text">➡️ Anti-Scam FAQ</span>
                <svg className="arr-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <svg className="arr-2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
          
          {/* Slideshow on the right */}
          <div className="lg:w-1/2 w-full">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-[#F5C45E] h-[400px]">
              {/* Slideshow container with fade transition */}
              <div className="absolute inset-0">
                {slides.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={slide} 
                      alt={`Slide ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-[#F5C45E]' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition z-10"
                aria-label="Previous slide"
              >
                &#8249;
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition z-10"
                aria-label="Next slide"
              >
                &#8250;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section mt-20 pt-20 border-t border-sfc-gold/30">
        <h2 className="text-4xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Team Income</h3>
            <p>Earn passive income from your direct referrals and downline members</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Mynngift Program</h3>
            <p>Participate in our exclusive rewards program and earn additional benefits through gifts and donations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Sponsor Income</h3>
            <p>Earn additional rewards by sponsoring new members and expanding your network reach</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-Time Dashboard</h3>
            <p>Monitor your earnings, team growth, and performance in real-time</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section mt-20 pt-20 border-t border-sfc-gold/30">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Connect Wallet</h3>
            <p>Connect your MetaMask or Trust Wallet to get started</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Register Account</h3>
            <p>Complete your registration with a referral code if you have one</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Build Your Team</h3>
            <p>Share your unique referral link and invite others to join</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Earn Income</h3>
            <p>Start earning passive income from your team's activities</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section mt-20 pt-20 border-t border-sfc-gold/30 pb-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why Join Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="benefit-card">
            <div className="benefit-icon">💸</div>
            <h3>Passive Income</h3>
            <p>Earn recurring income from your team members without active work. Let your network work for you.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Join a thriving community with mentorship, training, and support from experienced members.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⛓️</div>
            <h3>Blockchain Security</h3>
            <p>Transparent and secure transactions on blockchain. All data is immutable and verifiable.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 className="modal-title">Connect Your Wallet</h3>
            <p className="modal-subtitle">Choose your preferred wallet to get started</p>
            <button
              className="btn wallet-button"
              onClick={() => handleConnect(injected())}
              disabled={isRegistering}
            >
              <img src={metamaskLogo} alt="MetaMask Logo" />
              <span>
                <strong>MetaMask</strong>
                <small>Most popular wallet</small>
              </span>
            </button>
            <button
              className="btn wallet-button"
              onClick={() => handleConnect(walletConnect())}
              disabled={isRegistering}
            >
              <img src={walletconnectLogo} alt="WalletConnect Logo" />
              <span>
                <strong>WalletConnect</strong>
                <small>Multi-chain support</small>
              </span>
            </button>
            <div className="register-link">
              <p>
                Don't have a wallet?{' '}
                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                  Learn how to create one
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="register-modal-wrapper">
            <h3>{isSuccess ? 'Registration Successful' : 'Registration Failed'}</h3>
            <p>{registerMessage}</p>
            {isRegistering && <p>Processing...</p>}
            <button
              onClick={() => {
                setShowRegisterModal(false);
                if (isSuccess) navigate('/dashboard');
              }}
              disabled={isRegistering}
            >
              {isSuccess ? 'Go to Dashboard' : 'Close'}
            </button>
          </div>
        </div>
      )}
      <style>{`
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s ease forwards;
        }
        .gradient-text {
          background: linear-gradient(135deg, #DDA853, #F3F3E0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: block;
          margin-top: 0.5rem;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.8;
          color: rgba(243, 243, 224, 0.9);
          max-width: 800px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s ease forwards 0.3s;
        }
        .animated-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 16px 36px;
          border: 4px solid;
          border-color: #3399CC;
          font-size: 16px;
          background-color: transparent;
          border-radius: 100px;
          font-weight: 600;
          color: #3399CC;
          box-shadow: 0 4px 6px rgba(51, 153, 204, 0.15);
          cursor: pointer;
          overflow: visible;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          opacity: 1;
          transform: none;
          animation: fadeInUp 1s ease forwards;
        }
        .animated-button svg {
          position: absolute;
          width: 24px;
          fill: #3399CC;
          z-index: 9;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animated-button .arr-1 {
          right: 16px;
        }
        .animated-button .arr-2 {
          left: -25%;
        }
        .animated-button .circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background-color: #3399CC;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animated-button .text {
          position: relative;
          z-index: 1;
          transform: translateX(-12px);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animated-button:hover {
          box-shadow: 0 10px 24px rgba(51, 153, 204, 0.3);
          background: #3399CC;
          color: #F3F3E0;
          border-radius: 12px;
          transform: translateY(-3px);
        }
        .animated-button:hover .arr-1 {
          right: -25%;
        }
        .animated-button:hover .arr-2 {
          left: 16px;
        }
        .animated-button:hover .text {
          transform: translateX(12px);
        }
        .animated-button:hover svg {
          fill: #F3F3E0;
        }
        .animated-button:active {
          scale: 0.95;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(1px);
        }
        .animated-button:hover .circle {
          width: 220px;
          height: 220px;
          opacity: 1;
        }
        .join-now-hero-button {
          background: linear-gradient(135deg, #FFD700 0%, #FFC700 50%, #F5C45E 100%);
          color: #183B4E;
          border: 3px solid #FFE082;
          margin-left: 0;
          box-shadow: 
            0 0 30px rgba(245, 196, 94, 0.6),
            0 0 60px rgba(255, 215, 0, 0.3),
            0 12px 24px rgba(0, 0, 0, 0.25);
          font-weight: 700;
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          opacity: 1;
          transform: none;
        }
        .join-now-hero-button::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700);
          border-radius: 100px;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s ease;
          animation: none;
        }
        .join-now-hero-button:hover {
          background: linear-gradient(135deg, #FFD700 0%, #FFF9C4 50%, #FFE082 100%);
          color: #1a1a2e;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 
            0 0 30px rgba(221, 168, 83, 0.6),
            0 0 60px rgba(255, 215, 0, 0.4),
            0 12px 24px rgba(0, 0, 0, 0.25);
          border-color: #FFEB3B;
        }
        .join-now-hero-button:hover::before {
          opacity: 0.3;
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        .join-now-hero-button:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 0 15px rgba(221, 168, 83, 0.4),
            0 0 30px rgba(255, 215, 0, 0.15),
            0 4px 8px rgba(0, 0, 0, 0.15);
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          }
        }
        .referral-input {
          width: 100%;
          height: 45px;
          background: #fff;
          border: none;
          outline: none;
          border-radius: 40px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 0 15px;
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
        }
        .referral-input::placeholder {
          color: #999;
        }
        
        /* Features Section Styles */
        .features-section {
          text-align: center;
        }
        .features-section h2 {
          color: #F3F3E0;
          margin-bottom: 3rem;
        }
        .feature-card {
          background: rgba(245, 196, 94, 0.1);
          border: 2px solid #F5C45E;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          color: #F3F3E0;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(245, 196, 94, 0.2);
          background: rgba(245, 196, 94, 0.15);
        }
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .feature-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #F5C45E;
        }
        .feature-card p {
          font-size: 0.95rem;
          color: rgba(243, 243, 224, 0.8);
          line-height: 1.6;
        }
        
        /* How It Works Section */
        .how-it-works-section {
          text-align: center;
        }
        .how-it-works-section h2 {
          color: #F3F3E0;
          margin-bottom: 3rem;
        }
        .step-card {
          background: rgba(221, 168, 83, 0.1);
          border: 2px solid #DDA853;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          color: #F3F3E0;
          position: relative;
        }
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(221, 168, 83, 0.2);
          background: rgba(221, 168, 83, 0.15);
        }
        .step-number {
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
          width: 3rem;
          height: 3rem;
          background: #DDA853;
          color: #1a1a2e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .step-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          color: #F5C45E;
        }
        .step-card p {
          font-size: 0.95rem;
          color: rgba(243, 243, 224, 0.8);
          line-height: 1.6;
        }
        
        /* Benefits Section */
        .benefits-section {
          text-align: center;
        }
        .benefits-section h2 {
          color: #F3F3E0;
          margin-bottom: 3rem;
        }
        .benefit-card {
          background: rgba(51, 153, 204, 0.1);
          border: 2px solid #3399CC;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          color: #F3F3E0;
        }
        .benefit-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(51, 153, 204, 0.2);
          background: rgba(51, 153, 204, 0.15);
        }
        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .benefit-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #3399CC;
        }
        .benefit-card p {
          font-size: 0.95rem;
          color: rgba(243, 243, 224, 0.8);
          line-height: 1.6;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          .hero-subtitle {
            font-size: 1.1rem;
          }
          .animated-button {
            padding: 12px 30px;
            font-size: 1.1rem;
          }
          .join-now-hero-button {
            padding: 12px 30px;
            font-size: 1.1rem;
          }
        }
        /* Fade transition for slideshow */
        .slide-transition {
          transition: opacity 1s ease-in-out;
        }
        
        /* Modal Styles */
        .modal-overlay { 
          position: fixed; 
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6); 
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
          font-size: 24px;
          text-align: center;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .modal-subtitle {
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
        .modal-wrapper .btn {
          width: 100%;
          height: 50px;
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
        .wallet-button {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 0 20px !important;
        }
        .wallet-button img {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
        .wallet-button span {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .wallet-button strong {
          font-weight: 700;
          font-size: 16px;
        }
        .wallet-button small {
          font-size: 12px;
          color: #666;
          font-weight: 400;
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
          font-size: 14px;
          text-align: center;
          margin: 20px 0 15px;
        }
        .modal-wrapper .register-link p a {
          color: #87CEEB;
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
          font-size: 24px; 
          cursor: pointer;
          font-weight: bold;
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
          margin-bottom: 15px;
          font-weight: 700;
        }
        .register-modal-wrapper p {
          margin: 10px 0;
          font-size: 14px;
          color: rgba(243, 243, 224, 0.9);
        }
        .register-modal-wrapper button {
          background: #DDA853;
          color: #183B4E;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 15px;
          transition: all 0.3s ease;
        }
        .register-modal-wrapper button:hover {
          background: #FFE082;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}