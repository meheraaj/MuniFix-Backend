//Import
const express = require("express");
const cors = require("cors");

const pool = require("./config/db.js");
require("dotenv").config();
const ApiError = require("./utils/apiError.js");
const routes = require("./routes/routes.js");
const logsRouter = require("./routes/logs.routes.js");

const app = express();

// CORS: allow configured frontend domain + known Vercel deployments
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_DOMAIN,         // set this in Vercel env vars
  "https://muni-fix.vercel.app",       // primary Vercel deployment
  "http://localhost:3000",             // local dev
].filter(Boolean); // remove undefined/empty entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin header) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use("/api", routes);
app.use("/api/logs", logsRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to MuniFix API",
    });
})

// 404 error
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});
//Error Handling
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

module.exports = app;
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
  });
}
