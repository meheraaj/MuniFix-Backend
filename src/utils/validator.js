import bcrypt from "bcrypt";

export async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

export async function verifyPassword(userPassword, dbPassword) {
  const isMatch = await bcrypt.compare(userPassword, dbPassword);
  return isMatch;
}
