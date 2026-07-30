const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/config/db");
const { generateToken } = require("../../src/utils/jwt.token");
const { UserModel } = require("../../src/models/user.model");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));
jest.mock("../../src/models/user.model");

describe("GET /api/departments API Endpoints", () => {
  it("should fetch departments list for authorized user", async () => {
    const mockUser = { id: 1, email: "admin@test.com", role: "super_admin" };
    const token = generateToken(mockUser);

    UserModel.findByEmail.mockResolvedValue(mockUser);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Waterlogging", description: "Water drainage" }]
    });

    const res = await request(app)
      .get("/api/departments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.departments.length).toBe(1);
  });
});