const { hashPassword, verifyPassword } = require("../../../src/utils/validator");

describe("Validator Utility Unit Tests", () => {
  it("should hash a raw password correctly", async () => {
    const rawPassword = "password123";
    const hashed = await hashPassword(rawPassword);
    
    expect(hashed).toBeDefined();
    expect(hashed).not.toEqual(rawPassword);
  });

  it("should return true for matching password and false for invalid password", async () => {
    const rawPassword = "password123";
    const hashed = await hashPassword(rawPassword);

    const isMatch = await verifyPassword("password123", hashed);
    const isInvalid = await verifyPassword("wrongpassword", hashed);

    expect(isMatch).toBe(true);
    expect(isInvalid).toBe(false);
  });
});