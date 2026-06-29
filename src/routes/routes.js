const express = require("express");
const { checkAuth } = require("../middleware/auth.middleware");
const citizen_routes = require("./citizen.routes");
require("dotenv").config();
const routes = express.Router();

routes.use("/citizen", checkAuth, citizen_routes);

module.exports = routes;
