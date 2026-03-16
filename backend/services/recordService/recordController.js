const ApplicationRecord = require("../../models/ApplicationRecord");
const { DocumentRecord } = require("../../models/DocumentRecord");
const GovernmentIncomeRecord = require("../../models/GovernmentIncomeRecord");
const User = require("../../models/User");
const { generateApplicationHash } = require("../../utils/hash");
const { getApplicationIntegrity } = require("../../utils/applicationIntegrity");
const { evaluateEligibility } = require("../../utils/eligibilityEngine");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");

const canAccess = (user, record) => record.createdBy.toString() === user.id;
const extractAadhaarNumber = (text) => {
  const normalized = String(text ?? "").replace(/\D/g, "");
  const match = normalized.match(/\d{12}/);
  return match ? match[0] : "";
};

const toResponse = (record, integrity) => {
  const citizenAlert = integrity.isTampered
    ? integrity.documentTampered
      ? "Security alert: your uploaded document appears to be altered."
      : "Security alert: your application data no longer matches its stored integrity proof."
    : record.suspicious
      ? "Suspicious application detected during automatic verification."
      : record.mismatchDetected
      ? "Eligibility alert: the OCR-extracted income does not match the verified government income record."
      : "";

  return {
    ...record.toObject(),
    integrityStatus: integrity.integrityStatus,
    requiredDocuments: record.requiredDocumentIds || [],
    citizenAlert,
  };
};

const toOfficerResponse = (record, integrity) => ({
  id: record._id,
  schemeType: record.schemeType,
  createdAt: record.createdAt,
  eligibilityStatus: record.verificationResult
    ? record.suspicious
      ? "Suspicious"
      : record.verificationResult.eligible
        ? "Eligible"
      : "Not Eligible"
    : "Pending",
  suspicious: record.suspicious,
  integrityStatus: integrity.integrityStatus,
});

