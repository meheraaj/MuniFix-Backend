const express = require("express");
const auth_routes = require("./auth.routes");
const profile_routes = require("./my.routes");
const { checkAuth } = require("../middleware/auth.middleware");
require("dotenv").config();
const routes = express.Router();

routes.use("/auth", auth_routes);
routes.use("/my", checkAuth, profile_routes);

module.exports = routes;
