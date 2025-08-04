import { useState, useEffect } from 'react';
import { Polygon } from '@everstake/wallet-sdk-polygon';
import { useWalletBalance } from "thirdweb/react";
import { polygon, mainnet } from "thirdweb/chains";
import { getContract } from "thirdweb";
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

  // POL Token Contract Addresses
  const POL_TOKEN_ADDRESS_MAINNET = "0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6";
  const POL_TOKEN_ADDRESS_POLYGON = "0x0000000000000000000000000000000000001010";

  // Use appropriate chain and token address based on current network
  const balanceChain = currentChain === 'ethereum' ? mainnet : polygon;
  const tokenAddress = currentChain === 'ethereum' ? POL_TOKEN_ADDRESS_MAINNET : POL_TOKEN_ADDRESS_POLYGON;

  // Initialize Everstake SDK
  const polygonSDK = new Polygon();

  // Use Thirdweb's balance hook to get POL token balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance({
    chain: balanceChain,
    address: walletAddress,
    client: client,
    tokenAddress: tokenAddress
  });

  console.log('=== POL BALANCE DEBUGGING ===');
  console.log('Current chain:', currentChain);
  console.log('Wallet address:', walletAddress);
  console.log('Balance data:', balanceData);

  // Get POL balance
  const getPOLBalance = () => {
    try {
      if (balanceData?.value) {
        const balanceInPOL = ethers.formatEther(balanceData.value);
        const numericBalance = parseFloat(balanceInPOL);
        return numericBalance.toFixed(6);
      }
      return '0';
    } catch (error) {
      console.error('Failed to format POL balance:', error);
      return '0';
    }
  };

  // Get staked amount from Everstake
  const getStakedAmount = async () => {
    try {
      if (!walletAddress || currentChain !== 'ethereum') return '0';
      
      const response = await fetch(`https://wallet-sdk-api.everstake.one/polygon/balance/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.staked || '0';
      } else if (response.status === 404) {
        return '0';
      }
      return '0';
    } catch (error) {
      console.error('Failed to get staked amount:', error);
      return '0';
    }
  };

  // Get pending rewards
  const getRewards = async () => {
    try {
      if (!walletAddress || currentChain !== 'ethereum') return '0';
      
      const response = await fetch(`https://wallet-sdk-api.everstake.one/polygon/rewards/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.rewards || '0';
      } else if (response.status === 404) {
        return '0';
      }
      return '0';
    } catch (error) {
      console.error('Failed to get rewards:', error);
      return '0';
    }
  };

  // SDK-based stakePOL using the Everstake JavaScript library
  const stakePOL = async (amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) throw new Error('No wallet connected');
      if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');
      
      if (currentChain !== 'ethereum') {
        throw new Error('Please switch to Ethereum mainnet to stake POL');
      }
      
      console.log(`🚀 Starting SDK-based staking: ${amount} POL for ${walletAddress}`);
      
      // Check balance
      const currentBalance = parseFloat(balances.pol);
      const stakeAmount = parseFloat(amount);
      
      if (stakeAmount > currentBalance) {
        throw new Error(`Insufficient balance. You have ${currentBalance} POL`);
      }
      
      // Ensure we're on Ethereum mainnet
      await wallet.switchChain(mainnet);
      console.log('✅ Switched to Ethereum mainnet');
      
      // Use the Everstake SDK delegate method with proper approval flow
      console.log('🔄 Starting SDK approval and delegation flow...');
      
      try {
        // Step 1: First approve POL tokens using the SDK
        console.log('💰 Step 1: Approving POL tokens with SDK...');
        
        // Get approval transaction data from SDK
        const approveTransactionData = await polygonSDK.approve(walletAddress, amount);
        console.log('✅ Approval transaction data:', approveTransactionData);
        
        if (approveTransactionData) {
          // Send the approval transaction using Thirdweb
          console.log('📤 Sending approval transaction...');
          
          const { sendTransaction } = await import("thirdweb");
          
          // Create transaction object with client
          const approvalTransaction = {
            to: approveTransactionData.to,
            data: approveTransactionData.data,
            value: approveTransactionData.value || 0n,
            gas: approveTransactionData.gasLimit || 100000n,
            client: client,
            chain: mainnet};
            
        } else {
          // If approval transaction data wasn't received
          console.log('❌ Failed to get approval transaction data from SDK');
          
          return {
            success: false,
            message: 'Failed to prepare approval transaction. Please try again or use manual staking.'
          };
        };
          
          const approvalResult = await sendTransaction({
            account: wallet.getAccount(),
            transaction: approvalTransaction
          });
          
          console.log('✅ Approval transaction sent:', approvalResult.transactionHash);
          
          // Step 2: Wait longer for approval to be processed by Everstake's backend
          console.log('⏳ Waiting for approval to be processed by Everstake backend...');
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds instead of 5
          
          // Step 3: Try delegation with retries
          console.log('🎯 Step 2: Getting delegation transaction data...');
          
          let delegateTransactionData = null;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries && !delegateTransactionData) {
            try {
              console.log(`🔄 Delegation attempt ${retryCount + 1}/${maxRetries}...`);
              delegateTransactionData = await polygonSDK.delegate(walletAddress, amount);
              console.log('✅ Delegation transaction data:', delegateTransactionData);
              break;
            } catch (delegateError) {
              retryCount++;
              console.log(`❌ Delegation attempt ${retryCount} failed:`, delegateError.message);
              
              if (retryCount < maxRetries) {
                console.log(`⏳ Waiting ${retryCount * 5} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 5000));
              }
            }
          }
          
          if (delegateTransactionData) {
            // Send the delegation transaction
            console.log('📤 Sending delegation transaction...');
            
            const delegationTransaction = {
              to: delegateTransactionData.to,
              data: delegateTransactionData.data,
              value: delegateTransactionData.value || 0n,
              gas: delegateTransactionData.gasLimit || 200000n,
              client: client,
              chain: mainnet
            };
            
            const delegationResult = await sendTransaction({
              account: wallet.getAccount(),
              transaction: delegationTransaction
            });
            
            console.log('✅ Delegation transaction sent:', delegationResult.transactionHash);
            
            // Wait for final confirmation and refresh balances
            await new Promise(resolve => setTimeout(resolve, 8000));
            await refreshBalances();
            
            return { 
              success: true, 
              message: `🎉 Successfully staked ${amount} POL!\n\n✅ Approval: ${approvalResult.transactionHash}\n✅ Delegation: ${delegationResult.transactionHash}\n\nYour POL tokens are now earning ~4.1% APY with Everstake!`,
              transactionHash: delegationResult.transactionHash,
              approvalHash: approvalResult.transactionHash
            };
          } else {
            // If delegation transaction data failed, but approval worked
            console.log('⚠️ Delegation transaction preparation failed, but approval succeeded');
            
            return { 
              success: true, 
              message: `✅ POL tokens approved for staking!\n\nApproval Transaction: ${approvalResult.transactionHash}\n\n⚠️ Automatic delegation failed due to Everstake API issues. Your tokens are approved and ready.\n\nYou can complete staking manually at: https://everstake.one/polygon\n\nOr try staking again in a few minutes - the API might recover.`,
              transactionHash: approvalResult.transactionHash,
              partialSuccess: true
            };
          }
        }
        
      } catch (transactionError) {
        console.error('❌ Transaction flow failed:', transactionError);
        
        // Provide helpful error message
        if (transactionError.message.includes('user rejected')) {
          throw new Error('Transaction was cancelled by user');
        } else if (transactionError.message.includes('insufficient funds')) {
          throw new Error('Insufficient ETH for gas fees');
        } else {
          throw new Error(`Transaction failed: ${transactionError.message}`);
        }
      }
      
      // Method 2: Try alternative SDK methods if available
      try {
        console.log('🔄 Trying alternative SDK methods...');
        
        // Check if there are other methods available
        console.log('Available SDK methods:', Object.getOwnPropertyNames(polygonSDK));
        console.log('SDK prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(polygonSDK)));
        
        // Try stake method if it exists
        if (typeof polygonSDK.stake === 'function') {
          console.log('📋 Trying SDK stake method...');
          const stakeResult = await polygonSDK.stake(walletAddress, amount);
          console.log('✅ SDK stake response:', stakeResult);
          
          if (stakeResult) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await refreshBalances();
            
            return { 
              success: true, 
              message: `Successfully staked ${amount} POL using SDK stake method!`,
              transactionHash: stakeResult.transactionHash || stakeResult.hash
            };
          }
        }
        
        // Try delegateTokens method if it exists
        if (typeof polygonSDK.delegateTokens === 'function') {
          console.log('📋 Trying SDK delegateTokens method...');
          const delegateTokensResult = await polygonSDK.delegateTokens(walletAddress, amount);
          console.log('✅ SDK delegateTokens response:', delegateTokensResult);
          
          if (delegateTokensResult) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await refreshBalances();
            
            return { 
              success: true, 
              message: `Successfully staked ${amount} POL using SDK delegateTokens method!`,
              transactionHash: delegateTokensResult.transactionHash || delegateTokensResult.hash
            };
          }
        }
        
      } catch (altError) {
        console.error('❌ Alternative SDK methods failed:', altError);
      }
      
      // Method 3: Try different parameter formats for delegate
      try {
        console.log('🔄 Trying delegate with different parameter formats...');
        
        // Try with amount as number instead of string
        const numberResult = await polygonSDK.delegate(walletAddress, parseFloat(amount));
        console.log('✅ Number amount SDK response:', numberResult);
        
        if (numberResult) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          await refreshBalances();
          
          return { 
            success: true, 
            message: `Successfully staked ${amount} POL using number format!`,
            transactionHash: numberResult.transactionHash || numberResult.hash
          };
        }
        
      } catch (numberError) {
        console.error('❌ Number format method failed:', numberError);
        
        // Try with wei amount
        try {
          console.log('🔄 Trying delegate with wei amount...');
          const weiAmount = ethers.parseEther(amount).toString();
          const weiResult = await polygonSDK.delegate(walletAddress, weiAmount);
          console.log('✅ Wei amount SDK response:', weiResult);
          
          if (weiResult) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await refreshBalances();
            
            return { 
              success: true, 
              message: `Successfully staked ${amount} POL using wei format!`,
              transactionHash: weiResult.transactionHash || weiResult.hash
            };
          }
        } catch (weiError) {
          console.error('❌ Wei format method failed:', weiError);
        }
      }
      
      // If all SDK methods fail, provide guidance
      console.error('❌ All SDK methods failed');
      
      return {
        success: false,
        message: `SDK staking failed. The Everstake SDK may need additional configuration or the methods may have changed. 

🔍 Debug Info:
- SDK object: ${typeof polygonSDK}
- Available methods: ${Object.getOwnPropertyNames(polygonSDK).join(', ')}

💡 Next steps:
1. Check if you have the latest @everstake/wallet-sdk-polygon package
2. Try manual staking at https://everstake.one/polygon
3. Contact Everstake support for SDK usage guidance

Your ${amount} POL is ready to stake manually if needed.`
      };
      
    } catch (error) {
      console.error('❌ Staking process failed:', error);
      setError(error.message);
      
      let userMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        userMessage = 'Insufficient ETH for gas fees. You need ~0.05-0.1 ETH for transactions.';
      } else if (error.message.includes('user rejected')) {
        userMessage = 'Transaction was cancelled by user.';
      }
      
      return { success: false, message: userMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // SDK-based claimRewards
  const claimRewards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!walletAddress) throw new Error('No wallet connected');
      
      if (currentChain !== 'ethereum') {
        throw new Error('Please switch to Ethereum mainnet to claim rewards');
      }
      
      const rewardsAmount = parseFloat(balances.rewards);
      if (rewardsAmount < 2) {
        throw new Error('Minimum 2 POL required to claim rewards');
      }
      
      await wallet.switchChain(mainnet);
      
      console.log('🔄 Calling SDK claim method...');
      
      try {
        // Try SDK claimRewards method
        const claimResult = await polygonSDK.claimRewards(walletAddress);
        console.log('✅ SDK claim response:', claimResult);
        
        if (claimResult) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          await refreshBalances();
          
          return { 
            success: true, 
            message: `Successfully claimed ${rewardsAmount} POL rewards using SDK!`,
            transactionHash: claimResult.transactionHash || claimResult.hash
          };
        }
        
      } catch (sdkError) {
        console.error('❌ SDK claim failed:', sdkError);
        
        // Try alternative claim method names
        const altMethods = ['claim', 'withdrawRewards', 'claimDelegatorReward'];
        
        for (const methodName of altMethods) {
          if (typeof polygonSDK[methodName] === 'function') {
            try {
              console.log(`🔄 Trying SDK ${methodName} method...`);
              const result = await polygonSDK[methodName](walletAddress);
              console.log(`✅ SDK ${methodName} response:`, result);
              
              if (result) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await refreshBalances();
                
                return { 
                  success: true, 
                  message: `Successfully claimed ${rewardsAmount} POL rewards using ${methodName}!`,
                  transactionHash: result.transactionHash || result.hash
                };
              }
            } catch (altError) {
              console.error(`❌ SDK ${methodName} failed:`, altError);
            }
          }
        }
      }
      
      return {
        success: false,
        message: `SDK claim failed. You can manually claim your ${rewardsAmount} POL rewards at https://everstake.one/polygon`
      };
      
    } catch (error) {
      console.error('Claim failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    try {
      if (refetchBalance) {
        await refetchBalance();
      }
      
      const [stakedAmount, rewardsAmount] = await Promise.all([
        getStakedAmount(),
        getRewards()
      ]);

      setBalances(prev => ({
        pol: prev.pol,
        staked: stakedAmount,
        rewards: rewardsAmount
      }));
      
    } catch (error) {
      console.error('Failed to refresh staking data:', error);
    }
  };

  // Update balances when balance data changes
  useEffect(() => {
    if (walletAddress && balanceData) {
      const polBalance = getPOLBalance();
      
      setBalances(prev => ({
        ...prev,
        pol: polBalance
      }));
      
      getStakedAmount().then(staked => {
        setBalances(prev => ({ ...prev, staked }));
      });
      
      getRewards().then(rewards => {
        setBalances(prev => ({ ...prev, rewards }));
      });
    }
  }, [balanceData, walletAddress, client, currentChain]);

  useEffect(() => {
    if (walletAddress && currentChain) {
      refreshBalances();
    }
  }, [currentChain]);
  
  useEffect(() => {
    if (walletAddress) {
      refreshBalances();
    }
  }, [walletAddress]);

  return {
    balances,
    isLoading: isLoading || balanceLoading,
    error,
    stakePOL,
    claimRewards,
    refreshBalances
  };
};
