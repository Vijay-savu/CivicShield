const express = require("express");
const {
  createRecord,
  getRecordById,
  updateRecord,
} = require("../controllers/recordController");

const router = express.Router();

router.post("/create", createRecord);
router.get("/:id", getRecordById);
router.put("/:id", updateRecord);

module.exports = router;
