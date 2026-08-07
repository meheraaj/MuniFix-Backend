const express = require("express");
const { getDepartments, getDepartmentWorkers, updateUserRole,createDepartment } = require("../controllers/admin.controller.js");
const { checkAuth, restrictTo } = require("../middleware/auth.middleware.js");

const admin_routes = express.Router();


admin_routes.get("/departments", checkAuth, getDepartments);

admin_routes.get("/workers", checkAuth, restrictTo("dept_admin", "super_admin"), getDepartmentWorkers);

admin_routes.patch("/users/:id/role", checkAuth, restrictTo("super_admin"), updateUserRole);
admin_routes.post("/departments", checkAuth, restrictTo("super_admin"), createDepartment);

module.exports = admin_routes;