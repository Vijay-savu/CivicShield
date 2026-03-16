const ActivityLog = require("../models/ActivityLog");

const getLogs = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(100);

    return res.status(200).json({ logs });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLogs,
};
