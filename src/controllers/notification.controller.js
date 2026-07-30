const pool = require("../config/db.js");
const ApiError = require("../utils/apiError.js");

const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const query = `
      SELECT id, message, is_read, created_at, complaint_id
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [user_id]);

    return res.status(200).json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;
    if (!user_id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id, user_id]);

    if (result.rowCount === 0) {
      return next(new ApiError(404, "Notification not found or access denied"));
    }

    return res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
