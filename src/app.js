//Import
const express = require("express");
const cors = require("cors");

const pool = require("./config/db.js");
require("dotenv").config();
const ApiError = require("./utils/apiError.js");
const routes = require("./routes/routes.js");
const logsRouter = require("./routes/logs.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api/logs", logsRouter);

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

// 404 error
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});
//Error Handling
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: err.stack,
  });
});

app.listen(process.env.PORT || 3000, async () => {
  // Ensure address column exists (safe to run repeatedly: IF NOT EXISTS)
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
    console.log("[migration] users.address column ready.");
  } catch (err) {
    console.error("[migration] Failed to ensure users.address column:", err.message);
  }
  console.log("Running on Port " + (process.env.PORT || 3000));
});
