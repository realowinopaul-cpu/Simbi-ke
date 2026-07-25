const Joi = require('joi');

const phoneRegex = /^(254|0)(7|1)\d{8}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

const validators = {
  registerSchema: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Phone must be a valid Kenyan number (2547XXXXXXXX or 07XXXXXXXX)'
      }),
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain letters and numbers (min 8 chars)'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match'
      })
  }),

  loginSchema: Joi.object({
    phone: Joi.string().pattern(phoneRegex).required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional()
  }),

  depositSchema: Joi.object({
    amount: Joi.number()
      .min(parseInt(process.env.MIN_DEPOSIT) || 10)
      .max(parseInt(process.env.MAX_DEPOSIT) || 50000)
      .required(),
    paymentMethod: Joi.string().valid('mpesa', 'airtel').required()
  }),

  withdrawalSchema: Joi.object({
    amount: Joi.number()
      .min(parseInt(process.env.MIN_WITHDRAWAL) || 50)
      .max(parseInt(process.env.MAX_WITHDRAWAL) || 100000)
      .required(),
    paymentMethod: Joi.string().valid('mpesa', 'airtel').required()
  }),

  otpSchema: Joi.object({
    phone: Joi.string().pattern(phoneRegex).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  })
};

module.exports = validators;
