import pool from "../config/db.js";
import { hashPassword } from "../utils/validator.js";

export const DeptModel = {
  async getDeptNameById(id) {
    const datas = `
        SELECT name
        FROM departments
        WHERE id = $1;
        `;
    const result = await pool.query(datas, [id]);
    return result.rows[0] || null;
  },
};
