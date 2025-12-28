# CONTOH IMPLEMENTASI: Code Improvements

## 1. NETWORK DETECTOR COMPONENT (Fix Issue 1.1)

**File:** `mc_frontend/src/components/NetworkDetector.jsx`

```jsx
import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'react-toastify';

export function NetworkDetector() {
    const { chain, isConnected } = useAccount();
    const { switchNetwork, isPending } = useSwitchChain();

    const SUPPORTED_CHAINS = {
        1337: { name: 'Hardhat', isLocal: true },
        5611: { name: 'opBNB Testnet', isLocal: false },
        204: { name: 'opBNB Mainnet', isLocal: false },
    };

    const TARGET_CHAIN = 5611; // Default to testnet

    useEffect(() => {
        if (!isConnected) return;

        if (chain && !SUPPORTED_CHAINS[chain.id]) {
            // Wrong network detected
            toast.warning(
                `Wrong network detected: ${chain.name}. Switching to opBNB Testnet...`,
                { autoClose: 10000 }
            );

            // Auto-switch jika tidak di local development
            if (process.env.NODE_ENV === 'production') {
                switchNetwork(TARGET_CHAIN);
            }
        } else if (chain && process.env.NODE_ENV === 'development') {
            // Local development - prefer local chain
            if (chain.id !== 1337 && switchNetwork) {
                toast.info(`Connected to ${chain.name}. Prefer Hardhat Local for development.`);
            }
        }
    }, [chain, isConnected, switchNetwork]);

    return null; // Silent component - hanya handle logic
}
```

**Usage di App.jsx:**
```jsx
import { NetworkDetector } from './components/NetworkDetector';

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <NetworkDetector /> {/* Add ini setelah WagmiProvider */}
                <BrowserRouter>
                    {/* Rest of app */}
                </BrowserRouter>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
```

---

## 2. ENHANCED HEADER WITH LOADING STATES (Fix Issue 1.2)

**File:** `mc_frontend/src/components/Header.jsx` (partial update)

```jsx
// Tambahkan component Spinner
import { useEffect, useState } from 'react';

function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
            <span className="text-sm">{text}</span>
        </div>
    );
}

export default function Header({ mynncryptConfig }) {
    const { address, isConnected, isConnecting } = useAccount();
    const { 
        data: userId, 
        isLoading: userIdLoading, 
        error: userIdError 
    } = useReadContract({
        address: mynncryptConfig.address,
        abi: mynncryptConfig.abi,
        functionName: 'id',
        args: [address],
        enabled: isConnected && !!address,
    });

    const navigate = useNavigate();

    // IMPROVED: Show loading state
    if (isConnected && userIdLoading) {
        return (
            <header className="bg-[#102E50] shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <img src={logo} alt="Logo" className="w-10 h-10" />
                    <LoadingSpinner text="Checking registration..." />
                </div>
            </header>
        );
    }

    // IMPROVED: Show error state
    if (userIdError) {
        return (
            <header className="bg-[#102E50] shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <img src={logo} alt="Logo" className="w-10 h-10" />
                        <div className="text-red-400 text-sm">
                            Error loading wallet: {userIdError.message}
                            <button 
                                onClick={() => window.location.reload()}
                                className="ml-2 px-2 py-1 bg-red-500 rounded text-white"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    // IMPROVED: Auto-redirect jika sudah register
    useEffect(() => {
        if (isConnected && !userIdLoading && userId && userId.length > 0) {
            if (location.pathname !== '/admin' && location.pathname !== '/dashboard') {
                navigate('/dashboard');
            }
        }
    }, [isConnected, userIdLoading, userId, navigate, location.pathname]);

    // Existing JSX...
    return (
        // ... normal header rendering ...
    );
}
```

---

## 3. ERROR HANDLING HOOK (Fix Issue 1.3)

**File:** `mc_frontend/src/hooks/useContractError.ts`

