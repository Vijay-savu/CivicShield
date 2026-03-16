const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractDateOfBirth = (text) => {
  const source = String(text || "");
  const match = source.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);

  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  const normalizedYear = year.length === 2 ? `20${year}` : year;
  return `${normalizedYear.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const extractAadhaarNumber = (text) => {
  const normalized = String(text ?? "").replace(/\D/g, "");
  const match = normalized.match(/\d{12}/);
  return match ? match[0] : "";
};

const extractPanNumber = (text) => {
  const source = String(text || "").toUpperCase();
  const match = source.match(/\b[A-Z]{5}\d{4}[A-Z]\b/);
  return match ? match[0] : "";
};

const textContainsName = (text, name) => {
  const normalizedText = normalizeName(text);
  const normalizedName = normalizeName(name);

  if (!normalizedText || !normalizedName) {
    return false;
  }

  const tokens = normalizedName.split(" ").filter((token) => token.length > 2);

  if (!tokens.length) {
    return false;
  }

  const matchedTokens = tokens.filter((token) => normalizedText.includes(token));
  const nearMatchedTokens = tokens.filter((token) =>
    normalizedText
      .split(" ")
      .some((textToken) => textToken.startsWith(token.slice(0, Math.max(3, token.length - 2))))
  );

  return (
    matchedTokens.length >= Math.max(2, Math.ceil(tokens.length * 0.6)) ||
    matchedTokens.length === tokens.length ||
    nearMatchedTokens.length >= Math.max(2, Math.ceil(tokens.length * 0.6))
  );
};

const incomeCertificateMatchesAadhaar = (incomeText, aadhaarNumber) => {
  const source = String(incomeText || "").replace(/\s+/g, "");
  const lastFour = String(aadhaarNumber || "").slice(-4);

  if (!lastFour) {
    return false;
  }

  return source.includes(lastFour) || source.includes(`XXXX-XXXX-${lastFour}`);
};

const verifyUploadedDocumentIdentity = ({
  applicantName,
  aadhaarText,
  panText,
  incomeCertificateText,
  birthCertificateText,
  requiredDocuments = ["aadhaar", "pan", "income_certificate"],
}) => {
  const required = new Set(requiredDocuments);
  const aadhaarNumber = extractAadhaarNumber(aadhaarText);
  const panNumber = extractPanNumber(panText);
  const aadhaarNameMatched = textContainsName(aadhaarText, applicantName);
  const panNameMatched = textContainsName(panText, applicantName);
  const incomeNameMatched = textContainsName(incomeCertificateText, applicantName);
  const birthNameMatched = textContainsName(birthCertificateText, applicantName);
  const incomeAadhaarLinked = incomeCertificateMatchesAadhaar(incomeCertificateText, aadhaarNumber);
  const aadhaarDob = extractDateOfBirth(aadhaarText);
  const birthDob = extractDateOfBirth(birthCertificateText);
  const birthDobLinked = Boolean(aadhaarDob && birthDob && aadhaarDob === birthDob);

  if (required.has("aadhaar") && !aadhaarNumber) {
    return {
      verified: false,
      reason: "Aadhaar number could not be read from the uploaded Aadhaar card.",
      aadhaarNumber: "",
      panNumber: "",
      aadhaarDob: "",
      verifiedDateOfBirth: "",
    };
  }

  if (required.has("pan") && !panNumber) {
    return {
      verified: false,
      reason: "PAN number could not be read from the uploaded PAN card.",
      aadhaarNumber,
      panNumber: "",
      aadhaarDob,
      verifiedDateOfBirth: "",
    };
  }

  if (required.has("birth_certificate") && !birthCertificateText) {
    return {
      verified: false,
      reason: "Birth certificate details are required for this scheme.",
      aadhaarNumber,
      panNumber,
      aadhaarDob,
      verifiedDateOfBirth: "",
    };
  }

  const matchedSources = [aadhaarNameMatched, panNameMatched, incomeNameMatched, birthNameMatched].filter(Boolean).length;
  const strongIdentityLink = panNameMatched && (incomeNameMatched || incomeAadhaarLinked);
  const documentPairMatch = matchedSources >= 2;
  const fallbackIdentityLink = matchedSources >= 1 && (incomeAadhaarLinked || birthDobLinked);

  if (required.has("income_certificate") && !incomeNameMatched && !incomeAadhaarLinked) {
    return {
      verified: false,
      reason: "Income certificate could not be linked to the uploaded Aadhaar and applicant details.",
      aadhaarNumber,
      panNumber,
      aadhaarDob,
      verifiedDateOfBirth: birthDob || aadhaarDob,
    };
  }

  if (required.has("birth_certificate") && !birthNameMatched && !birthDobLinked) {
    return {
      verified: false,
      reason: "Birth certificate could not be matched with the uploaded Aadhaar and applicant details.",
      aadhaarNumber,
      panNumber,
      aadhaarDob,
      verifiedDateOfBirth: birthDob || aadhaarDob,
    };
  }

  if (!strongIdentityLink && !documentPairMatch && !fallbackIdentityLink) {
    const failureReason = !aadhaarNameMatched &&
      ((!required.has("pan") || panNameMatched) && (!required.has("income_certificate") || incomeNameMatched))
      ? "Aadhaar number was read, but the Aadhaar name OCR did not match clearly."
      : required.has("pan") && !panNameMatched
        ? "Applicant name does not match the uploaded PAN document."
        : required.has("birth_certificate") && !birthNameMatched
          ? "Applicant name does not match the uploaded birth certificate."
          : "Uploaded documents could not be linked strongly enough to the same citizen.";

    return {
      verified: false,
      reason: failureReason,
      aadhaarNumber,
      panNumber,
      aadhaarDob,
      verifiedDateOfBirth: birthDob || aadhaarDob,
    };
  }

  return {
    verified: true,
    reason:
      required.has("birth_certificate")
        ? "Uploaded Aadhaar and birth certificate were linked to the same citizen for age verification."
        : strongIdentityLink || documentPairMatch
          ? "Uploaded Aadhaar, PAN, and income certificate were linked to the same citizen."
          : "Uploaded documents were accepted using Aadhaar-number linkage and supporting name evidence.",
    aadhaarNumber,
    panNumber,
    aadhaarDob,
    verifiedDateOfBirth: birthDob || aadhaarDob,
  };
};

module.exports = {
  extractAadhaarNumber,
  extractPanNumber,
  extractDateOfBirth,
  verifyUploadedDocumentIdentity,
};
