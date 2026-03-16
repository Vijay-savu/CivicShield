const normalizeText = (value) => String(value ?? "").trim();
const { DOCUMENT_TYPES } = require("../models/DocumentRecord");
const { SUPPORTED_SCHEMES } = require("../utils/eligibilityEngine");

const validateLogin = (req, res, next) => {
  const email = normalizeText(req.body.email).toLowerCase();
  const password = normalizeText(req.body.password);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  req.validatedBody = { email, password };
  return next();
};

const validateRegister = (req, res, next) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email).toLowerCase();
  const password = normalizeText(req.body.password);
  const role = normalizeText(req.body.role).toLowerCase() || "citizen";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (!["citizen", "officer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be citizen, officer, or admin." });
  }

  req.validatedBody = { name, email, password, role };
  return next();
};

const validateApplicationCreate = (req, res, next) => {
  const name = normalizeText(req.body.name);
  const address = normalizeText(req.body.address);
  const schemeType = normalizeText(req.body.schemeType);
  const aadhaarNumber = normalizeText(req.body.aadhaarNumber);
  const aadhaarDocumentId = normalizeText(req.body.aadhaarDocumentId);
  const panDocumentId = normalizeText(req.body.panDocumentId);
  const incomeCertificateDocumentId = normalizeText(req.body.incomeCertificateDocumentId);

  if (
    !name ||
    !address ||
    !schemeType ||
    !aadhaarDocumentId ||
    !panDocumentId ||
    !incomeCertificateDocumentId
  ) {
    return res
      .status(400)
      .json({
        message:
          "name, address, schemeType, aadhaarDocumentId, panDocumentId, and incomeCertificateDocumentId are required.",
      });
  }

  if (!SUPPORTED_SCHEMES.includes(schemeType)) {
    return res.status(400).json({ message: "Selected scheme is not supported." });
  }

  req.validatedBody = {
    name,
    address,
    schemeType,
    aadhaarNumber,
    aadhaarDocumentId,
    panDocumentId,
    incomeCertificateDocumentId,
  };
  return next();
};

const validateDocumentUpload = (req, res, next) => {
  const documentType = normalizeText(req.body.documentType).toLowerCase();

  if (!documentType || !req.file) {
    return res.status(400).json({ message: "documentType and a document file are required." });
  }

  if (!DOCUMENT_TYPES.includes(documentType)) {
    return res.status(400).json({ message: "Unsupported document type." });
  }

  req.validatedBody = { documentType };
  return next();
};

const validateEligibilityCheck = (req, res, next) => {
  const recordId = normalizeText(req.body.recordId);
  const simulateOverload = Boolean(req.body.simulateOverload);

  if (!recordId) {
    return res.status(400).json({ message: "recordId is required." });
  }

  req.validatedBody = { recordId, simulateOverload };
  return next();
};

const validateDecision = (req, res, next) => {
  const recordId = normalizeText(req.body.recordId);
  const status = normalizeText(req.body.status).toLowerCase();
  const reason = normalizeText(req.body.reason);

  if (!recordId || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "recordId and a valid status are required." });
  }

  req.validatedBody = { recordId, status, reason };
  return next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateApplicationCreate,
  validateDocumentUpload,
  validateEligibilityCheck,
  validateDecision,
};
