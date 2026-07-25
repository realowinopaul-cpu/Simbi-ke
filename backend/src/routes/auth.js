const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { loginLimiter, apiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/register',
  loginLimiter,
  validateRequest('register'),
  AuthController.register
);

router.post(
  '/verify-otp',
  loginLimiter,
  validateRequest('verifyOTP'),
  AuthController.verifyOTP
);

router.post(
  '/login',
  loginLimiter,
  validateRequest('login'),
  AuthController.login
);

router.post('/logout', authMiddleware, AuthController.logout);

router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;
