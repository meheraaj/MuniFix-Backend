const { generateToken, decodeToken, generateRefreshToken } = require("../../../src/utils/jwt.token");
const jwt = require("jsonwebtoken");

describe("JWT Token Utility Unit Tests", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test_secret_key";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret_key";
  });

  it("should generate and decode a valid access token", async () => {
    const payload = { id: "u-100", email: "jwt@test.com", role: "citizen" };
    const token = generateToken(payload);

    expect(token).toBeDefined();

    const decoded = await decodeToken(token);
    expect(decoded.id).toBe("u-100");
    expect(decoded.email).toBe("jwt@test.com");
    expect(decoded.role).toBe("citizen");
  });

  it("should generate a valid refresh token", () => {
    const payload = { id: "u-100" };
    const refreshToken = generateRefreshToken(payload);

    expect(refreshToken).toBeDefined();

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe("u-100");
  });
});