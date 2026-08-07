const {
  profile,
  updateProfile,
  changePassword,
} = require("../../../src/controllers/profile.controller");
const { UserModel } = require("../../../src/models/user.model");
const pool = require("../../../src/config/db");
const { verifyPassword, hashPassword } = require("../../../src/utils/validator");

jest.mock("../../../src/models/user.model");
jest.mock("../../../src/config/db", () => ({
  query: jest.fn(),
}));
jest.mock("../../../src/utils/validator");

describe("Profile Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, email: "user@test.com", user_id: "user-123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("profile", () => {
    it("should return user profile without password", async () => {
      UserModel.findByEmail.mockResolvedValueOnce({
        id: "user-123",
        name: "Test User",
        email: "user@test.com",
        password: "hashed_password",
      });

      await profile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Valid JWT",
        profile: { id: "user-123", name: "Test User", email: "user@test.com" },
      });
    });
  });

  describe("updateProfile", () => {
    it("should fail if name is shorter than 2 characters", async () => {
      req.body = { name: "A" };

      await updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it("should update profile successfully", async () => {
      req.body = { name: "Updated Name", phone: "+8801700000000", address: "Dhaka" };
      
      // Phone uniqueness check returning 0 existing rows
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      // Update query returning updated user
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: "user-123", name: "Updated Name", phone: "+8801700000000" }],
      });
      // Activity log query insert catch suppression
      pool.query.mockResolvedValueOnce({});

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile updated successfully",
        })
      );
    });
  });

  describe("changePassword", () => {
    it("should fail if current password is wrong", async () => {
      req.body = { currentPassword: "wrong", newPassword: "NewPassword123!" };
      
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ password: "hashed_old_password" }],
      });
      verifyPassword.mockResolvedValueOnce(false);

      await changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "Current password is incorrect.",
        })
      );
    });

    it("should change password when current password matches", async () => {
      req.body = { currentPassword: "OldPassword123!", newPassword: "NewPassword123!" };

      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ password: "hashed_old_password" }],
      });
      verifyPassword.mockResolvedValueOnce(true);
      hashPassword.mockResolvedValueOnce("hashed_new_password");
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password changed successfully.",
      });
    });
  });
});