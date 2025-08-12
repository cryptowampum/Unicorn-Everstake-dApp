import { useState, useEffect } from 'react';
import { Polygon } from '@everstake/wallet-sdk-polygon';
import { CreateToken } from '@everstake/wallet-sdk';
import { useWalletBalance, useSendTransaction } from "thirdweb/react";
import { prepareTransaction } from "thirdweb";
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

  // Use Thirdweb's transaction hook
  const { mutate: sendTransaction, data: txResult, error: txError, isPending: txPending } = useSendTransaction();

  // Debug transaction errors
  useEffect(() => {
    if (txError) {
      console.error('🚨 Thirdweb transaction error:', txError);
      console.error('Error details:', txError.message);
      console.error('Error stack:', txError.stack);
    }
  }, [txError]);

  // Debug transaction results
  useEffect(() => {
    if (txResult) {
      console.log('✅ Thirdweb transaction result:', txResult);
      console.log('Transaction hash:', txResult.transactionHash);
      console.log('Result structure:', Object.keys(txResult));
    }
  }, [txResult]);

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

  // Get staked amount using SDK (not REST API)
  const getStakedAmount = async () => {
    try {
      if (!walletAddress) return '0';
      
      console.log('Getting staked amount for:', walletAddress);
      
      // Only check staking on Ethereum (where staking actually happens)
      if (currentChain !== 'ethereum') {
        console.log('Not on Ethereum, skipping staked balance check');
        return '0';
      }
      
      // Use SDK method instead of REST API
      try {
        console.log('📋 Using SDK getTotalDelegate method...');
        const delegateBalance = await polygonSDK.getTotalDelegate(walletAddress);
        console.log('✅ SDK delegate balance found:', delegateBalance);
        
        // Convert BigNumber to string
        const balanceString = delegateBalance.toString();
        console.log('✅ Staked balance as string:', balanceString);
        return balanceString;
        
      } catch (sdkError) {
        console.log('⚠️ SDK getTotalDelegate call failed:', sdkError.message);
        return '0';
      }
    } catch (error) {
      console.error('Failed to get staked amount:', error);
      return '0';
    }
  };

  // Get pending rewards using SDK (not REST API)
  const getRewards = async () => {
    try {
      if (!walletAddress) return '0';
      
      console.log('Getting rewards for:', walletAddress);
      
      // Only check rewards on Ethereum (where staking happens)
      if (currentChain !== 'ethereum') {
        console.log('Not on Ethereum, skipping rewards check');
        return '0';
      }
      
      // Use SDK method instead of REST API
      try {
        console.log('📋 Using SDK getReward method...');
        const rewardBalance = await polygonSDK.getReward(walletAddress);
        console.log('✅ SDK reward balance found:', rewardBalance);
        
        // Convert BigNumber to string
        const rewardString = rewardBalance.toString();
        console.log('✅ Rewards balance as string:', rewardString);
        return rewardString;
        
      } catch (sdkError) {
        console.log('⚠️ SDK getReward call failed:', sdkError.message);
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
      
      // Step 2: Create auth token and handle approval + delegation
      console.log('🔧 Creating auth token and preparing approval/delegation with SDK...');
      
      const authToken = await createAuthToken();
      
      // Step 2a: Check and handle approval first
      console.log('📋 Step 1: Checking/handling POL approval...');
      const approvalResult = await polygonSDK.approve(
        walletAddress, // address
        amount,        // amount to approve
        true          // isPOL: true for POL token
      );
      
      console.log('✅ Approval result:', approvalResult);
      
      // Handle approval if needed
      if (approvalResult.result === 'approve') {
        console.log('✅ Already approved, proceeding to delegation...');
      } else {
        // approvalResult is a transaction object that needs to be sent
        console.log('📝 Converting Everstake approval to Thirdweb transaction...');
        console.log('🔍 Approval transaction structure:', approvalResult);
        
        try {
          // Convert Everstake transaction to Thirdweb format
          const thirdwebApprovalTx = prepareTransaction({
            to: approvalResult.to,
            data: approvalResult.data,
            gas: approvalResult.gasLimit,
            value: approvalResult.value || 0n,
            chain: mainnet,
            client: client
          });
          
          console.log('✅ Thirdweb approval transaction prepared:', thirdwebApprovalTx);
          console.log('📤 Sending via Thirdweb useSendTransaction...');
          
          // Send using Thirdweb hook
          sendTransaction(thirdwebApprovalTx);
          
          // Wait for transaction hash
          console.log('⏳ Waiting for approval transaction hash...');
          let approvalWaitAttempts = 0;
          while (!txResult?.transactionHash && approvalWaitAttempts < 7) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            approvalWaitAttempts++;
            console.log(`Waiting for approval tx hash... attempt ${approvalWaitAttempts}`);
          }
          
          if (txResult?.transactionHash) {
            console.log('✅ Approval transaction hash:', txResult.transactionHash);
            
            // Use SDK to wait for completion
            console.log('⏳ Waiting for approval transaction to complete...');
            let isLoading = true;
            while (isLoading) {
              try {
                isLoading = await polygonSDK.isTransactionLoading(txResult.transactionHash);
                if (isLoading) {
                  console.log('⏳ Approval still processing...');
                  await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                  console.log('✅ Approval transaction completed!');
                }
              } catch (loadingError) {
                console.log('⚠️ Could not check loading status, assuming completed:', loadingError.message);
                break;
              }
            }
          } else {
            console.log('⚠️ No approval transaction hash received, waiting 15 seconds...');
            await new Promise(resolve => setTimeout(resolve, 15000));
          }
          
        } catch (conversionError) {
          console.error('❌ Failed to convert approval transaction:', conversionError);
          throw new Error(`Approval conversion failed: ${conversionError.message}`);
        }
      }
      
      // Step 2b: Now proceed with delegation
      console.log('📋 Step 2: Calling SDK delegate method...');
      const stakingTxData = await polygonSDK.delegate(
        authToken,    // token: properly generated auth token
        walletAddress, // address: user's address  
        amount,       // amount: amount to stake
        true          // isPOL: true for POL token
      );
      
      console.log('✅ SDK delegation transaction prepared:', stakingTxData);
      
      // Step 3: Convert and submit delegation transaction (same as approval)
      console.log('📝 Converting Everstake delegation to Thirdweb transaction...');
      console.log('🔍 Delegation transaction structure:', stakingTxData);
      
      try {
        // Convert Everstake delegation transaction to Thirdweb format
        const thirdwebDelegationTx = prepareTransaction({
          to: stakingTxData.to,
          data: stakingTxData.data,
          gas: stakingTxData.gasLimit,
          value: stakingTxData.value || 0n,
          chain: mainnet,
          client: client
        });
        
        console.log('✅ Thirdweb delegation transaction prepared:', thirdwebDelegationTx);
        console.log('📤 Sending delegation via Thirdweb useSendTransaction...');
        
        // Send using Thirdweb hook (same as approval)
        sendTransaction(thirdwebDelegationTx);
        
        // Wait for transaction hash (need to wait for new result after approval)
        console.log('⏳ Waiting for delegation transaction hash...');
        let delegationWaitAttempts = 0;
        let delegationTxHash = null;
        
        // Wait for new transaction result
        while (!delegationTxHash && delegationWaitAttempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (txResult?.transactionHash) {
            delegationTxHash = txResult.transactionHash;
            console.log('✅ Delegation transaction hash:', delegationTxHash);
            break;
          }
          delegationWaitAttempts++;
          console.log(`Waiting for delegation tx hash... attempt ${delegationWaitAttempts}`);
        }
        
        if (delegationTxHash) {
          console.log('⏳ Waiting for delegation transaction to complete...');
          
          // Use SDK method to check transaction status
          let isLoading = true;
          let loadingAttempts = 0;
          while (isLoading && loadingAttempts < 20) {
            try {
              isLoading = await polygonSDK.isTransactionLoading(delegationTxHash);
              if (isLoading) {
                console.log(`⏳ Delegation still processing... attempt ${loadingAttempts + 1}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                loadingAttempts++;
              } else {
                console.log('✅ Delegation transaction completed!');
              }
            } catch (loadingError) {
              console.log('⚠️ Could not check loading status, assuming completed:', loadingError.message);
              break;
            }
          }
          
          console.log('🔄 Refreshing balances after confirmed delegation...');
          await refreshBalances();
          
          return { 
            success: true, 
            message: `Successfully staked ${amount} POL! Transaction confirmed.`,
            transactionHash: delegationTxHash
          };
          
        } else {
          console.log('❌ No delegation transaction hash received');
          return { 
            success: false, 
            message: 'Delegation transaction failed - no transaction hash received'
          };
        }
        
      } catch (conversionError) {
        console.error('❌ Failed to convert delegation transaction:', conversionError);
        throw new Error(`Delegation conversion failed: ${conversionError.message}`);
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
      
      // Step 3: Submit prepared transaction using Thirdweb hook
      console.log('📝 Submitting prepared claim transaction via Thirdweb hook...');
      
      // Use the hook's sendTransaction function
      sendTransaction(claimTxData);
      
      console.log('✅ Claim transaction submitted successfully');
      
      // Wait for network update
      console.log('⏳ Waiting for network update...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 Refreshing balances after successful claim...');
      await refreshBalances();
      
      return { 
        success: true, 
        message: `Successfully claimed ${rewardsAmount} POL rewards! Transaction submitted.`,
        transactionHash: txResult?.transactionHash || 'pending'
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
    isLoading: isLoading || balanceLoading || txPending,
    error: error || txError,
    stakePOL,
    claimRewards,
    refreshBalances,
    txResult
  };
};