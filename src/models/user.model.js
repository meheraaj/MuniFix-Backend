import pool from "../config/db";

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


  //
};
