import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Register({ mynncryptConfig }) {
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [referralId, setReferralId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isMobileMetaMask, setIsMobileMetaMask] = useState(false);
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, error: connectError } = useConnect();

  // Detect if MetaMask is running on mobile
  useEffect(() => {
    const detectMobileMetaMask = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isMetaMaskBrowser = window.ethereum?.isMetaMask === true;
      setIsMobileMetaMask(isMobile && isMetaMaskBrowser);
      console.log('Register.jsx - Mobile detection:', { isMobile, isMetaMaskBrowser });
    };
    
    detectMobileMetaMask();
  }, []);
  
  const { 
    writeContract: register, 
    data: hash,
    error: writeError,
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
    error: receiptError,
    data: receipt
  } = useWaitForTransactionReceipt({ 
    hash,
  });

  // Parse referral ID dari URL untuk metode otomatis
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    console.log('Query ref:', ref); // Debug: Pastikan ref terbaca
    if (ref && /^[A-Z][0-9]{4}(WR|NR)$/.test(ref)) {
      setReferralId(ref);
      setShowModal(true); // Buka modal otomatis
    } else if (ref) {
      setRegisterMessage('Referral ID tidak valid. Harus berformat [A-Z][0-9]{4}(WR|NR).');
      setIsSuccess(false);
      setShowRegisterModal(true);
    }
  }, [location]);

  // Redirect ke dashboard jika sudah terdaftar
  useEffect(() => {
    // Jangan redirect jika ada error reading userId
    if (userIdError) {
      console.warn('Register.jsx - Error reading userId, not redirecting:', userIdError);
      return;
    }

    // Redirect jika sudah registered
    if (isConnected && userId && typeof userId === 'string' && userId.length > 0) {
      console.log('Register.jsx - User sudah terdaftar, redirect ke dashboard:', userId);
      navigate('/dashboard');
    }
  }, [isConnected, userId, userIdError, navigate]);

  // Debug status koneksi wallet
  useEffect(() => {
    console.log('Wallet Status:', { isConnected, isConnecting, isDisconnected, address });
    if (connectError) {
      console.error('Connect Error:', connectError);
    }
  }, [isConnected, isConnecting, isDisconnected, address, connectError]);

  // Memoize sendToBackend to prevent re-creation on every render
  const sendToBackend = useCallback(async (userId) => {
    if (!email || !phone) return; // Tidak kirim jika kosong
    try {
      const response = await fetch('http://localhost:5000/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          email,
          phone,
          referralId,
          userId,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setRegisterMessage('Gagal simpan data ke database: ' + data.message);
        setIsSuccess(false);
        setShowRegisterModal(true);
      }
    } catch (err) {
      setRegisterMessage('Gagal koneksi ke backend: ' + err.message);
      setIsSuccess(false);
      setShowRegisterModal(true);
    }
  }, [address, email, phone, referralId]);

  // Memoize handleRegisterSuccess to prevent re-creation on every render
  const handleRegisterSuccess = useCallback((userId) => {
    const hasReferral = userId.includes('WR');
    setRegisterMessage(`Registrasi berhasil! ID Anda: ${userId}${hasReferral ? ' (Daftar dengan referral)' : ' (Tanpa referral)'}`);
    setIsSuccess(true);
    setShowRegisterModal(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  }, [navigate]);

  // Handle registration errors
  const handleRegisterError = useCallback((error) => {
    console.error('Registration error:', error);
    const errorMsg = error?.shortMessage || error?.message || 'Unknown error';
    setRegisterMessage(`Registrasi gagal: ${errorMsg}`);
    setIsSuccess(false);
    setShowRegisterModal(true);
  }, []);

  // Efek untuk menangani hasil transaksi
  useEffect(() => {
    const handleRegistrationResult = async () => {
      if (isConfirmed && receipt) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: newUserId } = await refetchUserId();

          if (newUserId && newUserId.length > 0) {
            handleRegisterSuccess(newUserId);
            await sendToBackend(newUserId);
          } else {
            throw new Error('Failed to fetch new user ID');
          }
        } catch (error) {
          handleRegisterError(error);
        } finally {
          setIsRegistering(false);
        }
      }
    };

    if (isConfirmed) {
      handleRegistrationResult();
    }
  }, [isConfirmed, receipt, refetchUserId, handleRegisterSuccess, sendToBackend, handleRegisterError]);

  // Efek untuk menangani error
  useEffect(() => {
    if (writeError || receiptError || userIdError) {
      handleRegisterError(writeError || receiptError || userIdError);
      setIsRegistering(false);
    }
  }, [writeError, receiptError, userIdError, handleRegisterError]);

  const handleJoinClick = async () => {
    if (!isConnected) {
      setShowModal(true);
      return;
    }

    if (userIdLoading) {
      setRegisterStatus('Memeriksa status registrasi...');
      return;
    }

    if (userId && userId.length > 0) {
      setRegisterStatus('Anda sudah terdaftar. Mengarahkan ke dashboard...');
      navigate('/dashboard');
      return;
    }

    // Validasi referral ID
    let finalReferralId = 'A8888NR';
    if (referralId) {
      const parsedRef = referralId.includes('ref=') 
        ? new URLSearchParams(referralId.split('?')[1]).get('ref') 
        : referralId;
      
      if (!/^[A-Z][0-9]{4}(WR|NR)$/.test(parsedRef)) {
        setRegisterMessage('Referral ID tidak valid. Harus berformat [A-Z][0-9]{4}(WR|NR).');
        setIsSuccess(false);
        setShowRegisterModal(true);
        setIsRegistering(false);
        return;
      }

      if (referralLoading) {
        setRegisterStatus('Memeriksa referral ID...');
        return;
      }
      if (referralError || !referralAddress) {
        setRegisterMessage('Referral ID tidak ditemukan di kontrak.');
        setIsSuccess(false);
        setShowRegisterModal(true);
        setIsRegistering(false);
        return;
      }
      finalReferralId = parsedRef;
    }

    setIsRegistering(true);
    setRegisterStatus('Memproses registrasi...');

    try {
      await register({
        address: mynncryptConfig.address,
        abi: mynncryptConfig.abi,
        functionName: 'register',
        args: [finalReferralId, address],
        value: BigInt(4.4e15), // Biaya registrasi level 1 (0.0044 ETH)
      });

      setRegisterStatus('Menunggu konfirmasi transaksi...');
    } catch (error) {
      handleRegisterError(error);
      setIsRegistering(false);
    }
  };

  const handleConnect = (connector) => {
    console.log('Register.jsx - Attempting to connect with:', connector.id, 'isMobileMetaMask:', isMobileMetaMask);
    connect({ connector }, {
      onSuccess: () => {
        console.log('Register.jsx - Connection successful');
        setShowModal(true); // Buka modal lagi setelah koneksi berhasil
      },
      onError: (error) => {
        console.error('Register.jsx - Connect error:', error.message);
        // For MetaMask mobile browser, provide better error message
        if (isMobileMetaMask && error.message?.includes('ethereum')) {
          alert('MetaMask tidak terdeteksi. Pastikan Anda membuka app ini di browser dalam MetaMask.');
        } else {
          alert('Gagal menghubungkan wallet: ' + error.message);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Registrasi</h1>
        {!isConnected && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-2"
            onClick={() => setShowModal(true)}
          >
            Hubungkan Wallet
          </button>
        )}
        {isConnected && !userId && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => setShowModal(true)}
            disabled={isRegistering || isWritePending || isConfirming}
          >
            Daftar Sekarang
          </button>
        )}
        {userId && (
          <p className="text-green-400">
            Anda sudah terdaftar dengan ID: {userId}.{' '}
            <button className="text-blue-400 underline" onClick={() => navigate('/dashboard')}>
              Ke Dashboard
            </button>
          </p>
        )}
        {registerStatus && <p className="mt-2 text-center">{registerStatus}</p>}

        {showModal && (
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
              className="modal-wrapper"
              style={{
                width: '420px',
                background: '#183B4E',
                color: '#F3F3E0',
                borderRadius: '12px',
                padding: '30px 40px',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <button
                className="modal-close"
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
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h3 className="modal-title" style={{ fontSize: '24px', marginBottom: '20px' }}>
                {isConnected ? 'Masukkan Referral ID' : 'Connect Wallet'}
              </h3>
              {isConnected ? (
                <>
                  <label htmlFor="email" style={{ display: 'block', color: '#F5C45E', fontWeight: 600, marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
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
                      marginBottom: '7px',
                    }}
                  />
                  <label htmlFor="phone" style={{ display: 'block', color: '#F5C45E', fontWeight: 600, marginBottom: 6 }}>
                    No Telepon
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="No Telepon"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
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
                      marginBottom: '7px',
                    }}
                  />
                  <label htmlFor="referralId" style={{ display: 'block', color: '#F5C45E', fontWeight: 600, marginBottom: 6 }}>
                    Kode Referral (opsional)
                  </label>
                  <input
                    id="referralId"
                    type="text"
                    placeholder="Referral ID (opsional)"
                    value={referralId}
                    onChange={e => setReferralId(e.target.value)}
                    disabled={referralId !== '' && /^[A-Z][0-9]{4}(WR|NR)$/.test(referralId)} // Disable jika sudah dari referral link
                    style={{
                      width: '100%',
                      height: '45px',
                      background: referralId !== '' && /^[A-Z][0-9]{4}(WR|NR)$/.test(referralId) ? '#f0f0f0' : '#fff',
                      border: 'none',
                      outline: 'none',
                      borderRadius: '40px',
                      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                      padding: '0 15px',
                      fontSize: '16px',
                      color: referralId !== '' && /^[A-Z][0-9]{4}(WR|NR)$/.test(referralId) ? '#999' : '#333',
                      cursor: referralId !== '' && /^[A-Z][0-9]{4}(WR|NR)$/.test(referralId) ? 'not-allowed' : 'text',
                      marginBottom: '7px',
                    }}
                  />
                  <div style={{ fontSize: '13px', color: '#bdbdbd', marginBottom: '10px' }}>
                    {referralId !== '' && /^[A-Z][0-9]{4}(WR|NR)$/.test(referralId) 
                      ? '✓ Referral dari link (tidak dapat diubah)' 
                      : 'Dapatkan kode referral dari teman Anda, atau kosongkan jika tidak ada.'}
                  </div>
                  <button
                    className="btn"
                    onClick={handleJoinClick}
                    disabled={isRegistering || isWritePending || isConfirming}
                    style={{
                      width: '100%',
                      height: '45px',
                      background: '#DDA853',
                      border: 'none',
                      outline: 'none',
                      borderRadius: '40px',
                      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#183B4E',
                      fontWeight: '600',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    {isRegistering || isWritePending || isConfirming ? 'Memproses...' : 'Lanjutkan Registrasi'}
                  </button>
                </>
              ) : (
                <>
                  <p>Harap hubungkan wallet Anda untuk melanjutkan.</p>
                  {isMobileMetaMask && (
                    <p style={{ fontSize: '14px', color: '#FFD700', marginBottom: '15px', textAlign: 'center' }}>
                      ✅ MetaMask terdeteksi di browser Anda
                    </p>
                  )}
                  <button
                    className="btn wallet-button"
                    onClick={() => handleConnect(injected())}
                    disabled={isRegistering}
                    style={{
                      width: '100%',
                      height: '45px',
                      background: '#fff',
                      border: 'none',
                      outline: 'none',
                      borderRadius: '40px',
                      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#333',
                      fontWeight: '600',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask Logo"
                      style={{ width: '24px', height: '24px' }}
                    />
                    Connect MetaMask
                  </button>
                  {!isMobileMetaMask && (
                    <button
                      className="btn wallet-button"
                      onClick={() => handleConnect(walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' }))}
                      disabled={isRegistering}
                      style={{
                        width: '100%',
                        height: '45px',
                        background: '#fff',
                        border: 'none',
                        outline: 'none',
                        borderRadius: '40px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                      }}
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d9/OP_logo.svg"
                        alt="WalletConnect Logo"
                        style={{ width: '24px', height: '24px' }}
                      />
                      Connect via WalletConnect
                    </button>
                  )}
                  <div className="register-link" style={{ fontSize: '14.5px', textAlign: 'center', margin: '20px 0 15px' }}>
                    <p>
                      Tidak punya wallet?{' '}
                      <a
                        href="https://metamask.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontWeight: '600' }}
                      >
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
              className="register-modal-wrapper"
              style={{
                width: '420px',
                background: '#183B4E',
                color: '#F3F3E0',
                borderRadius: '12px',
                padding: '30px 40px',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>
                {isSuccess ? 'Registrasi Berhasil' : 'Registrasi Gagal'}
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>{registerMessage}</p>
              {isRegistering && <p style={{ fontSize: '16px' }}>Memproses...</p>}
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  if (isSuccess) navigate('/dashboard');
                }}
                disabled={isRegistering}
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
              >
                {isSuccess ? 'Ke Dashboard' : 'Tutup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}