const express = require("express");
const { addNewComplain, getComplainByUserId } = require("../controllers/citizen.controller.js");
const upload = require("../middleware/multer.middlware.js");
const citizen_routes = express.Router();

citizen_routes.post("/complain", upload.array("images", 6), addNewComplain);
citizen_routes.get("/complain",getComplainByUserId)

module.exports = citizen_routes;
