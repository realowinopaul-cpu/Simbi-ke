const Joi = require('joi');

const schemas = {
  // Authentication Schemas
  register: Joi.object({
    phone_number: Joi.string()
      .pattern(/^(254|\+254|0)?[71]\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Kenyan number',
      }),
    password: Joi.string().min(8).alphanum().required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required(),
  }),

  login: Joi.object({
    phone_number: Joi.string().required(),
    password: Joi.string().required(),
    remember_me: Joi.boolean().optional(),
  }),

  verifyOTP: Joi.object({
    phone_number: Joi.string().required(),
    otp_code: Joi.string().length(6).required(),
  }),

  // Payment Schemas
  deposit: Joi.object({
    amount: Joi.number().min(10).max(50000).required(),
    payment_method: Joi.string().valid('MPESA', 'AIRTEL_MONEY').required(),
    phone_number: Joi.string().required(),
  }),

  withdraw: Joi.object({
    amount: Joi.number().min(50).max(100000).required(),
    payment_method: Joi.string().valid('MPESA', 'AIRTEL_MONEY').required(),
  }),

  // Game Schemas
  joinRoom: Joi.object({
    room_id: Joi.string().uuid().required(),
    auto_bet: Joi.boolean().optional(),
  }),

  tossResult: Joi.object({
    match_id: Joi.string().uuid().required(),
    result: Joi.array().length(4).items(Joi.string().valid('BLACK', 'WHITE')).required(),
  }),
};

const validate = (data, schema) => {
  return schema.validate(data, { abortEarly: false });
};

module.exports = { schemas, validate };
