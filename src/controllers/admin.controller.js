const pool = require("../config/db.js");
const ApiError = require("../utils/apiError.js");

const getDepartments = async (req, res, next) => {
  try {
    const query = `SELECT id, name, description FROM departments ORDER BY name ASC;`;
    const result = await pool.query(query);
    return res.status(200).json({
      success: true,
      departments: result.rows,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const getDepartmentWorkers = async (req, res, next) => {
  try {
    let deptId = req.query.department_id;

    // Force Department Admins to view only workers within their assigned workspace boundary
    if (req.role === "dept_admin") {
      const userQuery = `SELECT department_id FROM users WHERE id = $1;`;
      const userRes = await pool.query(userQuery, [req.user_id]);
      deptId = userRes.rows[0]?.department_id;
    }

    if (!deptId) {
      return next(new ApiError(400, "Department context could not be determined."));
    }

    const query = `
  SELECT id, name, email, phone, role, department_id 
  FROM users 
  WHERE department_id = $1 AND role = 'field_worker'
  ORDER BY name ASC;
`;
    const result = await pool.query(query, [parseInt(deptId)]);
    return res.status(200).json({
      success: true,
      workers: result.rows,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, department_id } = req.body;

    if (!role) return next(new ApiError(400, "Target role property field is required."));

    // Ensure the updating role matches system capabilities
const validRoles = ["citizen", "field_worker", "dept_admin", "super_admin"];
    if (!validRoles.includes(role)) return next(new ApiError(400, "Invalid role assignment."));

    const query = `
      UPDATE users 
      SET role = $1, department_id = COALESCE($2, department_id), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 
      RETURNING id, name, email, role, department_id;
    `;
    const result = await pool.query(query, [role, department_id ? parseInt(department_id) : null, id]);

    if (result.rowCount === 0) return next(new ApiError(404, "Target user record not found."));

    // Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user_id, "user_role_updated", "user", id, `User ${result.rows[0].name} role updated to ${role}`]
    ).catch(err => console.error("Error logging user role update:", err));

    return res.status(200).json({
      success: true,
      message: "User role privileges modified successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};


//create new dept
const createDepartment = async (req, res, next) => {
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
    const result = await pool.query(query, [name, description || null]);

    return res.status(201).json({
      success: true,
      message: "New municipal department registered successfully.",
      department: result.rows[0],
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
module.exports = { getDepartments, getDepartmentWorkers, updateUserRole,createDepartment };