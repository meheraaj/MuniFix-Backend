const { getDepartments, createDepartment } = require("../../../src/controllers/admin.controller");
const pool = require("../../../src/config/db");

jest.mock("../../../src/config/db", () => ({ query: jest.fn() }));

describe("Admin Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("getDepartments should return all departments", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Waterlogging" }] });

    await getDepartments(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("createDepartment should fail if name is missing", async () => {
    req.body = { description: "Missing name" };

    await createDepartment(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });
});