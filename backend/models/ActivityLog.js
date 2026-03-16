const mongoose = require("mongoose");

// Activity logs create the monitoring trail used in the dashboard.
const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    default: "",
    trim: true,
  },
  ipAddress: {
    type: String,
    default: "unknown",
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
