const express = require("express");
const complaint_routes = require("./complaint.routes");

const routes = express.Router();

routes.use("/complaints", complaint_routes);

module.exports = routes;
