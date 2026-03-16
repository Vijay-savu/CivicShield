const express = require("express");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { getRecordLedger, getDocumentLedger } = require("./ledgerController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Ledger Service",
    status: "active",
    capability: "tamper-evident ledger chain verification for records and documents",
  });
});

router.use(authenticateToken);

router.get("/records/:id", authorizeRoles("citizen"), getRecordLedger);
router.get("/documents/:id", authorizeRoles("citizen"), getDocumentLedger);

module.exports = router;
