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

  // Utility function to create auth tokens
  const createAuthToken = async () => {
    try {
      const companyName = "Unicorn";  // Your dApp name
      const tokenType = "SDK";        // Token type as per docs
      
      const authToken = await CreateToken(companyName, tokenType);
      return authToken;
    } catch (tokenError) {
      console.error('❌ Failed to create auth token:', tokenError);
      throw new Error(`Auth token creation failed: ${tokenError.message}`);
    }
  };

  // Get POL balance using Thirdweb hook data
  const getPOLBalance = () => {
    try {
      if (balanceData) {
        // Use displayValue if available (already formatted by Thirdweb)
        if (balanceData.displayValue) {
          const numericBalance = parseFloat(balanceData.displayValue);
          return numericBalance.toFixed(6);
        }
        
        // Fallback to manual formatting if displayValue not available
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

  // Get staked amount using SDK
  const getStakedAmount = async () => {
    try {
      if (!walletAddress) return '0';
      
      // Only check staking on Ethereum (where staking actually happens)
      if (currentChain !== 'ethereum') {
        return '0';
      }
      
      try {
        const delegateBalance = await polygonSDK.getTotalDelegate(walletAddress);
        return delegateBalance.toString();
      } catch (sdkError) {
        console.log('⚠️ SDK getTotalDelegate call failed:', sdkError.message);
        return '0';
      }
    } catch (error) {
      console.error('Failed to get staked amount:', error);
      return '0';
    }
  };

  // Get pending rewards using SDK
  const getRewards = async () => {
    try {
      if (!walletAddress) return '0';
      
      // Only check rewards on Ethereum (where staking happens)
      if (currentChain !== 'ethereum') {
        return '0';
      }
      
      try {
        const rewardBalance = await polygonSDK.getReward(walletAddress);
        return rewardBalance.toString();
      } catch (sdkError) {
        console.log('⚠️ SDK getReward call failed:', sdkError.message);
        return '0';
      }
    } catch (error) {
      console.error('Failed to get rewards:', error);
      return '0';
    }
  };

  // Main staking function using SDK + Thirdweb integration
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
      
      // Check if user has enough POL
      const currentBalance = parseFloat(balances.pol);
      const stakeAmount = parseFloat(amount);
      
      if (stakeAmount > currentBalance) {
        throw new Error(`Insufficient balance. You have ${currentBalance} POL`);
      }
      
      // Step 1: Ensure we're on Ethereum mainnet
      try {
        await wallet.switchChain(mainnet);
      } catch (chainError) {
        console.warn('Chain switch failed or not needed:', chainError);
      }
      
      // Step 2: Create auth token and handle approval
      const authToken = await createAuthToken();
      
      const approvalResult = await polygonSDK.approve(
        walletAddress, // address
        amount,        // amount to approve
        true          // isPOL: true for POL token
      );
      
      // Handle approval if needed
      if (approvalResult.result === 'approve') {
        console.log('✅ Already approved, proceeding to delegation...');
      } else {
        // Convert Everstake approval to Thirdweb transaction
        const thirdwebApprovalTx = prepareTransaction({
          to: approvalResult.to,
          data: approvalResult.data,
          gas: approvalResult.gasLimit,
          value: approvalResult.value || 0n,
          chain: mainnet,
          client: client
        });
        
        // Send approval transaction
        sendTransaction(thirdwebApprovalTx);
        
        // Wait for approval transaction hash
        let approvalWaitAttempts = 0;
        while (!txResult?.transactionHash && approvalWaitAttempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          approvalWaitAttempts++;
        }
        
        if (txResult?.transactionHash) {
          // Wait for approval transaction to complete
          let isLoading = true;
          while (isLoading) {
            try {
              isLoading = await polygonSDK.isTransactionLoading(txResult.transactionHash);
              if (isLoading) {
                await new Promise(resolve => setTimeout(resolve, 3000));
              }
            } catch (loadingError) {
              break;
            }
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
      
      // Step 3: Prepare and send delegation transaction
      const stakingTxData = await polygonSDK.delegate(
        authToken,    // token: properly generated auth token
        walletAddress, // address: user's address  
        amount,       // amount: amount to stake
        true          // isPOL: true for POL token
      );
      
      // Convert Everstake delegation to Thirdweb transaction
      const thirdwebDelegationTx = prepareTransaction({
        to: stakingTxData.to,
        data: stakingTxData.data,
        gas: stakingTxData.gasLimit,
        value: stakingTxData.value || 0n,
        chain: mainnet,
        client: client
      });
      
      // Send delegation transaction
      sendTransaction(thirdwebDelegationTx);
      
      // Wait for NEW delegation transaction hash (different from approval)
      let delegationWaitAttempts = 0;
      let delegationTxHash = null;
      const approvalTxHash = txResult?.transactionHash; // Store previous approval hash
      
      while (!delegationTxHash && delegationWaitAttempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Only accept if it's a different hash than the approval
        if (txResult?.transactionHash && txResult.transactionHash !== approvalTxHash) {
          delegationTxHash = txResult.transactionHash;
          console.log('✅ Delegation transaction hash:', delegationTxHash);
          break;
        }
        delegationWaitAttempts++;
        if (delegationWaitAttempts % 5 === 0) {
          console.log(`Waiting for delegation tx hash... attempt ${delegationWaitAttempts}`);
        }
      }
      
      if (delegationTxHash) {
        // Wait for delegation transaction to complete
        let isLoading = true;
        let loadingAttempts = 0;
        while (isLoading && loadingAttempts < 20) {
          try {
            isLoading = await polygonSDK.isTransactionLoading(delegationTxHash);
            if (isLoading) {
              await new Promise(resolve => setTimeout(resolve, 3000));
              loadingAttempts++;
            }
          } catch (loadingError) {
            break;
          }
        }
        
        // Refresh balances after confirmed delegation
        await refreshBalances();
        
        return { 
          success: true, 
          message: `Successfully staked ${amount} POL!`,
          transactionHash: delegationTxHash
        };
        
      } else {
        // FALLBACK: Check if staking actually worked by checking balance increase
        console.log('⚠️ No delegation hash detected, checking if staking succeeded via balance...');
        
        const originalStakedBalance = parseFloat(balances.staked);
        
        // Wait a bit for blockchain to update
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Refresh balances and check if staked amount increased
        await refreshBalances();
        
        // Get fresh staked balance after refresh
        const newStakedBalance = await getStakedAmount();
        const newStakedNum = parseFloat(newStakedBalance);
        
        if (newStakedNum > originalStakedBalance) {
          // Staking succeeded even though we didn't get the hash
          return { 
            success: true, 
            message: `Successfully staked ${amount} POL! (Transaction completed but hash not captured)`,
            transactionHash: 'Transaction completed successfully'
          };
        } else {
          return { 
            success: false, 
            message: 'Delegation transaction failed - no transaction hash received and no balance increase detected'
          };
        }
      }
      
    } catch (error) {
      console.error('❌ Staking process failed:', error);
      setError(error.message);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        userMessage = 'Insufficient ETH for gas fees. You need ETH for transaction fees.';
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

  // Claim rewards using SDK
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
      
      // Ensure we're on Ethereum mainnet
      try {
        await wallet.switchChain(mainnet);
      } catch (chainError) {
        console.warn('Chain switch failed or not needed:', chainError);
      }
      
      // Prepare claim transaction using SDK
      const claimTxData = await polygonSDK.claimRewards(walletAddress);
      
      // Convert to Thirdweb transaction
      const thirdwebClaimTx = prepareTransaction({
        to: claimTxData.to,
        data: claimTxData.data,
        gas: claimTxData.gasLimit,
        value: claimTxData.value || 0n,
        chain: mainnet,
        client: client
      });
      
      // Send claim transaction
      sendTransaction(thirdwebClaimTx);
      
      // Wait for transaction hash
      let claimWaitAttempts = 0;
      let claimTxHash = null;
      
      while (!claimTxHash && claimWaitAttempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (txResult?.transactionHash) {
          claimTxHash = txResult.transactionHash;
          break;
        }
        claimWaitAttempts++;
      }
      
      if (claimTxHash) {
        // Wait for claim transaction to complete
        let isLoading = true;
        let loadingAttempts = 0;
        while (isLoading && loadingAttempts < 20) {
          try {
            isLoading = await polygonSDK.isTransactionLoading(claimTxHash);
            if (isLoading) {
              await new Promise(resolve => setTimeout(resolve, 3000));
              loadingAttempts++;
            }
          } catch (loadingError) {
            break;
          }
        }
        
        // Refresh balances after claim
        await refreshBalances();
        
        return { 
          success: true, 
          message: `Successfully claimed ${rewardsAmount} POL rewards!`,
          transactionHash: claimTxHash
        };
      } else {
        return { 
          success: false, 
          message: 'Claim transaction failed - no transaction hash received'
        };
      }
      
    } catch (error) {
      console.error('❌ Claim process failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all balances
  const refreshBalances = async () => {
    try {
      const [polBalance, stakedAmount, rewardsAmount] = await Promise.all([
        Promise.resolve(getPOLBalance()),
        getStakedAmount(),
        getRewards()
      ]);

      setBalances({
        pol: polBalance,
        staked: stakedAmount,
        rewards: rewardsAmount
      });
      
      // Also refresh POL balance from Thirdweb
      if (refetchBalance) {
        refetchBalance();
      }
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error);
    }
  };

  // Update balances when balance data changes or network switches
  useEffect(() => {
    if (walletAddress && balanceData) {
      const polBalance = getPOLBalance();
      
      // Update POL balance immediately
      setBalances(prev => ({
        ...prev,
        pol: polBalance
      }));
      
      // Then load staking data
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
      refreshBalances();
    }
  }, [currentChain]);

  return {
    balances,
    isLoading: isLoading || balanceLoading || txPending,
    error: error || txError,
    stakePOL,
    claimRewards,
    refreshBalances
  };
};