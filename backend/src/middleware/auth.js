const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided', status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userPhone = decoded.phone;
    next();
  } catch (err) {
    logger.warn('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token', status: 401 });
  }
};

const adminMiddleware = (req, res, next) => {
  // Check if user is admin (extended auth check)
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied', status: 403 });
  }
  next();
};

const geolockMiddleware = (req, res, next) => {
  const helpers = require('../utils/helpers');
  const clientIp = helpers.getClientIp(req);
  
  if (!helpers.isKenyaLocation(clientIp)) {
    return res.status(403).json({ error: 'Service restricted to Kenya', status: 403 });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, geolockMiddleware };
