const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');

const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

const strictLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:strict:',
  }),
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please try again later',
});

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter,
};
