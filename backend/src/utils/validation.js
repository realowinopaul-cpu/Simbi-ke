/**
 * Validate Kenyan phone number
 */
const validateKenyanPhone = (phone) => {
  // Accept formats: 2547XXXXXXXX, +2547XXXXXXXX, 07XXXXXXXX
  const phoneRegex = /^(254|\+254|0)?([71])(\d{8})$/;
  return phoneRegex.test(phone);
};

/**
 * Normalize Kenyan phone number to 254 format
 */
const normalizePhone = (phone) => {
  if (!validateKenyanPhone(phone)) return null;
  
  let normalized = phone.replace(/^\+/, '').replace(/^0/, '');
  if (!normalized.startsWith('254')) {
    normalized = '254' + normalized;
  }
  return normalized;
};

/**
 * Mask phone number for display
 */
const maskPhone = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  return `${normalized.slice(0, 4)}****${normalized.slice(-2)}`;
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return (
    password.length >= minLength &&
    (hasUpperCase || hasLowerCase) &&
    hasNumbers
  );
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate stake amount
 */
const validateStakeAmount = (amount) => {
  return amount >= 10 && amount <= 20000 && amount % 40 === 10;
};

module.exports = {
  validateKenyanPhone,
  normalizePhone,
  maskPhone,
  validatePassword,
  validateEmail,
  validateStakeAmount,
};
