const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    eligibilityHint: {
      type: String,
      default: "",
      trim: true,
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    ruleType: {
      type: String,
      enum: ["income", "age"],
      default: "income",
    },
    incomeThreshold: {
      type: Number,
      default: null,
      min: 0,
    },
    minimumAge: {
      type: Number,
      default: null,
      min: 0,
    },
    inclusive: {
      type: Boolean,
      default: true,
    },
    approvalReason: {
      type: String,
      default: "",
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: "government_schemes" }
);

module.exports = mongoose.model("Scheme", schemeSchema);
