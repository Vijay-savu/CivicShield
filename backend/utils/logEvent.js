const ActivityLog = require("../models/ActivityLog");
const { classifyThreat } = require("./threatAnalyzer");

// Centralizing log writes keeps monitoring consistent across controllers and middleware.
const logEvent = async ({ action, user, userId = null, status, details = "", ipAddress = "unknown" }) => {
  const threat = classifyThreat({ action, status, details, ipAddress });

  await ActivityLog.create({
    action,
    user,
    userId,
    status,
    details,
    ipAddress,
    threatLevel: threat.threatLevel,
    threatScore: threat.threatScore,
    anomalyType: threat.anomalyType,
  });
};

module.exports = {
  logEvent,
};
