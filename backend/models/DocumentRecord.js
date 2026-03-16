const mongoose = require("mongoose");

const documentTypes = [
  "aadhaar",
  "pan",
  "birth_certificate",
  "driving_licence",
  "income_certificate",
];

const documentRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: documentTypes,
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storedFileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    documentHash: {
      type: String,
      required: true,
      trim: true,
    },
    ocrText: {
      type: String,
      default: "",
    },
    ocrEngine: {
      type: String,
      default: "",
    },
    extractedIncome: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true, collection: "citizen_documents" }
);

module.exports = {
  DocumentRecord: mongoose.model("DocumentRecord", documentRecordSchema),
  DOCUMENT_TYPES: documentTypes,
};
