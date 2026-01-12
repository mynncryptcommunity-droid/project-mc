import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'react-toastify';

/**
 * LocalhostAutoSwitch Component
 * 
 * PURPOSE:
 * - Auto-detect ketika di localhost:5173
 * - Auto-add Hardhat Local network ke MetaMask jika belum ada
 * - Auto-switch ke Hardhat Local (1337) network
 * 
 * FLOW:
 * 1. Detect localhost
 * 2. If not on chain 1337:
 *    a. Try add network using wallet_addEthereumChain RPC
 *    b. Then switch to chain 1337
 */

export function LocalhostAutoSwitch() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Hanya jalankan di localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isLocalhost || !isConnected || !chain) {
      return;
    }

    // Jika sudah di hardhat, do nothing
    if (chain.id === 1337) {
      console.log('[LocalhostAutoSwitch] ✅ Already on Hardhat Local');
      return;
    }

    console.log(`[LocalhostAutoSwitch] Detected wrong chain: ${chain.name} (${chain.id}). Adding Hardhat Local and switching...`);

    // Auto-add Hardhat network ke MetaMask jika belum ada
    const addHardhatNetwork = async () => {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x539', // 1337 in hex
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://localhost:8545'],
              blockExplorerUrls: [],
            },
          ],
        });
        console.log('[LocalhostAutoSwitch] ✅ Hardhat network added to MetaMask');
        return true;
      } catch (error) {
        // User rejected or network already exists
        if (error.code === 4001) {
          console.warn('[LocalhostAutoSwitch] User rejected adding network');
          toast.warning('⚠️ Hardhat network not added. Please add manually.');
        } else if (error.code === -32602) {
          // Network already exists
          console.log('[LocalhostAutoSwitch] Network already exists');
          return true;
        } else {
          console.warn('[LocalhostAutoSwitch] Error adding network:', error);
        }
        return false;
      }
    };

    // Auto-switch to hardhat chain
    const switchToHardhat = async () => {
      try {
        if (switchChain) {
          switchChain({ chainId: 1337 });
          console.log('[LocalhostAutoSwitch] ✅ Switched to Hardhat Local');
          toast.success('🔗 Switched to Hardhat Local network');
        }
      } catch (error) {
        console.warn('[LocalhostAutoSwitch] Could not switch chain:', error);
      }
    };

    // Execute in sequence
    (async () => {
      const added = await addHardhatNetwork();
      if (added) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        await switchToHardhat();
      }
    })();

  }, [chain, isConnected, switchChain]);

  return null; // This component doesn't render anything
}

export default LocalhostAutoSwitch;
