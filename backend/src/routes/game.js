const express = require('express');
const GameController = require('../controllers/GameController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/rooms', apiLimiter, GameController.getAllRooms);

router.post(
  '/join-queue',
  authMiddleware,
  apiLimiter,
  validateRequest('joinRoom'),
  GameController.joinQueue
);

router.get(
  '/queue-position',
  authMiddleware,
  apiLimiter,
  GameController.getQueuePosition
);

router.post(
  '/leave-queue',
  authMiddleware,
  apiLimiter,
  GameController.leaveQueue
);

router.post(
  '/toss',
  authMiddleware,
  apiLimiter,
  validateRequest('tossResult'),
  GameController.tossResult
);

router.get(
  '/history',
  authMiddleware,
  apiLimiter,
  GameController.getGameHistory
);

module.exports = router;
