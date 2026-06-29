const express = require("express");
const { addNewComplain } = require("../controllers/citizen.controller");

const citizen_routes = express.Router();

citizen_routes.post("/complain", addNewComplain);
module.exports = citizen_routes;
