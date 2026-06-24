const bcrypt = required("bcrypt");

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashPassword;
}

async function verifyPassword(userPassword, dbPassword) {
  const isMatch = await bcrypt.compare(userPassword, dbPassword);
  return isMatch;
}

module.exports = {
  hashPassword,
  verifyPassword,
};
