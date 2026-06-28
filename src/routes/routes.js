const express = require("express");
const profile_routes = require("./my.routes");
const { checkAuth } = require("../middleware/auth.middleware");
require("dotenv").config();
const routes = express.Router();

routes.use("/my", checkAuth, profile_routes);

module.exports = routes;
