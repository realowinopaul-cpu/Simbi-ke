const crypto = require('crypto');
const geoip = require('geoip-lite');

const helpers = {
  // Format Kenyan phone number
  formatPhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    return null;
  },

  // Generate OTP
  generateOTP: (length = 6) => {
    return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
  },

  // Secure random outcome generator (maize toss)
  generateMaizeTossOutcome: () => {
    // Generate 4 random bits (0-15)
    const randomNum = crypto.randomInt(0, 16);
    const bits = randomNum.toString(2).padStart(4, '0');
    const outcome = bits.split('').map(b => parseInt(b) === 0 ? 'B' : 'W');
    
    // Count whites and blacks
    const whiteCount = outcome.filter(x => x === 'W').length;
    const blackCount = outcome.filter(x => x === 'B').length;
    
    // Determine win (50% distribution)
    const winConditions = [
      whiteCount === 2 && blackCount === 2,
      whiteCount === 4 && blackCount === 0,
      whiteCount === 0 && blackCount === 4
    ];
    
    return {
      outcome,
      whiteCount,
      blackCount,
      isWin: winConditions.some(c => c),
      randomNum
    };
  },

  // Verify geolocation (Kenya only)
  isKenyaLocation: (ip) => {
    const geo = geoip.lookup(ip);
    return geo && (geo.country === 'KE' || geo.country === 'GB'); // GB for testing/VPN
  },

  // Hash phone for privacy
  hashPhone: (phone) => {
    const formatted = helpers.formatPhoneNumber(phone);
    return crypto.createHash('sha256').update(formatted).digest('hex');
  },

  // Mask phone for display
  maskPhone: (phone) => {
    const formatted = helpers.formatPhoneNumber(phone);
    return formatted.substring(0, 7) + 'XXXX' + formatted.substring(11);
  },

  // Generate username from phone
  generateUsername: (phone) => {
    const formatted = helpers.formatPhoneNumber(phone);
    const suffix = formatted.substring(7, 11);
    return `Player${suffix}`;
  },

  // Calculate room stake
  calculateRoomStake: (roomIndex) => {
    const minStake = parseInt(process.env.MIN_STAKE) || 10;
    const increment = parseInt(process.env.STAKE_INCREMENT) || 40;
    return minStake + (roomIndex * increment);
  },

  // Calculate deposit credit (after VAT)
  calculateDepositCredit: (amount) => {
    const vat = (parseInt(process.env.DEPOSIT_VAT_PERCENTAGE) || 5) / 100;
    return amount * (1 - vat);
  },

  // Calculate withdrawal deduction (including fee)
  calculateWithdrawalDeduction: (amount) => {
    const fee = (parseInt(process.env.WITHDRAWAL_FEE_PERCENTAGE) || 10) / 100;
    return amount * (1 + fee);
  },

  // Generate transaction ID
  generateTransactionId: () => {
    return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  },

  // Get client IP
  getClientIp: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.socket.remoteAddress ||
           '127.0.0.1';
  }
};

module.exports = helpers;
