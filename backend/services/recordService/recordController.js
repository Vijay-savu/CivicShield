const ApplicationRecord = require("../../models/ApplicationRecord");
const { DocumentRecord } = require("../../models/DocumentRecord");
const Scheme = require("../../models/Scheme");
const User = require("../../models/User");
const { generateApplicationHash } = require("../../utils/hash");
const { getApplicationIntegrity } = require("../../utils/applicationIntegrity");
const { evaluateEligibility, getRequiredDocumentsForScheme } = require("../../utils/eligibilityEngine");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");
const { appendLedgerEntry } = require("../../utils/tamperLedger");
const { verifyUploadedDocumentIdentity } = require("../../utils/documentIdentity");

const canAccess = (user, record) => record.createdBy.toString() === user.id;

const toResponse = (record, integrity) => {
  const citizenAlert = integrity.isTampered
    ? integrity.documentTampered
      ? "Security alert: your uploaded document appears to be altered."
      : "Security alert: your application data no longer matches its stored integrity proof."
    : record.suspicious
      ? "Uploaded documents could not be linked to the same citizen during automatic verification."
      : record.mismatchDetected
      ? "Eligibility alert: uploaded document data could not be verified."
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
      birthCertificateDocumentId,
    } = req.validatedBody;
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({ message: "Citizen profile not found." });
    }

    const scheme = await Scheme.findOne({ name: schemeType, active: true });

    if (!scheme) {
      return res.status(400).json({ message: "Selected scheme is not available." });
    }

    const requiredDocuments = getRequiredDocumentsForScheme(schemeType, scheme);
    const requestedDocumentIds = [
      aadhaarDocumentId,
      panDocumentId,
      incomeCertificateDocumentId,
      birthCertificateDocumentId,
    ].filter(Boolean);
    const documents = await DocumentRecord.find({
      _id: { $in: requestedDocumentIds },
      userId: req.user.id,
    });

    const documentMap = new Map(documents.map((document) => [document._id.toString(), document]));
    const aadhaarDocument = documentMap.get(aadhaarDocumentId);
    const panDocument = documentMap.get(panDocumentId);
    const incomeCertificateDocument = documentMap.get(incomeCertificateDocumentId);
    const birthCertificateDocument = documentMap.get(birthCertificateDocumentId);

    if (requiredDocuments.includes("aadhaar") && (!aadhaarDocument || aadhaarDocument.documentType !== "aadhaar")) {
      return res.status(400).json({ message: "A valid uploaded Aadhaar document is required." });
    }

    if (requiredDocuments.includes("pan") && (!panDocument || panDocument.documentType !== "pan")) {
      return res.status(400).json({ message: "A valid uploaded PAN document is required." });
    }

    if (
      requiredDocuments.includes("income_certificate") &&
      (!incomeCertificateDocument || incomeCertificateDocument.documentType !== "income_certificate")
    ) {
      return res.status(400).json({ message: "A valid uploaded income certificate is required." });
    }

    if (
      requiredDocuments.includes("birth_certificate") &&
      (!birthCertificateDocument || birthCertificateDocument.documentType !== "birth_certificate")
    ) {
      return res.status(400).json({ message: "A valid uploaded birth certificate is required." });
    }

    const extractedIncome = incomeCertificateDocument?.extractedIncome ?? null;

    if (requiredDocuments.includes("income_certificate") && extractedIncome === null) {
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

    const identityCheck = verifyUploadedDocumentIdentity({
      applicantName: name,
      aadhaarText: aadhaarDocument.ocrText,
      panText: panDocument?.ocrText,
      incomeCertificateText: incomeCertificateDocument?.ocrText,
      birthCertificateText: birthCertificateDocument?.ocrText,
      requiredDocuments,
    });

    const resolvedAadhaarNumber = aadhaarNumber || identityCheck.aadhaarNumber;
    const resolvedPanNumber = identityCheck.panNumber;
    const verifiedDateOfBirth = identityCheck.verifiedDateOfBirth || identityCheck.aadhaarDob || "";

    const createdAt = new Date();
    const hashVersion = 3;
    const hash = generateApplicationHash(
      {
        name,
        income: extractedIncome || 0,
        address,
        schemeType,
        aadhaarNumber: resolvedAadhaarNumber,
        incomeCertificateHash: incomeCertificateDocument?.documentHash || birthCertificateDocument?.documentHash || "",
        createdAt,
      },
      hashVersion
    );
    const evaluation = evaluateEligibility({
      schemeType,
      declaredIncome: extractedIncome,
      verifiedIncome: extractedIncome,
      aadhaarNumber: resolvedAadhaarNumber,
      panNumber: resolvedPanNumber,
      incomeCertificateNumber: incomeCertificateDocument?.originalFileName || birthCertificateDocument?.originalFileName || "",
      identityVerified: identityCheck.verified,
      identityReason: identityCheck.reason,
      dateOfBirth: verifiedDateOfBirth,
      schemeRule: scheme,
    });

    const record = await ApplicationRecord.create({
      name,
      income: extractedIncome || 0,
      extractedIncome,
      address,
      schemeType,
      aadhaar: resolvedAadhaarNumber,
      aadhaarNumber: resolvedAadhaarNumber,
      aadhaarDocumentId: aadhaarDocument._id,
      panDocumentId: panDocument?._id || null,
      birthCertificateDocumentId: birthCertificateDocument?._id || null,
      incomeCertificateDocumentId: incomeCertificateDocument?._id || null,
      panNumber: resolvedPanNumber,
      incomeCertificateNumber: incomeCertificateDocument?.originalFileName || "",
      ocrText: incomeCertificateDocument?.ocrText || birthCertificateDocument?.ocrText || "",
      ocrEngine: incomeCertificateDocument?.ocrEngine || birthCertificateDocument?.ocrEngine || "",
      incomeCertificateFileName: incomeCertificateDocument?.originalFileName || "",
      incomeCertificateMimeType: incomeCertificateDocument?.mimeType || "",
      incomeCertificatePath: incomeCertificateDocument?.filePath || "",
      incomeCertificateSize: incomeCertificateDocument?.fileSize || 0,
      incomeCertificateHash: incomeCertificateDocument?.documentHash || "",
      hash,
      hashVersion,
      verifiedIncome: extractedIncome,
      mismatchDetected: evaluation.mismatchDetected,
      suspicious: evaluation.suspicious,
      createdBy: req.user.id,
      requiredDocumentIds: requestedDocumentIds,
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

    await appendLedgerEntry({
      entityType: "application_record",
      entityId: record._id,
      action: "application_created",
      actorEmail: req.user.email,
      actorId: req.user.id,
      payload: {
        schemeType,
        applicationHash: hash,
        extractedIncome,
        verifiedIncome: extractedIncome,
        decisionStatus: evaluation.decisionStatus,
        suspicious: evaluation.suspicious,
      },
      metadata: {
        requiredDocumentCount: requestedDocumentIds.length,
      },
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
      details: `Verified uploaded scheme documents for ${schemeType}`,
      ipAddress: req.ip || "unknown",
    });

    if (requiredDocuments.includes("income_certificate")) {
      await logEvent({
        action: "ocr_verification_result",
        user: req.user.email,
        userId: req.user.id,
        status: evaluation.eligible ? "success" : "warning",
        details: `OCR extracted income ${extractedIncome} from stored income certificate for ${schemeType}`,
        ipAddress: req.ip || "unknown",
      });
    }

    if (evaluation.suspicious || evaluation.mismatchDetected) {
      await notifyUser({
        userId: req.user.id,
        userEmail: req.user.email,
        type: "income_mismatch_detected",
        title: "Document Verification Issue",
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

      await appendLedgerEntry({
        entityType: "application_record",
        entityId: record._id,
        action: "tampering_detected",
        actorEmail: req.user.email,
        actorId: req.user.id,
        payload: {
          storedHash: record.hash,
          currentHash: integrity.currentHash,
          documentTampered: integrity.documentTampered,
        },
        metadata: {
          integrityStatus: integrity.integrityStatus,
        },
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

    await appendLedgerEntry({
      entityType: "application_record",
      entityId: record._id,
      action: "tamper_simulated",
      actorEmail: req.user.email,
      actorId: req.user.id,
      payload: {
        applicationHash: record.hash,
      },
      metadata: {
        changedField: "address",
      },
    });

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
