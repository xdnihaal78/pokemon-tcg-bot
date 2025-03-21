const db = require('./db');

// Initialize the database
const initDatabase = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY, 
      username TEXT, 
      pack_stamina INTEGER DEFAULT 2, 
      last_pack_time BIGINT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id SERIAL PRIMARY KEY, 
      name TEXT, 
      image_url TEXT, 
      types TEXT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_pokemon (
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, 
      pokemon_id INTEGER REFERENCES pokemon(id) ON DELETE CASCADE, 
      PRIMARY KEY (user_id, pokemon_id)
    )
  `);
};

module.exports = { initDatabase };
