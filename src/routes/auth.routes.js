const express = require("express");
const { register } = require("../controllers/auth.controller");

const auth_routes = express.Router();

auth_routes.post("/signin", (req, res, next) => {
  res.json(req.body);
});
auth_routes.post("/signup", register);

module.exports = auth_routes;
