//Import
const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "Ok",
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Running on Port " + process.env.PORT || 3000);
});
