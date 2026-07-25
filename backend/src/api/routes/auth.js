const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { joiValidate } = require('../../middleware/validation');
const validators = require('../../utils/validators');
const { geolockMiddleware } = require('../../middleware/auth');

// Geolocation check on auth routes
router.use(geolockMiddleware);

// Register
router.post('/register', 
  joiValidate(validators.registerSchema),
  authController.register
);

// Verify OTP
router.post('/verify-otp',
  joiValidate(validators.otpSchema),
  authController.verifyOTP
);

// Login
router.post('/login',
  joiValidate(validators.loginSchema),
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
