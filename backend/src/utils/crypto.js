const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Generate cryptographically secure toss outcome
 * Ensures 50-50 win probability with 16 possible combinations
 */
const generateTossOutcome = () => {
  try {
    // Generate 4 random bytes (one for each maize)
    const randomBytes = crypto.randomBytes(4);
    
    // Convert to binary representation (0 = BLACK, 1 = WHITE)
    const result = Array.from(randomBytes).map((byte) => {
      // Use least significant bit for binary outcome
      return byte % 2 === 0 ? 'BLACK' : 'WHITE';
    });

    return {
      result,
      combination: result.join(''),
      isWinning: isWinningOutcome(result),
    };
  } catch (error) {
    logger.error('Error generating toss outcome:', error);
    throw error;
  }
};

/**
 * Determine if outcome is winning (50% probability)
 * WINNING: 2W+2B, 4W, 4B
 * LOSING: 3W+1B, 1W+3B
 */
const isWinningOutcome = (result) => {
  const whiteCount = result.filter((m) => m === 'WHITE').length;
  const blackCount = 4 - whiteCount;

  // 2W + 2B (always winning)
  if (whiteCount === 2 && blackCount === 2) return true;
  // 4W (always winning)
  if (whiteCount === 4) return true;
  // 4B (always winning)
  if (blackCount === 4) return true;
  // 3W+1B or 1W+3B (losing)
  return false;
};

/**
 * Generate random UUID v4
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Generate OTP code
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Hash sensitive data
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate device fingerprint
 */
const generateFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress;
  const data = `${userAgent}-${ip}`;
  return hashData(data);
};

module.exports = {
  generateTossOutcome,
  isWinningOutcome,
  generateUUID,
  generateOTP,
  hashData,
  generateFingerprint,
};
