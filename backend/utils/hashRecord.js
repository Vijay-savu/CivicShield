const crypto = require("crypto");

const normalizeDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  return date.toISOString();
};

const buildRecordPayload = ({ name, dob, address, certificateId, createdAt }) => {
  return JSON.stringify({
    name: String(name).trim(),
    dob: normalizeDate(dob),
    address: String(address).trim(),
    certificateId: String(certificateId).trim(),
    createdAt: normalizeDate(createdAt),
  });
};

// SHA-256 makes unauthorized record edits easy to detect.
const generateRecordHash = (recordData) => {
  return crypto.createHash("sha256").update(buildRecordPayload(recordData)).digest("hex");
};

module.exports = {
  generateRecordHash,
};
