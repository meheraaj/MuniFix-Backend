const express = require("express");
const pool = require("../config/db.js");
const ApiError = require("../utils/apiError.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const router = express.Router();

// GET /api/departments
router.get("/", checkAuth, async (req, res, next) => {
  try {
    const query = `
      SELECT 
        d.id, 
        d.name, 
        d.description,
        (SELECT u.name FROM users u WHERE u.role = 'dept_admin' AND u.department_id = d.id LIMIT 1) AS manager_name,
        (SELECT COUNT(*)::int FROM users u WHERE u.role = 'field_worker' AND u.department_id = d.id) AS staff_count,
        (SELECT COUNT(*)::int FROM complaints c WHERE c.department_id = d.id AND c.status IN ('pending', 'assigned', 'in_progress')) AS active_complaints_count
      FROM departments d
      ORDER BY d.name ASC;
    `;
    const result = await pool.query(query);
    return res.status(200).json({
      success: true,
      departments: result.rows,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

// POST /api/departments
router.post("/", checkAuth, restrictTo("super_admin"), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return next(new ApiError(400, "Department name is required."));
    }

    const query = `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description;
    `;
    const result = await pool.query(query, [name.trim(), description || null]);

    // Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user_id, "department_created", "department", null, `Department ${result.rows[0].name} created`]
    ).catch(err => console.error("Error logging department creation:", err));

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department: result.rows[0],
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

// PUT /api/departments/:id
router.put("/:id", checkAuth, restrictTo("super_admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return next(new ApiError(400, "Department name is required."));
    }

    const query = `
      UPDATE departments
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, description;
    `;
    const result = await pool.query(query, [name.trim(), description || null, parseInt(id)]);
    if (result.rowCount === 0) {
      return next(new ApiError(404, "Department not found."));
    }

    // Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user_id, "department_updated", "department", null, `Department ${result.rows[0].name} updated`]
    ).catch(err => console.error("Error logging department update:", err));

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department: result.rows[0],
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

// DELETE /api/departments/:id
router.delete("/:id", checkAuth, restrictTo("super_admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      DELETE FROM departments
      WHERE id = $1;
    `;
    const result = await pool.query(query, [parseInt(id)]);
    if (result.rowCount === 0) {
      return next(new ApiError(404, "Department not found."));
    }

    // Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user_id, "department_deleted", "department", null, `Department ${id} deleted`]
    ).catch(err => console.error("Error logging department deletion:", err));

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

module.exports = router;
