import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { getNotifications, markNotificationRead } from "../services/notificationService";

const severityStyles = {
  info: "border-sky-100 bg-sky-50 text-sky-900",
  warning: "border-amber-100 bg-amber-50 text-amber-900",
  alert: "border-rose-100 bg-rose-50 text-rose-900",
};

function SecurityAlertsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load security alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update alert.");
    }
  };

  return (
    <AppShell title="Security Alerts" subtitle="Citizen alerts only.">
      {error ? <div className="status-danger mb-6 px-5 py-4 text-sm">{error}</div> : null}
      <section className="page-section">
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
          If you did not initiate the activity shown here, contact the cybercrime helpdesk immediately and do not upload new documents until the issue is reviewed.
        </div>
        {loading ? (
          <div className="text-sm text-slate-600">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="text-sm text-slate-600">No security alerts recorded for your account.</div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-2xl border p-5 ${severityStyles[notification.severity] || severityStyles.info}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-80">
                      {notification.type.replace(/_/g, " ")}
                    </p>
                    <h2 className="mt-2 text-xl font-bold">{notification.title}</h2>
                    <p className="mt-2 text-sm opacity-90">{notification.message}</p>
                    <p className="mt-3 text-xs opacity-70">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read ? (
                    <button className="secondary-button" type="button" onClick={() => handleMarkRead(notification._id)}>
                      Mark as Read
                    </button>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      Read
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default SecurityAlertsPage;
