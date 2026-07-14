const express = require("express");
const { register, login,signout,refreshSession } = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/auth.middleware.js");
const auth_routes = express.Router();

auth_routes.post("/signin", login);
auth_routes.post("/signup", register);
auth_routes.post("/signout", checkAuth, signout);
auth_routes.post("/refresh", refreshSession);


module.exports = auth_routes;
