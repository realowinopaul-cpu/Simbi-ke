const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const { normalizePhone } = require('../utils/validation');
const { generateOTP, generateFingerprint } = require('../utils/crypto');
const pool = require('../config/database');
const redisClient = require('../config/redis');

class AuthController {
  static async register(req, res, next) {
    try {
      const { phone_number, password, confirm_password } = req.validated;

      if (password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const normalized_phone = normalizePhone(phone_number);
      const existingUser = await User.findByPhone(normalized_phone);

      if (existingUser) {
        return res.status(409).json({ error: 'Phone number already registered' });
      }

      // Generate OTP
      const otp_code = generateOTP();
      const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await pool.query(
        `INSERT INTO otp_verifications (phone_number, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        [normalized_phone, otp_code, expires_at]
      );

      // TODO: Send OTP via SMS using AfricasTalking
      logger.info(`OTP for ${normalized_phone}: ${otp_code}`);

      res.status(200).json({
        message: 'OTP sent to your phone',
        phone_number: normalized_phone,
        expiresIn: 600, // seconds
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  static async verifyOTP(req, res, next) {
    try {
      const { phone_number, otp_code, password } = req.body;
      const normalized_phone = normalizePhone(phone_number);

      // Check OTP
      const otpRes = await pool.query(
        `SELECT * FROM otp_verifications WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() AND is_verified = false
         ORDER BY created_at DESC LIMIT 1`,
        [normalized_phone, otp_code]
      );

      if (otpRes.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Mark OTP as verified
      await pool.query(
        `UPDATE otp_verifications SET is_verified = true WHERE id = $1`,
        [otpRes.rows[0].id]
      );

      // Create user
      const username = `Player ${normalized_phone.slice(-4)}`;
      const user = await User.create({
        phone_number: normalized_phone,
        password,
        username,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, phone_number: user.phone_number, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000, // 30 minutes
      });

      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: user.id,
          username: user.username,
          phone_number: user.phone_number,
          balance: user.balance,
        },
        token,
      });
    } catch (error) {
      logger.error('OTP verification error:', error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { phone_number, password, remember_me } = req.validated;
      const normalized_phone = normalizePhone(phone_number);

      const user = await User.findByPhone(normalized_phone);
      if (!user) {
        return res.status(401).json({ error: 'Invalid phone or password' });
      }

      const isPasswordValid = await User.verifyPassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid phone or password' });
      }

      if (!user.is_verified) {
        return res.status(403).json({ error: 'Account not verified' });
      }

      // Generate JWT token
      const expiresIn = remember_me ? process.env.JWT_REFRESH_EXPIRY : process.env.JWT_EXPIRY;
      const token = jwt.sign(
        { id: user.id, phone_number: user.phone_number, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      // Store session
      const fingerprint = generateFingerprint(req);
      await pool.query(
        `INSERT INTO sessions (user_id, token_hash, remember_me, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
        [user.id, fingerprint, remember_me || false, req.ip, req.headers['user-agent']]
      );

      // Update last login
      await pool.query(
        `UPDATE users SET last_login_at = NOW(), last_activity_at = NOW() WHERE id = $1`,
        [user.id]
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: remember_me ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          phone_number: user.phone_number,
          balance: user.balance,
        },
        token,
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const fingerprint = generateFingerprint(req);
      await pool.query(
        `UPDATE sessions SET expires_at = NOW() WHERE user_id = $1 AND token_hash = $2`,
        [req.user_id, fingerprint]
      );

      res.clearCookie('token');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await User.getStatistics(req.user_id);

      res.status(200).json({
        user: {
          ...user,
          ...stats,
        },
      });
    } catch (error) {
      logger.error('Get user error:', error);
      next(error);
    }
  }
}

module.exports = AuthController;
