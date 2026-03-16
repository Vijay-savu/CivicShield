const Notification = require("../../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { $or: [{ userId: req.user.id }, { userEmail: req.user.email }] };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({ notifications });
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, $or: [{ userId: req.user.id }, { userEmail: req.user.email }] };

    const notification = await Notification.findOneAndUpdate(query, { read: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
};
