const express = require("express");
const recordRoutes = require("./routes/recordRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CivicShield backend is running" });
});

app.use("/api/records", recordRoutes);

module.exports = app;
