import { useState, useEffect } from 'react';
import { polygon, mainnet } from "thirdweb/chains";

export const useNetworkDetection = (wallet) => {
  const [currentChain, setCurrentChain] = useState('ethereum'); // Default to ethereum
  const [isLoading, setIsLoading] = useState(false);

  // Detect current network
  useEffect(() => {
    const detectNetwork = async () => {
      if (!wallet) {
        console.log('No wallet, defaulting to ethereum');
        setCurrentChain('ethereum');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get the current chain from wallet
        const account = wallet.getAccount();
        if (account && account.chain) {
          const chainId = account.chain.id || account.chain;
          
          console.log('Detected chain ID:', chainId);
          
          // Map chain ID to our network names
          if (chainId === 1 || chainId === mainnet.id) {
            console.log('Setting current chain to ethereum');
            setCurrentChain('ethereum');
          } else if (chainId === 137 || chainId === polygon.id) {
            console.log('Setting current chain to polygon');
            setCurrentChain('polygon');
          } else {
            console.warn('Unknown chain ID:', chainId, 'defaulting to ethereum');
 //           setCurrentChain('ethereum'); // Default to ethereum
          }
        } else {
//          console.log('No chain info found, defaulting to ethereum');
          setCurrentChain('ethereum');
        }
      } catch (error) {
        console.error('Failed to detect network:', error);
        setCurrentChain('ethereum'); // Default to ethereum on error
      } finally {
        setIsLoading(false);
      }
    };

    detectNetwork();

    // Listen for network changes if wallet supports it
    if (wallet) {
      // Set up a polling mechanism to detect chain changes
      const pollInterval = setInterval(() => {
        detectNetwork();
      }, 2000); // Check every 2 seconds

      return () => clearInterval(pollInterval);
    }
  }, [wallet]);

  // Force refresh network detection
  const refreshNetwork = async () => {
    if (!wallet) return;
    
    try {
      setIsLoading(true);
      const account = wallet.getAccount();
      if (account && account.chain) {
        const chainId = account.chain.id || account.chain;
        console.log('Force refresh - detected chain ID:', chainId);
        
        if (chainId === 1 || chainId === mainnet.id) {
          setCurrentChain('ethereum');
        } else if (chainId === 137 || chainId === polygon.id) {
          setCurrentChain('polygon');
        } else {
          setCurrentChain('ethereum');
        }
      }
    } catch (error) {
      console.error('Failed to refresh network:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentChain,
    isLoading,
    setCurrentChain,
    refreshNetwork
  };
};