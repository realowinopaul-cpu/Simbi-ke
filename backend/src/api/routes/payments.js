const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../../middleware/auth');
const { joiValidate } = require('../../middleware/validation');
const validators = require('../../utils/validators');

// All payment routes require auth
router.use(authMiddleware);

// Deposit
router.post('/deposit',
  joiValidate(validators.depositSchema),
  paymentController.initiateDeposit
);

// M-Pesa callback
router.post('/mpesa/callback', paymentController.mpesaCallback);

// Airtel callback
router.post('/airtel/callback', paymentController.airtelCallback);

// Withdrawal
router.post('/withdraw',
  joiValidate(validators.withdrawalSchema),
  paymentController.initiateWithdrawal
);

// Get transaction history
router.get('/history', paymentController.getTransactionHistory);

// Get deposit/withdrawal history
router.get('/deposits', paymentController.getDepositHistory);
router.get('/withdrawals', paymentController.getWithdrawalHistory);

// Check withdrawal status
router.get('/withdrawal/:transactionId', paymentController.getWithdrawalStatus);

module.exports = router;
