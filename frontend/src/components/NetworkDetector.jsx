import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'react-toastify';

/**
 * NetworkDetector Component
 * 
 * PURPOSE:
 * - Detect jika user connect ke wrong blockchain network
 * - Show warning toast jika tidak support (less aggressive)
 * - Avoid constant reconnection prompts
 * 
 * SUPPORTED NETWORKS:
 * - 1337: Hardhat Local (development)
 * - 5611: opBNB Testnet (PRIMARY - production)
 * - 204: opBNB Mainnet (production)
 * 
 * BEHAVIOR:
 * 1. Jika user connect ke testnet (5611) → no warning (silent)
 * 2. Jika user connect ke unsupported network → show warning (one-time only)
 * 3. Jika user switch network → detect and show warning
 * 4. Do NOT constantly nag user to switch networks
 */

export function NetworkDetector() {
  // Get current chain info dari wallet
  const { chain, isConnected } = useAccount();
  
  // Hook untuk auto-switch network (optional)
  const { switchNetwork } = useSwitchChain();
  
  // Track warning status untuk avoid duplicate toasts
  const [lastWarningChainId, setLastWarningChainId] = useState(null);
  const [shownWarnings, setShownWarnings] = useState(new Set());

  // Define supported networks
  const SUPPORTED_CHAINS = {
    1337: { 
      name: 'Hardhat Local', 
      isLocal: true,
      description: 'Local development network'
    },
    5611: { 
      name: 'opBNB Testnet', 
      isLocal: false,
      isPrimary: true,
      description: 'Testnet untuk testing'
    },
    204: { 
      name: 'opBNB Mainnet', 
      isLocal: false,
      description: 'Production network'
    },
  };

  // Target network (PREFER TESTNET - less aggressive)
  const TARGET_CHAIN_ID = 5611;
  const TARGET_CHAIN_NAME = 'opBNB Testnet';

  useEffect(() => {
    // Only run jika wallet connected
    if (!isConnected || !chain) {
      setLastWarningChainId(null);
      return;
    }

    // Check jika network adalah supported network
    const chainInfo = SUPPORTED_CHAINS[chain.id];

    if (!chainInfo) {
      // ❌ WRONG NETWORK - bukan supported network
      
      // Avoid duplicate warnings - hanya show ONE TIME per wrong network
      if (!shownWarnings.has(chain.id)) {
        const warningMessage = `⚠️ Unsupported Network: "${chain.name}" is not supported. Please switch to ${TARGET_CHAIN_NAME} (Chain ID: ${TARGET_CHAIN_ID}).`;
        
        console.warn('NetworkDetector:', warningMessage, {
          currentChainId: chain.id,
          currentChainName: chain.name,
          supportedChains: Object.keys(SUPPORTED_CHAINS),
          targetChainId: TARGET_CHAIN_ID,
        });

        // Show warning toast (stay for 15 seconds)
        toast.warning(warningMessage, {
          autoClose: 15000,
          position: 'top-center',
          style: {
            background: '#dc2626',
            color: 'white',
          },
        });

        // Mark this warning as shown
        setShownWarnings(prev => new Set(prev).add(chain.id));
        setLastWarningChainId(chain.id);

        // AUTO-SWITCH (optional - disabled to avoid reconnection spam)
        // if (switchNetwork) {
        //   switchNetwork(TARGET_CHAIN_ID);
        // }
      }
    } else {
      // ✅ CORRECT NETWORK - Supported!
      
      // Clear warnings when back to supported network
      if (lastWarningChainId !== null) {
        console.log('✅ Connected to supported network:', chain.name);
        setLastWarningChainId(null);
      }

      // Info only for development (no warnings for testnet or mainnet)
      if (process.env.NODE_ENV === 'development' && chain.id !== 1337) {
        console.info(`ℹ️ Connected to ${chain.name}. Recommend Hardhat Local (1337) for development.`);
      }
    }
  }, [chain, isConnected, lastWarningChainId, shownWarnings, switchNetwork]);

  // Silent component - tidak render UI apapun
  // Semua logic handle via console.warn dan toast notifications
  return null;
}

export default NetworkDetector;
