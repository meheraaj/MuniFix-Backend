const express = require("express");
const {
  submitRoadblock,
  getRoadblocks,
  requestAIReroute,
  updateRoadblockStatus,
} = require("../controllers/traffic.controller.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/roadblocks", checkAuth, getRoadblocks);

// Submit new roadblock (Admins and Field Workers)
router.post(
  "/roadblocks",
  checkAuth,
  restrictTo("field_worker", "worker", "dept_admin", "super_admin"),
  submitRoadblock
);

// Toggle roadblock status active/resolved (Admins and Field Workers)
router.patch(
  "/roadblocks/:id/status",
  checkAuth,
  restrictTo("field_worker", "worker", "dept_admin", "super_admin"),
  updateRoadblockStatus
);

// Request AI Reroute (Returns blocked path, AI detour path, and reasoning in 1 request)
router.post("/reroute", checkAuth, requestAIReroute);

module.exports = router;