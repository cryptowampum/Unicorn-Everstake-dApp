// Input validation utilities
import { parseEther, isAddress } from 'ethers';

export const validateStakeAmount = (amount, maxAmount, minAmount = '0') => {
  const errors = [];

  if (!amount || amount.trim() === '') {
    errors.push('Amount is required');
    return errors;
  }

  try {
    const amountBN = ethers.parseEther(amount);
    const maxAmountBN = ethers.parseEther(maxAmount);
    const minAmountBN = ethers.parseEther(minAmount);

    if (amountBN <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (amountBN > maxAmountBN) {
      errors.push(`Amount exceeds available balance (${maxAmount} POL)`);
    }

    if (amountBN < minAmountBN) {
      errors.push(`Amount must be at least ${minAmount} POL`);
    }
  } catch (error) {
    errors.push('Invalid amount format');
  }

  return errors;
};

export const validateEthereumAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

export const validateGasBalance = (ethBalance, requiredGas = '0.05') => {
  try {
    const balanceBN = ethers.parseEther(ethBalance);
    const requiredBN = ethers.parseEther(requiredGas);
    return balanceBN >= requiredBN;
  } catch (error) {
    return false;
  }
};
