const pool = require("../config/db.js");
const { hashPassword } = require("../utils/validator.js");

const UserModel = {
  // Find by Email
  async findByEmail(email) {
    const datas = `
        SELECT  id,name,email,password,role,department_id
        FROM users
        WHERE email = $1;
        `;
    const result = await pool.query(datas, [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  /*
    Insert a new user into DB(During Signup)
    returns Promise<object> the newly created user record
  */

  async createUser({ name, email, password, phone, department_id, role }) {
    const hashedPassword = await hashPassword(password);
    const queryText = `
  INSERT INTO users(name,email,phone,password,role,department_id)
  VALUES($1,$2,$3,$4,$5,$6)
  RETURNING id,name,email,role,phone,created_at;
  `;

    const result = await pool.query(queryText, [
      name,
      email.toLowerCase(),
      phone,
      hashedPassword,
      role,
      department_id,
    ]);

    return result.rows[0];
  },

  async loginUser({ em, password }) {
    const queryText = `
    SELECT id,email,password,role
    FROM users
    WHERE email = $1
    `;

    const result = await pool.query(queryText, [em]);
    return result.rows[0] || null;
  },

  async saveRefreshToken(userId, tokenHash, expiresAt) {
  const query = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, tokenHash, expiresAt]);
  return result.rows[0];
},

async revokeRefreshToken(tokenHash) {
  const query = `
    UPDATE refresh_tokens 
    SET is_revoked = TRUE 
    WHERE token_hash = $1 
    RETURNING *;
  `;
  const result = await pool.query(query, [tokenHash]);
  return result.rowCount > 0;
},

async findRefreshToken(tokenHash) {
  const query = `
    SELECT * FROM refresh_tokens 
    WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW();
  `;
  const result = await pool.query(query, [tokenHash]);
  return result.rows[0] || null;
},

  //
};

module.exports = { UserModel };

