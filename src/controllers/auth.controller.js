const crypto = require("crypto"); 
const { UserModel } = require("../models/user.model.js");
const ApiError = require("../utils/apiError");
const express = require("express");
const { verifyPassword } = require("../utils/validator.js");
const { generateToken, generateRefreshToken } = require("../utils/jwt.token.js");
const pool = require("../config/db.js");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, department_id, role } = req.body;

    if (!name || !email || !phone || !password) {
      return next(
        new ApiError(
          400,
          "Name, email, Password and phone are required fields."
        )
      );
    }

    // Check email already exist or not

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return next(
        new ApiError(409, "An Account with this email already exist.")
      );
    }

    const newUser = await UserModel.createUser({
      name,
      email,
      password,
      phone,
      department_id,
      role,
    });

    // Generate 6-digit verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await UserModel.saveOtp(newUser.id, otpCode, expiresAt);

    console.log(`\n==========================================\nREGISTRATION OTP FOR ${email}: ${otpCode}\n==========================================\n`);

    // Log to activity_logs
    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUser.id, "user_registered", "user", newUser.id, `User ${newUser.name} registered`]
    );

    return res.status(201).json({
      success: true,
      message: "Account registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const em = email.toLowerCase()
    const existingUser = await UserModel.findByEmail(em);
    if (!existingUser) {
      return next(new ApiError(409, "Account not found with this email."));
    }
    

    const loginResponse = await UserModel.loginUser({ em, password });

    let matched = await verifyPassword(password, loginResponse.password);

    if (matched) {
      const jwtToken = generateToken(loginResponse);
      const refreshToken = generateRefreshToken(loginResponse);
      
      // Hash token before storing in DB to defend against token-theft leaks
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      await UserModel.saveRefreshToken(loginResponse.id, tokenHash, expiresAt);

      // Log to activity_logs
      await pool.query(
        `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [existingUser.id, "user_login", "user", existingUser.id, `User ${existingUser.name} logged in`]
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        users: { email: em, id: loginResponse.id },
        authtoken: jwtToken,
        refreshToken: refreshToken, // Send to client to store securely
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid password.",
        email: email,
      });
    }
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};



//Signout 

const signout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new ApiError(400, "Refresh token required."));

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await UserModel.revokeRefreshToken(tokenHash);

    return res.status(200).json({
      success: true,
      message: "Session successfully signed out and revoked.",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new ApiError(400, "Refresh token required."));

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedToken = await UserModel.findRefreshToken(tokenHash);

    if (!storedToken) {
      return next(new ApiError(401, "Invalid, expired, or revoked refresh token."));
    }

    // Verify token structure
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    
    // Fetch fresh user data to embed in the new access token
    const queryText = `SELECT id, email, role FROM users WHERE id = $1`;
    const userRes = await pool.query(queryText, [decoded.id]);
    const user = userRes.rows[0];

    if (!user) return next(new ApiError(401, "User no longer exists."));

    const newAccessToken = generateToken(user);

    return res.status(200).json({
      success: true,
      authtoken: newAccessToken,
    });
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired refresh token."));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = req.body.otp || req.body.otp_code;
    if (!email || !otp) {
      return next(new ApiError(400, "Email and OTP code are required fields."));
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return next(new ApiError(404, "User not found."));
    }

    const validOtp = await UserModel.findValidOtp(user.id, otp);
    if (!validOtp) {
      return next(new ApiError(400, "Invalid, expired, or already used OTP."));
    }

    await UserModel.markOtpAsUsed(validOtp.id);
    await UserModel.verifyUserEmail(user.id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ApiError(400, "Email is required."));
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return next(new ApiError(404, "User not found with this email."));
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await UserModel.saveOtp(user.id, otpCode, expiresAt);

    console.log(`\n==========================================\nPASSWORD RESET OTP FOR ${email}: ${otpCode}\n==========================================\n`);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  register,
  login,
  signout,
  refreshSession,
  verifyOtp,
  forgotPassword,
};
