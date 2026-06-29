import pool from "../config/db.js";
import { hashPassword } from "../utils/validator.js";

export const CitizenModel = {
  async addNewComplain(
    longitude,
    latitude,
    city,
    street,
    title,
    description,
    citizen_id
  ) {
    const query = `
        INSERT INTO complaints(longitude,latitude,city,street,title,description,status,citizen_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id,citizen_id,status
        `;

    const result = await pool.query(query, [
      longitude,
      latitude,
      city,
      street,
      title,
      description,
      "pending",
      citizen_id,
    ]);

    return result.rows[0] || null;
  },

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

  //
};
