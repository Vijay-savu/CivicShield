const fs = require("fs");
const fsPromises = require("fs/promises");
const { DocumentRecord } = require("../../models/DocumentRecord");
const { hashDocumentBuffer, hashDocumentFromPath } = require("../../utils/hashDocument");
const { scanDocumentText } = require("../ocrService/ocrController");
const { extractIncomeFromText } = require("../../utils/extractIncome");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");
const { validateDocumentContent } = require("../../utils/validateDocumentContent");
const { appendLedgerEntry } = require("../../utils/tamperLedger");

const documentLabels = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  birth_certificate: "Birth Certificate",
  driving_licence: "Driving Licence",
  income_certificate: "Income Certificate",
};

const cleanupUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    // Best-effort cleanup so invalid uploads are not retained.
  }
};

const getIntegrity = async (document) => {
  let currentHash = document.documentHash;

  if (document.filePath && fs.existsSync(document.filePath)) {
    currentHash = await hashDocumentFromPath(document.filePath);
  } else if (document.filePath) {
    currentHash = null;
  }

  const isTampered = currentHash !== document.documentHash;

  return {
    currentHash,
    isTampered,
    integrityStatus: isTampered ? "TAMPERING DETECTED" : "VERIFIED",
  };
};

const toCitizenResponse = async (document) => {
  const integrity = await getIntegrity(document);

  return {
    _id: document._id,
    documentType: document.documentType,
    documentLabel: documentLabels[document.documentType] || document.documentType,
    originalFileName: document.originalFileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    uploadedAt: document.createdAt,
    extractedIncome: document.extractedIncome,
    ocrEngine: document.ocrEngine,
    integrityStatus: integrity.integrityStatus,
  };
};

const uploadDocument = async (req, res, next) => {
  try {
    const { documentType } = req.validatedBody;
    const file = req.file;
    const buffer = fs.readFileSync(file.path);
    const documentHash = hashDocumentBuffer(buffer);

    const ocrResult = await scanDocumentText(file);
    const ocrText = ocrResult.text;
    const ocrEngine = ocrResult.engine;
    let extractedIncome = null;

    if (documentType === "income_certificate") {
      extractedIncome = extractIncomeFromText(ocrText);
    }

    const validation = validateDocumentContent({
      documentType,
      text: ocrText,
      extractedIncome,
    });

    if (!validation.valid) {
      await cleanupUploadedFile(file.path);

      await logEvent({
        action: "document_upload_rejected",
        user: req.user.email,
        userId: req.user.id,
        status: "failed",
        details: `${documentLabels[documentType] || documentType} rejected: ${validation.reason}`,
        ipAddress: req.ip || "unknown",
      });

      return res.status(422).json({
        message: "Invalid document for selected type.",
      });
    }

    const existingDocuments = await DocumentRecord.find({ userId: req.user.id, documentType }).sort({ createdAt: -1 });

    for (const existingDocument of existingDocuments) {
      await cleanupUploadedFile(existingDocument.filePath);
      await existingDocument.deleteOne();
    }

    const document = await DocumentRecord.create({
      userId: req.user.id,
      documentType,
      originalFileName: file.originalname,
      storedFileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileUrl: file.path,
      documentHash,
      ocrText,
      ocrEngine,
      extractedIncome,
    });

    await appendLedgerEntry({
      entityType: "document_record",
      entityId: document._id,
      action: existingDocuments.length ? "document_replaced" : "document_uploaded",
      actorEmail: req.user.email,
      actorId: req.user.id,
      payload: {
        documentType,
        documentHash,
        ocrEngine,
        extractedIncome,
      },
      metadata: {
        originalFileName: file.originalname,
      },
    });

    await logEvent({
      action: "document_uploaded",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: existingDocuments.length
        ? `Replaced ${documentLabels[documentType] || documentType}`
        : `Uploaded ${documentLabels[documentType] || documentType}`,
      ipAddress: req.ip || "unknown",
    });

    if (documentType === "income_certificate" && extractedIncome === null) {
      await notifyUser({
        userId: req.user.id,
        userEmail: req.user.email,
        type: "ocr_verification_failed",
        title: "Income Certificate Needs Review",
        message: "Income could not be extracted from the uploaded certificate.",
        severity: "warning",
        relatedRecordId: document._id,
      });
    }

    return res.status(201).json({
      message: existingDocuments.length ? "Document replaced successfully." : "Document uploaded successfully.",
      document: await toCitizenResponse(document),
    });
  } catch (error) {
    await cleanupUploadedFile(req.file?.path);
    return next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const documents = await DocumentRecord.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const responseDocuments = await Promise.all(documents.map(toCitizenResponse));

    return res.status(200).json({ documents: responseDocuments });
  } catch (error) {
    return next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await DocumentRecord.findOne({ _id: req.params.id, userId: req.user.id });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const integrity = await getIntegrity(document);

    if (integrity.isTampered) {
      await logEvent({
        action: "tampering_detected",
        user: req.user.email,
        userId: req.user.id,
        status: "alert",
        details: `Tampering detected for document ${document._id}`,
        ipAddress: req.ip || "unknown",
      });

      await notifyUser({
        userId: req.user.id,
        userEmail: req.user.email,
        type: "tampering_detected",
        title: "Document Tampering Alert",
        message: "Security Alert: Your document integrity has been compromised.",
        severity: "alert",
        relatedRecordId: document._id,
      });

      await appendLedgerEntry({
        entityType: "document_record",
        entityId: document._id,
        action: "tampering_detected",
        actorEmail: req.user.email,
        actorId: req.user.id,
        payload: {
          storedHash: document.documentHash,
          currentHash: integrity.currentHash,
        },
        metadata: {
          integrityStatus: integrity.integrityStatus,
        },
      });
    }

    return res.status(200).json({
      document: await toCitizenResponse(document),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await DocumentRecord.findOne({ _id: req.params.id, userId: req.user.id });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    await cleanupUploadedFile(document.filePath);

    await appendLedgerEntry({
      entityType: "document_record",
      entityId: document._id,
      action: "document_deleted",
      actorEmail: req.user.email,
      actorId: req.user.id,
      payload: {
        documentType: document.documentType,
        documentHash: document.documentHash,
      },
      metadata: {
        originalFileName: document.originalFileName,
      },
    });

    await document.deleteOne();

    await logEvent({
      action: "document_deleted",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Deleted ${documentLabels[document.documentType] || document.documentType}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(200).json({ message: "Document removed successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocument,
  documentLabels,
};