```typescript
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type ContractError = {
    shortMessage?: string;
    message?: string;
    code?: string;
    data?: any;
};

export function useContractError(
    error: ContractError | undefined,
    options: {
        showToast?: boolean;
        onError?: (error: ContractError) => void;
        context?: string;
    } = {}
) {
    const { showToast = true, onError, context = 'Contract' } = options;

    useEffect(() => {
        if (!error) return;

        // Parse error message
        let userMessage = 'Unknown error occurred';
        let errorCode = 'UNKNOWN';

        if (error.shortMessage) {
            userMessage = error.shortMessage;
        } else if (error.message) {
            // Extract readable message
            if (error.message.includes('Already Registered')) {
                userMessage = 'User sudah terdaftar. Silakan login.';
                errorCode = 'ALREADY_REGISTERED';
            } else if (error.message.includes('Invalid Referrer')) {
                userMessage = 'Referral ID tidak valid atau tidak terdaftar.';
                errorCode = 'INVALID_REFERRER';
            } else if (error.message.includes('Invalid value')) {
                userMessage = 'Jumlah pembayaran tidak sesuai. Pastikan 0.0044 ETH.';
                errorCode = 'INVALID_VALUE';
            } else if (error.message.includes('insufficient')) {
                userMessage = 'Saldo tidak cukup untuk transaksi.';
                errorCode = 'INSUFFICIENT_BALANCE';
            } else if (error.message.includes('reverted')) {
                userMessage = 'Transaksi gagal. Coba lagi atau hubungi support.';
                errorCode = 'REVERTED';
            } else {
                userMessage = error.message.substring(0, 100);
            }
        }

        // Log untuk debugging
        console.error(`${context} Error [${errorCode}]:`, {
            error,
            userMessage,
            code: error.code,
            data: error.data,
        });

        // Show toast notification
        if (showToast) {
            toast.error(`${context}: ${userMessage}`);
        }

        // Call callback
        if (onError) {
            onError(error);
        }
    }, [error, showToast, onError, context]);

    return {
        hasError: !!error,
        errorMessage: error?.shortMessage || error?.message,
    };
}

// Usage:
/*
const { data, error, isPending } = useWriteContract();
useContractError(error, {
    showToast: true,
    context: 'Registration',
    onError: (err) => {
        setRegisterMessage('Failed to register');
    }
});
*/
```

---

## 4. ENHANCED REFERRAL VALIDATION (Fix Issue 2.1)

**File:** `mc_frontend/src/hooks/useReferralValidation.ts`

```typescript
import { useReadContract } from 'wagmi';
import { useCallback, useMemo } from 'react';

export function useReferralValidation(
    referralId: string,
    mynncryptConfig: any
) {
    // Validate format
    const isValidFormat = useMemo(() => {
        if (!referralId) return false;
        // Format: [A-Z][0-9]{4}(NR|WR)
        return /^[A-Z]\d{4}[NW]R$/.test(referralId);
    }, [referralId]);

    // Check if referral exists in contract
    const { 
        data: referralAddress, 
        isLoading: isCheckingReferral,
        error: referralError 
    } = useReadContract({
        address: mynncryptConfig.address,
        abi: mynncryptConfig.abi,
        functionName: 'userIds',
        args: [referralId],
        enabled: isValidFormat && referralId !== 'A8888NR', // Skip default
        query: {
            retry: 2,
            staleTime: 5 * 60 * 1000, // 5 min cache
        }
    });

    const isValid = useMemo(() => {
        if (referralId === 'A8888NR') {
            // Default referral is always valid
            return true;
        }
        if (!isValidFormat) {
            return false; // Format invalid
        }
        if (isCheckingReferral) {
            return null; // Still checking
        }
        return referralAddress !== '0x0000000000000000000000000000000000000000'; // Has address
    }, [referralId, isValidFormat, isCheckingReferral, referralAddress]);

    const getErrorMessage = useCallback(() => {
        if (!referralId) return 'Referral ID diperlukan';
        if (!isValidFormat) {
            return 'Format tidak valid. Gunakan format: [A-Z][0-9]{4}(NR|WR)';
        }
        if (isCheckingReferral) return 'Checking referral...';
        if (referralError) return 'Error checking referral';
        if (isValid === false) {
            return 'Referral ID tidak terdaftar di sistem';
        }
        return '';
    }, [referralId, isValidFormat, isCheckingReferral, referralError, isValid]);

    return {
        isValid,
        isValidFormat,
        isCheckingReferral,
        error: referralError,
        errorMessage: getErrorMessage(),
        canProceed: isValid === true,
    };
}

// Usage dalam Register.jsx:
/*
const referralValidation = useReferralValidation(referralId, mynncryptConfig);

<input
    value={referralId}
    onChange={(e) => setReferralId(e.target.value)}
    disabled={referralValidation.isCheckingReferral}
/>

{referralValidation.errorMessage && (
    <p className="text-red-500">{referralValidation.errorMessage}</p>
)}

<button 
    disabled={!referralValidation.canProceed}
    onClick={handleRegister}
>
    Register
</button>
*/
```

