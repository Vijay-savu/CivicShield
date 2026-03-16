const crypto = require("crypto");
const fs = require("fs/promises");

const hashDocumentBuffer = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const hashDocumentFromPath = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return hashDocumentBuffer(buffer);
};

module.exports = {
  hashDocumentBuffer,
  hashDocumentFromPath,
};
