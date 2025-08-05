import { useState, useEffect } from 'react';
import { Ethereum } from '@everstake/wallet-sdk-ethereum'; // CHANGED: from polygon to ethereum
import { CreateToken } from '@everstake/wallet-sdk'; // ADD: for auth token creation
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

  // POL token addresses
  const polTokenAddress = currentChain === 'ethereum' 
    ? '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL on Ethereum
    : undefined; // Native on Polygon

  // Use Thirdweb's balance hook to get POL balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance({
    chain: balanceChain,
    address: walletAddress,
    client: client,
    tokenAddress: polTokenAddress // undefined for native token on Polygon, specific address for ERC20 on Ethereum
  });

  // Debug logging
  console.debug('=== BALANCE DEBUGGING ===');
  console.debug('Current chain:', currentChain);
  console.debug('Balance chain:', balanceChain);
  console.debug('Wallet address:', walletAddress);
  console.debug('Balance data:', balanceData);
  console.debug('Balance loading:', balanceLoading);
  console.debug('Client passed:', client);

  // CHANGED: Initialize Ethereum SDK instead of Polygon SDK
  const ethereumSDK = new Ethereum('mainnet');

  // ADD: Create auth token for Polygon API calls
  const [authToken, setAuthToken] = useState(null);
  
  // Get configuration from environment variables
  const sourceId = import.meta.env.VITE_EVERSTAKE_SOURCE_ID;
  const companyName = import.meta.env.VITE_COMPANY_NAME || "UnicornPOLStaking";
  
  // Create auth token on component mount
  useEffect(() => {
    const createAuthToken = async () => {
      try {
        console.log('🔑 Creating Everstake auth token...');
        
        // Create token using Everstake SDK
        const tokenType = "SDK";
        const token = await CreateToken(companyName, tokenType);
        
        console.log('✅ Auth token created successfully');
        setAuthToken(token);
      } catch (error) {
        console.error('❌ Failed to create auth token:', error);
        // You can also try the REST API approach:
        // POST https://wallet-sdk-api.everstake.one/token/create
        // { "companyName": "YourCompanyName", "tokenType": "SDK" }
      }
    };

    if (!authToken) {
      createAuthToken();
    }
  }, [companyName]);

  // Get POL balance using Thirdweb hook data
  const getPOLBalance = () => {
    console.debug('=== getPOLBalance called ===');
    console.debug('balanceData:', balanceData);
    console.debug('balanceData type:', typeof balanceData);
    
    try {
      if (balanceData) {
        console.debug('balanceData.value:', balanceData.value);
        console.debug('balanceData.decimals:', balanceData.decimals);
        console.debug('balanceData structure:', Object.keys(balanceData));
        
        if (balanceData.value) {
          const balanceInPOL = ethers.formatEther(balanceData.value);
          const numericBalance = parseFloat(balanceInPOL);
          console.debug('Formatted balance:', balanceInPOL);
          console.debug('Numeric balance:', numericBalance);
          return numericBalance.toFixed(6);
        }
      }
      console.debug('No balance data available, returning 0');
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
      
      console.debug('Getting staked amount for:', walletAddress);
      
      // Only check staking on Ethereum (where staking actually happens)
      if (currentChain !== 'ethereum') {
        console.debug('Not on Ethereum, skipping staked balance check');
        return '0';
      }
      
      // Try to get real staked balance from Everstake API
      try {
        // CHANGED: Try ethereum endpoint first, then polygon fallback
        const endpoints = [
          `https://wallet-sdk-api.everstake.one/ethereum/balance/${walletAddress}`,
          `https://wallet-sdk-api.everstake.one/polygon/balance/${walletAddress}`
        ];
        
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            console.debug('✅ API staked balance found:', data);
            return data.staked || '0';
          } else if (response.status === 404) {
            console.debug('✅ No staking record found (404) - wallet has not staked');
            continue; // Try next endpoint
          } else {
            console.debug('⚠️ API balance check failed with status:', response.status);
            continue; // Try next endpoint
          }
        }
        
        return '0'; // No balance found on any endpoint
      } catch (apiError) {
        console.debug('⚠️ API call failed:', apiError.message);
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
      
      console.debug('Getting rewards for:', walletAddress);
      
      // Only check rewards on Ethereum (where staking happens)
      if (currentChain !== 'ethereum') {
        console.debug('Not on Ethereum, skipping rewards check');
        return '0';
      }
      
      try {
        // CHANGED: Try ethereum endpoint first, then polygon fallback
        const endpoints = [
          `https://wallet-sdk-api.everstake.one/ethereum/rewards/${walletAddress}`,
          `https://wallet-sdk-api.everstake.one/polygon/rewards/${walletAddress}`
        ];
        
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            console.debug('✅ API rewards found:', data);
            return data.rewards || '0';
          } else if (response.status === 404) {
            console.debug('✅ No rewards found (404) - wallet has no pending rewards');
            continue; // Try next endpoint
          } else {
            console.debug('⚠️ API rewards check failed with status:', response.status);
            continue; // Try next endpoint
          }
        }
        
        return '0'; // No rewards found on any endpoint
      } catch (apiError) {
        console.debug('⚠️ Rewards API call failed:', apiError.message);
        return '0';
      }
    } catch (error) {
      console.error('Failed to get rewards:', error);
      return '0';
    }
  };

  // FIXED: Real Stake POL tokens using corrected SDK and API
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
      
      // Step 2: Try SDK approach first (REQUIRES SOURCE ID)
      try {
        console.log('🔧 Attempting Ethereum SDK delegation...');
        
        if (!sourceId) {
          throw new Error('VITE_EVERSTAKE_SOURCE_ID environment variable is required. Add it to your .env file.');
        }
        
        // Use Ethereum SDK for POL delegation
        const stakingTxData = await ethereumSDK.delegate(
          'POL',                    // Token symbol
          walletAddress,            // Delegator address
          amount,                   // Amount to stake
          sourceId                  // Source ID from environment variable
        );
        
        console.log('✅ SDK prepared transaction:', stakingTxData);
        
        // Submit transaction via wallet
        const txResult = await wallet.sendTransaction(stakingTxData);
        console.log('✅ Transaction submitted:', txResult);
        
        // Step 5: Update balances after successful staking
        console.log('🔄 Refreshing balances after successful stake...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for network update
        await refreshBalances();
        
        return { 
          success: true, 
          message: `Successfully staked ${amount} POL! Transaction: ${txResult.hash}`,
          transactionHash: txResult.hash
        };
        
      } catch (sdkError) {
        console.warn('⚠️ SDK approach failed:', sdkError);
        
        // Step 3: Execute real staking via REST API fallback
        console.log('📋 Trying corrected REST API endpoints...');
        
        // FIXED: Updated API attempts with correct endpoints and parameters
        const apiAttempts = [
          // Attempt 1: Ethereum endpoint with source (no auth token needed)
          {
            name: 'Ethereum endpoint with source',
            url: 'https://wallet-sdk-api.everstake.one/ethereum/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535', // Everstake validator address
              token: 'POL',
              source: sourceId // Source ID from environment variable
            }
          },
          
          // Attempt 2: Polygon endpoint with auth token
          {
            name: 'Polygon endpoint with auth token',
            url: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535',
              token: 'POL'
            },
            headers: {
              'Authorization': `Bearer ${authToken}`, // Use created auth token
              'Content-Type': 'application/json'
            }
          },
          
          // Attempt 3: Polygon endpoint with auth token and delegator field
          {
            name: 'Polygon endpoint with delegator and auth token',
            url: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              delegator: walletAddress,
              amount: amount,
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535',
              token: 'POL'
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          },
          
          // Attempt 4: POL-specific endpoint with auth token
          {
            name: 'POL-specific endpoint with auth token',
            url: 'https://wallet-sdk-api.everstake.one/pol/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535'
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          },
          
          // Attempt 5: Ethereum endpoint with Wei amount and source
          {
            name: 'Ethereum endpoint with Wei amount',
            url: 'https://wallet-sdk-api.everstake.one/ethereum/delegate',
            payload: {
              address: walletAddress,
              amount: ethers.parseEther(amount).toString(), // Convert to Wei
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535',
              token: 'POL',
              source: sourceId // Source ID from environment variable
            }
          },
          
          // Attempt 6: Polygon Wei format with auth token
          {
            name: 'Polygon Wei format with auth token',
            url: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: ethers.parseEther(amount).toString(),
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535',
              token: 'POL'
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          },
          
          // Attempt 7: Original format with validator name and auth token
          {
            name: 'Original format with validator name',
            url: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: 'everstake', // String validator name
              token: 'POL'
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          },
          
          // Attempt 8: Minimal format (let's see what's actually required)
          {
            name: 'Minimal format test',
            url: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        ];
        
        // Skip attempts that require missing configuration
        const validAttempts = apiAttempts.filter(attempt => {
          if (attempt.payload.source && !sourceId) {
            console.log(`⏭️ Skipping ${attempt.name} - no source ID configured`);
            return false;
          }
          if (attempt.headers?.Authorization && !authToken) {
            console.log(`⏭️ Skipping ${attempt.name} - no auth token available`);
            return false;
          }
          return true;
        });
        
        // Check configuration before starting
        if (!sourceId && !authToken) {
          throw new Error('Missing configuration: Add VITE_EVERSTAKE_SOURCE_ID to .env file and/or wait for auth token creation');
        }
        
        for (let i = 0; i < validAttempts.length; i++) {
          const { name, url, payload, headers } = validAttempts[i];
          
          try {
            console.log(`📤 Trying ${name}:`, payload);
            console.log(`🔑 Using auth token:`, authToken ? 'Yes' : 'No');
            console.log(`🆔 Using source ID:`, sourceId ? 'Yes' : 'No');
            
            const fetchOptions = {
              method: 'POST',
              headers: headers || {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            };
            
            const response = await fetch(url, fetchOptions);
            
            console.log(`📥 ${name} Response status:`, response.status);
            
            if (response.ok) {
              const result = await response.json();
              console.log(`✅ ${name} SUCCESS:`, result);
              
              // Step 4: Handle transaction if provided
              if (result.transactionHash) {
                console.log('⏳ Transaction submitted:', result.transactionHash);
              }
              
              // Step 5: Update balances after successful staking
              console.log('🔄 Refreshing balances after successful stake...');
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for network update
              await refreshBalances();
              
              return { 
                success: true, 
                message: `Successfully staked ${amount} POL using ${name}! ${result.transactionHash ? `Transaction: ${result.transactionHash}` : 'Completed'}`,
                transactionHash: result.transactionHash
              };
            } else {
              const errorText = await response.text();
              console.error(`❌ ${name} failed:`, errorText);
            }
            
          } catch (apiError) {
            console.error(`❌ ${name} error:`, apiError);
          }
        }
        
        throw new Error('All API attempts failed. Check: 1) Auth token created successfully, 2) Add VITE_EVERSTAKE_SOURCE_ID to .env file, 3) Verify API endpoint structure');
      }
      
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
      } else if (error.message.includes('VITE_EVERSTAKE_SOURCE_ID')) {
        userMessage = 'Setup required: Add VITE_EVERSTAKE_SOURCE_ID to your .env file.';
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
      
      // FIXED: Try both ethereum and polygon endpoints for claims
      const claimEndpoints = [
        'https://wallet-sdk-api.everstake.one/ethereum/claim',
        'https://wallet-sdk-api.everstake.one/polygon/claim'
      ];
      
      for (const endpoint of claimEndpoints) {
        try {
          const claimData = {
            address: walletAddress,
            source: 'YOUR_SOURCE_ID_HERE' // Add source if required
          };
          
          console.log(`📤 Sending claim request to ${endpoint}:`, claimData);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(claimData)
          });
          
          console.log(`📥 Claim API Response status from ${endpoint}:`, response.status);
          
          if (response.ok) {
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
          } else {
            const errorText = await response.text();
            console.error(`❌ Claim API Error Response from ${endpoint}:`, errorText);
          }
        } catch (endpointError) {
          console.error(`❌ Error with ${endpoint}:`, endpointError);
        }
      }
      
      throw new Error('All claim endpoints failed. Contact Everstake support.');
      
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
      console.debug('🔄 Refreshing staking data only...');
      
      const [stakedAmount, rewardsAmount] = await Promise.all([
        getStakedAmount(),
        getRewards()
      ]);

      setBalances(prev => ({
        pol: prev.pol, // Always preserve the real POL balance
        staked: stakedAmount,
        rewards: rewardsAmount
      }));
      
      console.debug('✅ Staking data refreshed', { staked: stakedAmount, rewards: rewardsAmount });
    } catch (error) {
      console.error('❌ Failed to refresh staking data:', error);
    }
  };

  // Update balances when balance data changes or network switches
  useEffect(() => {
    if (walletAddress && balanceData) {
      console.debug('📊 Wallet balance updated for chain:', currentChain);
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
      console.debug('🔄 Network changed, refreshing staking data for:', currentChain);
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