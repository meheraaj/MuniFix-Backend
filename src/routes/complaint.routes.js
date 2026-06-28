const express = require("express");
const {
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  deleteComplaint,
} = require("../controllers/complaint.controller.js");
const upload = require("../middleware/upload.middleware.js");

const complaint_routes = express.Router();

// Define Complaint routes
complaint_routes.post("/", upload.single("image"), createComplaint);
complaint_routes.get("/", listComplaints);
complaint_routes.get("/:id", getComplaint);
complaint_routes.patch("/:id/status", updateStatus);
complaint_routes.delete("/:id", deleteComplaint);

module.exports = complaint_routes;
