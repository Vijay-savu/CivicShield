import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data.notifications;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.notification;
};
