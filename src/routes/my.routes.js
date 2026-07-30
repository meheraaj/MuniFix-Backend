const express = require("express");
const { profile, uploadAvatar, getAvatar, updateProfile, changePassword } = require("../controllers/profile.controller");
const { checkAuth } = require("../middleware/auth.middleware.js");
const upload = require("../middleware/upload.middleware.js");

const profile_routes = express.Router();

profile_routes.get("/profile", checkAuth, profile);
profile_routes.put("/profile", checkAuth, updateProfile);
profile_routes.patch("/password", checkAuth, changePassword);
profile_routes.get("/avatar",checkAuth,getAvatar)

profile_routes.post("/avatar",checkAuth,upload.single("avatar"),uploadAvatar);

module.exports = profile_routes;

