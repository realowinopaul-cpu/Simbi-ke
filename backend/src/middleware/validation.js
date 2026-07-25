const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array(),
      status: 400 
    });
  }
  next();
};

const joiValidate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.warn('Schema validation error:', error.details);
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({ field: d.path[0], message: d.message })),
        status: 400
      });
    }
    req.validatedData = value;
    next();
  };
};

module.exports = { validateRequest, joiValidate };
