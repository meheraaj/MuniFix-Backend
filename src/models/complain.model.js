const pool = require("../config/db.js");
const { hashPassword } = require("../utils/validator.js");

const ComplainModel = {
  async addNewComplain(
    longitude,
    latitude,
    city,
    street,
    title,
    description,
    citizen_id,
    imgUrl
  ) {
    const query = `
        INSERT INTO complaints(longitude,latitude,city,street,title,description,status,citizen_id,image_url)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id,citizen_id,status
        `;

        console.log(imgUrl)
    const result = await pool.query(query, [
      longitude,
      latitude,
      city,
      street,
      title,
      description,
      "pending",
      citizen_id,
      imgUrl
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
  async userComplainList(user_id, limit = 10, offset = 0) {
    const query = `
      SELECT id, title, image_url, created_at, description,
             longitude, latitude, street, city
      FROM complaints
      WHERE citizen_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3;
    `;
  
    const response = await pool.query(query, [user_id, limit, offset]);
    return response.rows;
  }
  
};

module.exports = { ComplainModel };
