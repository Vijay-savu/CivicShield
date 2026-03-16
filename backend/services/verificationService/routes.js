const express = require("express");
const { checkEligibility } = require("./verificationController");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { validateEligibilityCheck } = require("../../middleware/validationMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Verification Service",
    status: "active",
    capability: "eligibility checks, decision logic, circuit-breaker protected verification",
  });
});

router.post(
  "/checkEligibility",
  authenticateToken,
  authorizeRoles("citizen"),
  validateEligibilityCheck,
  checkEligibility
);

module.exports = router;
