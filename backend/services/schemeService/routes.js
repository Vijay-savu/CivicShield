const express = require("express");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { createScheme, deleteScheme, listSchemes, updateScheme } = require("./schemeController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Scheme Service",
    status: "active",
    capability: "dynamic scheme listing, creation, updates, and deletion",
  });
});

router.use(authenticateToken);

router.get("/", authorizeRoles("citizen", "officer", "admin"), listSchemes);
router.post("/create", authorizeRoles("admin"), createScheme);
router.put("/:id", authorizeRoles("admin"), updateScheme);
router.delete("/:id", authorizeRoles("admin"), deleteScheme);

module.exports = router;
