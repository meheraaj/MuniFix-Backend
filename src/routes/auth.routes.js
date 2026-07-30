const express = require("express");
const { register, login, signout, refreshSession, verifyOtp, forgotPassword } = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/auth.middleware.js");
const auth_routes = express.Router();

auth_routes.post("/signin", login);
auth_routes.post("/signup", register);
auth_routes.post("/signout", checkAuth, signout);
auth_routes.post("/refresh", refreshSession);
auth_routes.post("/verify-otp", verifyOtp);
auth_routes.post("/forgot-password", forgotPassword);

module.exports = auth_routes;
