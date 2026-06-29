const express = require("express");
const dotenv = require("dotenv");
const checkAuth = require("../middleware/auth.middleware.js");
const citizen_routes = require("./citizen.routes.js");

dotenv.config();

const routes = express.Router();

routes.use("/citizen", checkAuth, citizen_routes);

module.exports = routes;
