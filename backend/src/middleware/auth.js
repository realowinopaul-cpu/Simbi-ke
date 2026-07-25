const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.user_id = decoded.id;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.user_id = decoded.id;
    }
  } catch (error) {
    logger.debug('Optional auth failed, continuing as guest');
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
};
