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
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    inclusive: true,
    approvalReason: "Verified income is within Rs. 2,50,000. The citizen is eligible for the subsidy scheme.",
    rejectionReason: "Income exceeds the Rs. 2,50,000 subsidy limit.",
  },
  "Education Loan": {
    threshold: EDUCATION_LOAN_THRESHOLD,
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    inclusive: false,
    approvalReason:
      "Verified income is below Rs. 5,00,000. Eligible to apply for an education loan up to Rs. 6,00,000.",
    rejectionReason:
      "Verified income is not below Rs. 5,00,000, so the education loan benefit is not available.",
  },
  "Housing Assistance": {
    threshold: HOUSING_ASSISTANCE_THRESHOLD,
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    inclusive: true,
    approvalReason: "Verified income is within Rs. 3,00,000. Eligible for housing assistance.",
    rejectionReason: "Income exceeds the Rs. 3,00,000 limit for housing assistance.",
  },
  "Farmer Support": {
    threshold: FARMER_SUPPORT_THRESHOLD,
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    inclusive: true,
    approvalReason: "Verified income is within Rs. 3,50,000. Eligible for farmer support benefits.",
    rejectionReason: "Income exceeds the Rs. 3,50,000 limit for farmer support.",
  },
  "Health Care Aid": {
    threshold: HEALTH_CARE_AID_THRESHOLD,
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    inclusive: true,
    approvalReason: "Verified income is within Rs. 4,00,000. Eligible for health care aid.",
    rejectionReason: "Income exceeds the Rs. 4,00,000 limit for health care aid.",
  },
  "Senior Pension": {
    threshold: SENIOR_PENSION_THRESHOLD,
    requiredDocuments: ["aadhaar", "birth_certificate"],
    approvalReason: "Date of birth confirms the citizen is 60 or older and eligible for senior pension.",
    rejectionReason: "Citizen is below the senior pension age requirement of 60 years.",
  },
};

const getRequiredDocumentsForScheme = (schemeType, schemeRule = null) =>
  schemeRule?.requiredDocuments || schemeRules[schemeType]?.requiredDocuments || [];

const calculateAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};

const validateDocuments = ({
  schemeType,
  aadhaarNumber,
  panNumber,
  incomeCertificateNumber,
  identityVerified = true,
  identityReason = "",
}) => {
  const requiredDocuments = getRequiredDocumentsForScheme(schemeType);
  const normalizedAadhaar = String(aadhaarNumber ?? "").trim();
  const normalizedPan = String(panNumber ?? "").trim().toUpperCase();
  const normalizedIncomeCertificate = String(incomeCertificateNumber ?? "").trim();

  if (!identityVerified) {
    return {
      verified: false,
      reason: identityReason || "Uploaded documents could not be linked to the same citizen.",
    };
  }

  if (requiredDocuments.includes("aadhaar") && !/^\d{12}$/.test(normalizedAadhaar)) {
    return {
      verified: false,
      reason: "Aadhaar number must contain exactly 12 digits.",
    };
  }

  if (requiredDocuments.includes("pan") && normalizedPan === "OCR-VERIFIED") {
    return {
      verified: Boolean(normalizedIncomeCertificate),
      reason: normalizedIncomeCertificate
        ? "Uploaded income certificate passed OCR document checks."
        : "Uploaded income certificate details are missing.",
    };
  }

  if (requiredDocuments.includes("pan") && !/^[A-Z]{5}\d{4}[A-Z]$/.test(normalizedPan)) {
    return {
      verified: false,
      reason: "PAN number format is invalid.",
    };
  }

  if (requiredDocuments.includes("income_certificate") && !normalizedIncomeCertificate) {
    return {
      verified: false,
      reason: "Income certificate details are missing.",
    };
  }

  if (
    requiredDocuments.includes("income_certificate") &&
    normalizedIncomeCertificate &&
    !/^[A-Z0-9-_.\s]{6,}$/i.test(normalizedIncomeCertificate)
  ) {
    return {
      verified: false,
      reason: "Income certificate number format is invalid.",
    };
  }

  return {
    verified: true,
    reason: "Uploaded scheme documents passed identity and format checks.",
  };
};

const evaluateEligibility = ({
  schemeType,
  declaredIncome,
  verifiedIncome,
  aadhaarNumber,
  panNumber,
  incomeCertificateNumber,
  identityVerified = true,
  identityReason = "",
  dateOfBirth = "",
  schemeRule = null,
}) => {
  const documentStatus = validateDocuments({
    schemeType,
    aadhaarNumber,
    panNumber,
    incomeCertificateNumber,
    identityVerified,
    identityReason,
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

  if (verifiedIncome === null || verifiedIncome === undefined) {
    return {
      eligible: false,
      mismatchDetected: false,
      suspicious: true,
      reason: "Income could not be verified from the uploaded certificate.",
      decisionStatus: "rejected",
      documentStatus,
    };
  }

  const rule = schemeRule || schemeRules[schemeType];

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

  if (schemeType === "Senior Pension") {
    const age = calculateAgeFromDob(dateOfBirth);

    if (age === null) {
      return {
        eligible: false,
        mismatchDetected: false,
        suspicious: true,
        reason: "Date of birth could not be verified from the uploaded Aadhaar and birth certificate.",
        decisionStatus: "rejected",
        documentStatus,
      };
    }

    const eligible = age >= 60;

    return {
      eligible,
      mismatchDetected: false,
      suspicious: false,
      reason: eligible ? rule.approvalReason : `${rule.rejectionReason} Verified age: ${age}.`,
      decisionStatus: eligible ? "approved" : "rejected",
      documentStatus,
    };
  }

  const eligible = rule.inclusive
    ? Number(verifiedIncome) <= rule.threshold
    : Number(verifiedIncome) < rule.threshold;

  return {
    eligible,
    mismatchDetected: false,
    suspicious: false,
    reason: eligible
      ? `${rule.approvalReason} Uploaded documents were verified for the same citizen.`
      : `${rule.rejectionReason} Uploaded documents were verified for the same citizen.`,
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
  getRequiredDocumentsForScheme,
  calculateAgeFromDob,
  evaluateEligibility,
};
