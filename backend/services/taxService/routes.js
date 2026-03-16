const express = require("express");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { getTaxStatus } = require("./taxController");
const circuitBreaker = require("./circuitBreaker");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Tax Service",
    status: "active",
    capability: "PAN-linked tax status with overload protection and circuit breaker",
    circuitBreaker: circuitBreaker.getState(),
  });
});

router.get("/status", authenticateToken, authorizeRoles("citizen"), getTaxStatus);

module.exports = router;
