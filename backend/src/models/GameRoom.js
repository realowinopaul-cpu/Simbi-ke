const pool = require('../config/database');
const logger = require('../config/logger');

class GameRoom {
  static async getAllRooms() {
    try {
      const result = await pool.query(
        `SELECT * FROM game_rooms WHERE is_active = true ORDER BY stake_amount ASC`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting all rooms:', error);
      throw error;
    }
  }

  static async getRoomById(roomId) {
    try {
      const result = await pool.query(
        `SELECT * FROM game_rooms WHERE id = $1`,
        [roomId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting room by id:', error);
      throw error;
    }
  }

  static async getRoomByStake(stakeAmount) {
    try {
      const result = await pool.query(
        `SELECT * FROM game_rooms WHERE stake_amount = $1 AND is_active = true`,
        [stakeAmount]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting room by stake:', error);
      throw error;
    }
  }

  static async getQueueLength(roomId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM queue_entries WHERE room_id = $1`,
        [roomId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error getting queue length:', error);
      throw error;
    }
  }

  static async getPlayerQueuePosition(roomId, userId) {
    try {
      const result = await pool.query(
        `SELECT queue_position FROM queue_entries WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
      );
      return result.rows[0]?.queue_position || null;
    } catch (error) {
      logger.error('Error getting queue position:', error);
      throw error;
    }
  }
}

module.exports = GameRoom;
