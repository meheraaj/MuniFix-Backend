//Import
const express = require("express");

const pool = require("./config/db.js");
require("dotenv").config();

const app = express();

app.use(express.json());

//database test
app.get("/testdb", async (req, res) => {
  try {
    const ress = await pool.query("SELECT NOW()");
    console.log("Connected:", ress.rows[0]);
    res.json({
      ress,
    });
  } catch (err) {
    console.error(err);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Running on Port " + process.env.PORT || 3000);
});
