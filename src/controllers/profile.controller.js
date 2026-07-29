
const cloudinary = require("../config/cloudinary.js");
const pool = require("../config/db.js");
const ApiError = require("../utils/apiError");
const { UserModel } = require("../models/user.model.js");

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
module.exports = {
  profile,uploadAvatar,getAvatar
};

