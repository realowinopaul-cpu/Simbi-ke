const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware } = require('../../middleware/auth');

// All game routes require auth
router.use(authMiddleware);

// Get available rooms
router.get('/rooms', gameController.getRooms);

// Get room details (queue position, occupancy)
router.get('/rooms/:roomId', gameController.getRoomDetails);

// Join room
router.post('/rooms/:roomId/join', gameController.joinRoom);

// Leave room
router.post('/rooms/:roomId/leave', gameController.leaveRoom);

// Get current game state
router.get('/current', gameController.getCurrentGame);

// Get game history
router.get('/history', gameController.getGameHistory);

// Enable auto-bet
router.post('/auto-bet/enable', gameController.enableAutoBet);

// Disable auto-bet
router.post('/auto-bet/disable', gameController.disableAutoBet);

module.exports = router;
