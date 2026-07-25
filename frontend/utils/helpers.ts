export const validatePhoneNumber = (phone: string): boolean => {
  const kenyanPhoneRegex = /^(254|0)(7|1)\d{8}$|^254\d{9}$/;
  return kenyanPhoneRegex.test(phone.replace(/[- ()]/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.slice(1);
  }
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  return '254' + cleaned;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return (wins / total) * 100;
};
