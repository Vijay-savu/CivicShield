const express = require("express");
const { getLogs } = require("../controllers/logController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getLogs);

module.exports = router;
