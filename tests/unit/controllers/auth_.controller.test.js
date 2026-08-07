const {
  signout,
  refreshSession,
  verifyOtp,
  forgotPassword,
} = require("../../../src/controllers/auth.controller");
const { UserModel } = require("../../../src/models/user.model");
const pool = require("../../../src/config/db");

jest.mock("../../../src/models/user.model");
jest.mock("../../../src/config/db", () => ({
  query: jest.fn(),
}));

describe("Auth Controller ", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("signout", () => {
    it("should return 400 if refresh token is missing", async () => {
      await signout(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it("should revoke session and return 200", async () => {
      req.body.refreshToken = "valid_refresh_token_string";
      UserModel.revokeRefreshToken.mockResolvedValueOnce(true);

      await signout(req, res, next);

      expect(UserModel.revokeRefreshToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Session successfully signed out and revoked.",
      });
    });
  });

  describe("verifyOtp", () => {
    it("should fail with 400 if email or OTP are missing", async () => {
      req.body = { email: "user@test.com" };

      await verifyOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it("should fail with 404 if user is not found", async () => {
      req.body = { email: "notfound@test.com", otp: "123456" };
      UserModel.findByEmail.mockResolvedValueOnce(null);

      await verifyOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it("should verify email when OTP is valid", async () => {
      req.body = { email: "user@test.com", otp: "123456" };

      UserModel.findByEmail.mockResolvedValueOnce({
        id: "u-1",
        email: "user@test.com",
      });
      UserModel.findValidOtp.mockResolvedValueOnce({ id: "otp-1" });
      UserModel.markOtpAsUsed.mockResolvedValueOnce({});
      UserModel.verifyUserEmail.mockResolvedValueOnce({});

      await verifyOtp(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Email verified successfully.",
      });
    });
  });

  describe("forgotPassword", () => {
    it("should generate and save reset OTP for valid email", async () => {
      req.body = { email: "user@test.com" };

      UserModel.findByEmail.mockResolvedValueOnce({
        id: "u-1",
        email: "user@test.com",
      });
      UserModel.saveOtp.mockResolvedValueOnce({});

      await forgotPassword(req, res, next);

      expect(UserModel.saveOtp).toHaveBeenCalledWith(
        "u-1",
        expect.any(String),
        expect.any(Date)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset OTP sent successfully.",
      });
    });
  });
});