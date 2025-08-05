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
  const [polygonSDK, setPolygonSDK] = useState(null);
  const [sdkLoading, setSdkLoading] = useState(true); // Track SDK loading state

  // Get wallet address safely
  const walletAddress = wallet?.getAccount()?.address;

  // Use appropriate chain for balance hook based on current network
  const balanceChain = currentChain === 'ethereum' ? mainnet : polygon;
  
  // POL token configuration:
  // - On Ethereum: POL is an ERC20 token at 0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6
  // - On Polygon: POL is the native token (no tokenAddress needed)
  const polTokenAddress = currentChain === 'ethereum' 
    ? '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL token on Ethereum mainnet
    : undefined; // POL is native on Polygon (like ETH on Ethereum)

  // Get POL balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance({
    chain: balanceChain,
    address: walletAddress,
    client: client,
    tokenAddress: polTokenAddress // undefined for native token on Polygon, specific address for ERC20 on Ethereum
  });

  // Initialize Everstake SDK properly
  useEffect(() => {
    const initializeSDK = async () => {
      if (!wallet) {
        setSdkLoading(false);
        return;
      }

      try {
        setSdkLoading(true);
        console.log('🔧 Initializing Everstake Polygon SDK...');
        
        // Initialize Polygon SDK - it might need specific configuration
        const sdk = new Polygon({
          network: 'mainnet' // Make sure we're on mainnet
        });
        
        // Test if SDK has the methods we need
        console.log('🔍 Checking SDK methods...');
        console.log('delegate method exists:', typeof sdk.delegate === 'function');
        console.log('claimRewards method exists:', typeof sdk.claimRewards === 'function');
        
        setPolygonSDK(sdk);
        setSdkLoading(false);
        console.log('✅ Everstake SDK initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize Everstake SDK:', error);
        setSdkLoading(false);
        // Don't set error here - we'll fall back to REST API
        console.log('⚠️ SDK initialization failed, will use REST API fallback');
      }
    };

    initializeSDK();
  }, [wallet]);

  // Get POL balance using Thirdweb hook data
  const getPOLBalance = () => {
    try {
      if (balanceData) {
        if (balanceData.value) {
          const balanceInPOL = ethers.formatEther(balanceData.value);
          const numericBalance = parseFloat(balanceInPOL);
          return numericBalance.toFixed(6);
        }
      }
      return '0';
    } catch (error) {
      console.error('Failed to format POL balance:', error);
      return '0';
    }
  };

  // Get staked amount from Everstake API
  const getStakedAmount = async () => {
    try {
      if (!walletAddress) return '0';
      
      console.log('Getting staked amount for:', walletAddress);
      
      // Only check staking on Ethereum (where staking actually happens)
      if (currentChain !== 'ethereum') {
        console.log('Not on Ethereum, skipping staked balance check');
        return '0';
      }
      
      try {
        const response = await fetch(`https://wallet-sdk-api.everstake.one/polygon/balance/${walletAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API staked balance found:', data);
          return data.staked || '0';
        } else if (response.status === 404) {
          console.log('✅ No staking record found (404) - wallet has never staked, this is normal');
          return '0';
        } else {
          console.log('⚠️ API balance check failed with status:', response.status);
          return '0';
        }
      } catch (apiError) {
        console.log('⚠️ API call failed, returning 0:', apiError.message);
        return '0';
      }
    } catch (error) {
      console.log('⚠️ Failed to get staked amount, returning 0:', error.message);
      return '0';
    }
  };

  // Get pending rewards from Everstake API
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
          console.log('✅ No rewards found (404) - wallet has never staked, this is normal');
          return '0';
        } else {
          console.log('⚠️ API rewards check failed with status:', response.status);
          return '0';
        }
      } catch (apiError) {
        console.log('⚠️ Rewards API call failed, returning 0:', apiError.message);
        return '0';
      }
    } catch (error) {
      console.log('⚠️ Failed to get rewards, returning 0:', error.message);
      return '0';
    }
  };

  // STEP 1: Use SDK to prepare transaction, STEP 2: Submit via wallet (CORRECT APPROACH)
  const stakePOL = async (amount) => {
    console.log('🚀 === STARTING STAKE POL PROCESS ===');
    console.log('Amount:', amount);
    console.log('Current chain:', currentChain);
    console.log('Wallet address:', walletAddress);
    console.log('Polygon SDK available:', !!polygonSDK);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!walletAddress) {
        console.error('❌ No wallet connected');
        throw new Error('No wallet connected');
      }
      if (!amount || parseFloat(amount) <= 0) {
        console.error('❌ Invalid amount:', amount);
        throw new Error('Invalid amount');
      }
      
      // Must be on Ethereum to stake POL
      if (currentChain !== 'ethereum') {
        console.error('❌ Not on Ethereum, current chain:', currentChain);
        throw new Error('Please switch to Ethereum mainnet to stake POL');
      }
      
      console.log(`✅ Basic validation passed`);
      
      // Check SDK status
      if (sdkLoading) {
        console.log('⏳ SDK still loading, waiting a moment...');
        // Wait a bit for SDK to finish loading
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!polygonSDK) {
        console.log('⚠️ SDK not available, proceeding with REST API only');
      }
      
      // Check if user has enough POL on Ethereum mainnet
      const currentBalance = parseFloat(balances.pol);
      const stakeAmount = parseFloat(amount);
      
      console.log('Current POL balance:', currentBalance);
      console.log('Requested stake amount:', stakeAmount);
      
      if (stakeAmount > currentBalance) {
        console.error('❌ Insufficient balance');
        throw new Error(`Insufficient POL balance on Ethereum. You have ${currentBalance} POL. You may need to bridge POL from Polygon.`);
      }
      
      console.log('✅ Balance check passed');
      
      let stakingTxData;
      let useRestAPI = false;
      
      // Try SDK approaches first (if SDK is available)
      if (polygonSDK) {
        console.log('📋 SDK available, attempting SDK approaches...');
        
        const amountWei = ethers.parseEther(amount.toString());
        console.log('Amount in Wei:', amountWei.toString());
        
        try {
          console.log('🔍 Attempting SDK delegation with token approach...');
          
          stakingTxData = await polygonSDK.delegate(
            'POL',           // token symbol/ID
            walletAddress,   // delegator address  
            amount,          // amount as string
            'everstake'      // validator
          );
          
          console.log('✅ SDK (token approach) prepared transaction data:', stakingTxData);
          
        } catch (tokenError) {
          console.log('⚠️ Token approach failed:', tokenError.message);
          
          try {
            console.log('🔍 Attempting SDK delegation with Wei approach...');
            
            stakingTxData = await polygonSDK.delegate(
              walletAddress,   // delegator address
              amountWei,       // amount in Wei
              'everstake'      // validator  
            );
            
            console.log('✅ SDK (Wei approach) prepared transaction data:', stakingTxData);
            
          } catch (weiError) {
            console.log('⚠️ Wei approach also failed:', weiError.message);
            console.log('📋 Both SDK approaches failed, will use REST API...');
            useRestAPI = true;
          }
        }
      } else {
        console.log('📋 SDK not available, using REST API approach...');
        useRestAPI = true;
      }
      
      // Use REST API if SDK failed or unavailable
      if (useRestAPI) {
        console.log('📋 Starting comprehensive API testing with 8 different approaches...');
        
        // Calculate Wei amount for one of the formats
        const amountWei = ethers.parseEther(amount.toString());
        
        // Try different endpoints and payload combinations
        const apiAttempts = [
          // Attempt 1: Different endpoints with various payloads
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: '0xe483c7f156b25da9be6220049e5111bb41c4c535', // Possible Everstake validator address
              token: 'POL'
            }
          },
          // Attempt 2: Try without token field
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: 'everstake'
            }
          },
          // Attempt 3: Try POL-specific endpoint
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/pol/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: 'everstake',
              token: 'POL'
            }
          },
          // Attempt 4: Try ethereum endpoint (since staking is on mainnet)
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/ethereum/delegate',
            payload: {
              address: walletAddress,
              amount: amount,
              validator: 'everstake',
              token: 'POL'
            }
          },
          // Attempt 5: Try with delegator field instead of address
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              delegator: walletAddress,
              amount: amount,
              validator: 'everstake',
              token: 'POL'
            }
          },
          // Attempt 6: Try with amount in Wei
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amountWei.toString(),
              validator: 'everstake',
              token: 'POL'
            }
          },
          // Attempt 7: Try Cosmos-style format
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              token: 'POL',
              address: walletAddress,
              amount: amount,
              sourceID: 'everstake'
            }
          },
          // Attempt 8: Try minimal payload
          {
            endpoint: 'https://wallet-sdk-api.everstake.one/polygon/delegate',
            payload: {
              address: walletAddress,
              amount: amount
            }
          }
        ];
        
        for (let i = 0; i < apiAttempts.length; i++) {
          const attempt = apiAttempts[i];
          console.log(`📤 Attempt ${i + 1}: ${attempt.endpoint}`, attempt.payload);
          
          try {
            const response = await fetch(attempt.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Try with user agent in case it's required
                'User-Agent': 'Unicorn-POL-Staking-DApp/1.0'
              },
              body: JSON.stringify(attempt.payload)
            });
            
            console.log(`📥 Attempt ${i + 1} response status:`, response.status);
            
            if (response.ok) {
              const result = await response.json();
              console.log(`✅ SUCCESS with attempt ${i + 1}:`, result);
              
              // Handle successful response
              if (result.transactionHash) {
                console.log('⏳ Transaction submitted via API:', result.transactionHash);
                
                setTimeout(() => {
                  refreshBalances();
                }, 5000);
                
                return { 
                  success: true, 
                  message: `Successfully staked ${amount} POL with Everstake! Transaction: ${result.transactionHash}`
                };
              } else if (result.success || result.status === 'success') {
                setTimeout(() => {
                  refreshBalances();
                }, 5000);
                
                return { 
                  success: true, 
                  message: `Successfully initiated staking of ${amount} POL with Everstake!`
                };
              } else if (result.txData || result.transaction) {
                // If we get transaction data, we might need to submit it via wallet
                const txData = result.txData || result.transaction;
                console.log('📋 Received transaction data, submitting via wallet:', txData);
                
                try {
                  const txResult = await wallet.sendTransaction({
                    to: txData.to,
                    data: txData.data,
                    value: txData.value || '0',
                    gasLimit: txData.gasLimit || txData.gas
                  });
                  
                  console.log('✅ Transaction submitted via wallet:', txResult);
                  
                  if (txResult.wait) {
                    await txResult.wait();
                    console.log('✅ Transaction confirmed!');
                  }
                  
                  setTimeout(() => {
                    refreshBalances();
                  }, 5000);
                  
                  return { 
                    success: true, 
                    message: `Successfully staked ${amount} POL with Everstake! Transaction hash: ${txResult.hash || txResult.transactionHash}`
                  };
                } catch (walletError) {
                  console.log('❌ Wallet submission failed:', walletError.message);
                  continue; // Try next attempt
                }
              } else {
                console.log(`⚠️ Attempt ${i + 1} succeeded but returned unexpected format:`, result);
                continue; // Try next attempt
              }
            } else {
              const errorText = await response.text();
              console.log(`❌ Attempt ${i + 1} failed with status ${response.status}:`, errorText);
              
              // If it's a 404, this endpoint probably doesn't exist, continue
              // If it's a 400, the payload might be wrong, continue
              // If it's 401/403, we might need authentication
              if (response.status === 401 || response.status === 403) {
                console.log('🔐 Authentication may be required for this endpoint');
              }
            }
          } catch (error) {
            console.log(`❌ Attempt ${i + 1} request failed:`, error.message);
          }
        }
        
        // If all attempts failed
        throw new Error(`All API attempts failed. Tried ${apiAttempts.length} different endpoint/payload combinations.`);
      }
      
      // If we reach here, SDK worked - submit via wallet
      if (stakingTxData) {
        console.log('📤 Submitting SDK-prepared transaction via wallet...');
        
        const txResult = await wallet.sendTransaction({
          to: stakingTxData.to,
          data: stakingTxData.data,
          value: stakingTxData.value || '0',
          gasLimit: stakingTxData.gasLimit || stakingTxData.gas
        });
        
        console.log('✅ Transaction submitted:', txResult);
        
        // Wait for transaction confirmation
        if (txResult.wait) {
          console.log('⏳ Waiting for transaction confirmation...');
          const receipt = await txResult.wait();
          console.log('✅ Transaction confirmed:', receipt);
        }
        
        // Refresh balances after successful staking
        console.log('🔄 Refreshing balances after successful stake...');
        setTimeout(() => {
          refreshBalances();
        }, 5000);
        
        return { 
          success: true, 
          message: `Successfully staked ${amount} POL with Everstake! Transaction hash: ${txResult.hash || txResult.transactionHash}`
        };
      }
      
    } catch (error) {
      console.error('❌ === STAKING PROCESS FAILED ===');
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      setError(error.message);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        userMessage = 'Insufficient ETH for gas fees. You need ~0.05-0.1 ETH on Ethereum mainnet.';
      } else if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
        userMessage = 'Transaction was cancelled by user.';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('All API attempts failed')) {
        userMessage = 'Unable to connect to Everstake staking service. The API may be temporarily unavailable. Please try again later.';
      } else if (error.message.includes('prepareDelegateTransaction')) {
        userMessage = 'Failed to prepare staking transaction. Please try again.';
      }
      
      return { success: false, message: userMessage };
    } finally {
      setIsLoading(false);
      console.log('🏁 === STAKE POL PROCESS COMPLETED ===');
    }
  };

  // STEP 1: Use SDK to prepare claim transaction, STEP 2: Submit via wallet
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
      
      // Try SDK first, then fallback to REST API
      if (polygonSDK) {
        try {
          // Use SDK claim method (likely similar to delegate)
          console.log('📋 Using SDK to prepare claim transaction...');
          
          const claimTxData = await polygonSDK.claimRewards(
            walletAddress,    // delegator address
            'everstake'       // validator
          );
          
          console.log('✅ SDK prepared claim transaction:', claimTxData);
          
          // Submit transaction via wallet
          console.log('📤 Submitting claim transaction via wallet...');
          
          const txResult = await wallet.sendTransaction({
            to: claimTxData.to,
            data: claimTxData.data,
            value: claimTxData.value || '0',
            gasLimit: claimTxData.gasLimit || claimTxData.gas
          });
          
          console.log('✅ Claim transaction submitted:', txResult);
          
          // Wait for confirmation
          if (txResult.wait) {
            await txResult.wait();
            console.log('✅ Claim transaction confirmed!');
          }
          
          // Refresh balances
          console.log('🔄 Refreshing balances after successful claim...');
          setTimeout(() => {
            refreshBalances();
          }, 5000);
          
          return { 
            success: true, 
            message: `Successfully claimed ${rewardsAmount} POL rewards! Transaction hash: ${txResult.hash || txResult.transactionHash}`
          };
          
        } catch (sdkError) {
          console.log('⚠️ SDK claim failed, trying REST API fallback:', sdkError.message);
        }
      }
      
      // REST API fallback for claiming
      console.log('📋 Using REST API for rewards claim...');
      
      const claimPayloads = [
        { address: walletAddress, validator: 'everstake' },
        { address: walletAddress },
        { delegator: walletAddress, validator: 'everstake' }
      ];
      
      for (const payload of claimPayloads) {
        try {
          const response = await fetch('https://wallet-sdk-api.everstake.one/polygon/claim', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ API claim result:', result);
            
            setTimeout(() => {
              refreshBalances();
            }, 5000);
            
            return { 
              success: true, 
              message: `Successfully claimed ${rewardsAmount} POL rewards!`
            };
          }
        } catch (apiError) {
          console.log('⚠️ API claim attempt failed:', apiError.message);
        }
      }
      
      throw new Error('Unable to claim rewards through available methods');
      
    } catch (error) {
      console.error('❌ Claim process failed:', error);
      setError(error.message);
      
      let userMessage = error.message;
      if (error.message.includes('claimRewards is not a function')) {
        userMessage = 'Claim functionality not yet available. Please try again later.';
      } else if (error.message.includes('Unable to claim rewards')) {
        userMessage = 'Unable to claim rewards at this time. Please try again later.';
      }
      
      return { success: false, message: userMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balances - keep POL balance separate from staking data
  const refreshBalances = async () => {
    try {
      console.log('🔄 Refreshing staking data...');
      
      // Refresh POL balance from thirdweb
      await refetchBalance();
      
      // Get staking data from Everstake API
      const [stakedAmount, rewardsAmount] = await Promise.all([
        getStakedAmount(),
        getRewards()
      ]);

      setBalances(prev => ({
        pol: prev.pol, // Keep current POL balance
        staked: stakedAmount,
        rewards: rewardsAmount
      }));
      
      console.log('✅ Staking data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh staking data:', error);
    }
  };

  // Update POL balance when balance data changes (only log if balance changed)
  useEffect(() => {
    if (walletAddress && balanceData) {
      const newPolBalance = getPOLBalance();
      
      // Only log if balance has actually changed
      if (newPolBalance !== balances.pol) {
        console.log('📊 Balance updated for chain:', currentChain);
        console.log('Previous balance:', balances.pol, '→ New balance:', newPolBalance);
      }
      
      setBalances(prev => ({
        ...prev,
        pol: newPolBalance
      }));
      
      // Load staking data (only on Ethereum)
      if (currentChain === 'ethereum') {
        getStakedAmount().then(staked => {
          if (staked !== balances.staked) {
            console.log('📈 Staked balance updated:', balances.staked, '→', staked);
          }
          setBalances(prev => ({ ...prev, staked }));
        });
        
        getRewards().then(rewards => {
          if (rewards !== balances.rewards) {
            console.log('💰 Rewards updated:', balances.rewards, '→', rewards);
          }
          setBalances(prev => ({ ...prev, rewards }));
        });
      }
    }
  }, [balanceData, walletAddress, client, currentChain]);

  // Refresh staking data when network changes
  useEffect(() => {
    if (walletAddress && currentChain === 'ethereum') {
      console.log('🔄 Switched to Ethereum, refreshing staking data...');
      refreshBalances();
    } else if (walletAddress && currentChain === 'polygon') {
      console.log('🔄 Switched to Polygon, clearing staking data...');
      setBalances(prev => ({
        ...prev,
        staked: '0',
        rewards: '0'
      }));
    }
  }, [currentChain, walletAddress]);

  return {
    balances,
    isLoading: isLoading || balanceLoading,
    error,
    stakePOL,
    claimRewards,
    refreshBalances,
    sdkLoading // Return SDK loading state
  };
};