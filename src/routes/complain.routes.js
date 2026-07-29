const express = require("express");
const {
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  deleteComplaint,
  filterComplainForAdmin,
  manualAssignComplaint,
  getWorkerTasks,
  editComplaint,
} = require("../controllers/complain.controller.js");
const upload = require("../middleware/upload.middleware.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const complain_routes = express.Router();

// Define Complain routes
complain_routes.post("/", checkAuth, restrictTo("citizen"), upload.array("images", 6), createComplaint);
complain_routes.get("/", checkAuth, listComplaints);
complain_routes.get("/admin/filter", checkAuth, restrictTo("dept_admin", "super_admin"), filterComplainForAdmin);
complain_routes.get("/:id", checkAuth, getComplaint);
complain_routes.patch("/:id", checkAuth, restrictTo("citizen", "dept_admin", "super_admin"), editComplaint);
complain_routes.patch("/:id/status", checkAuth, restrictTo("citizen", "dept_admin", "super_admin"), updateStatus);
complain_routes.delete("/:id", checkAuth, restrictTo("dept_admin", "super_admin"), deleteComplaint);
complain_routes.patch("/:id/assign", checkAuth, restrictTo("dept_admin", "super_admin"), manualAssignComplaint);
complain_routes.get("/worker/tasks", checkAuth, restrictTo("worker", "field_worker"), getWorkerTasks);
module.exports = complain_routes;
