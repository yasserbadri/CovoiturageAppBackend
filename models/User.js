const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, phone, user_type, vehicle_type, license_plate } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (name, email, password, phone, user_type, vehicle_type, license_plate)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, user_type, vehicle_type, license_plate, rating, total_rides, created_at
    `;
    
    const values = [name, email, hashedPassword, phone, user_type, vehicle_type, license_plate];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, user_type, vehicle_type, license_plate, 
             rating, total_rides, is_verified, created_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateProfile(id, updateData) {
    const { name, phone, vehicle_type, license_plate } = updateData;
    
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, vehicle_type = $3, license_plate = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, phone, user_type, vehicle_type, license_plate, rating, total_rides
    `;
    
    const values = [name, phone, vehicle_type, license_plate, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateRating(userId, newRating) {
    const query = `
      UPDATE users 
      SET rating = $1, total_rides = total_rides + 1
      WHERE id = $2
      RETURNING rating, total_rides
    `;
    
    const result = await pool.query(query, [newRating, userId]);
    return result.rows[0];
  }
}

module.exports = User;