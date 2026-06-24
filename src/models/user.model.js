import pool from "../config/db";
import { hashPassword } from "../utils/validator";

export const UserModel = {
  // Find by Email
  async findByEmail(email) {
    const datas = `
        SELECT  id,name,email.password_hash,role,department_id
        FROM users
        WHERE email = $1;
        `;
    const result = await pool(datas, [email.toLowerCase()]);
    return result.row[0] || null;
  },

  /*
    Insert a new user into DB(During Signup)
    returns Promise<object> the newly created user record
  */

  async createUser({ name, email, pass, phone, department_id, role }) {
    const hashedPassword = hashPassword(pass);
    const queryText = `
  INSERT INTO users(name,email,phone,password_hash,role,department_id)
  VALUES($1,$2,$3,$4,$5,$6)
  RETURNING id,name,email.role,phone,created_at;
  `;

    const result = await pool.query(queryText, [
      name,
      email.toLowerCase(),
      phone,
      hashedPassword,
      role,
      department_id,
    ]);

    return result.row[0];
  },

  //
};
