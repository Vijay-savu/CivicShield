const express = require("express");
const { authenticateToken } = require("../../middleware/authMiddleware");
const { getNotifications, markNotificationRead } = require("./notificationController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Notification Service",
    status: "active",
    capability: "citizen alerts, notification listing, and read status updates",
  });
});

router.use(authenticateToken);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
