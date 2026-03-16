const mongoose = require("mongoose");

const citizenRecordSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CitizenRecord", citizenRecordSchema);
