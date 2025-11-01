const pool = require('../config/database');

class Ride {
  static async create(rideData) {
    const {
      driver_id, start_lat, start_lng, end_lat, end_lng,
      start_address, end_address, price, distance, duration
    } = rideData;
    
    const query = `
      INSERT INTO rides (driver_id, start_lat, start_lng, end_lat, end_lng, 
                        start_address, end_address, price, distance, duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      driver_id, start_lat, start_lng, end_lat, end_lng,
      start_address, end_address, price, distance, duration
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAvailable() {
    const query = `
      SELECT r.*, u.name as driver_name, u.rating as driver_rating, u.vehicle_type
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByUserId(userId, userType) {
    let query, values;
    
    if (userType === 'chauffeur') {
      query = `
        SELECT r.*, u.name as passenger_name, u.rating as passenger_rating
        FROM rides r
        LEFT JOIN users u ON r.passenger_id = u.id
        WHERE r.driver_id = $1
        ORDER BY r.created_at DESC
      `;
    } else {
      query = `
        SELECT r.*, u.name as driver_name, u.rating as driver_rating, u.vehicle_type
        FROM rides r
        JOIN users u ON r.driver_id = u.id
        WHERE r.passenger_id = $1
        ORDER BY r.created_at DESC
      `;
    }
    
    values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(rideId) {
    const query = `
      SELECT r.*, 
             d.name as driver_name, d.rating as driver_rating, d.vehicle_type,
             p.name as passenger_name, p.rating as passenger_rating
      FROM rides r
      JOIN users d ON r.driver_id = d.id
      LEFT JOIN users p ON r.passenger_id = p.id
      WHERE r.id = $1
    `;
    
    const result = await pool.query(query, [rideId]);
    return result.rows[0];
  }

  static async acceptRide(rideId, passengerId) {
    const query = `
      UPDATE rides 
      SET passenger_id = $1, status = 'accepted'
      WHERE id = $2 AND status = 'pending'
      RETURNING *
    `;
    
    const result = await pool.query(query, [passengerId, rideId]);
    return result.rows[0];
  }

  static async updateStatus(rideId, status) {
    let additionalUpdate = '';
    if (status === 'in_progress') {
      additionalUpdate = ', started_at = CURRENT_TIMESTAMP';
    } else if (status === 'completed') {
      additionalUpdate = ', completed_at = CURRENT_TIMESTAMP';
    }
    
    const query = `
      UPDATE rides 
      SET status = $1 ${additionalUpdate}
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, rideId]);
    return result.rows[0];
  }

  static async getActiveRide(userId) {
    const query = `
      SELECT * FROM rides 
      WHERE (driver_id = $1 OR passenger_id = $1) 
      AND status IN ('accepted', 'in_progress')
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Ride;