const express = require("express");
const auth_routes = require("./auth.routes");
const { profile } = require("../controllers/profile.controller");

const profile_routes = express.Router();

profile_routes.get("/profile", profile);

module.exports = profile_routes;
