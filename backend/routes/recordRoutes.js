const express = require("express");
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  simulateTamper,
} = require("../controllers/recordController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  validateRecordCreate,
  validateRecordUpdate,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getRecords);
router.post("/create", authorizeRoles("citizen", "admin"), validateRecordCreate, createRecord);
router.get("/:id", getRecordById);
router.put("/:id", authorizeRoles("admin"), validateRecordUpdate, updateRecord);
router.patch(
  "/:id/simulate-tamper",
  authorizeRoles("admin"),
  validateRecordUpdate,
  simulateTamper
);

module.exports = router;
