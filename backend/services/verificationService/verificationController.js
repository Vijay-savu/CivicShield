const ApplicationRecord = require("../../models/ApplicationRecord");
const { DocumentRecord } = require("../../models/DocumentRecord");
const { getApplicationIntegrity } = require("../../utils/applicationIntegrity");
const { evaluateEligibility, getRequiredDocumentsForScheme } = require("../../utils/eligibilityEngine");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");
const { verifyUploadedDocumentIdentity } = require("../../utils/documentIdentity");
const circuitBreaker = require("./circuitBreaker");

const checkEligibility = async (req, res, next) => {
  try {
    const { recordId, simulateOverload } = req.validatedBody;

    if (simulateOverload) {
      circuitBreaker.trip();
    } else {
      circuitBreaker.recordLoad();
    }

    if (circuitBreaker.isOpen()) {
      return res.status(503).json({ message: "Service temporarily unavailable" });
    }

    const record = await ApplicationRecord.findOne({ _id: recordId, createdBy: req.user.id });

    if (!record) {
      return res.status(404).json({ message: "Application not found." });
    }

    const integrity = await getApplicationIntegrity(record);

    if (integrity.isTampered) {
      await logEvent({
        action: "tampering_detected",
        user: req.user.email,
        userId: req.user.id,
        status: "alert",
        details: `Eligibility blocked because application ${record._id} was tampered`,
        ipAddress: req.ip || "unknown",
      });

      return res.status(200).json({
        message: "Tampering Detected",
        eligible: false,
        reason: integrity.documentTampered
          ? "Uploaded document integrity verification failed"
          : "Integrity verification failed",
        integrityStatus: "TAMPERING DETECTED",
      });
    }

    const requiredDocuments = getRequiredDocumentsForScheme(record.schemeType);
    const documents = await DocumentRecord.find({
      _id: {
        $in: [
          record.aadhaarDocumentId,
          record.panDocumentId,
          record.incomeCertificateDocumentId,
          record.birthCertificateDocumentId,
        ].filter(Boolean),
      },
      userId: req.user.id,
    });
    const documentMap = new Map(documents.map((document) => [document._id.toString(), document]));
    const aadhaarDocument = documentMap.get(String(record.aadhaarDocumentId || ""));
    const panDocument = documentMap.get(String(record.panDocumentId || ""));
    const incomeCertificateDocument = documentMap.get(String(record.incomeCertificateDocumentId || ""));
    const birthCertificateDocument = documentMap.get(String(record.birthCertificateDocumentId || ""));

    const identityCheck = verifyUploadedDocumentIdentity({
      applicantName: record.name,
      aadhaarText: aadhaarDocument?.ocrText,
      panText: panDocument?.ocrText,
      incomeCertificateText: incomeCertificateDocument?.ocrText,
      birthCertificateText: birthCertificateDocument?.ocrText,
      requiredDocuments,
    });

    const evaluation = evaluateEligibility({
      schemeType: record.schemeType,
      declaredIncome: record.extractedIncome ?? record.income,
      verifiedIncome: record.extractedIncome ?? record.income,
      aadhaarNumber: identityCheck.aadhaarNumber || record.aadhaar || record.aadhaarNumber,
      panNumber: identityCheck.panNumber || record.panNumber,
      incomeCertificateNumber: record.incomeCertificateFileName || record.incomeCertificateNumber,
      identityVerified: identityCheck.verified,
      identityReason: identityCheck.reason,
      dateOfBirth: identityCheck.verifiedDateOfBirth || identityCheck.aadhaarDob || "",
    });

    record.verificationResult = {
      eligible: evaluation.eligible,
      reason: evaluation.reason,
      checkedAt: new Date(),
      checkedBy: null,
    };
    record.verifiedIncome = record.extractedIncome ?? record.income;
    record.mismatchDetected = evaluation.mismatchDetected;
    record.suspicious = evaluation.suspicious;
    record.documentStatus = evaluation.documentStatus;
    record.decision = {
      status: evaluation.decisionStatus,
      reason: evaluation.reason,
      decidedAt: new Date(),
      decidedBy: null,
    };
    await record.save();

    await logEvent({
      action: "verification_checked",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Automatic eligibility check refreshed for application ${record._id}`,
      ipAddress: req.ip || "unknown",
    });

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

    return res.status(200).json({
      eligible: evaluation.eligible,
      reason: evaluation.reason,
      suspicious: evaluation.suspicious,
      integrityStatus: "VERIFIED",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  checkEligibility,
};
