const pool = require("../config/db.js");

const TrafficModel = {
  // Fetch all active roadblocks
  async getActiveRoadblocks() {
    const query = `
      SELECT r.*, d.name AS department_name, u.name AS creator_name
      FROM roadblocks r
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.is_active = TRUE
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Fetch a specific roadblock by its ID
  async getRoadblockById(id) {
    const query = `SELECT * FROM roadblocks WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

 // Create a new roadblock record
  async createRoadblock({
    department_id = null,
    title,
    description,
    cause = "waterlogging",
    severity = "severe",
    latitude,
    longitude,
    affected_radius_meters = 300,
    blocked_polyline = null,
    created_by,
  }) {
    const query = `
      INSERT INTO roadblocks (
        department_id, title, description, cause,
        severity, latitude, longitude, affected_radius_meters,
        blocked_polyline, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      department_id,
      title,
      description,
      cause,
      severity,
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(affected_radius_meters, 10),
      blocked_polyline ? JSON.stringify(blocked_polyline) : null,
      created_by,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

 // Update the status of a roadblock (active/inactive)
  async updateRoadblockStatus(id, is_active) {
    const query = `
      UPDATE roadblocks
      SET is_active = $1,
          resolved_at = CASE WHEN $1 = FALSE THEN CURRENT_TIMESTAMP ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [is_active, id]);
    return result.rows[0];
  },

  // AI Route Optimization Logging
  async saveRouteOptimization(data) {
    const query = `
      INSERT INTO route_optimizations (
        roadblock_id, user_id, origin_name, destination_name,
        origin_lat, origin_lng, destination_lat, destination_lng,
        blocked_eta_mins, bypass_eta_mins, distance_diff_km,
        ai_reasoning, blocked_path_coords, bypass_path_coords
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      data.roadblock_id,
      data.user_id || null,
      data.origin_name || "Start Location",
      data.destination_name || "Target Destination",
      parseFloat(data.origin_lat),
      parseFloat(data.origin_lng),
      parseFloat(data.destination_lat),
      parseFloat(data.destination_lng),
      data.blocked_eta_mins,
      data.bypass_eta_mins,
      data.distance_diff_km,
      data.ai_reasoning,
      JSON.stringify(data.blocked_path_coords),
      JSON.stringify(data.bypass_path_coords),
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

module.exports = { TrafficModel };