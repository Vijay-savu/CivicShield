const express = require("express");
const {
  createApplication,
  getApplicationById,
  listApplications,
  listOfficerApplications,
  simulateTamper,
} = require("./recordController");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { validateApplicationCreate } = require("../../middleware/validationMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Application Service",
    status: "active",
    capability: "scheme application creation, citizen access, tamper-aware record retrieval",
  });
});

router.use(authenticateToken);

router.get("/officer-view", authorizeRoles("officer", "admin"), listOfficerApplications);
router.get("/", authorizeRoles("citizen"), listApplications);
router.post("/create", authorizeRoles("citizen"), validateApplicationCreate, createApplication);
router.patch("/:id/simulate-tamper", authorizeRoles("citizen"), simulateTamper);
router.get("/:id", authorizeRoles("citizen"), getApplicationById);

module.exports = router;