const createApplication = async (req, res, next) => {
  try {
    const {
      name,
      address,
      schemeType,
      aadhaarNumber,
      aadhaarDocumentId,
      panDocumentId,
      incomeCertificateDocumentId,
    } = req.validatedBody;
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({ message: "Citizen profile not found." });
    }

    const documents = await DocumentRecord.find({
      _id: { $in: [aadhaarDocumentId, panDocumentId, incomeCertificateDocumentId] },
      userId: req.user.id,
    });

    const documentMap = new Map(documents.map((document) => [document._id.toString(), document]));
    const aadhaarDocument = documentMap.get(aadhaarDocumentId);
    const panDocument = documentMap.get(panDocumentId);
    const incomeCertificateDocument = documentMap.get(incomeCertificateDocumentId);

    if (!aadhaarDocument || aadhaarDocument.documentType !== "aadhaar") {
      return res.status(400).json({ message: "A valid uploaded Aadhaar document is required." });
    }

    if (!panDocument || panDocument.documentType !== "pan") {
      return res.status(400).json({ message: "A valid uploaded PAN document is required." });
    }

    if (!incomeCertificateDocument || incomeCertificateDocument.documentType !== "income_certificate") {
      return res.status(400).json({ message: "A valid uploaded income certificate is required." });
    }

    const resolvedAadhaarNumber = aadhaarNumber || extractAadhaarNumber(aadhaarDocument.ocrText);

    if (!resolvedAadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number could not be read from the uploaded Aadhaar document." });
    }

    const extractedIncome = incomeCertificateDocument.extractedIncome;

    if (extractedIncome === null) {
      await logEvent({
        action: "ocr_verification_failed",
        user: req.user.email,
        userId: req.user.id,
        status: "failed",
        details: "Could not extract annual income from the uploaded income certificate document",
        ipAddress: req.ip || "unknown",
      });

      return res.status(422).json({
        message: "Income could not be extracted from the uploaded income certificate.",
      });
    }

    const officialIncomeRecord = await GovernmentIncomeRecord.findOne({ aadhaar: resolvedAadhaarNumber });

    const createdAt = new Date();
    const hashVersion = 3;
    const hash = generateApplicationHash(
      {
        name,
        income: extractedIncome,
        address,
        schemeType,
        aadhaarNumber: resolvedAadhaarNumber,
        incomeCertificateHash: incomeCertificateDocument.documentHash,
        createdAt,
      },
      hashVersion
    );
    const evaluation = evaluateEligibility({
      schemeType,
      declaredIncome: extractedIncome,
      verifiedIncome: officialIncomeRecord?.annualIncome ?? null,
      officialRecordFound: Boolean(officialIncomeRecord),
      aadhaarNumber: resolvedAadhaarNumber,
      panNumber: "OCR-VERIFIED",
      incomeCertificateNumber: incomeCertificateDocument.originalFileName,
    });

    const record = await ApplicationRecord.create({
      name,
      income: extractedIncome,
      extractedIncome,
      address,
      schemeType,
      aadhaar: resolvedAadhaarNumber,
      aadhaarNumber: resolvedAadhaarNumber,
      aadhaarDocumentId: aadhaarDocument._id,
      panDocumentId: panDocument._id,
      incomeCertificateDocumentId: incomeCertificateDocument._id,
      panNumber: "",
      incomeCertificateNumber: incomeCertificateDocument.originalFileName,
      ocrText: incomeCertificateDocument.ocrText,
      ocrEngine: incomeCertificateDocument.ocrEngine,
      incomeCertificateFileName: incomeCertificateDocument.originalFileName,
      incomeCertificateMimeType: incomeCertificateDocument.mimeType,
      incomeCertificatePath: incomeCertificateDocument.filePath,
      incomeCertificateSize: incomeCertificateDocument.fileSize,
      incomeCertificateHash: incomeCertificateDocument.documentHash,
      hash,
      hashVersion,
      verifiedIncome: officialIncomeRecord?.annualIncome ?? null,
      mismatchDetected: evaluation.mismatchDetected,
      suspicious: evaluation.suspicious,
      createdBy: req.user.id,
      requiredDocumentIds: [aadhaarDocument._id, panDocument._id, incomeCertificateDocument._id],
      verificationResult: {
        eligible: evaluation.eligible,
        reason: evaluation.reason,
        checkedAt: createdAt,
        checkedBy: null,
      },
      documentStatus: evaluation.documentStatus,
      decision: {
        status: evaluation.decisionStatus,
        reason: evaluation.reason,
        decidedAt: createdAt,
        decidedBy: null,
      },
      createdAt,
      updatedAt: createdAt,
    });

    await logEvent({
      action: "record_created",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Submitted ${schemeType} application using uploaded government documents`,
      ipAddress: req.ip || "unknown",
    });

    await logEvent({
      action: "scheme_documents_verified",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Verified uploaded Aadhaar, PAN, and income certificate documents for ${schemeType}`,
      ipAddress: req.ip || "unknown",
    });

    await logEvent({
      action: "ocr_verification_result",
      user: req.user.email,
      userId: req.user.id,
      status: evaluation.eligible ? "success" : "warning",
      details: `OCR extracted income ${extractedIncome} from stored income certificate for ${schemeType}`,
      ipAddress: req.ip || "unknown",
    });

    if (evaluation.suspicious || evaluation.mismatchDetected) {
      await notifyUser({
        userId: req.user.id,
        userEmail: req.user.email,
        type: "income_mismatch_detected",
        title: "Suspicious Income Verification Result",
        message: evaluation.reason,
        severity: "alert",
        relatedRecordId: record._id,
      });
    }

    const integrity = {
      isTampered: false,
      documentTampered: false,
      integrityStatus: "VERIFIED",
    };

    return res.status(201).json({
      message: "Application submitted and verified successfully",
      record: {
        ...toResponse(record, integrity),
        extractedIncome,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const record = await ApplicationRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (!canAccess(req.user, record)) {
      return res.status(403).json({ message: "You cannot access this application." });
    }

    const integrity = await getApplicationIntegrity(record);

    if (integrity.isTampered) {
      await logEvent({
        action: "tampering_detected",
        user: req.user.email,
        userId: req.user.id,
        status: "alert",
        details: `Tampering detected for application ${record._id}`,
        ipAddress: req.ip || "unknown",
      });

      await notifyUser({
        userId: req.user.id,
        userEmail: req.user.email,
        type: "tampering_detected",
        title: "Record Tampering Alert",
        message: integrity.documentTampered
          ? "Security Alert: Your uploaded document appears to be altered."
          : "Your application data failed integrity verification. Please review this record immediately.",
        severity: "alert",
        relatedRecordId: record._id,
      });

      return res.status(200).json({
        integrityStatus: "TAMPERING DETECTED",
        alert: "A security alert has been posted to your account.",
        record: toResponse(record, integrity),
      });
    }

    return res.status(200).json({
      integrityStatus: "VERIFIED",
      record: toResponse(record, integrity),
    });
  } catch (error) {
    return next(error);
  }
};

const listApplications = async (req, res, next) => {
  try {
    const records = await ApplicationRecord.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const responseRecords = await Promise.all(
      records.map(async (record) => toResponse(record, await getApplicationIntegrity(record)))
    );

    return res.status(200).json({
      records: responseRecords,
    });
  } catch (error) {
    return next(error);
  }
};

const listOfficerApplications = async (req, res, next) => {
  try {
    const records = await ApplicationRecord.find({}).sort({ createdAt: -1 }).limit(200);
    const responseRecords = await Promise.all(
      records.map(async (record) => toOfficerResponse(record, await getApplicationIntegrity(record)))
    );

    return res.status(200).json({
      records: responseRecords,
    });
  } catch (error) {
    return next(error);
  }
};

const simulateTamper = async (req, res, next) => {
  try {
    const record = await ApplicationRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (!canAccess(req.user, record)) {
      return res.status(403).json({ message: "You cannot access this application." });
    }

    record.address = `${record.address} (tampered)`;
    await record.save();

    await logEvent({
      action: "record_modified",
      user: req.user.email,
      userId: req.user.id,
      status: "warning",
      details: `Tamper simulation applied to application ${record._id}`,
      ipAddress: req.ip || "unknown",
    });

    await notifyUser({
      userId: req.user.id,
      userEmail: req.user.email,
      type: "tampering_detected",
      title: "Record Tampering Alert",
      message: "Security Alert: Your uploaded document appears to be altered.",
      severity: "alert",
      relatedRecordId: record._id,
    });

    const integrity = await getApplicationIntegrity(record);

    return res.status(200).json({
      message: "Tamper simulation applied",
      record: toResponse(record, integrity),
      integrityStatus: "TAMPERING DETECTED",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createApplication,
  getApplicationById,
  listApplications,
  listOfficerApplications,
  simulateTamper,
};
