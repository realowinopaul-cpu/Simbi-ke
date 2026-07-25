const pool = require('../config/database');
const redisClient = require('../config/redis');
const logger = require('../config/logger');
const { generateTossOutcome } = require('./crypto');

/**
 * Process match outcome and update balances
 */
const processMatchOutcome = async (matchId, rollerId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get match details
    const matchRes = await client.query(
      `SELECT * FROM active_matches WHERE id = $1`,
      [matchId]
    );
    const match = matchRes.rows[0];
    if (!match) throw new Error('Match not found');

    // Generate outcome
    const tossResult = generateTossOutcome();

    // Determine winner
    const winnerId = tossResult.isWinning ? rollerId : 
                     (match.player1_id === rollerId ? match.player2_id : match.player1_id);
    const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;

    // Update balances
    await client.query(
      `UPDATE users SET balance = balance + $1, total_wins = total_wins + 1 WHERE id = $2`,
      [match.stake_amount, winnerId]
    );

    await client.query(
      `UPDATE users SET balance = balance - $1, total_losses = total_losses + 1 WHERE id = $2`,
      [match.stake_amount, loserId]
    );

    // Update match record
    await client.query(
      `UPDATE active_matches SET status = 'COMPLETED', winner_id = $1, toss_result = $2, ended_at = NOW() WHERE id = $3`,
      [winnerId, JSON.stringify(tossResult), matchId]
    );

    // Create game history record
    await client.query(
      `INSERT INTO game_history 
       (match_id, player1_id, player2_id, winner_id, loser_id, room_id, stake_amount, toss_result, roller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        matchId,
        match.player1_id,
        match.player2_id,
        winnerId,
        loserId,
        match.room_id,
        match.stake_amount,
        JSON.stringify(tossResult),
        rollerId,
      ]
    );

    // Update room statistics
    await client.query(
      `UPDATE game_rooms SET total_matches_played = total_matches_played + 1, total_wagered = total_wagered + $1 WHERE id = $2`,
      [match.stake_amount * 2, match.room_id]
    );

    await client.query('COMMIT');

    return {
      winnerId,
      loserId,
      tossResult,
      stakeAmount: match.stake_amount,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error processing match outcome:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get next players from queue and create match
 */
const createNextMatch = async (roomId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get first two players in queue
    const queueRes = await client.query(
      `SELECT user_id FROM queue_entries WHERE room_id = $1 ORDER BY queue_position ASC LIMIT 2`,
      [roomId]
    );

    if (queueRes.rows.length < 2) {
      await client.query('ROLLBACK');
      return null; // Not enough players
    }

    const [player1, player2] = queueRes.rows;

    // Get room stake amount
    const roomRes = await client.query(`SELECT stake_amount FROM game_rooms WHERE id = $1`, [roomId]);
    const { stake_amount } = roomRes.rows[0];

    // Randomly assign roller
    const rollerId = Math.random() > 0.5 ? player1.user_id : player2.user_id;

    // Create match
    const matchRes = await client.query(
      `INSERT INTO active_matches (room_id, player1_id, player2_id, roller_id, stake_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'WAITING_ROLL')
       RETURNING *`,
      [roomId, player1.user_id, player2.user_id, rollerId, stake_amount]
    );

    // Remove players from queue
    await client.query(
      `DELETE FROM queue_entries WHERE user_id IN ($1, $2) AND room_id = $3`,
      [player1.user_id, player2.user_id, roomId]
    );

    // Update queue positions
    await client.query(
      `UPDATE queue_entries SET queue_position = queue_position - 2 WHERE room_id = $1`,
      [roomId]
    );

    // Update room queue count
    const countRes = await client.query(
      `SELECT COUNT(*) as count FROM queue_entries WHERE room_id = $1`,
      [roomId]
    );
    await client.query(
      `UPDATE game_rooms SET current_queue_count = $1 WHERE id = $2`,
      [countRes.rows[0].count, roomId]
    );

    await client.query('COMMIT');

    return matchRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating next match:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  processMatchOutcome,
  createNextMatch,
};
