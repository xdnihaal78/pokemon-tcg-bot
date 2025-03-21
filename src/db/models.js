const db = require('./db');

// Create tables if they don't exist
const initDatabase = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      pack_stamina INTEGER DEFAULT 2,
      last_pack_time BIGINT,
      hourglasses INTEGER DEFAULT 0
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      name TEXT,
      image_url TEXT,
      hp INTEGER,
      rarity TEXT,
      set_name TEXT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_cards (
      user_id TEXT,
      card_id TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(card_id) REFERENCES cards(id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      description TEXT,
      reward TEXT,
      completed BOOLEAN DEFAULT FALSE
    )
  `);

  console.log('Database initialized.');
};

module.exports = { initDatabase };