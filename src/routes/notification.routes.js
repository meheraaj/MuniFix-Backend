const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notification.controller.js");
const { checkAuth } = require("../middleware/auth.middleware.js");

const notification_routes = express.Router();

notification_routes.get("/", checkAuth, getNotifications);
notification_routes.patch("/:id/read", checkAuth, markAsRead);

module.exports = notification_routes;
