const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../../middleware/auth');

// All user routes require auth
router.use(authMiddleware);

// Get profile
router.get('/profile', userController.getProfile);

// Update profile
router.put('/profile', userController.updateProfile);

// Get balance
router.get('/balance', userController.getBalance);

// Get stats
router.get('/stats', userController.getStats);

// Change password
router.post('/change-password', userController.changePassword);

// Enable self-exclusion
router.post('/self-exclude', userController.selfExclude);

// Get self-exclusion status
router.get('/self-exclude-status', userController.getSelfExcludeStatus);

// Set daily loss limit
router.post('/daily-limit', userController.setDailyLossLimit);

module.exports = router;
