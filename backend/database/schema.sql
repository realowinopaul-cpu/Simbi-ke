-- SIMBI KE Database Schema
-- PostgreSQL Production Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  phone_country_code VARCHAR(5) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_losses INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_wagered DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total_winnings DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_self_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  self_exclusion_end_date TIMESTAMP,
  daily_loss_limit DECIMAL(15, 2),
  daily_loss_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  last_loss_reset_date DATE,
  ip_address VARCHAR(45),
  device_fingerprint VARCHAR(255),
  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- OTP VERIFICATION TABLE
-- ============================================================================
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

-- ============================================================================
-- SESSIONS TABLE (Auth Sessions)
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  remember_me BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- GAME ROOMS TABLE
-- ============================================================================
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_index INTEGER NOT NULL UNIQUE,
  stake_amount DECIMAL(15, 2) NOT NULL,
  current_queue_count INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL DEFAULT 500,
  total_players_all_time INTEGER NOT NULL DEFAULT 0,
  total_matches_played INTEGER NOT NULL DEFAULT 0,
  total_wagered DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_stake_amount ON game_rooms(stake_amount);
CREATE INDEX idx_rooms_is_active ON game_rooms(is_active);

INSERT INTO game_rooms (room_index, stake_amount, current_queue_count)
SELECT 
  generate_series(0, 499) as room_index,
  10 + (generate_series(0, 499) * 40) as stake_amount,
  0
WHERE 10 + (generate_series(0, 499) * 40) <= 20000;

-- ============================================================================
-- QUEUE TABLE (Real-time Player Queue)
-- ============================================================================
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL,
  consecutive_rounds INTEGER NOT NULL DEFAULT 0,
  auto_bet_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  max_auto_rounds INTEGER NOT NULL DEFAULT 10,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (room_id, queue_position)
);

CREATE INDEX idx_queue_user_id ON queue_entries(user_id);
CREATE INDEX idx_queue_room_id ON queue_entries(room_id);
CREATE INDEX idx_queue_position ON queue_entries(room_id, queue_position);

-- ============================================================================
-- ACTIVE MATCHES TABLE
-- ============================================================================
CREATE TABLE active_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id),
  player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roller_id UUID NOT NULL,
  stake_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'WAITING_ROLL',
  toss_result JSONB,
  winner_id UUID,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES game_rooms(id)
);

CREATE INDEX idx_matches_room_id ON active_matches(room_id);
CREATE INDEX idx_matches_status ON active_matches(status);
CREATE INDEX idx_matches_started_at ON active_matches(started_at);

-- ============================================================================
-- GAME HISTORY TABLE
-- ============================================================================
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES active_matches(id),
  player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES users(id),
  loser_id UUID NOT NULL REFERENCES users(id),
  room_id UUID NOT NULL REFERENCES game_rooms(id),
  stake_amount DECIMAL(15, 2) NOT NULL,
  toss_result JSONB NOT NULL,
  roller_id UUID NOT NULL,
  played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_player1 ON game_history(player1_id);
CREATE INDEX idx_history_player2 ON game_history(player2_id);
CREATE INDEX idx_history_winner ON game_history(winner_id);
CREATE INDEX idx_history_room ON game_history(room_id);
CREATE INDEX idx_history_played_at ON game_history(played_at);

-- ============================================================================
-- TRANSACTIONS TABLE (Deposits & Withdrawals)
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  net_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  transaction_ref VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================================
-- SYSTEM STATISTICS TABLE
-- ============================================================================
CREATE TABLE system_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stats_date DATE NOT NULL UNIQUE,
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users_today INTEGER NOT NULL DEFAULT 0,
  total_matches_today INTEGER NOT NULL DEFAULT 0,
  total_wagered_today DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total_revenue_today DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  deposit_volume DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  withdrawal_volume DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  avg_concurrent_users INTEGER NOT NULL DEFAULT 0,
  peak_concurrent_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stats_date ON system_stats(stats_date);

-- ============================================================================
-- FRAUD FLAGS TABLE
-- ============================================================================
CREATE TABLE fraud_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  device_fingerprint VARCHAR(255),
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_fraud_user_id ON fraud_flags(user_id);
CREATE INDEX idx_fraud_is_resolved ON fraud_flags(is_resolved);
CREATE INDEX idx_fraud_severity ON fraud_flags(severity);

-- ============================================================================
-- WITHDRAWAL FEES COLLECTION TABLE
-- ============================================================================
CREATE TABLE withdrawal_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  fee_amount DECIMAL(15, 2) NOT NULL,
  collection_phone VARCHAR(20) NOT NULL DEFAULT '254708140269',
  collection_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawal_fees_transaction ON withdrawal_fees(transaction_id);
CREATE INDEX idx_withdrawal_fees_status ON withdrawal_fees(collection_status);

-- ============================================================================
-- VIEWS FOR QUICK ANALYTICS
-- ============================================================================

CREATE VIEW user_statistics AS
SELECT 
  u.id,
  u.username,
  u.phone_number,
  u.balance,
  u.total_wins,
  u.total_losses,
  u.total_matches,
  u.total_winnings,
  u.total_wagered,
  CASE 
    WHEN u.total_matches > 0 THEN ROUND((u.total_wins::DECIMAL / u.total_matches * 100)::NUMERIC, 2)
    ELSE 0
  END AS win_rate,
  u.created_at,
  u.last_login_at
FROM users u;

CREATE VIEW room_statistics AS
SELECT 
  gr.id,
  gr.room_index,
  gr.stake_amount,
  gr.current_queue_count,
  gr.max_capacity,
  ROUND((gr.current_queue_count::DECIMAL / gr.max_capacity * 100)::NUMERIC, 2) AS occupancy_percentage,
  gr.total_players_all_time,
  gr.total_matches_played,
  gr.total_wagered,
  CASE WHEN gr.total_matches_played > 0 THEN gr.total_wagered / gr.total_matches_played ELSE 0 END AS avg_stake_per_match
FROM game_rooms gr;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_updated_at();

CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();

CREATE OR REPLACE FUNCTION update_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rooms_updated_at
BEFORE UPDATE ON game_rooms
FOR EACH ROW
EXECUTE FUNCTION update_rooms_updated_at();
