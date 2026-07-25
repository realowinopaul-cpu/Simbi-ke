const pool = require('../config/database');
const logger = require('../config/logger');
const User = require('../models/User');
const GameRoom = require('../models/GameRoom');
const { generateTossOutcome } = require('../utils/crypto');

class GameController {
  static async getAllRooms(req, res, next) {
    try {
      const rooms = await GameRoom.getAllRooms();

      // Add queue information
      const roomsWithQueue = await Promise.all(
        rooms.map(async (room) => {
          const queueLength = await GameRoom.getQueueLength(room.id);
          return {
            ...room,
            queue_length: queueLength,
            occupancy_percentage: Math.round((queueLength / room.max_capacity) * 100),
          };
        })
      );

      res.status(200).json({ rooms: roomsWithQueue });
    } catch (error) {
      logger.error('Get rooms error:', error);
      next(error);
    }
  }

  static async joinQueue(req, res, next) {
    try {
      const { room_id, auto_bet } = req.validated;
      const userId = req.user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if user already in queue
        const existingQueueRes = await client.query(
          `SELECT * FROM queue_entries WHERE user_id = $1`,
          [userId]
        );
        if (existingQueueRes.rows.length > 0) {
          return res.status(400).json({ error: 'Already in queue' });
        }

        // Get room info
        const roomRes = await client.query(
          `SELECT * FROM game_rooms WHERE id = $1`,
          [room_id]
        );
        if (roomRes.rows.length === 0) {
          return res.status(404).json({ error: 'Room not found' });
        }
        const room = roomRes.rows[0];

        // Check room capacity
        const queueLengthRes = await client.query(
          `SELECT COUNT(*) as count FROM queue_entries WHERE room_id = $1`,
          [room_id]
        );
        const queueLength = parseInt(queueLengthRes.rows[0].count);
        if (queueLength >= room.max_capacity) {
          return res.status(400).json({ error: 'Room is full' });
        }

        // Check user balance
        const userRes = await client.query(`SELECT balance FROM users WHERE id = $1`, [userId]);
        const user = userRes.rows[0];
        if (user.balance < room.stake_amount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Add to queue
        const queuePosition = queueLength + 1;
        const queueRes = await client.query(
          `INSERT INTO queue_entries (user_id, room_id, queue_position, auto_bet_enabled, max_auto_rounds)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [userId, room_id, queuePosition, auto_bet || false, auto_bet ? 10 : 0]
        );

        // Update room queue count
        await client.query(
          `UPDATE game_rooms SET current_queue_count = current_queue_count + 1 WHERE id = $1`,
          [room_id]
        );

        await client.query('COMMIT');

        res.status(200).json({
          message: 'Joined queue successfully',
          queue_position: queuePosition,
          stake_amount: room.stake_amount,
          auto_bet_enabled: auto_bet || false,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Join queue error:', error);
      next(error);
    }
  }

  static async getQueuePosition(req, res, next) {
    try {
      const userId = req.user_id;

      const result = await pool.query(
        `SELECT qe.queue_position, qe.room_id, gr.stake_amount, gr.current_queue_count
         FROM queue_entries qe
         JOIN game_rooms gr ON qe.room_id = gr.id
         WHERE qe.user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Not in queue' });
      }

      const queueEntry = result.rows[0];
      res.status(200).json({
        queue_position: queueEntry.queue_position,
        room_id: queueEntry.room_id,
        stake_amount: queueEntry.stake_amount,
        total_in_queue: queueEntry.current_queue_count,
      });
    } catch (error) {
      logger.error('Get queue position error:', error);
      next(error);
    }
  }

  static async leaveQueue(req, res, next) {
    try {
      const userId = req.user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get queue entry
        const queueRes = await client.query(
          `SELECT * FROM queue_entries WHERE user_id = $1`,
          [userId]
        );

        if (queueRes.rows.length === 0) {
          return res.status(404).json({ error: 'Not in queue' });
        }

        const queueEntry = queueRes.rows[0];
        const { room_id, queue_position } = queueEntry;

        // Remove from queue
        await client.query(`DELETE FROM queue_entries WHERE user_id = $1`, [userId]);

        // Reorder remaining queue
        await client.query(
          `UPDATE queue_entries SET queue_position = queue_position - 1 WHERE room_id = $1 AND queue_position > $2`,
          [room_id, queue_position]
        );

        // Update room queue count
        await client.query(
          `UPDATE game_rooms SET current_queue_count = current_queue_count - 1 WHERE id = $1`,
          [room_id]
        );

        await client.query('COMMIT');

        res.status(200).json({ message: 'Left queue successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Leave queue error:', error);
      next(error);
    }
  }

  static async tossResult(req, res, next) {
    try {
      const { match_id } = req.validated;
      const userId = req.user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get match
        const matchRes = await client.query(
          `SELECT * FROM active_matches WHERE id = $1`,
          [match_id]
        );
        if (matchRes.rows.length === 0) {
          return res.status(404).json({ error: 'Match not found' });
        }

        const match = matchRes.rows[0];
        if (match.roller_id !== userId) {
          return res.status(403).json({ error: 'Only roller can toss' });
        }

        if (match.status !== 'WAITING_ROLL') {
          return res.status(400).json({ error: 'Invalid match status' });
        }

        // Generate outcome
        const tossResult = generateTossOutcome();
        const winnerId = tossResult.isWinning ? match.player1_id : match.player2_id;
        const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;

        // Update balances
        await client.query(
          `UPDATE users SET balance = balance + $1, total_wins = total_wins + 1, total_matches = total_matches + 1, total_winnings = total_winnings + $1 WHERE id = $2`,
          [match.stake_amount, winnerId]
        );

        await client.query(
          `UPDATE users SET balance = balance - $1, total_losses = total_losses + 1, total_matches = total_matches + 1, total_wagered = total_wagered + $1 WHERE id = $2`,
          [match.stake_amount, loserId]
        );

        // Update match
        await client.query(
          `UPDATE active_matches SET status = 'COMPLETED', winner_id = $1, toss_result = $2, ended_at = NOW() WHERE id = $3`,
          [winnerId, JSON.stringify(tossResult), match_id]
        );

        // Create game history
        await client.query(
          `INSERT INTO game_history (match_id, player1_id, player2_id, winner_id, loser_id, room_id, stake_amount, toss_result, roller_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            match_id,
            match.player1_id,
            match.player2_id,
            winnerId,
            loserId,
            match.room_id,
            match.stake_amount,
            JSON.stringify(tossResult),
            userId,
          ]
        );

        await client.query('COMMIT');

        res.status(200).json({
          message: 'Toss result processed',
          winner_id: winnerId,
          loser_id: loserId,
          toss_result: tossResult,
          stake_amount: match.stake_amount,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Toss result error:', error);
      next(error);
    }
  }

  static async getGameHistory(req, res, next) {
    try {
      const userId = req.user_id;
      const { limit = 50, offset = 0 } = req.query;

      const result = await pool.query(
        `SELECT * FROM game_history
         WHERE player1_id = $1 OR player2_id = $1
         ORDER BY played_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM game_history WHERE player1_id = $1 OR player2_id = $1`,
        [userId]
      );

      res.status(200).json({
        game_history: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset,
      });
    } catch (error) {
      logger.error('Get game history error:', error);
      next(error);
    }
  }
}

module.exports = GameController;
