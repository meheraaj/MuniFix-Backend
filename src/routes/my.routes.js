const express = require("express");
const {
  profile,
  updateProfile,
  updatePassword,
} = require("../controllers/profile.controller.js");

const profile_routes = express.Router();

profile_routes.get("/profile", profile);
profile_routes.post("/updateprofile", updateProfile);
profile_routes.post("/updatepassword", updatePassword);

module.exports = profile_routes;
