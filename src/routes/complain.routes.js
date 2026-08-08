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
  searchComplaints,
  overrideCategory,
  showAllComplaints
} = require("../controllers/complain.controller.js");
const upload = require("../middleware/upload.middleware.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");
const { handleVote, getComplaintVoters } = require('../controllers/vote.controller.js');
const { postComment, fetchComments, deleteComment } = require('../controllers/comment.controller.js');
const {
  handleCommentVote,
  getCommentVoters,
  pinComment,
} = require("../controllers/commentVote.controller.js");


const complain_routes = express.Router();

// Define Complain routes
complain_routes.post("/", checkAuth, restrictTo("citizen"), upload.array("images", 6), createComplaint);
complain_routes.get("/", checkAuth, listComplaints);
complain_routes.get("/admin/filter", checkAuth, restrictTo("dept_admin", "super_admin"), filterComplainForAdmin);
complain_routes.get("/search", checkAuth, searchComplaints);
complain_routes.get("/all", checkAuth, showAllComplaints);
complain_routes.get("/:id", checkAuth, getComplaint);
complain_routes.patch("/:id", checkAuth, restrictTo("citizen", "dept_admin", "super_admin"), editComplaint);
complain_routes.patch("/:id/category", checkAuth, restrictTo("dept_admin", "super_admin"), overrideCategory);
complain_routes.patch("/:id/status", checkAuth, restrictTo("citizen", "field_worker", "worker", "dept_admin", "super_admin"), upload.array("images", 1), updateStatus);
complain_routes.delete("/:id", checkAuth, restrictTo("dept_admin", "super_admin"), deleteComplaint);
complain_routes.patch("/:id/assign", checkAuth, restrictTo("dept_admin", "super_admin"), manualAssignComplaint);
complain_routes.post("/:id/assign", checkAuth, restrictTo("dept_admin", "super_admin"), manualAssignComplaint);
complain_routes.get("/worker/tasks", checkAuth, restrictTo("worker", "field_worker"), getWorkerTasks);


// Vote routes
complain_routes.post('/:id/vote', checkAuth, handleVote);
complain_routes.get('/:id/voters', checkAuth, getComplaintVoters);

// Comment Routes
complain_routes.get('/:id/comments', checkAuth, fetchComments);
complain_routes.post('/:id/comments', checkAuth, upload.single('image'), postComment);
complain_routes.delete('/comments/:commentId', checkAuth, deleteComment);

// commnetVote
complain_routes.post("/comments/:commentId/vote", checkAuth, handleCommentVote);
complain_routes.get("/comments/:commentId/voters", checkAuth, getCommentVoters);
complain_routes.patch("/comments/:commentId/pin", checkAuth, pinComment);


module.exports = complain_routes;
