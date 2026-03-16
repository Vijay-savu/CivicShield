const express = require("express");
const cors = require("cors");
const apiGateway = require("./gateway");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const isLocalFrontend = (origin = "") => /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      const configuredOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

      if (!origin || origin === configuredOrigin || isLocalFrontend(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for this origin."));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CivicShield verification backend" });
});

// The gateway is the single entry point for all service traffic.
app.use("/api", apiGateway);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
