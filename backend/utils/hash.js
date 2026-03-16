const crypto = require("crypto");

const buildApplicationPayloadV1 = ({ name, income, address, schemeType, createdAt }) => {
  return JSON.stringify({
    name: String(name).trim(),
    income: Number(income),
    address: String(address).trim(),
    schemeType: String(schemeType).trim(),
    createdAt: new Date(createdAt).toISOString(),
  });
};

const buildApplicationPayloadV2 = ({
  name,
  income,
  address,
  schemeType,
  aadhaarNumber,
  panNumber,
  incomeCertificateNumber,
  createdAt,
}) => {
  return JSON.stringify({
    name: String(name).trim(),
    income: Number(income),
    address: String(address).trim(),
    schemeType: String(schemeType).trim(),
    aadhaarNumber: String(aadhaarNumber ?? "").trim(),
    panNumber: String(panNumber ?? "").trim().toUpperCase(),
    incomeCertificateNumber: String(incomeCertificateNumber ?? "").trim(),
    createdAt: new Date(createdAt).toISOString(),
  });
};

const buildApplicationPayloadV3 = ({
  name,
  income,
  address,
  schemeType,
  aadhaarNumber,
  incomeCertificateHash,
  createdAt,
}) => {
  return JSON.stringify({
    name: String(name).trim(),
    income: Number(income),
    address: String(address).trim(),
    schemeType: String(schemeType).trim(),
    aadhaarNumber: String(aadhaarNumber ?? "").trim(),
    incomeCertificateHash: String(incomeCertificateHash ?? "").trim(),
    createdAt: new Date(createdAt).toISOString(),
  });
};

// SHA-256 hashing makes application tampering visible during verification.
const generateApplicationHash = (applicationData, version = 3) => {
  const payload =
    version === 1
      ? buildApplicationPayloadV1(applicationData)
      : version === 2
        ? buildApplicationPayloadV2(applicationData)
        : buildApplicationPayloadV3(applicationData);

  return crypto.createHash("sha256").update(payload).digest("hex");
};

module.exports = {
  generateApplicationHash,
};
