const express = require("express");
const pool = require("../config/db.js");
const ApiError = require("../utils/apiError.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const router = express.Router();

// GET /api/logs
router.get("/", checkAuth, restrictTo("super_admin"), async (req, res, next) => {
  try {
    // 1. Verify req.role === 'super_admin'
    if (req.role !== "super_admin") {
      return next(new ApiError(403, "Access denied. Only super_admin can perform this action."));
    }

    const { action, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 2. Build dynamic query
    let queryBase = `
      FROM activity_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      params.push(action);
      queryBase += ` AND al.action = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      queryBase += ` AND al.created_at >= $${params.length}::timestamp`;
    }

    if (endDate) {
      params.push(`${endDate} 23:59:59.999`);
      queryBase += ` AND al.created_at <= $${params.length}::timestamp`;
    }

    // 3. Count total for pagination
    const countQuery = `SELECT COUNT(*) ${queryBase}`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Query for logs list
    let selectQuery = `
      SELECT 
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.description,
        al.created_at,
        u.name as actor_name,
        u.email as actor_email,
        u.role as actor_role
      ${queryBase}
      ORDER BY al.created_at DESC
    `;

    params.push(limit);
    selectQuery += ` LIMIT $${params.length}`;

    params.push(offset);
    selectQuery += ` OFFSET $${params.length}`;

    const logsResult = await pool.query(selectQuery, params);

    // Format logs list to match the specified return format
    const logs = logsResult.rows.map((row) => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      description: row.description,
      created_at: row.created_at,
      actor: {
        name: row.actor_name,
        email: row.actor_email,
        role: row.actor_role,
      },
    }));

    // 4. Return response
    return res.status(200).json({
      success: true,
      count: totalCount,
      page: page,
      totalPages: Math.ceil(totalCount / limit) || 1,
      logs: logs,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

module.exports = router;
