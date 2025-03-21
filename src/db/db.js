const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log('Connected to the database.'))
  .catch(err => console.error('Database connection error:', err));

module.exports = client;