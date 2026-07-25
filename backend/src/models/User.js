const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const logger = require('../config/logger');
const { normalizePhone } = require('../utils/validation');

class User {
  static async create(userData) {
    try {
      const { phone_number, password, username } = userData;
      const hashedPassword = await bcrypt.hash(password, 12);
      const normalized_phone = normalizePhone(phone_number);

      const result = await pool.query(
        `INSERT INTO users (phone_number, password_hash, username, phone_country_code)
         VALUES ($1, $2, $3, 'KE')
         RETURNING id, username, phone_number, balance, created_at`,
        [normalized_phone, hashedPassword, username]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByPhone(phone_number) {
    try {
      const normalized_phone = normalizePhone(phone_number);
      const result = await pool.query(
        `SELECT * FROM users WHERE phone_number = $1`,
        [normalized_phone]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding user by phone:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, username, phone_number, balance, total_wins, total_losses, total_matches, created_at FROM users WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw error;
    }
  }

  static async updateBalance(userId, amount) {
    try {
      const result = await pool.query(
        `UPDATE users SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance`,
        [amount, userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user balance:', error);
      throw error;
    }
  }

  static async getStatistics(userId) {
    try {
      const result = await pool.query(
        `SELECT id, username, balance, total_wins, total_losses, total_matches,
                total_winnings, total_wagered, 
                ROUND((total_wins::DECIMAL / NULLIF(total_matches, 0) * 100)::NUMERIC, 2) as win_rate
         FROM users WHERE id = $1`,
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

module.exports = User;
