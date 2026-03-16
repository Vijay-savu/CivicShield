import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import ActivityLogPanel from "../components/ActivityLogPanel";
import StatCard from "../components/StatCard";
import { getLogs } from "../services/logService";

function MonitoringPage() {
  const [logs, setLogs] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [tamperingAlerts, setTamperingAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMonitoring = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getLogs();
        setLogs(data.logs || []);
        setBlockedAccounts(data.blockedAccounts || []);
        setTamperingAlerts(data.tamperingAlerts || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load monitoring data.");
      } finally {
        setLoading(false);
      }
    };

    loadMonitoring();
  }, []);

  return (
    <AppShell title="Security Monitoring Dashboard" subtitle="Restricted incident response view for security administrators only.">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Login Attempts" value={logs.filter((log) => log.action === "login_attempt").length} />
          <StatCard label="Blocked Accounts" value={blockedAccounts.length} accent="text-rose-700" />
          <StatCard label="Tampering Alerts" value={tamperingAlerts.length} accent="text-rose-700" />
        </section>

        {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}

        <section className="page-section">
          <h2 className="text-xl font-bold text-slate-900">Blocked Accounts</h2>
          <div className="mt-4 space-y-3">
            {blockedAccounts.length === 0 ? (
              <div className="text-sm text-slate-600">No blocked accounts recorded.</div>
            ) : (
              blockedAccounts.map((entry, index) => (
                <div
                  key={`${entry.user}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {entry.user} | {new Date(entry.timestamp).toLocaleString()}
                </div>
              ))
            )}
          </div>
        </section>

        <ActivityLogPanel logs={logs} loading={loading} />
      </div>
    </AppShell>
  );
}

export default MonitoringPage;
