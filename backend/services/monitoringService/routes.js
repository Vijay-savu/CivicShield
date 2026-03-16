const express = require("express");
const { getLogs } = require("./monitoringController");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Security Service",
    status: "active",
    capability: "security logs, threat scoring, alerts, and operational visibility",
  });
});

router.get("/", authenticateToken, authorizeRoles("admin"), getLogs);

module.exports = router;
