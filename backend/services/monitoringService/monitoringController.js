const ActivityLog = require("../../models/ActivityLog");

const getLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(200);
    const blockedAccounts = logs
      .filter((log) => log.status === "blocked")
      .map((log) => ({ user: log.user, timestamp: log.timestamp, details: log.details }));
    const tamperingAlerts = logs.filter((log) => log.action === "tampering_detected");
    const threatSummary = {
      high: logs.filter((log) => log.threatLevel === "HIGH").length,
      medium: logs.filter((log) => log.threatLevel === "MEDIUM").length,
      low: logs.filter((log) => log.threatLevel === "LOW").length,
      suspiciousIps: [...new Set(logs.filter((log) => log.threatLevel !== "LOW").map((log) => log.ipAddress))],
    };

    return res.status(200).json({ logs, blockedAccounts, tamperingAlerts, threatSummary });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLogs,
};
