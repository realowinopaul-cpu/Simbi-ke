const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./config/logger');
const redisClient = require('./config/redis');
const pool = require('./config/database');
const { createNextMatch, processMatchOutcome } = require('./utils/gameLogic');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// WebSocket Event Handlers
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId} (${socket.id})`);

  // Join room queue
  socket.on('join_room', async (roomId) => {
    try {
      const roomRes = await pool.query(
        `SELECT * FROM game_rooms WHERE id = $1`,
        [roomId]
      );
      const room = roomRes.rows[0];

      socket.join(`room_${roomId}`);
      socket.roomId = roomId;

      // Get queue position
      const queueRes = await pool.query(
        `SELECT queue_position FROM queue_entries WHERE user_id = $1 AND room_id = $2`,
        [socket.userId, roomId]
      );

      if (queueRes.rows.length > 0) {
        const queuePos = queueRes.rows[0].queue_position;
        socket.emit('queue_joined', {
          room_id: roomId,
          position: queuePos,
          stake: room.stake_amount,
        });

        // Notify room of updated queue
        io.to(`room_${roomId}`).emit('queue_updated', {
          total_in_queue: await getQueueCount(roomId),
        });
      }
    } catch (error) {
      logger.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room queue
  socket.on('leave_room', async () => {
    try {
      const roomId = socket.roomId;
      socket.leave(`room_${roomId}`);

      io.to(`room_${roomId}`).emit('queue_updated', {
        total_in_queue: await getQueueCount(roomId),
      });
    } catch (error) {
      logger.error('Leave room error:', error);
    }
  });

  // Watch for active match
  socket.on('watch_match', async (matchId) => {
    try {
      socket.join(`match_${matchId}`);

      const matchRes = await pool.query(
        `SELECT * FROM active_matches WHERE id = $1`,
        [matchId]
      );
      const match = matchRes.rows[0];

      socket.emit('match_started', {
        match_id: matchId,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        roller_id: match.roller_id,
        stake_amount: match.stake_amount,
        status: match.status,
      });
    } catch (error) {
      logger.error('Watch match error:', error);
    }
  });

  // Toss animation and result
  socket.on('toss_maize', async (matchId) => {
    try {
      const matchRes = await pool.query(
        `SELECT * FROM active_matches WHERE id = $1`,
        [matchId]
      );
      const match = matchRes.rows[0];

      if (match.roller_id !== socket.userId) {
        return socket.emit('error', { message: 'Only roller can toss' });
      }

      // Process match outcome (handled in controller, emit result here)
      const result = await processMatchOutcome(matchId, socket.userId);

      // Emit to all watchers
      io.to(`match_${matchId}`).emit('toss_completed', {
        result: result.tossResult,
        winner_id: result.winnerId,
        amount_won: result.stakeAmount,
      });

      // Schedule next match after 5 seconds
      setTimeout(async () => {
        const nextMatch = await createNextMatch(match.room_id);
        if (nextMatch) {
          io.to(`room_${match.room_id}`).emit('next_match_ready', {
            match_id: nextMatch.id,
            player1_id: nextMatch.player1_id,
            player2_id: nextMatch.player2_id,
            roller_id: nextMatch.roller_id,
          });
        }
      }, 5000);
    } catch (error) {
      logger.error('Toss error:', error);
      socket.emit('error', { message: 'Toss failed' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

// Helper function to get queue count
const getQueueCount = async (roomId) => {
  try {
    const res = await pool.query(
      `SELECT COUNT(*) as count FROM queue_entries WHERE room_id = $1`,
      [roomId]
    );
    return parseInt(res.rows[0].count);
  } catch (error) {
    logger.error('Error getting queue count:', error);
    return 0;
  }
};

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`✓ SIMBI KE Backend running on http://${HOST}:${PORT}`);
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         🌾 SIMBI KE - Maize Toss Wagering 🌾              ║');
  console.log('║              Backend Server Started                        ║');
  console.log(`║         API: http://${HOST}:${PORT}`);
  console.log('║      WebSocket: Connected and Ready                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
});

module.exports = { server, io };
