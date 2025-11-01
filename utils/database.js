const pool = require('../config/database');

const createTables = async () => {
  try {
    // Table des utilisateurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        user_type VARCHAR(20) CHECK (user_type IN ('client', 'chauffeur')) NOT NULL,
        vehicle_type VARCHAR(50),
        license_plate VARCHAR(20),
        rating DECIMAL(3,2) DEFAULT 0.0,
        total_rides INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des trajets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        passenger_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        start_lat DECIMAL(10,8) NOT NULL,
        start_lng DECIMAL(11,8) NOT NULL,
        end_lat DECIMAL(10,8) NOT NULL,
        end_lng DECIMAL(11,8) NOT NULL,
        start_address TEXT NOT NULL,
        end_address TEXT NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
        distance DECIMAL(8,2),
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    // Table des notations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des paiements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
        amount DECIMAL(8,2) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables créées avec succès');
  } catch (error) {
    console.error('❌ Erreur création tables:', error);
  } finally {
    pool.end();
  }
};

// Exécuter le script
if (require.main === module) {
  createTables();
}

module.exports = createTables;