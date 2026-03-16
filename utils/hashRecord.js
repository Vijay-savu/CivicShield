const crypto = require("crypto");

const normalizeDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  return date.toISOString();
};

const buildRecordPayload = ({ name, dob, address, certificateId, createdAt }) => {
  const normalizedDob = normalizeDate(dob);
  const normalizedCreatedAt = normalizeDate(createdAt);

  return JSON.stringify({
    name: name.trim(),
    dob: normalizedDob,
    address: address.trim(),
    certificateId: certificateId.trim(),
    createdAt: normalizedCreatedAt,
  });
};

const generateRecordHash = (recordData) => {
  return crypto.createHash("sha256").update(buildRecordPayload(recordData)).digest("hex");
};

module.exports = {
  generateRecordHash,
};
