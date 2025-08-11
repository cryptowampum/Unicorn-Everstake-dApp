import { useState, useEffect } from 'react';
import { Polygon } from '@everstake/wallet-sdk-polygon';
import { CreateToken } from '@everstake/wallet-sdk';
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

  // POL token address for Ethereum mainnet
  const polTokenAddress = currentChain === 'ethereum' 
    ? '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL on Ethereum
    : undefined; // Native on Polygon

  // Use Thirdweb's balance hook to get POL balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance({
    chain: balanceChain,
    address: walletAddress,
    client: client,
    tokenAddress: polTokenAddress
  });



  // Initialize Everstake SDK
  const polygonSDK = new Polygon();

  // Utility function to create auth tokens
  const createAuthToken = async () => {
    try {
      console.log('🔐 Creating Everstake auth token...');
      const companyName = "Unicorn";  // Your dApp name
      const tokenType = "SDK";        // Token type as per docs
      
      const authToken = await CreateToken(companyName, tokenType);
      console.log('✅ Auth token created successfully');
      return authToken;
    } catch (tokenError) {
      console.error('❌ Failed to create auth token:', tokenError);
      throw new Error(`Auth token creation failed: ${tokenError.message}`);
    }
  };

  // Get POL balance using Thirdweb hook data
  const getPOLBalance = () => {
    console.log('=== getPOLBalance called ===');
    console.log('balanceData:', balanceData);
    console.log('balanceData type:', typeof balanceData);
    
    try {
      if (balanceData) {
        console.log('balanceData.value:', balanceData.value);
        console.log('balanceData.displayValue:', balanceData.displayValue);
        console.log('balanceData.decimals:', balanceData.decimals);
        console.log('balanceData structure:', Object.keys(balanceData));
        
        // Use displayValue if available (already formatted by Thirdweb)
        if (balanceData.displayValue) {
          const numericBalance = parseFloat(balanceData.displayValue);
          console.log('Using displayValue:', balanceData.displayValue);
          console.log('Numeric balance:', numericBalance);
          return numericBalance.toFixed(6);
        }
        
        // Fallback to manual formatting if displayValue not available
        if (balanceData.value) {
          const balanceInPOL = ethers.formatEther(balanceData.value);
          const numericBalance = parseFloat(balanceInPOL);
          console.log('Formatted balance (fallback):', balanceInPOL);
          console.log('Numeric balance (fallback):', numericBalance);
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

  // UPDATED: Use SDK first, then wallet submission
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
      
      console.log(`🚀 Starting POL staking: ${amount} POL for ${walletAddress}`);
      
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
      }
      
      // Step 2: Create auth token and prepare delegation with SDK
      console.log('🔧 Creating auth token and preparing delegation with SDK...');
      
      const authToken = await createAuthToken();
      
      console.log('📋 Calling SDK delegate method...');
      const stakingTxData = await polygonSDK.delegate(
        authToken,    // token: properly generated auth token
        walletAddress, // address: user's address  
        amount,       // amount: amount to stake
        true          // isPOL: true for POL token
      );
      
      console.log('✅ SDK delegation transaction prepared:', stakingTxData);
      
      // Step 3: Submit prepared transaction using Thirdweb wallet
      console.log('📝 Submitting prepared transaction via wallet...');
      const txResult = await wallet.sendTransaction(stakingTxData);
      console.log('✅ Transaction submitted:', txResult);
      
      const txHash = txResult.transactionHash || txResult.hash || txResult;
      console.log('📋 Transaction hash:', txHash);
      
      // Step 4: Update balances after successful staking
      console.log('🔄 Refreshing balances after successful stake...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refreshBalances();
      
      return { 
        success: true, 
        message: `Successfully staked ${amount} POL! ${txHash ? `Transaction: ${txHash}` : 'Completed'}`,
        transactionHash: txHash
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

  // UPDATED: Use SDK first for claim rewards
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
      
      console.log(`💎 Starting rewards claim: ${rewardsAmount} POL for ${walletAddress}`);
      
      // Step 1: Ensure we're on Ethereum mainnet
      console.log('📡 Confirming Ethereum mainnet connection...');
      try {
        await wallet.switchChain(mainnet);
        console.log('✅ Confirmed on Ethereum mainnet');
      } catch (chainError) {
        console.warn('Chain switch failed or not needed:', chainError);
      }
      
      // Step 2: Prepare claim transaction using SDK
      console.log('🔧 Preparing claim transaction with SDK...');
      
      const claimTxData = await polygonSDK.claimRewards(walletAddress);
      console.log('✅ SDK claim transaction prepared:', claimTxData);
      
      // Step 3: Submit prepared transaction using Thirdweb wallet
      console.log('📝 Submitting prepared claim transaction via wallet...');
      const txResult = await wallet.sendTransaction(claimTxData);
      
      const txHash = txResult.transactionHash || txResult.hash || txResult;
      console.log('✅ Claim transaction submitted:', txHash);
      
      // Step 4: Update balances
      console.log('🔄 Refreshing balances after successful claim...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refreshBalances();
      
      return { 
        success: true, 
        message: `Successfully claimed ${rewardsAmount} POL rewards! ${txHash ? `Transaction: ${txHash}` : 'Completed'}`,
        transactionHash: txHash
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
      
      // Also refresh POL balance
      if (refetchBalance) {
        refetchBalance();
      }
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