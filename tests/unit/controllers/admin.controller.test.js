const {
  getDepartments,
  getDepartmentWorkers,
  updateUserRole,
  createDepartment,
} = require("../../../src/controllers/admin.controller");
const pool = require("../../../src/config/db");

jest.mock("../../../src/config/db", () => ({
  query: jest.fn(),
}));

describe("Admin Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getDepartmentWorkers", () => {
    it("should fetch workers for a specific department (super_admin)", async () => {
      req.role = "super_admin";
      req.query.department_id = "2";
      pool.query.mockResolvedValueOnce({
        rows: [{ id: "w-1", name: "Worker 1", role: "field_worker" }],
      });

      await getDepartmentWorkers(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [2]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should restrict dept_admin to their own department workspace", async () => {
      req.role = "dept_admin";
      req.user_id = "admin-123";

      // 1. Resolve dept_admin user record query to department 3
      pool.query.mockResolvedValueOnce({
        rows: [{ department_id: 3 }],
      });
      // 2. Resolve workers query for department 3
      pool.query.mockResolvedValueOnce({
        rows: [{ id: "w-2", name: "Worker 2" }],
      });

      await getDepartmentWorkers(req, res, next);

      expect(pool.query).toHaveBeenNthCalledWith(1, expect.any(String), [
        "admin-123",
      ]);
      expect(pool.query).toHaveBeenNthCalledWith(2, expect.any(String), [3]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if department ID cannot be determined", async () => {
      req.role = "super_admin"; // No query parameter provided

      await getDepartmentWorkers(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "Department context could not be determined.",
        })
      );
    });
  });

  describe("updateUserRole", () => {
    it("should fail with 400 if target role is missing or invalid", async () => {
      req.params.id = "user-1";
      req.body = { role: "invalid_role" };

      await updateUserRole(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it("should return 404 if user is not found", async () => {
      req.params.id = "user-999";
      req.body = { role: "dept_admin", department_id: "1" };
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await updateUserRole(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: "Target user record not found.",
        })
      );
    });

    it("should update user role and record activity log", async () => {
      req.params.id = "user-1";
      req.user_id = "super-admin-1";
      req.body = { role: "dept_admin", department_id: "1" };

      // Update user query
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: "user-1", name: "John", role: "dept_admin" }],
      });
      // Activity log query
      pool.query.mockResolvedValueOnce({});

      await updateUserRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User role privileges modified successfully.",
        })
      );
    });
  });
});