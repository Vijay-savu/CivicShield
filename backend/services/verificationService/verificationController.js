const ApplicationRecord = require("../../models/ApplicationRecord");
const GovernmentIncomeRecord = require("../../models/GovernmentIncomeRecord");
const { getApplicationIntegrity } = require("../../utils/applicationIntegrity");
const { evaluateEligibility } = require("../../utils/eligibilityEngine");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");
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

    const officialIncomeRecord = await GovernmentIncomeRecord.findOne({ aadhaar: record.aadhaar || record.aadhaarNumber });

    const evaluation = evaluateEligibility({
      schemeType: record.schemeType,
      declaredIncome: record.extractedIncome || record.income,
      verifiedIncome: officialIncomeRecord?.annualIncome ?? null,
      officialRecordFound: Boolean(officialIncomeRecord),
      aadhaarNumber: record.aadhaar || record.aadhaarNumber,
      panNumber: "OCR-VERIFIED",
      incomeCertificateNumber: record.incomeCertificateFileName || record.incomeCertificateNumber,
    });

    record.verificationResult = {
      eligible: evaluation.eligible,
      reason: evaluation.reason,
      checkedAt: new Date(),
      checkedBy: null,
    };
    record.verifiedIncome = officialIncomeRecord?.annualIncome ?? null;
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
        title: "Suspicious Income Verification Result",
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
