const pool = require('../config/database');
const redisClient = require('../config/redis');
const logger = require('../config/logger');
const User = require('../models/User');

class PaymentController {
  static async deposit(req, res, next) {
    try {
      const { amount, payment_method, phone_number } = req.validated;
      const userId = req.user_id;

      // Validate phone ownership
      const userRes = await pool.query(`SELECT phone_number FROM users WHERE id = $1`, [userId]);
      const user = userRes.rows[0];

      if (user.phone_number !== phone_number) {
        return res.status(403).json({ error: 'Phone number must match registered number' });
      }

      // Create transaction record (PENDING)
      const transactionRes = await pool.query(
        `INSERT INTO transactions (user_id, transaction_type, amount, fee, net_amount, status, payment_method, phone_number)
         VALUES ($1, 'DEPOSIT', $2, $3, $4, 'PENDING', $5, $6)
         RETURNING *`,
        [userId, amount, 0, amount, payment_method, phone_number]
      );

      const transaction = transactionRes.rows[0];

      // TODO: Integrate with M-Pesa/Airtel Money API
      // For demo, simulate successful deposit

      res.status(200).json({
        message: 'Deposit initiated',
        transaction_id: transaction.id,
        amount,
        payment_method,
        status: 'PENDING',
      });
    } catch (error) {
      logger.error('Deposit error:', error);
      next(error);
    }
  }

  static async depositCallback(req, res, next) {
    try {
      const { transaction_id, status, reference } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get transaction
        const transRes = await client.query(
          `SELECT * FROM transactions WHERE id = $1`,
          [transaction_id]
        );
        if (transRes.rows.length === 0) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transRes.rows[0];

        if (status === 'SUCCESS') {
          // Calculate VAT (5%)
          const vat = transaction.amount * 0.05;
          const netAmount = transaction.amount - vat;

          // Update transaction
          await client.query(
            `UPDATE transactions SET status = 'COMPLETED', fee = $1, net_amount = $2, transaction_ref = $3 WHERE id = $4`,
            [vat, netAmount, reference, transaction_id]
          );

          // Credit user balance
          await client.query(
            `UPDATE users SET balance = balance + $1 WHERE id = $2`,
            [netAmount, transaction.user_id]
          );

          // Log to audit
          await client.query(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
             VALUES ($1, 'DEPOSIT_COMPLETED', 'TRANSACTION', $2, $3)`,
            [transaction.user_id, transaction_id, JSON.stringify({ amount, netAmount, vat })]
          );
        } else {
          await client.query(
            `UPDATE transactions SET status = 'FAILED', error_message = $1 WHERE id = $2`,
            ['Payment failed', transaction_id]
          );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Callback processed' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Deposit callback error:', error);
      next(error);
    }
  }

  static async withdraw(req, res, next) {
    try {
      const { amount, payment_method } = req.validated;
      const userId = req.user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get user balance
        const userRes = await client.query(`SELECT balance, phone_number FROM users WHERE id = $1`, [userId]);
        const user = userRes.rows[0];

        // Calculate fee (10%)
        const fee = amount * 0.1;
        const totalDeduction = amount + fee;

        if (user.balance < totalDeduction) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Check cooldown (1 minute)
        const lastWithdrawRes = await client.query(
          `SELECT created_at FROM transactions WHERE user_id = $1 AND transaction_type = 'WITHDRAWAL' AND status = 'COMPLETED' ORDER BY created_at DESC LIMIT 1`,
          [userId]
        );

        if (lastWithdrawRes.rows.length > 0) {
          const lastWithdrawTime = new Date(lastWithdrawRes.rows[0].created_at);
          const timeDiff = (Date.now() - lastWithdrawTime.getTime()) / 1000;
          if (timeDiff < 60) {
            return res.status(400).json({ error: 'Please wait before next withdrawal' });
          }
        }

        // Create withdrawal transaction
        const withdrawRes = await client.query(
          `INSERT INTO transactions (user_id, transaction_type, amount, fee, net_amount, status, payment_method, phone_number)
           VALUES ($1, 'WITHDRAWAL', $2, $3, $4, 'PENDING', $5, $6)
           RETURNING *`,
          [userId, amount, fee, amount, payment_method, user.phone_number]
        );

        const withdrawal = withdrawRes.rows[0];

        // Deduct from balance
        await client.query(
          `UPDATE users SET balance = balance - $1 WHERE id = $2`,
          [totalDeduction, userId]
        );

        // Create withdrawal fee record
        await client.query(
          `INSERT INTO withdrawal_fees (transaction_id, fee_amount, collection_phone, collection_status)
           VALUES ($1, $2, $3, 'PENDING')`,
          [withdrawal.id, fee, process.env.SYSTEM_COLLECTION_MPESA]
        );

        await client.query('COMMIT');

        res.status(200).json({
          message: 'Withdrawal initiated',
          transaction_id: withdrawal.id,
          amount,
          fee,
          status: 'PENDING',
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Withdrawal error:', error);
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user_id;
      const { type, limit = 50, offset = 0 } = req.query;

      let query = `SELECT * FROM transactions WHERE user_id = $1`;
      const params = [userId];

      if (type) {
        query += ` AND transaction_type = $2`;
        params.push(type);
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
      logger.error('Get transaction history error:', error);
      next(error);
    }
  }
}

module.exports = PaymentController;
