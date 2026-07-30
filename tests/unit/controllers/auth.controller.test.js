const { register, login, signout, forgotPassword } = require("../../../src/controllers/auth.controller");
const { UserModel } = require("../../../src/models/user.model");
const pool = require("../../../src/config/db");
const { verifyPassword } = require("../../../src/utils/validator");
const { generateToken, generateRefreshToken } = require("../../../src/utils/jwt.token");

jest.mock("../../../src/models/user.model");
jest.mock("../../../src/config/db", () => ({ query: jest.fn() }));
jest.mock("../../../src/utils/validator");
jest.mock("../../../src/utils/jwt.token");

describe("Auth Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query.mockResolvedValue({ rows: [], rowCount: 1 });
    
    // Explicitly mock helper functions so login doesn't take the 400 error path
    verifyPassword.mockResolvedValue(true);
    generateToken.mockReturnValue("mock_token");
    generateRefreshToken.mockReturnValue("mock_refresh_token");
  });

  afterEach(() => jest.clearAllMocks());

  it("register should fail if required fields are missing", async () => {
    req.body = { name: "John" };
    await register(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("login should return token on valid credentials", async () => {
    req.body = { email: "john@test.com", password: "Password123!" };
    UserModel.findByEmail.mockResolvedValue({ id: 1, name: "John", email: "john@test.com" });
    UserModel.loginUser.mockResolvedValue({ id: 1, email: "john@test.com", password: "$2b$10$hashed" });
    UserModel.saveRefreshToken.mockResolvedValue({});

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ authtoken: "mock_token" }));
  });
});