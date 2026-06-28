import pool from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/validator.js";

export const ProfileModel = {
  // Find by Email
  async findByEmail(email) {
    const datas = `
        SELECT  id,name,email,role,department_id,phone,created_at,updated_at
        FROM users
        WHERE email = $1;
        `;
    const result = await pool.query(datas, [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async updateName(name, email) {
    const datas = `
        UPDATE users
        SET name = $1
        WHERE email = $2
        RETURNING id, name, email, role, department_id;
    `;

    const result = await pool.query(datas, [name, email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async updateRole(role, email) {
    const datas = `
        UPDATE users
        SET role = $1
        WHERE email = $2
        RETURNING id, name, email, role, department_id;
    `;

    const result = await pool.query(datas, [role, email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async updatePass(oldPass, newPass, email) {
    const data = `
        SELECT password
        FROM users
        WHERE email = $1;
        `;
    const res = await pool.query(data, [email.toLowerCase()]);
    let oldPassEncrypted = res.rows[0] || null;

    if (!oldPassEncrypted) return null;
    const isMatch = await verifyPassword(oldPass, oldPassEncrypted.password);

    if (!isMatch) return null;

    let newPassEncrypted = await hashPassword(newPass);

    const datas = `
        UPDATE users
        SET password = $1
        WHERE email = $2
        RETURNING id, name, email, role, department_id;
    `;

    const result = await pool.query(datas, [
      newPassEncrypted,
      email.toLowerCase(),
    ]);
    return result.rows[0] || null;
  },
};