---

## 5. TRANSACTION CONFIRMATION WITH TIMEOUT (Fix Issue 2.2)

**File:** `mc_frontend/src/hooks/useTransactionWithTimeout.ts`

```typescript
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

type TransactionStatus = 'pending' | 'confirming' | 'confirmed' | 'failed' | 'timeout';

export function useTransactionWithTimeout(
    hash: `0x${string}` | undefined,
    options: {
        timeoutMs?: number;
        onTimeout?: () => void;
    } = {}
) {
    const { timeoutMs = 120000, onTimeout } = options;
    const [status, setStatus] = useState<TransactionStatus>('pending');
    const [timeElapsed, setTimeElapsed] = useState(0);

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        data: receipt,
        error,
    } = useWaitForTransactionReceipt({ hash });

    // Track time elapsed
    useEffect(() => {
        if (!hash) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setTimeElapsed(Math.floor(elapsed / 1000));

            // Check timeout
            if (elapsed > timeoutMs) {
                setStatus('timeout');
                clearInterval(interval);
                onTimeout?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [hash, timeoutMs, onTimeout]);

    // Update status based on wagmi hooks
    useEffect(() => {
        if (!hash) {
            setStatus('pending');
            setTimeElapsed(0);
        } else if (error) {
            setStatus('failed');
        } else if (isConfirmed) {
            setStatus('confirmed');
        } else if (isConfirming) {
            setStatus('confirming');
        }
    }, [hash, isConfirming, isConfirmed, error]);

    return {
        status,
        isConfirming,
        isConfirmed,
        error,
        receipt,
        timeElapsed,
        estimatedTimeRemaining: Math.max(0, Math.ceil((timeoutMs - timeElapsed * 1000) / 1000)),
    };
}

// Usage dalam Register.jsx:
/*
const { hash, writeContract } = useWriteContract();
const {
    status,
    timeElapsed,
    estimatedTimeRemaining,
    isConfirmed,
} = useTransactionWithTimeout(hash, {
    timeoutMs: 120000,
    onTimeout: () => {
        toast.warning('Transaction taking longer than expected. Check MetaMask.');
    }
});

{status === 'confirming' && (
    <div>
        <p>Processing... {timeElapsed}s</p>
        <p className="text-xs text-gray-500">
            Est. time remaining: {estimatedTimeRemaining}s
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                    width: `${Math.min((timeElapsed / 120) * 100, 95)}%`
                }}
            />
        </div>
    </div>
)}

{status === 'timeout' && (
    <div className="text-orange-500">
        <p>⏱️ Transaction taking longer than expected</p>
        <button onClick={() => window.open('https://etherscan.io/tx/' + hash)}>
            Check on Block Explorer
        </button>
    </div>
)}
*/
```

---

## 6. NETWORK CONFIG AUTO-SWITCHER (Update App.jsx)

**File:** `mc_frontend/src/App.jsx` (Hardhat network addition)

