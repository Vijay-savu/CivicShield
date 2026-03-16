import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import RecordTable from "../components/RecordTable";
import StatCard from "../components/StatCard";
import TamperAlert from "../components/TamperAlert";
import { getOfficerVerificationQueue } from "../services/recordService";

function OfficerVerificationPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOfficerVerificationQueue();
      setRecords(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const tamperedRecords = useMemo(
    () => records.filter((record) => record.integrityStatus === "TAMPERING DETECTED"),
    [records]
  );

  const suspiciousRecords = useMemo(() => records.filter((record) => record.suspicious), [records]);

  const filteredRecords = useMemo(() => {
    switch (filter) {
      case "needs_review":
        return records.filter((record) => record.eligibilityStatus === "Pending");
      case "above_threshold":
        return suspiciousRecords;
      case "tampered":
        return tamperedRecords;
      case "eligible":
        return records.filter((record) => record.eligibilityStatus === "Eligible");
      case "not_eligible":
        return records.filter((record) => record.eligibilityStatus === "Not Eligible");
      default:
        return records;
    }
  }, [filter, suspiciousRecords, records, tamperedRecords]);

  const filterButtons = [
    { key: "all", label: "All" },
    { key: "needs_review", label: "Needs Review" },
    { key: "above_threshold", label: "Suspicious" },
    { key: "tampered", label: "Tampered" },
    { key: "eligible", label: "Eligible" },
    { key: "not_eligible", label: "Not Eligible" },
  ];

  return (
    <AppShell title="Officer Verification Panel" subtitle="Officers can review only verification outcomes, not raw citizen documents.">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Applications" value={records.length} />
          <StatCard label="Pending Reviews" value={records.filter((record) => record.eligibilityStatus === "Pending").length} />
          <StatCard label="Suspicious" value={suspiciousRecords.length} accent="text-amber-700" />
          <StatCard label="Tamper Alerts" value={tamperedRecords.length} accent="text-rose-700" />
        </section>

        {feedback ? <div className="status-success px-5 py-4 text-sm">{feedback}</div> : null}
        {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}

        <section className="page-section">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Quick Filters</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  filter === item.key
                    ? "inline-flex items-center justify-center rounded-2xl bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white"
                    : "secondary-button"
                }
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <TamperAlert alerts={tamperedRecords} />
        <RecordTable records={filteredRecords} loading={loading} currentRole="officer" />
      </div>
    </AppShell>
  );
}

export default OfficerVerificationPage;
