const express = require('express');
const pool = require('../config/database');
const logger = require('../config/logger');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin Dashboard - Statistics
router.get('/stats', adminMiddleware, async (req, res, next) => {
  try {
    const usersRes = await pool.query(`SELECT COUNT(*) as count FROM users`);
    const activeMatchesRes = await pool.query(
      `SELECT COUNT(*) as count FROM active_matches WHERE status = 'WAITING_ROLL'`
    );
    const transactionsRes = await pool.query(
      `SELECT SUM(amount) as total_volume FROM transactions WHERE status = 'COMPLETED'`
    );
    const depositsRes = await pool.query(
      `SELECT SUM(fee) as total_vat FROM transactions WHERE transaction_type = 'DEPOSIT' AND status = 'COMPLETED'`
    );
    const withdrawalsRes = await pool.query(
      `SELECT SUM(fee) as total_fees FROM transactions WHERE transaction_type = 'WITHDRAWAL' AND status = 'COMPLETED'`
    );

    res.status(200).json({
      total_users: parseInt(usersRes.rows[0].count),
      active_matches: parseInt(activeMatchesRes.rows[0].count),
      transaction_volume: parseFloat(transactionsRes.rows[0].total_volume || 0),
      total_vat_collected: parseFloat(depositsRes.rows[0].total_vat || 0),
      total_withdrawal_fees: parseFloat(withdrawalsRes.rows[0].total_fees || 0),
    });
  } catch (error) {
    logger.error('Admin stats error:', error);
    next(error);
  }
});

// Admin Dashboard - Users
router.get('/users', adminMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let query = `SELECT id, username, phone_number, balance, total_wins, total_losses, total_matches, created_at FROM users`;
    const params = [];

    if (search) {
      query += ` WHERE username ILIKE $1 OR phone_number ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.status(200).json({
      users: result.rows,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Admin users error:', error);
    next(error);
  }
});

// Admin Dashboard - Transactions
router.get('/transactions', adminMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, type, status } = req.query;

    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params = [];

    if (type) {
      query += ` AND transaction_type = $${params.length + 1}`;
      params.push(type);
    }

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.status(200).json({
      transactions: result.rows,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Admin transactions error:', error);
    next(error);
  }
});

// Admin Dashboard - Room Occupancy
router.get('/rooms', adminMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, stake_amount, current_queue_count, max_capacity, total_matches_played, total_wagered,
              ROUND((current_queue_count::DECIMAL / max_capacity * 100)::NUMERIC, 2) as occupancy_percentage
       FROM game_rooms
       ORDER BY stake_amount ASC`
    );

    res.status(200).json({ rooms: result.rows });
  } catch (error) {
    logger.error('Admin rooms error:', error);
    next(error);
  }
});

// Admin Dashboard - Fraud Flags
router.get('/fraud-flags', adminMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM fraud_flags WHERE is_resolved = false ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      fraud_flags: result.rows,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Admin fraud flags error:', error);
    next(error);
  }
});

// Resolve Fraud Flag
router.post('/fraud-flags/:id/resolve', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE fraud_flags SET is_resolved = true, resolved_at = NOW() WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: 'Fraud flag resolved' });
  } catch (error) {
    logger.error('Resolve fraud flag error:', error);
    next(error);
  }
});

module.exports = router;
