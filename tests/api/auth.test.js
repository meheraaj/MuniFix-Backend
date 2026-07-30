const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
  query: jest.fn()
}));

describe("POST /api/auth API Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/signup", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 409 if user email already exists", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: "existing@test.com" }] });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "existing@test.com",
          phone: "+8801700000000",
          password: "Password123!"
        });

      expect(res.statusCode).toBe(409);
    });
  });

  describe("POST /api/auth/signin", () => {
    it("should return 409 if account is not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "nonexistent@test.com", password: "Password123!" });

      expect(res.statusCode).toBe(409);
    });
  });
});