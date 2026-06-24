const express = require("express");
const { register, login } = require("../controllers/auth.controller");

const auth_routes = express.Router();

auth_routes.post("/signin", login);
auth_routes.post("/signup", register);

module.exports = auth_routes;
