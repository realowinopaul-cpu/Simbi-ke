const { validate, schemas } = require('../config/validation');

const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = validate(
      { ...req.body, ...req.params, ...req.query },
      schema
    );

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({ errors: messages });
    }

    req.validated = value;
    next();
  };
};

module.exports = { validateRequest };
