const normalizeText = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "I")
    .trim();

const hasAny = (source, patterns) => patterns.some((pattern) => pattern.test(source));

const aadhaarNumberPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
const panNumberPattern = /\b[A-Z]{5}\d{4}[A-Z]\b/i;
const datePattern =
  /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/;
const writtenDatePattern = /\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/;

const matchesAadhaar = (text) => {
  const source = normalizeText(text);
  const hasPrimaryKeyword = hasAny(source, [
    /aadha?r/i,
    /uidai/i,
    /aadhaar no/i,
    /unique identification authority/i,
  ]);
  const hasGovernmentContext = hasAny(source, [
    /government of india/i,
    /enrolment no/i,
    /dob/i,
    /male|female/i,
  ]);
  const hasNumber = aadhaarNumberPattern.test(source);

  return hasNumber && (hasPrimaryKeyword || hasGovernmentContext);
};

const matchesPan = (text) => {
  const source = normalizeText(text).toUpperCase();
  const hasPattern = panNumberPattern.test(source);
  const hasKeyword = hasAny(source, [
    /\bPAN\b/,
    /PERMANENT ACCOUNT NUMBER/,
    /INCOME TAX/,
    /GOVT\.? OF INDIA/,
  ]);

  return hasPattern && (hasKeyword || source.length > 20);
};

const matchesBirthCertificate = (text) => {
  const source = normalizeText(text);
  const hasCertificateKeyword = hasAny(source, [
    /birth certificate/i,
    /certificate of birth/i,
    /date of birth/i,
    /\bdob\b/i,
    /place of birth/i,
    /registrar/i,
  ]);
  const hasDateInfo = datePattern.test(source) || writtenDatePattern.test(source);

  return hasCertificateKeyword && hasDateInfo;
};

const matchesDrivingLicence = (text) => {
  const source = normalizeText(text).toUpperCase();
  const hasKeyword = hasAny(source, [
    /DRIVING LICEN[SC]E/,
    /LICENCE NO/,
    /DL NO/,
    /TRANSPORT/,
    /MOTOR/,
  ]);
  const hasPattern = hasAny(source, [
    /\b[A-Z]{2}[- ]?\d{2}[- ]?\d{4,13}\b/,
    /\b[A-Z]{2}\d{2}\s\d{11}\b/,
    /\bDL[- ]?\d{2,}\b/,
  ]);

  return hasKeyword && hasPattern;
};

const matchesIncomeCertificate = (text, extractedIncome) => {
  const source = normalizeText(text);
  const hasKeyword = hasAny(source, [
    /income certificate/i,
    /annual income/i,
    /\bincome\b/i,
    /revenue department/i,
    /issued by/i,
  ]);

  return hasKeyword && Number(extractedIncome) > 0;
};

const validators = {
  aadhaar: {
    isValid: ({ text }) => matchesAadhaar(text),
    reason: "Aadhaar text or 12-digit Aadhaar number was not detected.",
  },
  pan: {
    isValid: ({ text }) => matchesPan(text),
    reason: "PAN keyword or PAN format was not detected.",
  },
  birth_certificate: {
    isValid: ({ text }) => matchesBirthCertificate(text),
    reason: "Birth certificate or DOB details were not detected.",
  },
  driving_licence: {
    isValid: ({ text }) => matchesDrivingLicence(text),
    reason: "Driving licence keyword or licence number pattern was not detected.",
  },
  income_certificate: {
    isValid: ({ text, extractedIncome }) => matchesIncomeCertificate(text, extractedIncome),
    reason: "Income certificate text or extractable income value was not detected.",
  },
};

const validateDocumentContent = ({ documentType, text, extractedIncome }) => {
  const validator = validators[documentType];

  if (!validator) {
    return {
      valid: false,
      reason: "Unsupported document type.",
    };
  }

  if (!normalizeText(text)) {
    return {
      valid: false,
      reason: "No readable text could be extracted from the uploaded document.",
    };
  }

  return {
    valid: validator.isValid({ text, extractedIncome }),
    reason: validator.reason,
  };
};

module.exports = {
  validateDocumentContent,
};
