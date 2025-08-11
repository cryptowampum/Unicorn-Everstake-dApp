// Utility functions for formatting data
import { formatUnits,isAddress } from 'ethers';

export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 4) => {
  try {
    const formatted = ethers.formatUnits(amount, decimals);
    const number = parseFloat(formatted);
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals
    });
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

export const formatAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatPercentage = (value, decimals = 2) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

export const formatTimeRemaining = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};
