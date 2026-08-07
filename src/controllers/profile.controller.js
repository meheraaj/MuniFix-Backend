
const cloudinary = require("../config/cloudinary.js");
const pool = require("../config/db.js");
const ApiError = require("../utils/apiError");
const { UserModel } = require("../models/user.model.js");
const { hashPassword, verifyPassword } = require("../utils/validator.js");

const profile = async (req, res, next) => {
  try {
    const user = await UserModel.findByEmail(req.email);
    if (!user) {
      return next(new ApiError(404, "User not found."));
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      message: "Valid JWT",
      profile: userWithoutPassword,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};


const uploadAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return next(new ApiError(400, "No image file provided."));
    }

    let secureUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "munifix/avatars" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
      console.log(secureUrl)
   
    const query = `
      UPDATE users 
      SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, name, email, avatar_url;
    `;
    const result = await pool.query(query, [secureUrl, req.user_id]);

    if (result.rowCount === 0) {
      return next(new ApiError(404, "User profile record not found."));
    }

    return res.status(200).json({
      success: true,
      message: "Profile avatar updated successfully.",
      user: result.rows[0],
    });

  } catch (error) {
    return next(new ApiError(500, error.message || "Avatar update pipeline failed."));
  }
};


const getAvatar= async (req, res, next) => {
try {
   const query = `
      SELECT avatar_url
      FROM users 
      WHERE id = $1 
      
    `;
    const result = await pool.query(query, [ req.user_id]);

    if (result.rowCount === 0 || !result.rows[0].avatar_url) {
      return next(new ApiError(404, "User avatar not found."));
    }

    return res.status(200).json({
      success: true,
      message: "Profile avatar found.",
      id: req.user_id,
      ...result.rows[0]
    });
 } catch (error) {
    return next(new ApiError(500, error.message || "DB error."));
  }


}

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    // 2. Validate inputs
    if (!name || name.trim().length < 2) {
      return next(new ApiError(400, "Name is required and must be at least 2 characters."));
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      // BD phone: +880 followed by exactly 10 digits
      const bdPhoneRegex = /^\+880\d{10}$/;
      if (!bdPhoneRegex.test(phone)) {
        return next(new ApiError(400, "Phone must be a valid Bangladesh number in +880XXXXXXXXXX format."));
      }
    }

    if (address !== undefined && address !== null && address.length > 255) {
      return next(new ApiError(400, "Address must be 255 characters or fewer."));
    }

    // 3. Check phone uniqueness (only if a phone value is supplied)
    if (phone) {
      const phoneCheck = await pool.query(
        `SELECT id FROM users WHERE phone = $1 AND id != $2`,
        [phone, req.user_id]
      );
      if (phoneCheck.rowCount > 0) {
        return next(new ApiError(409, "This phone number is already in use by another account."));
      }
    }

    // 4. Update profile including address
    const updateQuery = `
      UPDATE users
      SET name = $1, phone = $2, address = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, phone, address, role, department_id, is_active, email_verified;
    `;
    const result = await pool.query(updateQuery, [
      name.trim(),
      phone || null,
      address !== undefined ? address : null,
      req.user_id,
    ]);

    if (result.rowCount === 0) {
      return next(new ApiError(404, "User record not found."));
    }

    // 5. Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user_id, "profile_updated", "user", req.user_id, `User ${result.rows[0].name} updated their profile`]
    ).catch(err => console.error("Error logging profile update:", err));

    // 6. Return
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, "Current password and new password are required."));
    }

    // Get the user's current password from the DB
    const userQuery = `SELECT password FROM users WHERE id = $1;`;
    const userRes = await pool.query(userQuery, [req.user_id]);

    if (userRes.rowCount === 0) {
      return next(new ApiError(404, "User record not found."));
    }

    const dbPassword = userRes.rows[0].password;
    const isMatch = await verifyPassword(currentPassword, dbPassword);

    if (!isMatch) {
      return next(new ApiError(400, "Current password is incorrect."));
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const updateQuery = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await pool.query(updateQuery, [hashedNewPassword, req.user_id]);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  profile,
  uploadAvatar,
  getAvatar,
  updateProfile,
  changePassword,
};


