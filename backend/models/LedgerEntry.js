const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    payloadHash: {
      type: String,
      required: true,
      trim: true,
    },
    previousHash: {
      type: String,
      default: "GENESIS",
      trim: true,
    },
    ledgerHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "tamper_evident_ledger",
  }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
