const express = require("express");
const { getLogs } = require("./monitoringController");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Monitoring Service",
    status: "active",
    capability: "security logs, alerts, and operational visibility",
  });
});

router.get("/", authenticateToken, authorizeRoles("admin"), getLogs);

module.exports = router;
