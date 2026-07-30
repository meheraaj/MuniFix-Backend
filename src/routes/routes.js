const express = require("express");
const auth_routes = require("./auth.routes.js");
const complain_routes = require("./complain.routes.js");
const profile_routes = require("./my.routes.js");
const citizen_routes = require("./citizen.routes.js");
const admin_routes = require("./admin.routes.js");
const notification_routes = require("./notification.routes.js");
const departments_routes = require("./departments.routes.js");
const users_routes = require("./users.routes.js");

const routes = express.Router();

routes.use("/auth", auth_routes);
routes.use("/complain", complain_routes);
routes.use("/my", profile_routes);
routes.use("/citizen", citizen_routes);
routes.use("/admin", admin_routes);
routes.use("/notifications", notification_routes);
routes.use("/departments", departments_routes);
routes.use("/users", users_routes);


module.exports = routes;


