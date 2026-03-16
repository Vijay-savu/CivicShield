const fs = require("fs");
const path = require("path");
const multer = require("multer");

const baseUploadDirectory = path.join(__dirname, "..", "uploads");
const documentUploadDirectory = path.join(baseUploadDirectory, "documents");
const incomeUploadDirectory = path.join(baseUploadDirectory, "income-certificates");

fs.mkdirSync(documentUploadDirectory, { recursive: true });
fs.mkdirSync(incomeUploadDirectory, { recursive: true });

const buildStorage = (destinationDirectory) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDirectory);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname) || "";
      const safeBaseName = path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 60);

      cb(null, `${Date.now()}-${safeBaseName}${extension}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }

  return cb(new Error("Only PDF and image document uploads are allowed."));
};

const buildSingleUploader = (storage, fieldName) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 8 * 1024 * 1024,
    },
  }).single(fieldName);

const uploadIncomeCertificate = multer({
  storage: buildStorage(incomeUploadDirectory),
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
}).single("incomeCertificate");

const uploadGovernmentDocument = buildSingleUploader(buildStorage(documentUploadDirectory), "documentFile");

module.exports = {
  uploadIncomeCertificate,
  uploadGovernmentDocument,
};
