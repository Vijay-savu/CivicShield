const SUBSIDY_THRESHOLD = 250000;
const EDUCATION_LOAN_THRESHOLD = 500000;
const HOUSING_ASSISTANCE_THRESHOLD = 300000;
const FARMER_SUPPORT_THRESHOLD = 350000;
const HEALTH_CARE_AID_THRESHOLD = 400000;
const SENIOR_PENSION_THRESHOLD = 200000;

const SUPPORTED_SCHEMES = [
  "Subsidy Support",
  "Education Loan",
  "Housing Assistance",
  "Farmer Support",
  "Health Care Aid",
  "Senior Pension",
];

const schemeRules = {
  "Subsidy Support": {
    threshold: SUBSIDY_THRESHOLD,
    approvalReason: "Verified income is within Rs. 2,50,000. The citizen is eligible for the subsidy scheme.",
    rejectionReason: "Income exceeds the Rs. 2,50,000 subsidy limit.",
  },
  "Education Loan": {
    threshold: EDUCATION_LOAN_THRESHOLD,
    approvalReason:
      "Verified income is below Rs. 5,00,000. Eligible to apply for an education loan up to Rs. 6,00,000.",
    rejectionReason:
      "Verified income is not below Rs. 5,00,000, so the education loan benefit is not available.",
  },
  "Housing Assistance": {
    threshold: HOUSING_ASSISTANCE_THRESHOLD,
    approvalReason: "Verified income is within Rs. 3,00,000. Eligible for housing assistance.",
    rejectionReason: "Income exceeds the Rs. 3,00,000 limit for housing assistance.",
  },
  "Farmer Support": {
    threshold: FARMER_SUPPORT_THRESHOLD,
    approvalReason: "Verified income is within Rs. 3,50,000. Eligible for farmer support benefits.",
    rejectionReason: "Income exceeds the Rs. 3,50,000 limit for farmer support.",
  },
  "Health Care Aid": {
    threshold: HEALTH_CARE_AID_THRESHOLD,
    approvalReason: "Verified income is within Rs. 4,00,000. Eligible for health care aid.",
    rejectionReason: "Income exceeds the Rs. 4,00,000 limit for health care aid.",
  },
  "Senior Pension": {
    threshold: SENIOR_PENSION_THRESHOLD,
    approvalReason: "Senior pension uses age-based verification through citizen records and date-of-birth proof.",
    rejectionReason: "Senior pension requires age-based verification through citizen records and date-of-birth proof.",
  },
};

const validateDocuments = ({ aadhaarNumber, panNumber, incomeCertificateNumber }) => {
  const normalizedAadhaar = String(aadhaarNumber ?? "").trim();
  const normalizedPan = String(panNumber ?? "").trim().toUpperCase();
  const normalizedIncomeCertificate = String(incomeCertificateNumber ?? "").trim();

  if (!/^\d{12}$/.test(normalizedAadhaar)) {
    return {
      verified: false,
      reason: "Aadhaar number must contain exactly 12 digits.",
    };
  }

  if (normalizedPan === "OCR-VERIFIED") {
    return {
      verified: Boolean(normalizedIncomeCertificate),
      reason: normalizedIncomeCertificate
        ? "Uploaded income certificate passed OCR document checks."
        : "Uploaded income certificate details are missing.",
    };
  }

  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(normalizedPan)) {
    return {
      verified: false,
      reason: "PAN number format is invalid.",
    };
  }

  if (!/^[A-Z0-9-]{6,}$/i.test(normalizedIncomeCertificate)) {
    return {
      verified: false,
      reason: "Income certificate number format is invalid.",
    };
  }

  return {
    verified: true,
    reason: "Aadhaar, PAN, and income certificate details passed format checks.",
  };
};

const evaluateEligibility = ({
  schemeType,
  declaredIncome,
  verifiedIncome,
  officialRecordFound = true,
  aadhaarNumber,
  panNumber,
  incomeCertificateNumber,
}) => {
  const documentStatus = validateDocuments({
    aadhaarNumber,
    panNumber,
    incomeCertificateNumber,
  });

  if (!documentStatus.verified) {
    return {
      eligible: false,
      mismatchDetected: false,
      suspicious: true,
      reason: documentStatus.reason,
      decisionStatus: "rejected",
      documentStatus,
    };
  }

  if (!officialRecordFound || verifiedIncome === null || verifiedIncome === undefined) {
    return {
      eligible: false,
      mismatchDetected: false,
      suspicious: true,
      reason: "No trusted government income record was found for the submitted Aadhaar.",
      decisionStatus: "rejected",
      documentStatus,
    };
  }

  if (Number(declaredIncome) !== Number(verifiedIncome)) {
    return {
      eligible: false,
      mismatchDetected: true,
      suspicious: true,
      reason: `OCR-extracted income does not match the verified government income record of Rs. ${Number(
        verifiedIncome
      ).toLocaleString()}.`,
      decisionStatus: "rejected",
      documentStatus,
    };
  }

  const rule = schemeRules[schemeType];

  if (!rule) {
    return {
      eligible: false,
      mismatchDetected: false,
      suspicious: false,
      reason: "This scheme is not configured for automatic verification.",
      decisionStatus: "rejected",
      documentStatus,
    };
  }

  const eligible = Number(verifiedIncome) < rule.threshold;

  return {
    eligible,
    mismatchDetected: false,
    suspicious: false,
    reason: eligible ? rule.approvalReason : rule.rejectionReason,
    decisionStatus: eligible ? "approved" : "rejected",
    documentStatus,
  };
};

module.exports = {
  SUBSIDY_THRESHOLD,
  EDUCATION_LOAN_THRESHOLD,
  HOUSING_ASSISTANCE_THRESHOLD,
  FARMER_SUPPORT_THRESHOLD,
  HEALTH_CARE_AID_THRESHOLD,
  SENIOR_PENSION_THRESHOLD,
  SUPPORTED_SCHEMES,
  evaluateEligibility,
};
