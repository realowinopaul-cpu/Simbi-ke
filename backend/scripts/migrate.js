const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const runMigrations = async () => {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query(schema);
      logger.info('✓ Database migrations completed successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Migration error:', error);
    process.exit(1);
  }
};

runMigrations().then(() => {
  process.exit(0);
});
