const express = require("express");
const auth_routes = require("./auth.routes");
require("dotenv").config();
const routes = express.Router();

routes.use("/auth", auth_routes);

module.exports = routes;
