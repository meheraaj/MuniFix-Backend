const pool = require("../config/db.js");
const { hashPassword } = require("../utils/validator.js");

const DeptModel = {
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

module.exports = { DeptModel };
