require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');
const pool = require('./src/config/database');
const redis = require('./src/config/redis');

// Import routes
const authRoutes = require('./src/api/routes/auth');
const paymentRoutes = require('./src/api/routes/payments');
const gameRoutes = require('./src/api/routes/game');
const userRoutes = require('./src/api/routes/users');
const adminRoutes = require('./src/api/routes/admin');

// Import WebSocket handlers
const gameSocketHandler = require('./src/services/websocket/gameSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATION_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATION_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket handlers
gameSocketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message, status });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', status: 404 });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('✓ Database connected');

    // Test Redis connection
    await redis.ping();
    logger.info('✓ Redis connected');

    logger.info(`🎮 SIMBI KE server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    await redis.quit();
    process.exit(0);
  });
});

module.exports = { app, server, io };
