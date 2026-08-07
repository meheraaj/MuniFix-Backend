const express = require("express");
const pool = require("../config/db.js");
const ApiError = require("../utils/apiError.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const router = express.Router();

// GET /api/users
router.get("/", checkAuth, async (req, res, next) => {
  try {
    const { role, department_id } = req.query;
    const isAdmin = req.role === "super_admin" || req.role === "dept_admin";
    let query = `SELECT id, name, email, phone, role, department_id, is_active FROM users`;
    
    if (!isAdmin) {
      query += ` WHERE is_active = true`;
    } else {
      query += ` WHERE 1=1`;
    }
    
    const params = [];

    if (role) {
      if (role.includes(",")) {
        const roles = role.split(",");
        const placeholders = roles.map((r) => {
          params.push(r);
          return `$${params.length}`;
        }).join(",");
        query += ` AND role IN (${placeholders})`;
      } else {
        params.push(role);
        query += ` AND role = $${params.length}`;
      }
    }

    if (department_id) {
      params.push(parseInt(department_id));
      query += ` AND department_id = $${params.length}`;
    }

    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

// PATCH /api/users/:userId/status
router.patch("/:userId/status", checkAuth, restrictTo("super_admin"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(userId)) {
      return next(new ApiError(400, "Invalid user ID format. Must be a valid UUID."));
    }

    // Validate is_active is boolean
    if (typeof is_active !== "boolean") {
      return next(new ApiError(400, "is_active must be a boolean."));
    }

    // 1. Verify req.role === 'super_admin'
    if (req.role !== "super_admin") {
      return next(new ApiError(403, "Access denied. Only super_admin can perform this action."));
    }

    // 2. Verify user exists
    const userQuery = `SELECT id, name, role, is_active FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);
    if (userResult.rowCount === 0) {
      return next(new ApiError(404, "User not found."));
    }
    const targetUser = userResult.rows[0];

    // 3. Prevent self-deactivation
    if (userId === req.user_id) {
      return next(new ApiError(403, "Cannot deactivate your own account."));
    }

    // 4. Update status
    const updateQuery = `
      UPDATE users 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, name, email, role, is_active;
    `;
    const updateResult = await pool.query(updateQuery, [is_active, userId]);
    const updatedUser = updateResult.rows[0];

    // 5. Log to activity_logs
    const logQuery = `
      INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
      VALUES ($1, $2, $3, $4, $5);
    `;
    const actionText = is_active ? "user_activated" : "user_deactivated";
    const descText = `User ${targetUser.name} was ${is_active ? "activated" : "deactivated"}`;
    await pool.query(logQuery, [req.user_id, actionText, "user", userId, descText]);

    // 6. Return response
    return res.status(200).json({
      success: true,
      message: "User status updated",
      user: updatedUser,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

module.exports = router;

