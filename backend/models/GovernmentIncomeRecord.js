const mongoose = require("mongoose");

const governmentIncomeRecordSchema = new mongoose.Schema(
  {
    aadhaar: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    annualIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    lastVerified: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "government_income_records",
  }
);

module.exports = mongoose.model("GovernmentIncomeRecord", governmentIncomeRecordSchema);
