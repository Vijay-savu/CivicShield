export const documentTypeConfig = {
  aadhaar: {
    label: "Aadhaar Card",
    shortLabel: "Aadhaar",
    description: "Government of India or UIDAI with a valid 12-digit number.",
  },
  pan: {
    label: "PAN Card",
    shortLabel: "PAN",
    description: "PAN or Income Tax wording with a valid PAN format.",
  },
  birth_certificate: {
    label: "Birth Certificate",
    shortLabel: "Birth Certificate",
    description: "Birth certificate wording with date of birth details.",
  },
  driving_licence: {
    label: "Driving Licence",
    shortLabel: "Driving Licence",
    description: "Driving licence wording with a valid licence number.",
  },
  income_certificate: {
    label: "Income Certificate",
    shortLabel: "Income Certificate",
    description: "Annual income text with a readable income amount.",
  },
};

export const requiredCitizenDocuments = [
  "aadhaar",
  "pan",
  "birth_certificate",
  "driving_licence",
  "income_certificate",
];

export const schemeConfig = {
  "Subsidy Support": {
    heading: "Subsidy Support",
    description: "Support for verified low-income applicants.",
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    eligibilityHint: "Eligible when verified annual income is Rs. 2,50,000 or below.",
  },
  "Education Loan": {
    heading: "Education Loan",
    description: "Education-loan support for applicants below the configured income threshold.",
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    eligibilityHint: "Eligible when verified annual income is below Rs. 5,00,000.",
  },
  "Housing Assistance": {
    heading: "Housing Assistance",
    description: "Housing support for verified applicants with moderate income.",
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    eligibilityHint: "Eligible when verified annual income is Rs. 3,00,000 or below.",
  },
  "Farmer Support": {
    heading: "Farmer Support",
    description: "Income-based support for eligible rural and agricultural households.",
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    eligibilityHint: "Eligible when verified annual income is Rs. 3,50,000 or below.",
  },
  "Health Care Aid": {
    heading: "Health Care Aid",
    description: "Financial support for verified families seeking medical assistance.",
    requiredDocuments: ["aadhaar", "pan", "income_certificate"],
    eligibilityHint: "Eligible when verified annual income is Rs. 4,00,000 or below.",
  },
  "Senior Pension": {
    heading: "Senior Pension",
    description: "Pension support for senior applicants using Aadhaar and birth-certificate age verification.",
    requiredDocuments: ["aadhaar", "birth_certificate"],
    eligibilityHint: "Eligible when verified age is 60 years or above.",
  },
};
