const mongoose = require("mongoose");

const verificationResultSchema = new mongoose.Schema(
  {
    eligible: Boolean,
    reason: String,
    checkedAt: Date,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const documentStatusSchema = new mongoose.Schema(
  {
    verified: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      default: "",
    },
    decidedAt: {
      type: Date,
      default: null,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

// Citizen applications carry an integrity hash so any silent edits can be detected.
const applicationRecordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    income: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    schemeType: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaar: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    aadhaarDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentRecord",
      default: null,
    },
    panNumber: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      default: "",
    },
    panDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentRecord",
      default: null,
    },
    incomeCertificateNumber: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    incomeCertificateDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentRecord",
      default: null,
    },
    extractedIncome: {
      type: Number,
      default: null,
      min: 0,
    },
    ocrText: {
      type: String,
      default: "",
    },
    ocrEngine: {
      type: String,
      default: "",
    },
    incomeCertificateFileName: {
      type: String,
      default: "",
    },
    incomeCertificateMimeType: {
      type: String,
      default: "",
    },
    incomeCertificatePath: {
      type: String,
      default: "",
    },
    incomeCertificateSize: {
      type: Number,
      default: 0,
    },
    incomeCertificateHash: {
      type: String,
      default: "",
    },
    hash: {
      type: String,
      required: true,
    },
    hashVersion: {
      type: Number,
      default: 3,
    },
    verifiedIncome: {
      type: Number,
      default: null,
      min: 0,
    },
    mismatchDetected: {
      type: Boolean,
      default: false,
    },
    suspicious: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requiredDocumentIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DocumentRecord",
        },
      ],
      default: [],
    },
    verificationResult: {
      type: verificationResultSchema,
      default: null,
    },
    documentStatus: {
      type: documentStatusSchema,
      default: () => ({ verified: false, reason: "" }),
    },
    decision: {
      type: decisionSchema,
      default: () => ({ status: "pending" }),
    },
  },
  { timestamps: true, collection: "citizen_applications" }
);

module.exports = mongoose.model("ApplicationRecord", applicationRecordSchema);
