const classifyThreat = ({ action, status, details = "", ipAddress = "unknown" }) => {
  const normalizedAction = String(action || "").toLowerCase();
  const normalizedStatus = String(status || "").toLowerCase();
  const normalizedDetails = String(details || "").toLowerCase();

  let threatScore = 5;
  let threatLevel = "LOW";
  let anomalyType = "normal";

  if (normalizedAction === "login_attempt" && ["failed", "blocked"].includes(normalizedStatus)) {
    threatScore += normalizedStatus === "blocked" ? 65 : 35;
    anomalyType = "authentication-abuse";
  }

  if (normalizedAction.includes("tampering")) {
    threatScore += 70;
    anomalyType = "tamper-attempt";
  }

  if (normalizedAction.includes("document_upload_rejected") || normalizedAction.includes("ocr_verification_failed")) {
    threatScore += 25;
    anomalyType = "document-anomaly";
  }

  if (normalizedDetails.includes("temporarily unavailable") || normalizedDetails.includes("overload")) {
    threatScore += 50;
    anomalyType = "service-overload";
  }

  if (normalizedDetails.includes("too many attempts")) {
    threatScore += 30;
    anomalyType = "brute-force-pattern";
  }

  if (normalizedStatus === "alert") {
    threatScore += 20;
  }

  if (normalizedStatus === "blocked") {
    threatScore += 20;
  }

  if (ipAddress === "unknown") {
    threatScore += 5;
  }

  if (threatScore >= 80) {
    threatLevel = "HIGH";
  } else if (threatScore >= 40) {
    threatLevel = "MEDIUM";
  }

  return {
    threatScore,
    threatLevel,
    anomalyType,
  };
};

module.exports = {
  classifyThreat,
};
