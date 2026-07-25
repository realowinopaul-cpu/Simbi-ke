const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

// All admin routes require auth and admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboard);

// Users management
router.get('/users', adminController.listUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/suspend', adminController.suspendUser);

// Transactions
router.get('/transactions', adminController.listTransactions);
router.get('/transactions/:transactionId', adminController.getTransactionDetails);

// Revenue
router.get('/revenue', adminController.getRevenueStats);

// Rooms status
router.get('/rooms', adminController.getRoomsStatus);

// Fraud detection
router.get('/fraud/alerts', adminController.getFraudAlerts);

module.exports = router;
