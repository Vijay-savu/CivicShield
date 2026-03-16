const Notification = require("../models/Notification");

const notifyUser = async ({
  userId = null,
  userEmail,
  type,
  title,
  message,
  severity = "info",
  relatedRecordId = null,
}) => {
  if (!userEmail) {
    return null;
  }

  return Notification.create({
    userId,
    userEmail,
    type,
    title,
    message,
    severity,
    relatedRecordId,
  });
};

module.exports = {
  notifyUser,
};
