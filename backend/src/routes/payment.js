const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { apiLimiter, strictLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/deposit',
  authMiddleware,
  strictLimiter,
  validateRequest('deposit'),
  PaymentController.deposit
);

router.post(
  '/deposit-callback',
  PaymentController.depositCallback
);

router.post(
  '/withdraw',
  authMiddleware,
  strictLimiter,
  validateRequest('withdraw'),
  PaymentController.withdraw
);

router.get(
  '/history',
  authMiddleware,
  apiLimiter,
  PaymentController.getTransactionHistory
);

module.exports = router;
