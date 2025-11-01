const pool = require('../config/database');

class Rating {
  static async create(ratingData) {
    const { ride_id, from_user_id, to_user_id, rating, comment } = ratingData;
    
    const query = `
      INSERT INTO ratings (ride_id, from_user_id, to_user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [ride_id, from_user_id, to_user_id, rating, comment];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.*, 
             from_user.name as from_user_name,
             to_user.name as to_user_name
      FROM ratings r
      JOIN users from_user ON r.from_user_id = from_user.id
      JOIN users to_user ON r.to_user_id = to_user.id
      WHERE r.to_user_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getAverageRating(userId) {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
      FROM ratings 
      WHERE to_user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findByRideId(rideId) {
    const query = `
      SELECT * FROM ratings WHERE ride_id = $1
    `;
    
    const result = await pool.query(query, [rideId]);
    return result.rows;
  }
}

module.exports = Rating;