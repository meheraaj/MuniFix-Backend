const { checkAuth, restrictTo } = require("../../../src/middleware/auth.middleware");
const { UserModel } = require("../../../src/models/user.model");
const jwtUtils = require("../../../src/utils/jwt.token");

jest.mock("../../../src/models/user.model");
jest.mock("../../../src/utils/jwt.token");

describe("Auth Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it("should fail with 401 if authorization header is missing", async () => {
    await checkAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: "Unauthorized" })
    );
  });

  it("should pass req properties if token and user are valid", async () => {
    req.headers.authorization = "Bearer valid.jwt.token";
    jwtUtils.decodeToken.mockResolvedValue({ email: "user@test.com", id: 1, role: "citizen" });
    UserModel.findByEmail.mockResolvedValue({ id: 1, email: "user@test.com" });

    await checkAuth(req, res, next);

    expect(req.email).toBe("user@test.com");
    expect(req.user_id).toBe(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("should enforce RBAC with restrictTo middleware", () => {
    const middleware = restrictTo("super_admin", "dept_admin");
    req.role = "citizen";

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});