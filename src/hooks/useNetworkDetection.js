import { useState, useEffect } from 'react';
import { polygon, mainnet } from "thirdweb/chains";

export const useNetworkDetection = (wallet) => {
  const [currentChain, setCurrentChain] = useState('ethereum'); // Default to ethereum
  const [isLoading, setIsLoading] = useState(false);

  // Detect current network
  useEffect(() => {
    const detectNetwork = async () => {
      if (!wallet) return;

      try {
        setIsLoading(true);
        
        // Get the current chain from wallet
        const account = wallet.getAccount();
        if (account && account.chain) {
          const chainId = account.chain.id || account.chain;
          
          console.log('Detected chain ID:', chainId);
          
          // Map chain ID to our network names
          if (chainId === 1 || chainId === mainnet.id) {
            setCurrentChain('ethereum');
          } else if (chainId === 137 || chainId === polygon.id) {
            setCurrentChain('polygon');
          } else {
            console.warn('Unknown chain ID:', chainId);
            setCurrentChain('ethereum'); // Default to ethereum
          }
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
    if (wallet && wallet.watchChain) {
      const unsubscribe = wallet.watchChain((chain) => {
        console.log('Network changed to:', chain);
        if (chain.id === 1) {
          setCurrentChain('ethereum');
        } else if (chain.id === 137) {
          setCurrentChain('polygon');
        }
      });

      return () => unsubscribe?.();
    }
  }, [wallet]);

  return {
    currentChain,
    isLoading,
    setCurrentChain
  };
};