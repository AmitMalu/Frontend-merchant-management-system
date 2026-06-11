/**
 * Formatting utilities for settlement UI
 */

export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '—';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateStr;
  }
};

export const formatPercentage = (rate) => {
  if (!rate && rate !== 0) return '—';
  return `${(rate).toFixed(2)}%`;
};

export const truncateText = (text, maxLength = 20) => {
  if (!text) return '—';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};