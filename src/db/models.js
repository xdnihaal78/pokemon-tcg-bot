const db = require('./db');

// Create tables if they don't exist
const initDatabase = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,          -- Discord user ID
      username TEXT,                  -- Discord username
      pack_stamina INTEGER DEFAULT 2, -- Number of packs the user can open
      last_pack_time BIGINT           -- Timestamp of the last pack opened
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,      -- Pokémon ID (from PokeAPI)
      name TEXT,                  -- Pokémon name
      image_url TEXT,             -- URL of the Pokémon image
      types TEXT                  -- Pokémon types (e.g., Fire, Water)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_pokemon (
      user_id BIGINT,             -- Discord user ID (Foreign Key)
      pokemon_id INTEGER,         -- Pokémon ID (Foreign Key)
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
    )
  `);

  console.log('Database initialized.');
};

module.exports = { initDatabase };