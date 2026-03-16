const express = require("express");
const { authenticateToken, authorizeRoles } = require("../../middleware/authMiddleware");
const { uploadGovernmentDocument } = require("../../middleware/uploadMiddleware");
const { validateDocumentUpload } = require("../../middleware/validationMiddleware");
const { uploadDocument, listDocuments, getDocumentById, deleteDocument } = require("./documentController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Document Service",
    status: "active",
    capability: "document upload, validation, hashing, integrity checks",
  });
});

router.use(authenticateToken);

router.get("/", authorizeRoles("citizen"), listDocuments);
router.get("/:id", authorizeRoles("citizen"), getDocumentById);
router.delete("/:id", authorizeRoles("citizen"), deleteDocument);
router.post("/upload", authorizeRoles("citizen"), uploadGovernmentDocument, validateDocumentUpload, uploadDocument);

module.exports = router;