```jsx
// Add Hardhat network config di App.jsx

const hardhatNetwork = {
    id: 1337,
    name: 'Hardhat Local',
    network: 'hardhat',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
    },
};

const config = createConfig({
    chains: [hardhatNetwork, opbnbTestnet, opbnbMainnet],
    connectors: [
        injected(),
        walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'acdd07061043065cac8c0dbe90363982' }),
    ],
    transports: {
        [hardhatNetwork.id]: http('http://127.0.0.1:8545'),
        [opbnbTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
        [opbnbMainnet.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    },
});
```

---

## 7. ENV CONFIGURATION TEMPLATE

**File:** `mc_frontend/.env.local.example`

```env
# Smart Contract Addresses
# Hardhat Local (development)
VITE_MYNNCRYPT_ADDRESS_HARDHAT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_MYNNGIFT_ADDRESS_HARDHAT=0x5FbDB2315678afecb367f032d93F642f64180aa3

# opBNB Testnet (testing)
VITE_MYNNCRYPT_ADDRESS_TESTNET=0x...
VITE_MYNNGIFT_ADDRESS_TESTNET=0x...

# opBNB Mainnet (production)
VITE_MYNNCRYPT_ADDRESS_MAINNET=0x...
VITE_MYNNGIFT_ADDRESS_MAINNET=0x...

# Default untuk development
VITE_MYNNCRYPT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_MYNNGIFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=acdd07061043065cac8c0dbe90363982

# Environment
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

---

## 8. DEPLOYMENT STATUS CHECK SCRIPT

**File:** `mc_backend/scripts/check-deployment.ts`

```typescript
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    
    const mynnCryptAddress = process.env.DEPLOYED_MYNNCRYPT_ADDRESS;
    const mynnGiftAddress = process.env.DEPLOYED_MYNNGIFT_ADDRESS;

    if (!mynnCryptAddress || !mynnGiftAddress) {
        console.error("❌ Environment variables not set");
        console.error("Set DEPLOYED_MYNNCRYPT_ADDRESS and DEPLOYED_MYNNGIFT_ADDRESS");
        return;
    }

    try {
        // Check MynnCrypt
        const mynnCrypt = await ethers.getContractAt("MynnCrypt", mynnCryptAddress);
        const cipherBytes = await mynnCrypt.defaultReferralId?.();
        console.log("✓ MynnCrypt accessible at:", mynnCryptAddress);
        console.log("  Default referral: ", cipherBytes);

        // Check MynnGift
        const mynnGift = await ethers.getContractAt("MynnGift", mynnGiftAddress);
        const platformWallet = await mynnGift.platformWallet?.();
        console.log("✓ MynnGift accessible at:", mynnGiftAddress);
        console.log("  Platform wallet: ", platformWallet);

        // Check balances
        const cryptBalance = await ethers.provider.getBalance(mynnCryptAddress);
        const giftBalance = await ethers.provider.getBalance(mynnGiftAddress);
        console.log("\n💰 Balances:");
        console.log("  MynnCrypt:", ethers.formatEther(cryptBalance), "ETH");
        console.log("  MynnGift:", ethers.formatEther(giftBalance), "ETH");

        console.log("\n✅ Deployment status: OK");
    } catch (error) {
        console.error("❌ Deployment check failed:", error);
    }
}

main().catch(console.error);
```

---

## SUMMARY OF CODE CHANGES

| Issue | File | Change | Effort |
|-------|------|--------|--------|
| 1.1 Network | Header.jsx | Add NetworkDetector | 2h |
| 1.2 Loading | Header.jsx | Add LoadingSpinner | 1h |
| 1.3 Errors | Register.jsx | Add useContractError hook | 2h |
| 2.1 Referral | Register.jsx | Add useReferralValidation hook | 2h |
| 2.2 Timeout | Register.jsx | Add useTransactionWithTimeout | 1.5h |
| 2.3 ABI | hardhat.config | Auto ABI generation | 1h |
| App Config | App.jsx | Add Hardhat network | 0.5h |

**Total Effort:** ~10 hours untuk semua improvements

---

**Ready to implement!** 🚀

Copy paste code sesuai file, test dengan Hardhat local network,  kemudian deploy ke testnet.

