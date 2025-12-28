import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'react-toastify';

/**
 * NetworkDetector Component
 * 
 * PURPOSE:
 * - Detect jika user connect ke wrong blockchain network
 * - Show warning toast jika tidak support
 * - Optional: Auto-switch ke correct network
 * 
 * SUPPORTED NETWORKS:
 * - 1337: Hardhat Local (development)
 * - 5611: opBNB Testnet (testing)
 * - 204: opBNB Mainnet (production)
 * 
 * BEHAVIOR:
 * 1. Jika user connect ke supported network → no action (silent)
 * 2. Jika user connect ke unsupported network → show warning toast
 * 3. Jika user switch network → detect and show warning
 * 4. Development mode: prefer Hardhat, warn for testnet
 */

export function NetworkDetector() {
  // Get current chain info dari wallet
  const { chain, isConnected } = useAccount();
  
  // Hook untuk auto-switch network (optional)
  const { switchNetwork } = useSwitchChain();
  
  // Track warning status untuk avoid duplicate toasts
  const [lastWarningChainId, setLastWarningChainId] = useState(null);

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
      description: 'Testnet untuk testing'
    },
    204: { 
      name: 'opBNB Mainnet', 
      isLocal: false,
      description: 'Production network'
    },
  };

  // Default target network (prefer testnet untuk fallback)
  const TARGET_CHAIN_ID = 5611;
  const TARGET_CHAIN_NAME = 'opBNB Testnet';

  useEffect(() => {
    // Only run jika wallet connected
    if (!isConnected || !chain) {
      setLastWarningChainId(null);
      return;
    }

    // Check jika network adalah supported network
    const isSupported = SUPPORTED_CHAINS[chain.id];

    if (!isSupported) {
      // ❌ WRONG NETWORK - bukan supported network
      
      // Avoid duplicate warnings - hanya show jika beda dari last warning
      if (lastWarningChainId !== chain.id) {
        const warningMessage = `❌ Wrong Network: "${chain.name}" is not supported. Please switch to ${TARGET_CHAIN_NAME}.`;
        
        console.warn('NetworkDetector:', warningMessage, {
          currentChainId: chain.id,
          currentChainName: chain.name,
          supportedChains: Object.keys(SUPPORTED_CHAINS),
          targetChainId: TARGET_CHAIN_ID,
        });

        // Show warning toast (stay for 10 seconds)
        toast.warning(warningMessage, {
          autoClose: 10000,
          position: 'top-center',
          style: {
            background: '#dc2626', // Red
            color: 'white',
          },
        });

        // Track this warning untuk avoid duplicates
        setLastWarningChainId(chain.id);

        // AUTO-SWITCH (optional - hanya di production)
        // Comment out jika tidak mau auto-switch
        if (process.env.NODE_ENV === 'production' && switchNetwork) {
          console.log('NetworkDetector: Attempting auto-switch to', TARGET_CHAIN_ID);
          // Uncomment untuk enable auto-switch:
          // switchNetwork(TARGET_CHAIN_ID);
        }
      }
    } else {
      // ✅ CORRECT NETWORK
      
      // Jika sebelumnya ada warning, clear it
      if (lastWarningChainId !== null) {
        console.log('NetworkDetector: Back to correct network', chain.name);
        setLastWarningChainId(null);
      }

      // Optional: Show info message untuk development
      if (process.env.NODE_ENV === 'development' && chain.id !== 1337) {
        // Hanya info, tidak critical
        console.info(`NetworkDetector: Connected to ${chain.name}. Recommend Hardhat Local (1337) for development.`);
      }
    }
  }, [chain, isConnected, lastWarningChainId, switchNetwork]);

  // Silent component - tidak render UI apapun
  // Semua logic handle via console.warn dan toast notifications
  return null;
}

export default NetworkDetector;
