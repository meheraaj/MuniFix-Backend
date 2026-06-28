const express = require("express");
const { profile } = require("../controllers/profile.controller");

const profile_routes = express.Router();

profile_routes.get("/profile", profile);

module.exports = profile_routes;
