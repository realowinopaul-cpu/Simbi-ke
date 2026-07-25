const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');
const redis = require('../../config/redis');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
const helpers = require('../../utils/helpers');
const smsService = require('../../services/smsService');

const authController = {
  register: async (req, res) => {
    try {
      const { phone, password } = req.validatedData;
      const formattedPhone = helpers.formatPhoneNumber(phone);

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE phone = $1',
        [formattedPhone]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Phone number already registered', status: 409 });
      }

      // Generate OTP
      const otp = helpers.generateOTP();
      const otpExpiry = Date.now() + parseInt(process.env.OTP_EXPIRY_SECONDS) * 1000;

      // Store OTP in Redis
      await redis.setex(`otp:${formattedPhone}`, parseInt(process.env.OTP_EXPIRY_SECONDS), otp);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store temp registration data
      await redis.setex(
        `reg:${formattedPhone}`,
        parseInt(process.env.OTP_EXPIRY_SECONDS),
        JSON.stringify({ phone: formattedPhone, password: hashedPassword })
      );

      // Send OTP
      await smsService.sendOTP(formattedPhone, otp);

      logger.info(`Registration initiated for ${helpers.maskPhone(formattedPhone)}`);
      res.status(200).json({ 
        message: 'OTP sent to your phone',
        phone: helpers.maskPhone(formattedPhone),
        status: 200
      });
    } catch (err) {
      logger.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed', status: 500 });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { phone, otp } = req.validatedData;
      const formattedPhone = helpers.formatPhoneNumber(phone);

      // Get stored OTP
      const storedOTP = await redis.get(`otp:${formattedPhone}`);
      if (!storedOTP || storedOTP !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP', status: 400 });
      }

      // Get temp registration data
      const regData = await redis.get(`reg:${formattedPhone}`);
      if (!regData) {
        return res.status(400).json({ error: 'Registration session expired', status: 400 });
      }

      const { password } = JSON.parse(regData);
      const userId = uuidv4();
      const username = helpers.generateUsername(formattedPhone);

      // Create user
      await pool.query(
        'INSERT INTO users (id, phone, username, password, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, formattedPhone, username, password]
      );

      // Create wallet
      await pool.query(
        'INSERT INTO wallets (user_id, balance, created_at) VALUES ($1, 0, NOW())',
        [userId]
      );

      // Clean up Redis
      await redis.del(`otp:${formattedPhone}`);
      await redis.del(`reg:${formattedPhone}`);

      logger.info(`User registered: ${username}`);
      res.status(201).json({ 
        message: 'Account created successfully',
        username,
        status: 201
      });
    } catch (err) {
      logger.error('Verify OTP error:', err);
      res.status(500).json({ error: 'Verification failed', status: 500 });
    }
  },

  login: async (req, res) => {
    try {
      const { phone, password, rememberMe } = req.validatedData;
      const formattedPhone = helpers.formatPhoneNumber(phone);

      // Get user
      const result = await pool.query(
        'SELECT id, username, password, role FROM users WHERE phone = $1 AND is_active = true',
        [formattedPhone]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials', status: 401 });
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials', status: 401 });
      }

      // Generate tokens
      const expiresIn = rememberMe ? process.env.REFRESH_TOKEN_EXPIRES_IN : process.env.JWT_EXPIRES_IN;
      const token = jwt.sign(
        { userId: user.id, phone: formattedPhone, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
      );

      // Store refresh token in Redis
      await redis.setex(
        `token:${user.id}`,
        7 * 24 * 60 * 60, // 7 days
        refreshToken
      );

      logger.info(`User logged in: ${user.username}`);
      res.status(200).json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username
        },
        status: 200
      });
    } catch (err) {
      logger.error('Login error:', err);
      res.status(500).json({ error: 'Login failed', status: 500 });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required', status: 400 });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const newToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({ token: newToken, status: 200 });
    } catch (err) {
      res.status(401).json({ error: 'Invalid refresh token', status: 401 });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.userId;
      await redis.del(`token:${userId}`);
      res.status(200).json({ message: 'Logout successful', status: 200 });
    } catch (err) {
      res.status(500).json({ error: 'Logout failed', status: 500 });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const { phone } = req.body;
      const formattedPhone = helpers.formatPhoneNumber(phone);

      const otp = helpers.generateOTP();
      await redis.setex(`otp:${formattedPhone}`, parseInt(process.env.OTP_EXPIRY_SECONDS), otp);
      await smsService.sendOTP(formattedPhone, otp);

      res.status(200).json({ message: 'OTP resent', status: 200 });
    } catch (err) {
      logger.error('Resend OTP error:', err);
      res.status(500).json({ error: 'Failed to resend OTP', status: 500 });
    }
  }
};

module.exports = authController;
