import { useState, useEffect } from 'react';
import { Polygon } from '@everstake/wallet-sdk-polygon';
import { useWalletBalance } from "thirdweb/react";
import { polygon, mainnet } from "thirdweb/chains";
import { ethers } from 'ethers';

export const useEverstakeStaking = (wallet, client, currentChain) => {
  const [balances, setBalances] = useState({
    pol: '0',
    staked: '0',
    rewards: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get wallet address safely
  const walletAddress = wallet?.getAccount()?.address;

  // Use appropriate chain for balance hook based on current network
  const balanceChain = currentChain === 'ethereum' ? mainnet : polygon;

  // Use Thirdweb's balance hook to get POL balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance({
    chain: balanceChain,
    address: walletAddress,
    client: client
  });

  // Debug logging
  console.log('=== BALANCE DEBUGGING ===');
  console.log('Current chain:', currentChain);
  console.log('Balance chain:', balanceChain);
  console.log('Wallet address:', walletAddress);
  console.log('Balance data:', balanceData);
  console.log('Balance loading:', balanceLoading);
  console.log('Client passed:', client);

  // Initialize Everstake SDK (for balance checking only)
  const polygonSDK = new Polygon();

  // Get POL balance using Thirdweb hook data
  const getPOLBalance = () => {
    console.log('=== getPOLBalance called ===');
    console.log('balanceData:', balanceData);
    console.log('balanceData type:', typeof balanceData);
    
    try {
      if (balanceData) {
        console.log('balanceData.value:', balanceData.value);
        console.log('balanceData.decimals:', balanceData.decimals);
        console.log('balanceData structure:', Object.keys(balanceData));
        
        if (balanceData.value) {
          const balanceInPOL = ethers.formatEther(balanceData.value);
          const numericBalance = parseFloat(balanceInPOL);
          console.log('Formatted balance:', balanceInPOL);
          console.log('Numeric balance:', numericBalance);
          return numericBalance.toFixed(6);
        }
      }
      console.log('No balance data available, returning 0');
      return '0';
    } catch (error) {
      console.error('Failed to format POL balance:', error);
      return '0';
    }
  };

 // Get staked amount from Everstake
const getStakedAmount = async () => {
  try {
    if (!walletAddress) return '0';
    
    console.log('Getting staked amount for:', walletAddress);
    
    // Only check staking on Ethereum (where staking actually happens)
    if (currentChain !== 'ethereum') {
      console.log('Not on Ethereum, skipping staked balance check');
      return '0';
    }
    
    // Try to get real staked balance from Everstake API
    try {
      const response = await fetch(`https://wallet-sdk-api.everstake.one/polygon/balance/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API staked balance found:', data);
        return data.staked || '0';
      } else if (response.status === 404) {
        // 404 is normal - means no staking record found
        console.log('✅ No staking record found (404) - wallet has not staked');
        return '0';
      } else {
        console.log('⚠️ API balance check failed with status:', response.status);
        return '0';
      }
    } catch (apiError) {
      console.log('⚠️ API call failed:', apiError.message);
      return '0';
    }
  } catch (error) {
    console.error('Failed to get staked amount:', error);
    return '0';
  }
};

// Get pending rewards
const getRewards = async () => {
  try {
    if (!walletAddress) return '0';
    
    console.log('Getting rewards for:', walletAddress);
    
    // Only check rewards on Ethereum (where staking happens)
    if (currentChain !== 'ethereum') {
      console.log('Not on Ethereum, skipping rewards check');
      return '0';
    }
    
    try {
      const response = await fetch(`https://wallet-sdk-api.everstake.one/polygon/rewards/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API rewards found:', data);
        return data.rewards || '0';
      } else if (response.status === 404) {
        // 404 is normal - means no rewards found
        console.log('✅ No rewards found (404) - wallet has no pending rewards');
        return '0';
      } else {
        console.log('⚠️ API rewards check failed with status:', response.status);
        return '0';
      }
    } catch (apiError) {
      console.log('⚠️ Rewards API call failed:', apiError.message);
      return '0';
    }
  } catch (error) {
    console.error('Failed to get rewards:', error);
    return '0';
  }
};
  // Real Stake POL tokens using REST API
  const stakePOL = async (amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) throw new Error('No wallet connected');
      if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');
      
      // Must be on Ethereum to stake
      if (currentChain !== 'ethereum') {
        throw new Error('Please switch to Ethereum mainnet to stake POL');
      }
      
      console.log(`🚀 Starting real staking: ${amount} POL for ${walletAddress}`);
      
      // Check if user has enough POL
      const currentBalance = parseFloat(balances.pol);
      const stakeAmount = parseFloat(amount);
      
      if (stakeAmount > currentBalance) {
        throw new Error(`Insufficient balance. You have ${currentBalance} POL`);
      }
      
      // Step 1: Ensure we're on Ethereum mainnet
      console.log('📡 Confirming Ethereum mainnet connection...');
      try {
        await wallet.switchChain(mainnet);
        console.log('✅ Confirmed on Ethereum mainnet');
      } catch (chainError) {
        console.warn('Chain switch failed or not needed:', chainError);
        // Continue anyway - might already be on Ethereum
      }
      
      // Step 2: Prepare staking data
      console.log('💰 Preparing delegation data...');
      
      // Step 3: Execute real staking via REST API
      console.log('📋 Using REST API for delegation...');
      
      const delegationData = {
        address: walletAddress,
        amount: amount,        // Use original amount (like "2")
        validator: 'everstake',
        token: 'POL'
      };
      
      console.log('📤 Sending delegation request:', delegationData);
      
      const response = await fetch('https://wallet-sdk-api.everstake.one/polygon/delegate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(delegationData)
      });
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        // Handle specific error cases
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText}`);
        } else if (response.status === 404) {
          throw new Error('Everstake API endpoint not found. Please check the API documentation.');
        } else if (response.status === 500) {
          throw new Error('Everstake server error. Please try again later.');
        } else {
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ API delegation result:', result);
      
      // Step 4: Handle transaction if provided
      if (result.transactionHash) {
        console.log('⏳ Transaction submitted:', result.transactionHash);
        // You could add transaction receipt waiting here
      }
      
      // Step 5: Update balances after successful staking
      console.log('🔄 Refreshing balances after successful stake...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for network update
      await refreshBalances();
      
      return { 
        success: true, 
        message: `Successfully staked ${amount} POL! ${result.transactionHash ? `Transaction: ${result.transactionHash}` : 'Completed'}`,
        transactionHash: result.transactionHash
      };
      
    } catch (error) {
      console.error('❌ Staking process failed:', error);
      setError(error.message);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        userMessage = 'Insufficient ETH for gas fees. You need ~0.05-0.1 ETH on Ethereum mainnet.';
      } else if (error.message.includes('user rejected')) {
        userMessage = 'Transaction was cancelled by user.';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      
      return { success: false, message: userMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Claim rewards using REST API
  const claimRewards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) throw new Error('No wallet connected');
      
      // Must be on Ethereum to claim
      if (currentChain !== 'ethereum') {
        throw new Error('Please switch to Ethereum mainnet to claim rewards');
      }
      
      const rewardsAmount = parseFloat(balances.rewards);
      
      if (rewardsAmount < 2) {
        throw new Error('Minimum 2 POL required to claim rewards');
      }
      
      console.log(`💎 Starting real rewards claim: ${rewardsAmount} POL for ${walletAddress}`);
      
      // Step 1: Ensure we're on Ethereum mainnet
      console.log('📡 Confirming Ethereum mainnet connection...');
      try {
        await wallet.switchChain(mainnet);
        console.log('✅ Confirmed on Ethereum mainnet');
      } catch (chainError) {
        console.warn('Chain switch failed or not needed:', chainError);
      }
      
      // Step 2: Execute real rewards claim via REST API
      console.log('💎 Using REST API for rewards claim...');
      
      const claimData = {
        address: walletAddress
      };
      
      console.log('📤 Sending claim request:', claimData);
      
      const response = await fetch('https://wallet-sdk-api.everstake.one/polygon/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData)
      });
      
      console.log('📥 Claim API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claim API Error Response:', errorText);
        
        if (response.status === 400) {
          throw new Error(`Invalid claim request: ${errorText}`);
        } else if (response.status === 404) {
          throw new Error('No rewards found to claim.');
        } else {
          throw new Error(`Claim API Error: ${response.status} - ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ API claim result:', result);
      
      // Wait for transaction if provided
      if (result.transactionHash) {
        console.log('⏳ Claim transaction submitted:', result.transactionHash);
      }
      
      // Update balances
      console.log('🔄 Refreshing balances after successful claim...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refreshBalances();
      
      return { 
        success: true, 
        message: `Successfully claimed ${rewardsAmount} POL rewards! ${result.transactionHash ? `Transaction: ${result.transactionHash}` : 'Completed'}`,
        transactionHash: result.transactionHash
      };
      
    } catch (error) {
      console.error('❌ Claim process failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified refresh that doesn't touch POL balance
  const refreshBalances = async () => {
    try {
      console.log('🔄 Refreshing staking data only...');
      
      const [stakedAmount, rewardsAmount] = await Promise.all([
        getStakedAmount(),
        getRewards()
      ]);

      setBalances(prev => ({
        pol: prev.pol, // Always preserve the real POL balance
        staked: stakedAmount,
        rewards: rewardsAmount
      }));
      
      console.log('✅ Staking data refreshed', { staked: stakedAmount, rewards: rewardsAmount });
    } catch (error) {
      console.error('❌ Failed to refresh staking data:', error);
    }
  };

  // Update balances when balance data changes or network switches
  useEffect(() => {
    if (walletAddress && balanceData) {
      console.log('📊 Wallet balance updated for chain:', currentChain);
      const polBalance = getPOLBalance();
      
      // Update POL balance immediately
      setBalances(prev => ({
        ...prev,
        pol: polBalance
      }));
      
      // Then load staking data without touching POL balance
      getStakedAmount().then(staked => {
        setBalances(prev => ({ ...prev, staked }));
      });
      
      getRewards().then(rewards => {
        setBalances(prev => ({ ...prev, rewards }));
      });
    }
  }, [balanceData, walletAddress, client, currentChain]);

  // Refresh staking data when network changes
  useEffect(() => {
    if (walletAddress && currentChain) {
      console.log('🔄 Network changed, refreshing staking data for:', currentChain);
      refreshBalances();
    }
  }, [currentChain]);
  

  return {
    balances,
    isLoading: isLoading || balanceLoading,
    error,
    stakePOL,
    claimRewards,
    refreshBalances
  };
};