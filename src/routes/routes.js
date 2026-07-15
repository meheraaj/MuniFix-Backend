const express = require("express");
const auth_routes = require("./auth.routes.js");
const complain_routes = require("./complain.routes.js");
const profile_routes = require("./my.routes.js");
const citizen_routes = require("./citizen.routes.js");
const admin_routes = require("./admin.routes.js");

const routes = express.Router();

routes.use("/auth", auth_routes);
routes.use("/complain", complain_routes);
routes.use("/my", profile_routes);
routes.use("/citizen", citizen_routes);
routes.use("/admin", admin_routes);

module.exports = routes;


