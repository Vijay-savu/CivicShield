const mongoose = require("mongoose");

// Each government record stores a hash so the app can prove its integrity later.
const citizenRecordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    certificateId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CitizenRecord", citizenRecordSchema);
