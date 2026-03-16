export const serviceModules = [
  {
    title: "Identity Verification",
    description: "View verified Aadhaar and PAN details protected inside CivicShield.",
    to: "/identity-services",
    accent: "bg-blue-50 text-blue-700",
    category: "Identity",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 10h4M8 14h8M16.5 10.5h.01" />
      </svg>
    ),
  },
  {
    title: "DOB Records",
    description: "Open date of birth and birth-certificate verification services separately.",
    to: "/dob-services",
    accent: "bg-blue-50 text-blue-700",
    category: "Vital Records",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 9.5h16M8 13h3v3H8z" />
      </svg>
    ),
  },
  {
    title: "Income Verification",
    description: "Check trusted income, OCR extraction status, and mismatch alerts.",
    to: "/income-services",
    accent: "bg-blue-50 text-blue-700",
    category: "Verification",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18M7.5 7.5h6a2.5 2.5 0 1 1 0 5h-3a2.5 2.5 0 1 0 0 5h6" />
      </svg>
    ),
  },
  {
    title: "Tax Services",
    description: "Open PAN-linked tax service information without mixing it with other records.",
    to: "/tax-services",
    accent: "bg-blue-50 text-blue-700",
    category: "Tax",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5.5h14M7 5.5v13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 18.5v-13" />
        <path d="M9 10h6M9 13.5h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: "Subsidy Services",
    description: "Apply for subsidy and education-loan schemes through a dedicated service page.",
    to: "/subsidy-services",
    accent: "bg-blue-50 text-blue-700",
    category: "Benefits",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4.5 4.5 8.25 12 12l7.5-3.75L12 4.5Z" />
        <path d="M4.5 12 12 15.75 19.5 12M4.5 15.75 12 19.5l7.5-3.75" />
      </svg>
    ),
  },
  {
    title: "Security Alerts",
    description: "Review privacy and tampering alerts sent directly to the citizen.",
    to: "/security-alerts",
    accent: "bg-blue-50 text-blue-700",
    category: "Security",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 4.5-2.5 7.8-7 10-4.5-2.2-7-5.5-7-10V6l7-3Z" />
        <path d="M12 8.5v4.5M12 16.5h.01" />
      </svg>
    ),
  },
];

export const verifiedCitizenSnapshot = {
  aadhaar: "1234 5678 9012",
  pan: "ABCDE1234F",
  dob: "11 August 2003",
  taxAccount: "Active",
  citizenId: "CS-IND-2026-001",
  issuingAuthority: "National Citizen Services Registry",
  lastVerified: "16 March 2026",
};

export const schemeCatalog = [
  {
    name: "Subsidy Support",
    summary: "Available when verified annual income is Rs. 3,00,000 or below.",
  },
  {
    name: "Education Loan",
    summary: "Available when verified annual income is below Rs. 5,00,000.",
  },
];
