const fs = require("fs");
const { generateApplicationHash } = require("./hash");
const { hashDocumentFromPath } = require("./hashDocument");

const getApplicationIntegrity = async (record) => {
  const hashVersion = record.hashVersion || 1;
  const currentHash = generateApplicationHash({
    name: record.name,
    income: record.income,
    address: record.address,
    schemeType: record.schemeType,
    aadhaarNumber: record.aadhaarNumber,
    panNumber: record.panNumber,
    incomeCertificateNumber: record.incomeCertificateNumber,
    incomeCertificateHash: record.incomeCertificateHash,
    createdAt: record.createdAt,
  }, hashVersion);

  let currentDocumentHash = record.incomeCertificateHash;

  if (record.incomeCertificatePath && fs.existsSync(record.incomeCertificatePath)) {
    currentDocumentHash = await hashDocumentFromPath(record.incomeCertificatePath);
  } else if (record.incomeCertificatePath) {
    currentDocumentHash = null;
  }

  const applicationTampered = currentHash !== record.hash;
  const documentTampered = record.incomeCertificateHash && currentDocumentHash !== record.incomeCertificateHash;
  const isTampered = applicationTampered || documentTampered;

  return {
    currentHash,
    currentDocumentHash,
    documentTampered,
    applicationTampered,
    isTampered,
    integrityStatus: isTampered ? "TAMPERING DETECTED" : "VERIFIED",
  };
};

module.exports = {
  getApplicationIntegrity,
};
