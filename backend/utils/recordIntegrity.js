const { generateRecordHash } = require("./hashRecord");

const getRecordIntegrity = (record) => {
  const currentHash = generateRecordHash({
    name: record.name,
    dob: record.dob,
    address: record.address,
    certificateId: record.certificateId,
    createdAt: record.createdAt,
  });

  const isTampered = currentHash !== record.hash;

  return {
    currentHash,
    isTampered,
    integrityStatus: isTampered ? "TAMPERING DETECTED" : "VERIFIED",
  };
};

module.exports = {
  getRecordIntegrity,
};
