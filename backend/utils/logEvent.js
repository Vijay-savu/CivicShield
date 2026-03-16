const ActivityLog = require("../models/ActivityLog");

// Centralizing log writes keeps monitoring consistent across controllers and middleware.
const logEvent = async ({ action, user, userId = null, status, details = "", ipAddress = "unknown" }) => {
  await ActivityLog.create({
    action,
    user,
    userId,
    status,
    details,
    ipAddress,
  });
};

module.exports = {
  logEvent,
};
